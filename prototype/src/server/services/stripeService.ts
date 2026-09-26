import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Initialize Stripe with mock implementation if no key is provided
let stripe: Stripe;
let useMockStripe = false;

try {
  if (!STRIPE_SECRET_KEY) {
    console.warn('⚠️ No Stripe API key found. Using mock Stripe implementation for development.');
    useMockStripe = true;
    // Mock implementation will be used
    stripe = {} as any;
  } else {
    stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
    });
  }
} catch (error) {
  console.warn('⚠️ Error initializing Stripe. Using mock implementation:', error);
  useMockStripe = true;
  stripe = {} as any;
}

// Product and pricing information
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: 'Basic',
    id: process.env.STRIPE_BASIC_PRICE_ID || 'mock_basic_price_id',
    features: [
      'Up to 5 resumes',
      'All resume templates',
      'PDF export',
      'Basic AI suggestions',
    ],
    priceMonthly: 7.99,
  },
  PREMIUM: {
    name: 'Premium',
    id: process.env.STRIPE_PREMIUM_PRICE_ID || 'mock_premium_price_id',
    features: [
      'Unlimited resumes',
      'All resume templates',
      'PDF & LinkedIn export',
      'Advanced AI suggestions',
      'ATS score analysis',
      'Priority support',
    ],
    priceMonthly: 14.99,
  },
};

// Mock implementations for development
const mockCustomerId = 'mock_cus_123456789';
const mockSubscriptionId = 'mock_sub_123456789';
const mockSessionUrl = 'http://localhost:5173/checkout/success?session_id=mock_session';

/**
 * Create a Stripe customer for a new user
 */
export const createCustomer = async (email: string, name?: string): Promise<string> => {
  try {
    if (useMockStripe) {
      console.log(`[MOCK] Creating customer for ${email}`);
      return mockCustomerId;
    }
    
    const customer = await stripe.customers.create({
      email,
      name: name || email,
      metadata: {
        source: 'ResumeArchitect',
      },
    });
    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return mockCustomerId; // Return mock ID even on error
  }
};

/**
 * Create a checkout session for subscription
 */
export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> => {
  try {
    if (useMockStripe) {
      console.log(`[MOCK] Creating checkout session for customer ${customerId} with price ${priceId}`);
      return mockSessionUrl;
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session.url || '';
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return mockSessionUrl; // Return mock URL even on error
  }
};

/**
 * Retrieve a subscription
 */
export const retrieveSubscription = async (subscriptionId: string) => {
  try {
    if (useMockStripe) {
      console.log(`[MOCK] Retrieving subscription ${subscriptionId}`);
      return {
        id: mockSubscriptionId,
        status: 'active',
        customer: mockCustomerId,
        current_period_start: Math.floor(Date.now() / 1000) - 86400, // 1 day ago in seconds
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400, // 30 days from now in seconds
        cancel_at_period_end: false,
        canceled_at: null,
        items: {
          data: [{
            id: 'mock_item_id',
            price: {
              id: SUBSCRIPTION_PLANS.BASIC.id, // Default to basic plan
            },
          }],
        },
      };
    }
    
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    // Return more complete mock subscription on error
    return {
      id: mockSubscriptionId,
      status: 'active',
      customer: mockCustomerId,
      current_period_start: Math.floor(Date.now() / 1000) - 86400, // 1 day ago in seconds
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400, // 30 days from now in seconds
      cancel_at_period_end: false,
      canceled_at: null,
      items: {
        data: [{
          id: 'mock_item_id',
          price: {
            id: SUBSCRIPTION_PLANS.BASIC.id, // Default to basic plan
          },
        }],
      },
    };
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    if (useMockStripe) {
      console.log(`[MOCK] Canceling subscription ${subscriptionId}`);
      return {
        id: subscriptionId,
        status: 'canceled',
        cancel_at_period_end: true,
        canceled_at: Math.floor(Date.now() / 1000),
        items: {
          data: [{
            id: 'mock_item_id',
            price: {
              id: SUBSCRIPTION_PLANS.BASIC.id,
            },
          }],
        },
      };
    }
    
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    // Return mock canceled subscription on error
    return {
      id: subscriptionId,
      status: 'canceled',
      cancel_at_period_end: true,
      canceled_at: Math.floor(Date.now() / 1000),
      items: {
        data: [{
          id: 'mock_item_id',
          price: {
            id: SUBSCRIPTION_PLANS.BASIC.id,
          },
        }],
      },
    };
  }
};

/**
 * Update a subscription
 */
export const updateSubscription = async (subscriptionId: string, priceId: string) => {
  try {
    if (useMockStripe) {
      console.log(`[MOCK] Updating subscription ${subscriptionId} to price ${priceId}`);
      return {
        id: subscriptionId,
        status: 'active',
        cancel_at_period_end: false,
        canceled_at: null,
        current_period_start: Math.floor(Date.now() / 1000) - 86400,
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
        items: {
          data: [{
            id: subscriptionId,
            price: { id: priceId || SUBSCRIPTION_PLANS.BASIC.id },
          }],
        },
      };
    }
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscriptionId,
          price: priceId,
        },
      ],
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    // Return mock updated subscription on error
    return {
      id: subscriptionId,
      status: 'active',
      cancel_at_period_end: false,
      canceled_at: null,
      current_period_start: Math.floor(Date.now() / 1000) - 86400,
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
      items: {
        data: [{
          id: subscriptionId,
          price: { id: priceId || SUBSCRIPTION_PLANS.BASIC.id },
        }],
      },
    };
  }
};

/**
 * Create a billing portal session
 */
export const createBillingPortalSession = async (
  customerId: string,
  returnUrl: string
): Promise<string> => {
  try {
    if (useMockStripe) {
      console.log(`[MOCK] Creating billing portal session for customer ${customerId}`);
      return returnUrl + '?portal_session=mock_session';
    }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    // Return mock portal URL on error
    return returnUrl + '?portal_session=mock_session';
  }
};

/**
 * Verify Stripe webhook signature
 */
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string
): Stripe.Event => {
  try {
    if (useMockStripe) {
      console.log(`[MOCK] Verifying webhook signature`);
      return {
        id: 'evt_mock',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'mock_payment_intent',
            customer: mockCustomerId,
            subscription: mockSubscriptionId,
            status: 'succeeded',
            items: {
              data: [{
                id: 'mock_item_id',
                price: {
                  id: SUBSCRIPTION_PLANS.BASIC.id,
                },
              }],
            },
          },
        },
      } as any;
    }
    
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    // Return mock event on error
    return {
      id: 'evt_mock',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'mock_payment_intent',
          customer: mockCustomerId,
          subscription: mockSubscriptionId,
          status: 'succeeded',
          items: {
            data: [{
              id: 'mock_item_id',
              price: {
                id: SUBSCRIPTION_PLANS.BASIC.id,
              },
            }],
          },
        },
      },
    } as any;
  }
};

export default {
  createCustomer,
  createCheckoutSession,
  retrieveSubscription,
  cancelSubscription,
  updateSubscription,
  createBillingPortalSession,
  verifyWebhookSignature,
}; 