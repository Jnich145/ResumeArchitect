import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  Unlock,
  Lock,
  Calendar
} from 'lucide-react';
import { 
  getSubscriptionPlans, 
  getUserSubscription, 
  createCheckoutSession, 
  createBillingPortalSession,
  cancelSubscription
} from '../services/subscriptionService';

interface SubscriptionManagementProps {
  userId: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  features: string[];
}

interface UserSubscription {
  id: string;
  plan: string;
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trial';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    loadSubscriptionData();
  }, [userId]);

  const loadSubscriptionData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load subscription plans
      const plansData = await getSubscriptionPlans();
      setPlans(plansData);
      
      // Load user's current subscription
      try {
        const userSubscription = await getUserSubscription();
        setSubscription(userSubscription);
      } catch (err) {
        // User might not have a subscription yet
        console.log('No subscription found, or error fetching subscription:', err);
        setSubscription(null);
      }
    } catch (err) {
      console.error('Failed to load subscription data:', err);
      setError((err as Error).message || 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    setIsActionLoading(true);
    setError(null);
    
    try {
      // Create checkout session
      const { url } = await createCheckoutSession(planId);
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err) {
      console.error('Failed to create checkout session:', err);
      setError((err as Error).message || 'Failed to start checkout process');
      setIsActionLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsActionLoading(true);
    setError(null);
    
    try {
      // Create billing portal session
      const { url } = await createBillingPortalSession();
      
      // Redirect to Stripe billing portal
      window.location.href = url;
    } catch (err) {
      console.error('Failed to create billing portal session:', err);
      setError((err as Error).message || 'Failed to access billing portal');
      setIsActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }
    
    setIsActionLoading(true);
    setError(null);
    
    try {
      await cancelSubscription();
      // Refresh subscription data
      await loadSubscriptionData();
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setError((err as Error).message || 'Failed to cancel subscription');
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'trial':
        return 'text-blue-500';
      case 'cancelled':
        return 'text-yellow-500';
      default:
        return 'text-red-500';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw size={40} className="mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-gray-500 dark:text-gray-400">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-10">
          <AlertTriangle size={40} className="mx-auto mb-4 text-red-500" />
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadSubscriptionData}
            className="btn-secondary"
            disabled={isActionLoading}
          >
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show current subscription if user has one
  if (subscription) {
    const currentPlan = plans.find(p => p.name.toLowerCase() === subscription.plan.toLowerCase());
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Your Subscription</h3>
        
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white">
                {subscription.plan} Plan
              </h4>
              <div className={`flex items-center mt-1 ${getStatusColor(subscription.status)}`}>
                {subscription.status === 'active' ? (
                  <Check size={16} className="mr-1" />
                ) : subscription.status === 'cancelled' ? (
                  <Clock size={16} className="mr-1" />
                ) : (
                  <AlertTriangle size={16} className="mr-1" />
                )}
                <span className="capitalize">{subscription.status}</span>
                {subscription.cancelAtPeriodEnd && (
                  <span className="ml-1">(Cancels at period end)</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                ${currentPlan?.priceMonthly.toFixed(2)}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
            <Calendar size={16} className="mr-2" />
            <span>
              Current period ends on {formatDate(subscription.currentPeriodEnd)}
            </span>
          </div>
          
          {/* Plan Features */}
          {currentPlan && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                Your Features:
              </h5>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check size={16} className="mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleManageSubscription}
              disabled={isActionLoading}
              className="btn-primary flex-1 flex justify-center items-center"
            >
              {isActionLoading ? (
                <RefreshCw size={18} className="mr-2 animate-spin" />
              ) : (
                <CreditCard size={18} className="mr-2" />
              )}
              Manage Billing
            </button>
            
            {!subscription.cancelAtPeriodEnd && subscription.status === 'active' && (
              <button
                onClick={handleCancelSubscription}
                disabled={isActionLoading}
                className="btn-secondary flex-1 flex justify-center items-center"
              >
                {isActionLoading ? (
                  <RefreshCw size={18} className="mr-2 animate-spin" />
                ) : (
                  <Clock size={18} className="mr-2" />
                )}
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
        
        {subscription.cancelAtPeriodEnd && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle size={20} className="text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                  Your subscription will end soon
                </h5>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  Your {subscription.plan} plan will end on {formatDate(subscription.currentPeriodEnd)}. 
                  To keep your premium features, resubscribe before this date.
                </p>
                <button
                  onClick={handleManageSubscription}
                  className="mt-3 text-sm bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-md inline-flex items-center"
                >
                  <Check size={14} className="mr-1" />
                  Renew Subscription
                </button>
              </div>
            </div>
          </div>
        )}
        
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mt-8 mb-4">Other Available Plans</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans
            .filter(plan => plan.name.toLowerCase() !== subscription.plan.toLowerCase())
            .map(plan => (
              <div 
                key={plan.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all hover:shadow-md"
              >
                <h5 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  {plan.name} Plan
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {plan.description || `Our ${plan.name.toLowerCase()} plan for individuals`}
                </p>
                <div className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  ${plan.priceMonthly.toFixed(2)}
                  <span className="text-sm font-normal text-gray-500">/month</span>
                </div>
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isActionLoading}
                  className="btn-secondary w-full text-sm"
                >
                  Switch to {plan.name}
                </button>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Show available plans if user doesn't have a subscription
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Subscription Plans</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Choose a plan to unlock advanced features and get the most out of your resumes.
      </p>
      
      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all hover:shadow-xl"
          >
            <div className="bg-gray-50 dark:bg-gray-750 p-6">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white">
                {plan.name} Plan
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
                {plan.description || `Our ${plan.name.toLowerCase()} plan for individuals`}
              </p>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                ${plan.priceMonthly.toFixed(2)}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check size={16} className="mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isActionLoading}
                className={`w-full py-3 rounded-md font-medium ${
                  plan.name.toLowerCase() === 'premium' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700' 
                    : 'btn-primary'
                }`}
              >
                {isActionLoading ? (
                  <RefreshCw size={18} className="inline mr-2 animate-spin" />
                ) : plan.name.toLowerCase() === 'premium' ? (
                  <Unlock size={18} className="inline mr-2" />
                ) : (
                  <CreditCard size={18} className="inline mr-2" />
                )}
                Select {plan.name}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Free plan info */}
      <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-6">
        <div className="flex items-start">
          <Lock size={20} className="mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
          <div>
            <h5 className="font-medium text-gray-800 dark:text-white mb-1">
              Currently on Free Plan
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              You're currently using the free version of ResumeArchitect. Upgrade to unlock advanced features like AI-powered suggestions, ATS score analysis, and more.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Free features include:
              <ul className="mt-2 space-y-1 ml-5 list-disc">
                <li>Basic resume builder</li>
                <li>Up to 3 resumes</li>
                <li>PDF export</li>
                <li>Limited template selection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement; 