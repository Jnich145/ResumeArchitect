import React, { useState, useEffect } from 'react';

interface ResumeData {
  personalInfo: {
    profileImage?: string;
    fullName?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
  };
  summary?: string;
  skills?: string[];
  experience?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    isPresent: boolean;
    description: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    isPresent: boolean;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  memberships?: Array<{
    organization: string;
    role: string;
    startDate: string;
    endDate: string;
  }>;
}

const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    fetch('/svg/Professional CV Resume.svg')
      .then(response => response.text())
      .then(content => setSvgContent(content))
      .catch(error => console.error('Error loading SVG:', error));
  }, []);

  const replacePlaceholders = (content: string) => {
    return content
      .replace(/{fullName}/g, data.personalInfo.fullName || '')
      .replace(/{title}/g, data.personalInfo.title || '')
      .replace(/{email}/g, data.personalInfo.email || '')
      .replace(/{phone}/g, data.personalInfo.phone || '')
      .replace(/{location}/g, data.personalInfo.location || '')
      .replace(/{website}/g, data.personalInfo.website || '');
  };

  const editableSvg = replacePlaceholders(svgContent);

  return (
    <div className="relative" style={{ width: '595.5px', height: '842.25px' }}>
      <div dangerouslySetInnerHTML={{ __html: editableSvg }} />
      {data.personalInfo.profileImage && (
        <div 
          className="absolute" 
          style={{
            top: '50px',
            left: '50px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden'
          }}
        >
          <img 
            src={data.personalInfo.profileImage} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default ModernTemplate;
