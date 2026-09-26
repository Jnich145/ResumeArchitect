import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Pricing = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const plan = {
    name: t('pricing.free'),
    price: t('pricing.free'),
    features: [
      t('pricing.features.oneResume'),
      t('pricing.features.allTemplates'),
      t('pricing.features.pdfDownload'),
      t('pricing.features.aiSuggestions'),
    ],
    cta: currentUser ? t('pricing.cta.signedIn') : t('pricing.cta.notSignedIn'),
    link: currentUser ? '/build' : '/signup',
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-center mb-12">{t('pricing.title')}</h1>
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col">
          <h3 className="text-2xl font-semibold mb-4">{plan.name}</h3>
          <p className="text-3xl font-bold mb-6">{plan.price}</p>
          <ul className="mb-8 flex-grow">
            {plan.features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-center mb-2">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            to={plan.link}
            className="w-full py-2 rounded-lg font-semibold text-center bg-blue-600 text-white hover:bg-blue-700"
          >
            {plan.cta}
          </Link>
        </div>
      </div>
      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          {t('pricing.startBuilding')}
        </p>
      </div>
    </div>
  );
};

export default Pricing;
