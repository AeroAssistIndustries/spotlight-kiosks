<?php
/**
 * Team operations area: opened with an access code, not a user account.
 * The code is stored only as a password hash. A successful code sets a signed cookie that
 * lasts 12 hours and stops working if the code is changed. Failed attempts are limited to 10
 * per 15 minutes per visitor. Team files are kept in the private folder and are streamed only
 * after the code (or an administrator login) is checked.
 * Page slug: operations (created automatically, not listed in the menu, noindex).
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

define( 'CP_OPS_SLUG', 'operations' );
define( 'CP_TEAM_COOKIE', 'cp_team' );

function citypulse_ops_url() {
	$page = get_page_by_path( CP_OPS_SLUG );
	return $page ? get_permalink( $page ) : home_url( '/' . CP_OPS_SLUG . '/' );
}

function citypulse_team_files() {
	$f = get_option( 'citypulse_team_files', array() );
	return is_array( $f ) ? array_values( $f ) : array();
}

function citypulse_team_token( $expires ) {
	$key = wp_salt( 'auth' ) . get_option( 'citypulse_team_hash', '' );
	return hash_hmac( 'sha256', 'team|' . $expires, $key ) . '.' . $expires;
}

function citypulse_team_verified() {
	if ( ! get_option( 'citypulse_team_hash' ) ) {
		return false;
	}
	$c = isset( $_COOKIE[ CP_TEAM_COOKIE ] ) ? (string) wp_unslash( $_COOKIE[ CP_TEAM_COOKIE ] ) : ''; // phpcs:ignore
	if ( '' === $c || false === strpos( $c, '.' ) ) {
		return false;
	}
	$exp = (int) substr( $c, strrpos( $c, '.' ) + 1 );
	if ( $exp < time() ) {
		return false;
	}
	return hash_equals( citypulse_team_token( $exp ), $c );
}

function citypulse_can_see_team() {
	return citypulse_team_verified() || current_user_can( 'manage_options' );
}

/** Create the operations page once. It holds only the shortcode. */
function citypulse_create_ops_page() {
	if ( get_page_by_path( CP_OPS_SLUG ) ) {
		return;
	}
	wp_insert_post( array(
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_title'   => 'Operations',
		'post_name'    => CP_OPS_SLUG,
		'post_content' => '[citypulse_operations]',
	) );
}
add_action( 'init', function () {
	if ( ! get_option( 'citypulse_ops_page_ready' ) ) {
		citypulse_create_ops_page();
		update_option( 'citypulse_ops_page_ready', 1 );
	}
} );
add_action( 'after_switch_theme', 'citypulse_create_ops_page' );

add_action( 'wp_head', function () {
	if ( is_page( CP_OPS_SLUG ) ) {
		echo '<meta name="robots" content="noindex,nofollow">' . "\n"; // phpcs:ignore
	}
} );

/** Access code check. Rate limited per visitor. */
function citypulse_team_login() {
	check_admin_referer( 'cp_team_login' );
	$back = citypulse_ops_url();
	$key  = 'cp_team_fail_' . md5( (string) ( $_SERVER['REMOTE_ADDR'] ?? '' ) ); // phpcs:ignore
	$fails = (int) get_transient( $key );
	if ( $fails >= 10 ) {
		wp_safe_redirect( add_query_arg( 'cp_team', 'locked', $back ) );
		exit;
	}
	$code = trim( (string) wp_unslash( $_POST['code'] ?? '' ) ); // phpcs:ignore
	$hash = get_option( 'citypulse_team_hash', '' );
	if ( $hash && '' !== $code && password_verify( $code, $hash ) ) {
		$exp = time() + 12 * HOUR_IN_SECONDS;
		setcookie( CP_TEAM_COOKIE, citypulse_team_token( $exp ), array(
			'expires'  => $exp,
			'path'     => '/',
			'secure'   => is_ssl(),
			'httponly' => true,
			'samesite' => 'Lax',
		) );
		delete_transient( $key );
		wp_safe_redirect( $back );
		exit;
	}
	set_transient( $key, $fails + 1, 15 * MINUTE_IN_SECONDS );
	wp_safe_redirect( add_query_arg( 'cp_team', 'bad', $back ) );
	exit;
}
add_action( 'admin_post_nopriv_citypulse_team_login', 'citypulse_team_login' );
add_action( 'admin_post_citypulse_team_login', 'citypulse_team_login' );

add_action( 'admin_post_citypulse_team_logout', function () {
	check_admin_referer( 'cp_team_logout' );
	setcookie( CP_TEAM_COOKIE, '', array( 'expires' => time() - HOUR_IN_SECONDS, 'path' => '/', 'secure' => is_ssl(), 'httponly' => true, 'samesite' => 'Lax' ) );
	wp_safe_redirect( citypulse_ops_url() );
	exit;
} );

/** Administrators: set or clear the access code. */
add_action( 'admin_post_citypulse_team_setcode', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}
	check_admin_referer( 'cp_team_setcode' );
	$code = trim( (string) wp_unslash( $_POST['new_code'] ?? '' ) ); // phpcs:ignore
	if ( '' === $code ) {
		delete_option( 'citypulse_team_hash' );
		$msg = 'cleared';
	} elseif ( strlen( $code ) < 8 ) {
		wp_safe_redirect( add_query_arg( 'cp_team', 'short', citypulse_ops_url() ) );
		exit;
	} else {
		update_option( 'citypulse_team_hash', password_hash( $code, PASSWORD_DEFAULT ), false );
		$msg = 'code';
	}
	wp_safe_redirect( add_query_arg( 'cp_team', $msg, citypulse_ops_url() ) );
	exit;
} );

/** Administrators: upload a team file (PDF, Word or Excel). */
add_action( 'admin_post_citypulse_team_upload', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}
	check_admin_referer( 'cp_team_upload' );
	$back = citypulse_ops_url();
	$f    = $_FILES['team_file'] ?? null; // phpcs:ignore
	if ( ! $f || empty( $f['tmp_name'] ) || UPLOAD_ERR_OK !== $f['error'] || $f['size'] > 25 * MB_IN_BYTES ) {
		wp_safe_redirect( add_query_arg( 'cp_team', 'upload', $back ) );
		exit;
	}
	$types = array(
		'pdf'  => 'application/pdf',
		'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	);
	if ( 'zip' === strtolower( pathinfo( $f['name'], PATHINFO_EXTENSION ) ) ) {
		// A zip of team files: keep only PDF, Word and Excel files, at the top level of the zip.
		$zip = new ZipArchive();
		if ( true !== $zip->open( $f['tmp_name'] ) ) {
			wp_safe_redirect( add_query_arg( 'cp_team', 'upload', $back ) );
			exit;
		}
		$dir   = citypulse_team_dir();
		$files = citypulse_team_files();
		$added = 0;
		for ( $i = 0; $i < min( $zip->numFiles, 60 ); $i++ ) {
			$stat = $zip->statIndex( $i );
			if ( ! $stat || '/' === substr( $stat['name'], -1 ) || $stat['size'] > 25 * MB_IN_BYTES ) {
				continue;
			}
			$base = basename( $stat['name'] );
			$ext  = strtolower( pathinfo( $base, PATHINFO_EXTENSION ) );
			if ( ! isset( $types[ $ext ] ) || '' === $base || '.' === $base[0] ) {
				continue;
			}
			$name = wp_unique_filename( $dir, sanitize_file_name( $base ) );
			$in   = $zip->getStream( $stat['name'] );
			if ( ! $in ) {
				continue;
			}
			$out = fopen( $dir . '/' . $name, 'wb' ); // phpcs:ignore
			stream_copy_to_stream( $in, $out );
			fclose( $out ); // phpcs:ignore
			fclose( $in ); // phpcs:ignore
			$files[] = array( 'name' => pathinfo( $base, PATHINFO_FILENAME ), 'path' => $dir . '/' . $name, 'mime' => $types[ $ext ], 'date' => wp_date( 'M j, Y' ) );
			$added++;
		}
		$zip->close();
		update_option( 'citypulse_team_files', $files, false );
		wp_safe_redirect( add_query_arg( 'cp_team', $added ? 'saved' : 'type', $back ) );
		exit;
	}
	$check = wp_check_filetype_and_ext( $f['tmp_name'], $f['name'], $types );
	if ( empty( $check['ext'] ) || ! isset( $types[ $check['ext'] ] ) ) {
		wp_safe_redirect( add_query_arg( 'cp_team', 'type', $back ) );
		exit;
	}
	$dir  = citypulse_team_dir();
	$name = wp_unique_filename( $dir, sanitize_file_name( $f['name'] ) );
	if ( ! move_uploaded_file( $f['tmp_name'], $dir . '/' . $name ) ) {
		wp_safe_redirect( add_query_arg( 'cp_team', 'upload', $back ) );
		exit;
	}
	$files   = citypulse_team_files();
	$files[] = array(
		'name' => sanitize_text_field( wp_unslash( $_POST['team_name'] ?? $name ) ) ?: $name, // phpcs:ignore
		'path' => $dir . '/' . $name,
		'mime' => $types[ $check['ext'] ],
		'date' => wp_date( 'M j, Y' ),
	);
	update_option( 'citypulse_team_files', $files, false );
	wp_safe_redirect( add_query_arg( 'cp_team', 'saved', $back ) );
	exit;
} );

