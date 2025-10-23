/**
 * 本地存储通用工具类
 * 提供浏览器本地存储的通用封装，支持数据过期时间、数据类型转换等功能
 */

export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  expire?: number; // 过期时间（毫秒）
}

export class LocalStorageManager {
  private static instance: LocalStorageManager;
  
  private constructor() {}
  
  public static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  /**
   * 设置存储项
   * @param key 存储键名
   * @param value 存储值
   * @param expire 过期时间（毫秒）
   */
  set<T>(key: string, value: T, expire?: number): void {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expire
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`设置本地存储失败 (key: ${key}):`, error);
    }
  }

  /**
   * 获取存储项
   * @param key 存储键名
   * @param defaultValue 默认值（当存储项不存在或过期时返回）
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return defaultValue;

      const item: StorageItem<T> = JSON.parse(itemStr);
      
      // 检查是否过期
      if (item.expire && Date.now() - item.timestamp > item.expire) {
        this.remove(key);
        return defaultValue;
      }

      return item.value;
    } catch (error) {
      console.error(`获取本地存储失败 (key: ${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * 移除存储项
   * @param key 存储键名
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`移除本地存储失败 (key: ${key}):`, error);
    }
  }

  /**
   * 检查存储项是否存在且未过期
   * @param key 存储键名
   */
  has(key: string): boolean {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return false;

      const item: StorageItem = JSON.parse(itemStr);
      
      if (item.expire && Date.now() - item.timestamp > item.expire) {
        this.remove(key);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`检查本地存储失败 (key: ${key}):`, error);
      return false;
    }
  }

  /**
   * 清空所有存储项
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('清空本地存储失败:', error);
    }
  }

  /**
   * 获取所有键名
   */
  keys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (error) {
      console.error('获取本地存储键名失败:', error);
      return [];
    }
  }

  /**
   * 获取存储大小（字节）
   */
  getSize(): number {
    try {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            size += key.length + value.length;
          }
        }
      }
      return size;
    } catch (error) {
      console.error('获取本地存储大小失败:', error);
      return 0;
    }
  }
}

// 导出单例实例
export const localStorageManager = LocalStorageManager.getInstance();

// 句子听读记录相关工具函数
export interface SentenceRecord {
  sentence: string;
  playCount: number;
  lastPlayed: number;
  firstPlayed: number;
  totalPlayTime: number; // 总播放时间（秒）
  sessions: SessionRecord[];
}

export interface SessionRecord {
  timestamp: number;
  playCount: number;
  playTime: number; // 本次会话播放时间（秒）
}

export class SentenceTrackingManager {
  private static readonly STORAGE_KEY = 'sentence_records';
  private storage = localStorageManager;

  /**
   * 记录句子播放
   * @param sentence 句子内容
   * @param playTime 播放时间（秒）
   * @param playCountIncrement 本次增加的播放次数（默认1；循环播放应传入循环次数）
   */
  recordPlay(sentence: string, playTime: number = 0, playCountIncrement: number = 1): void {
    const records = this.getAllRecords();
    const now = Date.now();
    
    let record = records[sentence];
    if (!record) {
      record = {
        sentence,
        playCount: 0,
        lastPlayed: now,
        firstPlayed: now,
        totalPlayTime: 0,
        sessions: []
      };
    }

    // 更新记录
    const inc = Math.max(1, Math.floor(playCountIncrement) || 1);
    record.playCount += inc;
    record.lastPlayed = now;
    record.totalPlayTime += Math.max(0, playTime || 0);

    // 检查是否需要创建新会话（30分钟无活动视为新会话）
    const lastSession = record.sessions[record.sessions.length - 1];
    if (!lastSession || now - lastSession.timestamp > 30 * 60 * 1000) {
      record.sessions.push({
        timestamp: now,
        playCount: inc,
        playTime: Math.max(0, playTime || 0)
      });
    } else {
      lastSession.playCount += inc;
      lastSession.playTime += Math.max(0, playTime || 0);
    }

    records[sentence] = record;
    this.storage.set(SentenceTrackingManager.STORAGE_KEY, records);
  }

  /**
   * 获取所有句子记录
   */
  getAllRecords(): Record<string, SentenceRecord> {
    return this.storage.get<Record<string, SentenceRecord>>(SentenceTrackingManager.STORAGE_KEY) || {};
  }

  /**
   * 获取特定句子的记录
   */
  getRecord(sentence: string): SentenceRecord | undefined {
    const records = this.getAllRecords();
    return records[sentence];
  }

  /**
   * 获取播放次数最多的句子
   * @param limit 返回数量限制
   */
  getMostPlayedSentences(limit: number = 10): SentenceRecord[] {
    const records = this.getAllRecords();
    return Object.values(records)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }

  /**
   * 获取最近播放的句子
   * @param limit 返回数量限制
   */
  getRecentlyPlayedSentences(limit: number = 10): SentenceRecord[] {
    const records = this.getAllRecords();
    return Object.values(records)
      .sort((a, b) => b.lastPlayed - a.lastPlayed)
      .slice(0, limit);
  }

  /**
   * 基于会话汇总校正旧数据，修复历史错误累计
   */
  private normalizeRecords(): void {
    const records = this.getAllRecords();
    let changed = false;
    for (const key of Object.keys(records)) {
      const r = records[key];
      if (!r) continue;
      const sumCount = (r.sessions || []).reduce((acc, s) => acc + (s.playCount || 0), 0);
      const sumTime = (r.sessions || []).reduce((acc, s) => acc + Math.max(0, s.playTime || 0), 0);
      // 若会话信息更可靠，则采用会话汇总覆盖顶层聚合
      if (sumCount > 0 && (r.playCount !== sumCount || Math.abs((r.totalPlayTime || 0) - sumTime) > 0.5)) {
        r.playCount = sumCount;
        r.totalPlayTime = sumTime;
        changed = true;
      }
      // 基础防护
      if (r.playCount < 0) { r.playCount = 0; changed = true; }
      if (r.totalPlayTime < 0) { r.totalPlayTime = 0; changed = true; }
    }
    if (changed) {
      this.storage.set(SentenceTrackingManager.STORAGE_KEY, records);
    }
  }

  /**
   * 获取总播放时间统计
   */
  getTotalStatistics(): {
    totalSentences: number;
    totalPlayCount: number;
    totalPlayTime: number;
    averagePlayCount: number;
  } {
    // 先校正旧数据，确保统计基于一致数据源
    this.normalizeRecords();

    const records = this.getAllRecords();
    const sentences = Object.values(records);
    
    const totalPlayCount = sentences.reduce((sum, record) => sum + (record.playCount || 0), 0);
    const totalPlayTime = sentences.reduce((sum, record) => sum + Math.max(0, record.totalPlayTime || 0), 0);
    
    console.log('统计计算调试:', {
      sentencesCount: sentences.length,
      totalPlayCount,
      totalPlayTime,
      individualTimes: sentences.map(r => ({ sentence: r.sentence, playTime: r.totalPlayTime }))
    });
    
    return {
      totalSentences: sentences.length,
      totalPlayCount,
      totalPlayTime,
      averagePlayCount: sentences.length > 0 ? totalPlayCount / sentences.length : 0
    };
  }

  /**
   * 清除所有记录
   */
  clearAll(): void {
    this.storage.remove(SentenceTrackingManager.STORAGE_KEY);
  }

  /**
   * 导出记录数据
   */
  exportData(): string {
    const records = this.getAllRecords();
    return JSON.stringify(records, null, 2);
  }

  /**
   * 导入记录数据
   */
  importData(data: string): boolean {
    try {
      const records = JSON.parse(data);
      if (typeof records === 'object' && records !== null) {
        this.storage.set(SentenceTrackingManager.STORAGE_KEY, records);
        return true;
      }
      return false;
    } catch (error) {
      console.error('导入句子记录数据失败:', error);
      return false;
    }
  }
}

// 词汇发音统计相关接口
export interface VocabularyRecord {
  word: string;
  playCount: number;
  loopPlayCount: number;
  lastPlayed: number;
  firstPlayed: number;
  totalPlayTime: number; // 总播放时间（秒）
  sessions: VocabularySessionRecord[];
}

export interface VocabularySessionRecord {
  timestamp: number;
  playCount: number;
  loopPlayCount: number;
  playTime: number; // 本次会话播放时间（秒）
}

export class VocabularyTrackingManager {
  private static readonly STORAGE_KEY = 'vocabulary_records';
  private storage = localStorageManager;

  /**
   * 记录词汇发音播放
   * @param word 词汇内容
   * @param playTime 播放时间（秒）
   * @param isLoopPlay 是否为循环播放
   * @param playCountIncrement 本次增加的播放次数（默认1；循环播放应传入循环次数）
   */
  recordPlay(word: string, playTime: number = 0, isLoopPlay: boolean = false, playCountIncrement: number = 1): void {
    const records = this.getAllRecords();
    const now = Date.now();
    
    let record = records[word];
    if (!record) {
      record = {
        word,
        playCount: 0,
        loopPlayCount: 0,
        lastPlayed: now,
        firstPlayed: now,
        totalPlayTime: 0,
        sessions: []
      };
    }

    // 更新记录
    const inc = Math.max(1, Math.floor(playCountIncrement) || 1);
    
    if (isLoopPlay) {
      record.loopPlayCount += inc;
    } else {
      record.playCount += inc;
    }
    
    record.lastPlayed = now;
    record.totalPlayTime += Math.max(0, playTime || 0);

    // 检查是否需要创建新会话（30分钟无活动视为新会话）
    const lastSession = record.sessions[record.sessions.length - 1];
    if (!lastSession || now - lastSession.timestamp > 30 * 60 * 1000) {
      record.sessions.push({
        timestamp: now,
        playCount: isLoopPlay ? 0 : inc,
        loopPlayCount: isLoopPlay ? inc : 0,
        playTime: Math.max(0, playTime || 0)
      });
    } else {
      if (isLoopPlay) {
        lastSession.loopPlayCount += inc;
      } else {
        lastSession.playCount += inc;
      }
      lastSession.playTime += Math.max(0, playTime || 0);
    }

    records[word] = record;
    this.storage.set(VocabularyTrackingManager.STORAGE_KEY, records);
  }

  /**
   * 获取所有词汇记录
   */
  getAllRecords(): Record<string, VocabularyRecord> {
    return this.storage.get<Record<string, VocabularyRecord>>(VocabularyTrackingManager.STORAGE_KEY) || {};
  }

  /**
   * 获取特定词汇的记录
   */
  getRecord(word: string): VocabularyRecord | undefined {
    const records = this.getAllRecords();
    return records[word];
  }

  /**
   * 获取播放次数最多的词汇
   * @param limit 返回数量限制
   */
  getMostPlayedWords(limit: number = 10): VocabularyRecord[] {
    const records = this.getAllRecords();
    return Object.values(records)
      .sort((a, b) => (b.playCount + b.loopPlayCount) - (a.playCount + a.loopPlayCount))
      .slice(0, limit);
  }

  /**
   * 获取最近播放的词汇
   * @param limit 返回数量限制
   */
  getRecentlyPlayedWords(limit: number = 10): VocabularyRecord[] {
    const records = this.getAllRecords();
    return Object.values(records)
      .sort((a, b) => b.lastPlayed - a.lastPlayed)
      .slice(0, limit);
  }

  /**
   * 基于会话汇总校正旧数据
   */
  private normalizeRecords(): void {
    const records = this.getAllRecords();
    let changed = false;
    for (const key of Object.keys(records)) {
      const r = records[key];
      if (!r) continue;
      const sumCount = (r.sessions || []).reduce((acc, s) => acc + (s.playCount || 0), 0);
      const sumLoopCount = (r.sessions || []).reduce((acc, s) => acc + (s.loopPlayCount || 0), 0);
      const sumTime = (r.sessions || []).reduce((acc, s) => acc + Math.max(0, s.playTime || 0), 0);
      
      // 若会话信息更可靠，则采用会话汇总覆盖顶层聚合
      if (sumCount > 0 && (r.playCount !== sumCount || Math.abs((r.totalPlayTime || 0) - sumTime) > 0.5)) {
        r.playCount = sumCount;
        r.loopPlayCount = sumLoopCount;
        r.totalPlayTime = sumTime;
        changed = true;
      }
      // 基础防护
      if (r.playCount < 0) { r.playCount = 0; changed = true; }
      if (r.loopPlayCount < 0) { r.loopPlayCount = 0; changed = true; }
      if (r.totalPlayTime < 0) { r.totalPlayTime = 0; changed = true; }
    }
    if (changed) {
      this.storage.set(VocabularyTrackingManager.STORAGE_KEY, records);
    }
  }

  /**
   * 获取总播放时间统计
   */
  getTotalStatistics(): {
    totalWords: number;
    totalPlayCount: number;
    totalLoopPlayCount: number;
    totalPlayTime: number;
    averagePlayCount: number;
  } {
    // 先校正旧数据，确保统计基于一致数据源
    this.normalizeRecords();

    const records = this.getAllRecords();
    const words = Object.values(records);
    
    const totalPlayCount = words.reduce((sum, record) => sum + (record.playCount || 0), 0);
    const totalLoopPlayCount = words.reduce((sum, record) => sum + (record.loopPlayCount || 0), 0);
    const totalPlayTime = words.reduce((sum, record) => sum + Math.max(0, record.totalPlayTime || 0), 0);
    
    return {
      totalWords: words.length,
      totalPlayCount,
      totalLoopPlayCount,
      totalPlayTime,
      averagePlayCount: words.length > 0 ? (totalPlayCount + totalLoopPlayCount) / words.length : 0
    };
  }

  /**
   * 清除所有记录
   */
  clearAll(): void {
    this.storage.remove(VocabularyTrackingManager.STORAGE_KEY);
  }

  /**
   * 导出记录数据
   */
  exportData(): string {
    const records = this.getAllRecords();
    return JSON.stringify(records, null, 2);
  }

  /**
   * 导入记录数据
   */
  importData(data: string): boolean {
    try {
      const records = JSON.parse(data);
      if (typeof records === 'object' && records !== null) {
        this.storage.set(VocabularyTrackingManager.STORAGE_KEY, records);
        return true;
      }
      return false;
    } catch (error) {
      console.error('导入词汇记录数据失败:', error);
      return false;
    }
  }
}

// 导出句子跟踪管理器单例
export const sentenceTrackingManager = new SentenceTrackingManager();

// 导出词汇跟踪管理器单例
export const vocabularyTrackingManager = new VocabularyTrackingManager();