import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import atsService from '../services/atsService';

// Helper to get user subscription tier
const getUserTier = async (userId: string): Promise<'free' | 'basic' | 'premium'> => {
  const user = await User.findById(userId);
  if (!user) {
    return 'free';
  }
  return (user.subscription?.tier || 'free') as 'free' | 'basic' | 'premium';
};

// Basic ATS analysis (available to all users)
export const analyzeResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { resumeContent, jobDescription } = req.body;
    
    if (!resumeContent) {
      return res.status(400).json({ message: 'Resume content is required' });
    }

    // Get basic ATS analysis (no AI)
    const result = atsService.basicAnalysis(resumeContent, jobDescription);
    
    // Get user tier to send appropriate response
    const userTier = await getUserTier(userId);
    
    res.json({
      ...result,
      // Let the client know if they can access advanced features
      canAccessAdvanced: userTier === 'premium',
      tier: userTier
    });
  } catch (error) {
    next(error);
  }
};

// Advanced ATS analysis with AI (premium only)
export const analyzeResumeAdvanced = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { resumeContent, jobDescription } = req.body;
    
    if (!resumeContent || !jobDescription) {
      return res.status(400).json({ 
        message: 'Both resume content and job description are required for advanced analysis' 
      });
    }

    // Get user tier
    const userTier = await getUserTier(userId);
    
    // Check if user has premium access
    if (userTier !== 'premium') {
      return res.status(403).json({ 
        message: 'Advanced ATS analysis is a premium feature',
        upgradeRequired: true,
        currentTier: userTier
      });
    }
    
    // Get advanced analysis
    const result = await atsService.advancedAnalysis(
      userId,
      resumeContent,
      jobDescription
    );
    
    res.json({
      ...result,
      tier: userTier
    });
  } catch (error) {
    next(error);
  }
};

// Get common ATS keywords by category
export const getAtsKeywords = async (_req: Request, res: Response) => {
  try {
    // This is a simple endpoint that returns predefined keywords
    // In a production environment, this might be dynamic based on industry or job type
    const keywords = {
      skills: [
        'problem solving', 'communication', 'teamwork', 'leadership',
        'time management', 'organization', 'adaptability', 'creativity'
      ],
      technical: [
        'JavaScript', 'React', 'Node.js', 'HTML/CSS', 'SQL',
        'Python', 'Java', 'AWS', 'Docker', 'Git'
      ],
      actionVerbs: [
        'achieved', 'built', 'created', 'developed', 'implemented',
        'improved', 'increased', 'launched', 'managed', 'reduced'
      ]
    };
    
    res.json({ keywords });
  } catch (error) {
    console.error('Error fetching ATS keywords:', error);
    res.status(500).json({ message: 'Error fetching ATS keywords' });
  }
}; 