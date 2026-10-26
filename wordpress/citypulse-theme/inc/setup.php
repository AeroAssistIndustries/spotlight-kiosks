<?php
/**
 * Creates the site's pages from content/pages.json when the theme is activated.
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

function citypulse_install_pages( $overwrite = false ) {
	$file  = get_theme_file_path( 'content/pages.json' );
	$pages = json_decode( file_get_contents( $file ), true ); // phpcs:ignore
	$res   = array( 'created' => 0, 'updated' => 0 );
	if ( ! is_array( $pages ) ) {
		return $res;
	}
	// The content contains forms, SVG and data attributes; keep WordPress from stripping them on insert.
	kses_remove_filters();
	foreach ( $pages as $p ) {
		$parent_id = 0;
		if ( $p['parent'] ) {
			$parent = get_page_by_path( $p['parent'] );
			$parent_id = $parent ? $parent->ID : 0;
		}
		$existing = get_page_by_path( $p['path'] );
		$data = array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => $p['title'],
			'post_name'    => $p['slug'],
			'post_parent'  => $parent_id,
			'post_content' => wp_slash( $p['content'] ),
		);
		if ( $existing ) {
			if ( ! $overwrite ) {
				continue;
			}
			$data['ID'] = $existing->ID;
			$id         = wp_update_post( $data );
			$res['updated']++;
		} else {
			$id = wp_insert_post( $data );
			$res['created']++;
		}
		if ( $id && ! is_wp_error( $id ) ) {
			update_post_meta( $id, '_citypulse_desc', $p['description'] );
			if ( 'privacy' === $p['path'] ) {
				update_option( 'wp_page_for_privacy_policy', $id );
			}
			if ( ! empty( $p['front'] ) ) {
				update_option( 'show_on_front', 'page' );
				update_option( 'page_on_front', $id );
			}
		}
	}
	kses_init_filters();
	return $res;
}

/** Once: switch the advertiser term on the live pages from three years to one year (Oct 2026), keeping every other edit. */
add_action( 'init', function () {
	if ( (int) get_option( 'citypulse_term_v' ) >= 1 ) {
		return;
	}
	$swap = array(
		'Your order has an initial term of three years.' => 'Your order has an initial term of one year.',
		'The term renews automatically for further three-year periods unless you cancel.' => 'The term renews automatically for further one-year periods unless you cancel.',
		'You may cancel after the first year of the three-year term by emailing' => 'You may cancel at any time by emailing',
		'including billing, the three-year term and cancellation' => 'including billing, the one-year term and cancellation',
	);
	foreach ( array( "'", '’', '&#039;', '&#x27;', '&rsquo;' ) as $q ) {
		$swap[ 'Cancelling stops future payments and takes effect at the end of the period you' . $q . 've already paid for. You can' . $q . 't cancel during the first year.' ] = 'Cancelling stops the next renewal and takes effect at the end of the current one-year term; monthly plans keep billing until then.';
	}
	$pages = get_posts( array( 'post_type' => 'page', 'post_status' => array( 'publish', 'draft', 'private' ), 'numberposts' => -1 ) );
	kses_remove_filters();
	foreach ( $pages as $pg ) {
		$new = strtr( $pg->post_content, $swap );
		if ( $new !== $pg->post_content ) {
			wp_update_post( array( 'ID' => $pg->ID, 'post_content' => wp_slash( $new ) ) );
		}
	}
	kses_init_filters();
	update_option( 'citypulse_term_v', 1 );
	if ( function_exists( 'wp_cache_flush' ) ) {
		wp_cache_flush();
	}
}, 20 );

/** Once per brand update: fix the site name if the host set it as one word (e.g. "Citypulsekiosks"). */
add_action( 'init', function () {
	if ( (int) get_option( 'citypulse_brand_v' ) >= 2 ) {
		return;
	}
	$name = (string) get_option( 'blogname' );
	if ( $name !== 'CityPulse Kiosks' && preg_replace( '/[^a-z]/', '', strtolower( $name ) ) === 'citypulsekiosks' ) {
		update_option( 'blogname', 'CityPulse Kiosks' );
	}
	update_option( 'citypulse_brand_v', 2 );
} );

add_action( 'after_switch_theme', function () {
	citypulse_install_pages( false );
	if ( ! get_option( 'permalink_structure' ) ) {
		update_option( 'permalink_structure', '/%postname%/' );
	}
	if ( in_array( get_option( 'blogname' ), array( '', 'WordPress', 'My WordPress Website', 'My Blog' ), true ) ) {
		update_option( 'blogname', 'CityPulse Kiosks' );
	}
	if ( in_array( get_option( 'blogdescription' ), array( '', 'Just another WordPress site' ), true ) ) {
		update_option( 'blogdescription', 'Turn wait time into opportunity.' );
	}
	flush_rewrite_rules();
} );


/** Speed: defer the theme's scripts (WordPress keeps their order) and load web fonts without blocking first paint. */
add_action( 'wp_enqueue_scripts', function () {
	foreach ( array_keys( wp_scripts()->registered ) as $h ) {
		if ( 0 === strpos( $h, 'citypulse-' ) ) {
			wp_script_add_data( $h, 'strategy', 'defer' );
		}
	}
}, 100 );
add_filter( 'style_loader_tag', function ( $html, $handle ) {
	if ( 'citypulse-fonts' !== $handle || is_admin() ) {
		return $html;
	}
	return str_replace( " media='all'", " media='print' onload=\"this.media='all'\"", $html ) . '<noscript>' . $html . '</noscript>';
}, 10, 2 );

// GoDaddy's admin-bar styles (and the editor components they pull in) are only needed when signed in.
add_action( 'wp_print_styles', function () {
	if ( ! is_user_logged_in() ) {
		wp_dequeue_style( 'godaddy-styles' );
		wp_dequeue_style( 'wp-components' );
	}
}, 100 );
