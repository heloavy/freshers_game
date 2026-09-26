import React, { useState } from 'react';
import { TeamLeaderboardEntry } from '../types';
import { Trophy, Medal, X, Search, Clock, ShieldAlert, Radio, Flame, Sparkles } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: TeamLeaderboardEntry[];
  currentTeamId?: string;
  isRealtimeActive: boolean;
}

export const LeaderboardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  leaderboard,
  currentTeamId,
  isRealtimeActive,
}) => {
  const [search, setSearch] = useState<string>('');

  if (!isOpen) return null;

  const filtered = leaderboard.filter(
    (t) =>
      Boolean(t && t.team_id && t.team_name && t.team_name.trim().length > 0) &&
      (t.team_name.toLowerCase().includes(search.toLowerCase()) ||
       t.team_id.toLowerCase().includes(search.toLowerCase()))
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Find fastest completion time among finished teams
  const finishedTeams = filtered.filter((t) => (t.current_level ?? 1) > 5);
  const minFinishedTime = finishedTeams.length > 0
    ? Math.min(...finishedTeams.map((t) => (t.elapsed_time || 0) + (t.penalties || 0)))
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl glass-panel-purple border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400/80 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              <Trophy className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl md:text-2xl font-display font-extrabold text-white tracking-wide">
                  Live Global Leaderboard
                </h3>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>{isRealtimeActive ? 'SUPABASE REALTIME ACTIVE' : 'LIVE NETWORK MESH'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Dynamic rankings across all {filtered.length} active squads &bull; Ranked by: Completed All Levels (5/5) &gt; Fastest Total Time (Elapsed + Penalties) &gt; Higher Score
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search & Quick Stats Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by team slot (e.g. TEAM_01) or team name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{filtered.length} Registered Squads</span>
            </span>
          </div>
        </div>

        {/* Scrollable Leaderboard Table or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filtered.length === 0 ? (
            <div className="py-14 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-cyan-500/40 flex items-center justify-center text-3xl mb-4 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
                🛸
              </div>
              <h4 className="text-lg font-display font-bold text-white mb-2">
                {search ? 'No Matching Squads Found' : 'Clean Database — Awaiting Squad Registration'}
              </h4>
              <p className="text-xs font-mono text-slate-400 max-w-md mx-auto leading-relaxed">
                {search
                  ? `No teams found matching "${search}". Try searching for another team ID or name.`
                  : 'The database is completely clean with 0 squads registered. Teams will only appear on this live leaderboard after they choose their slot (TEAM_01 to TEAM_70), enter their squad name, and launch the hunt. Teams who complete all levels in less time and score more points are ranked highest!'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Team</th>
                  <th className="py-3 px-3">Mission Status</th>
                  <th className="py-3 px-3 text-right">Elapsed</th>
                  <th className="py-3 px-3 text-right">Penalties</th>
                  <th className="py-3 px-3 text-right">Total Time</th>
                  <th className="py-3 px-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((entry, index) => {
                  const isCurrentTeam = entry.team_id === currentTeamId;
                  const totalTime = (entry.elapsed_time || 0) + (entry.penalties || 0);
                  const isWinner = (entry.current_level ?? 1) > 5;
                  const isFastestClear = isWinner && minFinishedTime !== null && totalTime === minFinishedTime;

                  return (
                    <tr
                      key={entry.team_id}
                      className={`transition-colors duration-150 ${
                        isCurrentTeam
                          ? 'bg-cyan-950/40 border-l-4 border-cyan-400 shadow-sm'
                          : index === 0 && isWinner
                          ? 'bg-amber-950/30'
                          : index === 0
                          ? 'bg-cyan-950/20'
                          : index % 2 === 0
                          ? 'bg-slate-900/30'
                          : 'bg-transparent hover:bg-slate-900/60'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-3 font-display font-bold">
                        {index === 0 ? (
                          <div className="flex items-center gap-1.5 text-amber-400 font-black">
                            <Medal className="w-4 h-4 fill-amber-400" />
                            <span>#1</span>
                          </div>
                        ) : index === 1 ? (
                          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                            <Medal className="w-4 h-4 fill-slate-300" />
                            <span>#2</span>
                          </div>
                        ) : index === 2 ? (
                          <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                            <Medal className="w-4 h-4 fill-amber-600" />
                            <span>#3</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono">#{index + 1}</span>
                        )}
                      </td>

                      {/* Team Avatar, ID & Custom Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg select-none" title="Team Avatar">
                            {entry.avatar || '🚀'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 font-bold border border-slate-700">
                            {entry.team_id}
                          </span>
                          <span className="font-semibold text-white tracking-wide truncate max-w-[160px] sm:max-w-xs">
                            {entry.team_name}
                          </span>
                          {isCurrentTeam && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[9px] font-bold">
                              YOU
                            </span>
                          )}
                          {isFastestClear && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-[9px] font-bold flex items-center gap-1">
                              ⚡ FASTEST
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Level / Completion Status */}
                      <td className="py-3 px-3">
                        {isWinner ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold flex items-center gap-1.5 w-fit shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>ALL 5 CLEARED</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">
                            Sector 0{entry.current_level} <span className="text-slate-600">/ 5</span>
                          </span>
                        )}
                      </td>

                      {/* Elapsed Time */}
                      <td className="py-3 px-3 text-right text-slate-400">
                        {formatTime(entry.elapsed_time || 0)}
                      </td>

                      {/* Penalties */}
                      <td className="py-3 px-3 text-right">
                        {(entry.penalties || 0) > 0 ? (
                          <span className="text-rose-400 font-bold">+{(entry.penalties || 0)}s</span>
                        ) : (
                          <span className="text-slate-600">0s</span>
                        )}
                      </td>

                      {/* Total Time */}
                      <td className="py-3 px-3 text-right font-bold text-cyan-300">
                        {formatTime(totalTime)}
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3 text-right font-display font-extrabold text-amber-400 text-sm">
                        {entry.score.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            Showing {filtered.length} of {leaderboard.length} teams
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-display font-semibold transition-all cursor-pointer"
          >
            Close Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
