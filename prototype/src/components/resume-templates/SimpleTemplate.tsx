import React from 'react';
import { ResumeData } from '../../types/resume';

interface TemplateProps {
  data: ResumeData;
}

const SimpleTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, certifications, memberships } = data;

  return (
    <div className="resume-template simple-template bg-white w-[8.5in] h-[11in]">
      <div className="p-8 relative">
        {/* Header with name and contact info */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {personalInfo.fullName || 'Full Name'}
          </h1>
          {personalInfo.title && (
            <h2 className="text-xl text-gray-700 mb-3">{personalInfo.title}</h2>
          )}
          
          <div className="flex justify-center flex-wrap gap-x-6 text-sm text-gray-600">
            {personalInfo.email && (
              <div className="mb-1">{personalInfo.email}</div>
            )}
            {personalInfo.phone && (
              <div className="mb-1">{personalInfo.phone}</div>
            )}
            {personalInfo.location && (
              <div className="mb-1">{personalInfo.location}</div>
            )}
            {personalInfo.website && (
              <div className="mb-1">{personalInfo.website}</div>
            )}
          </div>
        </header>

        {/* Summary Section */}
        {summary && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
              SUMMARY
            </h3>
            <p className="text-gray-700">{summary}</p>
          </section>
        )}

        {/* Experience Section */}
        {experience && experience.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
              EXPERIENCE
            </h3>
            {experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-1">
                  <h4 className="font-bold text-gray-800">{exp.title}</h4>
                  <span className="text-gray-600">{exp.startDate} - {exp.endDate || 'Present'}</span>
                </div>
                <div className="text-gray-700 mb-1">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                <p className="text-gray-600 text-sm">{exp.description}</p>
              </div>
            ))}
          </section>
        )}

        {/* Education Section */}
        {education && education.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
              EDUCATION
            </h3>
            {education.map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between mb-1">
                  <h4 className="font-bold text-gray-800">{edu.degree}</h4>
                  <span className="text-gray-600">{edu.startDate} - {edu.endDate || 'Present'}</span>
                </div>
                <div className="text-gray-700">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</div>
                {edu.description && <p className="text-gray-600 text-sm mt-1">{edu.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
              SKILLS
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={index} className="bg-gray-100 px-3 py-1 rounded text-gray-700">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Certifications Section */}
        {certifications && certifications.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
              CERTIFICATIONS
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {certifications.map((cert, index) => (
                <div key={index}>
                  <div className="font-semibold text-gray-800">{cert.name}</div>
                  <div className="text-gray-600 text-sm">{cert.issuer} • {cert.date}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Memberships Section */}
        {memberships && memberships.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
              MEMBERSHIPS
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {memberships.map((membership, index) => (
                <div key={index}>
                  <div className="font-semibold text-gray-800">{membership.organization}</div>
                  <div className="text-gray-600 text-sm">{membership.position} • {membership.startDate} - {membership.endDate || 'Present'}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SimpleTemplate; 