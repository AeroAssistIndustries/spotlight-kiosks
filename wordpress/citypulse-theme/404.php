<?php
/**
 * Page not found.
 * @package CityPulse
 */
get_header(); ?>
<main id="main">
<section class="page-hero"><div class="wrap"><h1>This page took a different turn.</h1><p class="lede" style="margin-top:20px">The page you're looking for isn't here. Try one of these instead.</p><div class="btn-row"><a class="btn " href="<?php echo esc_url( home_url( '/' ) ); ?>">Go to the home page</a><a class="btn btn-ghost" href="<?php echo esc_url( home_url( '/' ) ); ?>kiosk/#demo">Try the kiosk</a><a class="btn btn-ghost" href="<?php echo esc_url( home_url( '/' ) ); ?>contact/">Contact CityPulse</a></div></div></section>
</main>
<?php get_footer();
