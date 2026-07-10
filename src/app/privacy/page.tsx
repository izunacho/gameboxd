import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Hitboxd',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-invert">
      <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-dark-text mb-10">Last updated: July 9, 2026</p>

      <div className="space-y-8 text-dark-text leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-white mb-3">1. What this app is</h2>
          <p>
            Hitboxd is a community app for rating and reviewing video games. This
            policy explains what information we collect when you use it, why, and
            how it's protected.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">2. Information we collect</h2>
          <p className="mb-2">When you create an account, we collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Email address</strong> — used only for login and account verification. It is never shown to other users or made public.</li>
            <li><strong>Username</strong> — public, shown on your reviews and profile.</li>
            <li><strong>Password</strong> — stored as a secure hash by our authentication provider; we never see or store it in plain text.</li>
          </ul>
          <p className="mt-2 mb-2">When you use the app, we store:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Reviews and ratings you write — public, shown with your username.</li>
            <li>Games you mark as played, wishlisted, or liked — public, shown on your profile.</li>
            <li>Likes you give to other users' reviews.</li>
            <li>An optional bio, if you choose to add one.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">3. What we don't do</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>We don't use analytics, tracking scripts, or advertising cookies.</li>
            <li>We don't sell or share your data with third parties for marketing.</li>
            <li>We don't display your email address anywhere in the app.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">4. Third-party services we use</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase</strong> — hosts our database and handles authentication (sign-up, login, password storage, and account emails).</li>
            <li><strong>IGDB (Twitch/Internet Game Database)</strong> — provides game titles, cover art, and release information. We query it on your behalf; it does not receive any of your personal data.</li>
            <li><strong>Resend</strong> — delivers account emails, such as the confirmation email you receive when you sign up.</li>
            <li><strong>Vercel</strong> — hosts the application itself.</li>
          </ul>
          <p className="mt-2">
            Each of these providers processes data only as needed to provide their service to us, under their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">5. Cookies and local storage</h2>
          <p>
            We use a small amount of browser storage to keep you logged in
            between visits (an authentication token) and, if you install
            Hitboxd as an app on your phone or computer, to let it work
            offline. We don't use cookies for advertising or tracking.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">6. Your choices</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You can edit or remove your reviews at any time from the game page.</li>
            <li>You can remove interactions (played, wishlist, liked) at any time.</li>
            <li>
              To delete your account entirely, contact us (see below) and we'll
              remove your account and associated data.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">7. Changes to this policy</h2>
          <p>
            If this policy changes, we'll update the date at the top of this
            page. Continued use of Hitboxd after a change means you accept the
            updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-3">8. Contact</h2>
          <p>
            Questions about your data? Reach out at{' '}
            <a href="mailto:izunacho@gmail.com" className="text-primary hover:underline">
              izunacho@gmail.com
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-dark-border">
        <Link href="/" className="text-primary hover:underline">
          ← Back to Hitboxd
        </Link>
      </div>
    </div>
  );
}
