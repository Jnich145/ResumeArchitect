import React from 'react';
import { ResumeData } from '../../types/resume';

interface TemplateProps {
  data: ResumeData;
}

const CreativeTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, certifications, memberships } = data;

  return (
    <div className="creative-template bg-white" style={{ width: '8.5in', height: '11in', overflow: 'hidden', position: 'relative' }}>
      {/* Left Sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-1/3 p-8 bg-gradient-to-b from-purple-600 to-indigo-700 text-white">
        {/* Profile Section */}
        <div className="mb-10">
          {personalInfo.profileImage && (
            <div className="mb-4 w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-white">
              <img src={personalInfo.profileImage} alt={personalInfo.fullName} className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-center mb-1">{personalInfo.fullName}</h1>
          <h2 className="text-lg text-center text-purple-200">{personalInfo.title}</h2>
        </div>

        {/* Contact Info */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold border-b border-purple-400 pb-2 mb-4">CONTACT</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">{personalInfo.email}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm">{personalInfo.phone}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{personalInfo.location}</span>
            </div>
            {personalInfo.website && (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span className="text-sm">{personalInfo.website}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg font-semibold border-b border-purple-400 pb-2 mb-4">SKILLS</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-purple-500 bg-opacity-30 text-white text-sm px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg font-semibold border-b border-purple-400 pb-2 mb-4">CERTIFICATIONS</h3>
            <div className="space-y-3">
              {certifications.map((cert, index) => (
                <div key={index}>
                  <div className="font-medium">{cert.name}</div>
                  <div className="text-sm text-purple-200">{cert.issuer} • {cert.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="absolute right-0 top-0 bottom-0 w-2/3 p-8 overflow-y-auto">
        {/* Summary */}
        {summary && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-purple-700 border-b-2 border-purple-700 pb-2 mb-4">PROFESSIONAL SUMMARY</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-purple-700 border-b-2 border-purple-700 pb-2 mb-4">EXPERIENCE</h3>
            <div className="space-y-5">
              {experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{exp.position}</h4>
                      <h5 className="text-md font-medium text-purple-600">{exp.company}</h5>
                    </div>
                    <div className="text-sm text-gray-600">
                      {exp.startDate} - {exp.isPresent ? 'Present' : exp.endDate}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-purple-700 border-b-2 border-purple-700 pb-2 mb-4">EDUCATION</h3>
            <div className="space-y-5">
              {education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{edu.degree} in {edu.fieldOfStudy}</h4>
                      <h5 className="text-md font-medium text-purple-600">{edu.institution}</h5>
                    </div>
                    <div className="text-sm text-gray-600">
                      {edu.startDate} - {edu.isPresent ? 'Present' : edu.endDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memberships */}
        {memberships.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-purple-700 border-b-2 border-purple-700 pb-2 mb-4">PROFESSIONAL MEMBERSHIPS</h3>
            <div className="space-y-3">
              {memberships.map((mem, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{mem.role}</h4>
                      <h5 className="text-md font-medium text-purple-600">{mem.organization}</h5>
                    </div>
                    <div className="text-sm text-gray-600">
                      {mem.startDate} - {mem.endDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreativeTemplate;
