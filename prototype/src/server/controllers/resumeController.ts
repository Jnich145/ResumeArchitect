import { Request, Response, NextFunction } from 'express';
import mongoose, { SortOrder } from 'mongoose';
import Resume from '../models/Resume';

// Get all resumes for the current user
export const getResumes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Parse sort parameters
    const sortBy = (req.query.sortBy as string) || 'lastModified';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;
    const sortOptions: { [key: string]: SortOrder } = {};
    sortOptions[sortBy] = sortOrder;

    // Parse filter parameters
    const filter: Record<string, any> = { userId };
    
    if (req.query.template) {
      filter.template = req.query.template;
    }
    
    if (req.query.isPublic) {
      filter.isPublic = req.query.isPublic === 'true';
    }
    
    if (req.query.tags) {
      const tags = (req.query.tags as string).split(',');
      filter.tags = { $in: tags };
    }

    // Count total documents for pagination
    const totalResumes = await Resume.countDocuments(filter);
    
    // Get documents with pagination, sorting, and filtering
    const resumes = await Resume.find(filter)
      .select('name lastModified template isPublic slug createdAt stats tags templateSettings')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.json({ 
      resumes,
      pagination: {
        total: totalResumes,
        page,
        limit,
        pages: Math.ceil(totalResumes / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific resume by ID
export const getResumeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ resume });
  } catch (error) {
    next(error);
  }
};

// Create a new resume
export const createResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { name, data, template } = req.body;

    if (!data) {
      return res.status(400).json({ message: 'Resume data is required' });
    }

    // Create the resume
    const resume = new Resume({
      userId,
      name: name || 'My Resume',
      data,
      template: template || 'modern',
      lastModified: new Date(),
      isPublic: false
    });

    await resume.save();

    res.status(201).json({ 
      message: 'Resume created successfully',
      resume: {
        id: resume._id,
        name: resume.name,
        lastModified: resume.lastModified,
        template: resume.template
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a resume
export const updateResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;
    const { name, data, template, isPublic, createVersion } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }

    // Find the resume
    const resume = await Resume.findOne({ _id: resumeId, userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Update fields if provided
    if (name !== undefined) resume.name = name;
    if (data !== undefined) resume.data = data;
    if (template !== undefined) resume.template = template;
    if (isPublic !== undefined) resume.isPublic = isPublic;

    // Add a specific version note if requested
    if (createVersion && data) {
      // Deep copy the data to ensure it's a clean copy
      const versionData = JSON.parse(JSON.stringify(data));
      
      resume.versions.push({
        data: versionData,
        createdAt: new Date(),
        notes: createVersion === true ? 'Manual save' : createVersion
      });
      
      // Limit to 10 versions
      if (resume.versions.length > 10) {
        resume.versions.shift(); // Remove oldest version
      }
    }

    resume.lastModified = new Date();
    await resume.save();

    res.json({ 
      message: 'Resume updated successfully',
      resume: {
        id: resume._id,
        name: resume.name,
        lastModified: resume.lastModified,
        template: resume.template,
        isPublic: resume.isPublic,
        slug: resume.slug
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a resume
export const deleteResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }

    const result = await Resume.deleteOne({ _id: resumeId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all versions of a resume
export const getResumeVersions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId })
      .select('versions');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Return version metadata without the full data
    const versions = resume.versions.map((v, index) => ({
      id: index.toString(), // Use array index as ID for now
      createdAt: v.createdAt,
      notes: v.notes
    }));

    res.json({ versions });
  } catch (error) {
    next(error);
  }
};

// Get a specific version of a resume
export const getResumeVersion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { resumeId, versionId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Convert versionId to number and use as index instead of using .id() method
    const versionIndex = parseInt(versionId, 10);
    if (isNaN(versionIndex) || versionIndex < 0 || versionIndex >= resume.versions.length) {
      return res.status(404).json({ message: 'Version not found' });
    }

    const version = resume.versions[versionIndex];

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    res.json({ version });
  } catch (error) {
    next(error);
  }
};

// Restore a specific version
export const restoreResumeVersion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { resumeId, versionId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Convert versionId to number and use as index instead of using .id() method
    const versionIndex = parseInt(versionId, 10);
    if (isNaN(versionIndex) || versionIndex < 0 || versionIndex >= resume.versions.length) {
      return res.status(404).json({ message: 'Version not found' });
    }

    const version = resume.versions[versionIndex];

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    // Add current data as a version before replacing it
    resume.versions.push({
      data: JSON.parse(JSON.stringify(resume.data)),
      createdAt: new Date(),
      notes: 'Auto-saved before version restore'
    });

    // Limit to 10 versions
    if (resume.versions.length > 10) {
      resume.versions.shift(); // Remove oldest version
    }

    // Replace current data with version data
    resume.data = version.data;
    resume.lastModified = new Date();
    
    await resume.save();

    res.json({ 
      message: 'Resume version restored successfully',
      resume: {
        id: resume._id,
        name: resume.name,
        lastModified: resume.lastModified,
        data: resume.data
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a public resume by slug
export const getPublicResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const resume = await Resume.findOne({ slug, isPublic: true })
      .select('name data template userId createdAt lastModified templateSettings');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Record view - manually update instead of using method
    resume.stats.viewCount += 1;
    resume.stats.lastViewed = new Date();
    await resume.save();

    res.json({ resume });
  } catch (error) {
    next(error);
  }
};

// Record resume download
export const recordResumeDownload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resumeId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }
    
    const resume = await Resume.findById(resumeId);
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Check access permission
    const userId = req.userId;
    if (!resume.isPublic && (!userId || userId !== resume.userId.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Record download - manually update instead of using method
    resume.stats.downloadCount += 1;
    resume.stats.lastDownloaded = new Date();
    await resume.save();
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Update resume template settings
export const updateTemplateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;
    const { templateSettings } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }

    // Find the resume
    const resume = await Resume.findOne({ _id: resumeId, userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Update template settings
    resume.templateSettings = {
      ...resume.templateSettings,
      ...templateSettings
    };

    await resume.save();

    res.json({ 
      message: 'Template settings updated successfully',
      templateSettings: resume.templateSettings
    });
  } catch (error) {
    next(error);
  }
};

// Get popular templates
export const getPopularTemplates = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const popularTemplates = await Resume.aggregate([
      { $group: {
          _id: '$template',
          count: { $sum: 1 },
          downloads: { $sum: '$stats.downloadCount' },
          views: { $sum: '$stats.viewCount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({ popularTemplates });
  } catch (error) {
    next(error);
  }
}; 