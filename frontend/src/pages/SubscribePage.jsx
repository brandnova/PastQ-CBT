// src/pages/SubscribePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, ArrowLeft, Infinity, Zap, BookOpen, Headphones } from 'lucide-react';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import { Alert, AlertDescription } from '../components/alert';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card';
import { useGlobalSettings } from '../contexts/GlobalSettingsContext';

const BenefitItem = ({ icon: Icon, title, description }) => (
  <div className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex-shrink-0">
      <Icon className="h-6 w-6 text-indigo-600" />
    </div>
    <div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const Subscribe = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { settings, loading: settingsLoading } = useGlobalSettings();

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/payments/initialize/');
  
      if (response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      }
    } catch (error) {
      setError(
        error.response?.data?.error || 
        'Unable to initialize payment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Infinity,
      title: "Lifetime Access",
      description: "Unlimited access to all question banks, forever"
    },
    {
      icon: BookOpen,
      title: "Study Resources",
      description: "Comprehensive study materials and practice tests"
    },
    {
      icon: Headphones,
      title: "Premium Support",
      description: `Priority support at ${settings?.contact_email}`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center px-4 py-2 text-base font-medium 
              rounded-lg border-2 border-gray-300 bg-white shadow-sm
              hover:bg-gray-50 hover:border-gray-400 
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="h-5 w-5 mr-2 text-gray-600 group-hover:text-gray-800 
              transition-transform group-hover:-translate-x-0.5" />
            <span className="text-gray-700 group-hover:text-gray-900">Return to {settings?.site_name}</span>
          </button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-gray-500 outline outline-indigo-600">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Unlock Lifetime Access to {settings?.site_name}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            One-time payment for unlimited access to all our premium features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Benefits Section */}
          <div className="order-2 md:order-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Everything you get with Premium
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {benefits.map((benefit, index) => (
                <BenefitItem key={index} {...benefit} />
              ))}
            </div>
          </div>

          {/* Pricing Card */}
          <Card className="order-1 md:order-2 sticky top-6">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-center py-6">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Premium Access</h2>
              <div className="flex flex-col items-center">
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold">
                    ₦{settings?.subscription_price?.toLocaleString()}
                  </span>
                </div>
                <span className="text-indigo-100 text-sm mt-1">One-time payment</span>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Lifetime access to all features
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  No recurring fees
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Full access to future updates
                </li>
              </ul>
            </CardContent>

            <CardFooter className="bg-gray-50 p-6">
              <div className="w-full space-y-4">
                <button
                  onClick={handleSubscribe}
                  disabled={loading || settingsLoading}
                  className={`w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold
                    transition duration-300 shadow-md hover:shadow-lg
                    ${(loading || settingsLoading) ? 
                      'opacity-50 cursor-not-allowed' : 
                      'hover:bg-indigo-700 transform hover:-translate-y-0.5'
                    }`}
                >
                  {loading ? 'Processing...' : 'Get Lifetime Access'}
                </button>
                <div className="flex items-center justify-center text-sm text-gray-500 space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment via Paystack</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Subscribe;