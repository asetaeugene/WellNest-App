
export interface Emotion {
  emotion: string;
  score: number;
}

export interface EmotionAnalysis {
  overallSentiment: 'Positive' | 'Negative' | 'Neutral';
  emotions: Emotion[];
  summary: string;
  affirmation: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  analysis?: EmotionAnalysis;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string; // Base64 Data URL
  isPremium: boolean;
}