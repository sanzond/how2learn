import React, { useState } from 'react';
import { Brain, AlertTriangle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

const BackPainSentenceLearning = () => {
  const learningUnits = [
    {
      id: 1,
      title: "句子1：问题描述",
      sentence: "Lately, my back has been constantly aching.",
      
      prediction: {
        question: "看到'constantly aching'，说话人接下来最可能做什么？",
        wrongOptions: [
          "忽略它，继续正常生活（否认问题严重性）",
          "立即去医院急诊（过度反应）",
          "吃止痛药就行了（治标不治本的误解）"
        ],
        correctAnswer: "寻找根本原因并制定改善计划",
        explanation: "'constantly'表示持续性问题，需要从根源解决。单纯依赖药物或忽视都不是长期解决方案。说话人需要分析原因（如姿势、缺乏锻炼）并采取系统性行动。"
      },
      
      grammar: {
        pattern: "时间副词 + 主语 + 现在完成进行时 + 频率副词 + 现在分词",
        breakdown: {
          "Lately": "时间副词（最近）",
          "my back": "主语",
          "has been aching": "现在完成进行时（强调从过去到现在的持续状态）",
          "constantly": "频率副词（不断地、持续地）",
          "现在完成进行时": "has/have been + V-ing，强调动作的持续性和临时性"
        },
        keyPoint: "现在完成进行时表示：动作从过去开始，持续到现在，可能继续。强调过程的持续性。"
      },
      
      semanticAnalysis: {
        title: "语义层次分析",
        layers: [
          {
            level: "时间维度",
            content: "'Lately' 设定时间范围 → 这不是突然发生的急性问题"
          },
          {
            level: "持续性",
            content: "'has been...ing' + 'constantly' → 双重强调持续性，表明问题严重"
          },
          {
            level: "隐含意图",
            content: "说话人在铺垫：我需要采取行动了（为下一句做准备）"
          }
        ]
      },
      
      lambda: 10
    },
    
    {
      id: 2,
      title: "句子2：解决方案",
      sentence: "I need to start a push-up routine to build up my shoulder and back muscles.",
      
      prediction: {
        question: "为什么说话人选择'push-up'（俯卧撑）而不是去看医生或按摩？",
        wrongOptions: [
          "俯卧撑能立即止痛（误解锻炼效果）",
          "这是医生的专业建议（假设权威指导）",
          "不想花钱看医生（过度解读动机）"
        ],
        correctAnswer: "说话人认为问题源于肌肉力量不足",
        explanation: "关键词'build up muscles'表明说话人的因果推理：背痛 → 肌肉弱 → 需要增强。这是一个self-diagnosis（自我诊断），未必医学正确，但反映了说话人的问题归因逻辑。"
      },
      
      grammar: {
        pattern: "主语 + need to + 动词 + 宾语 + 不定式表目的",
        breakdown: {
          "I need to": "表示必要性（有义务或需求做某事）",
          "start": "开始（后接名词或动名词）",
          "a push-up routine": "俯卧撑训练计划",
          "to build up": "不定式表目的（为了...）",
          "my shoulder and back muscles": "复合宾语（肩部和背部肌肉）"
        },
        keyPoint: "不定式'to build up'表目的，回答'为什么要start a routine'的问题。"
      },
      
      semanticAnalysis: {
        title: "因果逻辑链分析",
        layers: [
          {
            level: "问题识别",
            content: "背痛（句子1）"
          },
          {
            level: "原因假设",
            content: "肌肉不够强壮 → 无法支撑身体"
          },
          {
            level: "解决方案",
            content: "俯卧撑 → 增强肌肉 → 改善背痛"
          },
          {
            level: "行动计划",
            content: "'routine'表示长期、规律的训练，而非一次性行为"
          }
        ]
      },
      
      criticalThinking: {
        question: "🤔 批判性思考：这个解决方案合理吗？",
        points: [
          "✓ 积极：主动采取行动，而非被动等待",
          "✓ 合理：肌肉力量确实能改善某些类型的背痛",
          "⚠️ 风险：未经医生诊断，可能误判病因",
          "⚠️ 局限：如果是椎间盘问题，俯卧撑可能加重症状",
          "💡 建议：最好先咨询专业人士，再开始训练计划"
        ]
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
            
            <div className="mt-4 p-4 bg-white rounded-lg border-l-4 border-blue-500">
              <h4 className="font-bold mb-2">📝 中文理解</h4>
              <p className="text-gray-700 mb-2">最近，我的背一直在持续疼痛。我需要开始一个俯卧撑训练计划，来增强我的肩部和背部肌肉。</p>
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
                <div className="text-xs mt-1">{(strength[idx].V / 10 * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackPainSentenceLearning;