import express, { Request, Response, NextFunction } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getMe
} from '../controllers/authController';
import {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  getResumeVersions,
  getResumeVersion,
  restoreResumeVersion,
  getPublicResume,
  recordResumeDownload,
  updateTemplateSettings,
  getPopularTemplates
} from '../controllers/resumeController';
import { authMiddleware, csrfMiddleware, roleMiddleware } from '../middleware/auth';
import subscriptionRoutes from './subscription';
import aiRoutes from './ai';
import atsRoutes from './ats';
import analyticsRoutes from './analytics';

const router = express.Router();

// Apply CSRF middleware to all routes
router.use(csrfMiddleware);

// Subscription routes
router.use('/subscription', subscriptionRoutes);

// AI routes
router.use('/ai', aiRoutes);

// ATS routes
router.use('/ats', atsRoutes);

// Analytics routes
router.use('/analytics', analyticsRoutes);

// Public routes
router.post('/auth/register', (req: Request, res: Response, next: NextFunction) => {
  register(req, res, next).catch(next);
});

router.post('/auth/login', (req: Request, res: Response, next: NextFunction) => {
  login(req, res, next).catch(next);
});

router.post('/auth/logout', (req: Request, res: Response) => {
  logout(req, res);
});

router.post('/auth/refresh-token', (req: Request, res: Response, next: NextFunction) => {
  refreshToken(req, res, next).catch(next);
});

router.post('/auth/password-reset/request', (req: Request, res: Response, next: NextFunction) => {
  requestPasswordReset(req, res, next).catch(next);
});

router.post('/auth/password-reset/reset', (req: Request, res: Response, next: NextFunction) => {
  resetPassword(req, res, next).catch(next);
});

router.get('/auth/verify-email/:token', (req: Request, res: Response, next: NextFunction) => {
  verifyEmail(req, res, next).catch(next);
});

router.post('/auth/resend-verification', (req: Request, res: Response, next: NextFunction) => {
  resendVerificationEmail(req, res, next).catch(next);
});

// Public resume route
router.get('/r/:slug', (req: Request, res: Response, next: NextFunction) => {
  getPublicResume(req, res, next).catch(next);
});

// Get popular templates (public)
router.get('/templates/popular', (req: Request, res: Response, next: NextFunction) => {
  getPopularTemplates(req, res, next).catch(next);
});

// Record download for public resume
router.post('/r/:resumeId/download', (req: Request, res: Response, next: NextFunction) => {
  recordResumeDownload(req, res, next).catch(next);
});

// Protected routes
router.use(authMiddleware as express.RequestHandler);

// User routes
router.get('/user/me', (req: Request, res: Response, next: NextFunction) => {
  getMe(req, res, next).catch(next);
});

// Basic resume routes
router.get('/resumes', (req: Request, res: Response, next: NextFunction) => {
  getResumes(req, res, next).catch(next);
});

router.get('/resumes/:resumeId', (req: Request, res: Response, next: NextFunction) => {
  getResumeById(req, res, next).catch(next);
});

router.post('/resumes', (req: Request, res: Response, next: NextFunction) => {
  createResume(req, res, next).catch(next);
});

router.put('/resumes/:resumeId', (req: Request, res: Response, next: NextFunction) => {
  updateResume(req, res, next).catch(next);
});

router.delete('/resumes/:resumeId', (req: Request, res: Response, next: NextFunction) => {
  deleteResume(req, res, next).catch(next);
});

// Resume version routes
router.get('/resumes/:resumeId/versions', (req: Request, res: Response, next: NextFunction) => {
  getResumeVersions(req, res, next).catch(next);
});

router.get('/resumes/:resumeId/versions/:versionId', (req: Request, res: Response, next: NextFunction) => {
  getResumeVersion(req, res, next).catch(next);
});

router.post('/resumes/:resumeId/versions/:versionId/restore', (req: Request, res: Response, next: NextFunction) => {
  restoreResumeVersion(req, res, next).catch(next);
});

// Update template settings
router.put('/resumes/:resumeId/template-settings', (req: Request, res: Response, next: NextFunction) => {
  updateTemplateSettings(req, res, next).catch(next);
});

// Record resume download (authenticated)
router.post('/resumes/:resumeId/download', (req: Request, res: Response, next: NextFunction) => {
  recordResumeDownload(req, res, next).catch(next);
});

// Admin routes (example)
router.get('/admin/users', 
  roleMiddleware(['admin']) as express.RequestHandler,
  (_req: Request, res: Response) => {
    res.json({ message: 'Admin access granted' });
  }
);

export default router;
