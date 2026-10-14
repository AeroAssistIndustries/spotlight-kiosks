"""Export the site as an installable WordPress theme.
Run:  python3 build/export_wp.py
Output: dist/citypulse-digital-theme/ and dist/citypulse-digital-theme.zip

Page content is stored in WordPress as Custom HTML blocks so it can be edited in the page
editor. Links and asset paths are written as {{CP_HOME}} and {{CP_ASSETS}} tokens and resolved
when the page is shown, so the site keeps working if the domain changes."""
import os, re, json, shutil, sys, zipfile
sys.path.insert(0, os.path.dirname(__file__))
import build  # builds the static site and fills PAGE_DATA
import pricing
from lib import PAGE_DATA, NAV, icon, footer, e, EMAIL, PHONE, TEL, ADDR1, ADDR2, SITE, LEGAL, DOMAIN, BRAND_LOGO, _href

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
THEME = os.path.join(DIST, "citypulse-digital-theme")
VERSION = "1.2.0"
FORMS_TO = "sarvesh.joshiaz@gmail.com"

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
    pages.append({
        "path": "/".join(segs), "slug": segs[-1], "parent": "/".join(segs[:-1]),
        "title": d["title"] if path else "Home", "description": pricing.fill(d["desc"]),
        "content": pricing.fill(blocks(tok(d["body"]))), "active": d["active"] or d["path"], "front": not path,
        "js": d["extra_js"],
    })
pages.sort(key=lambda p: p["path"].count("/"))

# ------------------------------------------------------------------ header / footer
def wp_header():
    out = []
    for item in NAV:
        if item[0] == "link":
            _, label, href = item
            out.append(f'<a href="{{R}}{href}"<?php cpd_current_attr( \'{href}\' ); ?>>{label}</a>')
        else:
            _, label, key, links = item
            hrefs = ",".join(f"'{l[1]}'" for l in links)
            lis = "".join(f'<a href="{_href(l[1])}"{" class=\"mega-lead\"" if len(l) > 3 else ""}{" target=\"_blank\" rel=\"noopener\"" if l[1].startswith("http") else ""}><b>{l[0]}</b><span>{l[2]}</span></a>' for l in links)
            out.append(f'<div class="nav-item<?php cpd_current_class( \'{key}\', array( {hrefs} ) ); ?>"><button class="nav-btn" aria-expanded="false" aria-controls="menu-{key}">{label}{icon("chev","")}</button><div class="mega" id="menu-{key}">{lis}</div></div>')
    nav = "\n      ".join(out)
    return php(f'''<?php
/**
 * Site header. Navigation mirrors the static site; edit the links here.
 * @package CityPulseDigital
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
    <a class="brand" href="{{R}}" aria-label="{SITE} home">{BRAND_LOGO}</a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav"><span class="sr">Menu</span><i></i><i></i></button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      {nav}
      <a class="btn btn-small header-cta" href="{{R}}free-audit/">Free audit</a>
    </nav>
  </div>
</header>
''')

def wp_footer():
    f = footer().replace('<span id="year">2026</span>', "<?php echo esc_html( gmdate( 'Y' ) ); ?>")
    return "<?php\n/**\n * Site footer.\n * @package CityPulseDigital\n */\n?>\n" + php(f) + "\n<?php wp_footer(); ?>\n</body>\n</html>\n"

# ------------------------------------------------------------------ PHP files
STYLE = f"""/*
Theme Name: CityPulse Digital
Theme URI: https://{DOMAIN}
Author: {LEGAL}
Description: Website theme for CityPulse Digital — websites, SEO, social media, reputation management and AI search visibility for local businesses. Activate it and all site pages are created for you.
Version: {VERSION}
Requires at least: 6.0
Tested up to: 6.8
Requires PHP: 7.4
License: Proprietary
Text Domain: citypulsedigital
*/
/* The real styles live in assets/styles.css (enqueued in functions.php). */
"""

