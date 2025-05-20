import { Request, Response, NextFunction } from 'express';
import stripeService, { SUBSCRIPTION_PLANS } from '../services/stripeService';
import User from '../models/User';
import Subscription from '../models/Subscription';

// Get subscription plans
export const getSubscriptionPlans = async (_req: Request, res: Response) => {
  try {
    res.json({ plans: SUBSCRIPTION_PLANS });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription plans' });
  }
};

// Get current user's subscription details
export const getUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.json({ 
        subscription: null,
        message: 'No active subscription found'
      });
    }

    res.json({ subscription });
  } catch (error) {
    next(error);
  }
};

// Create checkout session for subscription
export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ message: 'Price ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user doesn't have a Stripe customer ID, create one
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      stripeCustomerId = await stripeService.createCustomer(user.email, user.name || undefined);
      
      // Update user with Stripe customer ID
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    // Create a checkout session
    const clientDomain = process.env.CLIENT_URL || 'http://localhost:5174';
    const successUrl = `${clientDomain}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${clientDomain}/subscription/cancel`;

    const checkoutUrl = await stripeService.createCheckoutSession(
      stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl
    );

    res.json({ url: checkoutUrl });
  } catch (error) {
    next(error);
  }
};

// Create billing portal session
export const createBillingPortalSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ message: 'No billing information found' });
    }

    const clientDomain = process.env.CLIENT_URL || 'http://localhost:5174';
    const returnUrl = `${clientDomain}/profile`;

    const portalUrl = await stripeService.createBillingPortalSession(
      user.stripeCustomerId,
      returnUrl
    );

    res.json({ url: portalUrl });
  } catch (error) {
    next(error);
  }
};

// Cancel subscription
export const cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Cancel at period end rather than immediately
    await stripeService.updateSubscription(
      subscription.stripeSubscriptionId,
      subscription.plan === 'premium' 
        ? SUBSCRIPTION_PLANS.BASIC.id 
        : subscription.plan === 'basic'
          ? '' // Free plan has no Stripe product
          : ''
    );

    subscription.cancelAtPeriodEnd = true;
    subscription.canceledAt = new Date();
    await subscription.save();

    res.json({ 
      message: 'Subscription canceled successfully. You will have access until the end of your billing period.',
      endDate: subscription.currentPeriodEnd
    });
  } catch (error) {
    next(error);
  }
};

// Webhook handler for Stripe events
export const handleWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ message: 'Missing Stripe signature' });
  }

  try {
    const event = stripeService.verifyWebhookSignature(req.body, signature);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: 'Webhook error' });
  }
};

// Helper functions for webhook events
async function handleCheckoutSessionCompleted(session: any) {
  try {
    const stripeCustomerId = session.customer;
    const subscriptionId = session.subscription;

    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId });
    if (!user) {
      throw new Error('User not found for Stripe customer');
    }

    // Get subscription details from Stripe
    const stripeSubscription = await stripeService.retrieveSubscription(subscriptionId);

    // Determine plan from price ID
    let plan: 'free' | 'basic' | 'premium' = 'free';
    if (stripeSubscription.items.data[0].price.id === SUBSCRIPTION_PLANS.BASIC.id) {
      plan = 'basic';
    } else if (stripeSubscription.items.data[0].price.id === SUBSCRIPTION_PLANS.PREMIUM.id) {
      plan = 'premium';
    }

    // Check if user already has a subscription
    let subscription = await Subscription.findOne({ userId: user._id });

    if (subscription) {
      // Update existing subscription
      subscription.stripeSubscriptionId = subscriptionId;
      subscription.plan = plan;
      subscription.status = stripeSubscription.status as any;
      subscription.currentPeriodStart = new Date((stripeSubscription as any).current_period_start * 1000);
      subscription.currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);
      subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
      subscription.canceledAt = stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : undefined;
      
      // Update features based on plan
      subscription.features = plan === 'premium' 
        ? ['unlimited_resumes', 'all_templates', 'pdf_export', 'linkedin_export', 'advanced_ai', 'ats_score', 'priority_support']
        : plan === 'basic'
          ? ['limited_resumes', 'all_templates', 'pdf_export', 'basic_ai']
          : ['limited_resumes', 'basic_templates', 'pdf_export'];
    } else {
      // Create new subscription
      subscription = new Subscription({
        userId: user._id,
        stripeCustomerId,
        stripeSubscriptionId: subscriptionId,
        plan,
        status: stripeSubscription.status,
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        features: plan === 'premium' 
          ? ['unlimited_resumes', 'all_templates', 'pdf_export', 'linkedin_export', 'advanced_ai', 'ats_score', 'priority_support']
          : plan === 'basic'
            ? ['limited_resumes', 'all_templates', 'pdf_export', 'basic_ai']
            : ['limited_resumes', 'basic_templates', 'pdf_export']
      });
    }

    await subscription.save();

    // Update user's subscription info
    user.subscription = {
      tier: plan,
      status: stripeSubscription.status as any,
      startDate: new Date((stripeSubscription as any).current_period_start * 1000),
      endDate: new Date((stripeSubscription as any).current_period_end * 1000)
    };
    await user.save();

  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    // Find subscription by Stripe subscription ID
    const existingSubscription = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (!existingSubscription) {
      console.error('Subscription not found for update:', subscription.id);
      return;
    }

    // Determine plan from price ID
    let plan: 'free' | 'basic' | 'premium' = 'free';
    if (subscription.items.data[0].price.id === SUBSCRIPTION_PLANS.BASIC.id) {
      plan = 'basic';
    } else if (subscription.items.data[0].price.id === SUBSCRIPTION_PLANS.PREMIUM.id) {
      plan = 'premium';
    }

    // Update subscription details
    existingSubscription.plan = plan;
    existingSubscription.status = subscription.status;
    existingSubscription.currentPeriodStart = new Date((subscription as any).current_period_start * 1000);
    existingSubscription.currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
    existingSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    existingSubscription.canceledAt = subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : undefined;

    // Update features based on plan
    existingSubscription.features = plan === 'premium' 
      ? ['unlimited_resumes', 'all_templates', 'pdf_export', 'linkedin_export', 'advanced_ai', 'ats_score', 'priority_support']
      : plan === 'basic'
        ? ['limited_resumes', 'all_templates', 'pdf_export', 'basic_ai']
        : ['limited_resumes', 'basic_templates', 'pdf_export'];

    await existingSubscription.save();

  } catch (error) {
    console.error('Error handling customer.subscription.updated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    // Find subscription by Stripe subscription ID
    const existingSubscription = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (!existingSubscription) {
      console.error('Subscription not found for deletion:', subscription.id);
      return;
    }

    // Update subscription status to canceled
    existingSubscription.status = 'canceled';
    existingSubscription.canceledAt = new Date();
    
    // Update features to free tier
    existingSubscription.features = ['limited_resumes', 'basic_templates', 'pdf_export'];
    
    await existingSubscription.save();

    // Update user's subscription info
    const user = await User.findById(existingSubscription.userId);
    if (user) {
      user.subscription = {
        tier: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years in the future
      };
      await user.save();
    }

  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error);
    throw error;
  }
} 