import React from 'react';
import { FileText, Zap, Star, Users, Download, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <FileText className="w-12 h-12 text-blue-500" />,
      title: t('features.templates.title'),
      description: t('features.templates.description'),
    },
    {
      icon: <Zap className="w-12 h-12 text-blue-500" />,
      title: t('features.aiSuggestions.title'),
      description: t('features.aiSuggestions.description'),
    },
    {
      icon: <Star className="w-12 h-12 text-blue-500" />,
      title: t('features.customization.title'),
      description: t('features.customization.description'),
    },
    {
      icon: <Users className="w-12 h-12 text-blue-500" />,
      title: t('features.formats.title'),
      description: t('features.formats.description'),
    },
    {
      icon: <Download className="w-12 h-12 text-blue-500" />,
      title: t('features.downloads.title'),
      description: t('features.downloads.description'),
    },
    {
      icon: <Lock className="w-12 h-12 text-blue-500" />,
      title: t('features.privacy.title'),
      description: t('features.privacy.description'),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-center mb-12">{t('features.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="flex justify-center mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-center">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;