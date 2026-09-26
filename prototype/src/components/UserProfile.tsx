import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CreditCard, LogOut, AlertTriangle, BarChart } from 'lucide-react';
import ResumeList from './ResumeList';
import AnalyticsDashboard from './AnalyticsDashboard';
import ErrorBoundary from './ErrorBoundary';

const UserProfile: React.FC = () => {
  const { user, isLoading, signOut } = useAuth();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumes' | 'analytics'>('resumes');
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { getUserSubscription } = await import('../services/subscriptionService');
        const subscription = await getUserSubscription();
        setIsPremium(subscription?.plan?.toLowerCase() === 'premium');
      } catch (error) {
        console.log('No active subscription found');
        setIsPremium(false);
      }
    };
    
    checkSubscription();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/signin');
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const subscriptionStatusBadge = () => {
    if (!user.subscription) return null;

    const { tier, status } = user.subscription;
    
    let colorClass = 'bg-gray-200 text-gray-800'; // Default
    
    if (tier === 'premium') {
      colorClass = status === 'active' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-amber-100 text-amber-800';
    } else if (tier === 'basic') {
      colorClass = status === 'active' 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-amber-100 text-amber-800';
    } else {
      colorClass = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {`${tier.charAt(0).toUpperCase() + tier.slice(1)} - ${status}`}
      </span>
    );
  };

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">Account Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left column - User Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl mb-4">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">{user.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
                {subscriptionStatusBadge()}
              </div>

              <hr className="my-6 border-gray-200 dark:border-gray-700" />

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between mb-2">
                  <span>Account Type:</span>
                  <span className="font-semibold">{user.role || 'User'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Member Since:</span>
                  <span className="font-semibold">{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Last Login:</span>
                  <span className="font-semibold">{formatDate(user.lastLogin)}</span>
                </div>
                {!user.isVerified && (
                  <div className="flex items-center mt-4 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span>Email not verified</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="w-full text-left px-4 py-3 flex items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => navigate('/profile/change-password')}
                  className="w-full text-left px-4 py-3 flex items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Lock className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Change Password</span>
                </button>
                {!user.isVerified && (
                  <button
                    onClick={() => navigate('/verify-email')}
                    className="w-full text-left px-4 py-3 flex items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-amber-600 dark:text-amber-400"
                  >
                    <Mail className="w-5 h-5 mr-3" />
                    <span>Verify Email</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/subscription')}
                  className="w-full text-left px-4 py-3 flex items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <CreditCard className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Manage Subscription</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')} 
                  className={`w-full text-left px-4 py-3 flex items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeTab === 'analytics' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                  }`}
                >
                  <BarChart className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  <span>View Analytics</span>
                </button>
                <button
                  onClick={() => setShowConfirmLogout(true)}
                  className="w-full text-left px-4 py-3 flex items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right column - Resume List or Analytics */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab('resumes')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'resumes' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                My Resumes
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Analytics
              </button>
            </div>
            
            {activeTab === 'resumes' ? (
              <ErrorBoundary>
                <ResumeList />
              </ErrorBoundary>
            ) : (
              <ErrorBoundary>
                <AnalyticsDashboard isPremium={isPremium} />
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Confirm Logout</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">Are you sure you want to log out of your account?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="btn-primary bg-red-500 hover:bg-red-600"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
