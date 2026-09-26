import express, { RequestHandler } from 'express';
import {
  getSubscriptionPlans,
  getUserSubscription,
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscription,
  handleWebhook
} from '../controllers/subscriptionController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public endpoints
router.get('/plans', getSubscriptionPlans as RequestHandler);

// Handle Stripe webhooks - raw body required for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }) as unknown as RequestHandler, handleWebhook as RequestHandler);

// Protected endpoints
router.use(authMiddleware as RequestHandler);

router.get('/my-subscription', getUserSubscription as RequestHandler);
router.post('/checkout', createCheckoutSession as RequestHandler);
router.post('/billing-portal', createBillingPortalSession as RequestHandler);
router.post('/cancel', cancelSubscription as RequestHandler);

export default router; 