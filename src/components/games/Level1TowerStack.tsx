import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../services/soundEffects';
import { Layers, Sparkles, CheckCircle2, RotateCcw, AlertCircle, ArrowDown, Shield } from 'lucide-react';

interface Props {
  onComplete: (levelDurationSec: number) => void;
  onSkipRequest?: () => void;
}

interface Block {
  x: number; // percentage from left (0 to 100)
  width: number; // percentage width
  color: string;
}

const TARGET_HEIGHT = 5; // 5 stacked blocks to clear Level 1
const MIN_BLOCK_WIDTH = 24; // Never shrink below 24% width for fair gameplay
const PERFECT_SNAP_TOLERANCE = 5.0; // Within 5% alignment = Snap to perfect stack

const BLOCK_COLORS = [
  '#06b6d4', // cyan (base)
  '#38bdf8', // sky
  '#818cf8', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
  '#10b981', // emerald
];

export const Level1TowerStack: React.FC<Props> = ({ onComplete, onSkipRequest }) => {
  const [tower, setTower] = useState<Block[]>([
    { x: 26, width: 48, color: BLOCK_COLORS[0] }, // Sturdy wide foundation
  ]);
  const [currentWidth, setCurrentWidth] = useState<number>(48);
  const [displayX, setDisplayX] = useState<number>(10);
  const [livesLeft, setLivesLeft] = useState<number>(3); // 3 stabilizer attempts
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictorious, setIsVictorious] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('Press SPACEBAR or click DROP to stack blocks!');

  // Animation physics state managed via refs to avoid React state tearing
  const blockXRef = useRef<number>(10);
  const dirRef = useRef<number>(1);
  const currentWidthRef = useRef<number>(48);
  const towerRef = useRef<Block[]>([{ x: 26, width: 48, color: BLOCK_COLORS[0] }]);
  const livesLeftRef = useRef<number>(3);
  const isGameOverRef = useRef<boolean>(false);
  const isVictoriousRef = useRef<boolean>(false);

  // Keep refs in sync
  currentWidthRef.current = currentWidth;
  towerRef.current = tower;
  livesLeftRef.current = livesLeft;
  isGameOverRef.current = isGameOver;
  isVictoriousRef.current = isVictorious;

  // Track level elapsed time for score calculation
  const startTimeRef = useRef<number>(Date.now());
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setSecondsElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 60FPS Frame-rate independent physics loop using requestAnimationFrame + delta time
  // Guarantees consistent speed across 60Hz, 120Hz, and 144Hz monitors!
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      // Delta time normalized to standard 60 FPS (16.67ms per frame)
      const dt = Math.min((currentTime - lastTime) / (1000 / 60), 2.0);
      lastTime = currentTime;

      if (!isGameOverRef.current && !isVictoriousRef.current) {
        // Progressive, achievable speed scaling:
        // Placing Node 2 (Tier 0): 0.52 * dt (1.00x baseline - steady reaction window)
        // Placing Node 3 (Tier 1): 0.64 * dt (1.23x - smooth acceleration)
        // Placing Node 4 (Tier 2): 0.76 * dt (1.46x - brisk focus)
        // Placing Node 5 (Tier 3): 0.88 * dt (1.69x - thrilling final node, fully achievable)
        const currentTier = Math.max(0, towerRef.current.length - 1);
        const speed = (0.52 + currentTier * 0.12) * dt;

        let nextX = blockXRef.current + dirRef.current * speed;
        const w = currentWidthRef.current;

        if (nextX + w >= 94) {
          nextX = 94 - w;
          dirRef.current = -1;
        } else if (nextX <= 6) {
          nextX = 6;
          dirRef.current = 1;
        }

        blockXRef.current = nextX;
        setDisplayX(nextX);
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Drop action
  const handleDrop = () => {
    if (isGameOver || isVictorious) return;

    const currentX = blockXRef.current;
    const w = currentWidthRef.current;
    const currentTower = towerRef.current;
    const topBlock = currentTower[currentTower.length - 1];

    const dropLeft = currentX;
    const dropRight = currentX + w;
    const targetLeft = topBlock.x;
    const targetRight = topBlock.x + topBlock.width;

    // Overlap computation
    const overlapLeft = Math.max(dropLeft, targetLeft);
    const overlapRight = Math.min(dropRight, targetRight);
    const overlapWidth = overlapRight - overlapLeft;

    // Check if missed completely
    if (overlapWidth <= 0) {
      sounds.playBuzzer();
      const remainingLives = livesLeftRef.current - 1;
      setLivesLeft(remainingLives);

      if (remainingLives <= 0) {
        setIsGameOver(true);
        setFeedback('Tower destabilized! Stabilizers exhausted. Click Retry.');
      } else {
        setFeedback(`Stabilizer absorbed impact! ${remainingLives} life left. Try again!`);
        // Reset oscillating block position
        blockXRef.current = dirRef.current > 0 ? 8 : 92 - w;
      }
      return;
    }

    // Check for near-perfect alignment snap
    const leftDiff = Math.abs(dropLeft - targetLeft);
    let finalX: number;
    let finalWidth: number;

    if (leftDiff <= PERFECT_SNAP_TOLERANCE) {
      // Perfect placement!
      sounds.playCapture();
      finalX = targetLeft;
      finalWidth = topBlock.width;
      setFeedback('✨ PERFECT ALIGNMENT! +Zero-G Harmonic Lock!');
    } else {
      sounds.playClick();
      finalX = overlapLeft;
      // Protect from shrinking too thin: minimum width floor
      finalWidth = Math.max(MIN_BLOCK_WIDTH, overlapWidth);
      setFeedback(`Node locked! Stacked with ${Math.round(finalWidth)}% width.`);
    }

    const nextTower = [
      ...currentTower,
      {
        x: finalX,
        width: finalWidth,
        color: BLOCK_COLORS[currentTower.length % BLOCK_COLORS.length],
      },
    ];

    setTower(nextTower);
    setCurrentWidth(finalWidth);

    // Reposition moving block for next tier
    blockXRef.current = 10;
    dirRef.current = 1;
    setDisplayX(10);

    if (nextTower.length >= TARGET_HEIGHT) {
      sounds.playLevelWin();
      setIsVictorious(true);
      setFeedback(`🎉 TOWER STABILIZED! ${TARGET_HEIGHT}/${TARGET_HEIGHT} Nodes Stacked!`);
    }
  };

  const handleRetry = () => {
    sounds.playClick();
    const initialTower = [{ x: 26, width: 48, color: BLOCK_COLORS[0] }];
    setTower(initialTower);
    setCurrentWidth(48);
    setLivesLeft(3);
    setIsGameOver(false);
    setIsVictorious(false);
    setFeedback('Press SPACEBAR or click DROP to stack blocks!');
    blockXRef.current = 10;
    dirRef.current = 1;
    setDisplayX(10);
  };

  // Keyboard space / enter listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleDrop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, isVictorious]);

  // Transparent speed bonus calculation: 1000 base + up to 1000 time bonus
  const potentialScore = 1000 + Math.max(100, 1000 - secondsElapsed * 15);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Level Header / Briefing */}
      <div className="w-full glass-panel rounded-2xl p-5 mb-5 border border-cyan-500/30 neon-border-cyan flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Mission Level 01 // Orbital Engineering</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-wide">
            Quantum Tower Stack Challenge
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Time your drops to stack oscillating quantum blocks onto the launch backbone. Reach <span className="text-cyan-300 font-bold">{TARGET_HEIGHT} tiers high</span> to clear Sector 01!
          </p>
        </div>

        {/* Level Stats HUD: Time + Speed Bonus + Stabilizer Lives */}
        <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-xl border border-cyan-500/30">
          <div>
            <div className="text-[10px] font-mono text-slate-400">LEVEL TIME</div>
            <div className="text-lg font-display font-extrabold text-cyan-300">
              {secondsElapsed}s
            </div>
          </div>
          <div className="w-px h-7 bg-slate-800" />
          <div>
            <div className="text-[10px] font-mono text-slate-400">SPEED BONUS</div>
            <div className="text-lg font-display font-extrabold text-amber-400">
              +{potentialScore} PTS
            </div>
          </div>
          <div className="w-px h-7 bg-slate-800" />
          <div>
            <div className="text-[10px] font-mono text-slate-400">STABILIZERS</div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold mt-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Shield
                  key={i}
                  className={`w-4 h-4 ${i < livesLeft ? 'text-emerald-400 fill-emerald-400/40' : 'text-slate-700'}`}
                />
              ))}
            </div>
          </div>
          <div className="w-px h-7 bg-slate-800" />
          <div>
            <div className="text-[10px] font-mono text-slate-400">STACK HEIGHT</div>
            <div className="text-lg font-display font-extrabold text-white">
              {tower.length} <span className="text-slate-500">/ {TARGET_HEIGHT}</span>
            </div>
          </div>
          <div className="w-px h-7 bg-slate-800" />
          <div>
            <div className="text-[10px] font-mono text-slate-400">NODE VELOCITY</div>
            <div className="text-sm font-display font-extrabold text-cyan-300 mt-0.5">
              {tower.length === 1 && '1.0x (Steady)'}
              {tower.length === 2 && '1.2x (Moderate)'}
              {tower.length === 3 && '1.5x (Accelerated)'}
              {tower.length >= 4 && '1.7x (Surge)'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tower Canvas Stacking Container */}
      <div className="relative w-full h-[480px] md:h-[500px] rounded-2xl glass-panel-purple overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col justify-between p-4">
        {/* Status text */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            CONTROL: [SPACEBAR] OR CLICK THE DROP BUTTON BELOW
          </span>
          <span className="text-cyan-300 font-bold">{feedback}</span>
        </div>

        {/* Tower Stacking Stage Area */}
        <div className="relative flex-1 w-full mx-auto max-w-xl my-2 border border-slate-800/80 rounded-xl bg-slate-950/70 overflow-hidden flex flex-col justify-end p-4">
          {/* Background grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Goal Line Indicator */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-cyan-400/60 flex items-center justify-between px-3 pointer-events-none"
            style={{ bottom: `${(TARGET_HEIGHT - 1) * 44 + 40}px` }}
          >
            <span className="text-[10px] font-mono text-cyan-300 bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-500/30">
              TARGET: LEVEL {TARGET_HEIGHT} NODES
            </span>
            <span className="text-[10px] font-mono text-cyan-300 bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-500/30">
              FINISH LINE
            </span>
          </div>

          {/* Moving Active Block */}
          {!isGameOver && !isVictorious && (
            <div
              className="absolute h-9 rounded-lg shadow-lg border-2 border-white transition-none pointer-events-none"
              style={{
                left: `${displayX}%`,
                width: `${currentWidth}%`,
                bottom: `${tower.length * 44 + 20}px`,
                backgroundColor: BLOCK_COLORS[tower.length % BLOCK_COLORS.length],
                boxShadow: `0 0 20px ${BLOCK_COLORS[tower.length % BLOCK_COLORS.length]}aa`,
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-[10px] font-mono font-bold text-slate-950 tracking-wider">
                DROP HERE
              </div>
            </div>
          )}

          {/* Stacked Tower Blocks */}
          {tower.map((block, idx) => (
            <div
              key={idx}
              className="absolute h-9 rounded-lg border border-slate-700/80 transition-all duration-150 flex items-center justify-between px-3 text-[10px] font-mono text-slate-950 font-extrabold"
              style={{
                left: `${block.x}%`,
                width: `${block.width}%`,
                bottom: `${idx * 44 + 20}px`,
                backgroundColor: block.color,
                boxShadow: idx === tower.length - 1 ? `0 0 15px ${block.color}88` : 'none',
              }}
            >
              <span>#{idx + 1}</span>
              {idx === 0 ? <span>BASE FOUNDATION</span> : <span>NODE {idx + 1}</span>}
            </div>
          ))}

          {/* Base Ground Platform */}
          <div className="w-full h-5 rounded-full bg-slate-800 border-t border-cyan-500/40 relative z-0 flex items-center justify-center">
            <span className="text-[9px] font-mono text-slate-400 font-bold tracking-widest">
              LAUNCHPAD PLATFORM FOUNDATION
            </span>
          </div>
        </div>

        {/* Drop Button Control */}
        <div className="flex items-center justify-center gap-4">
          {!isGameOver && !isVictorious ? (
            <button
              onClick={handleDrop}
              className="w-full max-w-md py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <ArrowDown className="w-5 h-5 animate-bounce" />
              <span>DROP BLOCK (SPACEBAR)</span>
            </button>
          ) : isGameOver ? (
            <button
              onClick={handleRetry}
              className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.6)] transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RETRY LEVEL 1 ({livesLeft === 0 ? 'STABILIZERS EXHAUSTED' : 'COLLAPSED'})</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sounds.playClick();
                onComplete(secondsElapsed);
              }}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.9)] transition-all cursor-pointer flex items-center gap-2 animate-bounce"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>LEVEL 1 CLEARED &rarr; PROCEED TO LEVEL 2 (+{potentialScore} PTS)</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          <span>Fast stacking awards maximum speed points (up to +2000 PTS).</span>
        </div>
      </div>
    </div>
  );
};
