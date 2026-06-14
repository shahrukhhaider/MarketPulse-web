import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — PaperEdge",
  description: "How PaperEdge collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: June 13, 2025</p>

      <div className="mt-10 space-y-10 text-slate-300 leading-relaxed text-[15px]">
        <section>
          <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
          <p className="mt-3">
            PaperEdge (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website at{" "}
            <span className="text-white font-medium">getpaperedge.com</span> and the associated Discord
            community. This Privacy Policy explains what data we collect, how we use it, and your rights
            regarding that data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">2. Information We Collect</h2>
          <p className="mt-3">We collect only the minimum data necessary to provide our service:</p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>
              <span className="text-white font-medium">Discord User ID</span> — Your unique Discord
              identifier, used to associate your watchlist and settings with your account.
            </li>
            <li>
              <span className="text-white font-medium">Watchlist tickers</span> — The stock symbols you
              add to your watchlist via the Discord bot.
            </li>
            <li>
              <span className="text-white font-medium">TradersPost webhook URL</span> — If you configure
              trade signal forwarding, we store your webhook URL to deliver signals.
            </li>
            <li>
              <span className="text-white font-medium">Chat messages (transient)</span> — Messages sent
              to our Discord bot are forwarded to Anthropic&apos;s Claude API for processing. We do{" "}
              <span className="font-medium text-white">not</span> store these messages.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">3. Information We Do Not Collect</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>Real names, email addresses, or phone numbers</li>
            <li>Brokerage credentials or account numbers</li>
            <li>Payment card details (Stripe handles all payment data directly)</li>
            <li>IP addresses or browsing behaviour (beyond standard Vercel/Next.js defaults)</li>
            <li>Cookies for tracking or advertising purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">4. Third-Party Services</h2>
          <p className="mt-3">
            We use the following third-party services. Their respective privacy policies apply to data
            they process:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>
              <span className="text-white font-medium">Anthropic (Claude API)</span> — Processes chat
              messages for bot responses. See{" "}
              <a
                href="https://www.anthropic.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Anthropic&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <span className="text-white font-medium">TradersPost</span> — Receives webhook signals for
              trade execution. See{" "}
              <a
                href="https://traderspost.io/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                TradersPost Privacy Policy
              </a>
              .
            </li>
            <li>
              <span className="text-white font-medium">Discord</span> — Community platform. See{" "}
              <a
                href="https://discord.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Discord&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <span className="text-white font-medium">Stripe</span> — Payment processing for
              subscriptions. See{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Stripe&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <span className="text-white font-medium">Vercel</span> — Hosts our website. May collect
              standard web analytics. See{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Vercel&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <span className="text-white font-medium">Railway</span> — Infrastructure provider hosting
              our backend and database. See{" "}
              <a
                href="https://railway.app/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Railway&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <span className="text-white font-medium">Yahoo Finance</span> — Market data source. No
              user data is sent to Yahoo Finance.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">5. Data Retention</h2>
          <p className="mt-3">
            Your data (watchlist tickers, webhook URL, Discord User ID) is retained for as long as you
            use the service. You may delete your data at any time by using the bot&apos;s delete commands
            or by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">6. Your Rights</h2>
          <p className="mt-3">You have the right to:</p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>Request a copy of the data we hold about you</li>
            <li>Request deletion of your data</li>
            <li>Withdraw from the service at any time by leaving the Discord server</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">7. Contact</h2>
          <p className="mt-3">
            For data deletion requests, privacy questions, or concerns, contact us at:{" "}
            <a
              href="mailto:privacy@getpaperedge.com"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              privacy@getpaperedge.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">8. Changes to This Policy</h2>
          <p className="mt-3">
            We may update this Privacy Policy from time to time. Changes will be posted on this page with
            an updated &quot;Last updated&quot; date. Continued use of the service after changes
            constitutes acceptance.
          </p>
        </section>
      </div>
    </div>
  );
}
