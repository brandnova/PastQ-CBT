import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaClock, FaRedo, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';


const AdvancedEducationalQuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    subject: 'english',
    examType: 'utme',
    numberOfQuestions: 40,
    timeLimit: 60, // in minutes
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && !timerPaused) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && quizStarted) {
      handleQuizSubmit();
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, timerPaused]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { subject, examType, numberOfQuestions } = quizSettings;
      const url = `https://questions.aloc.com.ng/api/v2/m/${numberOfQuestions}?subject=${subject}&type=${examType}&random=true`;

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
      setQuestions(data.data);
      setTimeLeft(quizSettings.timeLimit * 60);
      setQuizStarted(true);
    } catch (err) {
      setError('Failed to fetch questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setQuizSettings((prevSettings) => ({ ...prevSettings, [name]: value }));
  };

  const handleStartQuiz = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    fetchQuestions();
  };

  const handleAnswer = (selectedAnswer) => {
    if (!timerPaused) {
      setUserAnswers((prevAnswers) => ({
        ...prevAnswers,
        [currentQuestionIndex]: selectedAnswer
      }));
    }
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

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleToggleTimer = () => {
    setTimerPaused((prevPaused) => !prevPaused);
  };

  const handleQuizSubmit = () => {
    setQuizCompleted(true);
    setQuizStarted(false);
  };

  const handleRetakeQuiz = () => {
    handleStartQuiz();
  };

  const handleReturnHome = () => {
    setQuizCompleted(false);
    setQuizStarted(false);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
  };

  const renderHTML = (html) => {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (loading) return <div className="text-center mt-8">Loading questions...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  if (!quizStarted && !quizCompleted) {
    return (
      <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
        <nav className={`${isSticky ? 'fixed top-0 left-0 right-0 shadow-lg' : ''} transition-all duration-300 ease-in-out`}>
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
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">CBT Setup</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <select
              name="subject"
              value={quizSettings.subject}
              onChange={handleSettingsChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="english">English</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="commerce">Commerce</option>
              <option value="accounting">Accounting</option>
              <option value="biology">Biology</option>
              
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Exam Type</label>
            <select
              name="examType"
              value={quizSettings.examType}
              onChange={handleSettingsChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="utme">UTME</option>
              <option value="wassce">WASSCE</option>
              <option value="post-utme">Post-UTME</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Number of Questions</label>
            <input
              type="number"
              name="numberOfQuestions"
              value={quizSettings.numberOfQuestions}
              onChange={handleSettingsChange}
              min="1"
              max="100"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
            <input
              type="range"
              name="timeLimit"
              value={quizSettings.timeLimit}
              onChange={handleSettingsChange}
              min="30"
              max="120"
              step="30"
              className="mt-1 block w-full"
            />
            <span className="text-sm text-gray-500">{quizSettings.timeLimit} minutes</span>
          </div>
          <button
            onClick={handleStartQuiz}
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-300"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const score = questions.reduce((acc, question, index) => {
      return acc + (userAnswers[index] === question.answer ? 1 : 0);
    }, 0);

    return (
      <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
        <nav className={`${isSticky ? 'fixed top-0 left-0 right-0 shadow-lg' : ''} transition-all duration-300 ease-in-out`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src="https://via.placeholder.com/50" alt="Logo" className="h-8 w-auto mr-2 rounded-full" />
            <span className="font-bold text-xl">Quiz App</span>
          </div>
        </div>
      </div>
    </nav>
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">CBT Results</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Score: {score} / {questions.length}</h2>
          {questions.map((question, index) => (
            <div key={index} className="mb-6 p-4 border rounded">
              <h3 className="font-semibold mb-2">Question {index + 1}:</h3>
              {renderHTML(question.question)}
              <p className="mt-2">
                Your answer: {question.option[userAnswers[index]] || 'Not answered'}
              </p>
              <p className={`mt-1 ${userAnswers[index] === question.answer ? 'text-green-600' : 'text-red-600'}`}>
                Correct answer: {question.option[question.answer]}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleRetakeQuiz}
            className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-300 flex items-center"
          >
            <FaRedo className="mr-2" /> Retake Quiz
          </button>
          <button
            onClick={handleReturnHome}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center"
          >
            <FaHome className="mr-2" /> Return to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <nav className={`${isSticky ? 'fixed top-0 left-0 right-0 shadow-lg' : ''} transition-all duration-300 ease-in-out`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src="https://via.placeholder.com/50" alt="Logo" className="h-8 w-auto mr-2 rounded-full" />
            <span className="font-bold text-xl">Quiz App</span>
          </div>
        </div>
      </div>
    </nav>
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">CBT Questions</h1>

      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-indigo-600 font-semibold">
            Question: {currentQuestionIndex + 1}/{questions.length}
          </span>
          <span className="text-indigo-600 font-semibold flex items-center">
            <FaClock className="mr-2" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <button
          onClick={handleToggleTimer}
          className={`p-2 rounded-full ${timerPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} transition duration-300`}
        >
          {timerPaused ? <FaPlay className="text-white" /> : <FaPause className="text-white" />}
        </button>
      </div>

      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">{renderHTML(currentQuestion.question)}</h2>
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
                disabled={timerPaused}
                className="form-radio text-indigo-600 focus:ring-indigo-500"
              />
              <span>{renderHTML(value)}</span>
            </label>
          ))}
        </div>
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

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => handleJumpToQuestion(index)}
            className={`w-8 h-8 rounded-full text-sm font-medium ${
              userAnswers[index]
                ? 'bg-green-500 text-white'
                : index === currentQuestionIndex
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <button
        onClick={handleQuizSubmit}
        className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
      >
        Submit Quiz
      </button>
    </div>
  );
};

export default AdvancedEducationalQuizApp;