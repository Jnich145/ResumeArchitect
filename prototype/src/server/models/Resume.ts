import mongoose, { Schema, Document } from 'mongoose';

// Resume schema type definition
export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  data: any; // Storing resume data as a JSON object
  versions: {
    data: any;
    createdAt: Date;
    notes: string;
  }[];
  lastModified: Date;
  isPublic: boolean;
  slug: string;
  template: string;
  createdAt: Date;
  templateSettings: {
    fontFamily?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontSize?: string;
    spacing?: string;
    showPhoto?: boolean;
    layout?: 'standard' | 'compact' | 'expanded';
    [key: string]: any; // Allow for additional template-specific settings
  };
  stats: {
    viewCount: number;
    downloadCount: number;
    lastViewed?: Date;
    lastDownloaded?: Date;
  };
  tags: string[]; // For categorizing and filtering resumes
}

const ResumeSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    default: 'My Resume'
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  versions: [{
    data: Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  lastModified: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  template: {
    type: String,
    default: 'modern',
    index: true // Add index for faster queries when filtering by template
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  templateSettings: {
    fontFamily: String,
    primaryColor: String,
    secondaryColor: String,
    fontSize: String,
    spacing: String,
    showPhoto: Boolean,
    layout: {
      type: String,
      enum: ['standard', 'compact', 'expanded'],
      default: 'standard'
    }
  },
  stats: {
    viewCount: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    lastDownloaded: Date
  },
  tags: [{
    type: String
  }]
});

// Pre-save hook to manage versioning
ResumeSchema.pre('save', function(this: IResume, next) {
  // Update lastModified date
  this.lastModified = new Date();
  
  // If this is an update (not a new document)
  if (!this.isNew) {
    // Find the latest version
    const latestVersion = this.versions && this.versions.length > 0 
      ? this.versions[this.versions.length - 1].data 
      : null;

    // Only add new version if data has changed from the latest version
    if (!latestVersion || JSON.stringify(this.data) !== JSON.stringify(latestVersion)) {
      // Keep max 10 versions by default
      if (this.versions.length >= 10) {
        this.versions.shift(); // Remove oldest version
      }
      
      // Add current data as a new version
      this.versions.push({
        data: JSON.parse(JSON.stringify(this.data)), // Create a clean copy
        createdAt: new Date(),
        notes: 'Auto-saved version'
      });
    }
  } else {
    // Initialize versions array with current data for new documents
    this.versions = [{
      data: JSON.parse(JSON.stringify(this.data)),
      createdAt: new Date(),
      notes: 'Initial version'
    }];
  }
  
  next();
});

// Generate a unique slug if resume is public
ResumeSchema.pre('save', async function(this: IResume, next) {
  if (this.isPublic && !this.slug) {
    const base = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
      
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    this.slug = `${base}-${randomSuffix}`;
  }
  
  next();
});

// Methods to update analytics
ResumeSchema.methods.recordView = async function() {
  this.stats.viewCount += 1;
  this.stats.lastViewed = new Date();
  return this.save();
};

ResumeSchema.methods.recordDownload = async function() {
  this.stats.downloadCount += 1;
  this.stats.lastDownloaded = new Date();
  return this.save();
};

// Static method to get popular templates
ResumeSchema.statics.getPopularTemplates = async function(limit = 5) {
  return this.aggregate([
    { $group: {
        _id: '$template',
        count: { $sum: 1 },
        downloads: { $sum: '$stats.downloadCount' },
        views: { $sum: '$stats.viewCount' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

// Create indexes for common queries
ResumeSchema.index({ userId: 1, lastModified: -1 }); // For listing user's resumes by modified date
ResumeSchema.index({ slug: 1, isPublic: 1 });        // For public resume lookup
ResumeSchema.index({ 'stats.downloadCount': -1 });   // For popular resumes

const Resume = mongoose.model<IResume>('Resume', ResumeSchema);

export default Resume; 