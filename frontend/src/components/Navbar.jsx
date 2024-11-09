import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/qbank.svg';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const logout = async () => {
    try {
      await axios.post('https://qbank.backend.kumotechs.com/api/logout', {}, {
        withCredentials: true
      });
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      setIsAuthenticated(false);
      window.dispatchEvent(new Event('logout'));
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
      localStorage.removeItem('access_token');
      setIsAuthenticated(false);
      window.dispatchEvent(new Event('logout'));
      window.location.href = '/auth';
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="relative top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src={Logo} alt="Logo" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-semibold text-gray-800">Q-Bank</span>
            </Link>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <NavItems isAuthenticated={isAuthenticated} logout={logout} currentPath={location.pathname} />
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavItems isAuthenticated={isAuthenticated} logout={logout} mobile={true} currentPath={location.pathname} />
          </div>
        </div>
      )}
    </nav>
  );
};

const NavItems = ({ isAuthenticated, logout, mobile = false, currentPath }) => {
  const linkClasses = (path) =>
    `${mobile ? 'block' : 'inline-flex items-center'} px-3 py-2 rounded-md text-sm font-medium ${
      currentPath === path
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    } transition duration-150 ease-in-out`;

  const logoutClasses = `${mobile ? 'block' : 'inline-flex items-center'} px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition duration-150 ease-in-out`;

  return (
    <>
      <Link to="/" className={linkClasses('/')}>Home</Link>
      {isAuthenticated && <Link to="/subscribe" className={linkClasses('/subscribe')}>Subscribe</Link>}
      <Link to="/questionbank" className={linkClasses('/questionbank')}>CBT</Link>
      <Link to="/about" className={linkClasses('/about')}>About</Link>
      {isAuthenticated ? (
        <>
          <button onClick={logout} className={logoutClasses}>Logout</button>
        </>
      ) : (
        <Link to="/auth" className={linkClasses('/auth')}>Get Started</Link>
      )}
    </>
  );
};

export default Navbar;