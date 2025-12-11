import { UserState, DayRecord } from '../types';

const STORAGE_KEY = 'lexicon_1500_state';

const INITIAL_STATE: UserState = {
  currentWordIndex: 0,
  lastLoginDate: null,
  history: [],
  streak: 0,
};

export const loadState = (): UserState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load state", e);
    return INITIAL_STATE;
  }
};

export const saveState = (state: UserState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const updateProgress = (completedWordId: number, sentence: string, feedback: string, isCorrect: boolean) => {
  const state = loadState();
  const today = new Date().toISOString().split('T')[0];

  const newRecord: DayRecord = {
    date: today,
    wordId: completedWordId,
    completed: true,
    userSentence: sentence,
    aiFeedback: feedback,
    isCorrect,
  };

  // Filter out any previous attempt for THIS word to avoid duplicates in history for the same ID
  const updatedHistory = [...state.history.filter(h => h.wordId !== completedWordId), newRecord];
  
  // Streak Logic: 
  // Increment streak ONLY if the user hasn't already logged activity TODAY (lastLoginDate !== today).
  // AND the answer was correct.
  let newStreak = state.streak;
  const hasLoggedActivityToday = state.lastLoginDate === today;

  if (!hasLoggedActivityToday && isCorrect) {
     newStreak += 1;
  }

  const newState: UserState = {
    ...state,
    lastLoginDate: today,
    history: updatedHistory,
    streak: newStreak
  };

  saveState(newState);
  return newState;
};

export const advanceToNextWord = () => {
    const state = loadState();
    const newState: UserState = {
        ...state,
        currentWordIndex: state.currentWordIndex + 1
    };
    saveState(newState);
    return newState;
};