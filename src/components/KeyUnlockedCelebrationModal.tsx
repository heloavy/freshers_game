import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Key, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Lock, Binary } from 'lucide-react';
import { TreasureKey } from '../services/treasureKeys';
import { sounds } from '../services/soundEffects';

interface Props {
  isOpen: boolean;
  treasureKey: TreasureKey | null;
  totalKeysUnlocked: number;
  onProceed: () => void;
}

export const KeyUnlockedCelebrationModal: React.FC<Props> = ({
  isOpen,
  treasureKey,
  totalKeysUnlocked,
  onProceed,
}) => {
  useEffect(() => {
    if (isOpen && treasureKey) {
      sounds.playKeyUnlock();

      // Confetti burst on key unlock
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#a855f7', '#f59e0b', '#10b981', '#eab308'],
      });
    }
  }, [isOpen, treasureKey]);

  if (!isOpen || !treasureKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel-purple border-2 border-amber-400/80 p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.5)] overflow-hidden animate-scale-up">
        {/* Glowing Radial Background */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ backgroundColor: treasureKey.color }}
        />

        {/* Top Header Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-400/50 text-amber-300 font-mono text-xs uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>TREASURE HUNT // KEY SHARD SECURED</span>
        </div>

        {/* Animated Key Icon Badge */}
        <div className="relative mx-auto w-24 h-24 rounded-3xl p-0.5 mb-4 shadow-[0_0_35px_rgba(245,158,11,0.6)] animate-bounce">
          <div
            className="w-full h-full rounded-3xl flex items-center justify-center text-4xl border-2"
            style={{
              backgroundColor: '#020617',
              borderColor: treasureKey.color,
              boxShadow: `0 0 25px ${treasureKey.color}80`,
            }}
          >
            {treasureKey.icon}
          </div>
        </div>

        {/* Key Title & Sector */}
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-wider mb-1">
          {treasureKey.name.toUpperCase()}
        </h2>
        <div className="text-xs font-mono text-cyan-400 font-bold tracking-widest uppercase mb-4">
          {treasureKey.sourceSector}
        </div>

        {/* Key Details Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 mb-5 text-left font-mono space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">CIPHER TOKEN:</span>
            <span
              className="font-bold px-2 py-0.5 rounded border text-[11px]"
              style={{
                color: treasureKey.color,
                borderColor: `${treasureKey.color}60`,
                backgroundColor: `${treasureKey.color}15`,
              }}
            >
              {treasureKey.code}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">HEX SHARD:</span>
            <span className="text-amber-300 font-bold">{treasureKey.hex}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2">
            <span className="text-slate-400">DECRYPTED FRAGMENT:</span>
            <span className="text-emerald-400 font-extrabold text-sm px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
              "{treasureKey.fragment}"
            </span>
          </div>

          <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800/80">
            {treasureKey.clue}
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Vault Progress:</span>
            <span className="text-white font-bold">{totalKeysUnlocked} / 5 Keys</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <span
                key={lvl}
                className={`w-3 h-3 rounded-full border transition-all ${
                  lvl <= totalKeysUnlocked
                    ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : 'bg-slate-800 border-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Proceed Action Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onProceed();
          }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.8)] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>STORE KEY IN INVENTORY &amp; CONTINUE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
