import React from 'react';

const ProfessionalSplitTemplate = ({ resumeData }) => {
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

  // Left column (fixed for all pages)
  const leftColumn = (
    <div className="w-1/3 bg-gray-100 p-6 h-full">
      {resumeData.personalInfo.profileImage && (
        <img
          src={resumeData.personalInfo.profileImage}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white"
        />
      )}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">{resumeData.personalInfo.fullName || 'Your Name'}</h1>
        <p className="text-lg text-gray-600">{resumeData.personalInfo.title || 'Your Title'}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2 text-gray-700">Contact</h2>
        <p className="text-sm text-gray-600">{resumeData.personalInfo.email || 'email@example.com'}</p>
        <p className="text-sm text-gray-600">{resumeData.personalInfo.phone || '(123) 456-7890'}</p>
        <p className="text-sm text-gray-600">{resumeData.personalInfo.location || 'City, State'}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2 text-gray-700">Skills</h2>
        <div className="flex flex-wrap">
          {(resumeData.skills || []).map((skill, index) => (
            <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm mr-2 mb-2">{skill}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // Right column content
  addToPage(
    <div key="summary" className="mb-6">
      <h2 className="text-xl font-bold mb-2 text-gray-800 border-b-2 border-gray-300 pb-1">Professional Summary</h2>
      <p className="text-gray-700">{resumeData.summary || 'Add a brief professional summary here.'}</p>
    </div>
  );

  addToPage(
    <div key="experience" className="mb-6">
      <h2 className="text-xl font-bold mb-2 text-gray-800 border-b-2 border-gray-300 pb-1">Experience</h2>
      {(resumeData.experience || []).map((exp, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg font-bold text-gray-800">{exp.position || 'Position'}</h3>
          <p className="text-gray-600 italic">{exp.company || 'Company'} | {exp.startDate || 'Start Date'} - {exp.isPresent ? 'Present' : (exp.endDate || 'End Date')}</p>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            {(exp.description || '').split('\n').map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  addToPage(
    <div key="education" className="mb-6">
      <h2 className="text-xl font-bold mb-2 text-gray-800 border-b-2 border-gray-300 pb-1">Education</h2>
      {(resumeData.education || []).map((edu, index) => (
        <div key={index} className="mb-2">
          <h3 className="text-lg font-bold text-gray-800">{edu.degree || 'Degree'}</h3>
          <p className="text-gray-600 italic">{edu.institution || 'Institution'} | {edu.startDate || 'Start Date'} - {edu.isPresent ? 'Present' : (edu.endDate || 'End Date')}</p>
        </div>
      ))}
    </div>
  );

  if (resumeData.certifications && resumeData.certifications.length > 0) {
    addToPage(
      <div key="certifications" className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-gray-800 border-b-2 border-gray-300 pb-1">Certifications</h2>
        {resumeData.certifications.map((cert, index) => (
          <div key={index} className="mb-2">
            <h3 className="text-lg font-bold text-gray-800">{cert.name || 'Certification Name'}</h3>
            <p className="text-gray-600 italic">{cert.issuer || 'Issuer'} | {cert.date || 'Date'}</p>
          </div>
        ))}
      </div>
    );
  }

  if (resumeData.memberships && resumeData.memberships.length > 0) {
    addToPage(
      <div key="memberships" className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-gray-800 border-b-2 border-gray-300 pb-1">Memberships</h2>
        {resumeData.memberships.map((membership, index) => (
          <div key={index} className="mb-2">
            <h3 className="text-lg font-bold text-gray-800">{membership.organization || 'Organization'}</h3>
            <p className="text-gray-600 italic">{membership.role || 'Role'} | {membership.startDate || 'Start Date'} - {membership.endDate || 'End Date'}</p>
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
        <div key={`page-${pageIndex}`} className="mb-8 flex bg-white shadow-lg" style={{ minHeight: '1056px', width: '816px' }}>
          {leftColumn}
          <div className="w-2/3 p-6">
            {page}
            <div className="absolute bottom-4 right-4 text-gray-400">
              Page {pageIndex + 1} of {pages.length}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfessionalSplitTemplate;