export interface Cue {
  type: string;
  text: string;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  lambda: number;
  example: string;
  commonMistake: string;
  cues: Cue[];
  totalStrength?: number;
  trials?: number;
}

export interface Prediction {
  question: string;
  wrongOptions: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Grammar {
  pattern: string;
  breakdown: Record<string, string>;
}

export interface SentenceItem {
  title: string;
  sentence: string;
  lambda: number;
  prediction: Prediction;
  grammar: Grammar;
  V?: number;
  trials?: number;
}

export interface LearningSet {
  fullText: string;
  description: string;
  user: string;
  audioUrl: string;
  vocabulary: VocabularyItem[];
  sentences: SentenceItem[];
}

export interface LearningData {
  mentalStateSentences: LearningSet;
  backPainSentences: LearningSet;
}

export interface Feedback {
  isCorrect: boolean;
  predictionError: string;
  deltaV: string;
  newStrength: string;
}