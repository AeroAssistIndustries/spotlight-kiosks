<?php
/**
 * Company documents: a private page for administrators only.
 * Visitors must sign in with WordPress; only accounts that can manage options see the
 * documents. PDFs are stored in a folder that web access is denied to, and are streamed
 * only after the capability check.
 * Page slug: company-documents (created automatically, not listed in the menu, noindex).
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

define( 'CP_DOCS_SLUG', 'company-documents' );

function citypulse_private_dir() {
	$up  = wp_upload_dir();
	$dir = trailingslashit( $up['basedir'] ) . 'citypulse-private';
	if ( ! file_exists( $dir ) ) {
		wp_mkdir_p( $dir );
	}
	if ( ! file_exists( $dir . '/.htaccess' ) ) {
		file_put_contents( $dir . '/.htaccess', "Require all denied\nDeny from all\n" ); // phpcs:ignore
		file_put_contents( $dir . '/index.php', '<?php // Silence.' ); // phpcs:ignore
	}
	return $dir;
}

function citypulse_docs_list() {
	$docs = get_option( 'citypulse_company_docs', array() );
	return is_array( $docs ) ? array_values( $docs ) : array();
}

function citypulse_docs_url() {
	$page = get_page_by_path( CP_DOCS_SLUG );
	return $page ? get_permalink( $page ) : home_url( '/' . CP_DOCS_SLUG . '/' );
}

/** Create the private page once. It holds only the shortcode. */
function citypulse_create_docs_page() {
	if ( get_page_by_path( CP_DOCS_SLUG ) ) {
		return;
	}
	wp_insert_post( array(
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_title'   => 'Company documents',
		'post_name'    => CP_DOCS_SLUG,
		'post_content' => '[citypulse_documents]',
	) );
}
add_action( 'init', function () {
	if ( ! get_option( 'citypulse_docs_page_ready' ) ) {
		citypulse_create_docs_page();
		update_option( 'citypulse_docs_page_ready', 1 );
	}
} );
add_action( 'after_switch_theme', 'citypulse_create_docs_page' );

add_action( 'wp_head', function () {
	if ( is_page( CP_DOCS_SLUG ) ) {
		echo '<meta name="robots" content="noindex,nofollow">' . "\n"; // phpcs:ignore
	}
} );

/** Stream a stored PDF to an administrator. */
add_action( 'template_redirect', function () {
	if ( ! isset( $_GET['cp_doc'] ) || ! is_page( CP_DOCS_SLUG ) ) { // phpcs:ignore
		return;
	}
	if ( ! is_user_logged_in() ) {
		auth_redirect();
	}
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Your account does not have access to company documents.', 403 );
	}
	$docs = citypulse_docs_list();
	$i    = absint( $_GET['cp_doc'] ); // phpcs:ignore
	$doc  = $docs[ $i ] ?? null;
	if ( ! $doc || ! file_exists( $doc['path'] ) ) {
		wp_die( 'Document not found.', 404 );
	}
	nocache_headers();
	header( 'Content-Type: application/pdf' );
	header( 'Content-Disposition: inline; filename="' . basename( $doc['path'] ) . '"' );
	header( 'Content-Length: ' . filesize( $doc['path'] ) );
	readfile( $doc['path'] ); // phpcs:ignore
	exit;
} );

