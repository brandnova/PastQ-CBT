import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap } from 'react-icons/fa';
import { BookOpen, GraduationCap, Lightbulb, PenTool, Brain } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '../components/alert';
import FormInput from '../components/FormInput';
import api from '../lib/api';
import Logo from '../assets/qbank.svg';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(
        `/${isLogin ? 'login' : 'register'}`,
        isLogin
          ? { 
              email: formData.email, 
              password: formData.password 
            }
          : { 
              email: formData.email, 
              password: formData.password, 
              password_confirm: formData.confirmPassword,
              first_name: formData.first_name,
              last_name: formData.last_name
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
    } finally {
      setLoading(false);
    }
  };

  const icons = [BookOpen, GraduationCap, Lightbulb, PenTool, Brain];

  const PasswordToggleButton = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-blue-500 transition-colors duration-200"
    >
      {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
    </button>
  );

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
      
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
        {error && (
          <Alert className="mb-6 bg-red-50 border-2 border-red-200 text-red-700">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 bg-green-50 border-2 border-green-200 text-green-700">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <img src={Logo} alt="Logo" className="h-12 w-auto rounded-full" />
            <span className="font-bold text-3xl text-indigo-900">Q-Bank</span>
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaGraduationCap className="mr-2 text-blue-500" />
            {isLogin ? 'Login' : 'Register'}
          </h1>
          <button
            onClick={handleToggle}
            className="bg-blue-500 text-white px-6 py-2 rounded-full 
                     transition duration-300 ease-in-out 
                     hover:bg-blue-600 hover:shadow-lg
                     focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            {isLogin ? 'Switch to Register' : 'Switch to Login'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <FormInput
                label="First Name"
                icon={FaUser}
                name="first_name"
                placeholder="Enter your first name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Last Name"
                icon={FaUser}
                name="last_name"
                placeholder="Enter your last name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </>
          )}

          <FormInput
            label="Email Address"
            icon={FaEnvelope}
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Password"
            icon={FaLock}
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            rightElement={PasswordToggleButton}
          />

          {!isLogin && (
            <FormInput
              label="Confirm Password"
              icon={FaLock}
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              rightElement={PasswordToggleButton}
            />
          )}

          {isLogin && (
            <div className="text-sm text-gray-600 mt-2 mb-6">
              Forgot Password?{' '}
              <Link to="/forgot-password" className="text-blue-500 hover:text-blue-600 hover:underline">
                Click Here
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white mt-2 py-3 px-4 rounded-lg
                       text-lg font-semibold
                       transition duration-300 ease-in-out
                       hover:bg-blue-600 hover:shadow-lg
                       focus:outline-none focus:ring-4 focus:ring-blue-200
                       ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;