FUNCTIONS = r"""<?php
/**
 * CityPulse Digital theme functions.
 * @package CityPulseDigital
 */
defined( 'ABSPATH' ) || exit;

define( 'CPD_VERSION', '__VERSION__' );

require get_theme_file_path( 'inc/settings.php' );
require get_theme_file_path( 'inc/setup.php' );
require get_theme_file_path( 'inc/forms.php' );

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'html5', array( 'script', 'style', 'search-form', 'gallery', 'caption' ) );
	add_theme_support( 'responsive-embeds' );
} );

/** Styles and scripts. Each script checks for its own elements, so loading them on every page is safe. */
add_action( 'wp_enqueue_scripts', function () {
	$v   = CPD_VERSION;
	$uri = get_theme_file_uri( 'assets/' );
	wp_enqueue_style( 'cpd-fonts', 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&display=swap', array(), null );
	wp_enqueue_style( 'cpd', $uri . 'styles.css', array( 'cpd-fonts' ), $v );
	wp_enqueue_style( 'cpd-future', $uri . 'future.css', array( 'cpd' ), $v );
	wp_enqueue_script( 'cpd-integrations', $uri . 'integrations.js', array(), $v, true );
	wp_add_inline_script( 'cpd-integrations', 'window.CITYPULSE_CONFIG = ' . wp_json_encode( cpd_public_config() ) . ';', 'before' );
	if ( is_front_page() ) {
		wp_enqueue_script( 'cpd-home', $uri . 'home.js', array(), $v, true );
		wp_enqueue_script( 'cpd-hero', $uri . 'hero-fx.js', array(), $v, true );
	}
	if ( is_page( 'free-audit' ) ) {
		wp_enqueue_script( 'cpd-scorecard', $uri . 'scorecard.js', array(), $v, true );
	}
	wp_enqueue_script( 'cpd-site', $uri . 'site.js', array( 'cpd-integrations' ), $v, true );
	wp_enqueue_script( 'cpd-fx', $uri . 'fx.js', array( 'cpd-site' ), $v, true );
} );

/** Icons, meta description and social tags. */
add_action( 'wp_head', function () {
	$uri = get_theme_file_uri( 'assets/' );
	$seo_plugin = defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' ) || defined( 'SEOPRESS_VERSION' );
	$desc = is_singular() ? get_post_meta( get_the_ID(), '_cpd_desc', true ) : '';
	if ( ! $desc ) {
		$desc = get_bloginfo( 'description' );
	}
	if ( ! $seo_plugin ) {
		echo '<meta name="description" content="' . esc_attr( $desc ) . "\">\n";
		echo '<meta property="og:title" content="' . esc_attr( wp_get_document_title() ) . "\">\n";
		echo '<meta property="og:description" content="' . esc_attr( $desc ) . "\">\n";
		echo '<meta property="og:image" content="' . esc_url( $uri . 'og-card.png' ) . "\">\n";
		echo "<meta property=\"og:image:width\" content=\"1200\">\n<meta property=\"og:image:height\" content=\"630\">\n";
		echo "<meta property=\"og:site_name\" content=\"CityPulse Digital\">\n";
		echo "<meta name=\"twitter:card\" content=\"summary_large_image\">\n";
		echo '<meta name="twitter:title" content="' . esc_attr( wp_get_document_title() ) . "\">\n";
		echo '<meta name="twitter:description" content="' . esc_attr( $desc ) . "\">\n";
		echo '<meta name="twitter:image" content="' . esc_url( $uri . 'og-card.png' ) . "\">\n";
		echo "<meta property=\"og:type\" content=\"website\">\n<meta property=\"og:locale\" content=\"en_US\">\n";
		if ( is_singular() ) {
			echo '<meta property="og:url" content="' . esc_url( get_permalink() ) . "\">\n";
			echo '<link rel="canonical" href="' . esc_url( get_permalink() ) . "\">\n";
		} elseif ( is_front_page() ) {
			echo '<meta property="og:url" content="' . esc_url( home_url( '/' ) ) . "\">\n";
			echo '<link rel="canonical" href="' . esc_url( home_url( '/' ) ) . "\">\n";
		}
		if ( is_404() || is_search() ) {
			echo "<meta name=\"robots\" content=\"noindex\">\n";
		}
	}
	echo "<meta name=\"theme-color\" content=\"#F5F8FF\">\n";
	if ( ! has_site_icon() ) {
		echo '<link rel="icon" href="' . esc_url( $uri . 'favicon.svg' ) . "\" type=\"image/svg+xml\">\n";
		echo '<link rel="icon" href="' . esc_url( $uri . 'favicon.png' ) . "\" type=\"image/png\" sizes=\"64x64\">\n";
		echo '<link rel="apple-touch-icon" href="' . esc_url( $uri . 'apple-touch-icon.png' ) . "\">\n";
		echo '<link rel="manifest" href="' . esc_url( $uri . 'site.webmanifest' ) . "\">\n";
	}
	// Local business structured data.
	if ( is_front_page() ) {
		echo '<script type="application/ld+json">' . wp_json_encode( array(
			'@context' => 'https://schema.org', '@type' => 'ProfessionalService', 'name' => 'CityPulse Digital',
			'legalName' => 'City Pulse Digital LLC', 'url' => home_url( '/' ), 'logo' => $uri . 'logo.png', 'image' => $uri . 'og-card.png',
			'telephone' => '+1-602-887-4058', 'email' => '__EMAIL__',
			'address' => array( '@type' => 'PostalAddress', 'streetAddress' => '4750 S 44th Pl, Suite E20', 'addressLocality' => 'Phoenix', 'addressRegion' => 'AZ', 'postalCode' => '85040', 'addressCountry' => 'US' ),
			'areaServed' => 'US', 'priceRange' => '$$',
			'knowsAbout' => array( 'Website design', 'Search engine optimization', 'Social media management', 'Reputation management', 'Local listings', 'AI search visibility' ),
		) ) . '</script>' . "\n";
	}
}, 1 );

/** FAQ and breadcrumb structured data, derived from the page's own markup. */
add_action( 'wp_footer', function () {
	if ( ! is_page() ) {
		return;
	}
	$html = get_post_field( 'post_content', get_the_ID() );
	$out  = array();
	if ( preg_match_all( '#<details[^>]*>\s*<summary>(.*?)</summary>\s*<div>(.*?)</div>\s*</details>#s', $html, $m ) ) {
		$qa = array();
		foreach ( $m[1] as $i => $q ) {
			$qa[] = array( '@type' => 'Question', 'name' => wp_strip_all_tags( $q ), 'acceptedAnswer' => array( '@type' => 'Answer', 'text' => trim( wp_strip_all_tags( $m[2][ $i ] ) ) ) );
		}
		$out[] = array( '@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => $qa );
	}
	if ( preg_match( '#<ol class="crumbs"[^>]*>(.*?)</ol>#s', $html, $c ) && preg_match_all( '#<li[^>]*>(?:<a href="\{\{CP_HOME\}\}([^"]*)">)?(.*?)(?:</a>)?</li>#', $c[1], $li ) ) {
		$items = array();
		foreach ( $li[2] as $i => $name ) {
			$items[] = array( '@type' => 'ListItem', 'position' => $i + 1, 'name' => wp_strip_all_tags( $name ), 'item' => home_url( '/' . $li[1][ $i ] ) );
		}
		$out[] = array( '@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $items );
	}
	foreach ( $out as $o ) {
		echo '<script type="application/ld+json">' . wp_json_encode( $o, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script>' . "\n";
	}
} );

/** Page content stores links as {{CP_HOME}} and assets as {{CP_ASSETS}}; resolve them on output. */
function cpd_resolve_tokens( $html ) {
	return strtr( $html, array(
		'{{CP_HOME}}'   => esc_url( home_url( '/' ) ),
		'{{CP_ASSETS}}' => esc_url( get_theme_file_uri( 'assets/' ) ),
	) );
}
add_filter( 'the_content', 'cpd_resolve_tokens', 99 );

/** The site's copy uses straight quotes inside HTML attributes; keep WordPress from curling them. */
add_filter( 'run_wptexturize', function ( $run ) {
	return is_page() ? false : $run;
} );

/** Path of the current request relative to the site root, e.g. "services/seo/". */
function cpd_current_path() {
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
function cpd_current_attr( $href ) {
	if ( cpd_current_path() === $href ) {
		echo ' aria-current="page"';
	}
}
function cpd_current_class( $key, $hrefs ) {
	$p = cpd_current_path();
	if ( $p && ( 0 === strpos( $p, $key ) || in_array( $p, $hrefs, true ) ) ) {
		echo ' current';
	}
}
"""

