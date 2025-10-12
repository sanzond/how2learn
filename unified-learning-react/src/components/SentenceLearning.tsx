import React from 'react';
import { CheckCircle, XCircle, Brain, AlertTriangle } from 'lucide-react';
import { SentenceItem } from '../types';

interface SentenceLearningProps {
  sentenceLearningData: SentenceItem[];
  currentUnit: number;
  sentenceStage: 'prediction' | 'feedback' | 'grammar' | 'complete';
  selectedOption: string | null;
  onOptionSelect: (option: string) => void;
  onSubmit: () => void;
  onNext: () => void;
}

const SentenceLearning: React.FC<SentenceLearningProps> = ({
  sentenceLearningData,
  currentUnit,
  sentenceStage,
  selectedOption,
  onOptionSelect,
  onSubmit,
  onNext
}) => {
  const currentSentence = sentenceLearningData[currentUnit];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">🧠 句子理解模式</h2>
        <div className="text-sm text-gray-600">
          单元 {currentUnit + 1} / {sentenceLearningData.length}
        </div>
      </div>

      {/* 句子掌握度 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">当前句子掌握度</span>
          <span className="text-sm text-gray-600">
            {(currentSentence.V || 0).toFixed(1)} / 10 (试验: {currentSentence.trials || 0})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
            style={{ width: `${((currentSentence.V || 0) / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* 当前句子 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-lg mb-8 text-white">
        <div className="text-sm opacity-80 mb-2">{currentSentence.title}</div>
        <div className="text-2xl font-bold">{currentSentence.sentence}</div>
      </div>

      {/* 句子学习阶段 */}
      {sentenceStage === 'prediction' && (
        <div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-600 mr-2 mt-1" size={20} />
              <div>
                <h3 className="font-bold mb-2">预测性问题（制造认知冲突）</h3>
                <p className="text-gray-700">{currentSentence.prediction.question}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {currentSentence.prediction.wrongOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => onOptionSelect(`wrong_${idx}`)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  selectedOption === `wrong_${idx}`
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                {option}
              </button>
            ))}

            <button
              onClick={() => onOptionSelect('correct')}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                selectedOption === 'correct'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              {currentSentence.prediction.correctAnswer}
            </button>
          </div>

          <button
            onClick={onSubmit}
            disabled={selectedOption === null}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            提交答案
          </button>
        </div>
      )}

      {sentenceStage === 'feedback' && (
        <div>
          <div className={`p-6 rounded-lg mb-6 ${
            selectedOption === 'correct' 
              ? 'bg-green-50 border-2 border-green-500' 
              : 'bg-red-50 border-2 border-red-500'
          }`}>
            <div className="flex items-center mb-4">
              {selectedOption === 'correct' ? (
                <CheckCircle className="text-green-600 mr-2" size={24} />
              ) : (
                <XCircle className="text-red-600 mr-2" size={24} />
              )}
              <h3 className="text-xl font-bold">
                {selectedOption === 'correct' ? '正确！理解准确 ✓' : '这是常见误解！'}
              </h3>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-bold text-sm text-gray-700 mb-2">💡 解释</h4>
              <p className="text-gray-700">{currentSentence.prediction.explanation}</p>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            继续：查看语法分析 →
          </button>
        </div>
      )}

      {sentenceStage === 'grammar' && (
        <div>
          <div className="bg-indigo-50 p-6 rounded-lg mb-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Brain className="mr-2 text-indigo-600" size={24} />
              语法结构分析
            </h3>

            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-600 mb-2">句型模式</div>
              <div className="font-mono text-blue-600 font-bold">
                {currentSentence.grammar.pattern}
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(currentSentence.grammar.breakdown).map(([key, value], idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-purple-400">
                  <div className="font-mono text-gray-800 font-bold mb-1">{key}</div>
                  <div className="text-sm text-gray-600">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            {currentUnit < sentenceLearningData.length - 1 ? '下一个句子 →' : '完成训练 ✓'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SentenceLearning;