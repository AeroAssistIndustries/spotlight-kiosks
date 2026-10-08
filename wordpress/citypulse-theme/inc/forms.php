<?php
/**
 * Receives inquiries and kiosk orders when Delivery is "WordPress":
 * saves each one under Orders & inquiries (with uploaded files) and emails it.
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	register_post_type( 'cp_submission', array(
		'labels'          => array( 'name' => 'Orders & inquiries', 'singular_name' => 'Submission', 'menu_name' => 'Orders & inquiries' ),
		'public'          => false,
		'show_ui'         => true,
		'menu_icon'       => 'dashicons-email-alt',
		'menu_position'   => 25,
		'supports'        => array( 'title', 'editor' ),
		'capability_type' => 'post',
		'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
		'map_meta_cap'    => true,
	) );
} );

add_action( 'wp_ajax_citypulse_submit', 'citypulse_handle_submit' );
add_action( 'wp_ajax_nopriv_citypulse_submit', 'citypulse_handle_submit' );

function citypulse_handle_submit() {
	// Spam guards: hidden honeypot field and a simple per-visitor rate limit.
	if ( ! empty( $_POST['_gotcha'] ) ) { // phpcs:ignore
		wp_send_json_success();
	}
	$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$key = 'cp_rl_' . md5( $ip );
	$n   = (int) get_transient( $key );
	if ( $n >= 10 ) {
		wp_send_json_error( array( 'message' => 'Too many submissions. Please try again in a few minutes.' ), 429 );
	}
	set_transient( $key, $n + 1, 10 * MINUTE_IN_SECONDS );

	$fields = array();
	foreach ( $_POST as $k => $v ) { // phpcs:ignore
		if ( 'action' === $k || '_' === $k[0] || 0 === strpos( $k, 'agree' ) || 'ack' === $k || is_array( $v ) || '' === trim( (string) $v ) ) {
			continue;
		}
		$fields[ sanitize_text_field( str_replace( '_', ' ', $k ) ) ] = sanitize_textarea_field( wp_unslash( $v ) );
	}
	if ( isset( $fields['market'], $fields['market choice'] ) ) {
		unset( $fields['market choice'] );
	}
	if ( ! $fields ) {
		wp_send_json_error( array( 'message' => 'Empty submission.' ), 400 );
	}
	$subject = isset( $_POST['_subject'] ) ? sanitize_text_field( wp_unslash( $_POST['_subject'] ) ) : 'Website submission'; // phpcs:ignore
	$reply   = isset( $_POST['_replyto'] ) ? sanitize_email( wp_unslash( $_POST['_replyto'] ) ) : ''; // phpcs:ignore
	if ( ! $reply && isset( $fields['email'] ) ) {
		$reply = sanitize_email( $fields['email'] );
	}

	// Uploaded files go to a private folder (not the media library) and are attached to the email.
	$files = citypulse_store_uploads();
	if ( is_wp_error( $files ) ) {
		wp_send_json_error( array( 'message' => $files->get_error_message() ), 400 );
	}

	$rows = '';
	foreach ( $fields as $k => $v ) {
		$rows .= '<tr><th style="text-align:left;padding:6px 12px;background:#f4f6f7">' . esc_html( ucfirst( $k ) ) . '</th><td style="padding:6px 12px">' . nl2br( esc_html( $v ) ) . '</td></tr>';
	}
	foreach ( $files as $f ) {
		$rows .= '<tr><th style="text-align:left;padding:6px 12px;background:#f4f6f7">File</th><td style="padding:6px 12px">' . esc_html( $f['name'] ) . '</td></tr>';
	}
	$html = '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' . $rows . '</table>';

	$post_id = wp_insert_post( array(
		'post_type'    => 'cp_submission',
		'post_status'  => 'private',
		'post_title'   => $subject,
		'post_content' => $html,
	) );
	if ( $post_id && ! is_wp_error( $post_id ) ) {
		update_post_meta( $post_id, '_cp_fields', $fields );
		update_post_meta( $post_id, '_cp_files', $files );
	}

	$headers = array( 'Content-Type: text/html; charset=UTF-8' );
	if ( $reply ) {
		$headers[] = 'Reply-To: ' . $reply;
	}
	$mailed = wp_mail( citypulse_opt( 'forms_to' ), $subject, $html . '<p style="font-family:Arial;font-size:12px;color:#666">Also saved in WordPress → Orders &amp; inquiries.</p>', $headers, wp_list_pluck( $files, 'path' ) );

	wp_send_json_success( array( 'saved' => (bool) $post_id, 'mailed' => (bool) $mailed ) );
}

function citypulse_store_uploads() {
	if ( empty( $_FILES ) ) {
		return array();
	}
	$max   = (int) citypulse_opt( 'max_upload_mb' ) * MB_IN_BYTES;
	$types = array( 'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'webp' => 'image/webp', 'pdf' => 'application/pdf', 'svg' => 'image/svg+xml' );
	$up    = wp_upload_dir();
	$dir   = trailingslashit( $up['basedir'] ) . 'citypulse-submissions/' . gmdate( 'Y/m' );
	wp_mkdir_p( $dir );
	$root = trailingslashit( $up['basedir'] ) . 'citypulse-submissions';
	if ( ! file_exists( $root . '/.htaccess' ) ) {
		file_put_contents( $root . '/.htaccess', "Require all denied\nDeny from all\n" ); // phpcs:ignore
		file_put_contents( $root . '/index.php', '<?php // Silence.' ); // phpcs:ignore
	}
	$out = array();
	foreach ( $_FILES as $f ) { // phpcs:ignore
		if ( empty( $f['tmp_name'] ) || UPLOAD_ERR_OK !== $f['error'] ) {
			continue;
		}
		if ( $f['size'] > $max ) {
			return new WP_Error( 'too_big', sprintf( '%s is larger than %d MB.', sanitize_file_name( $f['name'] ), $max / MB_IN_BYTES ) );
		}
		$check = wp_check_filetype_and_ext( $f['tmp_name'], $f['name'], $types );
		$ext   = strtolower( pathinfo( $f['name'], PATHINFO_EXTENSION ) );
		if ( ! $check['ext'] && 'svg' !== $ext ) {
			return new WP_Error( 'bad_type', 'Please upload a PNG, JPG, WebP, SVG or PDF file.' );
		}
		$name = wp_unique_filename( $dir, sanitize_file_name( $f['name'] ) );
		$dest = $dir . '/' . $name;
		if ( move_uploaded_file( $f['tmp_name'], $dest ) ) {
			$out[] = array( 'name' => $name, 'path' => $dest );
		}
	}
	return $out;
}

/** Show the uploaded files on the submission screen. */
add_action( 'add_meta_boxes_cp_submission', function () {
	add_meta_box( 'cp_files', 'Uploaded files', function ( $post ) {
		$files = get_post_meta( $post->ID, '_cp_files', true );
		if ( ! $files ) {
			echo '<p>None.</p>';
			return;
		}
		foreach ( $files as $i => $f ) {
			$url = wp_nonce_url( admin_url( 'admin-post.php?action=citypulse_file&post=' . $post->ID . '&i=' . $i ), 'cp_file' );
			echo '<p><a href="' . esc_url( $url ) . '">' . esc_html( $f['name'] ) . '</a></p>';
		}
	}, 'cp_submission', 'side' );
} );
add_action( 'admin_post_citypulse_file', function () {
	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_die( 'Not allowed.' );
	}
	check_admin_referer( 'cp_file' );
	$files = get_post_meta( absint( $_GET['post'] ?? 0 ), '_cp_files', true ); // phpcs:ignore
	$f     = $files[ absint( $_GET['i'] ?? 0 ) ] ?? null; // phpcs:ignore
	if ( ! $f || ! file_exists( $f['path'] ) ) {
		wp_die( 'File not found.' );
	}
	nocache_headers();
	header( 'Content-Type: application/octet-stream' );
	header( 'Content-Disposition: attachment; filename="' . basename( $f['path'] ) . '"' );
	readfile( $f['path'] ); // phpcs:ignore
	exit;
} );
