import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMockLogin, setShowMockLogin] = useState(false);
  const [rateLimit, setRateLimit] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { signIn, error, clearError, isLoading, mockSignIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Handle countdown timer for rate limit
  useEffect(() => {
    let timer: number;
    if (rateLimit && countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown(prevCount => prevCount - 1);
      }, 1000);
    } else if (countdown === 0 && rateLimit) {
      setRateLimit(false);
    }
    return () => clearTimeout(timer);
  }, [rateLimit, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await signIn(email, password);
      navigate('/build');
    } catch (err: any) {
      console.error('Sign in error:', err);
      
      // Check for rate limit error
      if (err.message && err.message.includes('Too many login attempts')) {
        setRateLimit(true);
        setCountdown(15 * 60); // 15 minutes in seconds
      }
      
      // Show mock login option if there was a connection error
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setShowMockLogin(true);
      }
    }
  };

  const handleMockLogin = () => {
    mockSignIn({ email });
    navigate('/build');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('signIn.title')}</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && !rateLimit && <p className="text-red-500 text-center">{error}</p>}
          
          {rateLimit && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Too many login attempts. Please try again after: <strong>{formatTime(countdown)}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">{t('signIn.emailLabel')}</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('signIn.emailPlaceholder') || 'Email address'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">{t('signIn.passwordLabel')}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('signIn.passwordPlaceholder') || 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || rateLimit}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${(isLoading || rateLimit) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? t('signIn.loading') : t('signIn.submit')}
            </button>
          </div>
        </form>

        {/* Development mock login button - only shown after a connection error */}
        {showMockLogin && (
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
              onClick={handleMockLogin}
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
          <p>{t('signIn.noAccount')} <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">{t('signIn.signUp')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
