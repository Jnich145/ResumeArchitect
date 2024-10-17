import React from 'react';
import { ModernTemplate, MinimalistTemplate, CreativeTemplate, ProfessionalSplitTemplate } from './ResumeTemplates';

const TemplateSelector = ({ selectedTemplate, setSelectedTemplate, resumeData }) => {
  const templates = [
    { name: 'Modern', component: ModernTemplate, previewImage: '/template-previews/modern-preview.jpg' },
    { name: 'Minimalist', component: MinimalistTemplate, previewImage: '/template-previews/minimalist-preview.jpg' },
    { name: 'Creative', component: CreativeTemplate, previewImage: '/template-previews/creative-preview.jpg' },
    { name: 'Professional Split', component: ProfessionalSplitTemplate, previewImage: '/template-previews/professional-split-preview.jpg' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-float">
      <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Choose a Template</h3>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.name}
            className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedTemplate === template.name
                ? 'ring-4 ring-blue-500 dark:ring-blue-400'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedTemplate(template.name)}
          >
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <div className="p-4">
                <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{template.name}</h4>
              </div>
              <div className="h-64 overflow-hidden">
                <img 
                  src={template.previewImage} 
                  alt={`${template.name} Template`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;