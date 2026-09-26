import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../services/soundEffects';
import { TechQuizQuestion, generateRandomizedQuiz } from '../../services/techQuizBank';
import {
  Shield,
  Zap,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Clock,
  Sparkles,
  Terminal,
  Cpu,
  Lock,
  Unlock,
  RotateCcw,
} from 'lucide-react';

interface Props {
  onComplete: (levelDurationSec: number) => void;
  onApplyPenalty?: (penaltyPts: number, penaltySec: number, hintLabel: string) => void;
  teamId?: string;
  teamName?: string;
}

export const Level1CyberQuiz: React.FC<Props> = ({
  onComplete,
  onApplyPenalty,
  teamId = 'TEAM_01',
  teamName = 'Squad',
}) => {
  // Generate randomized anti-copy question set of 5 questions
  const [questions, setQuestions] = useState<TechQuizQuestion[]>(() => generateRandomizedQuiz(5));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [solvedNodes, setSolvedNodes] = useState<number[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Points and streak system
  const [sessionPoints, setSessionPoints] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [streakMultiplier, setStreakMultiplier] = useState<number>(1.0);
  const [lastBonusPoints, setLastBonusPoints] = useState<number | null>(null);

  // Per-question timer & overall timer
  const [questionTimer, setQuestionTimer] = useState<number>(20);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isVictorious, setIsVictorious] = useState<boolean>(false);

  // Hint penalty state
  const [isHintRevealed, setIsHintRevealed] = useState<boolean>(false);
  const [showHintConfirm, setShowHintConfirm] = useState<boolean>(false);

  const levelStartTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());

  const currentQ = questions[currentIndex] || questions[0];

  // Overall timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Per-question speed bonus timer countdown
  useEffect(() => {
    setQuestionTimer(20);
    questionStartTimeRef.current = Date.now();
    setIsHintRevealed(false);
    setShowHintConfirm(false);
    setSelectedOptionId(null);
    setFeedbackStatus('idle');
    setFeedbackMsg('');

    const qInterval = setInterval(() => {
      setQuestionTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(qInterval);
  }, [currentIndex]);

  // Anti-Cheat: Block copy/cut/contextmenu events
  const handlePreventCopy = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };

  // Keyboard navigation: 1, 2, 3, 4 or A, B, C, D
  useEffect(() => {
    if (isVictorious || feedbackStatus === 'correct') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', 'a', 'A'].includes(e.key) && currentQ.options[0]) {
        handleOptionSelect(currentQ.options[0].id);
      } else if (['2', 'b', 'B'].includes(e.key) && currentQ.options[1]) {
        handleOptionSelect(currentQ.options[1].id);
      } else if (['3', 'c', 'C'].includes(e.key) && currentQ.options[2]) {
        handleOptionSelect(currentQ.options[2].id);
      } else if (['4', 'd', 'D'].includes(e.key) && currentQ.options[3]) {
        handleOptionSelect(currentQ.options[3].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, feedbackStatus, isVictorious, currentQ]);

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (feedbackStatus === 'correct' || isVictorious) return;

    setSelectedOptionId(optionId);
    const chosen = currentQ.options.find((o) => o.id === optionId);

    if (chosen?.isCorrect) {
      // Correct!
      sounds.playCapture();
      setFeedbackStatus('correct');

      // Calculate speed bonus
      const speedBonus = questionTimer > 10 ? Math.floor(questionTimer * 10) : 50;
      const basePoints = 300;
      const nextStreak = streakCount + 1;
      const multiplier = nextStreak >= 3 ? 1.5 : nextStreak >= 2 ? 1.25 : 1.0;
      const pointsEarned = Math.floor((basePoints + speedBonus) * multiplier);

      setStreakCount(nextStreak);
      setStreakMultiplier(multiplier);
      setSessionPoints((prev) => prev + pointsEarned);
      setLastBonusPoints(pointsEarned);

      setFeedbackMsg(`✓ CORRECT ACCESS KEY GRANTED! (+${pointsEarned} PTS)`);

      const nextSolved = [...solvedNodes, currentIndex];
      setSolvedNodes(nextSolved);

      // Check if all 5 nodes cleared
      if (nextSolved.length >= questions.length) {
        setTimeout(() => {
          sounds.playLevelWin();
          setIsVictorious(true);
        }, 800);
      } else {
        // Advance to next node
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 900);
      }
    } else {
      // Wrong answer!
      sounds.playBuzzer();
      setFeedbackStatus('wrong');
      setStreakCount(0);
      setStreakMultiplier(1.0);
      setFeedbackMsg('⚠️ ACCESS DENIED: Incorrect frequency code. -50 PTS penalty applied.');

      // Penalty application
      if (onApplyPenalty) {
        onApplyPenalty(50, 5, 'QUIZ_WRONG_ANSWER');
      }

      setSessionPoints((prev) => Math.max(0, prev - 50));

      // Reset wrong state after 1.4s so player can try again
      setTimeout(() => {
        setFeedbackStatus('idle');
        setSelectedOptionId(null);
      }, 1400);
    }
  };

  // Handle hint penalty confirmation
  const handleConfirmHint = () => {
    sounds.playBuzzer();
    setIsHintRevealed(true);
    setShowHintConfirm(false);
    if (onApplyPenalty) {
      onApplyPenalty(50, 10, 'SECTOR_01_HINT_PENALTY');
    }
    setSessionPoints((prev) => Math.max(0, prev - 50));
  };

  const handleFinishVictory = () => {
    sounds.playLevelWin();
    const duration = Math.max(5, Math.floor((Date.now() - levelStartTimeRef.current) / 1000));
    onComplete(duration);
  };

  return (
    <div
      onCopy={handlePreventCopy}
      onCut={handlePreventCopy}
      onContextMenu={handlePreventCopy}
      className="relative w-full max-w-4xl mx-auto flex flex-col items-center select-none animate-fade-in p-2 sm:p-4 z-10"
    >
      {/* Background Security Watermark to Prevent Photo/Screenshot Leaks */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex flex-col justify-around items-center overflow-hidden font-mono text-3xl font-black text-cyan-400 rotate-[-15deg] z-0">
        <div>{teamId} // {teamName} // CONFIDENTIAL CONTEST</div>
        <div>ANTI-CHEAT ACTIVE // 2026 CYBERNETIC TRIAL</div>
        <div>{teamId} // {teamName} // CONFIDENTIAL CONTEST</div>
      </div>

      {/* Top Banner Navigation & Diagnostic Progress */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            <Cpu className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm sm:text-base text-white tracking-wider">
                SECTOR 01: TECH LOGIC MATRIX
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-[10px] font-mono font-bold text-cyan-300">
                LEVEL 1
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Clear 5 Diagnostic Nodes &bull; Random Questions &bull; Anti-Copy Encrypted
            </div>
          </div>
        </div>

        {/* Live Metrics: Points, Timer, Streak */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Streak Indicator */}
          {streakCount >= 2 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{streakCount}X STREAK ({streakMultiplier}x)</span>
            </div>
          )}

          {/* Session Points */}
          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>+{sessionPoints} PTS</span>
          </div>

          {/* Total Elapsed Time */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* 5-Node Progress Tracker */}
      <div className="w-full grid grid-cols-5 gap-2 mb-4">
        {questions.map((q, idx) => {
          const isDone = solvedNodes.includes(idx);
          const isCurrent = currentIndex === idx && !isDone;
          return (
            <div
              key={q.id}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isDone
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : isCurrent
                  ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-[1.02]'
                  : 'bg-slate-950/80 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[11px] font-mono font-bold">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isCurrent ? (
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span>NODE 0{idx + 1}</span>
              </div>
              <div className="text-[9px] font-mono truncate mt-0.5 opacity-80">
                {isDone ? 'CLEARED' : isCurrent ? 'ACTIVE' : 'LOCKED'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Victory Celebration Modal */}
      {isVictorious ? (
        <div className="w-full p-8 md:p-12 rounded-3xl glass-panel-purple border-2 border-emerald-500/80 text-center shadow-[0_0_50px_rgba(16,185,129,0.5)] animate-fade-in relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.8)] mb-6 animate-bounce">
            <Unlock className="w-10 h-10 text-emerald-300" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 font-mono text-xs uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SECTOR 01 FIREWALL DECRYPTED</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-wide uppercase mb-3">
            LOGIC MATRIX CLEARED!
          </h2>

          <p className="text-slate-300 text-sm md:text-base font-mono max-w-xl mx-auto mb-6 leading-relaxed">
            All 5 diagnostic nodes have been successfully solved! Cipher Key Alpha has been unlocked and added to your telemetry ledger.
          </p>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-xl mb-8 flex items-center justify-around font-mono">
            <div className="text-center">
              <div className="text-[10px] text-slate-400">NODES CLEARED</div>
              <div className="text-xl font-extrabold text-emerald-400">5 / 5</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-[10px] text-slate-400">TIME TAKEN</div>
              <div className="text-xl font-extrabold text-cyan-300">
                {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-[10px] text-slate-400">TOTAL BONUS</div>
              <div className="text-xl font-extrabold text-amber-400">+{sessionPoints} PTS</div>
            </div>
          </div>

          <button
            onClick={handleFinishVictory}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-display font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.8)] cursor-pointer transition-all transform hover:scale-105"
          >
            CLAIM CIPHER KEY ALPHA &amp; ADVANCE TO SECTOR 02 →
          </button>
        </div>
      ) : (
        /* Active Question Terminal Card */
        <div className="w-full p-6 md:p-8 rounded-3xl glass-panel-purple border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.25)] relative overflow-hidden">
          {/* Header of Question Card */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-6">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${currentQ.categoryColor}`}>
                {currentQ.categoryLabel}
              </span>
              <span className="text-slate-400 font-mono text-xs">
                Node {currentIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Speed Bonus Gauge */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Speed Bonus: {questionTimer > 10 ? `+${questionTimer * 10} PTS` : '+50 PTS'}</span>
              </div>
              <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${(questionTimer / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Scenario & Title */}
          <div className="space-y-3 mb-6">
            <h3 className="text-lg md:text-xl font-display font-extrabold text-white tracking-wide">
              {currentQ.title}
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed shadow-inner">
              {currentQ.scenario}
            </div>

            {currentQ.codeSnippet && (
              <pre className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-300 font-mono text-xs overflow-x-auto">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}
          </div>

          {/* 4 Shuffled Interactive Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedOptionId === opt.id;
              const isCorrectState = feedbackStatus === 'correct' && isSelected;
              const isWrongState = feedbackStatus === 'wrong' && isSelected;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionSelect(opt.id)}
                  disabled={feedbackStatus === 'correct'}
                  className={`p-4 rounded-2xl border text-left font-mono text-xs sm:text-sm font-semibold transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-3 ${
                    isCorrectState
                      ? 'bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.7)] scale-[1.02]'
                      : isWrongState
                      ? 'bg-rose-950/90 border-2 border-rose-500 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.7)]'
                      : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700 hover:border-cyan-400/80 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isCorrectState
                          ? 'bg-emerald-500 text-slate-950'
                          : isWrongState
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-cyan-300 border border-slate-700'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt.label}</span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                    [{optIdx + 1}]
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Penalty Banner */}
          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl mb-4 font-mono text-xs font-bold flex items-center justify-center gap-2 animate-fade-in ${
                feedbackStatus === 'correct'
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
              }`}
            >
              {feedbackStatus === 'correct' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              )}
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Hint Area with Penalty Notice */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            {!isHintRevealed ? (
              !showHintConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowHintConfirm(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Request Cipher Hint (-50 PTS Penalty)</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-amber-950/60 p-2 rounded-xl border border-amber-500/60 text-amber-200">
                  <span className="text-[11px]">Confirm 50 PTS / 10s deduction for hint?</span>
                  <button
                    onClick={handleConfirmHint}
                    className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowHintConfirm(false)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )
            ) : (
              <div className="w-full p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[10px] uppercase text-amber-400">Cipher Hint Decrypted:</div>
                  <div className="text-xs mt-0.5">{currentQ.hint}</div>
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-500">
              💡 Keyboard keys <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">1-4</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">A-D</kbd> supported
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
