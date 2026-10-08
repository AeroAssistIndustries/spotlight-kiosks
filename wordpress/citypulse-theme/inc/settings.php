<?php
/**
 * Settings → CityPulse: form delivery, payment links and page tools.
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

function citypulse_defaults() {
	return array(
		'forms_provider'    => 'wordpress',
		'forms_to'          => 'sarvesh.joshiaz@gmail.com',
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
