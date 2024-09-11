import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap } from 'react-icons/fa';
import { BookOpen, GraduationCap, Lightbulb, PenTool, Brain } from 'lucide-react';
import axios from 'axios';
import Logo from '../assets/qbank.svg';
import { Link } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  const handleToggle = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    // Check if passwords match during registration
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const response = await axios.post(
        `http://localhost:8000/api/${isLogin ? 'login' : 'register'}`,
        isLogin
          ? { email: formData.email, password: formData.password } // Login payload
          : { username: formData.username, email: formData.email, password1: formData.password, password2: formData.confirmPassword } // Register payload
      );
  
      // Store the token after a successful login/registration (if provided)
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
  
      // Handle success message
      setSuccess(response.data.message);
  
      // Redirect after successful login
      if (isLogin) {
        window.location.href = '/questionbank';
      }
      
    } catch (err) {
      // Enhanced error handling
      setError(err.response?.data?.detail || err.response?.data?.message || 'An error occurred');
    }
  };

  const icons = [BookOpen, GraduationCap, Lightbulb, PenTool, Brain];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden flex items-center justify-center">
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

      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <div className="flex items-center justify-center">
                <Link to="/" className="flex">
                <img src={Logo} alt="Logo" className="h-10 w-auto mr-2 rounded-full" />
                <span className="font-bold text-3xl text-indigo-900">
                Q-Bank
                </span>
                </Link>
            </div>
            <hr className="w-full my-5 border" />
            <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <FaGraduationCap className="mr-2 text-blue-500" />
                {isLogin ? 'Login' : 'Register'}
            </h1>
            <button
                onClick={handleToggle}
                className="bg-blue-500 text-white px-4 py-2 rounded-full transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
                {isLogin ? 'Switch to Register' : 'Switch to Login'}
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                required
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  id="confirmPassword"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
