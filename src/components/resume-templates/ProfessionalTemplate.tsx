import React from 'react';
import { ResumeData } from '../../types/resume';

interface TemplateProps {
  data: ResumeData;
}

const ProfessionalTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, certifications, memberships } = data;

  return (
    <div className="resume-template professional-template bg-white w-[8.5in] h-[11in]">
      <div className="p-8 relative">
        {/* Header Section */}
        <header className="border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{personalInfo.fullName || 'Full Name'}</h1>
          <h2 className="text-xl text-gray-700 mt-1">{personalInfo.title || 'Professional Title'}</h2>
          
          <div className="flex flex-wrap mt-3 text-sm text-gray-600">
            {personalInfo.email && (
              <div className="mr-6 mb-2">
                <span className="font-semibold">Email: </span>
                {personalInfo.email}
              </div>
            )}
            {personalInfo.phone && (
              <div className="mr-6 mb-2">
                <span className="font-semibold">Phone: </span>
                {personalInfo.phone}
              </div>
            )}
            {personalInfo.location && (
              <div className="mr-6 mb-2">
                <span className="font-semibold">Location: </span>
                {personalInfo.location}
              </div>
            )}
            {personalInfo.website && (
              <div className="mb-2">
                <span className="font-semibold">Website: </span>
                {personalInfo.website}
              </div>
            )}
          </div>
        </header>

        {/* Summary Section */}
        {summary && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">Professional Summary</h3>
            <p className="text-gray-700">{summary}</p>
          </section>
        )}

        {/* Experience Section */}
        {experience && experience.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">Experience</h3>
            {experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between">
                  <h4 className="font-semibold text-gray-800">{exp.title}</h4>
                  <span className="text-gray-600 text-sm">{exp.startDate} - {exp.endDate || 'Present'}</span>
                </div>
                <div className="text-gray-700">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                <p className="text-gray-600 mt-1 text-sm">{exp.description}</p>
              </div>
            ))}
          </section>
        )}

        {/* Education Section */}
        {education && education.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">Education</h3>
            {education.map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between">
                  <h4 className="font-semibold text-gray-800">{edu.degree}</h4>
                  <span className="text-gray-600 text-sm">{edu.startDate} - {edu.endDate || 'Present'}</span>
                </div>
                <div className="text-gray-700">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</div>
                {edu.description && <p className="text-gray-600 mt-1 text-sm">{edu.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Two Column Layout for Skills and Certifications */}
        <div className="flex flex-wrap -mx-2">
          {/* Skills Section */}
          {skills && skills.length > 0 && (
            <section className="w-full md:w-1/2 px-2 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">Skills</h3>
              <ul className="list-disc list-inside text-gray-700">
                {skills.map((skill, index) => (
                  <li key={index} className="mb-1">{skill}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Certifications Section */}
          {certifications && certifications.length > 0 && (
            <section className="w-full md:w-1/2 px-2 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">Certifications</h3>
              {certifications.map((cert, index) => (
                <div key={index} className="mb-2">
                  <div className="font-semibold text-gray-800">{cert.name}</div>
                  <div className="text-gray-600 text-sm">{cert.issuer} • {cert.date}</div>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Memberships Section */}
        {memberships && memberships.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">Memberships</h3>
            {memberships.map((membership, index) => (
              <div key={index} className="mb-2">
                <div className="font-semibold text-gray-800">{membership.organization}</div>
                <div className="text-gray-600 text-sm">{membership.position} • {membership.startDate} - {membership.endDate || 'Present'}</div>
              </div>
            ))}
          </section>
        )}

        {/* Footer with light gray line */}
        <footer className="border-t border-gray-300 pt-2 mt-auto text-center text-gray-500 text-xs">
          <div>References available upon request</div>
        </footer>
      </div>
    </div>
  );
};

export default ProfessionalTemplate; 