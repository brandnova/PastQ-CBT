import { FaStar, FaGithub } from 'react-icons/fa';
import React from 'react';
import Navbar from '../components/Navbar';

const AboutPage = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">About Q-Bank</h1>
        <p className="mb-4">
          Q-Bank is an essential hub for aspiring examinees who wish to excel in their UTME, WASSCE, POST-UTME, and any other aptitude tests for O-Level graduates. Our app leverages a robust API provided by <a herf="https://questions.aloc.com.ng/" className="text-blue-500 hover:underline hover:text-blue-700">QBoard Endpoints</a>, offering a comprehensive and reliable question source to help students practice and prepare effectively for their exams. The database contains questions from 2001 through 2020 so you have a vast dataset of questions to test yourself with.
        </p>
        
        <h2 className="text-2xl font-bold mb-2">Features:</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Selection of desired subject</li>
          <li>Selection of exam type (UTME, WASSCE or POST-UTME)</li>
          <li>Select number of questions you wish to answer</li>
          <li>Set a timer to trask your answering speed</li>
          <li>Question map that allows you to skip a question and come back to it later.</li>
          <li>See your final result, compare with your answers and know what areas to work on.</li>
        </ul>
        <h2 className="text-2xl font-bold mb-2">About the Developer</h2> 

        <p className="mb-4"> This app was developed by <a href="https://github.com/brandnova/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline hover:text-blue-700">Ijeoma Jahsway</a> (Mr. Nova), a dedicated web developer passionate about crafting engaging, accessible, and user-friendly web applications. </p> 
        <p className="mb-4"> With a strong commitment to solving real-world challenges through code, and striving to create solutions that make meaningful impact. </p> 
        <p className="my-4"> If you’ve found value in using this app, consider showing your support by starring the project on GitHub: </p> 
        <a href="https://github.com/brandnova/numbers-gg" target="_blank" rel="noopener noreferrer" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block items-center" > <FaStar className="inline mb-1 text-yellow-300" /> Star on GitHub </a> 

        <p className="my-4"> You can also connect with, or follow Mr. Nova through the following channels: </p> 
        <ul className="list-disc pl-6"> 
            <li className="mb-2"> <a href="https://cn.coursearena.com.ng" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline hover:text-blue-700"> Coder Nova Blog </a> for updates and insights. </li> 
            <li className="mb-2"> <a href="https://www.linkedin.com/in/ijeoma-jahsway/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline hover:text-blue-700"> LinkedIn </a> to network professionally. </li> 
            <li className="mb-2"> <a href="mailto:uchennamebijay@gmail.com" className="text-blue-500 hover:underline hover:text-blue-700"> Email </a> for any inquiries or feedback. </li> 
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;