// src/pages/SubscribePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import { Alert, AlertDescription } from '../components/alert';

const Subscribe = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/payments/initialize/');
  
      // Redirect to Paystack checkout page
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

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">
          Subscribe to Premium
        </h1>
        
        {error && (
          <Alert className="bg-red-100 border-red-400 text-red-700 mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Benefits of Premium Subscription
          </h2>
          <ul className="list-disc pl-5 mb-6">
            <li>Unlimited access to all question banks</li>
            <li>Advanced analytics and performance tracking</li>
            <li>Personalized study plans</li>
            <li>Ad-free experience</li>
            <li>Priority customer support</li>
          </ul>
          
          <div className="flex justify-between">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className={`bg-indigo-600 text-white py-2 px-4 rounded-lg transition duration-300 
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
            <button
              onClick={() => navigate('/')}
              disabled={loading}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-300"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;