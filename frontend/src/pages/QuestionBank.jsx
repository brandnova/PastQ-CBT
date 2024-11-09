import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaClock, FaRedo, FaHome, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  GraduationCap, 
  Lightbulb, 
  PenTool, 
  Brain,
  BookOpenCheck,
  Timer,
  Hash,
  CalendarDays,
  GraduationCap as ExamIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../assets/qbank.svg';
import Navbar from '../components/Navbar';
import UserInfoCard from '../components/UserInfoCard';
import FormInput from '../components/FormInput';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const QBankApp = ({ user }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    subject: 'english',
    examType: 'utme',
    numberOfQuestions: 15,
    timeLimit: 30, // in minutes
    year: '', 
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const icons = [BookOpen, GraduationCap, Lightbulb, PenTool, Brain];

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
      const { subject, examType, numberOfQuestions, year } = quizSettings;
      let url = `https://questions.aloc.com.ng/api/v2/m/${numberOfQuestions}?subject=${subject}&type=${examType}&random=true`;
      if (year) url += `&year=${year}`; 

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

  const generatePDF = () => {
    const input = document.getElementById('resultSection');
    
    // Get the full dimensions of the element, including content not visible on screen
    const fullHeight = input.scrollHeight;
    const fullWidth = input.scrollWidth;
  
    // Set up html2canvas options to capture full content
    const html2canvasOptions = {
      height: fullHeight,
      width: fullWidth,
      windowHeight: fullHeight,
      windowWidth: fullWidth,
      scrollY: -window.scrollY,
      scrollX: -window.scrollX
    };
  
    // Convert the HTML content into canvas
    html2canvas(input, html2canvasOptions).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: fullWidth > fullHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = fullWidth;
      const imgHeight = fullHeight;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      // Adding the image to the PDF (centered, maintaining aspect ratio)
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Save the PDF
      pdf.save("quiz-result.pdf");
    });
  };

  const renderHTML = (html) => {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };


  if (loading) return <div className="text-center mt-10">Loading questions...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  if (!quizStarted && !quizCompleted) {
    const subjectOptions = [
      { value: 'english', label: 'English' },
      { value: 'mathematics', label: 'Mathematics' },
      { value: 'physics', label: 'Physics' },
      { value: 'chemistry', label: 'Chemistry' },
      { value: 'commerce', label: 'Commerce' },
      { value: 'accounting', label: 'Accounting' },
      { value: 'biology', label: 'Biology' }
    ];

    const examTypeOptions = [
      { value: 'utme', label: 'UTME' },
      { value: 'wassce', label: 'WASSCE' },
      { value: 'post-utme', label: 'Post-UTME' }
    ];

    const yearOptions = [
      { value: '', label: 'All Years' },
      ...Array.from({ length: 23 }, (_, i) => ({
        value: String(2023 - i),
        label: String(2023 - i)
      }))
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
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
        <Navbar />
        <h1 className="text-3xl mt-5 font-bold text-center mb-8 text-indigo-900">Setup</h1>
        <UserInfoCard user={user} quizSettings={quizSettings} quizCompleted={quizCompleted} />
        <div className="bg-white rounded-lg shadow-md p-6 m-6">
          <FormInput
            label="Subject"
            icon={BookOpenCheck}
            type="select"
            name="subject"
            value={quizSettings.subject}
            onChange={handleSettingsChange}
            options={subjectOptions}
          />

          <FormInput
            label="Exam Type"
            icon={GraduationCap}
            type="select"
            name="examType"
            value={quizSettings.examType}
            onChange={handleSettingsChange}
            options={examTypeOptions}
          />

          <FormInput
            label="Year"
            icon={CalendarDays}
            type="select"
            name="year"
            value={quizSettings.year}
            onChange={handleSettingsChange}
            options={yearOptions}
          />

          <FormInput
            label="Number of Questions"
            icon={Hash}
            type="number"
            name="numberOfQuestions"
            value={quizSettings.numberOfQuestions}
            onChange={handleSettingsChange}
            min="1"
            max="100"
            placeholder="Enter number of questions"
            rightElement={
              <span className="text-sm text-gray-500">questions</span>
            }
          />

          <FormInput
            label="Time Limit"
            icon={Timer}
            type="range"
            name="timeLimit"
            value={quizSettings.timeLimit}
            onChange={handleSettingsChange}
            min="10"
            max="120"
            step="5"
            unit="m"
            showValue={true}
          />

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
      <div className=" bg-gray-100 pb-4">
          <Navbar />
          <div id="resultSection" className="mb-4 p-4 min-h-screen">
          <div className="flex items-center justify-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src={Logo} alt="Logo" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-semibold text-gray-800">Q-Bank</span>
            </Link>
          </div>
          <UserInfoCard user={user} quizSettings={quizSettings} quizCompleted={quizCompleted} />
          <div className="bg-white rounded-lg shadow-md p-6 m-6">
            <div className="justify-between mb-2">
              <h2 className="text-2xl font-bold mb-4">Your Score: {score} / {questions.length}</h2>
            </div>
            {questions.map((question, index) => (
              <div key={index} className="mb-6 p-4 border rounded">
                <h3 className="font-semibold mb-2">Question {index + 1}:</h3>
                {renderHTML(question.question)}
                <p className={`mt-2 ${userAnswers[index] === question.answer ? 'text-green-600' : 'text-red-600'}`}>
                  Your answer: {question.option[userAnswers[index]] || 'Not answered'}
                </p>
                <p className="mt-1">
                  Correct answer: {question.option[question.answer]}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center space-x-4 my-6">
            <button
              onClick={handleRetakeQuiz}
              className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-300 flex items-center"
            >
              <FaRedo className="mr-2" /> Retake Quiz
            </button>
            <button onClick={generatePDF} className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition duration-300 flex items-center"
            >
              <FaSave className="mr-2" /> Download as PDF
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
    <div>
        <Navbar />
      <div className=" mx-auto p-4 bg-gray-100 min-h-screen">
        <h1 className="text-3xl mt-5 font-bold text-center mb-8 text-indigo-900">Questions</h1>

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
    </div>
  );
};

export default QBankApp;
