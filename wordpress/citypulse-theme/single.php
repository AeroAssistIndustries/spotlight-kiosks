<?php
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
