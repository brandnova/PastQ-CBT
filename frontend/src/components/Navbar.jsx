import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/qbank.svg';

const Navbar = () => {

  return (
    <nav className="fixed relative top-0 left-0 right-0 px-4 transition-all duration-300 shadow-md ease-in-out">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex">
              <img src={Logo} alt="Logo" className="h-8 w-auto mr-2 rounded-full" />
              <span className="font-bold text-xl text-indigo-900">
              Q-Bank
              </span>
            </Link>
          </div>
          <div className="flex space-x-3 list-none relative group">
                <li className="hover:underline transition-colors duration-200 py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"><Link to="/">Home</Link></li>
                <li className="hover:underline transition-colors duration-200 py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"><Link to="/questionbank">CBT</Link></li>
                <li className="hover:underline transition-colors duration-200 py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"><Link to="/about">About</Link></li>
                <li className="hover:underline transition-colors duration-200 py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"><Link to="/auth">Get Started</Link></li>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
