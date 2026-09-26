/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ZeroGravityCanvas } from './components/ZeroGravityCanvas';
import { TeamAuthScreen } from './components/TeamAuthScreen';
import { Level1CyberQuiz } from './components/games/Level1CyberQuiz';
import { Level2NQueens } from './components/games/Level2NQueens';
import { Level3CodeWordle } from './components/games/Level3CodeWordle';
import { Level4BugSmasherArcade } from './components/games/Level4BugSmasherArcade';
import { Level5LoopSnippetPredictor } from './components/games/Level5LoopSnippetPredictor';
import { VictoryScreen } from './components/VictoryScreen';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PenaltySkipModal } from './components/PenaltySkipModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { AdminControlModal } from './components/AdminControlModal';
import { ShareAccessModal } from './components/ShareAccessModal';
import { TreasureKeyModal } from './components/TreasureKeyModal';
import { KeyUnlockedCelebrationModal } from './components/KeyUnlockedCelebrationModal';
import { TreasureDecoderModal } from './components/TreasureDecoderModal';
import { getKeyByLevel, TreasureKey } from './services/treasureKeys';
import { GameState, GameLevelId, TeamLeaderboardEntry, AdminMember } from './types';

import { supabaseService, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from './services/supabaseService';
import { sounds } from './services/soundEffects';
import { Trophy, Clock, ShieldAlert, Sparkles, Volume2, VolumeX, Database, Orbit, ShieldCheck, QrCode, AlertTriangle, Key } from 'lucide-react';

// ============================================================================
// SUPABASE CREDENTIALS CONFIGURATION:
// (You can replace SUPABASE_URL and SUPABASE_ANON_KEY here or via the Settings UI)
// ============================================================================
export const SUPABASE_URL = DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = DEFAULT_SUPABASE_ANON_KEY;

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      // 1. If terminal already completed official test, restore locked victory screen
      const completed = localStorage.getItem('dtth_completed_state');
      if (completed) {
        const parsed = JSON.parse(completed);
        if (parsed && parsed.isCompleted) {
          return parsed;
        }
      }

      // 2. Check if active game is in progress
      const saved = localStorage.getItem('dtth_active_game');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isStarted) {
          return parsed;
        }
      }
    } catch {}
    return {
      teamId: 'TEAM_01',
      teamName: '',
      avatar: '🚀',
      isStarted: false,
      isCompleted: false,
      currentLevel: 1,
      elapsedTime: 0,
      penalties: 0,
      score: 0,
      levelStartTime: Date.now(),
      unlockedKeys: [],
      isKeyDecoded: false,
    };
  });

  const [leaderboard, setLeaderboard] = useState<TeamLeaderboardEntry[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminMember | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [isDecoderModalOpen, setIsDecoderModalOpen] = useState<boolean>(false);
  const [newlyUnlockedKey, setNewlyUnlockedKey] = useState<TreasureKey | null>(null);
  const [skipModalOpen, setSkipModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.isMuted());
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(supabaseService.isConnected());
  const [scoreToast, setScoreToast] = useState<{ title: string; points: number } | null>(null);

  // Game timer tick interval reference
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-save game state to localStorage & permanently lock terminal upon test completion
  useEffect(() => {
    try {
      if (gameState.isStarted && !gameState.isCompleted) {
        localStorage.setItem('dtth_active_game', JSON.stringify(gameState));
      } else if (gameState.isCompleted) {
        localStorage.removeItem('dtth_active_game');
        localStorage.setItem('dtth_completed_state', JSON.stringify(gameState));
        localStorage.setItem('dtth_terminal_locked', 'true');
        if (gameState.teamName) {
          localStorage.setItem('dtth_completed_team', gameState.teamName);
        }
      }
    } catch {}
  }, [gameState]);

  // Global Anti-Cheat: Block right click inspect, DevTools shortcuts, and allow secret organizer hotkey (Ctrl+Shift+A)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Disable right-click inspect element across competition
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret Admin Hotkey for Organizers: Ctrl + Alt + M (prevents browser tab search collision)
      if (e.ctrlKey && e.altKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        setIsAdminModalOpen((prev) => !prev);
        return;
      }

      // Anti-Cheat: Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && ['U', 'u'].includes(e.key))
      ) {
        e.preventDefault();
        sounds.playBuzzer();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Tab-Switch & Blur Anti-Cheat Enforcement (penalizes switching tabs or leaving the test window)
  useEffect(() => {
    if (!gameState.isStarted || gameState.isCompleted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sounds.playBuzzer();
        setGameState((prev) => {
          const newPenalties = prev.penalties + 15;
          setScoreToast({
            title: '⚠️ CHEATING DETECTED: TAB SWITCH (+15s PENALTY)',
            points: 0,
          });
          setTimeout(() => setScoreToast(null), 4000);

          supabaseService.upsertLeaderboard({
            team_id: prev.teamId,
            team_name: prev.teamName,
            avatar: prev.avatar,
            current_level: prev.currentLevel,
            score: prev.score,
            elapsed_time: prev.elapsedTime,
            penalties: newPenalties,
          });

          return {
            ...prev,
            penalties: newPenalties,
          };
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameState.isStarted, gameState.isCompleted]);

  // Auto-check URL query parameters for direct display modes or secret organizer admin bypass
  // CRITICAL: Immediately cleanses 'admin' parameter from URL to prevent spontaneous modal popups on refresh/navigation!
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        let scrubUrl = false;

        if (params.get('view') === 'leaderboard' || params.get('mode') === 'leaderboard') {
          setIsLeaderboardOpen(true);
        } else if (params.get('view') === 'share') {
          setIsShareModalOpen(true);
        }

        // Secret Admin Bypass: only triggers on explicit secret passkey and is IMMEDIATELY cleaned
        if (params.has('admin')) {
          const adminKey = params.get('admin');
          if (adminKey === 'dtth2026_council' || adminKey === 'dtth2026') {
            setIsAdminModalOpen(true);
          }
          params.delete('admin');
          scrubUrl = true;
        }

        if (scrubUrl) {
          const newQuery = params.toString();
          const cleanUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '') + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } catch {}
    }
  }, []);

  // Synchronize incoming leaderboard data from Supabase across all active client views
  const handleLeaderboardSync = (data: TeamLeaderboardEntry[]) => {
    setLeaderboard(data);

    // 1. If this device has an active or completed game session:
    setGameState((prev) => {
      if (prev.isStarted) {
        // If the game has been running for at least 4 seconds or is completed,
        // and its team record no longer exists in the database snapshot:
        const teamStillInDb = data.some((t) => t.team_id.toUpperCase() === prev.teamId.toUpperCase());
        if ((prev.elapsedTime > 3 || prev.isCompleted) && !teamStillInDb) {
          // Team was deleted in Supabase! Immediately purge local locks & state
          try {
            localStorage.removeItem('dtth_active_game');
            localStorage.removeItem('dtth_completed_state');
            localStorage.removeItem('dtth_terminal_locked');
            localStorage.removeItem('dtth_completed_team');
          } catch {}

          setScoreToast({
            title: '⚠️ ENTRY REMOVED FROM DATABASE (RESET)',
            points: 0,
          });
          setTimeout(() => setScoreToast(null), 4500);

          return {
            teamId: 'TEAM_01',
            teamName: '',
            avatar: '🚀',
            isStarted: false,
            isCompleted: false,
            currentLevel: 1,
            elapsedTime: 0,
            penalties: 0,
            score: 0,
            levelStartTime: Date.now(),
            unlockedKeys: [],
            isKeyDecoded: false,
          };
        }
      }
      return prev;
    });

    // 2. If the terminal was locked from a completed run, check if that team was purged from DB
    try {
      const completedTeam = localStorage.getItem('dtth_completed_team');
      if (completedTeam) {
        const stillExists = data.some(
          (t) => t.team_name && t.team_name.trim().toLowerCase() === completedTeam.trim().toLowerCase()
        );
        if (!stillExists) {
          localStorage.removeItem('dtth_terminal_locked');
          localStorage.removeItem('dtth_completed_team');
          localStorage.removeItem('dtth_completed_state');
          localStorage.removeItem('dtth_active_game');
        }
      }
    } catch {}
  };

  // Subscribe to real-time leaderboard changes & fallback polling every 3.5 seconds
  // This guarantees ANY deletion directly in the Supabase Table Editor or SQL reflects instantly on the frontend!
  useEffect(() => {
    const unsubscribe = supabaseService.subscribeToLeaderboard((data) => {
      handleLeaderboardSync(data);
    });

    supabaseService.fetchLeaderboard().then((data) => {
      handleLeaderboardSync(data);
    });

    // Rapid 3.5s background poll across the entire app (home screen, playing screen, admin modal)
    const pollInterval = setInterval(() => {
      supabaseService.fetchLeaderboard().then((data) => {
        handleLeaderboardSync(data);
      });
    }, 3500);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  // Main game elapsed timer
  useEffect(() => {
    if (gameState.isStarted && !gameState.isCompleted) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => {
          const nextTime = prev.elapsedTime + 1;

          // Sync to Supabase periodically (every 15 seconds to prevent rate-limiting 50 concurrent teams)
          if (nextTime % 15 === 0) {
            // Anti-Zombie Protection: Verify team has not been deleted before upserting
            const snapshot = supabaseService.getLeaderboardSnapshot();
            const isStillActive = snapshot.some((t) => t.team_id.toUpperCase() === prev.teamId.toUpperCase());
            if (isStillActive || nextTime <= 15) {
              supabaseService.upsertLeaderboard({
                team_id: prev.teamId,
                team_name: prev.teamName,
                avatar: prev.avatar,
                current_level: prev.currentLevel,
                score: prev.score,
                elapsed_time: nextTime,
                penalties: prev.penalties,
              });
            }
          }

          return {
            ...prev,
            elapsedTime: nextTime,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.isStarted, gameState.isCompleted]);

  // Handle Launch Hunt from Auth Screen (supports custom team ID, name, and chosen avatar)
  const handleStartGame = (teamId: string, teamName: string, avatar: string) => {
    const chosenAvatar = avatar || '🚀';
    const initialState: GameState = {
      teamId,
      teamName,
      avatar: chosenAvatar,
      isStarted: true,
      isCompleted: false,
      currentLevel: 1,
      elapsedTime: 0,
      penalties: 0,
      score: 0,
      levelStartTime: Date.now(),
      unlockedKeys: [],
      isKeyDecoded: false,
    };

    setGameState(initialState);

    // Initial upsert into Supabase leaderboard
    supabaseService.upsertLeaderboard({
      team_id: teamId,
      team_name: teamName,
      avatar: chosenAvatar,
      current_level: 1,
      score: 0,
      elapsed_time: 0,
      penalties: 0,
    });
  };

  // Advance to next level or victory with transparent speed bonus scoring:
  // 1,000 base points for clearing sector + up to 1,000 time bonus points
  const handleLevelComplete = (levelDurationSec?: number) => {
    setGameState((prev) => {
      const duration = levelDurationSec ?? Math.max(1, Math.floor((Date.now() - prev.levelStartTime) / 1000));
      const pointsEarned = 1000 + Math.max(100, 1000 - duration * 15);
      const nextScore = prev.score + pointsEarned;
      const clearedLevel = prev.currentLevel;
      const nextLevelNum = prev.currentLevel + 1;
      const isFinished = nextLevelNum > 5;
      const nextKeys = Array.from(new Set([...(prev.unlockedKeys || []), clearedLevel]));

      // Award Treasure Key for clearing sector
      const earnedKey = getKeyByLevel(clearedLevel);
      if (earnedKey) {
        setNewlyUnlockedKey(earnedKey);
      }

      // If all 5 games are finished, launch master decoder terminal!
      if (isFinished) {
        setIsDecoderModalOpen(true);
      }

      // Trigger visual celebratory score toast
      setScoreToast({
        title: `SECTOR 0${clearedLevel} CLEARED!`,
        points: pointsEarned,
      });
      setTimeout(() => setScoreToast(null), 3500);

      const updated: GameState = {
        ...prev,
        score: nextScore,
        currentLevel: (isFinished ? 5 : nextLevelNum) as GameLevelId,
        isCompleted: isFinished,
        levelStartTime: Date.now(),
        unlockedKeys: nextKeys,
      };

      // Push real-time record to Supabase (current_level: 6 represents completed all 5 levels)
      supabaseService.upsertLeaderboard({
        team_id: prev.teamId,
        team_name: prev.teamName,
        avatar: prev.avatar,
        current_level: isFinished ? 6 : nextLevelNum,
        score: nextScore,
        elapsed_time: prev.elapsedTime,
        penalties: prev.penalties,
      });

      return updated;
    });
  };

  // Penalty Skip (+90s) confirmation
  const handleConfirmSkip = () => {
    setSkipModalOpen(false);

    setGameState((prev) => {
      const nextPenalties = prev.penalties + 90;
      const nextScore = prev.score; // 0 points for skip
      const skippedLevel = prev.currentLevel;
      const nextLevelNum = prev.currentLevel + 1;
      const isFinished = nextLevelNum > 5;
      const nextKeys = Array.from(new Set([...(prev.unlockedKeys || []), skippedLevel]));

      // Award Emergency Bypass Key so team can still decode
      const earnedKey = getKeyByLevel(skippedLevel);
      if (earnedKey) {
        setNewlyUnlockedKey(earnedKey);
      }

      if (isFinished) {
        setIsDecoderModalOpen(true);
      }

      setScoreToast({
        title: `SECTOR 0${skippedLevel} SKIPPED (+90s PENALTY)`,
        points: 0,
      });
      setTimeout(() => setScoreToast(null), 3000);

      const updated: GameState = {
        ...prev,
        penalties: nextPenalties,
        score: nextScore,
        currentLevel: (isFinished ? 5 : nextLevelNum) as GameLevelId,
        isCompleted: isFinished,
        levelStartTime: Date.now(),
        unlockedKeys: nextKeys,
      };

      // Push to Supabase with penalty updated (current_level: 6 if finished)
      supabaseService.upsertLeaderboard({
        team_id: prev.teamId,
        team_name: prev.teamName,
        avatar: prev.avatar,
        current_level: isFinished ? 6 : nextLevelNum,
        score: nextScore,
        elapsed_time: prev.elapsedTime,
        penalties: nextPenalties,
      });

      return updated;
    });
  };

  const handleRestart = () => {
    setGameState((prev) => ({
      ...prev,
      isStarted: false,
      isCompleted: false,
      currentLevel: 1,
      elapsedTime: 0,
      penalties: 0,
      score: 0,
      levelStartTime: Date.now(),
    }));
  };

  // Progressive hint penalty system across all levels:
  // Points deduction from squad score + penalty time added to clock, synced real-time to Supabase
  const handleApplyHintPenalty = (pointsDeduction: number, penaltySec: number, hintLabel: string) => {
    sounds.playBuzzer();
    setGameState((prev) => {
      const nextScore = Math.max(0, prev.score - pointsDeduction);
      const nextPenalties = prev.penalties + penaltySec;

      setScoreToast({
        title: `⚠️ ${hintLabel.toUpperCase()}`,
        points: -pointsDeduction,
      });
      setTimeout(() => setScoreToast(null), 4000);

      // Immediately sync penalty to Supabase
      supabaseService.upsertLeaderboard({
        team_id: prev.teamId,
        team_name: prev.teamName,
        avatar: prev.avatar,
        current_level: prev.currentLevel,
        score: nextScore,
        elapsed_time: prev.elapsedTime,
        penalties: nextPenalties,
      });

      return {
        ...prev,
        score: nextScore,
        penalties: nextPenalties,
      };
    });
  };

  // Discreet 5-click counter on sector emblem for organizers
  const adminClickCounter = useRef<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 });
  const handleSecretAdminTrigger = () => {
    const now = Date.now();
    if (now - adminClickCounter.current.lastTime > 2000) {
      adminClickCounter.current.count = 1;
    } else {
      adminClickCounter.current.count += 1;
    }
    adminClickCounter.current.lastTime = now;

    if (adminClickCounter.current.count >= 5) {
      adminClickCounter.current.count = 0;
      setIsAdminModalOpen(true);
    }
  };

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Calculate user's current ranking among all participating teams
  const currentTeamRank = Math.max(
    1,
    leaderboard.findIndex((t) => t.team_id === gameState.teamId) + 1
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* Interactive Anti-Gravity Canvas Background */}
      <ZeroGravityCanvas />

      {/* Persistent Navigation Header (when hunt is active) */}
      {gameState.isStarted && !gameState.isCompleted && (
        <header className="relative z-20 w-full px-4 py-3 glass-panel border-b border-cyan-500/30 sticky top-0 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          {/* Left: Mission Sector & Level Progress with Team Avatar */}
          <div className="flex items-center gap-3">
            <div
              onClick={handleSecretAdminTrigger}
              className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.6)] cursor-pointer select-none"
              title="Mission Squad Unit"
            >
              {gameState.avatar || '🚀'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-sm text-white tracking-wider">
                  SECTOR 0{gameState.currentLevel}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                  LEVEL {gameState.currentLevel} / 5
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="text-cyan-400 font-bold">{gameState.teamId}</span>
                <span>&bull;</span>
                <span className="text-white truncate max-w-[120px] sm:max-w-none">{gameState.teamName}</span>
              </div>
            </div>
          </div>

          {/* Center: Live Timer, Penalties, and Score */}
          <div className="flex items-center gap-4 bg-slate-900/90 px-4 py-1.5 rounded-xl border border-slate-700/80 font-mono text-xs">
            {/* Run Timer */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>TIME:</span>
              <span className="font-bold text-white text-sm">{formatTime(gameState.elapsedTime)}</span>
            </div>

            {/* Penalties Badge */}
            {gameState.penalties > 0 && (
              <div className="flex items-center gap-1 text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span>+{gameState.penalties}s</span>
              </div>
            )}

            {/* Score */}
            <div className="flex items-center gap-1 text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold font-display text-sm">{gameState.score}</span>
              <span className="text-[10px] text-amber-500">PTS</span>
            </div>
          </div>

          {/* Right: Keychain, Sound, and Floating Trophy Leaderboard Button */}
          <div className="flex items-center gap-2">
            {/* Treasure Keys Keychain HUD */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsKeyModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-amber-500/50 text-xs font-mono text-amber-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)]"
              title="Inspect collected Treasure Keys"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white hidden sm:inline">KEYS:</span>
              <span className="font-bold text-amber-400 font-display">
                {(gameState.unlockedKeys || []).length}/5
              </span>
              <div className="flex gap-1 ml-0.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <span
                    key={lvl}
                    className={`w-2 h-2 rounded-full transition-all ${
                      (gameState.unlockedKeys || []).includes(lvl)
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Floating Trophy Leaderboard Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsLeaderboardOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all cursor-pointer animate-pulse"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard {leaderboard.length > 0 ? `(#${currentTeamRank})` : ''}</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        {/* Floating Celebratory Score or Penalty Toast */}
        {scoreToast && (
          <div
            className={`fixed top-16 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl text-white shadow-2xl border backdrop-blur-md transition-all ${
              scoreToast.points < 0
                ? 'bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 border-rose-500/70 shadow-[0_0_35px_rgba(244,63,94,0.7)] animate-bounce'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 border-white/30 shadow-[0_0_35px_rgba(16,185,129,0.8)] animate-bounce'
            }`}
          >
            {scoreToast.points < 0 ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            )}
            <div>
              <span className="font-display font-black text-sm tracking-wider mr-2">{scoreToast.title}</span>
              <span
                className={`font-mono font-extrabold text-sm ${
                  scoreToast.points < 0 ? 'text-rose-300' : 'text-amber-300'
                }`}
              >
                {scoreToast.points < 0
                  ? `${scoreToast.points} PTS DEDUCTED!`
                  : `+${scoreToast.points} PTS AWARDED!`}
              </span>
            </div>
          </div>
        )}
        {!gameState.isStarted ? (
          <TeamAuthScreen
            onStart={handleStartGame}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenSupabaseSettings={() => setIsSupabaseModalOpen(true)}
            onOpenAdminControl={() => setIsAdminModalOpen(true)}
            onOpenShare={() => setIsShareModalOpen(true)}
            isSupabaseConnected={isSupabaseConnected}
            teams={leaderboard}
            currentAdmin={currentAdmin}
          />
        ) : gameState.isCompleted ? (
          <VictoryScreen
            teamId={gameState.teamId}
            teamName={gameState.teamName}
            avatar={gameState.avatar}
            elapsedTime={gameState.elapsedTime}
            penalties={gameState.penalties}
            score={gameState.score}
            rank={currentTeamRank}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onRestart={handleRestart}
            onOpenDecoder={() => setIsDecoderModalOpen(true)}
          />
        ) : (
          <div className="w-full flex flex-col items-center">
            {gameState.currentLevel === 1 && (
              <Level1CyberQuiz
                onComplete={(duration) => handleLevelComplete(duration)}
                onApplyPenalty={(pts, sec, label) => handleApplyHintPenalty(pts, sec, label)}
                teamId={gameState.teamId}
                teamName={gameState.teamName}
              />
            )}
            {gameState.currentLevel === 2 && (
              <Level2NQueens
                onComplete={(duration) => handleLevelComplete(duration)}
                onApplyPenalty={(pts, sec, label) => handleApplyHintPenalty(pts, sec, label)}
              />
            )}
            {gameState.currentLevel === 3 && (
              <Level3CodeWordle
                onComplete={(duration) => handleLevelComplete(duration)}
                onApplyPenalty={(pts, sec, label) => handleApplyHintPenalty(pts, sec, label)}
              />
            )}
            {gameState.currentLevel === 4 && (
              <Level4BugSmasherArcade
                onComplete={(duration) => handleLevelComplete(duration)}
                onApplyPenalty={(pts, sec, label) => handleApplyHintPenalty(pts, sec, label)}
              />
            )}
            {gameState.currentLevel === 5 && (
              <Level5LoopSnippetPredictor
                onComplete={(duration) => handleLevelComplete(duration)}
                onApplyPenalty={(pts, sec, label) => handleApplyHintPenalty(pts, sec, label)}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        leaderboard={leaderboard}
        currentTeamId={gameState.teamId}
        isRealtimeActive={isSupabaseConnected}
      />

      <AdminControlModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          try {
            const params = new URLSearchParams(window.location.search);
            if (params.has('admin')) {
              params.delete('admin');
              const newQuery = params.toString();
              const cleanUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '') + window.location.hash;
              window.history.replaceState({}, document.title, cleanUrl);
            }
          } catch {}
        }}
        teams={leaderboard}
        currentAuthenticatedAdmin={currentAdmin}
        onAdminLogin={(admin) => setCurrentAdmin(admin)}
        onAdminLogout={() => setCurrentAdmin(null)}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      <ShareAccessModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      <PenaltySkipModal
        isOpen={skipModalOpen}
        levelNumber={gameState.currentLevel}
        onConfirm={handleConfirmSkip}
        onCancel={() => setSkipModalOpen(false)}
      />

      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={() => {
          setIsSupabaseConnected(supabaseService.isConnected());
        }}
      />

      {/* Treasure Hunt Modals */}
      <KeyUnlockedCelebrationModal
        isOpen={!!newlyUnlockedKey}
        treasureKey={newlyUnlockedKey}
        totalKeysUnlocked={(gameState.unlockedKeys || []).length}
        onProceed={() => setNewlyUnlockedKey(null)}
      />

      <TreasureKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        unlockedLevels={gameState.unlockedKeys || []}
        onOpenDecoder={() => {
          setIsKeyModalOpen(false);
          setIsDecoderModalOpen(true);
        }}
      />

      <TreasureDecoderModal
        isOpen={isDecoderModalOpen}
        onClose={() => setIsDecoderModalOpen(false)}
        onCompleteDecoding={() => {
          setGameState((prev) => ({
            ...prev,
            isKeyDecoded: true,
          }));
        }}
      />
    </div>
  );
}
