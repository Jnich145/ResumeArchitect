import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showMockSignup, setShowMockSignup] = useState(false);
  const { signUp, error, clearError, isLoading, mockSignIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validateForm = () => {
    if (!name.trim()) {
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return false;
    }
    if (password.length < 6) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validateForm()) return;
    
    try {
      await signUp(email, password, name);
      navigate('/build');
    } catch (err: any) {
      console.error('Sign up error:', err);
      // Show mock signup option if there was a connection error
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setShowMockSignup(true);
      }
    }
  };

  const handleMockSignup = () => {
    mockSignIn({ 
      email, 
      name,
      id: 'mock-' + Date.now().toString()
    });
    navigate('/build');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('signUp.title')}</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">{t('signUp.nameLabel')}</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('signUp.namePlaceholder') || 'Enter your name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">{t('signUp.emailLabel')}</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('signUp.emailPlaceholder') || 'Enter your email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">{t('signUp.passwordLabel')}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('signUp.passwordPlaceholder') || 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? t('signUp.loading') : t('signUp.submit')}
            </button>
          </div>
        </form>

        {/* Development mock signup button - only shown after a connection error */}
        {showMockSignup && (
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Development Testing</span>
              </div>
            </div>
            <button
              onClick={handleMockSignup}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
            >
              Use Mock Authentication
            </button>
            <p className="mt-2 text-xs text-center text-gray-500">
              This option is only available in development when the server is unavailable.
            </p>
          </div>
        )}

        <div className="text-center">
          <p>{t('signUp.alreadyHaveAccount')} <Link to="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">{t('signUp.signIn')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
