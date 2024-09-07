import React from 'react';
import { Link } from 'react-router-dom';


const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 shadow-lg transition-all duration-300 ease-in-out">
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                <img src="https://via.placeholder.com/50" alt="Logo" className="h-8 w-auto mr-2 rounded-full" />
                <span className="font-bold text-xl"><Link to="/">Quiz App</Link></span>
                </div>
                <div className="flex space-x-3 list-none relative group">
                    <li className="hover:text-blue-500 transition-colors duration-200 py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"><Link to="/">Home</Link></li>
                    <li className="hover:text-blue-500 transition-colors duration-200 py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"><Link to="/questionbank">CBT</Link></li>
                </div>
            </div>
        </div>
    </nav>
  );
};

export default Navbar;
