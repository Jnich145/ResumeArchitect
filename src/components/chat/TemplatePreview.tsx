import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Maximize2 } from 'lucide-react';
import { 
  ModernTemplate, 
  CreativeTemplate, 
  ProfessionalTemplate, 
  SimpleTemplate,
  ExecutiveTemplate
} from '../resume-templates';
import { ResumeData } from '../../types/resume';

interface TemplatePreviewProps {
  resumeData: Partial<ResumeData>;
  onTemplateSelect: (template: string) => void;
  selectedTemplate?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  resumeData,
  onTemplateSelect,
  selectedTemplate = 'modern'
}) => {
  const [currentTemplate, setCurrentTemplate] = useState(selectedTemplate);
  const [isExpanded, setIsExpanded] = useState(false);

  const templates = [
    { id: 'modern', name: 'Modern', component: ModernTemplate },
    { id: 'professional', name: 'Professional', component: ProfessionalTemplate },
    { id: 'simple', name: 'Simple', component: SimpleTemplate },
    { id: 'creative', name: 'Creative', component: CreativeTemplate },
    { id: 'executive', name: 'Executive', component: ExecutiveTemplate }
  ];

  const currentIndex = templates.findIndex(t => t.id === currentTemplate);
  
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % templates.length;
    setCurrentTemplate(templates[nextIndex].id);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + templates.length) % templates.length;
    setCurrentTemplate(templates[prevIndex].id);
  };

  const handleSelect = () => {
    onTemplateSelect(currentTemplate);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Find the current template component
  const CurrentTemplateComponent = templates[currentIndex]?.component;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden 
      ${isExpanded ? 'fixed inset-0 z-50 flex flex-col' : 'h-96'}`}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <h3 className="font-medium">Template Preview: {templates[currentIndex]?.name}</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleExpanded}
            className="p-1 hover:bg-white/20 rounded"
            aria-label={isExpanded ? "Minimize" : "Maximize"}
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Template Preview */}
      <div className="relative flex-1 overflow-hidden bg-gray-100 dark:bg-gray-700">
        <div className="absolute inset-0 overflow-auto transform scale-[0.4] origin-top-left mx-auto">
          {CurrentTemplateComponent && (
            <div className="w-[8.5in] h-[11in] bg-white dark:bg-gray-900 shadow-lg mx-auto">
              <CurrentTemplateComponent 
                resumeData={resumeData as ResumeData}
              />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Previous template"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentIndex + 1} of {templates.length}
          </span>
          <button
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Next template"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        
        <button
          onClick={handleSelect}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 
            ${currentTemplate === selectedTemplate 
              ? 'bg-green-600 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {currentTemplate === selectedTemplate ? (
            <>
              <Check size={16} />
              Selected
            </>
          ) : 'Select Template'}
        </button>
      </div>
    </div>
  );
};

export default TemplatePreview; 