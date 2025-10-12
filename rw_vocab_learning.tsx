import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Zap } from 'lucide-react';

const VocabularyLearning = () => {
  // 词汇数据：设计多重线索（R-W的V_all概念）
  const vocabulary = [
    {
      word: "mental state",
      cues: [
        { type: "context", text: "My ___ is quite poor today", strength: 0 },
        { type: "synonym", text: "psychological condition / 心理状态", strength: 0 },
        { type: "image", text: "🧠💭", strength: 0 }
      ],
      translation: "心理/精神状态",
      example: "Her mental state improved after therapy.",
      lambda: 10 // 目标掌握度
    },
    {
      word: "drowsy",
      cues: [
        { type: "context", text: "I'm constantly ___", strength: 0 },
        { type: "symptom", text: "想睡觉、困倦的感觉", strength: 0 },
        { type: "image", text: "😴💤", strength: 0 }
      ],
      translation: "困倦的、昏昏欲睡的",
      example: "The medication made him feel drowsy.",
      lambda: 10
    },
    {
      word: "virus",
      cues: [
        { type: "context", text: "caught some kind of ___", strength: 0 },
        { type: "category", text: "病原体：bacteria/virus/fungus", strength: 0 },
        { type: "image", text: "🦠", strength: 0 }
      ],
      translation: "病毒",
      example: "The flu is caused by a virus.",
      lambda: 10
    },
    {
      word: "fasting",
      cues: [
        { type: "context", text: "___ could help alleviate it", strength: 0 },
        { type: "definition", text: "一段时间不吃东西", strength: 0 },
        { type: "image", text: "🚫🍽️", strength: 0 }
      ],
      translation: "禁食、斋戒",
      example: "Some people practice intermittent fasting.",
      lambda: 10
    },
    {
      word: "alleviate",
      cues: [
        { type: "context", text: "help ___ it", strength: 0 },
        { type: "synonym", text: "reduce, ease, relieve", strength: 0 },
        { type: "opposite", text: "反义：worsen, aggravate", strength: 0 }
      ],
      translation: "减轻、缓解",
      example: "Medicine can alleviate pain.",
      lambda: 10
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [learningData, setLearningData] = useState(
    vocabulary.map(v => ({ ...v, totalStrength: 0, trials: 0 }))
  );

  const currentWord = learningData[currentIndex];

  // R-W学习规则实现
  const updateStrength = (isCorrect) => {
    const alpha = 0.3; // 学习速率
    const beta = 0.4;
    const lambda = isCorrect ? currentWord.lambda : 0;
    const V_all = currentWord.totalStrength;
    
    // 计算预测误差
    const predictionError = lambda - V_all;
    
    // 更新联结强度
    const deltaV = alpha * beta * predictionError;
    const newStrength = Math.max(0, Math.min(10, V_all + deltaV));

    // 更新状态
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
    setCurrentIndex((currentIndex + 1) % vocabulary.length);
    setShowAnswer(false);
    setUserAnswer("");
    setFeedback(null);
  };

  const handlePrevious = () => {
    setCurrentIndex((currentIndex - 1 + vocabulary.length) % vocabulary.length);
    setShowAnswer(false);
    setUserAnswer("");
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            📚 R-W驱动词汇学习
          </h1>
          <div className="text-sm text-gray-600">
            词汇 {currentIndex + 1} / {vocabulary.length}
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">掌握度进度</span>
            <span className="text-sm text-gray-600">
              {currentWord.totalStrength.toFixed(1)} / {currentWord.lambda}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentWord.totalStrength / currentWord.lambda) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            试验次数: {currentWord.trials}
          </div>
        </div>

        {/* 多重线索区域（R-W的多CS设计） */}
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

        {/* 答题区域 */}
        {!showAnswer ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              根据上面的线索，这个词是：
            </label>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
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
            {/* 反馈区域 */}
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

              {/* R-W理论反馈 */}
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

              {/* 答案显示 */}
              <div className="bg-white p-4 rounded-lg">
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

        {/* R-W理论说明 */}
        <div className="mt-8 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
          <h4 className="font-bold mb-2 text-indigo-900">💡 学习原理（Rescorla-Wagner）</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li><strong>多线索设计：</strong>提供上下文、同义词、图像等多个提示，帮助建立丰富的联结网络</li>
            <li><strong>预测误差：</strong>你的答案正确性决定了学习强度的增减</li>
            <li><strong>渐进掌握：</strong>随着掌握度提升，每次学习的增量会自然减少</li>
            <li><strong>公式：</strong>ΔV = 0.3 × 0.4 × (目标强度 - 当前强度)</li>
          </ul>
        </div>

        {/* 整体进度 */}
        <div className="mt-6">
          <h4 className="font-bold mb-3">所有词汇掌握情况</h4>
          <div className="grid grid-cols-5 gap-2">
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

export default VocabularyLearning;