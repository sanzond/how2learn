import React, { useState } from 'react';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import { LearningData } from '../types';

interface LearningSetSelectorProps {
  learningData: LearningData;
  onSelect: (setKey: keyof LearningData) => void;
}

const LearningSetSelector: React.FC<LearningSetSelectorProps> = ({
  learningData,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 获取所有学习集合的信息
  const learningSetEntries = Object.entries(learningData).map(([key, data]) => ({
    key: key as keyof LearningData,
    title: data.description,
    fullText: data.fullText,
    vocabularyCount: data.vocabulary.length,
    sentenceCount: data.sentences.length
  }));

  // 过滤学习集合
  const filteredSets = learningSetEntries.filter(set => {
    const searchLower = searchTerm.toLowerCase();
    return (
      set.title.toLowerCase().includes(searchLower) ||
      set.fullText.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <p className="text-lg text-gray-600">选择学习内容开始您的学习之旅</p>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-8 max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="搜索学习内容或关键词..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
        />
      </div>

      {/* 学习集合卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSets.length > 0 ? (
          filteredSets.map((set) => (
            <div
              key={set.key}
              onClick={() => onSelect(set.key)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-1"
            >
              {/* 卡片头部 */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-xl">
                <h3 className="text-xl font-bold mb-2">{set.title}</h3>
                <div className="flex items-center justify-between text-blue-100">
                  <span className="text-sm">📚 {set.vocabularyCount} 个词汇</span>
                  <span className="text-sm">📝 {set.sentenceCount} 个句子</span>
                </div>
              </div>

              {/* 卡片内容 */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    学习内容
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {set.fullText}
                  </p>
                </div>

                {/* 高亮搜索关键词 */}
                {searchTerm && (
                  <div className="mb-4">
                    <div className="text-xs text-blue-600 font-medium mb-1">匹配关键词</div>
                    <div className="text-sm text-gray-600">
                      {searchTerm.split(' ').map((term, index) => {
                        if (term.trim() && (set.fullText.toLowerCase().includes(term.toLowerCase()) || set.title.toLowerCase().includes(term.toLowerCase()))) {
                          return (
                            <span key={index} className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-2 mb-1">
                              {term}
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                {/* 行动按钮 */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(set.key);
                  }}
                  className="flex items-center justify-between pt-4 border-t border-gray-100 w-full hover:bg-gray-50 transition-colors duration-200 rounded-b-lg -mx-6 px-6 pb-2"
                >
                  <div className="text-sm text-gray-500">
                    点击开始学习
                  </div>
                  <div className="flex items-center text-blue-600 font-medium">
                    <span className="mr-2">开始学习</span>
                    <ArrowRight size={16} />
                  </div>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">未找到匹配的学习内容</h3>
            <p className="text-gray-500">
              尝试使用不同的关键词搜索，或清空搜索框查看所有内容
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                清空搜索
              </button>
            )}
          </div>
        )}
      </div>

      {/* 搜索结果统计 */}
      {searchTerm && filteredSets.length > 0 && (
        <div className="text-center mt-6 text-sm text-gray-500">
          找到 {filteredSets.length} 个匹配的学习内容
        </div>
      )}

      {/* 学习原理说明 */}
      <div className="mt-12 p-6 bg-indigo-50 rounded-xl border-l-4 border-indigo-500">
        <h4 className="font-bold mb-3 text-indigo-900 flex items-center">
          <BookOpen className="mr-2" size={20} />
          💡 学习系统特色
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <strong>🧠 科学学习理论：</strong>基于 Rescorla-Wagner 理论的预测误差驱动学习
          </div>
          <div>
            <strong>📚 双模态学习：</strong>词汇记忆与句子理解相结合
          </div>
          <div>
            <strong>🎯 个性化进度：</strong>根据掌握情况自动调整学习强度
          </div>
          <div>
            <strong>🔄 统一数据源：</strong>确保词汇和句子学习内容一致性
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningSetSelector;