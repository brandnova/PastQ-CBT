import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/HOC';
import LandingPage from './pages/LandingPage';
import QuestionBank from './pages/QuestionBank';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TrialMode from './pages/TrialPage';
import Subscribe from './pages/SubscribePage';
import PaymentRedirectHandler from './pages/PaymentRedirectHandler';
import { GlobalSettingsProvider } from './contexts/GlobalSettingsContext';


const App = () => {
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <GlobalSettingsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/questionbank" 
            element={
              <ProtectedRoute requireSubscription={true}>
                <QuestionBank />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trial" 
            element={
              <ProtectedRoute>
                <TrialMode />
              </ProtectedRoute>
            } 
          />
          <Route path="/about" element={<AboutPage />} />
          <Route 
            path="/subscribe" 
            element={
              <ProtectedRoute>
                <Subscribe />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
            } 
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route 
            path="/payment-redirect" 
            element={
              <ProtectedRoute>
                <PaymentRedirectHandler />
              </ProtectedRoute>
            } />
        </Routes>
      </Router>
    </GlobalSettingsProvider>
  );
};

export default App;