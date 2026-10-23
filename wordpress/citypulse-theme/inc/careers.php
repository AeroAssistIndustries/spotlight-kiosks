<?php
/**
 * Work with us: /work-with-us/ (also /careers/ and /jobs/). Recruits independent sales reps.
 * Applications go straight to CityPulse Sales Studio (POST /api/web/apply), where admins review them and click
 * Hire to send the rep their onboarding link. Served by the theme, like /advertiser/, so it needs no page in the editor.
 * @package CityPulse
 */
defined( 'ABSPATH' ) || exit;

define( 'CITYPULSE_STUDIO', 'https://sales.citypulsekiosks.com' );

add_action( 'template_redirect', function () {
	$path = trim( (string) wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '', PHP_URL_PATH ), '/' ); // phpcs:ignore
	if ( in_array( $path, array( 'careers', 'jobs', 'work-for-us', 'join-our-team' ), true ) ) {
		wp_safe_redirect( home_url( '/work-with-us/' ), 301 );
		exit;
	}
	if ( 'work-with-us' !== $path ) {
		return;
	}
	global $wp_query;
	$wp_query->is_404 = false;
	status_header( 200 );
	$desc = 'Join CityPulse Kiosks as a remote, independent sales rep. Call local businesses near our kiosks and earn 25% of every payment your customers make, for as long as they stay.';
	add_filter( 'pre_get_document_title', function () { return 'Work with us: remote sales reps | CityPulse Kiosks'; } );
	add_action( 'wp_head', function () use ( $desc ) {
		echo '<meta name="description" content="' . esc_attr( $desc ) . "\">\n";
		echo '<meta property="og:title" content="Work with us: remote sales reps | CityPulse Kiosks">' . "\n";
		echo '<meta property="og:description" content="' . esc_attr( $desc ) . "\">\n";
		$job = array(
			'@context'                       => 'https://schema.org/',
			'@type'                          => 'JobPosting',
			'title'                          => 'Independent Sales Representative (Remote, Commission)',
			'description'                    => '<p>Sell digital advertising on CityPulse touch-screen kiosks to local businesses, by phone, from anywhere in the US. Independent contractor (1099) role paid by commission: 25% of every payment your customers make, including renewals, for as long as they stay. CityPulse provides Sales Studio (calling and customer tools), a phone extension, a company email address, scripts, training, and reimburses one headset up to $50. You need a laptop or computer and/or a smartphone with internet, a quiet place to make calls, and a headset with a microphone.</p>',
			'datePosted'                     => '2026-10-22',
			'employmentType'                 => 'CONTRACTOR',
			'jobLocationType'                => 'TELECOMMUTE',
			'applicantLocationRequirements'  => array( '@type' => 'Country', 'name' => 'USA' ),
			'directApply'                    => true,
			'hiringOrganization'             => array( '@type' => 'Organization', 'name' => 'CityPulse Kiosks', 'sameAs' => home_url( '/' ), 'logo' => get_theme_file_uri( 'assets/logo-mark.png' ) ),
		);
		echo '<script type="application/ld+json">' . wp_json_encode( $job ) . "</script>\n";
	}, 2 );
	wp_enqueue_script( 'citypulse-careers', get_theme_file_uri( 'assets/careers.js' ), array(), CITYPULSE_VERSION, true );
	get_header();
	citypulse_careers_page();
	get_footer();
	exit;
}, 9 );

function citypulse_careers_page() {
	$home = esc_url( home_url( '/' ) );
	$a    = esc_url( get_theme_file_uri( 'assets/' ) );
	$states = array( 'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY' );
	$opts = '';
	foreach ( $states as $s ) {
		$opts .= '<option>' . esc_html( $s ) . '</option>';
	}
	$sale = '<span class="cp-p" data-reg="$798">$598</span>';
	$cut  = '<span class="cp-p" data-reg="$199.50">$149.50</span>';
	?>
<main id="main" class="careers-page">
<section class="page-hero"><div class="wrap"><ol class="crumbs" aria-label="Breadcrumb"><li><a href="<?php echo $home; ?>">Home</a></li><li><a href="<?php echo $home; ?>about/">Company</a></li><li aria-current="page">Work with us</li></ol>
  <div class="hero-grid"><div><p class="eyebrow">Work with us</p><h1>Sell local advertising. From anywhere.</h1><p class="lede">Join CityPulse Kiosks as an independent sales rep. Call local businesses near our kiosks, help them get seen by the visitors next door, and earn <strong>25% of every payment</strong> your customers make, for as long as they stay.</p><div class="btn-row"><a class="btn" href="#apply">Apply now</a><a class="btn btn-ghost" href="#how">How hiring works</a></div></div>
  <div class="hero-aside"><div class="cr-earn"><p class="cr-earn-k">How your commission works</p><p class="cr-earn-big">25%</p><p class="cr-earn-sub">of every payment, renewals included</p>
    <div class="cr-earn-ex"><span>Example: one business on the 1-location yearly plan pays <?php echo $sale; ?> a year.</span><b>You earn <?php echo $cut; ?>, and again every year they renew.</b></div></div></div></div>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head"><p class="eyebrow">Why CityPulse</p><h2>A simple product. A real reason to call.</h2></div>
  <div class="cards">
    <div class="card"><span class="kind">Remote</span><h3>Your schedule, your space.</h3><p>Work from home, part-time or full-time. Calls go out between 8 AM and 9 PM in the business’s local time, and you choose your hours.</p></div>
    <div class="card"><span class="kind">Recurring</span><h3>Commission that keeps paying.</h3><p>You earn 25% of what CityPulse collects from each customer you bring in, on the first payment and on every renewal while they stay.</p></div>
    <div class="card"><span class="kind">Equipped</span><h3>Everything you need to sell.</h3><p>Sales Studio finds businesses near our kiosks, dials them for you, and closes the deal with one button: agreement and secure payment link together.</p></div>
  </div>
</div></section>

<section class="section" style="padding-top:0"><div class="wrap">
  <div class="path"><div class="path-main"><h3>What we provide</h3><ul class="check-list"><li>Sales Studio: your calling, follow-up and customer tools</li><li>Your own phone extension on our main line</li><li>A company email address</li><li>Scripts, objection answers and a 30-minute online training</li><li>Live kiosk demos with the business’s own ad, to text or email while you talk</li><li>Secure payment links, so customers pay on their own phone</li><li>One headset with a microphone, reimbursed up to $50</li></ul></div>
  <div class="path-panel"><h4>What you need</h4><ul class="check-list"><li>A laptop or computer and/or a smartphone, with internet</li><li>A quiet room for calls</li><li>A headset with a microphone</li><li>To live in the US (you’ll complete a W-9)</li><li>A friendly phone voice and the drive to work on your own</li></ul>
    <p class="fine">No sales experience? Our training covers the product, the prices, the call step by step and how to answer common objections.</p></div></div>
</div></section>

<section class="section" id="how" style="padding-top:0"><div class="wrap">
  <div class="section-head"><p class="eyebrow">How hiring works</p><h2>From application to first call.</h2></div>
  <ol class="step-list cr-steps">
    <li><h3>Apply</h3><p>Five minutes, right on this page. A resume is optional.</p></li>
    <li><h3>We get in touch</h3><p>We review every application personally and reach out by email or phone.</p></li>
    <li><h3>Onboard and train online</h3><p>Our 30-minute sales training, your agreement and your W-9, all from your phone or laptop.</p></li>
    <li><h3>Start selling</h3><p>You get your Sales Studio login, your extension and your company email.</p></li>
  </ol>
</div></section>

<section class="section" style="padding-top:0"><div class="wrap faq-grid">
  <div><p class="eyebrow">Questions</p><h2>Before you apply.</h2><a class="text-link" href="#apply">Go to the application</a></div>
  <div class="faq-list">
    <details><summary>Is this a job or a contract?</summary><div><p>It’s an independent contractor (1099) role. You set your own hours and work remotely. Pay is commission only: there’s no base salary.</p></div></details>
    <details><summary>How does the commission work?</summary><div><p>You earn 25% of the net amount CityPulse collects from each customer you bring in, on their first payment and on every renewal for as long as they stay. Refunds and chargebacks reverse the commission on that payment.</p></div></details>
    <details><summary>When and how do I get paid?</summary><div><p>For yearly plans, within 5 business days after each payment clears. For monthly plans, at the end of each contract year. You get a monthly statement, and you’re paid by direct deposit, Zelle or check.</p></div></details>
    <details><summary>Who will I be calling?</summary><div><p>Local businesses near CityPulse kiosks: restaurants and coffee shops, salons, clinics, auto services, shops and attractions. Sales Studio finds them and loads your next call.</p></div></details>
    <details><summary>Do I need sales experience?</summary><div><p>No. Experience helps, but our training walks you through the product, pricing, each step of the call and the most common objections, with a short check after each module.</p></div></details>
    <details><summary>What equipment do I need?</summary><div><p>A laptop or computer and/or a smartphone with internet, a quiet room, and a headset with a microphone. We reimburse one headset, one time, up to $50.</p></div></details>
  </div>
</div></section>

<section class="section dark" id="apply"><div class="wrap form-wrap">
  <div><h2>Apply to sell for CityPulse.</h2><p class="lede" style="margin-top:16px">Tell us a little about you. It takes about five minutes.</p>
    <ol class="steps-mini"><li><span>1</span>Send your application</li><li><span>2</span>Hear back from our team</li><li><span>3</span>Onboard, train and start selling</li></ol>
    <div class="talk"><span class="fine">Questions about the role?</span><a href="tel:+16029755513">602-975-5513</a><a href="mailto:onboarding@citypulsekiosks.com">onboarding@citypulsekiosks.com</a></div></div>
  <div>
  <form class="cp-form" id="cp-apply" data-api="<?php echo esc_url( CITYPULSE_STUDIO ); ?>" novalidate>
    <fieldset><legend>About you</legend>
      <label class="field"><span>Full name</span><input type="text" name="name" autocomplete="name" required maxlength="100"></label>
      <label class="field"><span>Email</span><input type="email" name="email" autocomplete="email" required maxlength="160"></label>
      <label class="field"><span>Mobile phone</span><input type="tel" name="phone" autocomplete="tel" required></label>
      <label class="field"><span>City</span><input type="text" name="city" autocomplete="address-level2" required maxlength="80"></label>
      <label class="field"><span>State</span><select name="state" autocomplete="address-level1" required><option value="">Choose</option><?php echo $opts; // phpcs:ignore ?></select></label>
      <label class="field"><span>LinkedIn <span class="opt">(optional)</span></span><input type="url" name="linkedin" placeholder="linkedin.com/in/you" maxlength="200"></label>
    </fieldset>
    <fieldset><legend>A few quick questions</legend>
      <label class="field"><span>Sales experience</span><select name="experience" required><option value="">Choose</option><option value="none">None yet</option><option value="some">Under 1 year</option><option value="mid">1–3 years</option><option value="senior">3+ years</option></select></label>
      <label class="field"><span>Hours you want</span><select name="hours" required><option value="">Choose</option><option value="part">Part-time</option><option value="full">Full-time</option></select></label>
      <label class="field"><span>You could start</span><select name="start" required><option value="">Choose</option><option value="now">Right away</option><option value="2wk">Within 2 weeks</option><option value="month">Within a month</option></select></label>
    </fieldset>
    <fieldset class="cr-setup"><legend>Your setup</legend>
      <label class="ack"><input type="checkbox" name="laptop"> <span>I have a laptop or computer with internet</span></label>
      <label class="ack"><input type="checkbox" name="smartphone"> <span>I have a smartphone with internet</span></label>
      <label class="ack"><input type="checkbox" name="quietRoom"> <span>I have a quiet room for calls</span></label>
      <label class="ack"><input type="checkbox" name="headset"> <span>I already have a headset with a microphone</span></label>
    </fieldset>
    <fieldset class="cr-one"><legend>Tell us about you</legend>
      <label class="field full"><span>Why would you be great at this? <span class="opt">(a few sentences)</span></span><textarea name="why" required maxlength="1500" rows="4"></textarea></label>
      <label class="field full"><span>Resume <span class="opt">(optional, PDF or Word, up to 1.3 MB)</span></span><input type="file" name="resume" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label>
    </fieldset>
    <label class="cr-hp" aria-hidden="true">Company website <input type="text" name="company_url" tabindex="-1" autocomplete="off"></label>
    <label class="ack"><input type="checkbox" name="agree"> <span>I understand this is an independent contractor (1099) role paid by commission: 25% of what CityPulse collects from the customers I bring in.</span></label>
    <p class="form-error" id="cp-apply-err" role="alert" hidden></p>
    <div class="form-foot"><button class="btn" type="submit">Send application</button><span class="fine">We use your details only to review your application.</span></div>
  </form>
  <div class="draft-review" id="cp-apply-done" hidden tabindex="-1"><h3 style="font-size:28px;margin-bottom:10px">Thank you<span id="cp-apply-name"></span>!</h3><p>Your application is in. We sent a confirmation to <b id="cp-apply-email"></b>, and our team will be in touch about next steps.</p><p class="fine" style="margin-top:14px">Questions? Call 602-975-5513 or email onboarding@citypulsekiosks.com.</p></div>
  </div>
</div></section>
</main>
	<?php
}
