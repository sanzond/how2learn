import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { speedPart1Questions, speedPart2Questions } from '../data/questions';

const SpeedTest = ({ setCurrentTest, setScores }) => {
  const [currentPart, setCurrentPart] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3 * 60); // 3分钟
  const [isFinished, setIsFinished] = useState(false);
  const [part1Score, setPart1Score] = useState(0);

  const currentQuestions = currentPart === 1 ? speedPart1Questions : speedPart2Questions;

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFinished) {
      if (currentPart === 1) {
        setPart1Score(score);
        setCurrentPart(2);
        setCurrentQuestion(0);
        setScore(0);
        setTimeLeft(3 * 60);
      } else {
        finishTest();
      }
    }
  }, [timeLeft, isFinished, currentPart]);

  const handleAnswer = (answer) => {
    if (answer === currentQuestions[currentQuestion].answer) {
      setScore(score + 1);
    }

    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      if (currentPart === 1) {
        setPart1Score(score + 1);
        setCurrentPart(2);
        setCurrentQuestion(0);
        setScore(0);
        setTimeLeft(3 * 60);
      } else {
        finishTest();
      }
    }
  };

  const finishTest = () => {
    setIsFinished(true);
    setScores(prev => ({ 
      ...prev, 
      speed: { 
        part1: part1Score, 
        part2: score 
      } 
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    const totalScore = part1Score + score;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Speed Test Completed!</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="border-2 border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-700 mb-2">Part 1 Score</h3>
                <div className="text-3xl font-bold text-purple-600">{part1Score}/30</div>
              </div>
              <div className="border-2 border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-700 mb-2">Part 2 Score</h3>
                <div className="text-3xl font-bold text-purple-600">{score}/30</div>
              </div>
            </div>
            <div className="border-2 border-purple-300 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-purple-700 mb-2">Total Score</h3>
              <div className="text-4xl font-bold text-purple-600">{totalScore}/60</div>
              <p className="text-gray-600 mt-2">
                {totalScore < 50 ? "Below Average" : 
                 totalScore < 75 ? "Average" : 
                 totalScore < 100 ? "Above Average" : 
                 totalScore < 150 ? "Excellent" : "Superior"}
              </p>
            </div>
            <button
              onClick={() => setCurrentTest('menu')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentTest('menu')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Menu
          </button>
          <div className="flex items-center gap-2 text-purple-600 font-semibold">
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Verbal Speed Test - Part {currentPart}
              </h2>
              <span className="text-gray-600">Question {currentQuestion + 1} of {currentQuestions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / currentQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-lg text-gray-700 mb-4">
              Are these words <span className="font-semibold">Synonyms (S)</span>, 
              <span className="font-semibold"> Antonyms (O)</span>, or 
              <span className="font-semibold"> Different (D)</span>?
            </p>
            <div className="text-2xl font-bold text-gray-800 mb-6">
              {currentQuestions[currentQuestion].colA} - {currentQuestions[currentQuestion].colB}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleAnswer('S')}
              className="bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              S (Synonyms)
            </button>
            <button
              onClick={() => handleAnswer('O')}
              className="bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              O (Antonyms)
            </button>
            <button
              onClick={() => handleAnswer('D')}
              className="bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              D (Different)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedTest;