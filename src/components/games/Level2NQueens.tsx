import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../services/soundEffects';
import { Crown, Sparkles, CheckCircle2, RotateCcw, AlertCircle, ShieldAlert, HelpCircle } from 'lucide-react';

interface Props {
  onComplete: (levelDurationSec: number) => void;
  onApplyPenalty?: (pointsDeduction: number, penaltySec: number, reason: string) => void;
  onSkipRequest?: () => void;
}

interface QueenPos {
  row: number;
  col: number;
}

// Canonical 5x5 solution for deterministic safe hints
const CANONICAL_5X5_SOLUTION: QueenPos[] = [
  { row: 0, col: 1 },
  { row: 1, col: 3 },
  { row: 2, col: 0 },
  { row: 3, col: 2 },
  { row: 4, col: 4 },
];

export const Level2NQueens: React.FC<Props> = ({ onComplete, onApplyPenalty }) => {
  const boardSize = 5; // Strictly locked to 5x5 (5 Queens) - No player choice allowed
  const [queens, setQueens] = useState<QueenPos[]>([]);
  const [conflicts, setConflicts] = useState<number[][]>([]); // array of conflicting pair indices
  const [isVictorious, setIsVictorious] = useState<boolean>(false);
  const [hintMessage, setHintMessage] = useState<string>('');
  const [showHintConfirm, setShowHintConfirm] = useState<boolean>(false);
  const [highlightedCell, setHighlightedCell] = useState<QueenPos | null>(null);

  // Speed bonus timer
  const startTimeRef = useRef<number>(Date.now());
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setSecondsElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate conflicts whenever queens change
  useEffect(() => {
    const conflictingSet: number[][] = [];

    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const q1 = queens[i];
        const q2 = queens[j];

        // Same row, same col, or same diagonal
        const sameRow = q1.row === q2.row;
        const sameCol = q1.col === q2.col;
        const sameDiag = Math.abs(q1.row - q2.row) === Math.abs(q1.col - q2.col);

        if (sameRow || sameCol || sameDiag) {
          conflictingSet.push([i, j]);
        }
      }
    }

    setConflicts(conflictingSet);

    // Check if player solved it (placed exactly N queens with 0 conflicts)
    if (queens.length === boardSize && conflictingSet.length === 0) {
      sounds.playLevelWin();
      setIsVictorious(true);
    }
  }, [queens, boardSize]);

  // Click on a cell to toggle Queen
  const handleCellClick = (row: number, col: number) => {
    if (isVictorious) return;

    const existingIndex = queens.findIndex((q) => q.row === row && q.col === col);
    if (existingIndex >= 0) {
      // Remove queen
      sounds.playClick();
      setQueens(queens.filter((_, idx) => idx !== existingIndex));
      return;
    }

    // Place queen
    if (queens.length >= boardSize) {
      sounds.playBuzzer();
      setHintMessage(`You already placed all ${boardSize} queens. Remove one first or adjust.`);
      setTimeout(() => setHintMessage(''), 2500);
      return;
    }

    sounds.playCapture();
    setQueens([...queens, { row, col }]);
  };

  const handleClearBoard = () => {
    sounds.playClick();
    setQueens([]);
    setIsVictorious(false);
    setHintMessage('');
  };

  const handleConfirmHint = () => {
    setShowHintConfirm(false);
    sounds.playClick();
    onApplyPenalty?.(100, 15, 'Level 2 Queen Placement Hint');

    // Pick an unplaced queen from CANONICAL_5X5_SOLUTION
    const unplaced = CANONICAL_5X5_SOLUTION.find(
      (sol) => !queens.some((q) => q.row === sol.row && q.col === sol.col)
    );

    if (unplaced) {
      setHighlightedCell(unplaced);
      setHintMessage(`💡 HINT (-100 PTS, +15s): Optimal Queen node identified at Row ${unplaced.row + 1}, Col ${unplaced.col + 1}!`);
      setTimeout(() => setHighlightedCell(null), 8000);
    } else {
      setHintMessage('💡 HINT: Check for collisions among your placed Queens.');
    }
  };

  const isCellQueen = (r: number, c: number) => {
    return queens.some((q) => q.row === r && q.col === c);
  };

  // Check if a queen at (r, c) is in conflict
  const isQueenInConflict = (r: number, c: number) => {
    const qIdx = queens.findIndex((q) => q.row === r && q.col === c);
    if (qIdx === -1) return false;
    return conflicts.some(([i, j]) => i === qIdx || j === qIdx);
  };

  // Check if cell is in threat zone of any placed queen
  const isCellThreatened = (r: number, c: number) => {
    return queens.some((q) => {
      if (q.row === r && q.col === c) return false;
      return (
        q.row === r ||
        q.col === c ||
        Math.abs(q.row - r) === Math.abs(q.col - c)
      );
    });
  };

  const potentialScore = 1000 + Math.max(100, 1000 - secondsElapsed * 15);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Level Header / Briefing */}
      <div className="w-full glass-panel rounded-2xl p-5 mb-5 border border-purple-500/30 neon-border-purple flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Crown className="w-4 h-4 text-purple-400" />
            <span>Mission Level 02 // Quantum Algorithmic Grid</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-wide">
            N-Queens Core Alignment
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Place <span className="text-purple-300 font-bold">{boardSize} Queens</span> onto the matrix so that no two queens attack each other (no shared row, column, or diagonal line).
          </p>
        </div>

        {/* Speed & Stats */}
        <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-xl border border-purple-500/30">
          <div>
            <div className="text-[10px] font-mono text-slate-400">LEVEL TIME</div>
            <div className="text-lg font-display font-extrabold text-cyan-300">
              {secondsElapsed}s
            </div>
          </div>
          <div className="w-px h-7 bg-slate-800" />
          <div>
            <div className="text-[10px] font-mono text-slate-400">CURRENT SPEED BONUS</div>
            <div className="text-lg font-display font-extrabold text-amber-400">
              +{potentialScore} PTS
            </div>
          </div>
          <div className="w-px h-7 bg-slate-800" />
          <div>
            <div className="text-[10px] font-mono text-slate-400">QUEENS PLACED</div>
            <div className="text-lg font-display font-extrabold text-white">
              {queens.length} <span className="text-slate-500">/ {boardSize}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chessboard Container */}
      <div className="w-full rounded-2xl glass-panel-purple p-6 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.25)] flex flex-col items-center gap-5">
        {/* Board Controls */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-slate-400">Target Alignment:</span>
            <span className="px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-500/50 text-purple-300 text-xs font-mono font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)]">
              5&times;5 Quantum Matrix (5 Queens Required)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHintConfirm(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-950/70 text-amber-300 border border-amber-500/50 hover:bg-amber-900/60 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="Get Queen placement hint (-100 PTS, +15s)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Hint (-100 PTS)</span>
            </button>
            <button
              onClick={handleClearBoard}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-white text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Conflict Alert Banner */}
        {conflicts.length > 0 ? (
          <div className="w-full max-w-md py-1.5 px-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono text-center flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>COLLISION DETECTED! {conflicts.length} attack trajectory path(s) active.</span>
          </div>
        ) : queens.length === boardSize ? (
          <div className="w-full max-w-md py-1.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono text-center flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>HARMONIC EQUILIBRIUM ACHIEVED! No queens under attack.</span>
          </div>
        ) : (
          <div className="w-full max-w-md py-1.5 px-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs font-mono text-center">
            Click cells to position or remove Queens ({boardSize - queens.length} remaining).
          </div>
        )}

        {hintMessage && (
          <div className="text-xs font-mono text-amber-300 bg-amber-950/40 px-3 py-1 rounded border border-amber-500/30">
            {hintMessage}
          </div>
        )}

        {/* Dynamic Chessboard Grid */}
        <div
          className="grid gap-2 p-4 rounded-2xl bg-slate-950/90 border-2 border-purple-500/40 shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            width: boardSize === 4 ? '340px' : '400px',
            height: boardSize === 4 ? '340px' : '400px',
          }}
        >
          {Array.from({ length: boardSize * boardSize }).map((_, index) => {
            const r = Math.floor(index / boardSize);
            const c = index % boardSize;
            const hasQueen = isCellQueen(r, c);
            const inConflict = hasQueen && isQueenInConflict(r, c);
            const isThreatened = !hasQueen && isCellThreatened(r, c);
            const isDarkCell = (r + c) % 2 === 1;

            const isHighlighted = highlightedCell && highlightedCell.row === r && highlightedCell.col === c;

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`relative rounded-xl flex items-center justify-center transition-all cursor-pointer group ${
                  isHighlighted ? 'ring-4 ring-amber-400 animate-pulse' : ''
                } ${
                  hasQueen
                    ? inConflict
                      ? 'bg-rose-950/90 border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]'
                      : 'bg-purple-950/90 border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.8)]'
                    : isThreatened
                    ? 'bg-slate-900/40 border border-slate-800/80 hover:border-purple-400'
                    : isDarkCell
                    ? 'bg-slate-900/90 border border-slate-800 hover:border-purple-500/60'
                    : 'bg-slate-800/70 border border-slate-700/60 hover:border-purple-500/60'
                }`}
                title={`Cell [${r + 1}, ${c + 1}]`}
              >
                {hasQueen && (
                  <div className="flex flex-col items-center justify-center">
                    <Crown
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110 ${
                        inConflict
                          ? 'text-rose-400 animate-bounce'
                          : 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                      }`}
                    />
                    <span className="text-[8px] font-mono text-purple-200 font-bold mt-0.5">
                      Q
                    </span>
                  </div>
                )}
                {!hasQueen && (
                  <span className="text-[10px] font-mono text-slate-700 opacity-40 group-hover:opacity-100 group-hover:text-purple-300">
                    +
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Victory Proceed Button */}
        {isVictorious && (
          <div className="animate-fade-in flex flex-col items-center gap-2 mt-2">
            <button
              onClick={() => {
                sounds.playClick();
                onComplete(secondsElapsed);
              }}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.9)] transition-all cursor-pointer flex items-center gap-2 animate-bounce"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>N-QUEENS SOLVED &rarr; PROCEED (+{potentialScore} PTS)</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Hint (-100 PTS) */}
      {showHintConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel-purple border-2 border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.4)] flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
                  Request Queen Placement Hint?
                </h3>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  Penalty: -100 Points &amp; +15s Time Penalty
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Revealing an optimal quantum queen node will deduct <span className="text-amber-300 font-bold">100 PTS</span> from your score and add <span className="text-rose-400 font-bold">+15 seconds</span> to your penalty time.
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
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer transition-all"
              >
                Confirm Hint (-100 PTS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="w-full mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <AlertCircle className="w-4 h-4 text-purple-400" />
          <span>Requirement: Place all 5 Queens on the 5&times;5 matrix with 0 row, column, or diagonal line-of-sight collisions.</span>
        </div>
      </div>
    </div>
  );
};
