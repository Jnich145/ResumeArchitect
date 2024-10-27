import React from 'react';
import { ModernTemplate, CreativeTemplate } from './resume-templates';
// Import other templates as needed

interface ResumePreviewProps {
  selectedTemplate: string;
  resumeData: any; // Define a proper type for your resume data
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
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate data={sampleData} />;
      case 'creative':
        return <CreativeTemplate data={sampleData} />;
      default:
        return <div>No template selected</div>;
    }
  };

  return (
    <div className="bg-white shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-100 border-b">
        <h2 className="text-xl font-semibold">Resume Preview</h2>
      </div>
      <div className="p-4 overflow-auto max-h-[800px]">
        {renderTemplate()}
      </div>
    </div>
  );
};

export default ResumePreview;
