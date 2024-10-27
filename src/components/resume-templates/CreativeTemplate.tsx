import React from 'react';

interface ResumeData {
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
  };
  // Add other sections as needed
}

const CreativeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="creative-template" style={{ width: '210mm', height: '297mm' }}>
      <div className="p-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <h1 className="text-4xl font-bold">{data.personalInfo.fullName}</h1>
        <h2 className="text-2xl">{data.personalInfo.title}</h2>
      </div>
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Contact</h3>
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          <p>{data.personalInfo.location}</p>
          {data.personalInfo.website && <p>{data.personalInfo.website}</p>}
        </div>
        {/* Add more sections here as needed */}
      </div>
    </div>
  );
};

export default CreativeTemplate;
