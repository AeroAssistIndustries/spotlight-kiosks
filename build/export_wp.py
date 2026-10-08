"""Export the site as an installable WordPress theme.
Run:  python3 build/export_wp.py
Output: dist/citypulse-theme/ and dist/citypulse-theme.zip

Page content is stored in WordPress as Custom HTML blocks so it can be edited in the
page editor. Links and asset paths are written as {{CP_HOME}} and {{CP_ASSETS}} tokens and
resolved when the page is shown, so the site keeps working if the domain changes."""
import os, re, json, shutil, sys, zipfile
sys.path.insert(0, os.path.dirname(__file__))
import build  # builds the static site and fills PAGE_DATA
from lib import PAGE_DATA, NAV, icon, footer, e, EMAIL, PHONE, TEL, ADDR1, ADDR2, SITE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
THEME = os.path.join(DIST, "citypulse-theme")
VERSION = "1.0.0"

def tok(html):
    return html.replace("{R}assets/", "{{CP_ASSETS}}").replace("{R}", "{{CP_HOME}}")

PHP_HOME = "<?php echo esc_url( home_url( '/' ) ); ?>"
PHP_ASSETS = "<?php echo esc_url( get_theme_file_uri( 'assets/' ) ); ?>"
def php(html):
    return html.replace("{R}assets/", PHP_ASSETS).replace("{R}", PHP_HOME)

# ------------------------------------------------------------------ pages -> JSON
def blocks(body):
    body = body.strip()
    parts = re.split(r"\n(?=<section|<nav class=\"jump\")", body)
    return "\n\n".join(f"<!-- wp:html -->\n{p.strip()}\n<!-- /wp:html -->" for p in parts if p.strip())

pages, page404 = [], None
for d in PAGE_DATA:
    if d["path"] == "404/":
        page404 = d; continue
    path = d["path"].strip("/")
    segs = path.split("/") if path else ["home"]
    nav_title = d["title"] if path else "Home"
    pages.append({
        "path": "/".join(segs), "slug": segs[-1], "parent": "/".join(segs[:-1]),
        "title": nav_title, "description": d["desc"], "content": blocks(tok(d["body"])),
        "active": d["active"] or d["path"], "front": not path,
    })
pages.sort(key=lambda p: p["path"].count("/"))

# ------------------------------------------------------------------ header / footer
def wp_header():
    out = []
    for item in NAV:
        if item[0] == "link":
            _, label, href = item
            out.append(f'<a href="{{R}}{href}"<?php citypulse_current_attr( \'{href}\' ); ?>>{label}</a>')
        else:
            _, label, key, links = item
            hrefs = ",".join(f"'{l[1]}'" for l in links)
            lis = "".join(f'<a href="{{R}}{l[1]}"{" class=\"mega-lead\"" if len(l) > 3 else ""}><b>{l[0]}</b><span>{l[2]}</span></a>' for l in links)
            out.append(f'<div class="nav-item<?php citypulse_current_class( \'{key}\', array( {hrefs} ) ); ?>"><button class="nav-btn" aria-expanded="false" aria-controls="menu-{key}">{label}{icon("chev","")}</button><div class="mega" id="menu-{key}">{lis}</div></div>')
    nav = "\n      ".join(out)
    return php(f'''<?php
/**
 * Site header. Navigation mirrors the static site; edit the links here.
 * @package CityPulse
 */
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="{{R}}" aria-label="{SITE} home"><img src="{{R}}assets/logo.svg" alt="{SITE}" width="380" height="116"></a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav"><span class="sr">Menu</span><i></i><i></i></button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      {nav}
      <a class="btn btn-small header-cta" href="{{R}}#get-started">Get started — $399</a>
    </nav>
  </div>
</header>
''')

def wp_footer():
    f = footer().replace('<span id="year">2026</span>', "<?php echo esc_html( gmdate( 'Y' ) ); ?>")
    return "<?php\n/**\n * Site footer.\n * @package CityPulse\n */\n?>\n" + php(f) + "\n<?php wp_footer(); ?>\n</body>\n</html>\n"

