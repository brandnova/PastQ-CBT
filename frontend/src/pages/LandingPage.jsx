import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BookOpen, GraduationCap, Lightbulb, PenTool, Brain } from 'lucide-react';

const LandingPage = () => {
  const icons = [BookOpen, GraduationCap, Lightbulb, PenTool, Brain];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
      <Navbar />
      
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
      
      <div className="flex flex-col items-center justify-center min-h-screen text-white z-10 relative">
        <h1 className="text-5xl font-bold mb-4 text-center">Welcome to Question Bank</h1>
        <p className="text-xl mb-8 p-5 text-center max-w-2xl">
          Enhance your learning with our comprehensive collection of past exam questions. Practice, learn, and excel in your studies.
        </p>
        <Link to="/questionbank">
          <button className="bg-white text-blue-500 font-bold py-3 px-6 rounded-full hover:bg-blue-100 transition duration-300 transform hover:scale-105">
            Explore Question Bank
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;