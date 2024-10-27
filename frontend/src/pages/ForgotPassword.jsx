import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { BookOpen, GraduationCap, Lightbulb, PenTool, Brain } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const icons = [BookOpen, GraduationCap, Lightbulb, PenTool, Brain];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
  
    try {
      const response = await axios.post('https://qbank.backend.kumotechs.com/api/forgot', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
      {/* Background Icons */}

      {[...Array(20)].map((_, i) => {
          const Icon = icons[Math.floor(Math.random() * icons.length)];
          const top = `${Math.random() * 100}%`;
          const left = `${Math.random() * 100}%`;
          const size = 16 + Math.random() * 32; // Random size between 16 and 48
          return (
            <Icon 
              key={i}
              className="absolute text-white opacity-10"
              style={{top, left, width: size, height: size}}
            />
          );
        })}
      <Navbar />
      <div className="max-w-md mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center justify-center">Forgot Password</h2>
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;