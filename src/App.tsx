import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { DarkModeProvider } from './DarkModeContext';
import DarkModeToggle from './components/DarkModeToggle';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import VerifyEmail from './components/VerifyEmail';
import ResumeBuilder from './components/ResumeBuilder';
import ConversationalBuilder from './components/ConversationalBuilder';
import ResumeList from './components/ResumeList';
import UserProfile from './components/UserProfile';
import Home from './components/Home';
import About from './components/About';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Templates from './components/Templates';
import SubscriptionManagement from './components/SubscriptionManagement';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ATSScorer from './components/ATSScorer';

// Lazy load components for code splitting
const Subscription = lazy(() => import('./components/Subscription'));

// Loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <DarkModeProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Header />
              <DarkModeToggle />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    
                    <Route path="/create" element={
                      <PrivateRoute>
                        <ConversationalBuilder />
                      </PrivateRoute>
                    } />
                    
                    <Route path="/build" element={
                      <PrivateRoute>
                        <ResumeBuilder />
                      </PrivateRoute>
                    } />
                    
                    <Route path="/build/:section" element={
                      <PrivateRoute>
                        <ResumeBuilder />
                      </PrivateRoute>
                    } />
                    
                    <Route path="/resumes" element={
                      <PrivateRoute>
                        <ResumeList />
                      </PrivateRoute>
                    } />
                    
                    <Route path="/profile" element={
                      <PrivateRoute>
                        <UserProfile />
                      </PrivateRoute>
                    } />
                    
                    <Route path="/subscription" element={
                      <PrivateRoute>
                        <SubscriptionManagement />
                      </PrivateRoute>
                    } />
                    
                    <Route path="/analytics" element={
                      <PrivateRoute>
                        <AnalyticsDashboard />
                      </PrivateRoute>
                    } />
                    
                    <Route path="/ats" element={
                      <PrivateRoute>
                        <ATSScorer />
                      </PrivateRoute>
                    } />
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </DarkModeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
