import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { responsivenessQuestions } from '../data/questions';

const ResponsivenessTest = ({ setCurrentTest, setScores }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10分钟
  const [isFinished, setIsFinished] = useState(false);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFinished) {
      finishTest();
    }
  }, [timeLeft, isFinished]);

  const checkAnswer = () => {
    const word = userInput.toLowerCase().trim();
    const current = responsivenessQuestions[currentQuestion];
    
    if (current.synonyms.includes(word) || current.antonyms.includes(word)) {
      setScore(score + 1);
    }

    setUserInput('');
    
    if (currentQuestion < responsivenessQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTest();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const finishTest = () => {
    setIsFinished(true);
    setScores(prev => ({ ...prev, responsiveness: score }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Responsiveness Test Completed!</h2>
            <div className="text-6xl font-bold text-green-600 mb-4">{score}/50</div>
            <p className="text-gray-600 mb-6">
              {score <= 15 ? "Below Average" : 
               score <= 30 ? "Average" : 
               score <= 40 ? "Above Average" : 
               score <= 45 ? "Excellent" : "Superior"}
            </p>
            <button
              onClick={() => setCurrentTest('menu')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentTest('menu')}
            className="flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Menu
          </button>
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Verbal Responsiveness Test</h2>
              <span className="text-gray-600">Question {currentQuestion + 1} of {responsivenessQuestions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / responsivenessQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Provide a synonym or antonym for:
            </h3>
            <div className="text-3xl font-bold text-green-600 mb-6">
              {responsivenessQuestions[currentQuestion].word}
            </div>
            <p className="text-gray-600 mb-4">
              Type a word that is either a synonym or antonym of the word above.
            </p>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your answer..."
              className="flex-1 p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:border-green-500"
              autoFocus
            />
            <button
              onClick={checkAnswer}
              disabled={!userInput.trim()}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Submit
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p>Synonyms: {responsivenessQuestions[currentQuestion].synonyms.join(', ')}</p>
            <p>Antonyms: {responsivenessQuestions[currentQuestion].antonyms.join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsivenessTest;