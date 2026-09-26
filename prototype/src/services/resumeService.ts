import { ResumeData } from '../types/resume';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface FetchOptions {
  method: string;
  headers: Record<string, string>;
  credentials: RequestCredentials;
  body?: string;
}

// Get CSRF token from localStorage
const getCsrfToken = (): string => {
  return localStorage.getItem('csrfToken') || '';
};

// Generic fetch function with error handling
const fetchApi = async <T>(url: string, options: FetchOptions): Promise<T> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Prepare request options with CSRF token and credentials
const prepareOptions = (method: string, data?: any): FetchOptions => {
  const options: FetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
    },
    credentials: 'include',
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  return options;
};

// Get all resumes for the current user
export const getResumes = async () => {
  return fetchApi(`${API_URL}/resumes`, prepareOptions('GET'));
};

// Get a specific resume by ID
export const getResumeById = async (resumeId: string) => {
  return fetchApi(`${API_URL}/resumes/${resumeId}`, prepareOptions('GET'));
};

// Create a new resume
export const createResume = async (data: { name: string; data: ResumeData; template?: string }) => {
  return fetchApi(`${API_URL}/resumes`, prepareOptions('POST', data));
};

// Update a resume
export const updateResume = async (
  resumeId: string, 
  data: { 
    name?: string; 
    data?: ResumeData; 
    template?: string; 
    isPublic?: boolean; 
    createVersion?: boolean | string;
  }
) => {
  return fetchApi(`${API_URL}/resumes/${resumeId}`, prepareOptions('PUT', data));
};

// Delete a resume
export const deleteResume = async (resumeId: string) => {
  return fetchApi(`${API_URL}/resumes/${resumeId}`, prepareOptions('DELETE'));
};

// Get all versions of a resume
export const getResumeVersions = async (resumeId: string) => {
  return fetchApi(`${API_URL}/resumes/${resumeId}/versions`, prepareOptions('GET'));
};

// Get a specific version of a resume
export const getResumeVersion = async (resumeId: string, versionId: string) => {
  return fetchApi(`${API_URL}/resumes/${resumeId}/versions/${versionId}`, prepareOptions('GET'));
};

// Restore a specific version
export const restoreResumeVersion = async (resumeId: string, versionId: string) => {
  return fetchApi(
    `${API_URL}/resumes/${resumeId}/versions/${versionId}/restore`, 
    prepareOptions('POST')
  );
};

// Get a public resume by slug
export const getPublicResume = async (slug: string) => {
  return fetchApi(`${API_URL}/r/${slug}`, prepareOptions('GET'));
};

// Auto-save resume data
// This is a debounced function that should only be called after user has stopped typing
// Returns a function that can be called to perform the autosave
export const createAutoSave = (resumeId: string) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (data: ResumeData) => {
    // Clear previous timeout
    if (timeout) {
      clearTimeout(timeout);
    }
    
    // Set new timeout (1.5 seconds)
    timeout = setTimeout(async () => {
      try {
        await updateResume(resumeId, { data });
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 1500);
  };
}; 