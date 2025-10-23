import React from 'react';
import { BookOpen, Target, Zap, CheckCircle, Award } from 'lucide-react';

const MenuScreen = ({ setCurrentTest, scores }) => {
  const getRangeLevel = (score) => {
    if (score <= 11) return "Below Average";
    if (score <= 35) return "Average";
    if (score <= 48) return "Above Average";
    if (score <= 54) return "Excellent";
    return "Superior";
  };

  const getSpeedLevel = (score) => {
    if (score < 50) return "Below Average";
    if (score < 75) return "Average";
    if (score < 100) return "Above Average";
    if (score < 150) return "Excellent";
    return "Superior";
  };

  const getResponsivenessLevel = (score) => {
    if (score <= 15) return "Below Average";
    if (score <= 30) return "Average";
    if (score <= 40) return "Above Average";
    if (score <= 45) return "Excellent";
    return "Superior";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <BookOpen className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">English Vocabulary Test</h1>
            <p className="text-gray-600">Test your vocabulary range, speed, and responsiveness</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div 
              onClick={() => setCurrentTest('range')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform shadow-lg"
            >
              <Target className="w-12 h-12 mb-3" />
              <h2 className="text-xl font-bold mb-2">Vocabulary Range</h2>
              <p className="text-blue-100 text-sm mb-3">60 questions testing your word knowledge</p>
              <div className="text-xs bg-white/20 rounded px-2 py-1 inline-block">~15 minutes</div>
            </div>

            <div 
              onClick={() => setCurrentTest('speed')}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform shadow-lg"
            >
              <Zap className="w-12 h-12 mb-3" />
              <h2 className="text-xl font-bold mb-2">Verbal Speed</h2>
              <p className="text-purple-100 text-sm mb-3">Two timed tests of quick thinking</p>
              <div className="text-xs bg-white/20 rounded px-2 py-1 inline-block">6 minutes total</div>
            </div>

            <div 
              onClick={() => setCurrentTest('responsiveness')}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform shadow-lg"
            >
              <CheckCircle className="w-12 h-12 mb-3" />
              <h2 className="text-xl font-bold mb-2">Verbal Responsiveness</h2>
              <p className="text-green-100 text-sm mb-3">Find synonyms and antonyms</p>
              <div className="text-xs bg-white/20 rounded px-2 py-1 inline-block">~10 minutes</div>
            </div>
          </div>
        </div>

        {(scores.range || scores.speed.part1 || scores.responsiveness) && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Award className="w-8 h-8 text-yellow-500" />
              Your Scores
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {scores.range !== null && (
                <div className="border-2 border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-700 mb-2">Vocabulary Range</h3>
                  <div className="text-3xl font-bold text-blue-600">{scores.range}/60</div>
                  <div className="text-sm text-gray-600 mt-2">{getRangeLevel(scores.range)}</div>
                </div>
              )}
              {scores.speed.part1 !== null && (
                <div className="border-2 border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-700 mb-2">Verbal Speed</h3>
                  <div className="text-3xl font-bold text-purple-600">{scores.speed.part1 + scores.speed.part2}</div>
                  <div className="text-sm text-gray-600 mt-2">{getSpeedLevel(scores.speed.part1 + scores.speed.part2)}</div>
                </div>
              )}
              {scores.responsiveness !== null && (
                <div className="border-2 border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-700 mb-2">Responsiveness</h3>
                  <div className="text-3xl font-bold text-green-600">{scores.responsiveness}/50</div>
                  <div className="text-sm text-gray-600 mt-2">{getResponsivenessLevel(scores.responsiveness)}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuScreen;