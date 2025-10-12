import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, CheckCircle2, XCircle, Lightbulb, BookOpen } from 'lucide-react';

const UnifiedSentenceLearning = () => {
  const [sentenceData, setSentenceData] = useState(null);
  const [currentSet, setCurrentSet] = useState('mentalStateSentences');
  const [currentUnit, setCurrentUnit] = useState(0);
  const [stage, setStage] = useState('prediction');
  const [selectedOption, setSelectedOption] = useState(null);
  const [strength, setStrength] = useState([]);

  // 加载JSON数据
  useEffect(() => {
    const loadSentenceData = async () => {
      try {
        const response = await fetch('./sentence_data.json');
        const data = await response.json();
        setSentenceData(data);
        
        // 初始化学习强度数据
        const initialStrength = data[currentSet].map(() => ({ V: 0, trials: 0 }));
        setStrength(initialStrength);
      } catch (error) {
        console.error('加载句子数据失败:', error);
        setSentenceData({
          mentalStateSentences: [],
          backPainSentences: []
        });
      }
    };

    loadSentenceData();
  }, []);

  // 当切换句子集时重新初始化
  useEffect(() => {
    if (sentenceData && sentenceData[currentSet]) {
      const initialStrength = sentenceData[currentSet].map(() => ({ V: 0, trials: 0 }));
      setStrength(initialStrength);
      setCurrentUnit(0);
      setStage('prediction');
      setSelectedOption(null);
    }
  }, [currentSet, sentenceData]);

  if (!sentenceData || !sentenceData[currentSet] || !sentenceData[currentSet].length) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载句子数据...</p>
        </div>
      </div>
    );
  }

  const learningUnits = sentenceData[currentSet];
  const unit = learningUnits[currentUnit];
  const currentStrength = strength[currentUnit] || { V: 0, trials: 0 };

  const updateStrength = (isCorrect) => {
    const alpha = 0.35;
    const beta = 0.45;
    const lambda = isCorrect ? unit.lambda : 0;
    const V_all = currentStrength.V;
    
    const predictionError = lambda - V_all;
    const deltaV = alpha * beta * predictionError;
    const newV = Math.max(0, Math.min(10, V_all + deltaV));
    
    const newStrength = [...strength];
    newStrength[currentUnit] = {
      V: newV,
      trials: currentStrength.trials + 1
    };
    setStrength(newStrength);
    
    return { predictionError, deltaV, newV };
  };

  const handlePredictionSubmit = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === 'correct';
    updateStrength(isCorrect);
    
    setStage('feedback');
  };

  const handleNext = () => {
    if (stage === 'feedback') {
      setStage('grammar');
    } else if (stage === 'grammar') {
      setStage('semantic');
    } else if (stage === 'semantic') {
      if (currentUnit < learningUnits.length - 1) {
        setCurrentUnit(currentUnit + 1);
        setStage('prediction');
        setSelectedOption(null);
      } else {
        setStage('complete');
      }
    }
  };

  const handleReset = () => {
    setCurrentUnit(0);
    setStage('prediction');
    setSelectedOption(null);
    setStrength(learningUnits.map(() => ({ V: 0, trials: 0 })));
  };

  const sentenceSets = {
    mentalStateSentences: '心理状态句子',
    backPainSentences: '背痛相关句子'
  };

  if (stage === 'complete') {
    const avgStrength = strength.reduce((acc, s) => acc + s.V, 0) / strength.length;
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <CheckCircle2 className="mx-auto text-green-600 mb-4" size={64} />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">完成全部训练！</h1>
            <div className="text-6xl font-bold text-green-600 mb-2">
              {avgStrength.toFixed(1)} / 10
            </div>
            <p className="text-gray-600">平均掌握度</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="font-bold text-lg mb-4">📊 各句掌握情况</h3>
            <div className="space-y-3">
              {learningUnits.map((unit, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{unit.title}</span>
                    <span className="text-sm text-gray-600">
                      {strength[idx].V.toFixed(1)} / 10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                      style={{ width: `${(strength[idx].V / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg mb-6">
            <h3 className="font-bold text-lg mb-3">🎯 完整段落回顾</h3>
            <div className="space-y-3 text-gray-700">
              {learningUnits.map((unit, idx) => (
                <p key={idx} className="text-lg leading-relaxed">
                  {unit.sentence}
                </p>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              重新学习当前集
            </button>
            <button
              onClick={() => {
                const otherSet = currentSet === 'mentalStateSentences' ? 'backPainSentences' : 'mentalStateSentences';
                setCurrentSet(otherSet);
              }}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              切换到其他句子集
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <BookOpen className="mr-3 text-blue-600" size={28} />
            🧠 R-W句子理解训练
          </h1>
          <div className="text-sm text-gray-600">
            单元 {currentUnit + 1} / {learningUnits.length}
          </div>
        </div>

        {/* 句子集选择器 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择句子集：
          </label>
          <div className="flex gap-2">
            {Object.entries(sentenceSets).map(([key, label]) => (
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
            <span className="text-sm font-medium">当前句子掌握度</span>
            <span className="text-sm text-gray-600">
              {currentStrength.V.toFixed(1)} / 10 (试验: {currentStrength.trials})
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${(currentStrength.V / 10) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-lg mb-8 text-white">
          <div className="text-sm opacity-80 mb-2">{unit.title}</div>
          <div className="text-2xl font-bold">{unit.sentence}</div>
        </div>

        {stage === 'prediction' && (
          <div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
              <div className="flex items-start">
                <AlertTriangle className="text-yellow-600 mr-2 mt-1" size={20} />
                <div>
                  <h3 className="font-bold mb-2">预测性问题（制造认知冲突）</h3>
                  <p className="text-gray-700">{unit.prediction.question}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {unit.prediction.wrongOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(`wrong_${idx}`)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedOption === `wrong_${idx}`
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedOption === `wrong_${idx}`
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedOption === `wrong_${idx}` && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              ))}

              <button
                onClick={() => setSelectedOption('correct')}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  selectedOption === 'correct'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedOption === 'correct'
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedOption === 'correct' && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-800">{unit.prediction.correctAnswer}</span>
                </div>
              </button>
            </div>

            <button
              onClick={handlePredictionSubmit}
              disabled={selectedOption === null}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              提交答案
            </button>
          </div>
        )}

        {stage === 'feedback' && (
          <div>
            <div className={`p-6 rounded-lg mb-6 ${
              selectedOption === 'correct' 
                ? 'bg-green-50 border-2 border-green-500' 
                : 'bg-red-50 border-2 border-red-500'
            }`}>
              <div className="flex items-center mb-4">
                {selectedOption === 'correct' ? (
                  <CheckCircle2 className="text-green-600 mr-2" size={24} />
                ) : (
                  <XCircle className="text-red-600 mr-2" size={24} />
                )}
                <h3 className="text-xl font-bold">
                  {selectedOption === 'correct' ? '正确！理解准确 ✓' : '这是常见误解！'}
                </h3>
              </div>

              <div className="bg-white p-4 rounded-lg mb-4">
                <h4 className="font-bold text-sm text-gray-700 mb-2">💡 解释</h4>
                <p className="text-gray-700">{unit.prediction.explanation}</p>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-sm text-gray-700 mb-3">🧠 R-W学习分析</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-gray-600 text-xs">当前掌握度</div>
                    <div className="font-bold text-blue-600">{currentStrength.V.toFixed(2)}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="text-gray-600 text-xs">试验次数</div>
                    <div className="font-bold text-purple-600">{currentStrength.trials}</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              继续：查看语法分析 →
            </button>
          </div>
        )}

        {stage === 'grammar' && (
          <div>
            <div className="bg-indigo-50 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Brain className="mr-2 text-indigo-600" size={24} />
                语法结构分析
              </h3>

              <div className="bg-white p-4 rounded-lg mb-4">
                <div className="text-sm text-gray-600 mb-2">句型模式</div>
                <div className="font-mono text-blue-600 font-bold text-sm">
                  {unit.grammar.pattern}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {Object.entries(unit.grammar.breakdown).map(([key, value], idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-purple-400">
                    <div className="font-mono text-gray-800 font-bold mb-1">{key}</div>
                    <div className="text-sm text-gray-600">{value}</div>
                  </div>
                ))}
              </div>

              {unit.grammar.keyPoint && (
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <h4 className="font-bold text-sm mb-2">🔑 关键要点</h4>
                  <p className="text-sm text-gray-700">{unit.grammar.keyPoint}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              继续：语义分析 →
            </button>
          </div>
        )}

        {stage === 'semantic' && (
          <div>
            <div className="bg-purple-50 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Lightbulb className="mr-2 text-purple-600" size={24} />
                {unit.semanticAnalysis.title}
              </h3>

              <div className="space-y-3 mb-4">
                {unit.semanticAnalysis.layers.map((layer, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg">
                    <div className="font-bold text-purple-700 mb-2">{layer.level}</div>
                    <div className="text-gray-700 text-sm">{layer.content}</div>
                  </div>
                ))}
              </div>
            </div>

            {unit.criticalThinking && (
              <div className="bg-orange-50 p-6 rounded-lg mb-6 border-l-4 border-orange-400">
                <h3 className="font-bold text-lg mb-3">{unit.criticalThinking.question}</h3>
                <ul className="space-y-2">
                  {unit.criticalThinking.points.map((point, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              {currentUnit < learningUnits.length - 1 ? '下一个句子 →' : '完成训练 ✓'}
            </button>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-bold text-sm mb-2">学习进度总览</h4>
          <div className="grid grid-cols-2 gap-2">
            {learningUnits.map((u, idx) => (
              <div
                key={idx}
                className={`p-3 rounded text-center ${
                  idx === currentUnit
                    ? 'bg-blue-500 text-white'
                    : idx < currentUnit
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <div className="font-bold text-sm">{u.title}</div>
                <div className="text-xs mt-1">{(strength[idx]?.V / 10 * 100 || 0).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSentenceLearning;