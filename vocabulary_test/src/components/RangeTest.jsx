import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { rangeQuestions } from '../data/questions';

const RangeTest = ({ setCurrentTest, setScores }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15分钟
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFinished) {
      finishTest();
    }
  }, [timeLeft, isFinished]);

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    
    if (answerIndex === rangeQuestions[currentQuestion].answer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < rangeQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        finishTest();
      }
    }, 500);
  };

  const finishTest = () => {
    setIsFinished(true);
    setScores(prev => ({ ...prev, range: score }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Test Completed!</h2>
            <div className="text-6xl font-bold text-blue-600 mb-4">{score}/60</div>
            <p className="text-gray-600 mb-6">
              {score <= 11 ? "Below Average" : 
               score <= 35 ? "Average" : 
               score <= 48 ? "Above Average" : 
               score <= 54 ? "Excellent" : "Superior"}
            </p>
            <button
              onClick={() => setCurrentTest('menu')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentTest('menu')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Menu
          </button>
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Vocabulary Range Test</h2>
              <span className="text-gray-600">Question {currentQuestion + 1} of {rangeQuestions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / rangeQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {rangeQuestions[currentQuestion].word}
            </h3>
            <div className="grid gap-3">
              {rangeQuestions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-lg text-left transition-all ${
                    selectedAnswer === null
                      ? 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      : selectedAnswer === index
                      ? index === rangeQuestions[currentQuestion].answer
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-red-100 border-2 border-red-500'
                      : index === rangeQuestions[currentQuestion].answer
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RangeTest;