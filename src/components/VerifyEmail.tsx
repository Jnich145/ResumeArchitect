import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, CheckCircle } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [location.search]);

  // Handle token verification if token is in URL
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(`/api/auth/verify-email/${token}`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
          const data = await response.json();
          setError(data.message || 'Verification failed');
        }
      } catch (error) {
        setVerificationStatus('error');
        setError('An error occurred during verification');
        console.error('Verification error:', error);
      }
    };
    
    if (token) {
      verifyToken();
    }
  }, [token]);

  // Redirect if already verified
  useEffect(() => {
    if (user?.isVerified && verificationStatus === 'pending') {
      navigate('/profile');
    }
  }, [user, navigate, verificationStatus]);

  const handleResendVerification = async () => {
    setIsResending(true);
    setError(null);
    setResendSuccess(false);
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': localStorage.getItem('csrfToken') || '',
        },
        credentials: 'include',
        body: JSON.stringify({ email: user?.email }),
      });
      
      if (response.ok) {
        setResendSuccess(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Resend verification error:', error);
    } finally {
      setIsResending(false);
    }
  };

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

  if (token) {
    return (
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          {verificationStatus === 'pending' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Verifying Email</h2>
              <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your email...</p>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Email Verified!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Your email has been successfully verified.</p>
              <button
                onClick={() => navigate('/profile')}
                className="btn-primary w-full"
              >
                Go to Profile
              </button>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 text-red-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Verification Failed</h2>
              <p className="text-red-500 mb-6">{error || 'The verification link is invalid or has expired.'}</p>
              <button
                onClick={handleResendVerification}
                className="btn-primary w-full"
                disabled={isResending}
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <Mail className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Verify Your Email</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please verify your email address to access all features.
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            A verification email has been sent to <strong>{user.email}</strong>. 
            Please check your inbox and click the verification link.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md mb-6">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        
        {resendSuccess && (
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md mb-6">
            <p className="text-sm text-green-700 dark:text-green-300">
              Verification email has been resent successfully!
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={handleResendVerification}
            className="btn-primary w-full"
            disabled={isResending}
          >
            {isResending ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending...
              </div>
            ) : (
              'Resend Verification Email'
            )}
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="btn-secondary w-full"
          >
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 