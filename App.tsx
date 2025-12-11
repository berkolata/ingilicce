import React, { useState, useEffect } from 'react';
import { loadState, updateProgress, advanceToNextWord } from './services/storage';
import { getWordContext, evaluateUserSentence } from './services/geminiService';
import { WORD_LIST } from './constants';
import { UserState, WordContext, AiEvaluation } from './types';
import LockScreen from './components/LockScreen';
import ProgressBar from './components/ProgressBar';

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [userState, setUserState] = useState<UserState | null>(null);
  
  // Learning State
  const [context, setContext] = useState<WordContext | null>(null);
  const [userSentence, setUserSentence] = useState('');
  const [evaluation, setEvaluation] = useState<AiEvaluation | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  // Initialize
  useEffect(() => {
    const state = loadState();
    
    // If the current word index matches a word we have ALREADY completed in history,
    // we populate the fields so the user sees they are done and can click "Next".
    const currentWordId = WORD_LIST[state.currentWordIndex]?.id;
    const existingRecord = state.history.find(h => h.wordId === currentWordId);

    if (existingRecord && existingRecord.userSentence && existingRecord.aiFeedback) {
        setEvaluation({
            isCorrect: existingRecord.isCorrect || false,
            feedback: existingRecord.aiFeedback,
            betterSentence: "" 
        });
        setUserSentence(existingRecord.userSentence);
    }

    setUserState(state);
  }, []);

  const currentWord = userState ? WORD_LIST[userState.currentWordIndex] : null;

  // Fetch context from Gemini when the word loads and we don't have it
  useEffect(() => {
    if (!currentWord || context || loadingContext || !userState) return;
    
    const fetchContext = async () => {
      setLoadingContext(true);
      const data = await getWordContext(currentWord.word, currentWord.definition);
      setContext(data);
      setLoadingContext(false);
    };

    fetchContext();
  }, [currentWord, context, loadingContext, userState]);


  const handleSubmit = async () => {
    if (!userSentence.trim() || !currentWord) return;
    setEvaluating(true);
    
    const result = await evaluateUserSentence(currentWord.word, currentWord.definition, userSentence);
    setEvaluation(result);
    setEvaluating(false);

    if (result.isCorrect && userState) {
        const newState = updateProgress(currentWord.id, userSentence, result.feedback, true);
        setUserState(newState);
    }
  };

  const handleNextWord = () => {
    const newState = advanceToNextWord();
    setUserState(newState);
    // Reset local learning state
    setContext(null);
    setEvaluation(null);
    setUserSentence('');
    // Optional: Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  if (!userState || !currentWord) {
    if (userState && userState.currentWordIndex >= WORD_LIST.length) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8 text-center">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">Congratulations!</h1>
                <p className="text-xl text-slate-300">You have mastered all 1,500 words.</p>
            </div>
        );
    }
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  }

  const isCompleted = evaluation?.isCorrect;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-xl mx-auto px-6 py-8">
        
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
           <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
             Lexicon 1500
           </h1>
           <div className="text-sm text-slate-400">{new Date().toLocaleDateString()}</div>
        </header>

        <ProgressBar current={userState.currentWordIndex + 1} total={WORD_LIST.length} streak={userState.streak} />

        {/* Word Card */}
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-75 blur transition duration-1000 group-hover:duration-200 group-hover:opacity-100"></div>
            <div className="relative bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-2xl">
                <div className="text-center mb-6">
                    <span className="inline-block px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300 font-mono mb-4">
                        WORD #{currentWord.id}
                    </span>
                    <h2 className="text-5xl font-black text-white tracking-tight mb-4">{currentWord.word}</h2>
                    <p className="text-xl text-slate-300 font-light italic leading-relaxed">"{currentWord.definition}"</p>
                </div>

                {loadingContext && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {context && !loadingContext && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-2">Synonyms</h3>
                            <div className="flex flex-wrap gap-2">
                                {context.synonyms.map((s, i) => (
                                    <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-sm rounded border border-slate-700">{s}</span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-2">Examples</h3>
                            <ul className="space-y-2">
                                {context.examples.map((ex, i) => (
                                    <li key={i} className="text-slate-300 text-sm pl-3 border-l-2 border-slate-700">{ex}</li>
                                ))}
                            </ul>
                        </div>
                        
                         <div className="pt-4 border-t border-slate-700">
                             <p className="text-xs text-slate-500 italic">Origin: {context.etymology}</p>
                         </div>
                    </div>
                )}
            </div>
        </div>

        {/* Interaction Section */}
        <div className="mt-8 mb-20">
            <h3 className="text-lg font-semibold text-white mb-4">Prove Your Knowledge</h3>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-300 mb-4 text-sm">Write a sentence using <strong className="text-white">{currentWord.word}</strong> to unlock the next word.</p>
                
                <textarea
                    value={userSentence}
                    onChange={(e) => setUserSentence(e.target.value)}
                    disabled={evaluating || isCompleted}
                    className={`w-full bg-slate-900 border ${isCompleted ? 'border-green-500/50 text-green-100' : 'border-slate-700 text-white'} rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-32`}
                    placeholder={`E.g., The politician's speech was full of ${currentWord.word.toLowerCase()}...`}
                />

                {!isCompleted && (
                    <button
                        onClick={handleSubmit}
                        disabled={evaluating || userSentence.length < 5}
                        className={`mt-4 w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                            evaluating || userSentence.length < 5
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        }`}
                    >
                        {evaluating ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></span>
                                Grading...
                            </>
                        ) : 'Submit Answer'}
                    </button>
                )}

                {/* Feedback Section */}
                {evaluation && (
                    <div className={`mt-6 p-4 rounded-lg border ${evaluation.isCorrect ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'} animate-fade-in-up`}>
                        <div className="flex items-center gap-2 mb-2">
                             <span className={`text-xl ${evaluation.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                 {evaluation.isCorrect ? '✓ Correct' : '✗ Try Again'}
                             </span>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">{evaluation.feedback}</p>
                        
                        {!evaluation.isCorrect && evaluation.betterSentence && (
                             <div className="bg-slate-900/50 p-3 rounded text-xs text-slate-400 border border-slate-700/50">
                                 <strong className="block text-slate-500 mb-1">Suggestion:</strong>
                                 {evaluation.betterSentence}
                             </div>
                        )}

                        {evaluation.isCorrect && (
                            <div className="mt-4 flex flex-col items-center">
                                <p className="text-green-400 text-sm font-semibold mb-4">Great job! You've mastered this word.</p>
                                <button
                                    onClick={handleNextWord}
                                    className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-500/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Next Word →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;