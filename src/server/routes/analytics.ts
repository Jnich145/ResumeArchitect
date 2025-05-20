import express, { RequestHandler } from 'express';
import {
  getResumeAnalytics,
  getUserAnalytics,
  getPopularTemplates
} from '../controllers/analyticsController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = express.Router();

// All analytics routes require authentication
router.use(authMiddleware as RequestHandler);

// Get analytics for a specific resume
router.get('/resume/:resumeId', getResumeAnalytics as RequestHandler);

// Get aggregate analytics for all user resumes
router.get('/user', getUserAnalytics as RequestHandler);

// Admin-only route - get popular templates analytics
router.get('/templates/popular', roleMiddleware(['admin']) as RequestHandler, getPopularTemplates as RequestHandler);

export default router; 