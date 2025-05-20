import { ResumeData } from '../types/resume';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get CSRF token from localStorage
const getCsrfToken = (): string => {
  return localStorage.getItem('csrfToken') || '';
};

// Generic fetch function with error handling
const fetchApi = async <T>(url: string, method: string, data?: any): Promise<T> => {
  try {
    console.log(`Making API request to: ${url}`);
    console.log('Request data:', data);
    
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
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || 'An error occurred');
    }
    
    const responseData = await response.json();
    console.log('API response:', responseData);
    return responseData;
  } catch (error) {
    console.error('AI API request error:', error);
    throw error;
  }
};

// Add a unique identifier to each request to prevent duplicate suggestions
const addUniqueIdentifier = (content: string): string => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  // Add an invisible marker that won't affect the content but makes each request unique
  return `${content}\n<!-- request_id: ${timestamp}-${randomId} -->`;
};

// Improve resume content with AI suggestions
export const improveContent = async (
  fieldType: string, 
  content: string
): Promise<{ improvedContent: string }> => {
  // Add unique identifier to prevent duplicate responses
  const uniqueContent = addUniqueIdentifier(content);
  
  try {
    return await fetchApi(
      `${API_URL}/ai/improve`,
      'POST',
      { content: uniqueContent, contentType: fieldType }
    );
  } catch (error) {
    // If API call fails, use fallback mock responses in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Falling back to mock response for improveContent');
      return {
        improvedContent: getMockImprovedContent(fieldType, content)
      };
    }
    throw error;
  }
};

// Generate bullet points based on job description and experience
export const generateBulletPoints = async (
  jobDescription: string,
  experience: string
): Promise<{ bullets: string[] }> => {
  const uniqueExperience = addUniqueIdentifier(experience);
  
  try {
    return await fetchApi(
      `${API_URL}/ai/generate-bullets`,
      'POST',
      { jobDescription, experience: uniqueExperience }
    );
  } catch (error) {
    // Fallback to mock in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Falling back to mock response for generateBulletPoints');
      return {
        bullets: getMockBulletPoints(jobDescription, experience)
      };
    }
    throw error;
  }
};

// Optimize resume content for ATS
export const optimizeForATS = async (
  content: string,
  keywords: string[]
): Promise<{ optimized: string; score: number }> => {
  const uniqueContent = addUniqueIdentifier(content);
  
  return fetchApi(
    `${API_URL}/ai/ats-optimize`,
    'POST',
    { content: uniqueContent, keywords }
  );
};

// Check grammar and spelling
export const checkGrammar = async (
  content: string
): Promise<{ corrected: string; issues: { type: string; original: string; suggestion: string }[] }> => {
  const uniqueContent = addUniqueIdentifier(content);
  
  return fetchApi(
    `${API_URL}/ai/grammar-check`,
    'POST',
    { content: uniqueContent }
  );
};

// Get AI usage statistics for the current user
export const getAIUsageStats = async (): Promise<{
  used: number;
  limit: number;
  resetDate: string;
}> => {
  return fetchApi(`${API_URL}/ai/usage`, 'GET');
};

// Generate AI suggestions for entire resume
export const generateResumeSuggestions = async (
  resumeData: Partial<ResumeData>,
  jobDescription?: string
): Promise<{
  suggestions: Array<{
    section: keyof ResumeData;
    content: any;
    explanation: string;
  }>
}> => {
  return fetchApi(
    `${API_URL}/ai/suggest`,
    'POST',
    { resumeData, jobDescription }
  );
};

// Mock responses for development fallbacks
const getMockImprovedContent = (fieldType: string, content: string): string => {
  switch (fieldType) {
    case 'summary':
      return "Results-driven professional with 5+ years of experience in implementing innovative solutions. Demonstrated expertise in project management, cross-functional collaboration, and process optimization. Consistently exceeds targets through analytical problem-solving and strong communication skills.";
    case 'bullet_point':
      return "Spearheaded cross-functional team of 8 developers to redesign core system architecture, reducing response time by 45% and increasing user satisfaction scores from 72% to 96%.";
    case 'skill':
      return "Strategic Planning & Execution";
    default:
      return "Enhanced professional content for your resume.";
  }
};

const getMockBulletPoints = (jobDescription: string, experience: string): string[] => {
  const bullets = [
    "Implemented automated CI/CD pipeline that reduced deployment time by 75% and decreased production defects by 65%, resulting in significant improvement to release velocity.",
    "Led migration of legacy systems to cloud infrastructure, achieving $1.2M annual cost savings while maintaining 99.99% system availability.",
    "Developed comprehensive API documentation and developer portal that reduced integration time for partners from weeks to days, increasing platform adoption by 40%.",
    "Orchestrated data analytics initiative that identified operational inefficiencies, resulting in 28% productivity improvement and $850K annual cost reduction."
  ];
  
  // Return random subset of 3 non-repeating bullet points
  const selectedIndices = new Set<number>();
  while (selectedIndices.size < 3) {
    selectedIndices.add(Math.floor(Math.random() * bullets.length));
  }
  
  return Array.from(selectedIndices).map(index => bullets[index]);
};

export default {
  improveContent,
  generateBulletPoints,
  optimizeForATS,
  checkGrammar,
  getAIUsageStats,
  generateResumeSuggestions
}; 