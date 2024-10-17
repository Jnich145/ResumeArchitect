import React from 'react';

const CreativeTemplate = ({ resumeData }) => {
  const itemsPerPage = 5;
  const pages = [];
  let currentPage = [];
  let itemCount = 0;

  const addToPage = (element) => {
    if (itemCount >= itemsPerPage) {
      pages.push(currentPage);
      currentPage = [];
      itemCount = 0;
    }
    currentPage.push(element);
    itemCount++;
  };

  // Personal Info and Summary (always on the first page)
  addToPage(
    <div key="personal-info" className="mb-6 bg-gradient-to-r from-purple-400 to-pink-500 text-white p-6 rounded-lg flex items-center">
      {resumeData.personalInfo.profileImage && (
        <img
          src={resumeData.personalInfo.profileImage}
          alt="Profile"
          className="w-32 h-32 rounded-full mr-6 object-cover border-4 border-white"
        />
      )}
      <div>
        <h1 className="text-4xl font-bold">{resumeData.personalInfo.fullName || 'Your Name'}</h1>
        <p className="text-xl">{resumeData.personalInfo.title || 'Your Title'}</p>
        <div className="mt-2 text-sm">
          <p>{resumeData.personalInfo.email || 'email@example.com'} | {resumeData.personalInfo.phone || '(123) 456-7890'}</p>
          <p>{resumeData.personalInfo.location || 'City, State'}</p>
        </div>
      </div>
    </div>
  );

  addToPage(
    <div key="summary" className="mb-6">
      <h2 className="text-2xl font-bold mb-2 text-purple-600">About Me</h2>
      <p className="text-gray-700">{resumeData.summary || 'Add a brief professional summary here.'}</p>
    </div>
  );

  // Experience
  addToPage(
    <div key="experience" className="mb-6">
      <h2 className="text-2xl font-bold mb-2 text-purple-600">Experience</h2>
      {(resumeData.experience || []).map((exp, index) => (
        <div key={index} className="mb-4 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-gray-800">{exp.position || 'Position'}</h3>
          <p className="text-gray-600">{exp.company || 'Company'} | {exp.startDate || 'Start Date'} - {exp.isPresent ? 'Present' : (exp.endDate || 'End Date')}</p>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            {(exp.description || '').split('\n').map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  // Education
  addToPage(
    <div key="education" className="mb-6">
      <h2 className="text-2xl font-bold mb-2 text-purple-600">Education</h2>
      {(resumeData.education || []).map((edu, index) => (
        <div key={index} className="mb-2 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-gray-800">{edu.degree || 'Degree'}</h3>
          <p className="text-gray-600">{edu.institution || 'Institution'} | {edu.startDate || 'Start Date'} - {edu.isPresent ? 'Present' : (edu.endDate || 'End Date')}</p>
        </div>
      ))}
    </div>
  );

  // Skills
  addToPage(
    <div key="skills" className="mb-6">
      <h2 className="text-2xl font-bold mb-2 text-purple-600">Skills</h2>
      <div className="flex flex-wrap">
        {(resumeData.skills || []).map((skill, index) => (
          <span key={index} className="bg-pink-100 text-pink-800 text-sm font-medium mr-2 mb-2 px-2.5 py-0.5 rounded">{skill}</span>
        ))}
      </div>
    </div>
  );

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    addToPage(
      <div key="certifications" className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-purple-600">Certifications</h2>
        {resumeData.certifications.map((cert, index) => (
          <div key={index} className="mb-2 bg-gray-100 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800">{cert.name || 'Certification Name'}</h3>
            <p className="text-gray-600">{cert.issuer || 'Issuer'} | {cert.date || 'Date'}</p>
          </div>
        ))}
      </div>
    );
  }

  // Memberships
  if (resumeData.memberships && resumeData.memberships.length > 0) {
    addToPage(
      <div key="memberships" className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-purple-600">Memberships</h2>
        {resumeData.memberships.map((membership, index) => (
          <div key={index} className="mb-2 bg-gray-100 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800">{membership.organization || 'Organization'}</h3>
            <p className="text-gray-600">{membership.role || 'Role'} | {membership.startDate || 'Start Date'} - {membership.endDate || 'End Date'}</p>
          </div>
        ))}
      </div>
    );
  }

  // Add any remaining items to the last page
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return (
    <div className="font-sans">
      {pages.map((page, pageIndex) => (
        <div key={`page-${pageIndex}`} className="mb-8 p-8 bg-white shadow-lg" style={{ minHeight: '1056px', width: '816px' }}>
          {page}
          <div className="absolute bottom-4 right-4 text-gray-400">
            Page {pageIndex + 1} of {pages.length}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreativeTemplate;