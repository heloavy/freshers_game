import React from 'react';
import { X, Key, Lock, Sparkles, CheckCircle2, ShieldCheck, Terminal, ArrowRight } from 'lucide-react';
import { TREASURE_KEYS, TreasureKey, decodeAssembledKeys, FINAL_TREASURE_ANSWER } from '../services/treasureKeys';
import { sounds } from '../services/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  unlockedLevels: number[];
  onOpenDecoder?: () => void;
}

export const TreasureKeyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  unlockedLevels,
  onOpenDecoder,
}) => {
  if (!isOpen) return null;

  const { isFullyDecoded, assembledString, keysCount } = decodeAssembledKeys(unlockedLevels);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel-purple border-2 border-cyan-500/60 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.4)] max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-cyan-400 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            🗝️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-wide">
                TREASURE KEY VAULT
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50 text-xs font-mono font-bold">
                {keysCount} / 5 KEYS
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Collect all 5 sector cipher keys to decode the Master Treasure Passcode.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2.5 my-4 border border-slate-800 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            style={{ width: `${(keysCount / 5) * 100}%` }}
          />
        </div>

        {/* Keys Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
          {TREASURE_KEYS.map((k) => {
            const isUnlocked = unlockedLevels.includes(k.level);

            return (
              <div
                key={k.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-slate-700 shadow-md relative overflow-hidden'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
                style={
                  isUnlocked
                    ? {
                        borderLeftWidth: '4px',
                        borderLeftColor: k.color,
                      }
                    : undefined
                }
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{isUnlocked ? k.icon : '🔒'}</span>
                    <div>
                      <div className="font-display font-bold text-sm text-white">{k.name}</div>
                      <div className="text-[10px] font-mono text-cyan-400">{k.sourceSector}</div>
                    </div>
                  </div>
                  {isUnlocked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      SECURED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-500 border border-slate-800">
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Details */}
                {isUnlocked ? (
                  <div className="space-y-1 font-mono text-[11px] text-slate-300 mt-2 border-t border-slate-800/80 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Token:</span>
                      <span className="font-bold text-white">{k.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hex:</span>
                      <span className="text-amber-300">{k.hex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fragment:</span>
                      <span className="text-emerald-400 font-bold">"{k.fragment}"</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-mono italic mt-2 border-t border-slate-800/80 pt-2">
                    Locked. Clear Sector 0{k.level} to retrieve this key shard.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Master Decryption Status Banner */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-center font-mono my-4 shadow-lg">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            CIPHER FRAGMENTS ASSEMBLED ({keysCount}/5)
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tracking-wider text-amber-300 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
            {assembledString || '•••• •••• •• ••••'}
            {keysCount < 5 && <span className="text-slate-600"> [Awaiting {5 - keysCount} Keys]</span>}
          </div>
          {isFullyDecoded && (
            <p className="text-xs text-emerald-400 font-bold mt-2">
              🎉 All 5 keys collected! You have unlocked the ability to decrypt the Master Treasure Passcode!
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs cursor-pointer transition-all"
          >
            Close Vault
          </button>

          {isFullyDecoded && onOpenDecoder && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenDecoder();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.8)] cursor-pointer transition-all flex items-center gap-2 animate-bounce"
            >
              <span>LAUNCH DECODER TERMINAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