PAGE_PHP = """<?php
/**
 * Default page template. Page content is edited in the block editor (Custom HTML blocks).
 * @package CityPulseDigital
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
 * @package CityPulseDigital
 */
get_header(); ?>
<main id="main">
<section class="page-hero"><div class="wrap narrow">
	<h1><?php echo is_search() ? esc_html__( 'Search results', 'citypulsedigital' ) : esc_html( wp_strip_all_tags( get_the_archive_title() ?: get_bloginfo( 'name' ) ) ); ?></h1>
</div></section>
<section class="section"><div class="wrap narrow prose">
<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
	<article <?php post_class(); ?>>
		<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
		<?php the_excerpt(); ?>
	</article>
<?php endwhile; the_posts_pagination(); else : ?>
	<p><?php esc_html_e( 'Nothing here yet.', 'citypulsedigital' ); ?></p>
<?php endif; ?>
</div></section>
</main>
<?php get_footer();
"""

SINGLE_PHP = """<?php
/**
 * Single post (blog).
 * @package CityPulseDigital
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
 * Settings → CityPulse Digital: form delivery and page tools.
 * @package CityPulseDigital
 */
defined( 'ABSPATH' ) || exit;

function cpd_defaults() {
	return array( 'forms_provider' => 'wordpress', 'forms_to' => '__FORMS_TO__', 'formspree' => '' );
}
function cpd_opt( $key ) {
	$o = wp_parse_args( get_option( 'cpd_settings', array() ), cpd_defaults() );
	return $o[ $key ];
}

/** What the browser needs (no secrets). */
function cpd_public_config() {
	$provider = cpd_opt( 'forms_provider' );
	return array(
		'forms' => array(
			'provider' => $provider,
			'to'       => 'formsubmit' === $provider ? cpd_opt( 'forms_to' ) : '',
			'endpoint' => 'formspree' === $provider ? cpd_opt( 'formspree' ) : '',
			'ajaxUrl'  => admin_url( 'admin-ajax.php' ),
		),
	);
}

add_action( 'admin_menu', function () {
	add_options_page( 'CityPulse Digital settings', 'CityPulse Digital', 'manage_options', 'citypulsedigital', 'cpd_settings_page' );
} );

add_action( 'admin_init', function () {
	register_setting( 'citypulsedigital', 'cpd_settings', array(
		'type'              => 'array',
		'sanitize_callback' => function ( $in ) {
			$d   = cpd_defaults();
			$out = array();
			$out['forms_provider'] = in_array( $in['forms_provider'] ?? '', array( 'wordpress', 'formsubmit', 'formspree', 'none' ), true ) ? $in['forms_provider'] : $d['forms_provider'];
			$out['forms_to']       = sanitize_email( $in['forms_to'] ?? '' ) ?: $d['forms_to'];
			$out['formspree']      = esc_url_raw( $in['formspree'] ?? '' );
			return $out;
		},
	) );
} );

function cpd_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$o = wp_parse_args( get_option( 'cpd_settings', array() ), cpd_defaults() );
	$n = 'cpd_settings';
	?>
	<div class="wrap">
		<h1>CityPulse Digital settings</h1>
		<?php if ( isset( $_GET['cpd_pages'] ) ) : // phpcs:ignore ?>
			<div class="notice notice-success"><p><?php echo esc_html( sprintf( 'Pages checked: %d created, %d updated.', (int) $_GET['created'], (int) $_GET['updated'] ) ); // phpcs:ignore ?></p></div>
		<?php endif; ?>
		<form method="post" action="options.php">
			<?php settings_fields( 'citypulsedigital' ); ?>
			<h2>Forms</h2>
			<table class="form-table" role="presentation">
				<tr><th scope="row">Delivery</th><td>
					<select name="<?php echo esc_attr( $n ); ?>[forms_provider]">
						<?php foreach ( array( 'wordpress' => 'WordPress (saved under Inquiries and emailed)', 'formsubmit' => 'FormSubmit (email only, no WordPress copy)', 'formspree' => 'Formspree', 'none' => 'Off — visitors email you themselves' ) as $k => $label ) : ?>
							<option value="<?php echo esc_attr( $k ); ?>" <?php selected( $o['forms_provider'], $k ); ?>><?php echo esc_html( $label ); ?></option>
						<?php endforeach; ?>
					</select>
					<p class="description">“WordPress” stores every audit request, message and support request in the admin and emails it. Make sure the site can send email — an SMTP plugin is recommended.</p>
				</td></tr>
				<tr><th scope="row"><label for="cpd-to">Send to</label></th><td><input id="cpd-to" type="email" class="regular-text" name="<?php echo esc_attr( $n ); ?>[forms_to]" value="<?php echo esc_attr( $o['forms_to'] ); ?>"></td></tr>
				<tr><th scope="row"><label for="cpd-fs">Formspree endpoint</label></th><td><input id="cpd-fs" type="url" class="regular-text" placeholder="https://formspree.io/f/xxxx" name="<?php echo esc_attr( $n ); ?>[formspree]" value="<?php echo esc_attr( $o['formspree'] ); ?>"><p class="description">Only used when Delivery is Formspree.</p></td></tr>
			</table>
			<?php submit_button(); ?>
		</form>
		<hr>
		<h2>Site pages</h2>
		<p>The theme creates all site pages on activation. Use this to recreate any page that was deleted. Existing pages are left alone unless you tick the box.</p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="cpd_pages">
			<?php wp_nonce_field( 'cpd_pages' ); ?>
			<label><input type="checkbox" name="overwrite" value="1"> Also reset existing pages to the theme's original content (overwrites edits)</label>
			<?php submit_button( 'Create missing pages', 'secondary' ); ?>
		</form>
	</div>
	<?php
}

add_action( 'admin_post_cpd_pages', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}
	check_admin_referer( 'cpd_pages' );
	$r = cpd_install_pages( ! empty( $_POST['overwrite'] ) );
	wp_safe_redirect( add_query_arg( array( 'page' => 'citypulsedigital', 'cpd_pages' => 1, 'created' => $r['created'], 'updated' => $r['updated'] ), admin_url( 'options-general.php' ) ) );
	exit;
} );
"""

SETUP_PHP = r"""<?php
/**
 * Creates the site's pages from content/pages.json when the theme is activated.
 * @package CityPulseDigital
 */
defined( 'ABSPATH' ) || exit;

function cpd_install_pages( $overwrite = false ) {
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
			$parent    = get_page_by_path( $p['parent'] );
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
			update_post_meta( $id, '_cpd_desc', $p['description'] );
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
	cpd_install_pages( false );
	if ( ! get_option( 'permalink_structure' ) ) {
		update_option( 'permalink_structure', '/%postname%/' );
	}
	if ( in_array( get_option( 'blogname' ), array( '', 'WordPress', 'My WordPress Website', 'My Blog' ), true ) || preg_replace( '/[^a-z]/', '', strtolower( (string) get_option( 'blogname' ) ) ) === 'citypulsedigital' ) {
		update_option( 'blogname', 'CityPulse Digital' );
	}
	if ( in_array( get_option( 'blogdescription' ), array( '', 'Just another WordPress site' ), true ) ) {
		update_option( 'blogdescription', 'Be found. Be chosen. Be talked about.' );
	}
	flush_rewrite_rules();
} );

/** Safety net: if the theme was uploaded without activation hooks firing, create pages on the first front-end load. */
add_action( 'template_redirect', function () {
	if ( get_option( 'cpd_pages_installed' ) ) {
		return;
	}
	cpd_install_pages( false );
	update_option( 'cpd_pages_installed', CPD_VERSION );
} );
"""

FORMS_PHP = r"""<?php
/**
 * Receives audit requests, messages and support requests when Delivery is "WordPress":
 * saves each one under Inquiries and emails it.
 * @package CityPulseDigital
 */
defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	register_post_type( 'cpd_submission', array(
		'labels'          => array( 'name' => 'Inquiries', 'singular_name' => 'Inquiry', 'menu_name' => 'Inquiries' ),
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

add_action( 'wp_ajax_citypulse_submit', 'cpd_handle_submit' );
add_action( 'wp_ajax_nopriv_citypulse_submit', 'cpd_handle_submit' );

function cpd_handle_submit() {
	// Spam guards: hidden honeypot field and a simple per-visitor rate limit.
	if ( ! empty( $_POST['_gotcha'] ) ) { // phpcs:ignore
		wp_send_json_success();
	}
	$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$key = 'cpd_rl_' . md5( $ip );
	$n   = (int) get_transient( $key );
	if ( $n >= 10 ) {
		wp_send_json_error( array( 'message' => 'Too many submissions. Please try again in a few minutes.' ), 429 );
	}
	set_transient( $key, $n + 1, 10 * MINUTE_IN_SECONDS );

	$fields = array();
	foreach ( $_POST as $k => $v ) { // phpcs:ignore
		if ( 'action' === $k || '_' === $k[0] || 'ack' === $k || is_array( $v ) || '' === trim( (string) $v ) ) {
			continue;
		}
		$fields[ sanitize_text_field( str_replace( '_', ' ', $k ) ) ] = sanitize_textarea_field( wp_unslash( $v ) );
	}
	if ( ! $fields ) {
		wp_send_json_error( array( 'message' => 'Empty submission.' ), 400 );
	}
	$subject = isset( $_POST['_subject'] ) ? sanitize_text_field( wp_unslash( $_POST['_subject'] ) ) : 'Website inquiry'; // phpcs:ignore
	$reply   = isset( $_POST['_replyto'] ) ? sanitize_email( wp_unslash( $_POST['_replyto'] ) ) : ''; // phpcs:ignore
	if ( ! $reply && isset( $fields['email'] ) ) {
		$reply = sanitize_email( $fields['email'] );
	}

	$rows = '';
	foreach ( $fields as $k => $v ) {
		$rows .= '<tr><th style="text-align:left;padding:6px 12px;background:#f4f6f7">' . esc_html( ucfirst( $k ) ) . '</th><td style="padding:6px 12px">' . nl2br( esc_html( $v ) ) . '</td></tr>';
	}
	$html = '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' . $rows . '</table>';

	$post_id = wp_insert_post( array(
		'post_type'    => 'cpd_submission',
		'post_status'  => 'private',
		'post_title'   => $subject,
		'post_content' => $html,
	) );
	if ( $post_id && ! is_wp_error( $post_id ) ) {
		update_post_meta( $post_id, '_cpd_fields', $fields );
	}

	$headers = array( 'Content-Type: text/html; charset=UTF-8' );
	if ( $reply ) {
		$headers[] = 'Reply-To: ' . $reply;
	}
	$mailed = wp_mail( cpd_opt( 'forms_to' ), $subject, $html . '<p style="font-family:Arial;font-size:12px;color:#666">Also saved in WordPress → Inquiries.</p>', $headers );

	wp_send_json_success( array( 'saved' => (bool) $post_id, 'mailed' => (bool) $mailed ) );
}
"""

