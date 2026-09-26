import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, ShieldAlert, Award, Sparkles, Key, Check, Copy, Terminal, ShieldCheck, Calendar } from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { TREASURE_KEYS, FINAL_TREASURE_ANSWER } from '../services/treasureKeys';

interface Props {
  teamId: string;
  teamName: string;
  avatar?: string;
  elapsedTime: number;
  penalties: number;
  score: number;
  rank: number;
  onOpenLeaderboard: () => void;
  onRestart: () => void;
  onOpenDecoder?: () => void;
}

export const VictoryScreen: React.FC<Props> = ({
  teamId,
  teamName,
  avatar = '🚀',
  elapsedTime,
  penalties,
  score,
  rank,
  onOpenLeaderboard,
  onRestart,
  onOpenDecoder,
}) => {
  const totalTime = elapsedTime + penalties;
  const [copied, setCopied] = useState<boolean>(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(FINAL_TREASURE_ANSWER);
    sounds.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Launch fireworks confetti on mount and lock completion in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dtth_completed_team', teamName);
    } catch {}
    sounds.playGrandVictory();

    const end = Date.now() + 4 * 1000;
    const colors = ['#06b6d4', '#a855f7', '#f59e0b', '#10b981', '#f43f5e', '#eab308'];

    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [teamName]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-in p-4 select-none">
      {/* Grand Victory Trophy Card */}
      <div className="w-full rounded-3xl glass-panel-purple border-2 border-amber-400 p-6 md:p-12 text-center shadow-[0_0_70px_rgba(245,158,11,0.5)] relative overflow-hidden">
        {/* Glowing Background Radial Halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy Badge */}
        <div className="relative z-10 mx-auto w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-100 p-0.5 shadow-[0_0_40px_rgba(245,158,11,0.8)] mb-4 animate-bounce">
          <div className="w-full h-full rounded-3xl bg-slate-950 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-amber-400" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-400/50 text-amber-300 font-mono text-xs uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>ALL 5 SECTORS CONQUERED &bull; ZERO-G GRAND CHAMPIONS</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-wider mb-2">
          TREASURE HUNT COMPLETE!
        </h1>

        <div className="flex items-center justify-center gap-3 my-4">
          <span className="text-4xl p-2 rounded-2xl bg-slate-900 border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            {avatar}
          </span>
          <div className="text-left font-mono">
            <div className="text-xl md:text-2xl font-bold text-cyan-300">{teamName}</div>
            <div className="text-xs text-amber-400 font-bold">{teamId}</div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DECODED MASTER TREASURE KEY PASSCODE CARD                                */}
        {/* ========================================================================= */}
        <div className="my-8 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-yellow-950/90 border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.6)] relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-2">
            <Key className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>DECODED MASTER TREASURE KEY</span>
          </div>

          <h2 className="text-xs sm:text-sm font-mono text-slate-300 uppercase tracking-wider mb-2">
            The secret cipher has been fully synthesized:
          </h2>

          {/* Giant Gold Passcode */}
          <div className="text-3xl sm:text-5xl font-display font-black text-amber-300 tracking-wider my-3 drop-shadow-[0_0_30px_rgba(245,158,11,0.9)] select-text">
            {FINAL_TREASURE_ANSWER}
          </div>

          {/* Event Date Announcement */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 font-mono text-xs font-bold mb-4">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Mark your calendars: Freshers 2026 is happening on the 30th!</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-lg mx-auto mb-5 leading-relaxed">
            Report this decoded passcode directly to the coordinators at Mission Control to verify your physical treasure hunt prize!
          </p>

          {/* Copy and Terminal Replay Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleCopyCode}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.7)] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
              <span>{copied ? 'COPIED TO CLIPBOARD!' : 'COPY DECODED PASSCODE'}</span>
            </button>

            {onOpenDecoder && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenDecoder();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs cursor-pointer transition-all flex items-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Re-run Decryption Terminal</span>
              </button>
            )}
          </div>

          {/* 5 Shards Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6 pt-5 border-t border-slate-800/80 font-mono text-[11px]">
            {TREASURE_KEYS.map((k) => (
              <div key={k.id} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-xs">{k.icon}</div>
                <div className="text-[10px] text-slate-400 truncate">{k.name}</div>
                <div className="text-emerald-400 font-extrabold text-xs mt-0.5">"{k.fragment}"</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8 font-mono">
          {/* Global Rank */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>GLOBAL RANK</span>
            </div>
            <div className="text-3xl font-display font-black text-amber-300">
              #{rank}
            </div>
          </div>

          {/* Final Score */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FINAL SCORE</span>
            </div>
            <div className="text-3xl font-display font-black text-cyan-300">
              {score}
            </div>
          </div>

          {/* Elapsed Time */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>RUN TIME</span>
            </div>
            <div className="text-2xl font-display font-bold text-slate-200">
              {formatTime(elapsedTime)}
            </div>
          </div>

          {/* Penalties & Total Time */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/40 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>PENALTIES</span>
            </div>
            <div className="text-2xl font-display font-bold text-rose-300">
              +{penalties}s
            </div>
            <div className="text-[10px] text-purple-300 mt-0.5">
              Total: {formatTime(totalTime)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenLeaderboard();
            }}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.7)] transition-all cursor-pointer flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span>VIEW LIVE LEADERBOARD</span>
          </button>

          <div className="px-6 py-3.5 rounded-xl bg-slate-900/90 text-emerald-400 border border-emerald-500/40 font-mono text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SCORE LOCKED &bull; ATTEMPT FINALIZED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
