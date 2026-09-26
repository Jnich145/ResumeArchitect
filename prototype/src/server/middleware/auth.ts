import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
      refreshToken?: string;
      csrfToken?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Bypass authentication in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEV] Bypassing authentication for development');
    req.userId = 'dev-user-id';
    return next();
  }
  
  try {
    // Check for token in cookies or authorization header
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    req.userId = (decoded as any).userId;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Optional middleware to verify if the user has the required role
export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    
    next();
  };
};

// Middleware to generate CSRF token
export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Generate a random token if one doesn't exist
  if (!req.cookies?.csrfToken) {
    const token = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
    
    res.cookie('csrfToken', token, {
      httpOnly: false, // Client-side JavaScript needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    req.csrfToken = token;
  } else {
    req.csrfToken = req.cookies.csrfToken;
  }
  
  next();
};

