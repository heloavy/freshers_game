import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../services/soundEffects';
import { Terminal, Code, Sparkles, CheckCircle2, RotateCcw, AlertCircle, Play, HelpCircle, Trophy, ArrowRight, Check } from 'lucide-react';
import { CodeSnippetQuestion, getRandomCodeTests } from '../../services/codeSnippetBank';

interface Props {
  onComplete: (levelDurationSec: number) => void;
  onApplyPenalty?: (pointsDeduction: number, penaltySec: number, reason: string) => void;
  onSkipRequest?: () => void;
}

export const Level5LoopSnippetPredictor: React.FC<Props> = ({ onComplete, onApplyPenalty }) => {
  // Generate 3 random beginner-level code tests (mix of C and Python)
  const [questions, setQuestions] = useState<CodeSnippetQuestion[]>(() => getRandomCodeTests(3));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [testStatuses, setTestStatuses] = useState<('pending' | 'correct')[]>(['pending', 'pending', 'pending']);
  const [isVictorious, setIsVictorious] = useState<boolean>(false);
  const [errorShake, setErrorShake] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [showHintExplanation, setShowHintExplanation] = useState<boolean>(false);
  const [showHintConfirm, setShowHintConfirm] = useState<boolean>(false);

  // Speed scoring timer
  const startTimeRef = useRef<number>(Date.now());
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setSecondsElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentQ = questions[currentIndex];
  const passedCount = testStatuses.filter((s) => s === 'correct').length;

  // Evaluate candidate answer (either clicked from options or typed)
  const handleCheckAnswer = (answerCandidate: string) => {
    if (isVictorious) return;
    const clean = answerCandidate.trim();

    if (clean.toLowerCase() === currentQ.correctAnswer.trim().toLowerCase()) {
      sounds.playCapture();
      const nextStatuses = [...testStatuses];
      nextStatuses[currentIndex] = 'correct';
      setTestStatuses(nextStatuses);

      const nextPassed = nextStatuses.filter((s) => s === 'correct').length;
      setUserInput('');
      setShowHintExplanation(false);

      if (nextPassed >= questions.length) {
        setIsVictorious(true);
        sounds.playGrandVictory();
        setFeedback(`🎉 EXCELLENT! ALL ${questions.length} CODE TESTS VERIFIED! Master Vault ready.`);
      } else {
        setFeedback(`✓ TEST 0${currentIndex + 1} CORRECT: "${clean}" is verified! Moving to Test 0${currentIndex + 2}...`);
        setTimeout(() => {
          setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
          setFeedback('');
        }, 800);
      }
    } else {
      sounds.playBuzzer();
      setErrorShake(true);
      setFeedback(`Output Mismatch: "${clean}" is incorrect for ${currentQ.language}. Review the code logic and try again.`);
      setTimeout(() => setErrorShake(false), 600);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    handleCheckAnswer(userInput);
  };

  const handleConfirmHint = () => {
    setShowHintConfirm(false);
    sounds.playClick();
    onApplyPenalty?.(50, 10, 'Level 5 Logic Hint');
    setShowHintExplanation(true);
    setFeedback(`💡 HINT (-50 PTS): ${currentQ.explanation}`);
  };

  // 1000 base + speed bonus
  const potentialScore = 1000 + Math.max(100, 1000 - secondsElapsed * 10);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center select-none">
      {/* Level Header / Briefing */}
      <div className="w-full glass-panel rounded-2xl p-5 mb-5 border border-cyan-500/40 neon-border-cyan flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Mission Level 05 // Final Round &bull; Multi-Stage Code Tests</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-wide">
            C &amp; Python Code Prediction Challenge
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Pass <span className="text-cyan-400 font-bold">all 3 beginner code tests</span> in C &amp; Python to unlock the final Omega Key and decode the Master Treasure Passcode!
          </p>
        </div>

        {/* Speed & Stats */}
        <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-xl border border-cyan-500/40">
          <div>
            <div className="text-[10px] font-mono text-slate-400">TESTS CLEARED</div>
            <div className="text-lg font-display font-extrabold text-white">
              <span className={passedCount === questions.length ? 'text-emerald-400' : 'text-cyan-300'}>
                {passedCount}
              </span>
              <span className="text-slate-500 text-sm"> / {questions.length}</span>
            </div>
          </div>

          <div className="w-px h-7 bg-slate-800" />

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

          <button
            onClick={() => setShowHintConfirm(true)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            title="Get a hint for this code snippet (-50 PTS, +10s)"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Hint (-50 PTS)</span>
          </button>
        </div>
      </div>

      {/* Multi-Test Sequence Progress Tabs */}
      <div className="w-full flex items-center gap-2 mb-4">
        {questions.map((q, idx) => {
          const isPassed = testStatuses[idx] === 'correct';
          const isActive = currentIndex === idx;

          return (
            <button
              key={q.id}
              onClick={() => {
                sounds.playClick();
                setCurrentIndex(idx);
                setUserInput('');
                setShowHintExplanation(false);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                isPassed
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : isActive
                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">{isPassed ? '✓' : idx + 1}</span>
                <span>TEST 0{idx + 1}: {q.language}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800">
                {isPassed ? 'CLEARED' : isActive ? 'ACTIVE' : 'PENDING'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Snippet Editor & Execution Panel */}
      <div className="w-full rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col mb-4">
        {/* Editor Titlebar */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <Code className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-white">
              {currentQ.language === 'C' ? 'program.c (GCC C17)' : 'script.py (Python 3.12)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {currentQ.language} Language
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
              {currentQ.topic}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              Beginner Level
            </span>
          </div>
        </div>

        {/* Code Snippet Box with Anti-Cheat */}
        <div
          onCopy={(e) => {
            e.preventDefault();
            sounds.playBuzzer();
            setFeedback('⚠️ ANTI-CHEAT: Clipboard copying is disabled! Manual tracing required.');
          }}
          className="relative p-5 font-mono text-xs sm:text-sm bg-slate-950 select-none overflow-x-auto leading-relaxed border-b border-slate-800"
        >
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80 text-[11px] font-mono text-cyan-400/80">
            <span className="flex items-center gap-1.5">
              <span>🔒</span>
              <span className="font-bold tracking-wider uppercase">Anti-Cheat Active &bull; Test {currentIndex + 1} of {questions.length}</span>
            </span>
            <span className="text-amber-400 font-bold">{currentQ.title}</span>
          </div>

          <pre className="text-slate-200 font-mono select-none">
            <code>{currentQ.code}</code>
          </pre>
        </div>

        {/* Question Prompt & Multiple Choice Options */}
        <div className="p-5 bg-slate-900/90 border-b border-slate-800 flex flex-col gap-3">
          <div className="text-xs sm:text-sm font-mono text-cyan-300 font-bold flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            <span>{currentQ.questionPrompt}</span>
          </div>

          {/* 4 Interactive Option Buttons (Quick Tap) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {currentQ.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleCheckAnswer(opt)}
                disabled={testStatuses[currentIndex] === 'correct' || isVictorious}
                className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-cyan-950/70 border-2 border-slate-800 hover:border-cyan-400 font-mono text-sm sm:text-base font-bold text-white transition-all cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <span>{opt}</span>
              </button>
            ))}
          </div>

          {/* Optional Manual Text Submission */}
          <form onSubmit={handleSubmitForm} className="flex gap-2 pt-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={testStatuses[currentIndex] === 'correct' || isVictorious}
              placeholder="Or type output here..."
              className={`flex-1 px-3 py-2 rounded-xl bg-slate-950 border font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                errorShake ? 'border-rose-500 bg-rose-950/30' : 'border-slate-800 focus:border-cyan-400'
              }`}
            />
            <button
              type="submit"
              disabled={testStatuses[currentIndex] === 'correct' || isVictorious}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs uppercase transition-all cursor-pointer disabled:opacity-50"
            >
              Submit
            </button>
          </form>

          {/* Feedback & Hint Message */}
          {feedback && (
            <div
              className={`text-xs font-mono font-bold mt-1 ${
                feedback.includes('CORRECT') || feedback.includes('VERIFIED')
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {feedback}
            </div>
          )}

          {showHintExplanation && (
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono text-cyan-200 mt-1">
              <strong>Logic Breakdown:</strong> {currentQ.explanation}
            </div>
          )}
        </div>

        {/* Grand Final Victory Action Banner */}
        {isVictorious && (
          <div className="p-6 bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-slate-900 border-t-2 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)] flex flex-col items-center text-center gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-display font-black text-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>FINAL SECTOR 05 CLEARED! ALL 3 CODE TESTS SOLVED!</span>
            </div>
            <p className="text-xs sm:text-sm font-mono text-slate-200 max-w-lg">
              You have secured the 5th and final Omega Master Key! Proceed to activate the Cryptographic Master Decoder to reveal the secret treasure answer!
            </p>
            <button
              onClick={() => {
                sounds.playGrandVictory();
                onComplete(secondsElapsed);
              }}
              className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 hover:from-emerald-300 hover:to-amber-300 text-slate-950 font-display font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.9)] transition-all cursor-pointer flex items-center justify-center gap-2 animate-bounce"
            >
              <Trophy className="w-5 h-5" />
              <span>PROCEED TO DECODE MASTER TREASURE KEY (+{potentialScore} PTS) &rarr;</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Hint (-50 PTS) */}
      {showHintConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel-purple border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.4)] flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
                  Request Code Logic Hint?
                </h3>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  Penalty: -50 Points &amp; +10s Time
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Revealing the step-by-step logic breakdown for this {currentQ.language} snippet will deduct <span className="text-amber-300 font-bold">50 PTS</span> from your score and add <span className="text-rose-400 font-bold">+10 seconds</span> to your penalty time.
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
                Confirm Hint (-50 PTS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="w-full mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          <span>Final Challenge: Solve 3 beginner C &amp; Python tests. Tap any answer choice or enter stdout output.</span>
        </div>
      </div>
    </div>
  );
};
