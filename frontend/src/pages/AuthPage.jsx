import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap } from 'react-icons/fa';
import { BookOpen, GraduationCap, Lightbulb, PenTool, Brain } from 'lucide-react';
import axios from 'axios';
import Logo from '../assets/qbank.svg';
import { Link, useNavigate, useLocation } from 'react-router-dom';


const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/'); 
    }
  }, [navigate]);

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setFormData({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '' });
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
  
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const response = await axios.post(
        `http://localhost:8000/api/${isLogin ? 'login' : 'register'}`,
        isLogin
          ? { email: formData.email, password: formData.password }
          : { 
              email: formData.email, 
              password: formData.password, 
              password_confirm: formData.confirmPassword,
              first_name: formData.first_name,
              last_name: formData.last_name
            },
        {
          withCredentials: true
        }
      );

      if (isLogin) {
        if (response.data.token) {
          localStorage.setItem('access_token', response.data.token);
          setSuccess('Login successful. Redirecting...');
          setTimeout(() => {
            const from = location.state?.from?.pathname || '/questionbank';
            navigate(from, { replace: true });
          }, 2000);
        }
      } else {
        setSuccess('Registration successful. Please log in.');
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ ...formData, password: '', confirmPassword: '' });
        }, 2000);
      }
      
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'An error occurred');
      console.error(err);
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
        const size = 16 + Math.random() * 32;
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
            <>
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="text"
                name="last_name"
                id="last_name"
                required
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>
          </>
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
          {isLogin && (
          <p> Forgot Password? <Link to="/forgot-password" className="text-blue-500 hover:underline hover:text-blue-400">Click Here</Link></p>
          )}
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
