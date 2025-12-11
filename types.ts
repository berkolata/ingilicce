export interface WordItem {
  id: number;
  word: string;
  definition: string;
}

export interface DayRecord {
  date: string; // ISO string YYYY-MM-DD
  wordId: number;
  completed: boolean;
  userSentence?: string;
  aiFeedback?: string;
  isCorrect?: boolean;
}

export interface UserState {
  currentWordIndex: number;
  lastLoginDate: string | null;
  history: DayRecord[];
  streak: number;
}

export interface AiEvaluation {
  isCorrect: boolean;
  feedback: string;
  betterSentence: string;
}

export interface WordContext {
  examples: string[];
  synonyms: string[];
  etymology: string;
}