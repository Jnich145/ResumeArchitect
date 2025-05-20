import express, { RequestHandler } from 'express';
import {
  analyzeResume,
  analyzeResumeAdvanced,
  getAtsKeywords
} from '../controllers/atsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public ATS keyword endpoint
router.get('/keywords', getAtsKeywords as RequestHandler);

// Protected routes
router.use(authMiddleware as RequestHandler);

// ATS analysis routes
router.post('/analyze', analyzeResume as RequestHandler);
router.post('/analyze/advanced', analyzeResumeAdvanced as RequestHandler);

export default router; 