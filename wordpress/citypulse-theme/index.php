<?php
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
