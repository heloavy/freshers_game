import React from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface Props {
  isOpen: boolean;
  levelNumber: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PenaltySkipModal: React.FC<Props> = ({ isOpen, levelNumber, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl glass-panel-purple border-2 border-rose-500/80 p-6 shadow-[0_0_40px_rgba(244,63,94,0.4)]">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onCancel();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mb-4 mx-auto shadow-[0_0_20px_rgba(244,63,94,0.6)]">
          <AlertTriangle className="w-8 h-8 text-rose-400 animate-bounce" />
        </div>

        {/* Modal Title & Text */}
        <h3 className="text-xl font-display font-extrabold text-white text-center mb-2 tracking-wide">
          ANTI-GRAVITY PENALTY WARNING
        </h3>
        
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 my-3 text-center">
          <div className="flex items-center justify-center gap-2 text-rose-300 font-mono font-bold text-sm mb-1">
            <Clock className="w-4 h-4 text-rose-400" />
            <span>+90 SECONDS TIME PENALTY (0 PTS)</span>
          </div>
          <p className="text-slate-300 text-xs font-mono leading-relaxed">
            Skipping Level {levelNumber} will add <strong>+90 Seconds Penalty</strong> to your total time and award <strong>0 points</strong> for this sector. Are you sure you want to surrender this level?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => {
              sounds.playClick();
              onCancel();
            }}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-semibold text-xs tracking-wider transition-all cursor-pointer"
          >
            CANCEL / STAY
          </button>
          <button
            onClick={() => {
              sounds.playBuzzer();
              onConfirm();
            }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-display font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.7)] transition-all cursor-pointer"
          >
            CONFIRM SKIP (+90s)
          </button>
        </div>
      </div>
    </div>
  );
};
