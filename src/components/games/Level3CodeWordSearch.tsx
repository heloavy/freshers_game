import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../services/soundEffects';
import { Code2, Sparkles, CheckCircle2, RotateCcw, AlertCircle, HelpCircle, Search, Terminal, Cpu } from 'lucide-react';

interface Props {
  onComplete: (levelDurationSec: number) => void;
  onApplyPenalty?: (pointsDeduction: number, penaltySec: number, reason: string) => void;
  onSkipRequest?: () => void;
}

export interface WordPlacement {
  word: string;
  cat: 'C Language' | 'Python' | 'Compiler';
  clue: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  dr: number;
  dc: number;
  len: number;
  color: string;
}

// 17 C, Python & Compiler words perfectly placed in the 13x13 matrix
export const CODING_WORDS: WordPlacement[] = [
  {
    word: 'POINTER',
    cat: 'C Language',
    clue: 'Memory address referencing variable (*ptr)',
    startRow: 11,
    startCol: 12,
    endRow: 5,
    endCol: 12,
    dr: -1,
    dc: 0,
    len: 7,
    color: '#ec4899', // Pink (like image 2)
  },
  {
    word: 'MALLOC',
    cat: 'C Language',
    clue: 'Dynamic heap memory allocation function',
    startRow: 2,
    startCol: 7,
    endRow: 7,
    endCol: 2,
    dr: 1,
    dc: -1,
    len: 6,
    color: '#84cc16', // Lime green
  },
  {
    word: 'STRUCT',
    cat: 'C Language',
    clue: 'Composite user-defined data structure',
    startRow: 11,
    startCol: 4,
    endRow: 6,
    endCol: 9,
    dr: -1,
    dc: 1,
    len: 6,
    color: '#a855f7', // Purple
  },
  {
    word: 'SIZEOF',
    cat: 'C Language',
    clue: 'Compile-time operator yielding byte footprint',
    startRow: 3,
    startCol: 5,
    endRow: 8,
    endCol: 10,
    dr: 1,
    dc: 1,
    len: 6,
    color: '#06b6d4', // Cyan
  },
  {
    word: 'BUFFER',
    cat: 'C Language',
    clue: 'Contiguous temporary memory storage',
    startRow: 0,
    startCol: 4,
    endRow: 0,
    endCol: 9,
    dr: 0,
    dc: 1,
    len: 6,
    color: '#f59e0b', // Amber
  },
  {
    word: 'HEADER',
    cat: 'C Language',
    clue: '.h file containing function declarations & macros',
    startRow: 7,
    startCol: 3,
    endRow: 12,
    endCol: 8,
    dr: 1,
    dc: 1,
    len: 6,
    color: '#38bdf8', // Sky blue
  },
  {
    word: 'LAMBDA',
    cat: 'Python',
    clue: 'Anonymous inline single-expression function',
    startRow: 11,
    startCol: 6,
    endRow: 6,
    endCol: 11,
    dr: -1,
    dc: 1,
    len: 6,
    color: '#10b981', // Emerald
  },
  {
    word: 'YIELD',
    cat: 'Python',
    clue: 'Generator function value emitter & pause state',
    startRow: 5,
    startCol: 5,
    endRow: 1,
    endCol: 9,
    dr: -1,
    dc: 1,
    len: 5,
    color: '#f43f5e', // Rose
  },
  {
    word: 'IMPORT',
    cat: 'Python',
    clue: 'Module & package namespace inclusion keyword',
    startRow: 10,
    startCol: 1,
    endRow: 5,
    endCol: 6,
    dr: -1,
    dc: 1,
    len: 6,
    color: '#6366f1', // Indigo
  },
  {
    word: 'GLOBAL',
    cat: 'Python',
    clue: 'Scope specifier modifying outer module bindings',
    startRow: 2,
    startCol: 0,
    endRow: 2,
    endCol: 5,
    dr: 0,
    dc: 1,
    len: 6,
    color: '#eab308', // Yellow
  },
  {
    word: 'RETURN',
    cat: 'Python',
    clue: 'Function termination and output payload passing',
    startRow: 7,
    startCol: 6,
    endRow: 2,
    endCol: 11,
    dr: -1,
    dc: 1,
    len: 6,
    color: '#14b8a6', // Teal
  },
  {
    word: 'ASSERT',
    cat: 'Python',
    clue: 'Runtime condition invariant verification expression',
    startRow: 2,
    startCol: 6,
    endRow: 7,
    endCol: 1,
    dr: 1,
    dc: -1,
    len: 6,
    color: '#f97316', // Orange
  },
  {
    word: 'PARSER',
    cat: 'Compiler',
    clue: 'Syntax tree generator converting token streams',
    startRow: 5,
    startCol: 11,
    endRow: 10,
    endCol: 11,
    dr: 1,
    dc: 0,
    len: 6,
    color: '#d946ef', // Fuchsia
  },
  {
    word: 'LINKER',
    cat: 'Compiler',
    clue: 'Combines compiled object files into binary executable',
    startRow: 12,
    startCol: 10,
    endRow: 7,
    endCol: 5,
    dr: -1,
    dc: -1,
    len: 6,
    color: '#8b5cf6', // Violet
  },
  {
    word: 'SYNTAX',
    cat: 'Compiler',
    clue: 'Formal grammatical rules defining valid code grammar',
    startRow: 7,
    startCol: 0,
    endRow: 12,
    endCol: 0,
    dr: 1,
    dc: 0,
    len: 6,
    color: '#0ea5e9', // Light blue
  },
  {
    word: 'BINARY',
    cat: 'Compiler',
    clue: 'Machine code 0s and 1s instruction encoding',
    startRow: 1,
    startCol: 8,
    endRow: 1,
    endCol: 3,
    dr: 0,
    dc: -1,
    len: 6,
    color: '#4ade80', // Mint green
  },
  {
    word: 'TOKENS',
    cat: 'Compiler',
    clue: 'Lexical analysis atomic syntax units (lexer output)',
    startRow: 12,
    startCol: 7,
    endRow: 12,
    endCol: 2,
    dr: 0,
    dc: -1,
    len: 6,
    color: '#fbbf24', // Gold
  },
];

// The 13x13 Letter Matrix
export const MATRIX_GRID: string[][] = [
  ['T', 'K', 'I', 'B', 'B', 'U', 'F', 'F', 'E', 'R', 'M', 'B', 'B'],
  ['Y', 'H', 'V', 'Y', 'R', 'A', 'N', 'I', 'B', 'D', 'U', 'P', 'T'],
  ['G', 'L', 'O', 'B', 'A', 'L', 'A', 'M', 'L', 'L', 'L', 'N', 'A'],
  ['I', 'W', 'X', 'L', 'Y', 'S', 'A', 'E', 'W', 'K', 'R', 'N', 'M'],
  ['Q', 'S', 'G', 'N', 'S', 'L', 'I', 'M', 'X', 'U', 'Y', 'U', 'G'],
  ['V', 'G', 'O', 'E', 'L', 'Y', 'T', 'Z', 'T', 'R', 'S', 'P', 'R'],
  ['H', 'O', 'R', 'O', 'X', 'R', 'P', 'E', 'E', 'T', 'L', 'A', 'E'],
  ['S', 'T', 'C', 'H', 'O', 'R', 'R', 'S', 'C', 'O', 'D', 'R', 'T'],
  ['Y', 'N', 'U', 'P', 'E', 'R', 'E', 'U', 'J', 'B', 'F', 'S', 'N'],
  ['N', 'N', 'M', 'Q', 'Y', 'A', 'R', 'K', 'M', 'P', 'Y', 'E', 'I'],
  ['T', 'I', 'U', 'E', 'Q', 'T', 'D', 'A', 'N', 'X', 'G', 'R', 'O'],
  ['A', 'P', 'M', 'G', 'S', 'D', 'L', 'E', 'X', 'I', 'Y', 'L', 'P'],
  ['X', 'U', 'S', 'N', 'E', 'K', 'O', 'T', 'R', 'D', 'L', 'Y', 'Y'],
];

const REQUIRED_WORDS_COUNT = 10; // Minimum 10 words required to complete station

interface CellCoord {
  row: number;
  col: number;
}