# ------------------------------------------------------------------ PHP files
STYLE = f"""/*
Theme Name: CityPulse Kiosks
Theme URI: https://citypulsekiosks.com
Author: CityPulse Kiosks
Description: Website theme for CityPulse Kiosks — venue touch-screen kiosks with local advertising. Includes the interactive kiosk demo, self-serve checkout, inquiry forms, US markets map and all site pages. Activate it and the pages are created for you.
Version: {VERSION}
Requires at least: 6.0
Tested up to: 6.8
Requires PHP: 7.4
License: Proprietary
Text Domain: citypulse
*/
/* The real styles live in assets/styles.css (enqueued in functions.php). */
"""

FUNCTIONS = r"""<?php
/**
 * CityPulse Kiosks theme functions.
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

define( 'CITYPULSE_VERSION', '__VERSION__' );

require get_theme_file_path( 'inc/settings.php' );
require get_theme_file_path( 'inc/setup.php' );
require get_theme_file_path( 'inc/forms.php' );
require get_theme_file_path( 'inc/documents.php' );
require get_theme_file_path( 'inc/visits.php' );
require get_theme_file_path( 'inc/kiosks.php' );
require get_theme_file_path( 'inc/access.php' );

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
	wp_enqueue_script( 'citypulse-concierge', $uri . 'concierge.js', array( 'citypulse-integrations' ), $v, true );
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
"""

PAGE_PHP = """<?php
/**
 * Default page template. Page content is edited in the block editor (Custom HTML blocks).
 * @package CityPulse
 */
get_header(); ?>
<main id="main">
<?php
while ( have_posts() ) :
	the_post();
	the_content();
endwhile;
?>
</main>
<?php get_footer();
"""

INDEX_PHP = """<?php
/**
 * Fallback template (posts, archives, search).
 * @package CityPulse
 */
get_header(); ?>
<main id="main">
<section class="page-hero"><div class="wrap narrow">
	<h1><?php echo is_search() ? esc_html__( 'Search results', 'citypulse' ) : esc_html( wp_strip_all_tags( get_the_archive_title() ?: get_bloginfo( 'name' ) ) ); ?></h1>
</div></section>
<section class="section"><div class="wrap narrow prose">
<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
	<article <?php post_class(); ?>>
		<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
		<?php the_excerpt(); ?>
	</article>
<?php endwhile; the_posts_pagination(); else : ?>
	<p><?php esc_html_e( 'Nothing here yet.', 'citypulse' ); ?></p>
<?php endif; ?>
</div></section>
</main>
<?php get_footer();
"""

SINGLE_PHP = """<?php
/**
 * Single post (for a future blog).
 * @package CityPulse
 */
get_header(); ?>
<main id="main">
<?php while ( have_posts() ) : the_post(); ?>
<section class="page-hero"><div class="wrap narrow"><h1><?php the_title(); ?></h1><p class="updated"><?php echo esc_html( get_the_date() ); ?></p></div></section>
<section class="section"><div class="wrap narrow prose"><?php the_content(); ?></div></section>
<?php endwhile; ?>
</main>
<?php get_footer();
"""

