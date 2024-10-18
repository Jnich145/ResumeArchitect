import React from 'react';

const ModernTemplate = ({ resumeData }) => {
  return (
    <div className="font-sans bg-white text-gray-800 p-8" style={{ width: '816px', minHeight: '1056px' }}>
      <img 
        src="/template-previews/modern-preview.jpg" 
        alt="Modern Template Preview" 
        className="w-full h-auto"
      />
    </div>
  );
};

export default ModernTemplate;