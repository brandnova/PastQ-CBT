import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaHome, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const TrialMode = ({ user, setUser }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [filters, setFilters] = useState({ subject: 'english', type: '', year: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.is_subscribed) {
      navigate('/questionbank');
    } else if (user.trial_complete) {
      setShowSubscriptionModal(true);
    }
  }, [user, navigate]);

  const fetchQuestions = async () => {
    if (showSubscriptionModal || user.trial_complete || user.trial_calls <= 0) {
      setShowSubscriptionModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { subject, type, year } = filters;
      let url = `https://questions.aloc.com.ng/api/v2/q?subject=${subject}`;
      if (type) url += `&type=${type}`;
      if (year) url += `&year=${year}`;
      
      const API_TOKEN = 'ALOC-4f56e66ca205556ccddc';
      
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'AccessToken': API_TOKEN 
        }
      });
      
      setQuestions(Array.isArray(response.data.data) ? response.data.data : [response.data.data]);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      
      // Update trial calls
      const updatedTrialCalls = user.trial_calls - 1;
      
      // Update backend
      const updateResponse = await axios.patch('http://localhost:8000/api/user', { trial_calls: updatedTrialCalls }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        withCredentials: true,
      });

      // Update local user state
      setUser(prevUser => ({
        ...prevUser,
        trial_calls: updatedTrialCalls
      }));

      if (updatedTrialCalls <= 0) {
        await axios.patch('http://localhost:8000/api/user', { trial_complete: true }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          withCredentials: true,
        });
        setUser(prevUser => ({
          ...prevUser,
          trial_complete: true
        }));
        setShowSubscriptionModal(true);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      if (err.response && err.response.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Optionally, redirect to login page or refresh token
        navigate('/auth');
      } else {
        setError('Failed to fetch questions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleAnswer = (selectedAnswer) => {
    if (showSubscriptionModal) return;
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionIndex]: selectedAnswer
    }));
  };

  const TermsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Trial Mode Terms</h2>
        <p className="mb-4">Welcome to the Trial Mode! Here's what you need to know:</p>
        <ul className="list-disc pl-5 mb-4">
          <li>You have access to a total of 10 question requests.</li>
          <li>You can select any subject, exam type, or year for each request.</li>
          <li>After exhausting your 10 requests, you'll need to subscribe for unlimited access.</li>
          <li>The trial gives you a taste of our service. Subscribe for full features!</li>
        </ul>
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-300"
          >
            Return Home
          </button>
          <button
            onClick={() => setShowTermsModal(false)}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  const SubscriptionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Trial Period Ended</h2>
        <p className="mb-4">You've reached the limit of your trial. Subscribe to our premium version to enjoy:</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Unlimited Access to Questions</li>
          <li>All Available Subjects</li>
          <li>Personalized CBT Settings</li>
          <li>CBT Timer</li>
          <li>Download Results as PDF</li>
          <li>Ad-free Experience</li>
        </ul>
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-300"
          >
            Return Home
          </button>
          <button
            onClick={() => navigate('/subscribe')}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );

  const UserInfoCard = () => (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex">
          <FaUser className="text-4xl mr-4" />
          <span>
            <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
            <p className="text-indigo-200">Trial User</p>
          </span>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">Trial Status:</p>
          <p className="text-xl font-bold">{user.trial_complete ? 'Completed' : 'Active'}</p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold">Remaining Trial Questions:</p>
          <p className="text-3xl font-bold">{user.trial_calls}</p>
        </div>
        
      </div>
    </div>
  );

  if (loading) return <div className="text-center mt-8">Loading question...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="w-full px-auto">
      <Navbar />
      <div className="container mx-auto px-4 bg-gray-100 min-h-screen py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">Trial Mode</h1>
        
        <UserInfoCard />
        
        {!showSubscriptionModal && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-wrap -mx-2">
                <div className="px-2 w-full sm:w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    name="subject"
                    value={filters.subject}
                    onChange={handleFilterChange}
                    className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="english">English</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                  </select>
                </div>
                <div className="px-2 w-full sm:w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Types</option>
                    <option value="utme">UTME</option>
                    <option value="wassce">WASSCE</option>
                    <option value="post-utme">Post-UTME</option>
                  </select>
                </div>
                <div className="px-2 w-full sm:w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Years</option>
                    {Array.from({ length: 23 }, (_, i) => 2023 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Get Question'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex items-center bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                >
                  <FaHome className="mr-2 text-lg" />
                  Back to Home
                </button>
              </div>
            </form>
          </div>
        )}
        
        {questions.length > 0 && !showSubscriptionModal && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <h2 className="text-xl font-semibold mb-4" dangerouslySetInnerHTML={{ __html: questions[currentQuestionIndex].question }} />
            {questions[currentQuestionIndex].image && (
              <img src={questions[currentQuestionIndex].image} alt="Question visual" className="mb-4 max-w-full h-auto" />
            )}
            <div className="space-y-2">
              {Object.entries(questions[currentQuestionIndex].option).filter(([key, value]) => value !== null).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={key}
                    onChange={() => handleAnswer(key)}
                    checked={userAnswers[currentQuestionIndex] === key}
                    className="form-radio text-indigo-600 focus:ring-indigo-500"
                  />
                  <span dangerouslySetInnerHTML={{ __html: value }} />
                </label>
              ))}
            </div>
            {userAnswers[currentQuestionIndex] && (
              <div className={`mt-4 p-2 rounded ${userAnswers[currentQuestionIndex] === questions[currentQuestionIndex].answer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {userAnswers[currentQuestionIndex] === questions[currentQuestionIndex].answer ? (
                  <span className="flex items-center"><FaCheck className="mr-2" /> Correct!</span>
                ) : (
                  <span className="flex items-center"><FaTimes className="mr-2" /> Incorrect. The correct answer is {questions[currentQuestionIndex].answer}.</span>
                )}
              </div>
            )}
          </motion.div>
        )}
        
        {showTermsModal && <TermsModal />}
        {showSubscriptionModal && <SubscriptionModal />}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6 h-20 w-full">
        <span>Ad Location</span>
      </div>
      </div>
    </div>
  );
};

export default TrialMode;