def page404_php():
    body = php(page404["body"]) if page404 else "<section class='page-hero'><div class='wrap'><h1>Page not found</h1></div></section>"
    return "<?php\n/**\n * 404 page.\n * @package CityPulseDigital\n */\nget_header(); ?>\n<main id=\"main\">\n" + pricing.fill(body) + "\n</main>\n<?php get_footer();\n"

# ------------------------------------------------------------------ write theme
def main():
    if os.path.exists(THEME):
        shutil.rmtree(THEME)
    os.makedirs(os.path.join(THEME, "inc")); os.makedirs(os.path.join(THEME, "content"))
    w = lambda rel, txt: open(os.path.join(THEME, rel), "w").write(txt)
    w("style.css", STYLE)
    w("functions.php", FUNCTIONS.replace("__VERSION__", VERSION).replace("__EMAIL__", EMAIL))
    w("header.php", pricing.fill(wp_header()))
    w("footer.php", pricing.fill(wp_footer()))
    w("page.php", PAGE_PHP); w("front-page.php", PAGE_PHP); w("index.php", INDEX_PHP); w("single.php", SINGLE_PHP)
    w("404.php", page404_php())
    w("inc/settings.php", SETTINGS_PHP.replace("__FORMS_TO__", FORMS_TO))
    w("inc/setup.php", SETUP_PHP)
    w("inc/forms.php", FORMS_PHP)
    w("content/pages.json", json.dumps(pages, indent=1, ensure_ascii=False))
    shutil.copytree(os.path.join(ROOT, "assets"), os.path.join(THEME, "assets"), ignore=shutil.ignore_patterns("config.js"))
    shot = os.path.join(ROOT, "build", "screenshot.png")
    if os.path.exists(shot):
        shutil.copy(shot, os.path.join(THEME, "screenshot.png"))
    zpath = os.path.join(DIST, "citypulse-digital-theme.zip")
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for dp, _, fn in os.walk(THEME):
            for f in fn:
                full = os.path.join(dp, f)
                z.write(full, os.path.join("citypulse-digital", os.path.relpath(full, THEME)))
    print(f"Theme: {len(pages)} pages -> {zpath} ({os.path.getsize(zpath)//1024} KB)")

if __name__ == "__main__":
    main()
