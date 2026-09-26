import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  Download, 
  Eye, 
  Calendar, 
  RefreshCw,
  ClipboardCheck
} from 'lucide-react';
import { getUserAnalytics, getResumeAnalytics } from '../services/analyticsService';

interface AnalyticsDashboardProps {
  resumeId?: string; // If provided, show analytics for just this resume
  isPremium: boolean;
}

interface UserAnalytics {
  totalResumes: number;
  totalViews: number;
  totalDownloads: number;
  mostViewedResume?: { id: string; name: string; views: number };
  mostDownloadedResume?: { id: string; name: string; downloads: number };
  recentActivity: Array<{ 
    date: string; 
    action: string; 
    resumeId: string; 
    resumeName: string 
  }>;
}

interface ResumeAnalytics {
  viewCount: number;
  downloadCount: number;
  lastViewed?: string;
  lastDownloaded?: string;
  viewHistory?: Array<{ date: string; count: number }>;
  downloadHistory?: Array<{ date: string; count: number }>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  resumeId,
  isPremium
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [resumeAnalytics, setResumeAnalytics] = useState<ResumeAnalytics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [resumeId]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (resumeId) {
        // Fetch individual resume analytics
        const data = await getResumeAnalytics(resumeId);
        setResumeAnalytics(data);
      } else {
        // Fetch user-level aggregate analytics
        const data = await getUserAnalytics();
        setUserAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError((err as Error).message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString?: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw size={40} className="mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-gray-500 dark:text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="btn-secondary"
          >
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (resumeId && resumeAnalytics) {
    // Resume-specific analytics
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Resume Performance</h3>
        
        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center mb-1">
              <Eye size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="text-gray-700 dark:text-gray-300 font-medium">Views</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{resumeAnalytics.viewCount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last viewed: {formatDate(resumeAnalytics.lastViewed)}
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center mb-1">
              <Download size={20} className="text-green-600 dark:text-green-400 mr-2" />
              <h4 className="text-gray-700 dark:text-gray-300 font-medium">Downloads</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{resumeAnalytics.downloadCount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last downloaded: {formatDate(resumeAnalytics.lastDownloaded)}
            </p>
          </div>
        </div>
        
        {/* View history chart - simplified version */}
        {isPremium && resumeAnalytics.viewHistory && resumeAnalytics.viewHistory.length > 0 ? (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <LineChart size={20} className="mr-2 text-blue-500" />
              <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                Views History
              </h4>
            </div>
            <div className="h-48 bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
              {/* Simplified chart visualization */}
              <div className="h-full flex items-end">
                {resumeAnalytics.viewHistory.slice(-14).map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full max-w-[20px] bg-blue-400 dark:bg-blue-500 rounded-t"
                      style={{ 
                        height: `${(day.count / Math.max(...resumeAnalytics.viewHistory!.map(d => d.count))) * 100}%` 
                      }}
                    />
                    <span className="text-[8px] text-gray-500 mt-1 rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-8 text-center">
            <LineChart size={40} className="mx-auto mb-2 text-gray-400" />
            {isPremium ? (
              <p className="text-gray-500 dark:text-gray-400">
                No view history available yet. Check back after your resume has been viewed.
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                View history charts are available with premium plans.
              </p>
            )}
          </div>
        )}
        
        {/* Download history chart - simplified version */}
        {isPremium && resumeAnalytics.downloadHistory && resumeAnalytics.downloadHistory.length > 0 ? (
          <div>
            <div className="flex items-center mb-4">
              <BarChart size={20} className="mr-2 text-green-500" />
              <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                Downloads History
              </h4>
            </div>
            <div className="h-48 bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
              {/* Simplified chart visualization */}
              <div className="h-full flex items-end">
                {resumeAnalytics.downloadHistory.slice(-14).map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full max-w-[20px] bg-green-400 dark:bg-green-500 rounded-t"
                      style={{ 
                        height: `${(day.count / Math.max(...resumeAnalytics.downloadHistory!.map(d => d.count), 1)) * 100}%` 
                      }}
                    />
                    <span className="text-[8px] text-gray-500 mt-1 rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (userAnalytics) {
    // User-level aggregate analytics
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Resume Analytics</h3>
        
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center mb-1">
              <ClipboardCheck size={20} className="text-purple-600 dark:text-purple-400 mr-2" />
              <h4 className="text-gray-700 dark:text-gray-300 font-medium">Resumes</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{userAnalytics.totalResumes}</p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center mb-1">
              <Eye size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="text-gray-700 dark:text-gray-300 font-medium">Total Views</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{userAnalytics.totalViews}</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center mb-1">
              <Download size={20} className="text-green-600 dark:text-green-400 mr-2" />
              <h4 className="text-gray-700 dark:text-gray-300 font-medium">Downloads</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{userAnalytics.totalDownloads}</p>
          </div>
        </div>
        
        {/* Most popular resumes */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {userAnalytics.mostViewedResume && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                Most Viewed Resume
              </h4>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                {userAnalytics.mostViewedResume.name}
              </p>
              <div className="flex items-center text-blue-500">
                <Eye size={16} className="mr-1" />
                <span>{userAnalytics.mostViewedResume.views} views</span>
              </div>
            </div>
          )}
          
          {userAnalytics.mostDownloadedResume && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                Most Downloaded Resume
              </h4>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                {userAnalytics.mostDownloadedResume.name}
              </p>
              <div className="flex items-center text-green-500">
                <Download size={16} className="mr-1" />
                <span>{userAnalytics.mostDownloadedResume.downloads} downloads</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Recent activity */}
        <div>
          <div className="flex items-center mb-4">
            <Calendar size={20} className="mr-2 text-gray-600 dark:text-gray-400" />
            <h4 className="text-lg font-medium text-gray-800 dark:text-white">
              Recent Activity
            </h4>
          </div>
          
          {userAnalytics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {userAnalytics.recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0"
                >
                  <div className="flex items-center mb-1">
                    {activity.action === 'viewed' ? (
                      <Eye size={16} className="mr-2 text-blue-500" />
                    ) : activity.action === 'downloaded' ? (
                      <Download size={16} className="mr-2 text-green-500" />
                    ) : (
                      <ClipboardCheck size={16} className="mr-2 text-purple-500" />
                    )}
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{activity.resumeName}</span> was {activity.action}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                    {formatDate(activity.date)} at {formatTime(activity.date)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                No activity recorded yet. Share your resumes to start tracking views and downloads.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default AnalyticsDashboard; 