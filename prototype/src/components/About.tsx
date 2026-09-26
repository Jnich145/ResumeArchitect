import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { getTotalUsers } = useAuth();
  const [userCount, setUserCount] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserCount = async () => {
      const count = await getTotalUsers();
      setUserCount(count);
    };

    fetchUserCount();
    const interval = setInterval(fetchUserCount, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [getTotalUsers]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('about.title')}</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('about.mission.title')}</h2>
        <p>{t('about.mission.description')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('about.community.title')}</h2>
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
          <p className="font-bold">{t('about.community.totalUsers')}:</p>
          <p className="text-4xl font-bold">{userCount.toLocaleString()}</p>
        </div>
        <p>{t('about.community.description')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('about.features.title')}</h2>
        <ul className="list-disc list-inside">
          <li>{t('about.features.templates')}</li>
          <li>{t('about.features.aiSuggestions')}</li>
          <li>{t('about.features.easyInterface')}</li>
          <li>{t('about.features.multipleFormats')}</li>
          <li>{t('about.features.secureStorage')}</li>
        </ul>
      </section>
    </div>
  );
};

export default About;
