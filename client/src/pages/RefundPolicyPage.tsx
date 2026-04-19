/**
 * Refund Policy Page
 */
const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Refund Policy</h1>
          <p className="text-dark-400 mb-8">Last updated: April 19, 2026</p>

          <div className="space-y-8 text-dark-200 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">1. Monthly Subscriptions</h2>
              <p>
                Subscription charges are billed in advance on a monthly basis. You may cancel at any
                time, and access remains active until the end of the current billing cycle.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">2. Eligibility for Refunds</h2>
              <p>
                Refund requests may be considered within 7 days of the initial charge for first-time
                subscribers when there is a verified billing issue or service failure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">3. Non-Refundable Cases</h2>
              <p>
                Partial month usage, renewals after the initial period, and charges caused by account
                misuse are generally non-refundable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">4. Request Process</h2>
              <p>
                To request a refund, contact support with your account email, payment date, and a short
                explanation. We will review and respond within 5 business days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">5. Payment Processor</h2>
              <p>
                Approved refunds are issued through the original payment method and may take additional
                processing time based on your bank or card provider.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
