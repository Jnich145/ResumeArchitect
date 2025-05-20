import React, { useState, useEffect } from 'react';
import { ResumeData } from '../../types/resume';

const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const [originalSvgContent, setOriginalSvgContent] = useState<string>('');
  const [processedSvgContent, setProcessedSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load the SVG template only once
  useEffect(() => {
    fetch('/svg/Professional CV Resume.svg')
      .then(response => response.text())
      .then(content => {
        setOriginalSvgContent(content);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading SVG:', error);
        setIsLoading(false);
      });
  }, []);

  // Process the template when data or original SVG changes
  useEffect(() => {
    if (originalSvgContent) {
      const processedContent = replacePlaceholders(originalSvgContent, data);
      setProcessedSvgContent(processedContent);
    }
  }, [data, originalSvgContent]);

  if (isLoading) {
    return <div className="text-center p-8">Loading template...</div>;
  }

  return (
    <div className="resume-template modern-template" style={{ width: '8.5in', height: '11in', position: 'relative' }}>
      <div dangerouslySetInnerHTML={{ __html: processedSvgContent }} />
      {data.personalInfo?.profileImage && (
        <div 
          className="absolute" 
          style={{
            top: '1.25in',
            left: '1.25in',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #fff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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

// Move the replacePlaceholders function outside the component
// to prevent it from being recreated on each render
function replacePlaceholders(content: string, data: ResumeData): string {
  // Basic replacements for personal info
  let updatedContent = content
    .replace(/{fullName}/g, data.personalInfo?.fullName || 'Your Name')
    .replace(/{title}/g, data.personalInfo?.title || 'Your Title')
    .replace(/{email}/g, data.personalInfo?.email || 'email@example.com')
    .replace(/{phone}/g, data.personalInfo?.phone || '(123) 456-7890')
    .replace(/{location}/g, data.personalInfo?.location || 'City, State')
    .replace(/{website}/g, data.personalInfo?.website || 'website.com');

  // Add summary if available
  if (data.summary) {
    updatedContent = updatedContent.replace(/{summary}/g, data.summary);
  }

  // Add skills if available
  if (data.skills && data.skills.length > 0) {
    // Find skills placeholder
    const skillsPlaceholder = '{skills}';
    if (updatedContent.includes(skillsPlaceholder)) {
      const skillsHtml = data.skills
        .map(skill => `<li>${skill}</li>`)
        .join('');
      updatedContent = updatedContent.replace(skillsPlaceholder, skillsHtml);
    }
  }

  // Add experience if available
  if (data.experience && data.experience.length > 0) {
    // Find experience placeholder
    const expPlaceholder = '{experience}';
    if (updatedContent.includes(expPlaceholder)) {
      const expHtml = data.experience
        .map(exp => `
          <div class="experience-item">
            <h4>${exp.position}</h4>
            <h5>${exp.company}</h5>
            <p class="date">${exp.startDate} - ${exp.isPresent ? 'Present' : exp.endDate}</p>
            <p>${exp.description}</p>
          </div>
        `)
        .join('');
      updatedContent = updatedContent.replace(expPlaceholder, expHtml);
    }
  }

  // Add education if available
  if (data.education && data.education.length > 0) {
    // Find education placeholder
    const eduPlaceholder = '{education}';
    if (updatedContent.includes(eduPlaceholder)) {
      const eduHtml = data.education
        .map(edu => `
          <div class="education-item">
            <h4>${edu.degree} in ${edu.fieldOfStudy}</h4>
            <h5>${edu.institution}</h5>
            <p class="date">${edu.startDate} - ${edu.isPresent ? 'Present' : edu.endDate}</p>
          </div>
        `)
        .join('');
      updatedContent = updatedContent.replace(eduPlaceholder, eduHtml);
    }
  }

  return updatedContent;
}

export default ModernTemplate;
