import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — PaperEdge",
  description: "Terms and conditions for using PaperEdge.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: June 13, 2025</p>

      <div className="mt-10 space-y-10 text-slate-300 leading-relaxed text-[15px]">
        <section>
          <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p className="mt-3">
            By accessing or using PaperEdge (the &quot;Service&quot;), including the website at
            getpaperedge.com and the associated Discord community, you agree to be bound by these Terms
            of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">2. Service Description</h2>
          <p className="mt-3">
            PaperEdge is an online community and software tool that provides market data analysis, swing
            trade signal scanning, and AI-powered market commentary. The Service includes a Discord bot,
            a web dashboard, and signal delivery via webhooks.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white text-amber-400">
            3. Not Financial Advice — Important Disclaimer
          </h2>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="font-medium text-amber-200">
              PaperEdge signals, scans, commentary, and all content provided through the Service are for{" "}
              <span className="underline">educational and informational purposes only</span>.
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-2 text-amber-100/80">
              <li>
                Nothing on this platform constitutes financial advice, investment advice, trading advice,
                or a recommendation to buy, sell, or hold any security.
              </li>
              <li>
                Past performance of any signal or strategy does not guarantee future results.
              </li>
              <li>
                You are solely responsible for your own investment decisions. Trading stocks involves
                risk, including the possible loss of principal.
              </li>
              <li>
                Always do your own research and consult a qualified financial advisor before making
                investment decisions.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">4. No Guarantees</h2>
          <p className="mt-3">
            The Service is provided <span className="text-white font-medium">&quot;as is&quot;</span> and{" "}
            <span className="text-white font-medium">&quot;as available&quot;</span> without warranties
            of any kind, whether express or implied. We do not guarantee:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>Uptime, availability, or uninterrupted access to the Service</li>
            <li>Accuracy, completeness, or timeliness of any market data or signals</li>
            <li>That signals will result in profitable trades</li>
            <li>That the Service will meet your specific requirements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">5. Prohibited Conduct</h2>
          <p className="mt-3">You agree not to:</p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>
              Use automated scripts, bots, or scrapers to extract data from the Service (except through
              officially provided APIs or bot commands)
            </li>
            <li>Abuse, overload, or interfere with the Discord bot or webhook infrastructure</li>
            <li>Redistribute, resell, or commercially exploit signal data without permission</li>
            <li>Impersonate others or misrepresent your affiliation with the Service</li>
            <li>Use the Service for any unlawful purpose</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">6. Subscriptions and Payments</h2>
          <p className="mt-3">
            Paid features are billed through Stripe. By subscribing, you agree to Stripe&apos;s terms of
            service. Subscriptions renew automatically unless cancelled. Refunds are handled on a
            case-by-case basis at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">7. Limitation of Liability</h2>
          <p className="mt-3">
            To the maximum extent permitted by applicable law, PaperEdge and its operators shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages, including
            but not limited to loss of profits, trading losses, data loss, or other intangible losses
            resulting from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">8. Termination</h2>
          <p className="mt-3">
            We reserve the right to suspend or terminate your access to the Service at any time, with or
            without notice, for conduct that we believe violates these Terms or is harmful to other users
            or the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">9. Governing Law</h2>
          <p className="mt-3">
            These Terms shall be governed by and construed in accordance with the laws of the Province of
            Ontario, Canada, without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">10. Changes to Terms</h2>
          <p className="mt-3">
            We may modify these Terms at any time. Changes will be posted on this page with an updated
            &quot;Last updated&quot; date. Continued use of the Service after changes constitutes
            acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">11. Contact</h2>
          <p className="mt-3">
            For questions about these Terms, contact us at:{" "}
            <a
              href="mailto:legal@getpaperedge.com"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              legal@getpaperedge.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
