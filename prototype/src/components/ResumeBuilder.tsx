import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import PersonalInfo from './resume-sections/PersonalInfo';
import Summary from './resume-sections/Summary';
import Experience from './resume-sections/Experience';
import Education from './resume-sections/Education';
import Skills from './resume-sections/Skills';
import Certifications from './resume-sections/Certifications';
import Memberships from './resume-sections/Memberships';
import JobDescriptionPage from './JobDescriptionPage';
import AIAssistant from './AIAssistant';
import ATSScorer from './ATSScorer';
import TemplateSelector from './TemplateSelector';
import ResumePreview from './ResumePreview';
import ErrorBoundary from './ErrorBoundary';
import { Save, Download, ArrowLeft, ArrowRight, PenLine, AlertCircle } from 'lucide-react';
import { ResumeData } from '../types/resume';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ModernTemplate, CreativeTemplate, ProfessionalTemplate, SimpleTemplate, ExecutiveTemplate } from './resume-templates';
import * as resumeService from '../services/resumeService';
import * as subscriptionService from '../services/subscriptionService';

export const initialResumeData: ResumeData = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', profileImage: undefined, title: '', website: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  memberships: []
};

const sections = [
  { id: 'job-description', name: 'Job Description', description: 'Target Job Details', dataKey: 'jobDescription', component: null },
  { id: 'personal-info', name: 'Personal Info', description: 'Name, Title, Contact Details', dataKey: 'personalInfo', component: PersonalInfo },
  { id: 'summary', name: 'Summary', description: 'Professional Summary', dataKey: 'summary', component: Summary },
  { id: 'experience', name: 'Experience', description: 'Work History', dataKey: 'experience', component: Experience },
  { id: 'education', name: 'Education', description: 'Academic Background', dataKey: 'education', component: Education },
  { id: 'skills', name: 'Skills', description: 'Professional Skills', dataKey: 'skills', component: Skills },
  { id: 'certifications', name: 'Certifications', description: 'Professional Certifications', dataKey: 'certifications', component: Certifications },
  { id: 'memberships', name: 'Memberships', description: 'Professional Memberships', dataKey: 'memberships', component: Memberships },
];

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState(initialResumeData);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const navigate = useNavigate();
  const location = useLocation();
  const { section } = useParams();

  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [activeRightPanel, setActiveRightPanel] = useState<'preview' | 'ai' | 'ats'>('preview');
  
  // Get resumeId from URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('resumeId');
    if (id) {
      setResumeId(id);
    }
  }, [location.search]);
  
  // Load resume data from API or localStorage
  useEffect(() => {
    const loadResumeData = async () => {
      try {
        // If we have a resumeId, try to load from API
        if (resumeId) {
          try {
            const response = await resumeService.getResumeById(resumeId);
            
            if (response.resume && response.resume.data) {
              setResumeData({ ...initialResumeData, ...response.resume.data });
              setSelectedTemplate(response.resume.template || 'modern');
              
              // Also load job description if available
              if (response.resume.jobDescription) {
                setJobDescription(response.resume.jobDescription);
              }
              return;
            }
          } catch (error) {
            console.error('Error loading resume from API:', error);
            // Fall back to localStorage if API fails
          }
        }
        
        // Fallback to localStorage if no resumeId or API failed
        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setResumeData({ ...initialResumeData, ...parsedData });
          } catch (error) {
            console.error('Error parsing saved resume data:', error);
          }
        }
        
        // Try to load job description from localStorage
        const savedJobDescription = localStorage.getItem('jobDescription');
        if (savedJobDescription) {
          setJobDescription(savedJobDescription);
        }
      } catch (error) {
        console.error('Error loading resume data:', error);
      }
    };
    
    loadResumeData();
  }, [resumeId]);

  // Auto-save timeout handler
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const updateResumeData = (section: keyof ResumeData, data: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
    
    // Clear previous timeout if it exists
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Show immediate visual feedback that changes are being tracked
    setSaveStatus('pending');
    
    // Set a new timeout for auto-save after 1.5 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        
        // First save to localStorage as backup
        localStorage.setItem('resumeData', JSON.stringify({
          ...resumeData,
          [section]: data
        }));
        
        // Save job description to localStorage
        localStorage.setItem('jobDescription', jobDescription);

        // If we have a resumeId, save to the API
        if (resumeId) {
          try {
            await resumeService.updateResume(resumeId, {
              data: {
                ...resumeData,
                [section]: data
              },
              template: selectedTemplate,
              jobDescription: jobDescription
            });
          } catch (error) {
            console.error('Error saving to API:', error);
            setSaveStatus('error');
            setSaveError('Failed to save to server. Your changes are saved locally.');
            setTimeout(() => {
              setSaveStatus('idle');
              setSaveError(null);
            }, 3000);
            return;
          }
        }
        
        setSaveStatus('saved');
        setLastSaved(new Date());
        // Reset status back to idle after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error) {
        console.error('Error auto-saving resume data:', error);
        setSaveStatus('error');
        setSaveError('Auto-save failed. Please try manual save.');
        setTimeout(() => {
          setSaveStatus('idle');
          setSaveError(null);
        }, 3000);
      }
    }, 1500);
  };

  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      setSaveError(null);
      
      // First save to localStorage as backup
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      localStorage.setItem('jobDescription', jobDescription);
      
      // If we have a resumeId, save to the API
      if (resumeId) {
        try {
          await resumeService.updateResume(resumeId, {
            data: resumeData,
            template: selectedTemplate,
            jobDescription: jobDescription,
            createVersion: true // Create a manual version point
          });
        } catch (error) {
          console.error('Error saving to API:', error);
          setSaveError('Failed to save to server. Your changes are saved locally.');
          // Continue with local save - already done above
        }
      } else {
        // If no resumeId, create a new resume
        try {
          const response = await resumeService.createResume({
            name: resumeData.personalInfo.fullName 
              ? `${resumeData.personalInfo.fullName}'s Resume` 
              : 'My Resume',
            data: resumeData,
            template: selectedTemplate,
            jobDescription: jobDescription
          });
          
          // Set the resumeId and update URL
          if (response.resume && response.resume.id) {
            setResumeId(response.resume.id);
            navigate(`/build/${section || 'personal-info'}?resumeId=${response.resume.id}`, { replace: true });
          }
        } catch (error) {
          console.error('Error creating resume:', error);
          setSaveError('Failed to create resume on server. Your changes are saved locally.');
        }
      }
      
      setSaveStatus('saved');
      setLastSaved(new Date());
      // Reset status back to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving resume data:', error);
      setSaveStatus('error');
      setSaveError('An error occurred while saving.');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleExport = async () => {
    if (resumeRef.current) {
      try {
        // Show loading indicator
        const loadingEl = document.createElement('div');
        loadingEl.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loadingEl.innerHTML = '<div class="bg-white p-5 rounded-lg text-center"><div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div><p>Generating PDF...</p></div>';
        document.body.appendChild(loadingEl);
        
        // Create a temporary container with exact US Letter dimensions (8.5 × 11 inches)
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '8.5in';
        tempContainer.style.height = '11in';
        document.body.appendChild(tempContainer);
        
        // Determine which template component to render
        const getTemplateComponent = () => {
          switch (selectedTemplate) {
            case 'modern':
              return <ModernTemplate data={resumeData} />;
            case 'creative':
              return <CreativeTemplate data={resumeData} />;
            case 'professional':
              return <ProfessionalTemplate data={resumeData} />;
            case 'simple':
              return <SimpleTemplate data={resumeData} />;
            case 'executive':
              return <ExecutiveTemplate data={resumeData} />;
            default:
              return <ModernTemplate data={resumeData} />;
          }
        };
        
        // Render the template component into the temporary container
        const ReactDOM = await import('react-dom/client');
        const root = ReactDOM.createRoot(tempContainer);
        root.render(getTemplateComponent());
        
        // Allow time for all resources (fonts, images, etc.) to load
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Use html2canvas with precise settings
        const canvas = await html2canvas(tempContainer, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: tempContainer.offsetWidth,
          height: tempContainer.offsetHeight,
          windowWidth: tempContainer.offsetWidth,
          windowHeight: tempContainer.offsetHeight,
          onclone: (clonedDoc) => {
            // Force the cloned container to render at exact dimensions
            const clonedContainer = clonedDoc.querySelector('div[style*="position: absolute"]');
            if (clonedContainer) {
              clonedContainer.style.width = '8.5in';
              clonedContainer.style.height = '11in';
              clonedContainer.style.margin = '0';
              clonedContainer.style.padding = '0';
              clonedContainer.style.overflow = 'hidden';
            }
          }
        });
        
        // Create a PDF with exact US Letter dimensions (8.5 x 11 inches)
        // 1 inch = 72 points in PDF, so 8.5 x 11 inches = 612 x 792 points
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: [612, 792]
        });
        
        // Convert canvas to image data
        const imgData = canvas.toDataURL('image/png');
        
        // Add the image to the PDF at exact dimensions
        pdf.addImage(imgData, 'PNG', 0, 0, 612, 792);
        
        // Save the PDF with the user's name or a default filename
        const fileName = resumeData.personalInfo.fullName 
          ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf` 
          : 'Resume.pdf';
        
        pdf.save(fileName);
        
        // Clean up
        document.body.removeChild(tempContainer);
        document.body.removeChild(loadingEl);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        // Remove loading indicator if it exists
        const loadingEl = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
        if (loadingEl && loadingEl.parentNode) {
          loadingEl.parentNode.removeChild(loadingEl);
        }
        
        // Show error message
        const errorEl = document.createElement('div');
        errorEl.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        errorEl.innerHTML = `
          <div class="bg-white p-5 rounded-lg text-center max-w-md">
            <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-lg font-semibold mb-2">PDF Export Failed</h3>
            <p class="mb-4">Sorry, we encountered an error while generating your PDF. Please try again.</p>
            <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onclick="this.parentNode.parentNode.remove()">
              Close
            </button>
          </div>
        `;
        document.body.appendChild(errorEl);
        
        // Auto-remove error message after 5 seconds
        setTimeout(() => {
          if (errorEl.parentNode) {
            errorEl.parentNode.removeChild(errorEl);
          }
        }, 5000);
      }
    }
  };

  const currentSectionIndex = sections.findIndex(s => s.id === section);
  
  // For Job Description page, use the JobDescriptionPage component
  // For other sections, use the component from the sections array
  const CurrentSection = section === 'job-description' 
    ? JobDescriptionPage 
    : sections[currentSectionIndex]?.component;

  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      navigate(`/build/${sections[currentSectionIndex + 1].id}`);
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      navigate(`/build/${sections[currentSectionIndex - 1].id}`);
    } else {
      navigate('/build');
    }
  };

  const resumeRef = useRef<HTMLDivElement>(null);

  // Helper function to get a summary of section data
  const getSectionSummary = (sectionKey: keyof ResumeData) => {
    const data = resumeData[sectionKey];
    
    if (!data || (Array.isArray(data) && data.length === 0) || 
        (typeof data === 'string' && data.trim() === '') ||
        (typeof data === 'object' && Object.keys(data).length === 0)) {
      return null;
    }
    
    if (sectionKey === 'personalInfo') {
      const pi = data as typeof resumeData.personalInfo;
      if (pi.fullName) {
        return `${pi.fullName}${pi.title ? `, ${pi.title}` : ''}`;
      }
      return null;
    }
    
    if (typeof data === 'string') {
      return data.length > 30 ? `${data.substring(0, 30)}...` : data;
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) return null;
      if (sectionKey === 'skills') {
        return data.slice(0, 3).join(', ') + (data.length > 3 ? '...' : '');
      }
      if ('institution' in data[0]) { // Education
        return data.map(item => item.institution).join(', ');
      }
      if ('company' in data[0]) { // Experience
        return data.map(item => item.company).join(', ');
      }
      if ('name' in data[0]) { // Certifications
        return data.map(item => item.name).join(', ');
      }
      if ('organization' in data[0]) { // Memberships
        return data.map(item => item.organization).join(', ');
      }
    }
    
    return null;
  };

  // Add effect to check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const subscription = await subscriptionService.getUserSubscription();
        setIsPremium(subscription?.plan?.toLowerCase() === 'premium');
      } catch (error) {
        console.log('No active subscription found');
        setIsPremium(false);
      }
    };
    
    checkSubscription();
  }, []);

  if (location.pathname === '/build') {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-center text-gray-800 dark:text-white">Build Your Resume</h1>
          <div className="space-y-6">
            {sections.map((section) => {
              // Skip job description in the main menu
              if (section.id === 'job-description') {
                return null;
              }
              
              const sectionKey = section.dataKey as keyof ResumeData;
              const userDataSummary = getSectionSummary(sectionKey);
              
              return (
                <button
                  key={section.id}
                  onClick={() => navigate(`/build/${section.id}`)}
                  className="w-full py-5 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-between"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xl font-medium text-gray-800 dark:text-white">{section.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {userDataSummary || section.description}
                    </span>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  // Special handling for Job Description page
  if (section === 'job-description') {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <JobDescriptionPage 
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          onNext={goToNextSection}
        />
      </div>
    );
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">Build Your Resume</h1>
          <div className="flex justify-center">
            {sections.map((s, index) => (
              <div
                key={s.id}
                className={`w-10 h-10 rounded-full flex items-center justify-center mx-1 ${
                  index <= currentSectionIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3 card">
            <h2 className="section-title">{sections[currentSectionIndex]?.name}</h2>
            <ErrorBoundary>
              {CurrentSection && (
                <CurrentSection
                  data={resumeData[sections[currentSectionIndex].dataKey as keyof ResumeData] as any}
                  updateData={(data: any) => updateResumeData(sections[currentSectionIndex].dataKey as keyof ResumeData, data)}
                  jobDescription={jobDescription} // Pass job description to components that need it
                />
              )}
            </ErrorBoundary>
            <div className="mt-12 flex justify-between">
              <button onClick={goToPreviousSection} className="btn-secondary flex items-center">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </button>
              <button onClick={goToNextSection} className="btn-primary flex items-center">
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
          <div className="lg:w-1/3 space-y-8">
            <ErrorBoundary>
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                resumeData={resumeData}
              />
            </ErrorBoundary>
            
            {/* Right panel tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeRightPanel === 'preview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveRightPanel('preview')}
              >
                Preview
              </button>
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeRightPanel === 'ai'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveRightPanel('ai')}
              >
                AI Assistant
              </button>
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeRightPanel === 'ats'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveRightPanel('ats')}
              >
                ATS Analysis
              </button>
            </div>
            
            {/* Conditional rendering based on active panel */}
            <ErrorBoundary>
              {activeRightPanel === 'preview' && (
                <div ref={resumeRef}>
                  <ResumePreview resumeData={resumeData} selectedTemplate={selectedTemplate} />
                </div>
              )}
              
              {activeRightPanel === 'ai' && (
                <AIAssistant 
                  resumeData={resumeData} 
                  updateResumeData={updateResumeData} 
                  jobDescription={jobDescription}
                />
              )}
              
              {activeRightPanel === 'ats' && (
                <ATSScorer 
                  resumeData={resumeData} 
                  isPremium={isPremium} 
                  jobDescription={jobDescription}
                />
              )}
            </ErrorBoundary>
            
            <div className="space-y-2">
              <div className="flex space-x-4">
                <button 
                  onClick={handleSave} 
                  className={`btn-primary flex-1 flex items-center justify-center 
                    ${saveStatus === 'saving' ? 'opacity-70 cursor-wait' : ''}`}
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : saveStatus === 'saved' ? (
                    <>
                      <svg className="w-5 h-5 mr-2 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Saved
                    </>
                  ) : saveStatus === 'error' ? (
                    <>
                      <svg className="w-5 h-5 mr-2 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Retry Save
                    </>
                  ) : saveStatus === 'pending' ? (
                    <>
                      <div className="w-4 h-4 border-b-2 border-r-2 border-white rounded-full animate-pulse mr-2"></div>
                      Unsaved Changes
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save
                    </>
                  )}
                </button>
                <button 
                  onClick={handleExport} 
                  className="btn-secondary flex-1 flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export PDF
                </button>
              </div>
              
              {lastSaved && (
                <div className={`flex items-center justify-center text-xs ${
                  saveStatus === 'error' ? 'text-red-500 dark:text-red-400' : 
                  saveStatus === 'saved' ? 'text-green-600 dark:text-green-400' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {saveStatus === 'error' ? (
                    <div className="flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {saveError || 'Error saving changes'}
                    </div>
                  ) : saveStatus === 'pending' ? (
                    <div className="flex items-center">
                      <span>Changes will be auto-saved</span>
                    </div>
                  ) : saveStatus === 'saving' ? (
                    <div className="flex items-center">
                      <span>Auto-saving changes...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
