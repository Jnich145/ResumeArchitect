import React from 'react';
import { ResumeData } from '../../types/resume';

interface TemplateProps {
  data: ResumeData;
}

const ExecutiveTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, certifications, memberships } = data;

  return (
    <div className="resume-template executive-template bg-white w-[8.5in] h-[11in]">
      <div className="relative">
        {/* Header with elegant styling */}
        <header className="bg-gray-800 text-white p-8">
          <h1 className="text-3xl font-bold mb-2">
            {personalInfo.fullName || 'Full Name'}
          </h1>
          {personalInfo.title && (
            <h2 className="text-xl font-light mb-4 text-gray-300">{personalInfo.title}</h2>
          )}
          
          <div className="flex flex-wrap gap-x-6 text-sm text-gray-300 mt-4">
            {personalInfo.email && (
              <div className="mb-1 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {personalInfo.email}
              </div>
            )}
            {personalInfo.phone && (
              <div className="mb-1 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {personalInfo.phone}
              </div>
            )}
            {personalInfo.location && (
              <div className="mb-1 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {personalInfo.location}
              </div>
            )}
            {personalInfo.website && (
              <div className="mb-1 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5v-1.5" />
                </svg>
                {personalInfo.website}
              </div>
            )}
          </div>
        </header>

        <div className="p-8">
          {/* Summary Section - Clean and professional */}
          {summary && (
            <section className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-800 pb-2 mb-4">
                EXECUTIVE PROFILE
              </h3>
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </section>
          )}

          {/* Experience Section - Detailed and emphasized */}
          {experience && experience.length > 0 && (
            <section className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-800 pb-2 mb-4">
                PROFESSIONAL EXPERIENCE
              </h3>
              {experience.map((exp, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-bold text-gray-800 text-lg">{exp.title}</h4>
                    <span className="text-gray-600 font-semibold">{exp.startDate} - {exp.endDate || 'Present'}</span>
                  </div>
                  <div className="text-gray-700 mb-2 font-semibold">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                  <p className="text-gray-600">{exp.description}</p>
                </div>
              ))}
            </section>
          )}

          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              {/* Education Section */}
              {education && education.length > 0 && (
                <section className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-800 pb-2 mb-4">
                    EDUCATION
                  </h3>
                  {education.map((edu, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-bold text-gray-800">{edu.degree}</h4>
                      </div>
                      <div className="text-gray-700 mb-1">{edu.institution}</div>
                      <div className="text-gray-600 text-sm">{edu.startDate} - {edu.endDate || 'Present'}</div>
                      {edu.location && <div className="text-gray-600 text-sm">{edu.location}</div>}
                    </div>
                  ))}
                </section>
              )}

              {/* Certifications Section */}
              {certifications && certifications.length > 0 && (
                <section className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-800 pb-2 mb-4">
                    CERTIFICATIONS
                  </h3>
                  {certifications.map((cert, index) => (
                    <div key={index} className="mb-3">
                      <div className="font-bold text-gray-800">{cert.name}</div>
                      <div className="text-gray-600 text-sm">{cert.issuer} • {cert.date}</div>
                    </div>
                  ))}
                </section>
              )}
            </div>

            {/* Right Column */}
            <div>
              {/* Skills Section */}
              {skills && skills.length > 0 && (
                <section className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-800 pb-2 mb-4">
                    CORE COMPETENCIES
                  </h3>
                  <ul className="list-disc list-inside grid grid-cols-1 gap-y-1">
                    {skills.map((skill, index) => (
                      <li key={index} className="text-gray-700">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Memberships Section */}
              {memberships && memberships.length > 0 && (
                <section className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-800 pb-2 mb-4">
                    PROFESSIONAL AFFILIATIONS
                  </h3>
                  {memberships.map((membership, index) => (
                    <div key={index} className="mb-3">
                      <div className="font-bold text-gray-800">{membership.organization}</div>
                      <div className="text-gray-600">
                        {membership.position}
                        {membership.startDate && (
                          <span> • {membership.startDate} - {membership.endDate || 'Present'}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveTemplate; 