<?php
/**
 * Hosts & kiosks: the back end for each host venue and its kiosk.
 * Administrators record the host, the kiosk's location and status, the guide shown on the
 * kiosk's phone page, and ad placements with start and end dates. Only kiosks marked Live or
 * Installing show a guide to visitors. Host contact details are never shown publicly.
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

define( 'CP_KIOSK_CAP', 'manage_options' );

function citypulse_kiosk_statuses() {
	return array(
		'planned'    => 'Planned',
		'installing' => 'Installing',
		'live'       => 'Live',
		'paused'     => 'Paused',
		'removed'    => 'Removed',
	);
}

function citypulse_kiosk_venue_types() {
	return array(
		'hotel'   => 'Hotel lobby',
		'medical' => 'Medical office',
		'auto'    => 'Dealership lounge',
		'other'   => 'Other',
	);
}

add_action( 'init', function () {
	register_post_type( 'cp_kiosk', array(
		'labels'          => array(
			'name'          => 'Hosts & kiosks',
			'singular_name' => 'Kiosk',
			'add_new_item'  => 'Add kiosk',
			'edit_item'     => 'Edit kiosk',
			'all_items'     => 'All kiosks',
			'menu_name'     => 'Hosts & kiosks',
		),
		'public'          => false,
		'show_ui'         => true,
		'menu_icon'       => 'dashicons-desktop',
		'menu_position'   => 26,
		'supports'        => array( 'title' ),
		'capability_type' => 'post',
		'map_meta_cap'    => true,
		'capabilities'    => array(
			'create_posts'           => CP_KIOSK_CAP,
			'edit_posts'             => CP_KIOSK_CAP,
			'edit_others_posts'      => CP_KIOSK_CAP,
			'edit_private_posts'     => CP_KIOSK_CAP,
			'edit_published_posts'   => CP_KIOSK_CAP,
			'publish_posts'          => CP_KIOSK_CAP,
			'read_private_posts'     => CP_KIOSK_CAP,
			'delete_posts'           => CP_KIOSK_CAP,
			'delete_private_posts'   => CP_KIOSK_CAP,
			'delete_published_posts' => CP_KIOSK_CAP,
			'delete_others_posts'    => CP_KIOSK_CAP,
		),
	) );
} );

function citypulse_kiosk_field( $label, $name, $value, $type = 'text', $opts = array() ) {
	$id = 'cp_' . $name;
	echo '<p><label for="' . esc_attr( $id ) . '"><strong>' . esc_html( $label ) . '</strong></label><br>';
	if ( 'select' === $type ) {
		echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( $id ) . '">';
		foreach ( $opts as $k => $l ) {
			echo '<option value="' . esc_attr( $k ) . '"' . selected( $value, $k, false ) . '>' . esc_html( $l ) . '</option>';
		}
		echo '</select>';
	} elseif ( 'textarea' === $type ) {
		echo '<textarea id="' . esc_attr( $id ) . '" name="' . esc_attr( $id ) . '" rows="3" class="large-text">' . esc_textarea( $value ) . '</textarea>';
	} else {
		echo '<input type="' . esc_attr( $type ) . '" id="' . esc_attr( $id ) . '" name="' . esc_attr( $id ) . '" value="' . esc_attr( $value ) . '" class="regular-text">';
	}
	echo '</p>';
}

add_action( 'add_meta_boxes_cp_kiosk', function () {
	add_meta_box( 'cp_kiosk_details', 'Host and kiosk', 'citypulse_kiosk_metabox', 'cp_kiosk', 'normal', 'high' );
	add_meta_box( 'cp_kiosk_guide', 'Phone guide (shown when a visitor scans the code)', 'citypulse_kiosk_guide_box', 'cp_kiosk', 'normal', 'default' );
	add_meta_box( 'cp_kiosk_ads', 'Ad placements on this kiosk', 'citypulse_kiosk_ads_box', 'cp_kiosk', 'normal', 'default' );
} );

function citypulse_kiosk_metabox( $post ) {
	wp_nonce_field( 'cp_kiosk_save', 'cp_kiosk_nonce' );
	$m = function ( $k ) use ( $post ) {
		return (string) get_post_meta( $post->ID, '_cp_' . $k, true );
	};
	citypulse_kiosk_field( 'Host name', 'host_name', $m( 'host_name' ) );
	citypulse_kiosk_field( 'Host email', 'host_email', $m( 'host_email' ), 'email' );
	citypulse_kiosk_field( 'Host phone', 'host_phone', $m( 'host_phone' ), 'tel' );
	citypulse_kiosk_field( 'Venue address', 'address', $m( 'address' ) );
	citypulse_kiosk_field( 'Venue type', 'venue_type', $m( 'venue_type' ) ?: 'other', 'select', citypulse_kiosk_venue_types() );
	citypulse_kiosk_field( 'Status', 'status', $m( 'status' ) ?: 'planned', 'select', citypulse_kiosk_statuses() );
	citypulse_kiosk_field( 'Install date', 'install_date', $m( 'install_date' ), 'date' );
	citypulse_kiosk_field( 'Package', 'package', $m( 'package' ) );
	citypulse_kiosk_field( 'Internal notes (never shown publicly)', 'notes', $m( 'notes' ), 'textarea' );
	$url = $post->post_name ? home_url( '/concierge/?k=' . $post->post_name ) : '';
	echo '<p><strong>Phone link for this kiosk</strong><br>';
	echo $url ? '<input type="text" readonly class="large-text" value="' . esc_attr( $url ) . '" onclick="this.select()">' : 'Save the kiosk to get its link.';
	echo '</p>';
}

function citypulse_kiosk_guide_box( $post ) {
	$rows = (array) get_post_meta( $post->ID, '_cp_guide', true );
	echo '<p>Up to 8 cards. Leave a row blank to skip it.</p><table class="widefat"><thead><tr><th>Title</th><th>Detail</th><th>Hours or location</th></tr></thead><tbody>';
	for ( $i = 0; $i < 8; $i++ ) {
		$r = $rows[ $i ] ?? array();
		echo '<tr>';
		echo '<td><input type="text" name="guide[' . $i . '][title]" value="' . esc_attr( $r['title'] ?? '' ) . '" class="widefat"></td>';
		echo '<td><input type="text" name="guide[' . $i . '][detail]" value="' . esc_attr( $r['detail'] ?? '' ) . '" class="widefat"></td>';
		echo '<td><input type="text" name="guide[' . $i . '][hours]" value="' . esc_attr( $r['hours'] ?? '' ) . '" class="widefat"></td>';
		echo '</tr>';
	}
	echo '</tbody></table>';
}

function citypulse_kiosk_ads_box( $post ) {
	$rows = (array) get_post_meta( $post->ID, '_cp_ads', true );
	echo '<p>An ad shows on the phone page only while it is active and within its dates.</p><table class="widefat"><thead><tr><th>Advertiser</th><th>Headline</th><th>Start</th><th>End</th><th>Active</th></tr></thead><tbody>';
	for ( $i = 0; $i < 6; $i++ ) {
		$r = $rows[ $i ] ?? array();
		echo '<tr>';
		echo '<td><input type="text" name="ads[' . $i . '][advertiser]" value="' . esc_attr( $r['advertiser'] ?? '' ) . '" class="widefat"></td>';
		echo '<td><input type="text" name="ads[' . $i . '][headline]" value="' . esc_attr( $r['headline'] ?? '' ) . '" class="widefat"></td>';
		echo '<td><input type="date" name="ads[' . $i . '][start]" value="' . esc_attr( $r['start'] ?? '' ) . '"></td>';
		echo '<td><input type="date" name="ads[' . $i . '][end]" value="' . esc_attr( $r['end'] ?? '' ) . '"></td>';
		echo '<td><input type="checkbox" name="ads[' . $i . '][active]" value="1"' . checked( ! empty( $r['active'] ), true, false ) . '></td>';
		echo '</tr>';
	}
	echo '</tbody></table>';
}

add_action( 'save_post_cp_kiosk', function ( $id ) {
	if ( ! isset( $_POST['cp_kiosk_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['cp_kiosk_nonce'] ) ), 'cp_kiosk_save' ) ) { // phpcs:ignore
		return;
	}
	if ( ! current_user_can( CP_KIOSK_CAP ) || wp_is_post_autosave( $id ) || wp_is_post_revision( $id ) ) {
		return;
	}
	$status = sanitize_key( wp_unslash( $_POST['cp_status'] ?? '' ) ); // phpcs:ignore
	$type   = sanitize_key( wp_unslash( $_POST['cp_venue_type'] ?? '' ) ); // phpcs:ignore
	update_post_meta( $id, '_cp_status', array_key_exists( $status, citypulse_kiosk_statuses() ) ? $status : 'planned' );
	update_post_meta( $id, '_cp_venue_type', array_key_exists( $type, citypulse_kiosk_venue_types() ) ? $type : 'other' );
	foreach ( array( 'host_name', 'host_email', 'host_phone', 'address', 'package' ) as $k ) {
		update_post_meta( $id, '_cp_' . $k, sanitize_text_field( wp_unslash( $_POST[ 'cp_' . $k ] ?? '' ) ) ); // phpcs:ignore
	}
	$date = sanitize_text_field( wp_unslash( $_POST['cp_install_date'] ?? '' ) ); // phpcs:ignore
	update_post_meta( $id, '_cp_install_date', preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) ? $date : '' );
	update_post_meta( $id, '_cp_notes', sanitize_textarea_field( wp_unslash( $_POST['cp_notes'] ?? '' ) ) ); // phpcs:ignore

	$guide = array();
	foreach ( (array) wp_unslash( $_POST['guide'] ?? array() ) as $row ) { // phpcs:ignore
		$t = sanitize_text_field( $row['title'] ?? '' );
		if ( '' === $t ) {
			continue;
		}
		$guide[] = array(
			'title'  => $t,
			'detail' => sanitize_text_field( $row['detail'] ?? '' ),
			'hours'  => sanitize_text_field( $row['hours'] ?? '' ),
		);
	}
	update_post_meta( $id, '_cp_guide', array_slice( $guide, 0, 8 ) );

	$ads = array();
	foreach ( (array) wp_unslash( $_POST['ads'] ?? array() ) as $row ) { // phpcs:ignore
		$adv = sanitize_text_field( $row['advertiser'] ?? '' );
		if ( '' === $adv ) {
			continue;
		}
		$start = sanitize_text_field( $row['start'] ?? '' );
		$end   = sanitize_text_field( $row['end'] ?? '' );
		$ads[] = array(
			'advertiser' => $adv,
			'headline'   => sanitize_text_field( $row['headline'] ?? '' ),
			'start'      => preg_match( '/^\d{4}-\d{2}-\d{2}$/', $start ) ? $start : '',
			'end'        => preg_match( '/^\d{4}-\d{2}-\d{2}$/', $end ) ? $end : '',
			'active'     => ! empty( $row['active'] ),
		);
	}
	update_post_meta( $id, '_cp_ads', array_slice( $ads, 0, 6 ) );
}, 10, 1 );

/** Kiosk is shown to visitors only while Live or Installing. */
function citypulse_kiosk_public( $slug ) {
	$post = $slug ? get_page_by_path( $slug, OBJECT, 'cp_kiosk' ) : null;
	if ( ! $post ) {
		return null;
	}
	return in_array( get_post_meta( $post->ID, '_cp_status', true ), array( 'live', 'installing' ), true ) ? $post : null;
}

function citypulse_active_sponsor( $id ) {
	$today = wp_date( 'Y-m-d' );
	foreach ( (array) get_post_meta( $id, '_cp_ads', true ) as $ad ) {
		if ( empty( $ad['active'] ) ) {
			continue;
		}
		if ( ! empty( $ad['start'] ) && $today < $ad['start'] ) {
			continue;
		}
		if ( ! empty( $ad['end'] ) && $today > $ad['end'] ) {
			continue;
		}
		return array( 'advertiser' => $ad['advertiser'], 'headline' => $ad['headline'] );
	}
	return null;
}

add_action( 'wp_ajax_citypulse_guide', 'citypulse_guide_endpoint' );
add_action( 'wp_ajax_nopriv_citypulse_guide', 'citypulse_guide_endpoint' );
function citypulse_guide_endpoint() {
	$post = citypulse_kiosk_public( sanitize_title( wp_unslash( $_GET['k'] ?? '' ) ) ); // phpcs:ignore
	if ( ! $post ) {
		wp_send_json_error( 'Not found.', 404 );
		return;
	}
	$guides = array();
	foreach ( (array) get_post_meta( $post->ID, '_cp_guide', true ) as $g ) {
		$guides[] = array( 'title' => $g['title'], 'detail' => $g['detail'], 'hours' => $g['hours'] );
	}
	wp_send_json_success( array(
		'slug'    => $post->post_name,
		'name'    => $post->post_title,
		'guides'  => $guides,
		'sponsor' => citypulse_active_sponsor( $post->ID ),
	) );
}
