/**
 * Terms Of Service Page
 */
const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-dark-400 mb-8">Last updated: April 19, 2026</p>

          <div className="space-y-8 text-dark-200 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">1. Acceptance of Terms</h2>
              <p>
                By using README Generator Pro, you agree to these Terms of Service. If you do not
                agree, please do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">2. Accounts and Access</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and for all
                activities performed through your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">3. Acceptable Use</h2>
              <p>
                You may not use the service for unlawful activity, abuse, or attempts to disrupt the
                platform or other users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">4. Subscription and Billing</h2>
              <p>
                Paid plans are billed through third-party payment providers. Pricing and available
                features may change with notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">5. Intellectual Property</h2>
              <p>
                The platform, design, and software are owned by README Generator Pro. You retain
                ownership of content you create using the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">6. Limitation of Liability</h2>
              <p>
                The service is provided on an as-is and as-available basis. To the extent permitted by
                law, we are not liable for indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">7. Changes to Terms</h2>
              <p>
                We may update these terms from time to time. Continued use after updates means you
                accept the revised terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
