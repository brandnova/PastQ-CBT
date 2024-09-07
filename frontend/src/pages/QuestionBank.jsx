// ALOC-4f56e66ca205556ccddc
import React, { useState, useEffect } from 'react';
import { FaFilter, FaCheck, FaTimes, FaShareAlt, FaSave, FaRedo, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [filters, setFilters] = useState({ subject: 'english', type: '', year: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { subject, type, year } = filters;
      let url = `https://questions.aloc.com.ng/api/v2/q?subject=${subject}`;
      if (type) url += `&type=${type}`;
      if (year) url += `&year=${year}`;
      
      // Replace with your actual access token
      const API_TOKEN = 'ALOC-4f56e66ca205556ccddc';
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'AccessToken': API_TOKEN 
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const data = await response.json();
      setQuestions(Array.isArray(data.data) ? data.data : [data.data]);
    } catch (err) {
      setError('Failed to fetch questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    setCurrentQuestionIndex(0);
    setUserAnswers({});
  };

  const handleAnswer = (selectedAnswer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionIndex]: selectedAnswer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(600);
    fetchQuestions();
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing results...');
  };

  const handleSave = () => {
    // Implement save functionality
    console.log('Saving results...');
  };

  if (loading) return <div className="text-center mt-8">Loading questions...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (questions.length === 0) return <div className="text-center mt-8">No questions available. Try changing filters.</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
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
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">Educational Quiz</h1>

      <div className="mb-6 flex flex-wrap justify-between items-center bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <FaFilter className="text-indigo-500" />
          <select
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="english">English</option>
            <option value="mathematics">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            {/* Add more subjects as needed */}
          </select>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="utme">UTME</option>
            <option value="wassce">WASSCE</option>
            <option value="post-utme">Post-UTME</option>
          </select>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Years</option>
            {Array.from({ length: 23 }, (_, i) => 2023 - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-indigo-600 font-semibold">
            Question: {currentQuestionIndex + 1}/{questions.length}
          </span>
          <span className="text-indigo-600 font-semibold flex items-center">
            <FaClock className="mr-2" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
        {currentQuestion.image && (
          <img src={currentQuestion.image} alt="Question visual" className="mb-4 max-w-full h-auto" />
        )}
        <div className="space-y-2">
          {Object.entries(currentQuestion.option).filter(([key, value]) => value !== null).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                value={key}
                onChange={() => handleAnswer(key)}
                checked={userAnswers[currentQuestionIndex] === key}
                className="form-radio text-indigo-600 focus:ring-indigo-500"
              />
              <span>{value}</span>
            </label>
          ))}
        </div>
        {userAnswers[currentQuestionIndex] && (
          <div className={`mt-4 p-2 rounded ${userAnswers[currentQuestionIndex] === currentQuestion.answer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {userAnswers[currentQuestionIndex] === currentQuestion.answer ? (
              <span className="flex items-center"><FaCheck className="mr-2" /> Correct!</span>
            ) : (
              <span className="flex items-center"><FaTimes className="mr-2" /> Incorrect. The correct answer is {currentQuestion.answer}.</span>
            )}
          </div>
        )}
      </motion.div>

      <div className="flex justify-between mb-6">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-300 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
          className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={handleReset}
          className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300 flex items-center"
        >
          <FaRedo className="mr-2" /> Reset
        </button>
        <button
          onClick={handleShare}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center"
        >
          <FaShareAlt className="mr-2" /> Share
        </button>
        <button
          onClick={handleSave}
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300 flex items-center"
        >
          <FaSave className="mr-2" /> Save
        </button>
      </div>
    </div>
  );
};

export default QuestionBank;