add_shortcode( 'citypulse_documents', 'citypulse_documents_shortcode' );
function citypulse_documents_shortcode() {
	$here = get_permalink();
	if ( ! is_user_logged_in() ) {
		return '<div class="cp-docs"><h2>Admin sign-in</h2><p>Company documents are for CityPulse administrators. Sign in to continue.</p><p><a class="btn" href="' . esc_url( wp_login_url( $here ) ) . '">Sign in</a></p></div>';
	}
	if ( ! current_user_can( 'manage_options' ) ) {
		return '<div class="cp-docs"><h2>Company documents</h2><p>Your account does not have access. Ask an administrator.</p></div>';
	}
	$docs  = citypulse_docs_list();
	$saved = isset( $_GET['cp_saved'] ) ? '<p class="cp-docs-note">Saved.</p>' : ''; // phpcs:ignore
	$out   = '<div class="cp-docs"><style>.cp-docs{max-width:820px}.cp-docs table{width:100%;border-collapse:collapse;margin:12px 0}.cp-docs th,.cp-docs td{border-bottom:1px solid #D5DCE2;padding:10px 8px;text-align:left}.cp-docs-note{color:#0E6B63;font-weight:600}.cp-docs form{display:grid;gap:10px;margin-top:18px;padding:18px;border:1px solid #D5DCE2;border-radius:10px}.cp-docs input[type=text]{padding:10px;border:1px solid #B9C3CC;border-radius:6px}.cp-docs .small{font-size:13px;color:#536170}</style>';
	$out  .= '<h2>Company documents</h2><p class="small">Visible to administrators only. Signed in as ' . esc_html( wp_get_current_user()->user_login ) . '. <a href="' . esc_url( wp_logout_url( $here ) ) . '">Sign out</a></p>' . $saved;
	if ( ! $docs ) {
		$out .= '<p>No documents yet. Upload a PDF below.</p>';
	} else {
		$out .= '<table><thead><tr><th>Document</th><th>Uploaded</th><th></th></tr></thead><tbody>';
		foreach ( $docs as $i => $d ) {
			$view = add_query_arg( 'cp_doc', $i, $here );
			$del  = wp_nonce_url( admin_url( 'admin-post.php?action=citypulse_doc_delete&i=' . $i ), 'cp_doc_delete' );
			$out .= '<tr><td><a href="' . esc_url( $view ) . '" target="_blank" rel="noopener">' . esc_html( $d['name'] ) . '</a></td><td>' . esc_html( $d['date'] ) . '</td><td><a href="' . esc_url( $del ) . '" onclick="return confirm(\'Remove this document from the site?\')">Remove</a></td></tr>';
		}
		$out .= '</tbody></table>';
	}
	$out .= '<form method="post" enctype="multipart/form-data" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">'
		. wp_nonce_field( 'cp_doc_upload', '_wpnonce', true, false )
		. '<input type="hidden" name="action" value="citypulse_doc_upload">'
		. '<input type="hidden" name="return" value="' . esc_attr( $here ) . '">'
		. '<label>Document name<br><input type="text" name="doc_name" required maxlength="120" style="width:100%"></label>'
		. '<label>PDF file (max 25 MB)<br><input type="file" name="doc_file" accept="application/pdf" required></label>'
		. '<p><button class="btn" type="submit">Upload PDF</button></p></form></div>';
	return $out;
}

add_action( 'admin_post_citypulse_doc_upload', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}
	check_admin_referer( 'cp_doc_upload' );
	$return = esc_url_raw( wp_unslash( $_POST['return'] ?? citypulse_docs_url() ) ); // phpcs:ignore
	$f      = $_FILES['doc_file'] ?? null; // phpcs:ignore
	if ( ! $f || empty( $f['tmp_name'] ) || UPLOAD_ERR_OK !== $f['error'] ) {
		wp_safe_redirect( add_query_arg( 'cp_error', 'upload', $return ) );
		exit;
	}
	$check = wp_check_filetype_and_ext( $f['tmp_name'], $f['name'], array( 'pdf' => 'application/pdf' ) );
	if ( 'application/pdf' !== ( $check['type'] ?? '' ) || $f['size'] > 25 * MB_IN_BYTES ) {
		wp_safe_redirect( add_query_arg( 'cp_error', 'type', $return ) );
		exit;
	}
	$dir  = citypulse_private_dir();
	$name = wp_unique_filename( $dir, sanitize_file_name( $f['name'] ) );
	$dest = $dir . '/' . $name;
	if ( ! move_uploaded_file( $f['tmp_name'], $dest ) ) {
		wp_safe_redirect( add_query_arg( 'cp_error', 'upload', $return ) );
		exit;
	}
	$docs   = citypulse_docs_list();
	$docs[] = array(
		'name' => sanitize_text_field( wp_unslash( $_POST['doc_name'] ?? $name ) ), // phpcs:ignore
		'path' => $dest,
		'date' => wp_date( 'M j, Y' ),
	);
	update_option( 'citypulse_company_docs', $docs, false );
	wp_safe_redirect( add_query_arg( 'cp_saved', 1, $return ) );
	exit;
} );

add_action( 'admin_post_citypulse_doc_delete', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}
	check_admin_referer( 'cp_doc_delete' );
	$docs = citypulse_docs_list();
	$i    = absint( $_GET['i'] ?? -1 ); // phpcs:ignore
	if ( isset( $docs[ $i ] ) ) {
		$path = $docs[ $i ]['path'];
		if ( file_exists( $path ) ) {
			unlink( $path ); // phpcs:ignore
		}
		unset( $docs[ $i ] );
		update_option( 'citypulse_company_docs', array_values( $docs ), false );
	}
	wp_safe_redirect( citypulse_docs_url() );
	exit;
} );
