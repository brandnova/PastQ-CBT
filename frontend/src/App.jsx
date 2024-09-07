import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import QuestionBank from './pages/QuestionBank';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/questionbank" element={<QuestionBank />} />
      </Routes>
    </Router>
  );
};

export default App;
