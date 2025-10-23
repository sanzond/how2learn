import React, { useState, useRef, useCallback } from 'react';
import { Play, Square, Repeat } from 'lucide-react';

interface FullSentenceDisplayProps {
  fullText: string;
  audioUrl?: string;
  onPlayRecord?: (sentence: string, playTime: number, playCountIncrement?: number) => void;
}

const FullSentenceDisplay: React.FC<FullSentenceDisplayProps> = ({
  fullText,
  audioUrl,
  onPlayRecord
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 循环播放相关
  const [isLooping, setIsLooping] = useState(false);
  const [isLoopLoading, setIsLoopLoading] = useState(false);
  const [loopPlayCount, setLoopPlayCount] = useState(0);
  const loopAudioRef = useRef<HTMLAudioElement | null>(null);
  const loopCountRef = useRef({ hasCountedThisLoop: false, lastUpdateTime: 0 });
  const realtimeRecordRef = useRef(false);
  
  // 音频时长跟踪
  const audioStartTimeRef = useRef<number>(0);
  const audioDurationRef = useRef<number>(0);

  // 保存最新状态用于卸载/离开时读取，避免为获取最新值而修改卸载 effect 依赖
  const latestIsLoopingRef = useRef(false);
  const latestLoopCountRef = useRef(0);
  const latestOnPlayRecordRef = useRef<FullSentenceDisplayProps['onPlayRecord']>(onPlayRecord);
  const latestFullTextRef = useRef(fullText);

  React.useEffect(() => {
    latestIsLoopingRef.current = isLooping;
    latestLoopCountRef.current = loopPlayCount;
    latestOnPlayRecordRef.current = onPlayRecord;
    latestFullTextRef.current = fullText;
  }, []);

  // 播放音频
  const handlePlayAudio = useCallback(async () => {
    if (isLoading || !audioUrl) return;
    
    console.log('开始单次播放，onPlayRecord回调:', onPlayRecord ? '已设置' : '未设置');
    
    try {
      setIsLoading(true);

      // 若已有实例，先清理避免事件堆叠/多实例
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          // @ts-ignore
          audioRef.current.src = '';
          audioRef.current.load?.();
        } catch {}
      }

      // 处理音频URL
      let processedUrl = audioUrl;
      if (audioUrl.startsWith('http://localhost:18080') || audioUrl.startsWith('http://127.0.0.1:18080')) {
        processedUrl = audioUrl;
      } else if (audioUrl.startsWith('/api/learning/audio/')) {
        processedUrl = `http://127.0.0.1:18080${audioUrl}`;
      } else if (!audioUrl.startsWith('http')) {
        processedUrl = `http://127.0.0.1:18080${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
      }

      // 创建音频实例（不启用循环）
      const audio = new Audio(processedUrl);
      audio.loop = false;
      audioRef.current = audio;

      // 事件监听
      audio.addEventListener('ended', () => {
        console.log('音频播放结束');
        setIsPlaying(false);
        // 记录单次播放 - 使用实际音频时长或当前音频的duration
        const playTime = audioDurationRef.current > 0 ? audioDurationRef.current : (audio.duration || 0);
        if (onPlayRecord && playTime > 0) {
          console.log('记录单次播放:', fullText, playTime, '秒');
          onPlayRecord(fullText, playTime, 1);
        }
      });

      audio.addEventListener('error', (e) => {
        console.error('音频加载错误:', e);
        setIsPlaying(false);
        setIsLoading(false);
      });

      audio.addEventListener('loadstart', () => console.log('开始加载音频'));
      audio.addEventListener('canplay', () => console.log('音频准备就绪'));
      
      // 记录音频时长
      audio.addEventListener('loadedmetadata', () => {
        audioDurationRef.current = audio.duration || 0;
        console.log('音频时长:', audioDurationRef.current, '秒');
      });

      await audio.play();
      setIsPlaying(true);
      console.log('音频播放成功');
    } catch (error) {
      console.error('播放音频失败:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, audioUrl]);

  // 停止循环播放（内部工具函数）
  const stopLoopAudio = useCallback(() => {
    console.log('停止循环播放，当前播放次数:', loopPlayCount);
    realtimeRecordRef.current = false;
    
    // 实时统计模式下不在此处记录；确保标志置为false
    // 已在 timeupdate 中实时写入每次循环的统计
    
    if (loopAudioRef.current) {
      try {
        loopAudioRef.current.pause();
        loopAudioRef.current.currentTime = 0;
        // @ts-ignore
        loopAudioRef.current.src = '';
        loopAudioRef.current.load?.();
      } catch {}
      loopAudioRef.current = null;
    }
    setIsLooping(false);
    setLoopPlayCount(0); // 停止时重置计数
    loopCountRef.current = { hasCountedThisLoop: false, lastUpdateTime: 0 }; // 重置引用状态
  }, [loopPlayCount, onPlayRecord, fullText]);

  // 循环播放/停止循环 切换
  const handleToggleLoop = useCallback(async () => {
    if (!audioUrl || isLoopLoading) return;

    // 若正在循环，则停止
    if (isLooping) {
      console.log('停止循环播放，onPlayRecord回调:', onPlayRecord ? '已设置' : '未设置');
      stopLoopAudio();
      return;
    }
    
    console.log('开始循环播放，onPlayRecord回调:', onPlayRecord ? '已设置' : '未设置');

    try {
      setIsLoopLoading(true);

      // 处理音频URL（与单次播放一致）
      let processedUrl = audioUrl;
      if (audioUrl.startsWith('http://localhost:18080') || audioUrl.startsWith('http://127.0.0.1:18080')) {
        processedUrl = audioUrl;
      } else if (audioUrl.startsWith('/api/learning/audio/')) {
        processedUrl = `http://127.0.0.1:18080${audioUrl}`;
      } else if (!audioUrl.startsWith('http')) {
        processedUrl = `http://127.0.0.1:18080${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
      }

      // 若已有循环实例，先清理避免事件堆叠/多实例
      if (loopAudioRef.current) {
        try {
          loopAudioRef.current.pause();
          loopAudioRef.current.currentTime = 0;
          // @ts-ignore
          loopAudioRef.current.src = '';
          loopAudioRef.current.load?.();
        } catch {}
        loopAudioRef.current = null;
      }

      const loopAudio = new Audio(processedUrl);
      loopAudio.loop = true;
      loopAudioRef.current = loopAudio;

      // 使用 timeupdate 事件来检测循环播放完成
      loopAudio.addEventListener('timeupdate', () => {
        const currentTime = loopAudio.currentTime;
        const duration = loopAudio.duration;
        
        // 当音频接近结束时（在最后0.2秒内），并且时间在前进，说明一次播放即将完成
        if (duration > 0 && currentTime > duration - 0.2 && currentTime > loopCountRef.current.lastUpdateTime && !loopCountRef.current.hasCountedThisLoop) {
          setLoopPlayCount(prev => {
            const newCount = prev + 1;
            console.log(`循环播放完成第 ${newCount} 次`);
            return newCount;
          });
          loopCountRef.current.hasCountedThisLoop = true;

          // 实时记录本次循环的播放统计
          try {
            const duration = audioDurationRef.current > 0 ? audioDurationRef.current : (loopAudio.duration || 0);
            const playTime = duration > 0 ? duration : 3;
            if (onPlayRecord) {
              onPlayRecord(fullText, playTime, 1);
            }
          } catch {}
        }
        
        // 当音频重新从头开始时，重置计数标志
        if (currentTime < 0.2 && loopCountRef.current.lastUpdateTime > duration - 0.2) {
          loopCountRef.current.hasCountedThisLoop = false;
        }
        
        loopCountRef.current.lastUpdateTime = currentTime;
      });

      loopAudio.addEventListener('error', (e) => {
        console.error('循环音频加载错误:', e);
        setIsLooping(false);
        setIsLoopLoading(false);
      });

      loopAudio.addEventListener('loadstart', () => console.log('开始加载循环音频'));
      loopAudio.addEventListener('canplay', () => console.log('循环音频准备就绪'));
      
      // 记录循环音频时长
      loopAudio.addEventListener('loadedmetadata', () => {
        audioDurationRef.current = loopAudio.duration || 0;
        console.log('循环音频时长:', audioDurationRef.current, '秒');
      });

      realtimeRecordRef.current = true;
      await loopAudio.play();
      setIsLooping(true);
      console.log('循环播放开始');
    } catch (error) {
      console.error('循环播放失败:', error);
      setIsLooping(false);
    } finally {
      setIsLoopLoading(false);
    }
  }, [audioUrl, isLooping, isLoopLoading, stopLoopAudio, onPlayRecord, fullText]);

  // 停止播放
  const stopAudio = () => {
    console.log('停止播放');
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    setIsPlaying(false);
  };

  // 页面离开时记录循环播放统计
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isLoopingNow = latestIsLoopingRef.current;
      const countNow = latestLoopCountRef.current;
      const recordFn = latestOnPlayRecordRef.current;
      const sentence = latestFullTextRef.current;

      if (!realtimeRecordRef.current && isLoopingNow && countNow > 0 && recordFn) {
        const duration = audioDurationRef.current > 0 ? audioDurationRef.current : (loopAudioRef.current?.duration || 0);
        const totalPlayTime = duration > 0 ? countNow * duration : countNow * 3;
        try {
          recordFn(sentence, totalPlayTime, countNow);
          console.log('beforeunload记录循环播放统计:', { count: countNow, duration, totalPlayTime });
        } catch {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLooping, loopPlayCount, onPlayRecord, fullText]);

  // 组件卸载时清理
  React.useEffect(() => {
    return () => {
      // 卸载时记录循环播放统计（使用最新ref）
      {
        const isLoopingNow = latestIsLoopingRef.current;
        const countNow = latestLoopCountRef.current;
        const recordFn = latestOnPlayRecordRef.current;
        const sentence = latestFullTextRef.current;

        if (!realtimeRecordRef.current && isLoopingNow && countNow > 0 && recordFn) {
          const duration = audioDurationRef.current > 0 ? audioDurationRef.current : (loopAudioRef.current?.duration || 0);
          const totalPlayTime = duration > 0 ? countNow * duration : countNow * 3;
          try {
            recordFn(sentence, totalPlayTime, countNow);
            console.log('unmount记录循环播放统计:', { count: countNow, duration, totalPlayTime });
          } catch {}
        }
      }
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {}
        audioRef.current = null;
      }
      if (loopAudioRef.current) {
        try {
          loopAudioRef.current.pause();
          loopAudioRef.current.currentTime = 0;
          // @ts-ignore
          loopAudioRef.current.src = '';
          loopAudioRef.current.load?.();
        } catch {}
        loopAudioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-lg mb-8 text-white">
      <div className="text-sm opacity-80 mb-2">完整句子</div>
      <div className="flex items-center justify-between">
        <div className="text-lg font-medium flex-1">{fullText}</div>
        {audioUrl && (
          <div className="flex items-center gap-2 ml-4">
            {/* 单次播放/停止按钮 */}
            <button
              onClick={isPlaying ? stopAudio : handlePlayAudio}
              disabled={isLoading}
              className={`p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 flex items-center justify-center ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={isPlaying ? "停止播放" : "播放音频"}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Square size={20} className="text-white" />
              ) : (
                <Play size={20} className="text-white" />
              )}
            </button>
          {/* 循环播放/停止循环按钮（独立于单次播放） */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleLoop}
              disabled={isLoopLoading}
              className={`p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 flex items-center justify-center ${
                isLoopLoading ? 'opacity-50 cursor-not-allowed' : ''
              } ${isLooping ? 'ring-2 ring-white/70' : ''}`}
              title={isLooping ? "停止循环" : "循环播放"}
            >
              {isLoopLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Repeat size={20} className="text-white" />
              )}
            </button>
            {isLooping && (
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {loopPlayCount}
              </span>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullSentenceDisplay;