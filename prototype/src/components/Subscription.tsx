import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SubscriptionManagement from './SubscriptionManagement';
import ErrorBoundary from './ErrorBoundary';

const Subscription: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signin');
    } else if (user) {
      setUserId(user.id);
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-4">Subscription Management</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Upgrade your plan to access premium features and make your resume stand out.
          </p>
        </div>
        
        <ErrorBoundary>
          <SubscriptionManagement userId={userId} />
        </ErrorBoundary>
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/profile')}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription; 