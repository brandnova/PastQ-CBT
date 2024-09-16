import React from 'react';
import { FaUser } from 'react-icons/fa';

const UserInfoCard = ({ user, quizSettings, quizCompleted }) => (
  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 m-6 text-white md:flex flex-col">
    {quizCompleted && (
      <div className="">
        <h1 className="text-3xl mt-5 font-bold text-center mb-8">Results</h1>
      </div>
    )}
    <div className="flex flex-col md:justify-between md:flex-row">
      <div className="flex">
        <div className="text-left flex flex-col space-y-1">
          <u className="text-lg font-semibold">CBT Settings</u>
          <span><b>Subject</b>: {quizSettings.subject.toUpperCase()}</span>
          <span><b>Exam Type:</b> {quizSettings.examType.toUpperCase()}</span>
          <span><b>Exam Year:</b> {quizSettings.year ? quizSettings.year : 'All Years'}</span>
          <span><b>Number Of Questions:</b> {quizSettings.numberOfQuestions}</span>
          <span><b>Time Limit:</b> {quizSettings.timeLimit} Minutes</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center my-4">
        <div className="flex items-center">
          <FaUser className="text-4xl mr-4" />
          <span>
            <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
            <p className="text-indigo-200">Premium User</p>
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default UserInfoCard;