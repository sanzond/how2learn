import React, { useState, useEffect } from 'react';
import { CheckCircle, BookOpen, ArrowLeft, Play } from 'lucide-react';
import { LearningData, VocabularyItem, SentenceItem, Feedback } from './types';
import VocabularyLearning from './components/VocabularyLearning';
import SentenceLearning from './components/SentenceLearning';
import LearningSetSelector from './components/LearningSetSelector';
import { config } from './config';

const App: React.FC = () => {
  const [learningData, setLearningData] = useState<LearningData | null>(null);
  const [learningMode, setLearningMode] = useState<'vocabulary' | 'sentence'>('vocabulary');
  const [currentSet, setCurrentSet] = useState<keyof LearningData | null>(null);
  const [showSelector, setShowSelector] = useState(true);
  
  // 词汇学习状态
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [vocabularyLearningData, setVocabularyLearningData] = useState<VocabularyItem[]>([]);
  
  // 句子学习状态
  const [currentUnit, setCurrentUnit] = useState(0);
  const [sentenceStage, setSentenceStage] = useState<'prediction' | 'feedback' | 'grammar' | 'complete'>('prediction');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sentenceLearningData, setSentenceLearningData] = useState<SentenceItem[]>([]);

  // 加载JSON数据
  useEffect(() => {
    const loadLearningData = async () => {
      try {
        let response: Response;
        
        if (config.dataSource === 'network') {
          // 网络数据源
          console.log('从网络加载数据:', config.networkUrl);
          response = await fetch(config.networkUrl);
        } else {
          // 本地数据源
          console.log('从本地加载数据:', config.localPath);
          response = await fetch(config.localPath);
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: LearningData = await response.json();
        setLearningData(data);
        console.log('数据加载成功:', config.dataSource === 'network' ? '网络源' : '本地源');
      } catch (error) {
        console.error(`从${config.dataSource === 'network' ? '网络' : '本地'}加载学习数据失败:`, error);
        // 如果网络加载失败，尝试从本地加载作为后备
        if (config.dataSource === 'network') {
          try {
            console.log('网络加载失败，尝试从本地加载后备数据...');
            const fallbackResponse = await fetch(config.localPath);
            if (!fallbackResponse.ok) {
              throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
            }
            const fallbackData: LearningData = await fallbackResponse.json();
            setLearningData(fallbackData);
            console.log('后备数据加载成功');
          } catch (fallbackError) {
            console.error('后备数据加载也失败:', fallbackError);
            // 设置为 null 表示加载失败
            setLearningData(null);
          }
        } else {
          // 本地加载失败，设置为 null
          setLearningData(null);
        }
      }
    };

    loadLearningData();
  }, []);

  // 当切换数据集或学习模式时重新初始化
  useEffect(() => {
    if (learningData && currentSet && learningData[currentSet]) {
      if (learningData[currentSet].vocabulary) {
        const initialVocabData = learningData[currentSet].vocabulary.map(v => ({ 
          ...v, 
          totalStrength: 0, 
          trials: 0 
        }));
        setVocabularyLearningData(initialVocabData);
      }
      
      if (learningData[currentSet].sentences) {
        const initialSentenceData = learningData[currentSet].sentences.map(s => ({ 
          ...s, 
          V: 0, 
          trials: 0 
        }));
        setSentenceLearningData(initialSentenceData);
      }
      
      // 重置状态
      setCurrentIndex(0);
      setCurrentUnit(0);
      setShowAnswer(false);
      setUserAnswer("");
      setFeedback(null);
      setSentenceStage('prediction');
      setSelectedOption(null);
    }
  }, [currentSet, learningData]);

  // 处理学习集选择
  const handleLearningSetSelect = (setKey: keyof LearningData) => {
    setCurrentSet(setKey);
    setShowSelector(false);
  };

  // 返回选择界面
  const handleBackToSelector = () => {
    setShowSelector(true);
    setCurrentSet(null);
  };

  // 播放音频函数 - 播放完整句子
const playAudio = async () => {
  if (!learningData || !currentSet || !learningData[currentSet].audioUrl) {
    console.warn('音频URL不存在');
    return;
  }

  try {
    let audioUrl = learningData[currentSet].audioUrl;
    
    console.log('原始音频URL:', audioUrl);
    
    // 处理不同格式的音频URL
    if (audioUrl.startsWith('http://localhost:18080') || audioUrl.startsWith('http://127.0.0.1:18080')) {
      // 如果是完整的Odoo URL，直接使用（新的API接口支持跨域）
      console.log('使用完整URL访问音频:', audioUrl);
    } else if (audioUrl.startsWith('/api/learning/audio/')) {
      // 如果是相对路径的API接口，添加基础URL
      audioUrl = `http://127.0.0.1:18080${audioUrl}`;
      console.log('构建完整API URL:', audioUrl);
    } else if (!audioUrl.startsWith('http')) {
      // 其他相对路径，添加基础路径
      audioUrl = `http://127.0.0.1:18080${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
      console.log('构建完整URL:', audioUrl);
    }
    
    console.log('最终播放音频URL:', audioUrl);
    
    const audio = new Audio(audioUrl);
    
    // 添加事件监听器用于调试
    audio.addEventListener('loadstart', () => console.log('开始加载音频'));
    audio.addEventListener('canplay', () => console.log('音频准备就绪'));
    audio.addEventListener('loadeddata', () => console.log('音频数据加载完成'));
    audio.addEventListener('error', (e) => {
      console.error('音频加载错误:', e);
      console.error('错误的音频URL:', audioUrl);
      // 尝试测试音频接口
      testAudioAccess();
    });
    
    await audio.play();
    console.log('音频播放成功');
    
  } catch (error) {
    console.error('播放音频失败:', error);
    console.error('失败的音频URL:', learningData[currentSet].audioUrl);
  }
};



// 测试音频访问的辅助函数
const testAudioAccess = async () => {
  if (!learningData || !currentSet) return;
  
  try {
    // 从audioUrl中提取学习集ID
    const audioUrl = learningData[currentSet].audioUrl;
    const match = audioUrl.match(/\/api\/learning\/audio\/(\d+)/);
    if (match) {
      const learningSetId = match[1];
      const testUrl = `http://127.0.0.1:18080/api/learning/audio/test/${learningSetId}`;
      
      console.log('测试音频访问:', testUrl);
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('音频访问测试结果:', result);
      } else {
        console.error('音频访问测试失败:', response.status, response.statusText);
      }
    }
  } catch (error) {
    console.error('音频访问测试异常:', error);
  }
};

  // 检查是否有有效的学习数据
  const hasValidData = learningData && Object.keys(learningData).length > 0;
  if (!hasValidData) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">数据加载失败</h2>
          <p className="text-gray-600 mb-4">
            无法从{config.dataSource === 'network' ? '网络' : '本地'}加载学习数据
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-left">
            <p className="text-sm text-gray-700 mb-2"><strong>当前配置：</strong></p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 数据源：{config.dataSource === 'network' ? '网络' : '本地'}</li>
              <li>• {config.dataSource === 'network' ? '网络地址' : '本地路径'}：{config.dataSource === 'network' ? config.networkUrl : config.localPath}</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 显示学习集选择界面
  if (showSelector) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center">
              {/* <BookOpen className="mr-3 text-blue-600" size={40} /> */}
              🧠 预测学习平台
            </h1>
          </div>
          
          <LearningSetSelector
            learningData={learningData}
            onSelect={handleLearningSetSelect}
          />
        </div>
      </div>
    );
  }

  // 词汇学习相关函数
  const updateVocabularyStrength = (isCorrect: boolean) => {
    if (!vocabularyLearningData[currentIndex]) return { predictionError: 0, deltaV: 0, newStrength: 0 };
    
    const currentWord = vocabularyLearningData[currentIndex];
    const alpha = 0.3;
    const beta = 0.4;
    const lambda = isCorrect ? currentWord.lambda : 0;
    const V_all = currentWord.totalStrength || 0;
    
    const predictionError = lambda - V_all;
    const deltaV = alpha * beta * predictionError;
    const newStrength = Math.max(0, Math.min(10, V_all + deltaV));

    const newData = [...vocabularyLearningData];
    newData[currentIndex] = {
      ...currentWord,
      totalStrength: newStrength,
      trials: (currentWord.trials || 0) + 1
    };
    setVocabularyLearningData(newData);

    return { predictionError, deltaV, newStrength };
  };

  const handleVocabularySubmit = () => {
    if (!vocabularyLearningData[currentIndex]) return;
    
    const isCorrect = userAnswer.toLowerCase().trim() === vocabularyLearningData[currentIndex].word.toLowerCase();
    const { predictionError, deltaV, newStrength } = updateVocabularyStrength(isCorrect);
    
    setFeedback({
      isCorrect,
      predictionError: predictionError.toFixed(2),
      deltaV: deltaV.toFixed(2),
      newStrength: newStrength.toFixed(2)
    });
    setShowAnswer(true);
  };

  // 句子学习相关函数
  const updateSentenceStrength = (isCorrect: boolean) => {
    if (!sentenceLearningData[currentUnit]) return { predictionError: 0, deltaV: 0, newV: 0 };
    
    const unit = sentenceLearningData[currentUnit];
    const alpha = 0.35;
    const beta = 0.45;
    const lambda = isCorrect ? unit.lambda : 0;
    const V_all = unit.V || 0;
    
    const predictionError = lambda - V_all;
    const deltaV = alpha * beta * predictionError;
    const newV = Math.max(0, Math.min(10, V_all + deltaV));
    
    const newData = [...sentenceLearningData];
    newData[currentUnit] = {
      ...unit,
      V: newV,
      trials: (unit.trials || 0) + 1
    };
    setSentenceLearningData(newData);
    
    return { predictionError, deltaV, newV };
  };

  const handleSentencePredictionSubmit = () => {
    if (selectedOption === null || !sentenceLearningData[currentUnit]) return;
    
    const isCorrect = selectedOption === 'correct';
    updateSentenceStrength(isCorrect);
    
    setSentenceStage('feedback');
  };

  const handleSentenceNext = () => {
    if (sentenceStage === 'feedback') {
      setSentenceStage('grammar');
    } else if (sentenceStage === 'grammar') {
      if (currentUnit < sentenceLearningData.length - 1) {
        setCurrentUnit(currentUnit + 1);
        setSentenceStage('prediction');
        setSelectedOption(null);
      } else {
        setSentenceStage('complete');
      }
    }
  };

  const learningModes = {
    vocabulary: '词汇学习',
    sentence: '句子理解'
  };

  // 确保 currentSet 不为 null
  if (!currentSet) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-2xl p-8">
        {/* 标题和返回按钮 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToSelector}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} className="mr-2" />
            返回选择
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <BookOpen className="mr-3 text-blue-600" size={28} />
            {learningData[currentSet].description}
          </h1>
        </div>

        {/* 学习模式选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            学习模式：
          </label>
          <div className="flex gap-2">
            {Object.entries(learningModes).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setLearningMode(key as 'vocabulary' | 'sentence')}
                className={`px-4 py-2 rounded-lg transition ${
                  learningMode === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 完整句子显示 */}
        {learningData[currentSet] && learningData[currentSet].fullText && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-lg mb-8 text-white">
            <div className="text-sm opacity-80 mb-2">完整句子</div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium flex-1">{learningData[currentSet].fullText}</div>
              {learningData[currentSet].audioUrl && (
                <button
                  onClick={playAudio}
                  className="ml-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 flex items-center justify-center"
                  title="播放音频"
                >
                  <Play size={20} className="text-white" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 词汇学习模式 */}
        {learningMode === 'vocabulary' && vocabularyLearningData.length > 0 && (
          <VocabularyLearning
            vocabularyLearningData={vocabularyLearningData}
            currentIndex={currentIndex}
            showAnswer={showAnswer}
            userAnswer={userAnswer}
            feedback={feedback}
            onAnswerChange={setUserAnswer}
            onSubmit={handleVocabularySubmit}
            onNext={() => {
              setCurrentIndex((currentIndex + 1) % vocabularyLearningData.length);
              setShowAnswer(false);
              setUserAnswer("");
              setFeedback(null);
            }}
            onPrevious={() => {
              setCurrentIndex((currentIndex - 1 + vocabularyLearningData.length) % vocabularyLearningData.length);
              setShowAnswer(false);
              setUserAnswer("");
              setFeedback(null);
            }}
            onJumpToWord={(index: number) => {
              setCurrentIndex(index);
              setShowAnswer(false);
              setUserAnswer("");
              setFeedback(null);
            }}
            playAudio={playAudio}
          />
        )}

        {/* 句子学习模式 */}
        {learningMode === 'sentence' && sentenceLearningData.length > 0 && sentenceStage !== 'complete' && (
          <SentenceLearning
            sentenceLearningData={sentenceLearningData}
            currentUnit={currentUnit}
            sentenceStage={sentenceStage}
            selectedOption={selectedOption}
            onOptionSelect={setSelectedOption}
            onSubmit={handleSentencePredictionSubmit}
            onNext={handleSentenceNext}
          />
        )}

        {/* 句子学习完成界面 */}
        {learningMode === 'sentence' && sentenceStage === 'complete' && (
          <div className="text-center">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">句子理解训练完成！</h2>
            <div className="text-6xl font-bold text-green-600 mb-2">
              {(sentenceLearningData.reduce((acc, s) => acc + (s.V || 0), 0) / sentenceLearningData.length).toFixed(1)} / 10
            </div>
            <p className="text-gray-600 mb-6">平均掌握度</p>
            
            <button
              onClick={() => {
                setCurrentUnit(0);
                setSentenceStage('prediction');
                setSelectedOption(null);
                setSentenceLearningData(sentenceLearningData.map(s => ({ ...s, V: 0, trials: 0 })));
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition mr-4"
            >
              重新学习
            </button>
          </div>
        )}

        {/* 学习原理说明 */}
        <div className="mt-8 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
          <h4 className="font-bold mb-2 text-indigo-900">💡 学习原理（Rescorla-Wagner）</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li><strong>统一数据源：</strong>词汇学习和句子理解使用同一套数据，确保内容一致性</li>
            <li><strong>多模态学习：</strong>通过词汇记忆和句子理解双重强化学习效果</li>
            <li><strong>认知科学：</strong>基于R-W理论的预测误差驱动学习机制</li>
            <li><strong>个性化进度：</strong>根据每个学习单元的掌握情况调整学习强度</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;