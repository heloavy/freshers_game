import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Terminal, Key, Sparkles, Check, Copy, ShieldCheck, ArrowRight, Lock, Unlock, Award } from 'lucide-react';
import { TREASURE_KEYS, FINAL_TREASURE_ANSWER } from '../services/treasureKeys';
import { sounds } from '../services/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCompleteDecoding?: () => void;
}

export const TreasureDecoderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCompleteDecoding,
}) => {
  const [decodingStep, setDecodingStep] = useState<number>(0); // 0: ready, 1..5: decoding keys, 6: master reveal
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'ZERO-G QUANTUM DECRYPTION SUBSYSTEM v2.6 ONLINE',
    'Awaiting authorization to synthesize 5 sector cipher keys...',
  ]);
  const [isDecoded, setIsDecoded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setDecodingStep(0);
      setIsDecoded(false);
      setCopied(false);
      setTerminalLogs([
        'ZERO-G QUANTUM DECRYPTION SUBSYSTEM v2.6 ONLINE',
        'All 5 sector cipher keys authenticated in cryptographic cache.',
        'Click [DECODE TREASURE KEYS] to synthesize final secret passcode.',
      ]);
    }
  }, [isOpen]);

  const handleStartDecoding = () => {
    sounds.playClick();
    setDecodingStep(1);

    const logMessages = [
      '[STEP 1/5] Injecting Key Alpha (0x4672657368)... Fragment decoded: "Fresh"',
      '[STEP 2/5] Injecting Key Beta (0x65727320)... Fragment decoded: "ers "',
      '[STEP 3/5] Injecting Key Gamma (0x3230323620)... Fragment decoded: "2026 "',
      '[STEP 4/5] Injecting Key Delta (0x6F6E20)... Fragment decoded: "on "',
      '[STEP 5/5] Injecting Key Omega (0x33307468)... Fragment decoded: "30th"',
      '==================================================',
      '🌟 MASTER TREASURE CIPHER DECODED SUCCESSFULLY!',
      `SECRET ANSWER: "${FINAL_TREASURE_ANSWER}"`,
    ];

    let currentStep = 1;
    const interval = setInterval(() => {
      if (currentStep <= 5) {
        sounds.playDecodeBeep(600 + currentStep * 150);
        setTerminalLogs((prev) => [...prev, logMessages[currentStep - 1]]);
        setDecodingStep(currentStep);
        currentStep++;
      } else {
        clearInterval(interval);
        setDecodingStep(6);
        setIsDecoded(true);
        sounds.playGrandVictory();

        // Confetti explosion
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#06b6d4', '#a855f7', '#f59e0b', '#10b981', '#eab308'],
        });

        setTerminalLogs((prev) => [
          ...prev,
          logMessages[5],
          logMessages[6],
          logMessages[7],
        ]);

        onCompleteDecoding?.();
      }
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(FINAL_TREASURE_ANSWER);
    sounds.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl rounded-3xl glass-panel-purple border-2 border-amber-400 p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(245,158,11,0.6)] overflow-hidden animate-scale-up max-h-[95vh] overflow-y-auto custom-scrollbar">
        {/* Glowing Background Radial Halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-400/50 text-amber-300 font-mono text-xs uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>MASTER TREASURE VAULT // CRYPTOGRAPHIC DECODER</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-display font-black text-white tracking-wider mb-2">
          DECODE TREASURE KEYS
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-lg mx-auto mb-6">
          All 5 mission sector security keys have been retrieved. Plug them into the Master Decoder to synthesize the final secret answer!
        </p>

        {/* 5 Physical Key Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
          {TREASURE_KEYS.map((k, idx) => {
            const isKeyActive = decodingStep >= idx + 1;
            return (
              <div
                key={k.id}
                className={`p-3 rounded-2xl border transition-all duration-300 ${
                  isKeyActive
                    ? 'bg-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="text-2xl mb-1">{k.icon}</div>
                <div className="text-[11px] font-display font-bold text-white truncate">{k.name}</div>
                <div className="text-[9px] font-mono text-slate-400">{k.code}</div>
                <div className="mt-2 text-xs font-mono font-extrabold text-emerald-400 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {decodingStep >= idx + 1 ? `"${k.fragment}"` : '••••'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cyberpunk Hacker Terminal Log */}
        <div className="w-full bg-slate-950/90 rounded-2xl p-4 border border-slate-800 text-left font-mono text-xs mb-6 shadow-inner max-h-36 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 text-slate-500 pb-2 border-b border-slate-900 mb-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] uppercase tracking-wider text-cyan-400">Decryption Terminal Output</span>
          </div>
          {terminalLogs.map((log, idx) => (
            <div
              key={idx}
              className={`leading-relaxed ${
                log.includes('SECRET ANSWER')
                  ? 'text-amber-300 font-bold text-sm py-1'
                  : log.includes('Fragment decoded')
                  ? 'text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              {log}
            </div>
          ))}
        </div>

        {/* Master Decoded Reveal Card */}
        {isDecoded ? (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-yellow-950/70 border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.6)] mb-6 animate-scale-up">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>OFFICIAL TREASURE HUNT SECRET ANSWER</span>
            </div>

            {/* Giant Glowing Answer Text */}
            <div className="text-3xl sm:text-5xl font-display font-black text-amber-300 tracking-wider my-3 drop-shadow-[0_0_25px_rgba(245,158,11,0.9)] select-text">
              {FINAL_TREASURE_ANSWER}
            </div>

            <p className="text-xs sm:text-sm text-slate-200 font-mono max-w-md mx-auto mb-4">
              🎉 The secret treasure has been revealed! Present this passcode to the event coordinators at Mission Control to claim your physical prize!
            </p>

            {/* Copy Button */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleCopy}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-400/60 text-amber-300 font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-md active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'COPIED TO CLIPBOARD!' : 'COPY ANSWER'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <button
              onClick={handleStartDecoding}
              disabled={decodingStep > 0}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_0_35px_rgba(245,158,11,0.9)] transition-all cursor-pointer flex items-center gap-2 mx-auto animate-bounce disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Unlock className="w-5 h-5" />
              <span>{decodingStep > 0 ? 'DECRYPTING MASTER KEYS...' : 'DECODE ALL TREASURE KEYS'}</span>
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs cursor-pointer transition-all"
          >
            Close Terminal
          </button>

          {isDecoded && (
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.7)] cursor-pointer transition-all flex items-center gap-2"
            >
              <span>VIEW VICTORY SCREEN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
