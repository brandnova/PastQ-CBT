import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';

const TelegramFloatingButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 20,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.1,
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.4,
        type: "tween"
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white shadow-2xl rounded-xl p-5 w-72 max-w-xs border border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Join Our Community</h3>
              <motion.button 
                onClick={toggleExpand}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </motion.button>
            </div>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
             Connect with other members, get updates, and join live Q & A sessions and discussions in our Telegram community!
            </p>
            <motion.a 
              href="https://t.me/qbankbykumotechs" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <Send size={20} className="mr-3" />
              Join Telegram Channel
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={toggleExpand}
        className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
        aria-label="Telegram Community"
      >
        <Send size={28} />
      </motion.button>
    </div>
  );
};

export default TelegramFloatingButton;