import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Play, Calendar, Download, Trash2, TrendingUp, X, Volume2 } from 'lucide-react';
import { sentenceTrackingManager, SentenceRecord, vocabularyTrackingManager, VocabularyRecord } from '../utils/localStorage';

interface SentenceStatisticsProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'sentence' | 'vocabulary';
}

const SentenceStatistics: React.FC<SentenceStatisticsProps> = ({ isOpen, onClose, mode = 'sentence' }) => {
  const [sentenceRecords, setSentenceRecords] = useState<Record<string, SentenceRecord>>({});
  const [vocabularyRecords, setVocabularyRecords] = useState<Record<string, VocabularyRecord>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'mostPlayed' | 'recent'>('overview');
  const [currentMode, setCurrentMode] = useState<'sentence' | 'vocabulary'>(mode);

  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen, currentMode]);

  const loadRecords = () => {
    if (currentMode === 'vocabulary') {
      const allRecords = vocabularyTrackingManager.getAllRecords();
      setVocabularyRecords(allRecords);
    } else {
      const allRecords = sentenceTrackingManager.getAllRecords();
      setSentenceRecords(allRecords);
    }
  };

  const getTotalStatistics = () => {
    if (currentMode === 'vocabulary') {
      return vocabularyTrackingManager.getTotalStatistics();
    } else {
      return sentenceTrackingManager.getTotalStatistics();
    }
  };

  const handleModeToggle = () => {
    setCurrentMode(currentMode === 'sentence' ? 'vocabulary' : 'sentence');
    setActiveTab('overview');
  };

  const formatTime = (seconds: number): string => {
    // 确保seconds是有效数字
    if (typeof seconds !== 'number' || isNaN(seconds) || !isFinite(seconds)) {
      return '0秒';
    }
    
    // 如果seconds异常大，可能是计算错误，进行限制
    const safeSeconds = Math.min(seconds, 1000000); // 限制最大为100万秒（约11.5天）
    
    if (safeSeconds < 60) {
      return `${Math.round(safeSeconds)}秒`;
    } else if (safeSeconds < 3600) {
      const minutes = Math.floor(safeSeconds / 60);
      const remainingSeconds = Math.round(safeSeconds % 60);
      return remainingSeconds > 0 ? `${minutes}分钟${remainingSeconds}秒` : `${minutes}分钟`;
    } else {
      const hours = Math.floor(safeSeconds / 3600);
      const minutes = Math.round((safeSeconds % 3600) / 60);
      return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`;
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    const data = currentMode === 'vocabulary' 
      ? vocabularyTrackingManager.exportData()
      : sentenceTrackingManager.exportData();
    
    // 创建下载链接
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentence_records_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    const message = currentMode === 'vocabulary' 
      ? '确定要清除所有词汇发音记录吗？此操作不可恢复。'
      : '确定要清除所有句子听读记录吗？此操作不可恢复。';
    
    if (window.confirm(message)) {
      if (currentMode === 'vocabulary') {
        vocabularyTrackingManager.clearAll();
      } else {
        sentenceTrackingManager.clearAll();
      }
      loadRecords();
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = currentMode === 'vocabulary'
        ? vocabularyTrackingManager.importData(content)
        : sentenceTrackingManager.importData(content);
      
      if (success) {
        loadRecords();
        alert('数据导入成功！');
      } else {
        alert('数据导入失败，请检查文件格式。');
      }
    };
    reader.readAsText(file);
    
    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  };

  if (!isOpen) return null;

  const statistics = getTotalStatistics();
  const mostPlayed = currentMode === 'vocabulary' 
    ? vocabularyTrackingManager.getMostPlayedWords(10)
    : sentenceTrackingManager.getMostPlayedSentences(10);
  const recentlyPlayed = currentMode === 'vocabulary'
    ? vocabularyTrackingManager.getRecentlyPlayedWords(10)
    : sentenceTrackingManager.getRecentlyPlayedSentences(10);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <BarChart3 className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">
              {currentMode === 'vocabulary' ? '词汇发音统计' : '句子听读统计'}
            </h2>
            <button
              onClick={handleModeToggle}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition text-sm font-medium"
            >
              {currentMode === 'sentence' ? '切换到词汇统计' : '切换到句子统计'}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* 标签页导航 */}
        <div className="border-b">
          <div className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              概览
            </button>
            <button
              onClick={() => setActiveTab('mostPlayed')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'mostPlayed'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              最常播放
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'recent'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              最近播放
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 统计卡片 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Play className="text-blue-600" size={20} />
                    <span className="text-sm font-medium text-gray-600">
                      {currentMode === 'vocabulary' ? '总词汇数' : '总句子数'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {currentMode === 'vocabulary' ? (statistics as any).totalWords : (statistics as any).totalSentences}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <span className="text-sm font-medium text-gray-600">总播放次数</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{statistics.totalPlayCount}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="text-purple-600" size={20} />
                    <span className="text-sm font-medium text-gray-600">总播放时间</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{formatTime((statistics as any).totalPlayTime)}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="text-orange-600" size={20} />
                    <span className="text-sm font-medium text-gray-600">平均播放次数</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{(statistics as any).averagePlayCount.toFixed(1)}</div>
                </div>
              </div>

              {/* 数据管理 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3">数据管理</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExport}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Download size={16} className="mr-2" />
                    导出数据
                  </button>
                  <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                    <Download size={16} className="mr-2" />
                    导入数据
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleClearAll}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <Trash2 size={16} className="mr-2" />
                    清除所有记录
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mostPlayed' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">
                {currentMode === 'vocabulary' ? '播放次数最多的词汇' : '播放次数最多的句子'}
              </h3>
              {mostPlayed.length > 0 ? (
                <div className="space-y-3">
                  {mostPlayed.map((record, index) => (
                    <div key={currentMode === 'vocabulary' ? (record as VocabularyRecord).word : (record as SentenceRecord).sentence} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            #{index + 1}
                          </span>
                          <span className="font-medium text-gray-800">
                            {currentMode === 'vocabulary' ? (record as VocabularyRecord).word : (record as SentenceRecord).sentence}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Play size={14} className="mr-1" />
                            {record.playCount}次
                          </span>
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {formatTime(record.totalPlayTime)}
                          </span>
                          {currentMode === 'vocabulary' && (
                            <span className="flex items-center">
                              <Volume2 size={14} className="mr-1" />
                              {(record as VocabularyRecord).loopPlayCount || 0}次循环
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        首次播放: {formatDate(record.firstPlayed)} | 
                        最后播放: {formatDate(record.lastPlayed)} |
                        会话数: {record.sessions.length}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  暂无播放记录
                </div>
              )}
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">
                {currentMode === 'vocabulary' ? '最近播放的词汇' : '最近播放的句子'}
              </h3>
              {recentlyPlayed.length > 0 ? (
                <div className="space-y-3">
                  {recentlyPlayed.map((record, index) => (
                    <div key={currentMode === 'vocabulary' ? (record as VocabularyRecord).word : (record as SentenceRecord).sentence} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                            #{index + 1}
                          </span>
                          <span className="font-medium text-gray-800">
                            {currentMode === 'vocabulary' ? (record as VocabularyRecord).word : (record as SentenceRecord).sentence}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Play size={14} className="mr-1" />
                            {record.playCount}次
                          </span>
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(record.lastPlayed)}
                          </span>
                          {currentMode === 'vocabulary' && (
                            <span className="flex items-center">
                              <Volume2 size={14} className="mr-1" />
                              {(record as VocabularyRecord).loopPlayCount || 0}次循环
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        总播放时间: {formatTime(record.totalPlayTime)} | 
                        会话数: {record.sessions.length}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  暂无播放记录
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentenceStatistics;