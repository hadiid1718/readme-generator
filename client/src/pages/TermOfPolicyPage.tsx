/**
 * Term Of Policy Page
 */
const TermOfPolicyPage = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Term of Policy</h1>
          <p className="text-dark-400 mb-8">Last updated: April 19, 2026</p>

          <div className="space-y-8 text-dark-200 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">1. Information We Collect</h2>
              <p>
                We collect account data, usage analytics, and request metadata needed to operate,
                secure, and improve the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">2. How We Use Information</h2>
              <p>
                Data is used to provide features, authenticate users, process payments, prevent abuse,
                and communicate essential updates.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">3. Data Sharing</h2>
              <p>
                We do not sell personal information. We may share data with trusted providers for
                payment, hosting, analytics, and support.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">4. Data Security</h2>
              <p>
                We use reasonable safeguards to protect your data, but no method of transmission or
                storage is completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">5. Data Retention</h2>
              <p>
                We retain data as long as necessary to provide services, meet legal obligations, and
                resolve disputes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">6. Your Rights</h2>
              <p>
                You can request access, correction, or deletion of your personal data, subject to
                applicable law and operational requirements.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermOfPolicyPage;
