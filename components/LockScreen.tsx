import React, { useState, useEffect } from 'react';

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin === '54321') {
      onUnlock();
    } else if (pin.length >= 5) {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 500);
    }
  }, [pin, onUnlock]);

  const handlePadClick = (num: string) => {
    if (pin.length < 5) setPin(prev => prev + num);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Lexicon 1500</h1>
          <p className="text-slate-400 text-sm">Enter Passcode</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border border-slate-500 transition-all duration-300 ${
                pin.length > i ? 'bg-white border-white' : 'bg-transparent'
              } ${error ? 'border-red-500 bg-red-500 animate-pulse' : ''}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePadClick(num.toString())}
              className="h-16 w-16 mx-auto rounded-full bg-slate-800 text-white text-xl font-semibold hover:bg-slate-700 active:bg-slate-600 transition-colors flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <div className="col-span-1"></div>
          <button
            onClick={() => handlePadClick('0')}
            className="h-16 w-16 mx-auto rounded-full bg-slate-800 text-white text-xl font-semibold hover:bg-slate-700 active:bg-slate-600 transition-colors flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 w-16 mx-auto rounded-full bg-transparent text-slate-400 text-lg font-semibold hover:text-white transition-colors flex items-center justify-center"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;