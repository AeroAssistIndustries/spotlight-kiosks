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

	wp_enqueue_script( 'citypulse-kiosk', $uri . 'kiosk.js', array(), $v, true );
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
