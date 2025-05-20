const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get CSRF token from localStorage
const getCsrfToken = (): string => {
  return localStorage.getItem('csrfToken') || '';
};

// Generic fetch function with error handling
const fetchApi = async <T>(url: string, method: string, data?: any): Promise<T> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken(),
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Subscription API request error:', error);
    throw error;
  }
};

// Get available subscription plans
export const getSubscriptionPlans = async (): Promise<{
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  features: string[];
}[]> => {
  return fetchApi(`${API_URL}/subscription/plans`, 'GET');
};

// Get current user's subscription
export const getUserSubscription = async (): Promise<{
  id: string;
  plan: string;
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trial';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}> => {
  return fetchApi(`${API_URL}/subscription/my-subscription`, 'GET');
};

// Create a checkout session for a subscription
export const createCheckoutSession = async (
  priceId: string
): Promise<{ url: string }> => {
  return fetchApi(
    `${API_URL}/subscription/checkout`, 
    'POST',
    { priceId }
  );
};

// Create a billing portal session
export const createBillingPortalSession = async (): Promise<{ url: string }> => {
  return fetchApi(`${API_URL}/subscription/billing-portal`, 'POST');
};

// Cancel subscription
export const cancelSubscription = async (): Promise<{ success: boolean }> => {
  return fetchApi(`${API_URL}/subscription/cancel`, 'POST');
};

export default {
  getSubscriptionPlans,
  getUserSubscription,
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscription
}; 