SETTINGS_PHP = r"""<?php
/**
 * Settings → CityPulse: form delivery, payment links and page tools.
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

function citypulse_defaults() {
	return array(
		'forms_provider'    => 'wordpress',
		'forms_to'          => '__FORMS_TO__',
		'formspree'         => '',
		'stripe_yearly'     => '',
		'stripe_monthly'    => '',
		'payments_provider' => 'stripe',
		'max_upload_mb'     => 5,
	);
}
function citypulse_opt( $key ) {
	$o = wp_parse_args( get_option( 'citypulse_settings', array() ), citypulse_defaults() );
	return $o[ $key ];
}

/** What the browser needs (no secrets). */
function citypulse_public_config() {
	$provider = citypulse_opt( 'forms_provider' );
	return array(
		'forms'       => array(
			'provider' => $provider,
			'to'       => 'formsubmit' === $provider ? citypulse_opt( 'forms_to' ) : '',
			'endpoint' => 'formspree' === $provider ? citypulse_opt( 'formspree' ) : '',
			'ajaxUrl'  => admin_url( 'admin-ajax.php' ),
		),
		'payments'    => array(
			'provider' => citypulse_opt( 'payments_provider' ),
			'yearly'   => citypulse_opt( 'stripe_yearly' ),
			'monthly'  => citypulse_opt( 'stripe_monthly' ),
		),
		'maxUploadMB' => (int) citypulse_opt( 'max_upload_mb' ),
	);
}

add_action( 'admin_menu', function () {
	add_options_page( 'CityPulse settings', 'CityPulse', 'manage_options', 'citypulse', 'citypulse_settings_page' );
} );

add_action( 'admin_init', function () {
	register_setting( 'citypulse', 'citypulse_settings', array(
		'type'              => 'array',
		'sanitize_callback' => function ( $in ) {
			$d   = citypulse_defaults();
			$out = array();
			$out['forms_provider']    = in_array( $in['forms_provider'] ?? '', array( 'wordpress', 'formsubmit', 'formspree', 'none' ), true ) ? $in['forms_provider'] : $d['forms_provider'];
			$out['forms_to']          = sanitize_email( $in['forms_to'] ?? '' ) ?: $d['forms_to'];
			$out['formspree']         = esc_url_raw( $in['formspree'] ?? '' );
			$out['payments_provider'] = sanitize_key( $in['payments_provider'] ?? 'stripe' ) ?: 'stripe';
			$out['stripe_yearly']     = esc_url_raw( $in['stripe_yearly'] ?? '' );
			$out['stripe_monthly']    = esc_url_raw( $in['stripe_monthly'] ?? '' );
			$out['max_upload_mb']     = max( 1, min( 25, (int) ( $in['max_upload_mb'] ?? 5 ) ) );
			return $out;
		},
	) );
} );

function citypulse_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$o = wp_parse_args( get_option( 'citypulse_settings', array() ), citypulse_defaults() );
	$n = 'citypulse_settings';
	?>
	<div class="wrap">
		<h1>CityPulse settings</h1>
		<?php if ( isset( $_GET['citypulse_pages'] ) ) : // phpcs:ignore ?>
			<div class="notice notice-success"><p><?php echo esc_html( sprintf( 'Pages checked: %d created, %d updated.', (int) $_GET['created'], (int) $_GET['updated'] ) ); // phpcs:ignore ?></p></div>
		<?php endif; ?>
		<form method="post" action="options.php">
			<?php settings_fields( 'citypulse' ); ?>
			<h2>Forms and orders</h2>
			<table class="form-table" role="presentation">
				<tr><th scope="row">Delivery</th><td>
					<select name="<?php echo esc_attr( $n ); ?>[forms_provider]">
						<?php foreach ( array( 'wordpress' => 'WordPress (saved under Orders & inquiries and emailed)', 'formsubmit' => 'FormSubmit (email only, no WordPress copy)', 'formspree' => 'Formspree', 'none' => 'Off — visitors email you themselves' ) as $k => $label ) : ?>
							<option value="<?php echo esc_attr( $k ); ?>" <?php selected( $o['forms_provider'], $k ); ?>><?php echo esc_html( $label ); ?></option>
						<?php endforeach; ?>
					</select>
					<p class="description">“WordPress” stores every inquiry and order (with uploaded artwork) in the admin and emails it. Make sure the site can send email — an SMTP plugin is recommended.</p>
				</td></tr>
				<tr><th scope="row"><label for="cp-to">Send to</label></th><td><input id="cp-to" type="email" class="regular-text" name="<?php echo esc_attr( $n ); ?>[forms_to]" value="<?php echo esc_attr( $o['forms_to'] ); ?>"></td></tr>
				<tr><th scope="row"><label for="cp-fs">Formspree endpoint</label></th><td><input id="cp-fs" type="url" class="regular-text" placeholder="https://formspree.io/f/xxxx" name="<?php echo esc_attr( $n ); ?>[formspree]" value="<?php echo esc_attr( $o['formspree'] ); ?>"><p class="description">Only used when Delivery is Formspree.</p></td></tr>
				<tr><th scope="row"><label for="cp-mb">Max upload size (MB)</label></th><td><input id="cp-mb" type="number" min="1" max="25" name="<?php echo esc_attr( $n ); ?>[max_upload_mb]" value="<?php echo esc_attr( $o['max_upload_mb'] ); ?>"></td></tr>
			</table>
			<h2>Payments</h2>
			<p>Paste hosted payment links. Checkout sends the customer there with their email filled in and the order number as the reference. Leave empty to take orders and invoice later.</p>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="cp-py">1 location, yearly ($399)</label></th><td><input id="cp-py" type="url" class="regular-text" placeholder="https://buy.stripe.com/..." name="<?php echo esc_attr( $n ); ?>[stripe_yearly]" value="<?php echo esc_attr( $o['stripe_yearly'] ); ?>"></td></tr>
				<tr><th scope="row"><label for="cp-pm">1 location, monthly ($60)</label></th><td><input id="cp-pm" type="url" class="regular-text" placeholder="https://buy.stripe.com/..." name="<?php echo esc_attr( $n ); ?>[stripe_monthly]" value="<?php echo esc_attr( $o['stripe_monthly'] ); ?>"></td></tr>
				<tr><th scope="row"><label for="cp-pp">Processor</label></th><td><select id="cp-pp" name="<?php echo esc_attr( $n ); ?>[payments_provider]"><?php foreach ( array( 'stripe' => 'Stripe Payment Links', 'other' => 'Other (Square, PayPal…)' ) as $k => $label ) : ?><option value="<?php echo esc_attr( $k ); ?>" <?php selected( $o['payments_provider'], $k ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select></td></tr>
			</table>
			<?php submit_button(); ?>
		</form>
		<hr>
		<h2>Site pages</h2>
		<p>The theme creates all site pages on activation. Use this to recreate any page that was deleted. Existing pages are left alone unless you tick the box.</p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="citypulse_pages">
			<?php wp_nonce_field( 'citypulse_pages' ); ?>
			<label><input type="checkbox" name="overwrite" value="1"> Also reset existing pages to the theme's original content (overwrites edits)</label>
			<?php submit_button( 'Create missing pages', 'secondary' ); ?>
		</form>
	</div>
	<?php
}

add_action( 'admin_post_citypulse_pages', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}
	check_admin_referer( 'citypulse_pages' );
	$r = citypulse_install_pages( ! empty( $_POST['overwrite'] ) );
	wp_safe_redirect( add_query_arg( array( 'page' => 'citypulse', 'citypulse_pages' => 1, 'created' => $r['created'], 'updated' => $r['updated'] ), admin_url( 'options-general.php' ) ) );
	exit;
} );
"""

