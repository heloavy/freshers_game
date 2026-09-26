import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../services/soundEffects';
import { Bug, Timer, Sparkles, CheckCircle2, RotateCcw, AlertTriangle, AlertCircle, Snowflake, HelpCircle } from 'lucide-react';

interface SpaceBug {
  id: number;
  emoji: '👾' | '🐛' | '🪲';
  x: number; // percentage
  y: number; // percentage
  vx: number;
  vy: number;
  rotation: number;
  size: number;
  smashed: boolean;
}

interface Props {
  onComplete: (levelDurationSec: number) => void;
  onApplyPenalty?: (pointsDeduction: number, penaltySec: number, reason: string) => void;
  onSkipRequest?: () => void;
}

const BUG_EMOJIS: Array<'👾' | '🐛' | '🪲'> = ['👾', '🐛', '🪲'];
// Updated requirements: exactly 12 bugs in 30 seconds
const TOTAL_BUGS = 12;
const INITIAL_COUNTDOWN = 30;

export const Level4BugSmasherArcade: React.FC<Props> = ({ onComplete, onApplyPenalty, onSkipRequest }) => {
  const [bugs, setBugs] = useState<SpaceBug[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_COUNTDOWN);
  const [gameActive, setGameActive] = useState<boolean>(true);
  const [isVictorious, setIsVictorious] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [splatParticles, setSplatParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [freezeTimeRemaining, setFreezeTimeRemaining] = useState<number>(0);
  const [showHintConfirm, setShowHintConfirm] = useState<boolean>(false);

  // Elapsed time tracker for speed scoring
  const startTimeRef = useRef<number>(Date.now());
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Generate 12 space bugs with comfortable, gentle, human-playable speed
  const initBugs = () => {
    const list: SpaceBug[] = [];
    for (let i = 0; i < TOTAL_BUGS; i++) {
      list.push({
        id: i + 1,
        emoji: BUG_EMOJIS[i % BUG_EMOJIS.length],
        x: 12 + Math.random() * 76,
        y: 15 + Math.random() * 70,
        // Smooth gentle floating drift (drastically reduced for comfortable tracking on mobile & trackpad)
        vx: (Math.random() - 0.5) * 0.08 + (Math.random() > 0.5 ? 0.05 : -0.05),
        vy: (Math.random() - 0.5) * 0.08 + (Math.random() > 0.5 ? 0.05 : -0.05),
        rotation: Math.random() * 360,
        size: 42 + Math.floor(Math.random() * 8),
        smashed: false,
      });
    }
    setBugs(list);
    setTimeLeft(INITIAL_COUNTDOWN);
    setGameActive(true);
    setIsVictorious(false);
    setIsGameOver(false);
    startTimeRef.current = Date.now();
    setSecondsElapsed(0);
  };

  useEffect(() => {
    initBugs();
  }, []);

  // Countdown and elapsed timer
  useEffect(() => {
    if (!gameActive || isVictorious || isGameOver) return;

    const timer = setInterval(() => {
      setSecondsElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(false);
          setIsGameOver(true);
          sounds.playBuzzer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, isVictorious, isGameOver]);

  // Anti-gravity smooth floating drift loop
  useEffect(() => {
    if (!gameActive) return;
    let animId: number;

    const updatePhysics = () => {
      // If cryo-freeze is active, pause parasite movement
      if (!isFrozen) {
        setBugs((prev) =>
          prev.map((bug) => {
            if (bug.smashed) return bug;

            let nx = bug.x + bug.vx;
            let ny = bug.y + bug.vy;
            let nvx = bug.vx;
            let nvy = bug.vy;

            if (nx < 8) {
              nx = 8;
              nvx = Math.abs(nvx);
            } else if (nx > 92) {
              nx = 92;
              nvx = -Math.abs(nvx);
            }

            if (ny < 10) {
              ny = 10;
              nvy = Math.abs(nvy);
            } else if (ny > 88) {
              ny = 88;
              nvy = -Math.abs(nvy);
            }

            return {
              ...bug,
              x: nx,
              y: ny,
              vx: nvx,
              vy: nvy,
              rotation: (bug.rotation + 0.25) % 360,
            };
          })
        );
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [gameActive, isFrozen]);

  const handleConfirmHint = () => {
    setShowHintConfirm(false);
    sounds.playCapture();
    onApplyPenalty?.(300, 45, 'Level 4 Cryo-Stasis Freeze Field');

    setIsFrozen(true);
    setFreezeTimeRemaining(6);

    const interval = setInterval(() => {
      setFreezeTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsFrozen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle smash click/tap on bug
  const handleSmashBug = (id: number, e: React.MouseEvent | React.TouchEvent) => {
    if (!gameActive || isGameOver || isVictorious) return;
    e.stopPropagation();

    sounds.playSplat();

    const targetBug = bugs.find((b) => b.id === id);
    if (!targetBug || targetBug.smashed) return;

    const splatId = Date.now() + Math.random();
    setSplatParticles((prev) => [...prev, { id: splatId, x: targetBug?.x || 50, y: targetBug?.y || 50 }]);
    setTimeout(() => {
      setSplatParticles((prev) => prev.filter((p) => p.id !== splatId));
    }, 700);

    setBugs((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, smashed: true } : b));
      const remaining = next.filter((b) => !b.smashed).length;

      if (remaining === 0) {
        setIsVictorious(true);
        setGameActive(false);
        sounds.playLevelWin();
      }
      return next;
    });
  };

  const smashedCount = bugs.filter((b) => b.smashed).length;
  const remainingCount = TOTAL_BUGS - smashedCount;
  // Transparent score calculation: 1000 base + speed bonus
  const potentialScore = 1000 + Math.max(100, 1000 - secondsElapsed * 20);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Level Header / Briefing */}
      <div className="w-full glass-panel rounded-2xl p-5 mb-5 border border-rose-500/40 neon-border-rose flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Bug className="w-4 h-4 text-rose-400" />
            <span>Mission Level 04 // Bug Smasher Arcade</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-wide">
            Zero-G Space Bug Smasher
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Glitch parasites have invaded the server room! Tap or click to <span className="text-rose-400 font-bold">smash 12 bugs within 30 seconds</span> to cleanse the core.
          </p>
        </div>

        {/* Level Stats HUD */}
        <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-xl border border-rose-500/30">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${timeLeft <= 7 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-cyan-400'}`}>
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400">ARCADE TIMER</div>
              <div className={`text-xl font-display font-extrabold ${timeLeft <= 7 ? 'text-rose-400 neon-text-glow' : 'text-cyan-300'}`}>
                {timeLeft < 10 ? `0${timeLeft}s` : `${timeLeft}s`}
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div>
            <div className="text-[10px] font-mono text-slate-400">SPEED BONUS</div>
            <div className="text-xl font-display font-extrabold text-amber-400">
              +{potentialScore} PTS
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div>
            <div className="text-[10px] font-mono text-slate-400">SMASHED</div>
            <div className="text-xl font-display font-extrabold text-white">
              <span className="text-emerald-400 font-bold">{smashedCount}</span>
              <span className="text-slate-500"> / {TOTAL_BUGS}</span>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <button
            onClick={() => setShowHintConfirm(true)}
            disabled={isFrozen || !gameActive || isGameOver || isVictorious}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isFrozen
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 animate-pulse'
                : 'bg-rose-950/70 border-rose-500/50 hover:bg-rose-900/60 text-rose-300'
            }`}
            title="Deploy Cryo-Freeze Field (-300 PTS, +45s)"
          >
            <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isFrozen ? `❄️ FROZEN (${freezeTimeRemaining}s)` : 'Freeze (-300 PTS)'}</span>
          </button>
        </div>
      </div>

      {/* Main Arcade Viewport */}
      <div className="relative w-full h-[520px] rounded-2xl glass-panel-purple overflow-hidden border border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.25)] select-none cursor-crosshair">
        {/* HUD Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#f43f5e15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Splat Particle Bursts */}
        {splatParticles.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2 animate-ping"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <div className="w-16 h-16 rounded-full bg-rose-500/40 border border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
          </div>
        ))}

        {/* 12 Slower, comfortably floating bugs with generous touch/click hitboxes */}
        {bugs.map((bug) => {
          if (bug.smashed) {
            return (
              <div
                key={bug.id}
                className="absolute pointer-events-none opacity-40 text-xs font-mono text-emerald-400 select-none -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${bug.x}%`, top: `${bug.y}%` }}
              >
                💥 [SMASHED]
              </div>
            );
          }

          return (
            <button
              key={bug.id}
              onClick={(e) => handleSmashBug(bug.id, e)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleSmashBug(bug.id, e);
              }}
              className="absolute z-20 group focus:outline-none transition-transform active:scale-90 p-4 rounded-full hover:bg-rose-500/25 cursor-pointer touch-manipulation min-w-[64px] min-h-[64px] flex items-center justify-center"
              style={{
                left: `${bug.x}%`,
                top: `${bug.y}%`,
                transform: `translate(-50%, -50%) rotate(${bug.rotation}deg)`,
              }}
              title="Click or tap to SMASH bug!"
            >
              <div className="relative flex items-center justify-center pointer-events-none">
                <span
                  className="filter drop-shadow-[0_0_12px_rgba(244,63,94,0.9)] select-none text-4xl sm:text-5xl hover:scale-125 transition-transform"
                >
                  {bug.emoji}
                </span>
                <div className="absolute -inset-2 rounded-full border border-dashed border-rose-400 opacity-20 group-hover:opacity-100 animate-spin pointer-events-none" />
              </div>
            </button>
          );
        })}

        {/* Game Over / Time Expired Modal Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(244,63,94,0.8)]">
              <AlertTriangle className="w-8 h-8 text-rose-400 animate-bounce" />
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              TIME EXPIRED! (30 SECONDS UP)
            </h3>
            <p className="text-slate-300 text-sm max-w-md mb-6 font-mono">
              You smashed {smashedCount} out of {TOTAL_BUGS} bugs. {remainingCount} parasites remaining.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  sounds.playClick();
                  initBugs();
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-display font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RETRY ARCADE (SMASH 12 IN 30s)</span>
              </button>
            </div>
          </div>
        )}

        {/* Level Victory Overlay */}
        {isVictorious && (
          <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.8)]">
              <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 tracking-wide">
              ALL 12 GLITCH BUGS EXTERMINATED!
            </h3>
            <p className="text-slate-300 text-sm max-w-md mb-6 font-mono">
              Cleared in {secondsElapsed}s! Speed bonus: +{potentialScore} PTS added to team total.
            </p>
            <button
              onClick={() => {
                sounds.playClick();
                onComplete(secondsElapsed);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-bold text-sm tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.8)] transition-all cursor-pointer flex items-center gap-2 animate-bounce"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ADVANCE TO FINAL LEVEL 5 &rarr; (+{potentialScore} PTS)</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Freeze Field Hint (-300 PTS) */}
      {showHintConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel-purple border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.4)] flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                <Snowflake className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
                  Deploy Cryo-Freeze Field?
                </h3>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  Penalty: -300 Points &amp; +45s Time Penalty
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Activating the Cryo-Stasis field will freeze all 12 parasites in place for <span className="text-cyan-300 font-bold">6 seconds</span>, but will deduct <span className="text-rose-400 font-bold">300 PTS</span> from your squad score and add <span className="text-rose-400 font-bold">+45 seconds</span> to your penalty time.
            </p>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setShowHintConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHint}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-pointer transition-all"
              >
                Deploy Freeze (-300 PTS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="w-full mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>Requirement: Smash all 12 bugs within 30 seconds.</span>
        </div>
      </div>
    </div>
  );
};
