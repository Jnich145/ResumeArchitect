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
    console.error('ATS API request error:', error);
    throw error;
  }
};

// Get ATS keywords for a job industry or title
export const getAtsKeywords = async (
  industry?: string,
  jobTitle?: string
): Promise<string[]> => {
  const params = new URLSearchParams();
  if (industry) params.append('industry', industry);
  if (jobTitle) params.append('jobTitle', jobTitle);
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return fetchApi(`${API_URL}/ats/keywords${queryString}`, 'GET');
};

// Analyze resume for ATS compatibility (basic)
export const analyzeResume = async (
  resumeContent: string,
  jobDescription?: string
): Promise<{
  score: number;
  missingKeywords: string[];
  suggestions: string[];
}> => {
  return fetchApi(
    `${API_URL}/ats/analyze`,
    'POST',
    { resumeContent, jobDescription }
  );
};

// Analyze resume for ATS compatibility (advanced - premium only)
export const analyzeResumeAdvanced = async (
  resumeContent: string,
  jobDescription: string
): Promise<{
  score: number;
  formatScore: number;
  contentScore: number;
  keywordScore: number;
  missingKeywords: string[];
  redundantPhrases: string[];
  formatIssues: string[];
  contentSuggestions: string[];
  improvedContent?: string;
}> => {
  return fetchApi(
    `${API_URL}/ats/analyze/advanced`,
    'POST',
    { resumeContent, jobDescription }
  );
};

export default {
  getAtsKeywords,
  analyzeResume,
  analyzeResumeAdvanced
}; 