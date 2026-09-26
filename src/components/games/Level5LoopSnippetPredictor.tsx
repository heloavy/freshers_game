import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../services/soundEffects';
import { Terminal, Code, Sparkles, CheckCircle2, RotateCcw, AlertCircle, Play, HelpCircle, Trophy } from 'lucide-react';

interface Props {
  onComplete: (levelDurationSec: number) => void;
  onApplyPenalty?: (pointsDeduction: number, penaltySec: number, reason: string) => void;
  onSkipRequest?: () => void;
}

const C_SNIPPET = `#include <stdio.h>

int main() {
    int total = 0;
    int i, j;

    for (i = 1; i <= 4; i++) {
        for (j = i; j <= 4; j++) {
            if ((i + j) % 2 == 0) {
                total += (i * 2 + j);
            } else {
                total += (j - i);
            }
        }
    }

    printf("%d\\n", total);
    return 0;
}`;

// Cryptographic & mathematical verification without plain-text answers in bundle
const verifyOutput = (val: string): boolean => {
  const clean = val.trim();
  const n = parseInt(clean, 10);
  return btoa(clean) === 'NDk=' && (n * 7 + 13 === 356);
};

export const Level5LoopSnippetPredictor: React.FC<Props> = ({ onComplete, onApplyPenalty }) => {
  const [userInput, setUserInput] = useState<string>('');
  const [isVictorious, setIsVictorious] = useState<boolean>(false);
  const [errorShake, setErrorShake] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [showTraceTable, setShowTraceTable] = useState<boolean>(false);
  const [hasUnlockedTraceGuide, setHasUnlockedTraceGuide] = useState<boolean>(false);
  const [showHintConfirm, setShowHintConfirm] = useState<boolean>(false);

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isVictorious) return;

    const trimmed = userInput.trim();
    if (verifyOutput(trimmed)) {
      sounds.playGrandVictory();
      setIsVictorious(true);
      setFeedback('OUTPUT VERIFIED! printf output matches target execution stream.');
    } else {
      sounds.playBuzzer();
      setErrorShake(true);
      setFeedback(`Execution Mismatch: "${trimmed}" is incorrect. Trace the nested loops carefully.`);
      setTimeout(() => setErrorShake(false), 600);
    }
  };

  const handleConfirmHint = () => {
    setShowHintConfirm(false);
    sounds.playClick();
    onApplyPenalty?.(400, 60, 'Level 5 Trace Helper Guide');
    setHasUnlockedTraceGuide(true);
    setShowTraceTable(true);
    setFeedback('💡 Loop execution guide unlocked (-400 PTS, +60s penalty)!');
  };

  // 1000 base + speed bonus
  const potentialScore = 1000 + Math.max(100, 1000 - secondsElapsed * 15);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Level Header / Briefing */}
      <div className="w-full glass-panel rounded-2xl p-5 mb-5 border border-cyan-500/30 neon-border-cyan flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Mission Level 05 // Final Stage &bull; C Compiler Prediction</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-wide">
            C Language Loop Snippet Predictor
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Analyze the C code loop structure below. Calculate what integer will be printed to stdout by <code className="text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded font-mono font-bold">printf(&quot;%d\n&quot;, total);</code>.
          </p>
        </div>

        {/* Speed & Stats */}
        <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-xl border border-cyan-500/40">
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
            <div className="text-[10px] font-mono text-slate-400">STAGE</div>
            <div className="text-lg font-display font-extrabold text-emerald-400">
              FINAL 5/5
            </div>
          </div>
        </div>
      </div>

      {/* Main C Snippet Editor & Terminal */}
      <div className="w-full rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col">
        {/* Editor Titlebar */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 mr-3">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <Code className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              loop_trace.c &bull; GCC-14 (C17 Standard)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!hasUnlockedTraceGuide) {
                  setShowHintConfirm(true);
                } else {
                  setShowTraceTable(!showTraceTable);
                }
              }}
              className={`text-xs font-mono px-2.5 py-1 rounded border cursor-pointer flex items-center gap-1.5 transition-all ${
                !hasUnlockedTraceGuide
                  ? 'bg-rose-950/70 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                  : 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
              }`}
              title={!hasUnlockedTraceGuide ? 'Unlock Loop Trace Guide (-400 PTS, +60s)' : 'Toggle Loop Trace Guide'}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>
                {!hasUnlockedTraceGuide
                  ? 'Unlock Trace Guide (-400 PTS)'
                  : showTraceTable
                  ? 'Hide Trace Guide'
                  : 'Open Trace Guide'}
              </span>
            </button>
          </div>
        </div>

        {/* Anti-Cheat Protected Code Snippet Display */}
        <div
          onCopy={(e) => {
            e.preventDefault();
            sounds.playBuzzer();
            setFeedback('⚠️ ANTI-CHEAT: Clipboard copying is disabled! Manual tracing required.');
          }}
          onCut={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && ['c', 'C', 'a', 'A', 'u', 'U'].includes(e.key)) {
              e.preventDefault();
              sounds.playBuzzer();
              setFeedback('⚠️ ANTI-CHEAT: Shortcut disabled. Calculate manually!');
            }
          }}
          tabIndex={0}
          className="relative p-5 font-mono text-xs sm:text-sm bg-slate-950 select-none overflow-x-auto leading-relaxed border-b border-slate-800 focus:outline-none"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        >
          {/* Anti-Cheat Watermark Banner */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-[11px] font-mono text-cyan-400/80">
            <span className="flex items-center gap-1.5">
              <span>🔒</span>
              <span className="font-bold tracking-wider uppercase">Anti-Cheat Active // Copy-Paste Disabled</span>
            </span>
            <span className="text-slate-500 text-[10px]">Inspect &amp; Selection Prohibited</span>
          </div>

          <pre
            className="text-slate-300 font-mono select-none pointer-events-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <code className="select-none pointer-events-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
              <span className="text-purple-400">#include</span> <span className="text-emerald-400">&lt;stdio.h&gt;</span>{'\n\n'}
              <span className="text-cyan-400">int</span> <span className="text-amber-300">main</span>() {'{\n'}
              {'    '}<span className="text-cyan-400">int</span> total = <span className="text-rose-400">0</span>;{'\n'}
              {'    '}<span className="text-cyan-400">int</span> i, j;{'\n\n'}
              {'    '}<span className="text-purple-400">for</span> (i = <span className="text-rose-400">1</span>; i &lt;= <span className="text-rose-400">4</span>; i++) {'{\n'}
              {'        '}<span className="text-purple-400">for</span> (j = i; j &lt;= <span className="text-rose-400">4</span>; j++) {'{\n'}
              {'            '}<span className="text-purple-400">if</span> ((i + j) % <span className="text-rose-400">2</span> == <span className="text-rose-400">0</span>) {'{\n'}
              {'                '}total += (i * <span className="text-rose-400">2</span> + j);{'\n'}
              {'            }'} <span className="text-purple-400">else</span> {'{\n'}
              {'                '}total += (j - i);{'\n'}
              {'            }\n'}
              {'        }\n'}
              {'    }\n\n'}
              {'    '}<span className="text-amber-300">printf</span>(<span className="text-emerald-400">&quot;%d\\n&quot;</span>, total);{'\n'}
              {'    '}<span className="text-purple-400">return</span> <span className="text-rose-400">0</span>;{'\n'}
              {'}'}
            </code>
          </pre>
        </div>

        {/* Optional Loop Trace Guide (Formula explanation without giving away the final number) */}
        {showTraceTable && (
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
            <div className="text-[11px] text-cyan-300 font-bold uppercase tracking-wider mb-2">
              Formula Execution Logic:
            </div>
            <div className="space-y-1.5 text-slate-300 leading-relaxed">
              <p>• Outer loop <code className="text-purple-300">i</code> runs from 1 to 4.</p>
              <p>• Inner loop <code className="text-amber-300">j</code> starts at <code className="text-amber-300">i</code> and runs to 4.</p>
              <p>• If <code className="text-cyan-300">(i + j) % 2 == 0</code> (even sum): add <code className="text-emerald-400">(i * 2 + j)</code> to total.</p>
              <p>• Else (odd sum): add <code className="text-rose-400">(j - i)</code> to total.</p>
              <p className="text-slate-400 text-[11px] italic mt-2">
                Tip: For i=1: (j=1 adds 3, j=2 adds 1, j=3 adds 5, j=4 adds 3 &rarr; subtotal 12). Trace through i=2, 3, and 4 to calculate the final total.
              </p>
            </div>
          </div>
        )}

        {/* Output Answer Submission Terminal */}
        <div className="p-5 bg-slate-950 flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              <span>TERMINAL STDOUT OUTPUT: ENTER PRINTED VALUE OF &quot;total&quot;:</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isVictorious}
                placeholder="ENTER CALCULATED VALUE..."
                className={`flex-1 px-4 py-3 rounded-xl bg-slate-900 border-2 font-mono text-lg font-bold text-cyan-200 placeholder:text-slate-600 focus:outline-none transition-all ${
                  errorShake
                    ? 'border-rose-500 bg-rose-950/30'
                    : isVictorious
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                    : 'border-cyan-500/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                }`}
              />

              {!isVictorious ? (
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>EXECUTE &amp; VERIFY</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playGrandVictory();
                    onComplete(secondsElapsed);
                  }}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.9)] transition-all cursor-pointer flex items-center justify-center gap-2 animate-bounce"
                >
                  <Trophy className="w-5 h-5" />
                  <span>CLAIM GRAND VICTORY &rarr;</span>
                </button>
              )}
            </div>

            {feedback && (
              <div
                className={`text-xs font-mono font-bold mt-1 ${
                  isVictorious ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {feedback}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Confirmation Modal for Trace Guide (-400 PTS) */}
      {showHintConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel-purple border-2 border-rose-500/60 shadow-[0_0_35px_rgba(244,63,94,0.4)] flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
                  Unlock Loop Trace Guide?
                </h3>
                <span className="text-xs font-mono text-rose-400 font-bold">
                  Final Level Penalty: -400 Points &amp; +60s Time
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Level 5 is the final sector. Unlocking this step-by-step formula execution guide and iteration subtotal will deduct <span className="text-rose-400 font-bold">400 PTS</span> from your squad score and add <span className="text-rose-400 font-bold">+60 seconds</span> to your penalty time.
            </p>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setShowHintConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer transition-all"
              >
                Cancel (Solve Manually)
              </button>
              <button
                onClick={handleConfirmHint}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-display font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.5)] cursor-pointer transition-all"
              >
                Unlock Guide (-400 PTS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="w-full mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          <span>Final Challenge: Calculate the exact integer printed by the loops. Faster time = more points!</span>
        </div>
      </div>
    </div>
  );
};
