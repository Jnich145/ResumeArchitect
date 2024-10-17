import React from 'react';
import { ModernTemplate, MinimalistTemplate, CreativeTemplate, ProfessionalSplitTemplate } from './ResumeTemplates';

const ResumePreview = ({ resumeData, selectedTemplate }) => {
  const renderSelectedTemplate = () => {
    switch (selectedTemplate) {
      case 'Modern':
        return <ModernTemplate resumeData={resumeData} />;
      case 'Minimalist':
        return <MinimalistTemplate resumeData={resumeData} />;
      case 'Creative':
        return <CreativeTemplate resumeData={resumeData} />;
      case 'Professional Split':
        return <ProfessionalSplitTemplate resumeData={resumeData} />;
      default:
        return <ModernTemplate resumeData={resumeData} />;
    }
  };

  return (
    <div className="card">
      <h3 className="section-title">Resume Preview</h3>
      <div className="overflow-auto max-h-[600px] scrollbar-hide bg-white rounded-lg shadow-inner">
        {renderSelectedTemplate()}
      </div>
    </div>
  );
};

export default ResumePreview;