<?php
/**
 * Kiosk fleet: device heartbeat, online status, host logins and offline alerts.
 *
 * - Each kiosk has a device token (shown once when generated; only a keyed hash is stored).
 * - The kiosk device sends a heartbeat every few minutes. The site records when it last checked in
 *   and tells the device whether to run the program or show a standby screen.
 * - A kiosk is "online" when its last heartbeat is within the last 15 minutes.
 * - Hosts get a WordPress login (role "Kiosk host") and see only the kiosks assigned to them.
 * - Administrators get an email when a Live kiosk goes offline (at most one every 6 hours per kiosk).
 * No IP addresses or other personal data are stored.
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

define( 'CP_HOST_ROLE', 'cp_host' );
define( 'CP_ONLINE_WINDOW', 15 * MINUTE_IN_SECONDS );
define( 'CP_ALERT_COOLDOWN', 6 * HOUR_IN_SECONDS );

/** Host role. Created once; it can only log in and read its own dashboard. */
add_action( 'init', function () {
	if ( ! get_role( CP_HOST_ROLE ) ) {
		add_role( CP_HOST_ROLE, 'Kiosk host', array( 'read' => true ) );
	}
} );

/** Hosts are sent away from the admin area; their dashboard is the shortcode page. */
add_action( 'admin_init', function () {
	if ( wp_doing_ajax() ) {
		return;
	}
	$u = wp_get_current_user();
	if ( $u->exists() && in_array( CP_HOST_ROLE, (array) $u->roles, true ) ) {
		wp_safe_redirect( home_url( '/' ) );
		exit;
	}
} );

function citypulse_token_hash( $token ) {
	return hash_hmac( 'sha256', (string) $token, wp_salt( 'auth' ) );
}

function citypulse_device_ok( $id, $token ) {
	$stored = (string) get_post_meta( $id, '_cp_device_hash', true );
	return '' !== $stored && '' !== (string) $token && hash_equals( $stored, citypulse_token_hash( $token ) );
}

function citypulse_kiosk_online( $id ) {
	$t = (int) get_post_meta( $id, '_cp_last_seen', true );
	return $t > 0 && $t >= time() - CP_ONLINE_WINDOW;
}

/** Device check-in. Returns "run" for Live or Installing kiosks and "standby" otherwise. */
add_action( 'wp_ajax_citypulse_heartbeat', 'citypulse_heartbeat' );
add_action( 'wp_ajax_nopriv_citypulse_heartbeat', 'citypulse_heartbeat' );

function citypulse_heartbeat() {
	$slug  = sanitize_title( wp_unslash( $_POST['kiosk'] ?? '' ) ); // phpcs:ignore
	$token = (string) wp_unslash( $_POST['token'] ?? '' ); // phpcs:ignore
	$post  = $slug ? get_page_by_path( $slug, OBJECT, 'cp_kiosk' ) : null;
	if ( ! $post || ! citypulse_device_ok( $post->ID, $token ) ) {
		wp_send_json_error( 'Unknown kiosk or token.', 403 );
		return;
	}
	$status = (string) get_post_meta( $post->ID, '_cp_status', true );
	update_post_meta( $post->ID, '_cp_last_seen', time() );
	update_post_meta( $post->ID, '_cp_app_version', substr( sanitize_text_field( wp_unslash( $_POST['version'] ?? '' ) ), 0, 20 ) ); // phpcs:ignore
	delete_post_meta( $post->ID, '_cp_alerted_at' );
	wp_send_json_success( array(
		'action' => in_array( $status, array( 'live', 'installing' ), true ) ? 'run' : 'standby',
		'status' => $status,
	) );
}

/** Admin: host login and device token. */
add_action( 'add_meta_boxes_cp_kiosk', function () {
	add_meta_box( 'cp_kiosk_device', 'Device and host login', 'citypulse_device_box', 'cp_kiosk', 'side', 'default' );
} );

function citypulse_device_box( $post ) {
	wp_nonce_field( 'cp_kiosk_save', 'cp_kiosk_nonce' );
	$uid   = (int) get_post_meta( $post->ID, '_cp_host_user', true );
	$hosts = get_users( array( 'role' => CP_HOST_ROLE, 'orderby' => 'display_name' ) );
	echo '<p><label for="cp_host_user"><strong>Host login</strong></label><br>';
	echo '<select id="cp_host_user" name="cp_host_user" class="widefat"><option value="0">None</option>';
	foreach ( $hosts as $h ) {
		echo '<option value="' . (int) $h->ID . '"' . selected( $uid, $h->ID, false ) . '>' . esc_html( $h->display_name . ' (' . $h->user_login . ')' ) . '</option>';
	}
	echo '</select></p>';
	if ( ! $hosts ) {
		echo '<p>To give a host access, create a user under Users → Add New with the role "Kiosk host".</p>';
	}
	$new = get_transient( 'cp_newtoken_' . $post->ID );
	if ( $new ) {
		delete_transient( 'cp_newtoken_' . $post->ID );
		echo '<p><strong>New device token. Copy it now; it will not be shown again:</strong><br><input type="text" readonly class="widefat" value="' . esc_attr( $new ) . '" onclick="this.select()"></p>';
	}
	$has = (string) get_post_meta( $post->ID, '_cp_device_hash', true );
	echo '<p>Device token: ' . ( $has ? 'set' : '<strong>not set yet</strong>' ) . '</p>';
	echo '<p><label><input type="checkbox" name="cp_new_token" value="1"> Generate a new token (the old one stops working)</label></p>';
	$seen = (int) get_post_meta( $post->ID, '_cp_last_seen', true );
	echo '<p>Device status: ' . ( $seen ? ( citypulse_kiosk_online( $post->ID ) ? '<strong>Online</strong>' : 'Offline' ) . ', last seen ' . esc_html( wp_date( 'M j, Y g:i a', $seen ) ) : 'Never connected' ) . '</p>';
	echo '<p><small>Heartbeat address for the device: <code>' . esc_html( admin_url( 'admin-ajax.php?action=citypulse_heartbeat' ) ) . '</code> (POST fields: kiosk, token, version)</small></p>';
}

