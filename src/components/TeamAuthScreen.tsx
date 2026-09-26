import React, { useState } from 'react';
import { Rocket, Shield, Users, Trophy, Sparkles, Orbit, Database, Volume2, VolumeX, Flame, ShieldCheck, QrCode, Share2 } from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { TEAM_AVATARS, STANDARD_TEAM_SLOTS, AdminMember, TeamLeaderboardEntry } from '../types';

interface Props {
  onStart: (teamId: string, teamName: string, avatar: string) => void;
  onOpenLeaderboard: () => void;
  onOpenSupabaseSettings: () => void;
  onOpenAdminControl: () => void;
  onOpenShare?: () => void;
  isSupabaseConnected: boolean;
  teams: TeamLeaderboardEntry[];
  currentAdmin: AdminMember | null;
}

export const TeamAuthScreen: React.FC<Props> = ({
  onStart,
  onOpenLeaderboard,
  onOpenSupabaseSettings,
  onOpenAdminControl,
  onOpenShare,
  isSupabaseConnected,
  teams,
  currentAdmin,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('TEAM_01');
  const [customTeamIdInput, setCustomTeamIdInput] = useState<string>('');
  const [useCustomId, setUseCustomId] = useState<boolean>(false);
  const [teamName, setTeamName] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🚀');
  const [validationError, setValidationError] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(sounds.isMuted());

  const [isTerminalLocked, setIsTerminalLocked] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem('dtth_terminal_locked') === 'true'
  );

  // Live Terminal Lock Check: Automatically lifts the attempt lock if the team was deleted in Supabase
  React.useEffect(() => {
    try {
      const locked = localStorage.getItem('dtth_terminal_locked') === 'true';
      const completedTeam = localStorage.getItem('dtth_completed_team');
      if (locked && completedTeam) {
        const stillInDb = teams.some(
          (t) => t.team_name && t.team_name.trim().toLowerCase() === completedTeam.trim().toLowerCase()
        );
        if (!stillInDb) {
          // Team record was deleted in the DB! Immediately unlock terminal for this machine
          localStorage.removeItem('dtth_terminal_locked');
          localStorage.removeItem('dtth_completed_team');
          localStorage.removeItem('dtth_completed_state');
          localStorage.removeItem('dtth_active_game');
          setIsTerminalLocked(false);
          setValidationError('');
        } else {
          setIsTerminalLocked(true);
        }
      } else if (!locked) {
        setIsTerminalLocked(false);
      }
    } catch {}
  }, [teams]);

  // Live DB Deletion Reflection: If an occupied slot or registered squad was deleted from the DB,
  // clear out any stale validation errors immediately so user doesn't have to reload
  React.useEffect(() => {
    if (validationError) {
      const occupiedMatch = validationError.match(/Slot ([A-Z0-9_-]+) is already occupied/);
      if (occupiedMatch) {
        const slotId = occupiedMatch[1];
        const isStillOccupied = teams.some(
          (t) => t.team_id.toUpperCase() === slotId.toUpperCase() && t.team_name && t.team_name.trim().length > 0
        );
        if (!isStillOccupied) {
          setValidationError('');
        }
      }
      const squadMatch = validationError.match(/Squad "([^"]+)" has already/);
      if (squadMatch) {
        const squadName = squadMatch[1].trim().toLowerCase();
        const isStillRegistered = teams.some(
          (t) => t.team_name && t.team_name.trim().toLowerCase() === squadName
        );
        if (!isStillRegistered) {
          setValidationError('');
        }
      }
    }
  }, [teams, validationError]);

  // Synchronize team selection and check if occupied
  const handleSelectTeam = (id: string) => {
    setSelectedTeamId(id);
    const existing = teams.find((t) => t.team_id === id && t.team_name && t.team_name.trim().length > 0);
    if (existing) {
      setValidationError(`⚠️ Slot ${id} is already occupied by "${existing.team_name}". Please select an available slot.`);
    } else {
      setValidationError('');
    }
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTeamName = teamName.trim();
    if (!cleanTeamName) {
      sounds.playBuzzer();
      setValidationError('Please enter your squad / team name before launching!');
      return;
    }

    const finalTeamId = useCustomId
      ? customTeamIdInput.trim().toUpperCase()
      : selectedTeamId;

    if (!finalTeamId) {
      sounds.playBuzzer();
      setValidationError('Please specify or select a Team Slot (TEAM_01 to TEAM_70)!');
      return;
    }

    // 1. Strict Duplicate Check: Same Team Name can never play again
    const normalizedName = cleanTeamName.toLowerCase();
    const existingName = teams.find(
      (t) => t.team_name && t.team_name.trim().toLowerCase() === normalizedName
    );
    if (existingName) {
      sounds.playBuzzer();
      setValidationError(`⚠️ Squad "${cleanTeamName}" has already played or registered! Only 1 attempt is allowed per team name.`);
      return;
    }

    // 2. Strict Slot Check: Team Slot already registered
    const existingSlot = teams.find(
      (t) => t.team_id.toUpperCase() === finalTeamId.toUpperCase() && t.team_name && t.team_name.trim().length > 0
    );
    if (existingSlot) {
      sounds.playBuzzer();
      setValidationError(`⚠️ Slot ${finalTeamId} is already occupied by "${existingSlot.team_name}". Please pick an available slot.`);
      return;
    }

    // 3. LocalStorage Single Attempt Check
    try {
      const completedTeam = localStorage.getItem('dtth_completed_team');
      if (completedTeam && completedTeam.trim().toLowerCase() === normalizedName) {
        const isStillInDb = teams.some(
          (t) => t.team_name && t.team_name.trim().toLowerCase() === normalizedName
        );
        if (isStillInDb) {
          sounds.playBuzzer();
          setValidationError(`⚠️ Squad "${cleanTeamName}" has already completed the hunt and finalized their score.`);
          return;
        } else {
          // If deleted in the database, clear local storage locks and proceed
          localStorage.removeItem('dtth_terminal_locked');
          localStorage.removeItem('dtth_completed_team');
        }
      }
    } catch {}

    sounds.playCapture();
    onStart(finalTeamId, cleanTeamName, selectedAvatar);
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-in p-4 z-10">
      {/* Top Banner Navigation */}
      <div className="w-full flex items-center justify-between mb-6 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            <Orbit className="w-5 h-5 text-cyan-300 animate-spin" />
          </div>
          <div>
            <span className="font-display font-black text-sm md:text-base text-white tracking-wider">
              GOOGLE ANTIGRAVITY //
            </span>
            <span className="text-[10px] font-mono text-cyan-400 block -mt-1">
              ZERO-G MATRIX SIMULATION 2026
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Share & QR Code Button */}
          {onOpenShare && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenShare();
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400/60 hover:bg-cyan-900 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              title="Share event link or show QR code for participants"
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Share / QR Code</span>
              <span className="sm:hidden">Share</span>
            </button>
          )}

          {/* Trophy Leaderboard Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenLeaderboard();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="w-full rounded-3xl glass-panel-purple border-2 border-cyan-500/40 p-6 md:p-10 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center relative overflow-hidden">
        {/* Glow halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 font-mono text-xs uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SLOTS: TEAM_01 TO TEAM_70 &bull; CLEAN DATABASE &bull; RANKINGS BY SCORE</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-white tracking-wide uppercase mb-3">
          DIGITAL TECH <span className="text-cyan-400 neon-text-glow">TREASURE HUNT</span>
        </h1>

        <p className="text-slate-300 text-xs md:text-base font-mono max-w-2xl mx-auto mb-8 leading-relaxed">
          Select your squad slot from <span className="text-cyan-300 font-bold">TEAM_01 to TEAM_70</span> in sequence, enter your team details, and launch the hunt. Only after submitting your details and launching will your squad appear on the live leaderboard ranked by score!
        </p>

        {/* Team Authentication & Avatar Selection Card */}
        <div className="max-w-xl mx-auto p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs uppercase tracking-widest font-bold">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Squad Check-In &amp; Registration</span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenShare && (
                <button
                  type="button"
                  onClick={onOpenShare}
                  className="text-[10px] font-mono text-cyan-300 hover:text-white bg-cyan-950/80 hover:bg-cyan-900 px-2 py-0.5 rounded border border-cyan-500/40 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <QrCode className="w-3 h-3 text-cyan-400" />
                  <span>Scan to Join</span>
                </button>
              )}
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                {teams.length} Squads on Leaderboard
              </span>
            </div>
          </div>

          <form onSubmit={handleLaunch} className="space-y-5 font-mono text-xs">
            {isTerminalLocked && (
              <div className="p-4 rounded-xl bg-rose-950/80 border-2 border-rose-500/80 text-rose-200 font-mono text-xs flex items-start gap-3 shadow-[0_0_25px_rgba(244,63,94,0.4)]">
                <span className="text-2xl">🔒</span>
                <div>
                  <div className="font-bold text-white text-sm uppercase tracking-wide">Test Attempt Completed on this Machine</div>
                  <div className="mt-1 leading-relaxed text-slate-300">
                    An official test run has already been completed and submitted from this terminal. To maintain examination integrity, repeated attempts are strictly locked.
                  </div>
                </div>
              </div>
            )}
            {/* Team ID Selection (Sequential slots TEAM_01 to TEAM_70) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SELECT TEAM SLOT (TEAM_01 TO TEAM_70):</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomId(!useCustomId)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                >
                  {useCustomId ? '← Pick from TEAM_01-70' : '+ Custom Team Code'}
                </button>
              </div>

              {!useCustomId ? (
                <select
                  value={selectedTeamId}
                  onChange={(e) => handleSelectTeam(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {STANDARD_TEAM_SLOTS.map((slotId) => {
                    const existing = teams.find((t) => t.team_id === slotId && t.team_name && t.team_name.trim().length > 0);
                    return (
                      <option key={slotId} value={slotId} disabled={Boolean(existing)} className={existing ? "bg-slate-900 text-slate-500" : "bg-slate-950 text-white"}>
                        {existing
                          ? `🔒 ${slotId} — ${existing.team_name} (Occupied)`
                          : `⚡ ${slotId} (Available)`}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  value={customTeamIdInput}
                  onChange={(e) => setCustomTeamIdInput(e.target.value.toUpperCase())}
                  placeholder="e.g. TEAM_51, ALPHA_01, VIPER_X..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 uppercase"
                />
              )}
            </div>

            {/* Custom Team Name */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>SQUAD / TEAM NAME:</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setValidationError('');
                }}
                maxLength={32}
                placeholder="Enter squad name (e.g. Cyber Glitchers, Quantum Vipers)..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
              />
            </div>

            {/* CHOOSE TEAM PROFILE AVATAR */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <span className="text-base">{selectedAvatar}</span>
                  <span>CHOOSE SQUAD PROFILE AVATAR:</span>
                </label>
                <span className="text-[10px] text-cyan-300 font-bold">
                  {TEAM_AVATARS.find((a) => a.emoji === selectedAvatar)?.label || 'Selected'}
                </span>
              </div>

              {/* 16 Futuristic Zero-G Cyberpunk Avatars Grid */}
              <div className="grid grid-cols-8 gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                {TEAM_AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedAvatar(av.emoji);
                    }}
                    className={`h-11 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                      selectedAvatar === av.emoji
                        ? 'bg-cyan-500/30 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-110'
                        : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                    }`}
                    title={av.label}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
            </div>

            {validationError && (
              <div className="text-rose-400 text-xs font-mono font-bold bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/30">
                {validationError}
              </div>
            )}

            {/* Launch Button */}
            <button
              type="submit"
              disabled={isTerminalLocked}
              className={`w-full py-4 rounded-xl font-display font-extrabold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isTerminalLocked
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.8)] cursor-pointer'
              }`}
            >
              <Rocket className="w-5 h-5" />
              <span>{isTerminalLocked ? 'TERMINAL ATTEMPT LOCKED' : 'LAUNCH DIGITAL TECH HUNT'}</span>
            </button>

            {/* Live Cloud Confirmation Indicator */}
            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-mono text-emerald-400/90">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Cloud Sync Active &bull; All submissions are cryptographically logged &amp; verified</span>
            </div>
          </form>
        </div>

        {/* 5 Levels Mini-Map Preview */}
        <div className="mt-10 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              5 INTERACTIVE TECH STATIONS:
            </span>
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              ⚡ SPEED BONUS: LESS TIME = MORE POINTS!
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-left font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/30">
              <div className="text-cyan-400 font-bold text-[10px]">LEVEL 01</div>
              <div className="text-white font-semibold text-xs mt-0.5">Tower Block Stack</div>
              <div className="text-slate-500 text-[10px]">Slice &amp; Stack 5 Nodes</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-purple-500/30">
              <div className="text-purple-400 font-bold text-[10px]">LEVEL 02</div>
              <div className="text-white font-semibold text-xs mt-0.5">N-Queens Alignment</div>
              <div className="text-slate-500 text-[10px]">Zero Attack Vectors</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/30">
              <div className="text-amber-400 font-bold text-[10px]">LEVEL 03</div>
              <div className="text-white font-semibold text-xs mt-0.5">Code Word Search</div>
              <div className="text-slate-500 text-[10px]">Find 10 C/Python/Compiler Words</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-500/30">
              <div className="text-rose-400 font-bold text-[10px]">LEVEL 04</div>
              <div className="text-white font-semibold text-xs mt-0.5">Bug Smasher</div>
              <div className="text-slate-500 text-[10px]">Smash 12 Bugs in 30s 👾</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/30">
              <div className="text-emerald-400 font-bold text-[10px]">LEVEL 05</div>
              <div className="text-white font-semibold text-xs mt-0.5">C Loop Predictor</div>
              <div className="text-slate-500 text-[10px]">Calculate printf Output</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
