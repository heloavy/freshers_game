import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, ShieldAlert, Award, RotateCcw, ArrowRight, Share2, Sparkles } from 'lucide-react';
import { sounds } from '../services/soundEffects';

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
}) => {
  const totalTime = elapsedTime + penalties;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Launch fireworks confetti on mount and lock completion in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dtth_completed_team', teamName);
    } catch {}
    sounds.playGrandVictory();

    const end = Date.now() + 3.5 * 1000;
    const colors = ['#06b6d4', '#a855f7', '#f59e0b', '#10b981', '#f43f5e'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-in p-4">
      {/* Grand Victory Trophy Card */}
      <div className="w-full rounded-3xl glass-panel-purple border-2 border-cyan-400 p-8 md:p-12 text-center shadow-[0_0_60px_rgba(6,182,212,0.4)] relative overflow-hidden">
        {/* Glowing Background Radial Halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy Badge */}
        <div className="relative z-10 mx-auto w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-100 p-0.5 shadow-[0_0_40px_rgba(245,158,11,0.8)] mb-6 animate-bounce">
          <div className="w-full h-full rounded-3xl bg-slate-950 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-amber-400" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 font-mono text-xs uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MISSION CONQUERED &bull; ZERO-G CHAMPIONS</span>
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

        <p className="text-slate-300 text-sm md:text-base font-mono max-w-xl mx-auto mb-8">
          All 5 orbital defense security protocols have been successfully bypassed. Speed bonuses have been calculated and added to the live leaderboard.
        </p>

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
            <span>SCORE LOCKED &bull; SINGLE ATTEMPT FINALIZED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
