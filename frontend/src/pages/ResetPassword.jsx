import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { BookOpen, GraduationCap, Lightbulb, PenTool, Brain } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();
  const icons = [BookOpen, GraduationCap, Lightbulb, PenTool, Brain];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
  
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const response = await axios.post('https://qbank.backend.kumotechs.com/api/reset', {
        token,
        password,
        password_confirm: passwordConfirm
      });
      setMessage(response.data.message);
      setTimeout(() => navigate('/auth'), 2000); // Redirect to login page after 3 seconds
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
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block mb-1">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="passwordConfirm" className="block mb-1">Confirm New Password</label>
            <input
              type="password"
              id="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 shadow-md">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;