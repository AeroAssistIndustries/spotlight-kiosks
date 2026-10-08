<?php
/**
 * Kiosk screen content: pictures and videos chosen from the WordPress media library for each kiosk.
 * The kiosk player fetches its list with the device token (see [citypulse_kiosk_player]).
 * Files are stored by WordPress in the normal uploads folder. Only Live or Installing kiosks receive content.
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

define( 'CP_MEDIA_MAX', 40 );

add_action( 'add_meta_boxes_cp_kiosk', function () {
	add_meta_box( 'cp_kiosk_media', 'Screen content (pictures and videos)', 'citypulse_media_box', 'cp_kiosk', 'normal', 'default' );
} );

add_action( 'admin_enqueue_scripts', function () {
	$screen = get_current_screen();
	if ( $screen && 'cp_kiosk' === $screen->post_type ) {
		wp_enqueue_media();
	}
} );

function citypulse_media_box( $post ) {
	wp_nonce_field( 'cp_media_save', 'cp_media_nonce' );
	$ids = array_map( 'intval', (array) get_post_meta( $post->ID, '_cp_media', true ) );
	echo '<p>These pictures and videos play on this kiosk, in this order. Videos must be within your server\'s upload limit.</p>';
	echo '<ul id="cp-media-list" style="margin:0 0 .75rem">';
	foreach ( $ids as $id ) {
		$file = get_attached_file( $id );
		if ( ! $file ) {
			continue;
		}
		echo '<li><input type="hidden" name="cp_media[]" value="' . (int) $id . '">' . esc_html( basename( $file ) ) . ' <a href="#" class="cp-media-remove">Remove</a></li>';
	}
	echo '</ul>';
	echo '<p><button type="button" class="button" id="cp-media-add">Add pictures or videos</button></p>';
	?>
	<script>
	jQuery(function ($) {
		var frame;
		$('#cp-media-add').on('click', function (e) {
			e.preventDefault();
			if (!frame) {
				frame = wp.media({ title: 'Choose pictures and videos for this kiosk', multiple: true, library: { type: ['image', 'video'] }, button: { text: 'Add to kiosk' } });
			}
			frame.off('select').on('select', function () {
				frame.state().get('selection').each(function (a) {
					var j = a.toJSON();
					var li = $('<li></li>');
					li.append($('<input type="hidden" name="cp_media[]">').val(j.id));
					li.append(document.createTextNode(j.filename + ' '));
					li.append($('<a href="#" class="cp-media-remove">Remove</a>'));
					$('#cp-media-list').append(li);
				});
			});
			frame.open();
		});
		$(document).on('click', '.cp-media-remove', function (e) { e.preventDefault(); $(this).closest('li').remove(); });
	});
	</script>
	<?php
}

add_action( 'save_post_cp_kiosk', function ( $id ) {
	if ( ! isset( $_POST['cp_media_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['cp_media_nonce'] ) ), 'cp_media_save' ) ) { // phpcs:ignore
		return;
	}
	if ( ! current_user_can( CP_KIOSK_CAP ) || wp_is_post_autosave( $id ) || wp_is_post_revision( $id ) ) {
		return;
	}
	$ids = array();
	foreach ( (array) wp_unslash( $_POST['cp_media'] ?? array() ) as $v ) { // phpcs:ignore
		$i    = (int) $v;
		$mime = $i ? get_post_mime_type( $i ) : '';
		if ( $mime && ( 0 === strpos( $mime, 'image/' ) || 0 === strpos( $mime, 'video/' ) ) ) {
			$ids[] = $i;
		}
	}
	update_post_meta( $id, '_cp_media', array_slice( $ids, 0, CP_MEDIA_MAX ) );
}, 30, 1 );

/** Device fetches its content list. Same device token as the heartbeat. */
add_action( 'wp_ajax_citypulse_media', 'citypulse_media_endpoint' );
add_action( 'wp_ajax_nopriv_citypulse_media', 'citypulse_media_endpoint' );

function citypulse_media_endpoint() {
	$slug  = sanitize_title( wp_unslash( $_POST['kiosk'] ?? '' ) ); // phpcs:ignore
	$token = (string) wp_unslash( $_POST['token'] ?? '' ); // phpcs:ignore
	$post  = $slug ? get_page_by_path( $slug, OBJECT, 'cp_kiosk' ) : null;
	if ( ! $post || ! citypulse_device_ok( $post->ID, $token ) ) {
		wp_send_json_error( 'Unknown kiosk or token.', 403 );
		return;
	}
	$status = (string) get_post_meta( $post->ID, '_cp_status', true );
	$items  = array();
	if ( in_array( $status, array( 'live', 'installing' ), true ) ) {
		foreach ( (array) get_post_meta( $post->ID, '_cp_media', true ) as $id ) {
			$url = wp_get_attachment_url( (int) $id );
			if ( ! $url ) {
				continue;
			}
			$mime    = (string) get_post_mime_type( (int) $id );
			$items[] = array( 'type' => 0 === strpos( $mime, 'video/' ) ? 'video' : 'image', 'url' => $url );
		}
	}
	wp_send_json_success( array( 'status' => $status, 'items' => $items ) );
}

/** [citypulse_kiosk_player] — full-screen player page for the kiosk. Put it on a page such as /kiosk-player/. */
add_shortcode( 'citypulse_kiosk_player', function () {
	wp_enqueue_script( 'citypulse-kiosk-show', get_theme_file_uri( 'assets/kiosk-show.js' ), array(), CITYPULSE_VERSION, true );
	return '<section class="section"><div class="show-app" id="show-app" data-ajax="' . esc_url( admin_url( 'admin-ajax.php' ) ) . '"><noscript><p>Turn on JavaScript to run the player.</p></noscript></div></section>';
} );
