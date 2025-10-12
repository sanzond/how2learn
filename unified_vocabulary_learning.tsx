import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Zap, TrendingUp, BookOpen } from 'lucide-react';

const UnifiedVocabularyLearning = () => {
  const [vocabularyData, setVocabularyData] = useState(null);
  const [currentSet, setCurrentSet] = useState('mentalStateSentences');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [learningData, setLearningData] = useState([]);

  // 加载JSON数据
  useEffect(() => {
    const loadVocabularyData = async () => {
      try {
        const response = await fetch('./vocabulary_data.json');
        const data = await response.json();
        setVocabularyData(data);
        
        // 初始化学习数据
        const initialData = data[currentSet].map(v => ({ 
          ...v, 
          totalStrength: 0, 
          trials: 0 
        }));
        setLearningData(initialData);
      } catch (error) {
        console.error('加载词汇数据失败:', error);
        // 如果加载失败，使用默认数据
        setVocabularyData({
          mentalStateSentences: [],
          backPainVocabulary: []
        });
      }
    };

    loadVocabularyData();
  }, []);

  // 当切换词汇集时重新初始化
  useEffect(() => {
    if (vocabularyData && vocabularyData[currentSet]) {
      const initialData = vocabularyData[currentSet].map(v => ({ 
        ...v, 
        totalStrength: 0, 
        trials: 0 
      }));
      setLearningData(initialData);
      setCurrentIndex(0);
      setShowAnswer(false);
      setUserAnswer("");
      setFeedback(null);
    }
  }, [currentSet, vocabularyData]);

  if (!vocabularyData || !learningData.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载词汇数据...</p>
        </div>
      </div>
    );
  }

  const currentWord = learningData[currentIndex];

  const updateStrength = (isCorrect) => {
    const alpha = 0.3;
    const beta = 0.4;
    const lambda = isCorrect ? currentWord.lambda : 0;
    const V_all = currentWord.totalStrength;
    
    const predictionError = lambda - V_all;
    const deltaV = alpha * beta * predictionError;
    const newStrength = Math.max(0, Math.min(10, V_all + deltaV));

    const newData = [...learningData];
    newData[currentIndex] = {
      ...currentWord,
      totalStrength: newStrength,
      trials: currentWord.trials + 1
    };
    setLearningData(newData);

    return { predictionError, deltaV, newStrength };
  };

  const handleSubmit = () => {
    const isCorrect = userAnswer.toLowerCase().trim() === currentWord.word.toLowerCase();
    const { predictionError, deltaV, newStrength } = updateStrength(isCorrect);
    
    setFeedback({
      isCorrect,
      predictionError: predictionError.toFixed(2),
      deltaV: deltaV.toFixed(2),
      newStrength: newStrength.toFixed(2)
    });
    setShowAnswer(true);
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % learningData.length);
    setShowAnswer(false);
    setUserAnswer("");
    setFeedback(null);
  };

  const handlePrevious = () => {
    setCurrentIndex((currentIndex - 1 + learningData.length) % learningData.length);
    setShowAnswer(false);
    setUserAnswer("");
    setFeedback(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showAnswer) {
      handleSubmit();
    }
  };

  const vocabularySets = {
    mentalStateSentences: '心理状态词汇',
    backPainVocabulary: '背痛相关词汇'
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <BookOpen className="mr-3 text-blue-600" size={32} />
            📚 R-W驱动词汇学习
          </h1>
          <div className="text-sm text-gray-600">
            词汇 {currentIndex + 1} / {learningData.length}
          </div>
        </div>

        {/* 词汇集选择器 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择词汇集：
          </label>
          <div className="flex gap-2">
            {Object.entries(vocabularySets).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCurrentSet(key)}
                className={`px-4 py-2 rounded-lg transition ${
                  currentSet === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">掌握度进度</span>
            <span className="text-sm text-gray-600">
              {currentWord.totalStrength.toFixed(1)} / {currentWord.lambda}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentWord.totalStrength / currentWord.lambda) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            试验次数: {currentWord.trials}
          </div>
        </div>

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

        {!showAnswer ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              根据上面的线索，这个词是：
            </label>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              placeholder="输入英文单词..."
              autoFocus
            />
            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              提交答案
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className={`p-6 rounded-lg mb-4 ${
              feedback.isCorrect 
                ? 'bg-green-50 border-2 border-green-500' 
                : 'bg-red-50 border-2 border-red-500'
            }`}>
              <div className="flex items-center mb-4">
                {feedback.isCorrect ? (
                  <CheckCircle className="text-green-600 mr-2" size={24} />
                ) : (
                  <XCircle className="text-red-600 mr-2" size={24} />
                )}
                <h3 className="text-xl font-bold">
                  {feedback.isCorrect ? '正确！✓' : '需要继续学习'}
                </h3>
              </div>

              <div className="bg-white p-4 rounded-lg mb-4">
                <h4 className="font-bold text-sm text-gray-700 mb-3">🧠 R-W学习分析</h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-gray-600 text-xs">预测误差</div>
                    <div className="font-bold text-blue-600">{feedback.predictionError}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="text-gray-600 text-xs">学习增量 ΔV</div>
                    <div className="font-bold text-purple-600">{feedback.deltaV}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-gray-600 text-xs">新强度</div>
                    <div className="font-bold text-green-600">{feedback.newStrength}</div>
                  </div>
                </div>
              </div>

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
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                  <span className="text-gray-600 font-semibold">⚠️ 常见错误：</span>
                  <span className="ml-2 text-sm">{currentWord.commonMistake}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition"
              >
                ← 上一个
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
              >
                下一个 →
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
          <h4 className="font-bold mb-2 text-indigo-900">💡 学习原理（Rescorla-Wagner）</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li><strong>多线索设计：</strong>提供上下文、同义词、图像等多个提示，建立丰富的联结网络</li>
            <li><strong>预测误差：</strong>答案正确性决定学习强度的增减（λ - V_all）</li>
            <li><strong>渐进掌握：</strong>随着掌握度提升，每次学习增量自然减少</li>
            <li><strong>公式：</strong>ΔV = 0.3 × 0.4 × (目标强度 - 当前强度)</li>
          </ul>
        </div>

        <div className="mt-6">
          <h4 className="font-bold mb-3">所有词汇掌握情况</h4>
          <div className="grid grid-cols-6 gap-2">
            {learningData.map((word, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setShowAnswer(false);
                  setUserAnswer("");
                  setFeedback(null);
                }}
                className={`p-2 rounded cursor-pointer transition ${
                  idx === currentIndex 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className="text-xs font-medium truncate">{word.word}</div>
                <div className="text-xs mt-1">
                  {(word.totalStrength / word.lambda * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedVocabularyLearning;