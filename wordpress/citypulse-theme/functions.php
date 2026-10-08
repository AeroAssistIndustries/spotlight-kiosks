<?php
/**
 * CityPulse Kiosks theme functions.
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

define( 'CITYPULSE_VERSION', '1.0.0' );

require get_theme_file_path( 'inc/settings.php' );
require get_theme_file_path( 'inc/setup.php' );
require get_theme_file_path( 'inc/forms.php' );
require get_theme_file_path( 'inc/documents.php' );

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'html5', array( 'script', 'style', 'search-form', 'gallery', 'caption' ) );
	add_theme_support( 'responsive-embeds' );
} );

/** Styles and scripts. Every script checks for its own elements, so loading them on every page is safe. */
add_action( 'wp_enqueue_scripts', function () {
	$v   = CITYPULSE_VERSION;
	$uri = get_theme_file_uri( 'assets/' );
	wp_enqueue_style( 'citypulse-fonts', 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap', array(), null );
	wp_enqueue_style( 'citypulse', $uri . 'styles.css', array( 'citypulse-fonts' ), $v );

	wp_enqueue_script( 'citypulse-qr', $uri . 'vendor/qrcode-generator.js', array(), $v, true );
	wp_enqueue_script( 'citypulse-kiosk', $uri . 'kiosk.js', array( 'citypulse-qr' ), $v, true );
	wp_enqueue_script( 'citypulse-concierge', $uri . 'concierge.js', array(), $v, true );
	wp_enqueue_script( 'citypulse-integrations', $uri . 'integrations.js', array(), $v, true );
	wp_add_inline_script( 'citypulse-integrations', 'window.CITYPULSE_CONFIG = ' . wp_json_encode( citypulse_public_config() ) . ';', 'before' );
	wp_enqueue_script( 'citypulse-checkout', $uri . 'checkout.js', array( 'citypulse-integrations' ), $v, true );
	wp_enqueue_script( 'citypulse-site', $uri . 'site.js', array( 'citypulse-integrations' ), $v, true );
} );

/** Icons, meta description and social tags. */
add_action( 'wp_head', function () {
	$uri  = get_theme_file_uri( 'assets/' );
	// Let an SEO plugin own the description and social tags if one is active.
	$seo_plugin = defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' ) || defined( 'SEOPRESS_VERSION' );
	$desc = is_singular() ? get_post_meta( get_the_ID(), '_citypulse_desc', true ) : '';
	if ( ! $desc ) {
		$desc = get_bloginfo( 'description' );
	}
	if ( ! $seo_plugin ) {
		echo '<meta name="description" content="' . esc_attr( $desc ) . "\">\n";
		echo '<meta property="og:title" content="' . esc_attr( wp_get_document_title() ) . "\">\n";
		echo '<meta property="og:description" content="' . esc_attr( $desc ) . "\">\n";
		echo '<meta property="og:image" content="' . esc_url( $uri . 'og-card.png' ) . "\">\n";
		echo "<meta name=\"twitter:card\" content=\"summary_large_image\">\n";
	}
	echo "<meta name=\"theme-color\" content=\"#0F1C2B\">\n";
	if ( ! has_site_icon() ) {
		echo '<link rel="icon" href="' . esc_url( $uri . 'favicon.svg' ) . "\" type=\"image/svg+xml\">\n";
		echo '<link rel="icon" href="' . esc_url( $uri . 'favicon.png' ) . "\" type=\"image/png\" sizes=\"64x64\">\n";
		echo '<link rel="apple-touch-icon" href="' . esc_url( $uri . 'apple-touch-icon.png' ) . "\">\n";
	}
}, 1 );

/** Page content stores links as {{CP_HOME}} and assets as {{CP_ASSETS}}; resolve them on output. */
function citypulse_resolve_tokens( $html ) {
	return strtr( $html, array(
		'{{CP_HOME}}'   => esc_url( home_url( '/' ) ),
		'{{CP_ASSETS}}' => esc_url( get_theme_file_uri( 'assets/' ) ),
	) );
}
add_filter( 'the_content', 'citypulse_resolve_tokens', 99 );

/** The site's copy uses straight quotes inside HTML attributes and scripts; keep WordPress from curling them. */
add_filter( 'run_wptexturize', function ( $run ) {
	return is_page() ? false : $run;
} );

/** Path of the current request relative to the site root, e.g. "advertise/" or "venues/hotels/". */
function citypulse_current_path() {
	static $path = null;
	if ( null === $path ) {
		$req  = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/', PHP_URL_PATH ); // phpcs:ignore
		$base = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
		$path = ltrim( substr( (string) $req, strlen( (string) $base ) ), '/' );
		if ( $path && '/' !== substr( $path, -1 ) ) {
			$path .= '/';
		}
	}
	return $path;
}
function citypulse_current_attr( $href ) {
	if ( citypulse_current_path() === $href ) {
		echo ' aria-current="page"';
	}
}
function citypulse_current_class( $key, $hrefs ) {
	$p = citypulse_current_path();
	if ( $p && ( 0 === strpos( $p, $key ) || in_array( $p, $hrefs, true ) ) ) {
		echo ' current';
	}
}