add_action( 'admin_post_citypulse_team_delete', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}
	check_admin_referer( 'cp_team_delete' );
	$files = citypulse_team_files();
	$i     = absint( $_GET['i'] ?? -1 ); // phpcs:ignore
	if ( isset( $files[ $i ] ) ) {
		if ( file_exists( $files[ $i ]['path'] ) ) {
			unlink( $files[ $i ]['path'] ); // phpcs:ignore
		}
		unset( $files[ $i ] );
		update_option( 'citypulse_team_files', array_values( $files ), false );
	}
	wp_safe_redirect( citypulse_ops_url() );
	exit;
} );

function citypulse_team_dir() {
	citypulse_private_dir();
	$up  = wp_upload_dir();
	$dir = trailingslashit( $up['basedir'] ) . 'citypulse-private/team';
	if ( ! file_exists( $dir ) ) {
		wp_mkdir_p( $dir );
	}
	return $dir;
}

/** Stream a team file to someone with the code or an administrator login. */
add_action( 'template_redirect', function () {
	if ( ! isset( $_GET['cp_team_file'] ) || ! is_page( CP_OPS_SLUG ) ) { // phpcs:ignore
		return;
	}
	if ( ! citypulse_can_see_team() ) {
		wp_safe_redirect( citypulse_ops_url() );
		exit;
	}
	$files = citypulse_team_files();
	$doc   = $files[ absint( $_GET['cp_team_file'] ) ] ?? null; // phpcs:ignore
	if ( ! $doc || ! file_exists( $doc['path'] ) ) {
		wp_die( 'File not found.', 404 );
	}
	nocache_headers();
	header( 'Content-Type: ' . $doc['mime'] );
	header( 'Content-Disposition: attachment; filename="' . basename( $doc['path'] ) . '"' );
	header( 'Content-Length: ' . filesize( $doc['path'] ) );
	readfile( $doc['path'] ); // phpcs:ignore
	exit;
} );

add_shortcode( 'citypulse_operations', 'citypulse_operations_shortcode' );
function citypulse_operations_shortcode() {
	$here  = get_permalink();
	$note  = isset( $_GET['cp_team'] ) ? sanitize_key( wp_unslash( $_GET['cp_team'] ) ) : ''; // phpcs:ignore
	$msgs  = array(
		'bad'     => 'That code is not correct.',
		'locked'  => 'Too many attempts. Wait 15 minutes and try again.',
		'saved'   => 'File added.',
		'code'    => 'Access code saved. Share it only with your team.',
		'cleared' => 'Access code turned off. Nobody can sign in with a code until you set one.',
		'short'   => 'The access code must be at least 8 characters.',
		'upload'  => 'That file could not be uploaded.',
		'type'    => 'Upload a PDF, Word (.docx) or Excel (.xlsx) file.',
	);
	$msg = isset( $msgs[ $note ] ) ? '<p class="cp-ops-note">' . esc_html( $msgs[ $note ] ) . '</p>' : '';
	$style = '<style>.cp-ops{max-width:860px}.cp-ops table{width:100%;border-collapse:collapse;margin:12px 0}.cp-ops th,.cp-ops td{border-bottom:1px solid #D5DCE2;padding:10px 8px;text-align:left}.cp-ops-note{color:#0E6B63;font-weight:600}.cp-ops form{display:grid;gap:10px;margin:18px 0;padding:18px;border:1px solid #D5DCE2;border-radius:10px}.cp-ops input[type=text],.cp-ops input[type=password]{padding:10px;border:1px solid #B9C3CC;border-radius:6px;max-width:420px}.cp-ops .small{font-size:13px;color:#536170}</style>';
	$out   = '<div class="cp-ops">' . $style;

	if ( ! citypulse_can_see_team() ) {
		$out .= '<h2>Team operations</h2><p>Enter your team access code to open the operations files.</p>' . $msg;
		$out .= '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" autocomplete="off">'
			. wp_nonce_field( 'cp_team_login', '_wpnonce', true, false )
			. '<input type="hidden" name="action" value="citypulse_team_login">'
			. '<label>Access code<br><input type="password" name="code" required autocomplete="off"></label>'
			. '<p><button class="btn" type="submit">Open</button></p></form></div>';
		return $out;
	}

	$out .= '<h2>Operations</h2><p class="small">' . ( current_user_can( 'manage_options' ) ? 'Signed in as administrator. ' : '' ) . 'Files for the CityPulse team.';
	if ( citypulse_team_verified() ) {
		$out .= ' <a href="' . esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=citypulse_team_logout' ), 'cp_team_logout' ) ) . '">Sign out</a>';
	}
	$out .= '</p>' . $msg;

	$files = citypulse_team_files();
	if ( ! $files ) {
		$out .= '<p>No files yet.</p>';
	} else {
		$out .= '<table><thead><tr><th>File</th><th>Added</th></tr></thead><tbody>';
		foreach ( $files as $i => $f ) {
			$url  = add_query_arg( 'cp_team_file', $i, $here );
			$out .= '<tr><td><a href="' . esc_url( $url ) . '">' . esc_html( $f['name'] ) . '</a></td><td>' . esc_html( $f['date'] ) . '</td>';
			if ( current_user_can( 'manage_options' ) ) {
				$del  = wp_nonce_url( admin_url( 'admin-post.php?action=citypulse_team_delete&i=' . $i ), 'cp_team_delete' );
				$out .= '<td><a href="' . esc_url( $del ) . '" onclick="return confirm(\'Remove this file?\')">Remove</a></td>';
			}
			$out .= '</tr>';
		}
		$out .= '</tbody></table>';
	}

	if ( current_user_can( 'manage_options' ) ) {
		$out .= '<form method="post" enctype="multipart/form-data" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">'
			. wp_nonce_field( 'cp_team_upload', '_wpnonce', true, false )
			. '<input type="hidden" name="action" value="citypulse_team_upload">'
			. '<label>File name shown to the team<br><input type="text" name="team_name" maxlength="120"></label>'
			. '<label>File (PDF, .docx or .xlsx, or a .zip of them, max 25 MB)<br><input type="file" name="team_file" accept=".pdf,.docx,.xlsx,.zip" required></label>'
			. '<p><button class="btn" type="submit">Add file</button></p></form>';
		$out .= '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">'
			. wp_nonce_field( 'cp_team_setcode', '_wpnonce', true, false )
			. '<input type="hidden" name="action" value="citypulse_team_setcode">'
			. '<label>Team access code (8 or more characters; leave blank to turn off)<br><input type="text" name="new_code" minlength="8" autocomplete="off"></label>'
			. '<p><button class="btn" type="submit">Save access code</button></p></form>';
	}
	return $out . '</div>';
}
