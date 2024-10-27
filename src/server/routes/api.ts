import express, { Request, Response, NextFunction } from 'express';
import { register, login } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', (req: Request, res: Response, next: NextFunction) => {
  register(req, res, next).catch(next);
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  login(req, res, next).catch(next);
});

// Protected routes
router.use(authMiddleware);

router.get('/protected', (req: Request, res: Response) => {
  res.json({ message: 'This is a protected route', userId: req.userId });
});

// Add more protected routes here

export default router;