SETUP_PHP = r"""<?php
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
"""

FORMS_PHP = r"""<?php
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
"""

DOCS_PHP = r"""<?php
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
"""


VISITS_PHP = r"""<?php
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
	$kiosk = sanitize_title( wp_unslash( $_POST['kiosk'] ?? '' ) ); // phpcs:ignore
	$kpost = $kiosk ? citypulse_kiosk_public( $kiosk ) : null;
	$venue = '';
	if ( ! $kpost ) {
		$venue = sanitize_key( wp_unslash( $_POST['venue'] ?? '' ) ); // phpcs:ignore
		if ( ! array_key_exists( $venue, citypulse_venue_names() ) ) {
			wp_send_json_error( 'Unknown venue.', 400 );
			return;
		}
	}
	$item   = substr( sanitize_key( wp_unslash( $_POST['item'] ?? '' ) ), 0, 40 ); // phpcs:ignore
	$device = 'phone' === ( $_POST['device'] ?? '' ) ? 'phone' : 'desktop'; // phpcs:ignore
	$day    = wp_date( 'Y-m-d' );
	$log    = get_option( 'citypulse_visits', array() );
	if ( ! is_array( $log ) ) {
		$log = array();
	}
	if ( $kpost ) {
		$log[ $day ]['kiosks'][ $kpost->post_name ][ $device ] = ( $log[ $day ]['kiosks'][ $kpost->post_name ][ $device ] ?? 0 ) + 1;
	} else {
		$log[ $day ][ $venue ][ $device ] = ( $log[ $day ][ $venue ][ $device ] ?? 0 ) + 1;
		if ( '' !== $item ) {
			$key = $venue . ':' . $item;
			$log[ $day ]['items'][ $key ] = ( $log[ $day ]['items'][ $key ] ?? 0 ) + 1;
		}
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

	$kiosk_totals = array();
	foreach ( $log as $day => $row ) {
		foreach ( (array) ( $row['kiosks'] ?? array() ) as $slug => $dev ) {
			if ( $day >= $since ) {
				$kiosk_totals[ $slug ]['phone']   = ( $kiosk_totals[ $slug ]['phone'] ?? 0 ) + (int) ( $dev['phone'] ?? 0 );
				$kiosk_totals[ $slug ]['desktop'] = ( $kiosk_totals[ $slug ]['desktop'] ?? 0 ) + (int) ( $dev['desktop'] ?? 0 );
			}
		}
	}
	echo '<h2>Kiosks, last 30 days</h2>';
	if ( ! $kiosk_totals ) {
		echo '<p>No kiosk phone visits yet.</p>';
	} else {
		echo '<table class="widefat striped"><thead><tr><th>Kiosk</th><th>Phone</th><th>Desktop</th></tr></thead><tbody>';
		foreach ( $kiosk_totals as $slug => $t ) {
			$kp = get_page_by_path( $slug, OBJECT, 'cp_kiosk' );
			$label = $kp ? $kp->post_title : $slug;
			echo '<tr><td>' . esc_html( $label ) . '</td><td>' . (int) $t['phone'] . '</td><td>' . (int) $t['desktop'] . '</td></tr>';
		}
		echo '</tbody></table>';
	}

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
"""


