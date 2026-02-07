import React from 'react';
import { Server, Smartphone } from 'lucide-react';

const SyncConflictModal = ({ conflictData, currentLevel, currentScore, onResolve }) => {
  if (!conflictData) return null;

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-bounce">
        <h3 className="text-xl font-black text-indigo-600 mb-2">SYNC CONFLICT</h3>
        <p className="text-sm text-gray-600 mb-6 font-bold">You played offline. Which data to keep?</p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => onResolve('server')} 
            className="w-full py-4 bg-indigo-500 text-white rounded-xl font-black flex items-center justify-center gap-3 hover:bg-indigo-600"
          >
            <Server size={20}/> 
            <div className="flex flex-col items-start text-xs">
              <span>LOAD SERVER SAVE</span>
              <span className="text-indigo-200">LEVEL {conflictData.level} (Score {conflictData.score})</span>
            </div>
          </button>
          <button 
            onClick={() => onResolve('local')} 
            className="w-full py-4 bg-gray-200 text-gray-600 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-gray-300"
          >
            <Smartphone size={20}/> 
            <div className="flex flex-col items-start text-xs">
              <span>KEEP LOCAL SAVE</span>
              <span className="text-gray-500">LEVEL {currentLevel} (Score {currentScore})</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncConflictModal;
