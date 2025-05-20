import { Request, Response } from 'express';
import mongoose from 'mongoose';
import aiService from '../services/aiService';
import User from '../models/User';

// Helper to get user subscription tier
const getUserTier = async (userId: string): Promise<'free' | 'basic' | 'premium'> => {
  // Always return premium in development mode to bypass tier restrictions
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Treating user ${userId} as premium tier for AI features`);
    return 'premium';
  }
  
  const user = await User.findById(userId);
  if (!user) {
    return 'free';
  }
  return (user.subscription?.tier || 'free') as 'free' | 'basic' | 'premium';
};

// Improve resume content (summary or bullet point)
export const improveContent = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { content, contentType } = req.body;
    
    if (!content || !contentType) {
      return res.status(400).json({ message: 'Content and content type are required' });
    }
    
    // In development mode, allow all content types
    if (process.env.NODE_ENV !== 'development' && 
        !['summary', 'bullet_point', 'company', 'position', 'institution', 
          'degree', 'field_of_study', 'skill'].includes(contentType)) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    // Get user subscription tier
    const userTier = await getUserTier(userId);
    
    try {
      // Call AI service to improve content
      const improvedContent = await aiService.improveContent(
        userId,
        userTier,
        content,
        contentType as any
      );
      
      res.json({ improvedContent });
    } catch (error: any) {
      // Handle specific AI service errors differently
      if (error.message?.includes('Monthly AI usage limit reached')) {
        return res.status(403).json({ 
          message: 'Monthly AI usage limit reached',
          upgradeRequired: true
        });
      }
      throw error; // Re-throw other errors to be caught by outer catch
    }
  } catch (error: any) {
    console.error('Error in improveContent controller:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      message: error.message || 'Failed to improve content',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// Generate bullet points from job information
export const generateBulletPoints = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { jobTitle, company, industry, responsibilities } = req.body;
    
    if (!jobTitle || !responsibilities) {
      return res.status(400).json({ message: 'Job title and responsibilities are required' });
    }

    // Get user subscription tier
    const userTier = await getUserTier(userId);
    
    // Call AI service to generate bullet points
    const bulletPoints = await aiService.generateBulletPoints(
      userId,
      userTier,
      {
        jobTitle,
        company: company || '',
        industry: industry || '',
        responsibilities
      }
    );
    
    res.json({ bulletPoints });
  } catch (error: any) {
    console.error('Error generating bullet points:', error);
    
    if (error.message?.includes('Monthly AI usage limit reached')) {
      return res.status(403).json({ 
        message: 'Monthly AI usage limit reached',
        upgradeRequired: true
      });
    }
    
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      message: error.message || 'Failed to generate bullet points',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// Generate suggestions for resume based on resume data and job description
export const generateSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { resumeData, jobDescription } = req.body;
    
    if (!resumeData) {
      return res.status(400).json({ message: 'Resume data is required' });
    }

    // Get user subscription tier
    const userTier = await getUserTier(userId);
    
    // Use the OpenAI integration through our AI service
    const usesJobDescription = jobDescription ? 'with job description targeting' : 'general';
    console.log(`Generating ${usesJobDescription} suggestions for user with tier: ${userTier}`);
    
    // Call the AI service for suggestions
    const result = await aiService.generateResumeSuggestions(
      userId,
      userTier,
      resumeData,
      jobDescription
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Error generating resume suggestions:', error);
    
    if (error.message?.includes('Monthly AI usage limit reached')) {
      return res.status(403).json({ 
        message: 'Monthly AI usage limit reached',
        upgradeRequired: true
      });
    }
    
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      message: error.message || 'Failed to generate suggestions',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// Optimize resume for ATS based on job description
export const optimizeForATS = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { resumeContent, jobDescription } = req.body;
    
    if (!resumeContent || !jobDescription) {
      return res.status(400).json({ message: 'Resume content and job description are required' });
    }

    // Get user subscription tier
    const userTier = await getUserTier(userId);
    
    // Call AI service for ATS optimization
    const result = await aiService.optimizeForATS(
      userId,
      userTier,
      resumeContent,
      jobDescription
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Error optimizing for ATS:', error);
    
    if (error.message?.includes('ATS optimization is a premium feature')) {
      return res.status(403).json({ 
        message: 'ATS optimization is only available on the premium plan',
        upgradeRequired: true
      });
    }
    
    if (error.message?.includes('Monthly AI usage limit reached')) {
      return res.status(403).json({ 
        message: 'Monthly AI usage limit reached',
        upgradeRequired: true
      });
    }
    
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      message: error.message || 'Failed to optimize for ATS',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// Check grammar and spelling
export const checkGrammar = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Get user subscription tier
    const userTier = await getUserTier(userId);
    
    // Call AI service for grammar checking
    const result = await aiService.checkGrammar(
      userId,
      userTier,
      content
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Error checking grammar:', error);
    
    if (error.message?.includes('Grammar checking is not available')) {
      return res.status(403).json({ 
        message: 'Grammar checking is not available on the free tier',
        upgradeRequired: true
      });
    }
    
    if (error.message?.includes('Monthly AI usage limit reached')) {
      return res.status(403).json({ 
        message: 'Monthly AI usage limit reached',
        upgradeRequired: true
      });
    }
    
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      message: error.message || 'Failed to check grammar',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// Get AI usage statistics for the current user
export const getAIUsageStats = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get user subscription tier
    const userTier = await getUserTier(userId);
    
    // Get usage limits based on tier
    const limits = {
      free: 5,
      basic: 50,
      premium: 200
    };
    
    const limit = limits[userTier];
    
    // Get actual usage from database
    const AIUsage = mongoose.model('AIUsage');
    const usage = await AIUsage.findOne({ userId });
    
    const monthlyUsage = usage?.monthlyUsage || 0;
    const resetDate = usage?.monthlyReset || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    
    res.json({
      tier: userTier,
      monthlyUsage,
      limit,
      remaining: Math.max(0, limit - monthlyUsage),
      resetDate,
      percentUsed: Math.round((monthlyUsage / limit) * 100)
    });
  } catch (error: any) {
    console.error('Error fetching AI usage stats:', error);
    
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      message: error.message || 'Failed to fetch AI usage statistics',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}; 