KIOSKS_PHP = r"""<?php
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
"""


ACCESS_PHP = r"""<?php
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
"""


def page404_php():
    body = tok(page404["body"]).replace("{{CP_HOME}}", PHP_HOME).replace("{{CP_ASSETS}}", PHP_ASSETS)
    return "<?php\n/**\n * Page not found.\n * @package CityPulse\n */\nget_header(); ?>\n<main id=\"main\">\n" + body + "\n</main>\n<?php get_footer();\n"

# ------------------------------------------------------------------ write theme
def main():
    if os.path.exists(THEME):
        shutil.rmtree(THEME)
    os.makedirs(os.path.join(THEME, "inc")); os.makedirs(os.path.join(THEME, "content"))
    w = lambda rel, txt: open(os.path.join(THEME, rel), "w").write(txt)
    w("style.css", STYLE)
    w("functions.php", FUNCTIONS.replace("__VERSION__", VERSION))
    w("header.php", wp_header())
    w("footer.php", wp_footer())
    w("page.php", PAGE_PHP); w("front-page.php", PAGE_PHP); w("index.php", INDEX_PHP); w("single.php", SINGLE_PHP)
    w("404.php", page404_php())
    cfg = open(os.path.join(ROOT, "assets/config.js")).read()
    to = re.search(r'to:\s*"([^"]+)"', cfg).group(1)
    w("inc/settings.php", SETTINGS_PHP.replace("__FORMS_TO__", to))
    w("inc/setup.php", SETUP_PHP)
    w("inc/forms.php", FORMS_PHP)
    w("inc/documents.php", DOCS_PHP)
    w("inc/visits.php", VISITS_PHP)
    w("inc/kiosks.php", KIOSKS_PHP)
    w("inc/access.php", ACCESS_PHP)
    w("content/pages.json", json.dumps(pages, indent=1, ensure_ascii=False))
    shutil.copytree(os.path.join(ROOT, "assets"), os.path.join(THEME, "assets"), ignore=shutil.ignore_patterns("config.js"))
    shot = os.path.join(ROOT, "build", "theme-screenshot.png")
    if os.path.exists(shot):
        shutil.copy(shot, os.path.join(THEME, "screenshot.png"))
    zpath = os.path.join(DIST, "citypulse-theme.zip")
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for dp, _, fn in os.walk(THEME):
            for f in fn:
                full = os.path.join(dp, f)
                z.write(full, os.path.join("citypulse", os.path.relpath(full, THEME)))
    print(f"WordPress theme: {len(pages)} pages -> {zpath} ({os.path.getsize(zpath)//1024} KB)")

if __name__ == "__main__":
    main()