add_action( 'save_post_cp_kiosk', function ( $id ) {
	if ( ! isset( $_POST['cp_kiosk_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['cp_kiosk_nonce'] ) ), 'cp_kiosk_save' ) ) { // phpcs:ignore
		return;
	}
	if ( ! current_user_can( CP_KIOSK_CAP ) || wp_is_post_autosave( $id ) || wp_is_post_revision( $id ) ) {
		return;
	}
	$uid  = (int) ( $_POST['cp_host_user'] ?? 0 ); // phpcs:ignore
	$user = $uid ? get_user_by( 'id', $uid ) : false;
	update_post_meta( $id, '_cp_host_user', ( $user && in_array( CP_HOST_ROLE, (array) $user->roles, true ) ) ? $uid : 0 );

	$new = ! empty( $_POST['cp_new_token'] ); // phpcs:ignore
	if ( $new || '' === (string) get_post_meta( $id, '_cp_device_hash', true ) ) {
		$token = wp_generate_password( 40, false );
		update_post_meta( $id, '_cp_device_hash', citypulse_token_hash( $token ) );
		set_transient( 'cp_newtoken_' . $id, $token, 10 * MINUTE_IN_SECONDS );
	}
}, 20, 1 );

/** Admin list: device status column. */
add_filter( 'manage_cp_kiosk_posts_columns', function ( $cols ) {
	$cols['cp_device'] = 'Device';
	return $cols;
} );
add_action( 'manage_cp_kiosk_posts_custom_column', function ( $col, $id ) {
	if ( 'cp_device' !== $col ) {
		return;
	}
	$seen = (int) get_post_meta( $id, '_cp_last_seen', true );
	if ( ! $seen ) {
		echo 'Never connected';
		return;
	}
	echo citypulse_kiosk_online( $id ) ? '<strong>Online</strong>' : 'Offline';
	echo ' · last seen ' . esc_html( wp_date( 'M j, g:i a', $seen ) );
}, 10, 2 );

/** Host dashboard: [citypulse_host] on a page (for example /host/). */
add_shortcode( 'citypulse_host', 'citypulse_host_shortcode' );

function citypulse_host_shortcode() {
	if ( ! is_user_logged_in() ) {
		return '<div class="cp-host">' . wp_login_form( array( 'echo' => false, 'redirect' => get_permalink() ) ) . '</div>';
	}
	$uid     = get_current_user_id();
	$kiosks  = get_posts( array(
		'post_type'   => 'cp_kiosk',
		'post_status' => 'any',
		'numberposts' => -1,
		'meta_key'    => '_cp_host_user', // phpcs:ignore
		'meta_value'  => $uid, // phpcs:ignore
	) );
	$log   = get_option( 'citypulse_visits', array() );
	$log   = is_array( $log ) ? $log : array();
	$since = wp_date( 'Y-m-d', time() - 30 * DAY_IN_SECONDS );
	$out   = '<div class="cp-host"><h2>Your kiosks</h2>';
	if ( ! $kiosks ) {
		return $out . '<p>No kiosks are assigned to your login yet.</p></div>';
	}
	$out .= '<table class="cp-host-table"><thead><tr><th>Kiosk</th><th>Status</th><th>Device</th><th>Phone visits, 30 days</th></tr></thead><tbody>';
	foreach ( $kiosks as $k ) {
		$visits = 0;
		foreach ( $log as $day => $row ) {
			if ( $day >= $since ) {
				$visits += (int) ( $row['kiosks'][ $k->post_name ]['phone'] ?? 0 ) + (int) ( $row['kiosks'][ $k->post_name ]['desktop'] ?? 0 );
			}
		}
		$seen   = (int) get_post_meta( $k->ID, '_cp_last_seen', true );
		$device = ! $seen ? 'Never connected' : ( citypulse_kiosk_online( $k->ID ) ? 'Online' : 'Offline' ) . ', last seen ' . wp_date( 'M j, g:i a', $seen );
		$status = citypulse_kiosk_statuses()[ get_post_meta( $k->ID, '_cp_status', true ) ] ?? 'Planned';
		$out   .= '<tr><td>' . esc_html( $k->post_title ) . '<br><small>' . esc_html( (string) get_post_meta( $k->ID, '_cp_address', true ) ) . '</small></td>'
			. '<td>' . esc_html( $status ) . '</td><td>' . esc_html( $device ) . '</td><td>' . (int) $visits . '</td></tr>';
	}
	return $out . '</tbody></table></div>';
}

/** Offline alerts: every 10 minutes, email the administrator about Live kiosks that stopped checking in. */
add_filter( 'cron_schedules', function ( $s ) {
	$s['cp_ten_minutes'] = array( 'interval' => 10 * MINUTE_IN_SECONDS, 'display' => 'Every 10 minutes' );
	return $s;
} );
add_action( 'init', function () {
	if ( ! wp_next_scheduled( 'citypulse_fleet_check' ) ) {
		wp_schedule_event( time() + MINUTE_IN_SECONDS, 'cp_ten_minutes', 'citypulse_fleet_check' );
	}
} );
add_action( 'citypulse_fleet_check', 'citypulse_fleet_check' );

function citypulse_fleet_check() {
	$ids = get_posts( array( 'post_type' => 'cp_kiosk', 'post_status' => 'publish', 'numberposts' => -1, 'fields' => 'ids' ) );
	foreach ( $ids as $id ) {
		if ( 'live' !== get_post_meta( $id, '_cp_status', true ) || citypulse_kiosk_online( $id ) ) {
			continue;
		}
		$last = (int) get_post_meta( $id, '_cp_alerted_at', true );
		if ( $last && $last > time() - CP_ALERT_COOLDOWN ) {
			continue;
		}
		update_post_meta( $id, '_cp_alerted_at', time() );
		$seen = (int) get_post_meta( $id, '_cp_last_seen', true );
		wp_mail(
			get_option( 'admin_email' ),
			'Kiosk offline: ' . get_the_title( $id ),
			'The kiosk "' . get_the_title( $id ) . '" is marked Live but has not checked in' . ( $seen ? ' since ' . wp_date( 'M j, Y g:i a', $seen ) : ' yet' ) . '. Check its power and the 4G data card.'
		);
	}
}
