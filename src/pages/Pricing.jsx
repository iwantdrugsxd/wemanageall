import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  // Ensure Razorpay is loaded
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Filter to only show free, starter, premium plans
        const visiblePlans = data.plans.filter(p => ['free', 'starter', 'premium'].includes(p.id));
        // Ensure order: Free → Starter → Premium
        const orderedPlans = ['free', 'starter', 'premium']
          .map(id => visiblePlans.find(p => p.id === id))
          .filter(Boolean);
        setPlans(orderedPlans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/current', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async (planId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSelectedPlan(planId);

    try {
      const response = await fetch('/api/subscriptions/start-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planType: planId,
          seats: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('7-day trial started! Enjoy full access.');
        // Refresh subscription and redirect
        await fetchCurrentSubscription();
        navigate('/dashboard');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start trial');
      }
    } catch (error) {
      console.error('Start trial error:', error);
      alert('Network error. Please try again.');
    } finally {
      setSelectedPlan(null);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSelectedPlan(planId);

    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planType: planId,
          billingCycle: billingCycle,
          seats: 1,
          organizationId: null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        initiateRazorpayPayment(data);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create subscription');
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      alert('Network error. Please try again.');
      setSelectedPlan(null);
    }
  };

  const initiateRazorpayPayment = (subscriptionData) => {
    // Safety check: Ensure Razorpay is loaded
    if (!window.Razorpay) {
      alert('Payment system is still loading, please try again in a moment.');
      setSelectedPlan(null);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
      subscription_id: subscriptionData.razorpay.subscriptionId,
      name: 'OFA Platform',
      description: `${subscriptionData.subscription.plan_type} Subscription`,
      amount: subscriptionData.razorpay.amountInPaise,
      currency: 'INR',
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#000000',
      },
      handler: async function (response) {
        // Payment successful
        await handlePaymentSuccess(response, subscriptionData);
      },
      modal: {
        ondismiss: function () {
          // User closed the payment modal
          setSelectedPlan(null);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handlePaymentSuccess = async (razorpayResponse, subscriptionData) => {
    try {
      // Update subscription status
      await fetchCurrentSubscription();
      alert('Subscription activated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Payment success handler error:', error);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString()}`;
  };

  const formatStorage = (storageMB) => {
    if (storageMB === -1) return 'Unlimited';
    if (storageMB < 1024) return `${storageMB} MB`;
    const gb = (storageMB / 1024).toFixed(1);
    return gb.endsWith('.0') ? `${parseInt(gb)} GB` : `${gb} GB`;
  };

  const getCurrentPlan = () => {
    if (!currentSubscription) return null;
    return plans.find(p => p.id === currentSubscription.plan_type);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-gray-600 text-lg mb-8">Start free, upgrade when you need more</p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-14 h-8 bg-gray-200 rounded-full transition-colors"
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  billingCycle === 'annual' ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'annual' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Annual
              <span className="ml-2 text-xs text-green-600">(Save 17%)</span>
            </span>
          </div>
        </div>

        {/* Current Subscription Banner */}
        {currentPlan && currentSubscription.status === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-green-800">
              You're currently on the <strong>{currentPlan.name}</strong> plan
            </p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan && currentPlan.id === plan.id;
            const price = billingCycle === 'annual' && plan.priceAnnual ? plan.priceAnnual : plan.price;
            const monthlyPrice = billingCycle === 'annual' && plan.priceAnnual 
              ? (plan.priceAnnual / 12).toFixed(0) 
              : plan.price;

            return (
              <div
                key={plan.id}
                className={`bg-white border rounded-lg p-6 relative ${
                  plan.id === 'premium'
                    ? 'border-gray-900 border-2 shadow-lg'
                    : 'border-gray-200'
                }`}
              >
                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <div>
                      <span className="text-3xl font-light text-gray-900">
                        {formatPrice(monthlyPrice)}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">/month</span>
                    </div>
                    {billingCycle === 'annual' && plan.priceAnnual && (
                      <p className="text-xs text-gray-500 mt-1">
                        Billed annually: {formatPrice(plan.priceAnnual)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {plan.features.projects === -1 ? 'Unlimited' : plan.features.projects} Projects
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {plan.features.calendarEvents === -1 ? 'Unlimited' : plan.features.calendarEvents} Calendar Events
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      Library storage: {formatStorage(plan.features.storage)}
                    </span>
                  </li>
                  {plan.features.analytics ? (
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Analytics / Insights</span>
                    </li>
                  ) : (
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm text-gray-400">Analytics / Insights: Off</span>
                    </li>
                  )}
                  {plan.features.integrations ? (
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Integrations</span>
                    </li>
                  ) : (
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm text-gray-400">Integrations: Off</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700 capitalize">Support: {plan.features.support}</span>
                  </li>
                </ul>

                {/* CTA Buttons */}
                {isCurrentPlan && (currentSubscription.status === 'active' || currentSubscription.status === 'trial') ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    {currentSubscription.status === 'trial' ? 'Trial Active' : 'Current Plan'}
                  </button>
                ) : plan.id === 'free' ? (
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Get Started
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleStartTrial(plan.id)}
                      disabled={selectedPlan === plan.id}
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      {selectedPlan === plan.id ? 'Processing...' : 'Start 7-Day Trial'}
                    </button>
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={selectedPlan === plan.id}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                    >
                      {selectedPlan === plan.id ? 'Processing...' : 'Subscribe'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-light text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-sm text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-gray-600">We accept all major credit cards, debit cards, UPI, and net banking through Razorpay.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-sm text-gray-600">The Free plan is available forever. Paid plans (Starter and Premium) include a 7-day free trial.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
