import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Assuming you have a Navbar component

const Subscribe = ({ user }) => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    // Paystack payment page URL
    const paystackPaymentPageURL = 'https://paystack.com/pay/qbankpremium'; 

    // Redirect to Paystack payment page
    window.location.href = paystackPaymentPageURL;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">Subscribe to Premium</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Benefits of Premium Subscription</h2>
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
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Subscribe Now
            </button>
            <button
              onClick={() => navigate('/')}
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