import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  streak: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, streak }) => {
  const percentage = Math.min(100, (current / total) * 100);

  return (
    <div className="w-full bg-white/5 p-4 rounded-2xl mb-6 border border-white/10">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Progress</span>
          <div className="text-2xl font-bold text-white">
            {current} <span className="text-slate-500 text-lg">/ {total}</span>
          </div>
        </div>
        <div className="text-right">
            <span className="text-xs font-semibold text-amber-500 tracking-wider uppercase">Streak</span>
            <div className="text-xl font-bold text-white flex items-center justify-end gap-1">
                🔥 {streak}
            </div>
        </div>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;