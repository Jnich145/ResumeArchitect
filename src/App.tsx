import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import ResumeBuilder from './components/ResumeBuilder';
import Templates from './components/Templates';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import { DarkModeProvider } from './DarkModeContext';
import DarkModeToggle from './components/DarkModeToggle';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import About from './components/About';
import UserProfile from './components/UserProfile';

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
                </Routes>
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
