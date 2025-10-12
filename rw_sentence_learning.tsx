import React, { useState } from 'react';
import { Brain, AlertTriangle, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

const SentenceLearning = () => {
  // 目标句子分解为学习单元
  const learningUnits = [
    {
      id: 1,
      title: "句子1：描述状态",
      sentence: "My mental state is quite poor today.",
      
      // 预测型问题（故意设计可能的误解）
      prediction: {
        question: "根据'mental state is poor'，你认为接下来可能说什么？",
        wrongOptions: [
          "我的钱包丢了（误解mental为金钱相关）",
          "我的房间很脏（误解state为物理状态）",
          "我很穷（误解poor为经济状况）"
        ],
        correctAnswer: "描述具体的心理/身体症状",
        explanation: "mental state = 心理状态，poor = 糟糕的。这是在描述精神/心理方面的不适。"
      },
      
      // 语法点
      grammar: {
        pattern: "主语 + be动词 + 程度副词 + 形容词 + 时间",
        breakdown: {
          "My mental state": "主语（我的精神状态）",
          "is": "系动词",
          "quite": "程度副词（相当、很）",
          "poor": "形容词（差的、糟糕的）",
          "today": "时间状语"
        }
      },
      
      lambda: 10
    },
    
    {
      id: 2,
      title: "句子2：具体症状",
      sentence: "It feels like I'm sick and I'm constantly drowsy.",
      
      prediction: {
        question: "看到'constantly drowsy'，判断说话人最可能需要什么？",
        wrongOptions: [
          "喝更多咖啡保持清醒（对抗症状）",
          "继续工作硬撑（忽视问题）",
          "吃更多东西补充能量（误解原因）"
        ],
        correctAnswer: "休息或就医",
        explanation: "constantly drowsy（持续困倦）配合feels like I'm sick，说明这是病理性疲劳，需要休息或医疗干预，而非简单的提神。"
      },
      
      grammar: {
        pattern: "It feels like + 从句 + and + 并列从句",
        breakdown: {
          "It feels like": "感觉像是...",
          "I'm sick": "我生病了",
          "and": "并列连词",
          "I'm constantly drowsy": "我持续困倦",
          "constantly": "频率副词（持续地、不断地）"
        }
      },
      
      lambda: 10
    },
    
    {
      id: 3,
      title: "句子3：病因推测",
      sentence: "Maybe I've caught some kind of virus.",
      
      prediction: {
        question: "为什么说话人推测是'virus'而不是'bacteria'？",
        wrongOptions: [
          "病毒更常见（过度泛化）",
          "病毒听起来更严重（情绪偏差）",
          "说话人是医生所以知道（假设专业）"
        ],
        correctAnswer: "这只是不确定的猜测（Maybe表明）",
        explanation: "Maybe（也许）和some kind of（某种）都表明这是不确定的推测，说话人并不真正知道病因。virus只是可能性之一。"
      },
      
      grammar: {
        pattern: "Maybe + 现在完成时（推测过去发生的事）",
        breakdown: {
          "Maybe": "或许、可能（表不确定）",
          "I've caught": "我已经感染了（现在完成时）",
          "some kind of": "某种（不确定的类型）",
          "virus": "病毒"
        }
      },
      
      lambda: 10
    },
    
    {
      id: 4,
      title: "句子4：解决方案",
      sentence: "Perhaps fasting could help alleviate it.",
      
      prediction: {
        question: "说话人对'fasting'（禁食）的态度是？",
        wrongOptions: [
          "非常确信有效（过度自信）",
          "医生建议的标准治疗（误认权威）",
          "唯一的解决方案（排他性错误）"
        ],
        correctAnswer: "不太确定的尝试性想法",
        explanation: "Perhaps（也许）+ could（可能）+ help（帮助），三重不确定性表达。这是一个tentative suggestion（试探性建议），不是confident recommendation。"
      },
      
      grammar: {
        pattern: "Perhaps + 情态动词 + 动词 + 宾语",
        breakdown: {
          "Perhaps": "或许（比maybe更正式的不确定）",
          "fasting": "禁食（动名词作主语）",
          "could help": "可能有助于（情态动词表可能性）",
          "alleviate": "减轻、缓解",
          "it": "指代前面的症状"
        }
      },
      
      lambda: 10
    }
  ];

  const [currentUnit, setCurrentUnit] = useState(0);
  const [stage, setStage] = useState('prediction');
  const [selectedOption, setSelectedOption] = useState(null);
  const [strength, setStrength] = useState(
    learningUnits.map(() => ({ V: 0, trials: 0 }))
  );

  const unit = learningUnits[currentUnit];
  const currentStrength = strength[currentUnit];

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
            <div className="space-y-2 text-gray-700">
              {learningUnits.map((unit, idx) => (
                <p key={idx} className="text-base leading-relaxed">
                  {unit.sentence}
                </p>
              ))}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            重新学习
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            🧠 R-W句子理解训练
          </h1>
          <div className="text-sm text-gray-600">
            单元 {currentUnit + 1} / {learningUnits.length}
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
                <div className="font-mono text-blue-600 font-bold">
                  {unit.grammar.pattern}
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(unit.grammar.breakdown).map(([key, value], idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-purple-400">
                    <div className="font-mono text-gray-800 font-bold mb-1">{key}</div>
                    <div className="text-sm text-gray-600">{value}</div>
                  </div>
                ))}
              </div>
            </div>

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
          <div className="grid grid-cols-4 gap-2">
            {learningUnits.map((u, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-center text-xs ${
                  idx === currentUnit
                    ? 'bg-blue-500 text-white'
                    : idx < currentUnit
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <div className="font-bold">句{idx + 1}</div>
                <div>{(strength[idx].V / 10 * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentenceLearning;