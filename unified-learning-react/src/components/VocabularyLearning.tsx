import React from 'react';
import { Zap, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { VocabularyItem, Feedback } from '../types';

interface VocabularyLearningProps {
  vocabularyLearningData: VocabularyItem[];
  currentIndex: number;
  showAnswer: boolean;
  userAnswer: string;
  feedback: Feedback | null;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onJumpToWord: (index: number) => void;
  playAudio: () => void;
}

const VocabularyLearning: React.FC<VocabularyLearningProps> = ({
  vocabularyLearningData,
  currentIndex,
  showAnswer,
  userAnswer,
  feedback,
  onAnswerChange,
  onSubmit,
  onNext,
  onPrevious,
  onJumpToWord,
  playAudio
}) => {
  const currentWord = vocabularyLearningData[currentIndex];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">📚 词汇学习模式</h2>
        <div className="text-sm text-gray-600">
          词汇 {currentIndex + 1} / {vocabularyLearningData.length}
        </div>
      </div>

      {/* 词汇学习内容 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">掌握度进度</span>
          <span className="text-sm text-gray-600">
            {(currentWord.totalStrength || 0).toFixed(1)} / {currentWord.lambda}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentWord.totalStrength || 0) / currentWord.lambda) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          试验次数: {currentWord.trials || 0}
        </div>
      </div>

      {/* 多重线索 */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-6">
        <div className="flex items-start mb-4">
          <Zap className="text-yellow-600 mr-2 mt-1" size={20} />
          <h3 className="font-bold text-lg text-gray-800">多重线索 (Multiple Cues)</h3>
        </div>
        
        <div className="space-y-3">
          {currentWord.cues.map((cue, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  {cue.type}
                </span>
              </div>
              <p className="text-gray-700 text-lg">{cue.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 词汇答题区域 */}
      {!showAnswer ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            根据上面的线索，这个词是：
          </label>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onSubmit();
                // 回车提交答案后也自动播放整个句子的mp3
                playAudio();
              }
            }}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            placeholder="输入英文单词..."
            autoFocus
          />
          <button
            onClick={() => {
              onSubmit();
              // 提交答案后自动播放整个句子的mp3
              playAudio();
            }}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            提交答案
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <div className={`p-6 rounded-lg mb-4 ${
            feedback?.isCorrect 
              ? 'bg-green-50 border-2 border-green-500' 
              : 'bg-red-50 border-2 border-red-500'
          }`}>
            <div className="flex items-center mb-4">
              {feedback?.isCorrect ? (
                <CheckCircle className="text-green-600 mr-2" size={24} />
              ) : (
                <XCircle className="text-red-600 mr-2" size={24} />
              )}
              <h3 className="text-xl font-bold">
                {feedback?.isCorrect ? '正确！✓' : '需要继续学习'}
              </h3>
            </div>

            {/* 词汇详情 */}
            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="mb-3">
                <span className="text-gray-600">单词：</span>
                <span className="font-bold text-2xl ml-2">{currentWord.word}</span>
              </div>
              <div className="mb-3">
                <span className="text-gray-600">释义：</span>
                <span className="ml-2">{currentWord.translation}</span>
              </div>
              <div className="mb-3">
                <span className="text-gray-600">例句：</span>
                <span className="ml-2 italic">{currentWord.example}</span>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg border-l-4 border-amber-500">
                <span className="text-amber-800 font-semibold">⚠️ 常见错误：</span>
                <span className="ml-2 text-sm text-amber-900 font-medium">{currentWord.commonMistake}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onPrevious}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition"
            >
              ← 上一个
            </button>
            <button
              onClick={onNext}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              下一个 →
            </button>
          </div>
        </div>
      )}

      {/* 所有词汇掌握情况 */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h4 className="font-bold mb-4 text-gray-800 flex items-center">
          <TrendingUp className="mr-2 text-blue-600" size={20} />
          所有词汇掌握情况
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {vocabularyLearningData.map((word, idx) => {
            const masterPercentage = ((word.totalStrength || 0) / word.lambda) * 100;
            const isCurrentWord = idx === currentIndex;
            
            return (
              <div
                key={idx}
                onClick={() => onJumpToWord(idx)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isCurrentWord 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : masterPercentage >= 80
                    ? 'bg-green-100 hover:bg-green-200 text-green-800'
                    : masterPercentage >= 50
                    ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                    : 'bg-red-100 hover:bg-red-200 text-red-800'
                }`}
              >
                <div className="text-sm font-medium truncate mb-1">
                  {word.word}
                </div>
                <div className="text-xs opacity-90 mb-2">
                  {masterPercentage.toFixed(0)}%
                </div>
                <div className="w-full bg-black bg-opacity-20 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCurrentWord 
                        ? 'bg-white' 
                        : masterPercentage >= 80
                        ? 'bg-green-600'
                        : masterPercentage >= 50
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(masterPercentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs mt-1 opacity-75">
                  试验: {word.trials || 0}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 掌握情况统计 */}
        <div className="mt-4 p-4 bg-white rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-2">
              <div className="text-2xl font-bold text-green-600">
                {vocabularyLearningData.filter(word => 
                  ((word.totalStrength || 0) / word.lambda) >= 0.8
                ).length}
              </div>
              <div className="text-xs text-gray-600">已掌握 (大于等于80%)</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-bold text-yellow-600">
                {vocabularyLearningData.filter(word => {
                  const percentage = (word.totalStrength || 0) / word.lambda;
                  return percentage >= 0.5 && percentage < 0.8;
                }).length}
              </div>
              <div className="text-xs text-gray-600">学习中 (50-80%)</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-bold text-red-600">
                {vocabularyLearningData.filter(word => 
                  ((word.totalStrength || 0) / word.lambda) < 0.5
                ).length}
              </div>
              <div className="text-xs text-gray-600">需加强 (少于50%)</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-bold text-blue-600">
                {(vocabularyLearningData.reduce((acc, word) => {
                  return acc + ((word.totalStrength || 0) / word.lambda);
                }, 0) / vocabularyLearningData.length * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">平均掌握度</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyLearning;