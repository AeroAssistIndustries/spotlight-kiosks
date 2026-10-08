<?php
/**
 * Concierge visits: counts phone-page visits from kiosk QR codes, per venue, day and device.
 * Stores counts only: no IP addresses, names, phone numbers or cookies.
 * Reports are under Orders & inquiries → Concierge visits.
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

add_action( 'wp_ajax_citypulse_visit', 'citypulse_record_visit' );
add_action( 'wp_ajax_nopriv_citypulse_visit', 'citypulse_record_visit' );

function citypulse_venue_names() {
	return array(
		'hotel'   => 'Hotel lobby (The Arden Hotel)',
		'medical' => 'Medical office (Camelback Family Health)',
		'auto'    => 'Dealership lounge (Valley Motors)',
	);
}

function citypulse_record_visit() {
	$venue = sanitize_key( wp_unslash( $_POST['venue'] ?? '' ) ); // phpcs:ignore
	if ( ! array_key_exists( $venue, citypulse_venue_names() ) ) {
		wp_send_json_error( 'Unknown venue.', 400 );
		return;
	}
	$item   = substr( sanitize_key( wp_unslash( $_POST['item'] ?? '' ) ), 0, 40 ); // phpcs:ignore
	$device = 'phone' === ( $_POST['device'] ?? '' ) ? 'phone' : 'desktop'; // phpcs:ignore
	$day    = wp_date( 'Y-m-d' );
	$log    = get_option( 'citypulse_visits', array() );
	if ( ! is_array( $log ) ) {
		$log = array();
	}
	$log[ $day ][ $venue ][ $device ] = ( $log[ $day ][ $venue ][ $device ] ?? 0 ) + 1;
	if ( '' !== $item ) {
		$key = $venue . ':' . $item;
		$log[ $day ]['items'][ $key ] = ( $log[ $day ]['items'][ $key ] ?? 0 ) + 1;
	}
	$cutoff = wp_date( 'Y-m-d', time() - 365 * DAY_IN_SECONDS );
	foreach ( array_keys( $log ) as $d ) {
		if ( $d < $cutoff ) {
			unset( $log[ $d ] );
		}
	}
	update_option( 'citypulse_visits', $log, false );
	wp_send_json_success();
}

add_action( 'admin_menu', function () {
	add_submenu_page( 'edit.php?post_type=cp_submission', 'Concierge visits', 'Concierge visits', 'manage_options', 'citypulse-visits', 'citypulse_visits_report' );
} );

function citypulse_visits_report() {
	$log   = get_option( 'citypulse_visits', array() );
	$log   = is_array( $log ) ? $log : array();
	$since = wp_date( 'Y-m-d', time() - 30 * DAY_IN_SECONDS );
	echo '<div class="wrap"><h1>Concierge visits</h1>';
	echo '<p>Phone-page visits from kiosk QR codes. Counts only; no personal data is stored. Counts can be approximate if two visits happen at the same moment.</p>';
	echo '<table class="widefat striped"><thead><tr><th>Venue</th><th>Phone, last 30 days</th><th>Desktop, last 30 days</th><th>Phone, all time</th><th>Desktop, all time</th></tr></thead><tbody>';
	foreach ( citypulse_venue_names() as $k => $name ) {
		$p30 = $d30 = $pa = $da = 0;
		foreach ( $log as $day => $row ) {
			$p = (int) ( $row[ $k ]['phone'] ?? 0 );
			$d = (int) ( $row[ $k ]['desktop'] ?? 0 );
			$pa += $p;
			$da += $d;
			if ( $day >= $since ) {
				$p30 += $p;
				$d30 += $d;
			}
		}
		echo '<tr><td>' . esc_html( $name ) . '</td><td>' . (int) $p30 . '</td><td>' . (int) $d30 . '</td><td>' . (int) $pa . '</td><td>' . (int) $da . '</td></tr>';
	}
	echo '</tbody></table>';

	$items = array();
	foreach ( $log as $day => $row ) {
		if ( $day >= $since && ! empty( $row['items'] ) ) {
			foreach ( $row['items'] as $key => $c ) {
				$items[ $key ] = ( $items[ $key ] ?? 0 ) + (int) $c;
			}
		}
	}
	arsort( $items );
	echo '<h2>Most-opened items, last 30 days</h2>';
	if ( ! $items ) {
		echo '<p>No item visits yet.</p>';
	} else {
		echo '<table class="widefat striped"><thead><tr><th>Venue and item</th><th>Visits</th></tr></thead><tbody>';
		$names = citypulse_venue_names();
		foreach ( array_slice( $items, 0, 15, true ) as $key => $c ) {
			list( $v, $i ) = array_pad( explode( ':', $key, 2 ), 2, '' );
			$label = ( $names[ $v ] ?? $v ) . ' · ' . $i;
			echo '<tr><td>' . esc_html( $label ) . '</td><td>' . (int) $c . '</td></tr>';
		}
		echo '</tbody></table>';
	}
	echo '</div>';
}
