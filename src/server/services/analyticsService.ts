import Resume from '../models/Resume';

// Analytics service for resume metrics
const analyticsService = {
  /**
   * Get analytics for a specific resume
   */
  async getResumeAnalytics(resumeId: string): Promise<{
    viewCount: number;
    downloadCount: number;
    lastViewed?: Date;
    lastDownloaded?: Date;
    viewHistory?: { date: string; count: number }[];
    downloadHistory?: { date: string; count: number }[];
  }> {
    const resume = await Resume.findById(resumeId).select('stats');
    
    if (!resume) {
      throw new Error('Resume not found');
    }
    
    // Note: In a real-world application, we would have a more sophisticated
    // time-series database for analytics. This is a simplified version.
    
    // This would be coming from a time-series collection in a real app
    const viewHistory = [];
    const downloadHistory = [];
    
    // Generate some mock history data for the last 30 days
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      viewHistory.push({
        date: dateStr,
        count: Math.floor(Math.random() * 5) // Random count for demo
      });
      
      downloadHistory.push({
        date: dateStr,
        count: Math.floor(Math.random() * 2) // Random count for demo
      });
    }
    
    return {
      viewCount: resume.stats.viewCount,
      downloadCount: resume.stats.downloadCount,
      lastViewed: resume.stats.lastViewed,
      lastDownloaded: resume.stats.lastDownloaded,
      viewHistory,
      downloadHistory
    };
  },
  
  /**
   * Get aggregate analytics for all user resumes
   */
  async getUserAnalytics(userId: string): Promise<{
    totalResumes: number;
    totalViews: number;
    totalDownloads: number;
    mostViewedResume?: { id: string; name: string; views: number };
    mostDownloadedResume?: { id: string; name: string; downloads: number };
    recentActivity: { date: string; action: string; resumeId: string; resumeName: string }[];
  }> {
    // Get all resumes for the user
    const resumes = await Resume.find({ userId })
      .select('name stats lastModified')
      .sort({ 'stats.viewCount': -1 });
    
    if (resumes.length === 0) {
      return {
        totalResumes: 0,
        totalViews: 0,
        totalDownloads: 0,
        recentActivity: []
      };
    }
    
    // Calculate totals
    const totalViews = resumes.reduce((sum, resume) => sum + resume.stats.viewCount, 0);
    const totalDownloads = resumes.reduce((sum, resume) => sum + resume.stats.downloadCount, 0);
    
    // Find most viewed resume
    const mostViewedResume = resumes[0].stats.viewCount > 0 
      ? {
          id: resumes[0]._id ? resumes[0]._id.toString() : '',
          name: resumes[0].name,
          views: resumes[0].stats.viewCount
        }
      : undefined;
    
    // Find most downloaded resume
    const sortedByDownloads = [...resumes].sort((a, b) => b.stats.downloadCount - a.stats.downloadCount);
    const mostDownloadedResume = sortedByDownloads.length > 0 && sortedByDownloads[0].stats.downloadCount > 0
      ? {
          id: sortedByDownloads[0]._id ? sortedByDownloads[0]._id.toString() : '',
          name: sortedByDownloads[0].name,
          downloads: sortedByDownloads[0].stats.downloadCount
        }
      : undefined;
    
    // Generate recent activity (this would come from an activity log in a real app)
    const recentActivity = [];
    
    // Sort resumes by lastModified for recent activity
    const sortedResumes = [...resumes].sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
    
    // Generate some sample activity based on actual resume data
    for (let i = 0; i < Math.min(5, sortedResumes.length); i++) {
      const resume = sortedResumes[i];
      const date = new Date(resume.lastModified);
      
      recentActivity.push({
        date: date.toISOString(),
        action: 'updated',
        resumeId: resume._id ? resume._id.toString() : '',
        resumeName: resume.name
      });
      
      // Add view activity if resume has views
      if (resume.stats.viewCount > 0 && resume.stats.lastViewed) {
        recentActivity.push({
          date: new Date(resume.stats.lastViewed).toISOString(),
          action: 'viewed',
          resumeId: resume._id ? resume._id.toString() : '',
          resumeName: resume.name
        });
      }
      
      // Add download activity if resume has downloads
      if (resume.stats.downloadCount > 0 && resume.stats.lastDownloaded) {
        recentActivity.push({
          date: new Date(resume.stats.lastDownloaded).toISOString(),
          action: 'downloaded',
          resumeId: resume._id ? resume._id.toString() : '',
          resumeName: resume.name
        });
      }
    }
    
    // Sort activity by date
    recentActivity.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return {
      totalResumes: resumes.length,
      totalViews,
      totalDownloads,
      mostViewedResume,
      mostDownloadedResume,
      recentActivity: recentActivity.slice(0, 10) // Limit to 10 most recent activities
    };
  },
  
  /**
   * Get popular templates stats (for admin dashboard)
   */
  async getPopularTemplates(): Promise<{
    templateName: string;
    count: number;
    views: number;
    downloads: number;
  }[]> {
    const templateStats = await Resume.aggregate([
      {
        $group: {
          _id: '$template',
          count: { $sum: 1 },
          views: { $sum: '$stats.viewCount' },
          downloads: { $sum: '$stats.downloadCount' }
        }
      },
      {
        $project: {
          templateName: '$_id',
          count: 1,
          views: 1,
          downloads: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    return templateStats;
  }
};

export default analyticsService; 