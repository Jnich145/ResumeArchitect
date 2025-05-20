import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { DarkModeProvider } from './DarkModeContext';
import DarkModeToggle from './components/DarkModeToggle';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Lazy load components for code splitting
const Home = lazy(() => import('./components/Home'));
const ResumeBuilder = lazy(() => import('./components/ResumeBuilder'));
const Templates = lazy(() => import('./components/Templates'));
const Features = lazy(() => import('./components/Features'));
const Pricing = lazy(() => import('./components/Pricing'));
const SignUp = lazy(() => import('./components/SignUp'));
const SignIn = lazy(() => import('./components/SignIn'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const About = lazy(() => import('./components/About'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const VerifyEmail = lazy(() => import('./components/VerifyEmail'));
const Subscription = lazy(() => import('./components/Subscription'));

// Loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
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
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/profile" element={
                      <PrivateRoute>
                        <UserProfile />
                      </PrivateRoute>
                    } />
                    <Route path="/verify-email" element={
                      <PrivateRoute>
                        <VerifyEmail />
                      </PrivateRoute>
                    } />
                    <Route path="/subscription" element={
                      <PrivateRoute>
                        <Subscription />
                      </PrivateRoute>
                    } />
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
}

export default App;
