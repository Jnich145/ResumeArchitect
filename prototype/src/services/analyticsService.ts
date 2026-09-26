const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get CSRF token from localStorage
const getCsrfToken = (): string => {
  return localStorage.getItem('csrfToken') || '';
};

// Generic fetch function with error handling
const fetchApi = async <T>(url: string, method: string, data?: any): Promise<T> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken(),
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Analytics API request error:', error);
    throw error;
  }
};

// Get analytics for a specific resume
export const getResumeAnalytics = async (
  resumeId: string
): Promise<{
  viewCount: number;
  downloadCount: number;
  lastViewed?: string;
  lastDownloaded?: string;
  viewHistory?: { date: string; count: number }[];
  downloadHistory?: { date: string; count: number }[];
}> => {
  return fetchApi(`${API_URL}/analytics/resume/${resumeId}`, 'GET');
};

// Get aggregate analytics for all user resumes
export const getUserAnalytics = async (): Promise<{
  totalResumes: number;
  totalViews: number;
  totalDownloads: number;
  mostViewedResume?: { id: string; name: string; views: number };
  mostDownloadedResume?: { id: string; name: string; downloads: number };
  recentActivity: { date: string; action: string; resumeId: string; resumeName: string }[];
}> => {
  return fetchApi(`${API_URL}/analytics/user`, 'GET');
};

// Track a resume view (for public resumes)
export const trackResumeView = async (resumeId: string): Promise<void> => {
  return fetchApi(`${API_URL}/analytics/resume/${resumeId}/view`, 'POST');
};

// Track a resume download
export const trackResumeDownload = async (resumeId: string): Promise<void> => {
  return fetchApi(`${API_URL}/analytics/resume/${resumeId}/download`, 'POST');
};

export default {
  getResumeAnalytics,
  getUserAnalytics,
  trackResumeView,
  trackResumeDownload
}; 