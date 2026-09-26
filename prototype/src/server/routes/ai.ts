import express, { RequestHandler } from 'express';
import {
  improveContent,
  generateBulletPoints,
  optimizeForATS,
  checkGrammar,
  getAIUsageStats,
  generateSuggestions
} from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All AI routes require authentication
router.use(authMiddleware as RequestHandler);

// AI content improvement routes
router.post('/improve', improveContent as RequestHandler);
router.post('/generate-bullets', generateBulletPoints as RequestHandler);
router.post('/ats-optimize', optimizeForATS as RequestHandler);
router.post('/grammar-check', checkGrammar as RequestHandler);
router.post('/suggest', generateSuggestions as RequestHandler);

// AI usage stats
router.get('/usage', getAIUsageStats as RequestHandler);

export default router; 