export const Level3CodeWordSearch: React.FC<Props> = ({ onComplete, onApplyPenalty, onSkipRequest }) => {
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedStart, setSelectedStart] = useState<CellCoord | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<CellCoord | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'C Language' | 'Python' | 'Compiler'>('ALL');
  const [statusMessage, setStatusMessage] = useState<string>('Drag or tap start & end letters to circle coding words');
  const [isVictorious, setIsVictorious] = useState<boolean>(false);
  const [hintWord, setHintWord] = useState<WordPlacement | null>(null);
  const [showHintConfirm, setShowHintConfirm] = useState<boolean>(false);

  // Speed scoring timer
  const startTimeRef = useRef<number>(Date.now());
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setSecondsElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute points: 1000 base + speed bonus
  const potentialScore = 1000 + Math.max(100, 1000 - secondsElapsed * 8);

  // Helper: check if two coordinates form a valid straight line (horizontal, vertical, diagonal)
  const getLineCells = (start: CellCoord, end: CellCoord): CellCoord[] | null => {
    const dRow = end.row - start.row;
    const dCol = end.col - start.col;

    const absRow = Math.abs(dRow);
    const absCol = Math.abs(dCol);

    if (absRow === 0 && absCol === 0) {
      return [start];
    }

    // Must be straight line: horizontal (absRow === 0), vertical (absCol === 0), or diagonal (absRow === absCol)
    if (absRow !== 0 && absCol !== 0 && absRow !== absCol) {
      return null;
    }

    const steps = Math.max(absRow, absCol);
    const stepRow = dRow === 0 ? 0 : dRow / absRow;
    const stepCol = dCol === 0 ? 0 : dCol / absCol;

    const cells: CellCoord[] = [];
    for (let i = 0; i <= steps; i++) {
      cells.push({
        row: start.row + i * stepRow,
        col: start.col + i * stepCol,
      });
    }
    return cells;
  };

  // Extract word string from start to end cells
  const getWordFromLine = (start: CellCoord, end: CellCoord): string | null => {
    const cells = getLineCells(start, end);
    if (!cells) return null;
    return cells.map((c) => MATRIX_GRID[c.row][c.col]).join('');
  };

  // Check if a line matches any of our target words (forward or reverse)
  const checkSelection = (start: CellCoord, end: CellCoord) => {
    const str = getWordFromLine(start, end);
    if (!str) {
      setSelectedStart(null);
      setSelectedEnd(null);
      return;
    }

    const rev = str.split('').reverse().join('');
    const matchedWord = CODING_WORDS.find((w) => w.word === str || w.word === rev);

    if (matchedWord) {
      if (foundWords.includes(matchedWord.word)) {
        setStatusMessage(`"${matchedWord.word}" already found! Keep searching.`);
        sounds.playClick();
      } else {
        const nextFound = [...foundWords, matchedWord.word];
        setFoundWords(nextFound);
        sounds.playCapture();
        setStatusMessage(`FOUND [${matchedWord.cat}]: "${matchedWord.word}" — ${matchedWord.clue}!`);

        if (nextFound.length >= REQUIRED_WORDS_COUNT && !isVictorious) {
          setIsVictorious(true);
          sounds.playLevelWin();
        }
      }
    } else {
      sounds.playBuzzer();
      setStatusMessage(`"${str}" is not in the coding word bank. Try another!`);
    }

    setSelectedStart(null);
    setSelectedEnd(null);
  };

  // Mouse / Touch handlers for cell interaction
  const handleCellClick = (row: number, col: number) => {
    if (!selectedStart) {
      sounds.playClick();
      setSelectedStart({ row, col });
      setSelectedEnd({ row, col });
      setStatusMessage(`Selected '${MATRIX_GRID[row][col]}'. Now tap the last letter of the word!`);
    } else {
      // Second tap: evaluate line
      checkSelection(selectedStart, { row, col });
    }
  };

  const handleCellMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    setSelectedStart({ row, col });
    setSelectedEnd({ row, col });
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (isDragging && selectedStart) {
      setSelectedEnd({ row, col });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && selectedStart && selectedEnd) {
      setIsDragging(false);
      checkSelection(selectedStart, selectedEnd);
    }
  };

  // Touch move support for phone screens
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !gridContainerRef.current) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.hasAttribute('data-row') && element.hasAttribute('data-col')) {
      const row = parseInt(element.getAttribute('data-row')!, 10);
      const col = parseInt(element.getAttribute('data-col')!, 10);
      setSelectedEnd({ row, col });
    }
  };

  const handleTouchEnd = () => {
    if (isDragging && selectedStart && selectedEnd) {
      setIsDragging(false);
      checkSelection(selectedStart, selectedEnd);
    }
  };

  // Hint button: reveals first letter and direction of an undiscovered word with -200 PTS penalty
  const handleConfirmHint = () => {
    setShowHintConfirm(false);
    sounds.playClick();
    onApplyPenalty?.(200, 30, 'Level 3 Keyword Hint');

    const remaining = CODING_WORDS.filter((w) => !foundWords.includes(w.word));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    setHintWord(pick);
    setStatusMessage(`💡 HINT (-200 PTS, +30s): Look for "${pick.word}" (${pick.cat}) starting at Row ${pick.startRow + 1}, Col ${pick.startCol + 1}!`);
  };

  // Current active line cells for preview highlight
  const currentLineCells = selectedStart && selectedEnd ? getLineCells(selectedStart, selectedEnd) : null;
  const isCellInCurrentLine = (r: number, c: number) => {
    if (!currentLineCells) return false;
    return currentLineCells.some((cell) => cell.row === r && cell.col === c);
  };

  // Filter word bank list for display
  const displayedWords = CODING_WORDS.filter((w) => {
    if (categoryFilter === 'ALL') return true;
    return w.cat === categoryFilter;
  });

  const remainingToGoal = Math.max(0, REQUIRED_WORDS_COUNT - foundWords.length);

  return (
    <div
      className="relative w-full max-w-6xl mx-auto flex flex-col items-center select-none"
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header HUD */}
      <div className="w-full glass-panel rounded-2xl p-5 mb-5 border border-amber-500/40 neon-border-amber flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Mission Level 03 // C, Python &amp; Compiler Matrix</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-wide">
            Compiler &amp; Syntax Word Search
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Locate hidden programming keywords across C, Python, and Compilers. Find <span className="text-amber-400 font-bold">minimum 10 words</span> to decrypt Sector 04!
          </p>
        </div>

        {/* Level Stats HUD */}
        <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-xl border border-amber-500/30">
          <div>
            <div className="text-[10px] font-mono text-slate-400">FOUND WORDS</div>
            <div className="text-xl font-display font-extrabold text-white">
              <span className={foundWords.length >= REQUIRED_WORDS_COUNT ? 'text-emerald-400' : 'text-amber-400'}>
                {foundWords.length}
              </span>
              <span className="text-slate-500 text-sm"> / {REQUIRED_WORDS_COUNT} min ({CODING_WORDS.length} total)</span>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div>
            <div className="text-[10px] font-mono text-slate-400">SPEED BONUS</div>
            <div className="text-xl font-display font-extrabold text-amber-300">
              +{potentialScore} PTS
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <button
            onClick={() => setShowHintConfirm(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            title="Get a hint for an undiscovered keyword (-200 PTS, +30s)"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Hint (-200 PTS)</span>
          </button>
        </div>
      </div>

      {/* Main Grid & Word Bank Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: 13x13 Word Search Matrix with Pill Highlights */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            ref={gridContainerRef}
            onTouchMove={handleTouchMove}
            className="relative p-3 sm:p-4 rounded-3xl glass-panel-purple border-2 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)] select-none touch-none"
          >
            {/* SVG Pill Capsule Overlays (rendered directly on top of letter cells like Image 2) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{ padding: '12px' }}
            >
              {/* Completed Found Words Pill Capsules */}
              {foundWords.map((wordStr) => {
                const placement = CODING_WORDS.find((w) => w.word === wordStr);
                if (!placement) return null;

                // 13 rows, 13 cols. Calculate percentages:
                const cellPercent = 100 / 13;
                const x1 = `${placement.startCol * cellPercent + cellPercent / 2}%`;
                const y1 = `${placement.startRow * cellPercent + cellPercent / 2}%`;
                const x2 = `${placement.endCol * cellPercent + cellPercent / 2}%`;
                const y2 = `${placement.endRow * cellPercent + cellPercent / 2}%`;

                return (
                  <line
                    key={placement.word}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={placement.color}
                    strokeWidth="28"
                    strokeLinecap="round"
                    opacity="0.45"
                    className="transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  />
                );
              })}

              {/* Active Dragging / Selecting Preview Line */}
              {selectedStart && selectedEnd && (
                <line
                  x1={`${selectedStart.col * (100 / 13) + (100 / 26)}%`}
                  y1={`${selectedStart.row * (100 / 13) + (100 / 26)}%`}
                  x2={`${selectedEnd.col * (100 / 13) + (100 / 26)}%`}
                  y2={`${selectedEnd.row * (100 / 13) + (100 / 26)}%`}
                  stroke="#38bdf8"
                  strokeWidth="24"
                  strokeLinecap="round"
                  opacity="0.55"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              )}
            </svg>

            {/* Matrix Letter Cells Grid */}
            <div className="grid grid-cols-13 gap-1 sm:gap-1.5 relative z-20">
              {MATRIX_GRID.map((row, r) =>
                row.map((letter, c) => {
                  const isInLine = isCellInCurrentLine(r, c);
                  const isStart = selectedStart?.row === r && selectedStart?.col === c;
                  const isEnd = selectedEnd?.row === r && selectedEnd?.col === c;

                  return (
                    <div
                      key={`${r}-${c}`}
                      data-row={r}
                      data-col={c}
                      onClick={() => handleCellClick(r, c)}
                      onMouseDown={() => handleCellMouseDown(r, c)}
                      onMouseEnter={() => handleCellMouseEnter(r, c)}
                      className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs sm:text-base md:text-lg cursor-pointer transition-all duration-150 select-none ${
                        isStart || isEnd
                          ? 'bg-amber-400 text-slate-950 font-black scale-110 shadow-[0_0_15px_rgba(245,158,11,0.9)] z-30'
                          : isInLine
                          ? 'bg-sky-400/40 text-white border border-sky-300 z-20 scale-105'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 border border-slate-800/80 hover:border-amber-400/50'
                      }`}
                    >
                      {letter}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Interactive Instructions & Feedback Toast */}
          <div className="w-full mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-amber-300 truncate">{statusMessage}</span>
            {selectedStart && (
              <button
                onClick={() => {
                  setSelectedStart(null);
                  setSelectedEnd(null);
                  setStatusMessage('Selection cleared.');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer ml-2 flex-shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Word Bank Categorized by C, Python, and Compiler */}
        <div className="lg:col-span-5 space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
            {(['ALL', 'C Language', 'Python', 'Compiler'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  sounds.playClick();
                  setCategoryFilter(tab);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center font-bold transition-all cursor-pointer ${
                  categoryFilter === tab
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab === 'ALL' ? 'ALL (17)' : tab === 'C Language' ? 'C (6)' : tab === 'Python' ? 'PYTHON (6)' : 'COMPILER (5)'}
              </button>
            ))}
          </div>

          {/* Goal Progress Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-purple-950/50 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div className="text-xs font-mono font-bold text-white">
                {foundWords.length >= REQUIRED_WORDS_COUNT ? (
                  <span className="text-emerald-400">Sector Goal Achieved ({foundWords.length}/10)!</span>
                ) : (
                  <span>Find {remainingToGoal} more words to unlock Level 04</span>
                )}
              </div>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold">
              {Math.min(100, Math.round((foundWords.length / REQUIRED_WORDS_COUNT) * 100))}%
            </span>
          </div>

          {/* Word List Cards with definitions */}
          <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {displayedWords.map((item) => {
              const isFound = foundWords.includes(item.word);
              return (
                <div
                  key={item.word}
                  className={`p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                    isFound
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold text-sm tracking-wide ${
                          isFound ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {item.word}
                      </span>
                      <span
                        className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-bold"
                        style={{
                          backgroundColor: `${item.color}25`,
                          color: item.color,
                          border: `1px solid ${item.color}60`,
                        }}
                      >
                        {item.cat}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{item.clue}</p>
                  </div>

                  <div className="flex items-center flex-shrink-0 pt-0.5">
                    {isFound ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.6)]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>FOUND</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-600">
                        {item.len} letters
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Victory Advance Banner once 10 words are reached */}
          {foundWords.length >= REQUIRED_WORDS_COUNT && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-900 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-fade-in flex flex-col items-center text-center gap-3">
              <div className="flex items-center gap-2 text-emerald-400 font-display font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>SECTOR 03 CLEARED! ({foundWords.length} Words Found)</span>
              </div>
              <p className="text-xs font-mono text-slate-300">
                You surpassed the 10-word threshold. Ready to smash glitches in Sector 04?
              </p>
              <button
                onClick={() => {
                  sounds.playClick();
                  onComplete(secondsElapsed);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.7)] transition-all cursor-pointer flex items-center justify-center gap-2 animate-bounce"
              >
                <span>PROCEED TO LEVEL 04 BUG SMASHER (+{potentialScore} PTS) &rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Hint (-200 PTS) */}
      {showHintConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel-purple border-2 border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.4)] flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
                  Request Keyword Search Hint?
                </h3>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  Penalty: -200 Points &amp; +30s Time Penalty
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Revealing an undiscovered keyword starting cell and direction will deduct <span className="text-amber-300 font-bold">200 PTS</span> from your squad score and add <span className="text-rose-400 font-bold">+30 seconds</span> to your penalty time.
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
                Confirm Hint (-200 PTS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="w-full mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Requirement: Find at least 10 C, Python &amp; Compiler keywords across the 13x13 matrix.</span>
        </div>
      </div>
    </div>
  );
};
