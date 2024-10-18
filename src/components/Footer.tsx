import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'en' | 'es' | 'fr');
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t('footer.companyName')}</h3>
            <p className="text-gray-600 dark:text-gray-300">{t('footer.companyDescription')}</p>
          </div>
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li><Link to="/templates" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">{t('header.templates')}</Link></li>
              <li><Link to="/features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">{t('header.features')}</Link></li>
              <li><Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">{t('header.pricing')}</Link></li>
              <li><Link to="/signin" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">{t('header.signIn')}</Link></li>
            </ul>
          </div>
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t('footer.legal')}</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">{t('footer.termsOfService')}</Link></li>
              <li><Link to="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">{t('footer.privacyPolicy')}</Link></li>
            </ul>
          </div>
          <div className="w-full md:w-1/4">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t('footer.contactDeveloper')}</h4>
            <a href="https://www.linkedin.com/in/justin-nichols-567145257/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
              <Linkedin size={24} className="mr-2" />
              {t('footer.connectOnLinkedIn')}
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-center">
            <p className="text-gray-600 dark:text-gray-300">&copy; 2024 {t('footer.companyName')}. {t('footer.allRightsReserved')}.</p>
            <div className="mt-4 md:mt-0">
              <select
                className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="en">{t('footer.languages.english')}</option>
                <option value="es">{t('footer.languages.spanish')}</option>
                <option value="fr">{t('footer.languages.french')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;