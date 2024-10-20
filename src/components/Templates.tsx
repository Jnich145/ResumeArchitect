import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Templates = () => {
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
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-center mb-12">{t('templates.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
            <div className="h-96 overflow-hidden relative">
              <img 
                src={template.image} 
                alt={template.name} 
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-semibold mb-4">{template.name}</h3>
              <Link to={`/build?template=${template.id}`} className="btn-primary block text-center mt-auto">
                {t('templates.useTemplate')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;
