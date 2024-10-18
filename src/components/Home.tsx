import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Star, Users, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Carousel from './Carousel';

const Home: React.FC = () => {
  const { t } = useTranslation();

  const carouselImages = [
    '/images/Professional CV Resume.png',
    '/images/Black & White Modern Graphic Design CV Resume.png',
    '/images/black modern corporate Resume.png',
    '/images/Black and White Minimalist Resume.png',
    '/images/Black And White Modern Professional CV Resume.jpg',
    '/images/Gray and White Simple Clean Resume.jpg',
    '/images/Green Simple Family Wellness Counselor Resume.png',
    '/images/Minimalist Clean Signature CV Resume.png',
    '/images/White Burgundy Professional Resume.png',
    '/images/White Green Professional Business CV Resume.jpg'
  ];

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{t('home.title')}</h1>
              <p className="text-xl mb-8 opacity-90">{t('home.subtitle')}</p>
              <Link to="/build" className="btn bg-white text-blue-600 hover:bg-gray-100 text-lg inline-block">
                {t('home.cta')}
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <Carousel images={carouselImages} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-800 dark:text-white">{t('home.whyChoose')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<Zap className="w-12 h-12 text-blue-500" />}
              title={t('home.features.easyToUse.title')}
              description={t('home.features.easyToUse.description')}
            />
            <FeatureCard
              icon={<Star className="w-12 h-12 text-blue-500" />}
              title={t('home.features.aiPowered.title')}
              description={t('home.features.aiPowered.description')}
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-blue-500" />}
              title={t('home.features.professionalTemplates.title')}
              description={t('home.features.professionalTemplates.description')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">{t('home.readyToLand')}</h2>
          <p className="text-xl mb-8 opacity-90">{t('home.standOut')}</p>
          <Link to="/build" className="btn bg-white text-blue-600 hover:bg-gray-100 text-lg inline-block">
            {t('home.startBuilding')}
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="card hover:scale-105 flex flex-col items-center">
    <div className="flex justify-center mb-6">{icon}</div>
    <h3 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-center">{description}</p>
  </div>
);

export default Home;
