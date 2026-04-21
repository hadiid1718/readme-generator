/**
 * Pricing Page
 * Displays Free vs Pro plan comparison with Paddle checkout integration
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, X, Loader2, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { paymentAPI } from '../lib/api';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out the tool',
    icon: <Zap className="w-6 h-6" />,
    cta: 'Get Started',
    popular: false,
    features: [
      { text: 'Modern & Minimal templates', included: true },
      { text: '5 exports per month', included: true },
      { text: 'Shields.io badges', included: true },
      { text: 'Live markdown preview', included: true },
      { text: 'Copy to clipboard', included: true },
      { text: 'Download as README.md', included: true },
      { text: 'Advanced Pro template', included: false },
      { text: 'Unlimited exports', included: false },
      { text: 'Custom sections', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$10',
    period: '/month',
    description: 'For serious developers & teams',
    icon: <Sparkles className="w-6 h-6" />,
    cta: 'Upgrade to Pro',
    popular: true,
    features: [
      { text: 'All free templates', included: true },
      { text: 'Unlimited exports', included: true },
      { text: 'Shields.io badges', included: true },
      { text: 'Live markdown preview', included: true },
      { text: 'Copy to clipboard', included: true },
      { text: 'Download as README.md', included: true },
      { text: 'Advanced Pro template', included: true },
      { text: 'Custom sections support', included: true },
      { text: 'Premium badge styles', included: true },
      { text: 'Priority support', included: true },
    ],
  },
];

const PricingPage = () => {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    if (user?.plan === 'pro') {
      toast.success('You are already on the Pro plan!');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentAPI.createCheckout();
      const { url } = response.data.data;
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const handleFreeClick = () => {
    if (isAuthenticated) {
      navigate('/generator');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, with a 2-day cancellation window.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative card p-8 ${
                plan.popular
                  ? 'border-primary-500/50 shadow-lg shadow-primary-600/10'
                  : ''
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-primary-500 to-blue-500 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Plan icon & name */}
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    plan.popular
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'bg-dark-700 text-dark-300'
                  }`}
                >
                  {plan.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-dark-400">{plan.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-dark-400 ml-1">{plan.period}</span>
              </div>

              {/* CTA */}
              <button
                onClick={plan.popular ? handleUpgrade : handleFreeClick}
                disabled={loading && plan.popular}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 mb-8 flex items-center justify-center space-x-2 ${
                  plan.popular
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {loading && plan.popular ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>{user?.plan === 'pro' && plan.popular ? 'Current Plan' : plan.cta}</span>
                )}
              </button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start space-x-3">
                    {feature.included ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-dark-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? 'text-dark-200' : 'text-dark-500'
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes. You can cancel within 2 days of subscribing from your dashboard subscription section.',
              },
              {
                q: 'What payment methods are accepted?',
                a: 'We accept major payment methods through Paddle. Payment details are handled securely by Paddle.',
              },
              {
                q: 'What happens when I reach the free tier limit?',
                a: 'On the free plan, you get 5 exports per month. The counter resets on the first of each month. Upgrade to Pro for unlimited exports.',
              },
              {
                q: 'Can I use the generated READMEs commercially?',
                a: 'Yes! All generated READMEs are yours to use however you like, for any project - personal, open source, or commercial.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="card group cursor-pointer"
              >
                <summary className="font-semibold text-white flex items-center justify-between">
                  {faq.q}
                  <span className="text-dark-400 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <p className="mt-3 text-dark-400 text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
