import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ModernTemplate, CreativeTemplate, ProfessionalTemplate, SimpleTemplate, ExecutiveTemplate, AcademicTemplate } from './resume-templates';
import { ResumeData } from '../types/resume';
import ErrorBoundary from './ErrorBoundary';
// Import other templates as needed

interface ResumePreviewProps {
  selectedTemplate: string;
  resumeData: ResumeData;
}

const sampleData = {
  personalInfo: {
    fullName: "John Doe",
    title: "Software Developer",
    email: "john@example.com",
    phone: "+1 234 567 890",
    location: "New York, NY",
    website: "www.johndoe.com"
  }
  // Add other sections as needed
};

const ResumePreview: React.FC<ResumePreviewProps> = ({ selectedTemplate, resumeData }) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const [templateError, setTemplateError] = useState(false);
  
  // Recalculate scale whenever the container size changes or template changes
  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        // Get the container width accounting for padding
        const containerWidth = previewContainerRef.current.clientWidth - 32; // 16px padding on each side
        
        // Calculate optimal scale based on the container width (US Letter width = 8.5 inches)
        // Use standard 96 DPI for screen rendering
        const letterWidthInPx = 8.5 * 96;
        const optimalScale = containerWidth / letterWidthInPx;
        
        // Limit scale to reasonable bounds
        const boundedScale = Math.max(0.25, Math.min(0.85, optimalScale));
        setScale(boundedScale);
      }
    };
    
    // Set initial scale
    updateScale();
    
    // Add resize listener
    const resizeObserver = new ResizeObserver(updateScale);
    if (previewContainerRef.current) {
      resizeObserver.observe(previewContainerRef.current);
    }
    
    // Re-adjust scale on window resize too
    window.addEventListener('resize', updateScale);
    
    return () => {
      if (previewContainerRef.current) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateScale);
    };
  }, [selectedTemplate]); // Re-run when template changes

  // Reset template error state when template changes
  useEffect(() => {
    setTemplateError(false);
  }, [selectedTemplate]);

  const handleErrorReset = useCallback(() => {
    setTemplateError(false);
  }, []);

  const renderTemplate = () => {
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
      case 'academic':
        return <AcademicTemplate data={resumeData} />;
      default:
        return <div>No template selected</div>;
    }
  };

  return (
    <div ref={previewContainerRef} className="bg-white shadow-lg rounded-lg overflow-hidden resume-preview">
      <div className="p-4 bg-gray-100 border-b">
        <h2 className="text-xl font-semibold">Resume Preview</h2>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500">
            Scaled to {Math.round(scale * 100)}% for preview. Full size in exported PDF.
          </p>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setScale(prev => Math.max(0.25, prev - 0.1))}
              className="text-gray-700 hover:text-gray-900 p-1 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button 
              onClick={() => setScale(prev => Math.min(0.85, prev + 0.1))}
              className="text-gray-700 hover:text-gray-900 p-1 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div 
        className="p-4 flex justify-center bg-gray-50 dark:bg-gray-800"
        style={{
          maxHeight: '600px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div 
          className="origin-top shadow-lg resume-template-container"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            margin: '0 auto',
            marginBottom: `${(1 - scale) * 400}px` // Add margin to bottom to prevent cutoff
          }}
        >
          <ErrorBoundary 
            componentName={`${selectedTemplate} Template`}
            onReset={handleErrorReset}
          >
            {renderTemplate()}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
