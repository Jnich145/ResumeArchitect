import React from 'react';
import { useTranslation } from 'react-i18next';

const TemplateSelector = ({ selectedTemplate, setSelectedTemplate }) => {
  const { t } = useTranslation();

  const templates = [
    { id: 'modern', name: t('templates.modern'), image: '/images/Professional CV Resume.png' },
    { id: 'creative', name: t('templates.creative'), image: '/images/black modern corporate Resume.png' },
    { id: 'professional', name: t('templates.professional'), image: '/images/White Green Professional Business CV Resume.jpg' },
    { id: 'simple', name: t('templates.simple'), image: '/images/Black and White Minimalist Resume.png' },
    { id: 'executive', name: t('templates.executive'), image: '/images/Black & White Modern Graphic Design CV Resume.png' },
    { id: 'academic', name: t('templates.academic'), image: '/images/Gray and White Simple Clean Resume.jpg' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-float">
      <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('templateSelector.title')}</h3>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedTemplate === template.id
                ? 'ring-4 ring-blue-500 dark:ring-blue-400'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <div className="p-4">
                <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{template.name}</h4>
              </div>
              <div className="h-64 overflow-hidden">
                <img 
                  src={template.image} 
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