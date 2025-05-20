import { Request, Response, NextFunction } from 'express';
import analyticsService from '../services/analyticsService';
import Resume from '../models/Resume';
import mongoose from 'mongoose';

// Get analytics for a specific resume
export const getResumeAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }

    // Check if resume belongs to the user
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Get analytics
    const analytics = await analyticsService.getResumeAnalytics(resumeId);
    
    res.json({ analytics });
  } catch (error) {
    next(error);
  }
};

// Get aggregate analytics for all of a user's resumes
export const getUserAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get user analytics
    const analytics = await analyticsService.getUserAnalytics(userId);
    
    res.json({ analytics });
  } catch (error) {
    next(error);
  }
};

// Get popular templates (admin only)
export const getPopularTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const user = req.user;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }

    // Get popular templates
    const templates = await analyticsService.getPopularTemplates();
    
    res.json({ templates });
  } catch (error) {
    next(error);
  }
}; 