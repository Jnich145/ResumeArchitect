import React from 'react';
import { ResumeData } from '../../types/resume';

interface TemplateProps {
  data: ResumeData;
}

const AcademicTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, certifications, memberships } = data;

  return (
    <div className="academic-template bg-white" style={{ width: '8.5in', height: '11in', fontFamily: 'Garamond, Georgia, serif' }}>
      {/* Header */}
      <div className="px-12 pt-10 pb-6 border-b-2 border-gray-800">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">{personalInfo.fullName}</h1>
        {personalInfo.title && (
          <h2 className="text-xl text-center text-gray-700 mb-4">{personalInfo.title}</h2>
        )}
        
        {/* Contact Information */}
        <div className="flex flex-wrap justify-center text-sm text-gray-600">
          {personalInfo.email && (
            <div className="mx-3">Email: {personalInfo.email}</div>
          )}
          {personalInfo.phone && (
            <div className="mx-3">Phone: {personalInfo.phone}</div>
          )}
          {personalInfo.location && (
            <div className="mx-3">Location: {personalInfo.location}</div>
          )}
          {personalInfo.website && (
            <div className="mx-3">Website: {personalInfo.website}</div>
          )}
        </div>
      </div>

      <div className="px-12 py-6">
        {/* Summary/Research Interests */}
        {summary && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">Research Interests</h2>
            <p className="text-gray-700">{summary}</p>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">Education</h2>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold">{edu.degree} in {edu.fieldOfStudy}</h3>
                      <p className="text-gray-700">{edu.institution}</p>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {edu.startDate} - {edu.isPresent ? 'Present' : edu.endDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience / Research Experience */}
        {experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">Research Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold">{exp.position}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {exp.startDate} - {exp.isPresent ? 'Present' : exp.endDate}
                    </p>
                  </div>
                  <p className="text-gray-700 mt-1 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publications (using certifications for this purpose) */}
        {certifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">Publications & Certifications</h2>
            <div className="space-y-2">
              {certifications.map((cert, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <p className="font-medium">"{cert.name}"</p>
                    <p className="text-gray-700">{cert.issuer}</p>
                  </div>
                  <p className="text-gray-600 text-sm">{cert.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Memberships */}
        {memberships.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">Professional Affiliations</h2>
            <div className="space-y-2">
              {memberships.map((membership, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <p className="font-medium">{membership.organization}</p>
                    <p className="text-gray-700">{membership.role}</p>
                  </div>
                  <p className="text-gray-600 text-sm">{membership.startDate} - {membership.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills / Areas of Expertise */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">Areas of Expertise</h2>
            <div className="flex flex-wrap">
              {skills.map((skill, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 rounded-lg px-3 py-1 m-1">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicTemplate; 