// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  return (
    <div className="landing-page mt-10">
        <Navbar />
      <div className="flex flex-col items-center">
        <h1>Welcome to the React App</h1>
        <p>This is a landing page for the application.</p>
        <Link to="/question-bank">
            <button>Go to Question Bank</button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
