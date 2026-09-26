import React, { useState, useEffect } from 'react';
import { AdminMember, TeamLeaderboardEntry, TEAM_AVATARS } from '../types';
import { supabaseService, DEFAULT_ADMINS } from '../services/supabaseService';
import { sounds } from '../services/soundEffects';
import {
  ShieldCheck,
  UserCheck,
  Plus,
  Trash2,
  RotateCcw,
  Key,
  Users,
  AlertTriangle,
  X,
  Edit2,
  Save,
  Check,
  Search,
  Lock,
  Sparkles,
  Download,
  Award,
  Sliders,
  Eye,
  EyeOff,
  Flame,
  UserX,
  Shield,
  Zap,
  QrCode,
  Share2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamLeaderboardEntry[];
  currentAuthenticatedAdmin: AdminMember | null;
  onAdminLogin: (admin: AdminMember) => void;
  onAdminLogout: () => void;
  onOpenShare?: () => void;
}

export const AdminControlModal: React.FC<Props> = ({
  isOpen,
  onClose,
  teams,
  currentAuthenticatedAdmin,
  onAdminLogin,
  onAdminLogout,
  onOpenShare,
}) => {
  const [admins, setAdmins] = useState<AdminMember[]>(supabaseService.getAdmins());
  const [selectedAdminId, setSelectedAdminId] = useState<string>(admins[0]?.id || 'admin-1');
  const [enteredPasscode, setEnteredPasscode] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [showPasscodes, setShowPasscodes] = useState<boolean>(true);

  // Tabs within admin panel: default to 'admins' so 4 Council Members & Options are immediately visible
  const [activeTab, setActiveTab] = useState<'admins' | 'options' | 'roster' | 'quick_add' | 'login'>('admins');

  // New Team Form state
  const [newTeamId, setNewTeamId] = useState<string>(`TEAM-${teams.length + 1 < 10 ? '0' + (teams.length + 1) : teams.length + 1}`);
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newTeamAvatar, setNewTeamAvatar] = useState<string>('🚀');
  const [addSuccessMsg, setAddSuccessMsg] = useState<string>('');

  // Editing Admin Member state
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editRole, setEditRole] = useState<string>('');
  const [editPasscode, setEditPasscode] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editAvatar, setEditAvatar] = useState<string>('👑');

  // Search filter for teams
  const [teamSearch, setTeamSearch] = useState<string>('');
  const [confirmResetAll, setConfirmResetAll] = useState<boolean>(false);
  const [confirmWipeDatabase, setConfirmWipeDatabase] = useState<boolean>(false);
  const [confirmResetDefaults, setConfirmResetDefaults] = useState<boolean>(false);

  // Quick Score Adjustment state (under Options tab)
  const [selectedAdjustTeamId, setSelectedAdjustTeamId] = useState<string>('');
  const [scoreAdjustMsg, setScoreAdjustMsg] = useState<string>('');

  // Sync admins when modal opens or updates
  useEffect(() => {
    if (isOpen) {
      setAdmins(supabaseService.getAdmins());
    }
    const unsub = supabaseService.subscribeToAdmins((updated) => {
      setAdmins(updated);
    });
    return () => unsub();
  }, [isOpen]);

  // Set default selected adjust team when teams change
  useEffect(() => {
    if (teams.length > 0 && !selectedAdjustTeamId) {
      setSelectedAdjustTeamId(teams[0].team_id);
    }
  }, [teams, selectedAdjustTeamId]);

  if (!isOpen) return null;

  // Direct 1-Click Login for any of the 4 Admin seats
  const handleQuickLogin = (admin: AdminMember) => {
    sounds.playLevelWin();
    onAdminLogin(admin);
    setLoginError('');
    setEnteredPasscode('');
  };

  // Passcode verification login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAdmin = admins.find((a) => a.id === selectedAdminId);
    if (!targetAdmin) return;

    if (enteredPasscode.trim().toUpperCase() === targetAdmin.passcode.trim().toUpperCase()) {
      sounds.playLevelWin();
      onAdminLogin(targetAdmin);
      setLoginError('');
      setEnteredPasscode('');
      setActiveTab('admins');
    } else {
      sounds.playBuzzer();
      setLoginError(`Invalid passcode for ${targetAdmin.name}. Required: "${targetAdmin.passcode}"`);
    }
  };

  // Add Custom Team
  const handleAddNewTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamId.trim() || !newTeamName.trim()) {
      sounds.playBuzzer();
      return;
    }

    const formattedId = newTeamId.trim().toUpperCase();
    if (teams.some((t) => t.team_id === formattedId)) {
      sounds.playBuzzer();
      setAddSuccessMsg(`Error: Team ID "${formattedId}" already exists!`);
      return;
    }

    sounds.playCapture();
    await supabaseService.addCustomTeam(formattedId, newTeamName.trim(), newTeamAvatar);
    setAddSuccessMsg(`Team "${newTeamName}" (${formattedId}) successfully pre-registered!`);

    const nextNum = teams.length + 2;
    setNewTeamId(`TEAM-${nextNum < 10 ? '0' + nextNum : nextNum}`);
    setNewTeamName('');

    setTimeout(() => setAddSuccessMsg(''), 3500);
  };

  // Start editing admin
  const handleStartEditAdmin = (admin: AdminMember) => {
    setEditingAdminId(admin.id);
    setEditName(admin.name);
    setEditRole(admin.role);
    setEditPasscode(admin.passcode);
    setEditEmail(admin.email || '');
    setEditAvatar(admin.avatar);
  };

  // Save edited admin
  const handleSaveAdmin = (adminId: string) => {
    sounds.playCapture();
    const updated = admins.map((a) =>
      a.id === adminId
        ? {
            ...a,
            name: editName.trim() || a.name,
            role: editRole.trim() || a.role,
            passcode: editPasscode.trim() || a.passcode,
            email: editEmail.trim(),
            avatar: editAvatar,
          }
        : a
    );
    setAdmins(updated);
    supabaseService.saveAdmins(updated);
    setEditingAdminId(null);
  };

  // Reset 4 Council members to factory defaults
  const handleResetCouncilDefaults = () => {
    sounds.playClick();
    const def = supabaseService.resetAdminsToDefault();
    setAdmins(def);
    setConfirmResetDefaults(false);
  };

  // Team controls
  const handleDeleteTeam = async (teamId: string) => {
    if (confirm(`Remove team ${teamId} from active contest?`)) {
      sounds.playBuzzer();
      await supabaseService.deleteTeam(teamId);
    }
  };

  const handleResetTeam = async (teamId: string) => {
    sounds.playClick();
    await supabaseService.resetTeamScore(teamId);
  };

  const handleAdjustPoints = async (teamId: string, pts: number, penaltySec: number = 0) => {
    sounds.playCapture();
    await supabaseService.adjustTeamScore(teamId, pts, penaltySec);
    setScoreAdjustMsg(`Applied ${pts >= 0 ? '+' + pts : pts} PTS to team ${teamId}!`);
    setTimeout(() => setScoreAdjustMsg(''), 3000);
  };

  const handleToggleDisqualify = async (teamId: string) => {
    sounds.playBuzzer();
    await supabaseService.toggleDisqualify(teamId);
  };

  const handleResetAll = async () => {
    sounds.playBuzzer();
    await supabaseService.resetAllTeams();
    setConfirmResetAll(false);
  };

  const handleWipeDatabase = async () => {
    sounds.playBuzzer();
    await supabaseService.deleteAllTeams();
    setConfirmWipeDatabase(false);
  };

  // Export Leaderboard to CSV
  const handleExportCSV = () => {
    sounds.playCapture();
    const headers = ['Rank', 'Team ID', 'Team Name', 'Avatar', 'Level', 'Score', 'Elapsed Time (s)', 'Penalties (s)', 'Total Time (s)', 'Disqualified', 'Last Updated'];
    const rows = teams.map((t, idx) => [
      idx + 1,
      `"${t.team_id}"`,
      `"${t.team_name.replace(/"/g, '""')}"`,
      `"${t.avatar || '🚀'}"`,
      t.current_level > 5 ? 'Finished (5/5)' : `Sector ${t.current_level}`,
      t.score || 0,
      t.elapsed_time || 0,
      t.penalties || 0,
      (t.elapsed_time || 0) + (t.penalties || 0),
      t.is_disqualified ? 'YES' : 'NO',
      `"${t.updated_at || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dtth_leaderboard_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTeams = teams.filter(
    (t) =>
      t.team_id.toLowerCase().includes(teamSearch.toLowerCase()) ||
      t.team_name.toLowerCase().includes(teamSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[94vh] sm:max-h-[92vh] rounded-3xl glass-panel-purple border-2 border-rose-500/50 shadow-[0_0_60px_rgba(244,63,94,0.35)] flex flex-col min-h-0 overflow-hidden my-auto">
        
        {/* Header (Fixed at top) */}
        <div className="flex-shrink-0 p-4 sm:p-5 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border-2 border-rose-400/80 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.5)]">
              <ShieldCheck className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg md:text-2xl font-display font-extrabold text-white tracking-wide">
                  Mission Control &bull; 4-Admin Council
                </h3>
                {currentAuthenticatedAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <span>AUTH: {currentAuthenticatedAdmin.name} ({currentAuthenticatedAdmin.role.split(' ')[0]})</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3 text-purple-400" />
                    <span>COUNCIL DIRECTORY &bull; 1-CLICK AUTH AVAILABLE</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Manage 4 council seats, adjust team scores, review registered squads, and control contest options.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentAuthenticatedAdmin && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onAdminLogout();
                }}
                className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-mono transition-all cursor-pointer items-center gap-1.5"
                title="Log Out Active Admin"
              >
                <span>Log Out</span>
              </button>
            )}

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Global Admin Tabs Navigation (Always Visible & Scrollable) */}
        <div className="flex-shrink-0 p-2 sm:p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
            {/* Tab 1: 4 Council Members */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('admins');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'admins'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4 Council Members</span>
            </button>

            {/* Tab 2: Council Options & Tools */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('options');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'options'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Council Options &amp; Tools</span>
            </button>

            {/* Tab 3: Participating Teams */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('roster');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Squads Roster ({teams.length})</span>
            </button>

            {/* Tab 4: Pre-Register Team */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('quick_add');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'quick_add'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pre-Register Team</span>
            </button>

            {/* Tab 5: Passcode Login Form */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('login');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{currentAuthenticatedAdmin ? 'Switch Admin Seat' : 'Passcode Gateway'}</span>
            </button>
          </div>

          {currentAuthenticatedAdmin && (
            <button
              onClick={() => {
                sounds.playClick();
                onAdminLogout();
              }}
              className="sm:hidden px-2.5 py-1 rounded-lg bg-slate-800 text-rose-400 text-[10px] font-mono whitespace-nowrap"
            >
              Logout
            </button>
          )}
        </div>

        {/* Scrollable Main Body Content Area (Guaranteed Scrollability on all devices) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 w-full space-y-6">

          {/* ============================================================== */}
          {/* TAB 1: 4 COUNCIL MEMBERS DIRECTORY & MANAGEMENT */}
          {/* ============================================================== */}
          {activeTab === 'admins' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              {/* Quick Director Access Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 via-purple-950/60 to-slate-900 border border-rose-500/40 flex flex-wrap items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-400/60 flex items-center justify-center text-2xl shadow-inner">
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-white text-sm">Council Leadership: Neethu N</span>
                      <span className="px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 border border-rose-400/40 text-[10px] font-mono font-bold">
                        LEAD DIRECTOR
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                      1-click authenticate as Lead Director or click any seat below to take council actions.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const dir = admins.find((a) => a.id === 'admin-1') || admins[0];
                      if (dir) handleQuickLogin(dir);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-display font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.6)] cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>1-Click Enter as Director</span>
                  </button>

                  <button
                    onClick={() => setShowPasscodes(!showPasscodes)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                    title="Toggle secret passcodes display"
                  >
                    {showPasscodes ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-rose-400" />}
                    <span className="hidden sm:inline">{showPasscodes ? 'Hide Keys' : 'Show Keys'}</span>
                  </button>
                </div>
              </div>

              {/* 4 Admin Cards Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    <span>The 4 Council Member Seats</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    Seats 1 to 4 &bull; Fully editable
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {admins.map((admin, idx) => {
                    const isEditing = editingAdminId === admin.id;
                    const isCurrent = currentAuthenticatedAdmin?.id === admin.id;

                    return (
                      <div
                        key={admin.id}
                        className={`p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all border ${
                          isCurrent
                            ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.35)]'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {!isEditing ? (
                          <>
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl p-2 rounded-xl bg-slate-950 border border-slate-800 shadow-sm">
                                    {admin.avatar}
                                  </span>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="font-bold text-white text-sm">{admin.name}</span>
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 font-bold">
                                        Seat #{idx + 1}
                                      </span>
                                    </div>
                                    <div className="text-xs text-rose-400 font-mono mt-0.5">{admin.role}</div>
                                    {admin.email && (
                                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{admin.email}</div>
                                    )}
                                  </div>
                                </div>

                                {isCurrent && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold flex items-center gap-1">
                                    <UserCheck className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>LOGGED IN</span>
                                  </span>
                                )}
                              </div>

                              {/* Passcode Badge */}
                              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono flex items-center justify-between">
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Key className="w-3 h-3 text-slate-500" />
                                  <span>Seat Passcode:</span>
                                </span>
                                <span className="text-amber-300 font-bold font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                                  {showPasscodes ? admin.passcode : '••••••••'}
                                </span>
                              </div>
                            </div>

                            {/* Action Options for this Seat */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                              <button
                                onClick={() => handleQuickLogin(admin)}
                                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                  isCurrent
                                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                                    : 'bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-200'
                                }`}
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-300" />
                                <span>{isCurrent ? 'Active Seat' : '1-Click Enter'}</span>
                              </button>

                              <button
                                onClick={() => handleStartEditAdmin(admin)}
                                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit Seat</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          /* Inline Edit Form for this seat */
                          <div className="space-y-3 font-mono text-xs">
                            <div className="text-xs font-bold text-rose-300 uppercase flex items-center justify-between">
                              <span>Editing Council Seat #{idx + 1}</span>
                              <span className="text-[10px] text-slate-400">{admin.id}</span>
                            </div>

                            <div>
                              <label className="text-slate-400 block mb-1">Full Name:</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                              />
                            </div>

                            <div>
                              <label className="text-slate-400 block mb-1">Role / Designation:</label>
                              <input
                                type="text"
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                              />
                            </div>

                            <div>
                              <label className="text-slate-400 block mb-1">Secret Passcode:</label>
                              <input
                                type="text"
                                value={editPasscode}
                                onChange={(e) => setEditPasscode(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-rose-500/60 text-amber-300 font-bold"
                              />
                            </div>

                            <div>
                              <label className="text-slate-400 block mb-1">Email (Optional):</label>
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                              />
                            </div>

                            <div>
                              <label className="text-slate-400 block mb-1">Seat Avatar:</label>
                              <div className="flex gap-2">
                                {['👑', '🛡️', '⚡', '🥷', '🚀', '🧙‍♂️', '💻', '💎'].map((emoji) => (
                                  <button
                                    type="button"
                                    key={emoji}
                                    onClick={() => setEditAvatar(emoji)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                                      editAvatar === emoji ? 'bg-rose-500/40 border border-rose-400' : 'bg-slate-950 border border-slate-800'
                                    }`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => handleSaveAdmin(admin.id)}
                                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Seat #{idx + 1}</span>
                              </button>
                              <button
                                onClick={() => setEditingAdminId(null)}
                                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reset to Factory Council Defaults */}
              <div className="pt-2 flex justify-end">
                {!confirmResetDefaults ? (
                  <button
                    onClick={() => setConfirmResetDefaults(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300 text-xs font-mono cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset 4 Council Seats to Factory Defaults</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-rose-500/50">
                    <span className="text-xs text-rose-300 font-mono">Reset all 4 admin seats?</span>
                    <button
                      onClick={handleResetCouncilDefaults}
                      className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-xs"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setConfirmResetDefaults(false)}
                      className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: COUNCIL OPTIONS & TOOLS */}
          {/* ============================================================== */}
          {activeTab === 'options' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              <div>
                <h4 className="text-base font-display font-bold text-white mb-1 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-rose-400" />
                  <span>Administrative Contest Options &amp; Controls</span>
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Real-time council controls for score adjustments, penalties, leaderboard CSV export, and database resets.
                </p>
              </div>

              {/* Section 0: QR Code & Participant Invitation */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-purple-950/70 border border-cyan-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-xs">Participant Invite &amp; Projector QR Code</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Project the QR code on the hall screen or copy the link for participant groups.
                    </div>
                  </div>
                </div>

                {onOpenShare && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onOpenShare();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.5)] flex-shrink-0"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Open QR Code &amp; Share</span>
                  </button>
                )}
              </div>

              {/* Section 1: Live Score & Penalty Adjuster */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs uppercase tracking-wider font-bold">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span>Live Team Score &amp; Penalty Adjustment</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Target any registered squad
                  </span>
                </div>

                {teams.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono py-2">
                    No teams registered yet. Once teams join, you can grant bonus points or adjust penalties here.
                  </p>
                ) : (
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1">SELECT TARGET SQUAD:</label>
                      <select
                        value={selectedAdjustTeamId}
                        onChange={(e) => setSelectedAdjustTeamId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                      >
                        {teams.map((t) => (
                          <option key={t.team_id} value={t.team_id} className="bg-slate-950 text-white">
                            {t.avatar || '🚀'} {t.team_id} — {t.team_name} (Score: {t.score} PTS, Level {t.current_level})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => handleAdjustPoints(selectedAdjustTeamId, 100)}
                        className="px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 text-xs font-bold cursor-pointer"
                      >
                        +100 PTS Bonus
                      </button>
                      <button
                        onClick={() => handleAdjustPoints(selectedAdjustTeamId, 500)}
                        className="px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 text-xs font-bold cursor-pointer"
                      >
                        +500 PTS Bonus
                      </button>
                      <button
                        onClick={() => handleAdjustPoints(selectedAdjustTeamId, -100)}
                        className="px-3 py-2 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 hover:bg-amber-900 text-xs font-bold cursor-pointer"
                      >
                        -100 PTS Penalty
                      </button>
                      <button
                        onClick={() => handleAdjustPoints(selectedAdjustTeamId, 0, 10)}
                        className="px-3 py-2 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 hover:bg-rose-900 text-xs font-bold cursor-pointer"
                      >
                        +10s Penalty
                      </button>
                      <button
                        onClick={() => handleToggleDisqualify(selectedAdjustTeamId)}
                        className="px-3 py-2 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300 hover:bg-purple-900 text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Toggle Disqualify</span>
                      </button>
                    </div>

                    {scoreAdjustMsg && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        <Check className="w-3.5 h-3.5" />
                        <span>{scoreAdjustMsg}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 2: Data Export & Reports */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-purple-300 font-mono text-xs uppercase tracking-wider font-bold">
                    <Download className="w-4 h-4 text-purple-400" />
                    <span>Leaderboard Export &amp; Reporting</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Official Spreadsheet Download
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                  <div className="text-slate-300">
                    Download full contest rankings with team ID, squad names, sector levels, scores, elapsed times, and penalties in CSV format.
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV Spreadsheet</span>
                  </button>
                </div>
              </div>

              {/* Section 3: Dangerous Contest Management Options */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Contest Reset &amp; Clean Database Operations</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400">
                    High Privileges Required
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reset Scores Card */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="font-bold text-white text-xs font-mono">Reset All Squad Scores</div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Resets all teams to Sector 1 with 0 points and 0 time while keeping registrations intact.
                    </p>
                    {!confirmResetAll ? (
                      <button
                        onClick={() => setConfirmResetAll(true)}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Reset All Scores</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-amber-500">
                        <span className="text-[10px] font-mono text-amber-300">Confirm?</span>
                        <button
                          onClick={handleResetAll}
                          className="flex-1 py-1 rounded bg-amber-600 text-white font-bold text-xs"
                        >
                          Confirm Reset
                        </button>
                        <button
                          onClick={() => setConfirmResetAll(false)}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Wipe All Teams Card */}
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-3">
                    <div className="font-bold text-rose-300 text-xs font-mono">Clean Database (Delete All Squads)</div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Completely removes all registered squads from Supabase and local cache, restoring a 0-team state.
                    </p>
                    {!confirmWipeDatabase ? (
                      <button
                        onClick={() => setConfirmWipeDatabase(true)}
                        className="w-full py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Delete All Teams (Clean DB)</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-rose-950 p-1.5 rounded-xl border border-rose-500 animate-pulse">
                        <span className="text-[10px] font-mono text-rose-300 font-bold">Wipe clean?</span>
                        <button
                          onClick={handleWipeDatabase}
                          className="flex-1 py-1 rounded bg-rose-600 text-white font-bold text-xs"
                        >
                          Yes, Delete All
                        </button>
                        <button
                          onClick={() => setConfirmWipeDatabase(false)}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: PARTICIPATING TEAMS ROSTER & INDIVIDUAL CONTROLS */}
          {/* ============================================================== */}
          {activeTab === 'roster' && (
            <div className="space-y-4 max-w-4xl mx-auto w-full">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    placeholder="Search squad ID or squad name..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div className="text-xs font-mono text-slate-400">
                  Total Active Teams: <strong className="text-cyan-400">{filteredTeams.length}</strong>
                </div>
              </div>

              {/* Teams Table */}
              <div className="border border-slate-800 rounded-2xl bg-slate-950/80 overflow-hidden shadow-inner">
                {filteredTeams.length === 0 ? (
                  <div className="py-16 px-4 text-center">
                    <div className="text-4xl mb-3">🛸</div>
                    <p className="text-slate-200 font-display font-bold text-sm">
                      Database is currently clean and empty!
                    </p>
                    <p className="text-slate-500 font-mono text-xs mt-1.5 max-w-md mx-auto">
                      No squads have registered yet. When participants pick a slot from <strong className="text-cyan-400">TEAM_01 to TEAM_70</strong> and launch, their squad name and live score will appear here and on the leaderboard.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase bg-slate-900/90">
                          <th className="py-3 px-3">Avatar</th>
                          <th className="py-3 px-3">Team ID</th>
                          <th className="py-3 px-3">Squad Name</th>
                          <th className="py-3 px-3">Sector Progress</th>
                          <th className="py-3 px-3 text-right">Score</th>
                          <th className="py-3 px-3 text-right">Total Time</th>
                          <th className="py-3 px-3 text-right">Council Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredTeams.map((team) => (
                          <tr key={team.team_id} className="hover:bg-slate-900/50">
                            <td className="py-2.5 px-3 text-2xl">{team.avatar || '🚀'}</td>
                            <td className="py-2.5 px-3 font-bold text-cyan-300">{team.team_id}</td>
                            <td className="py-2.5 px-3 font-semibold text-white truncate max-w-xs">
                              {team.team_name}
                              {team.is_disqualified && (
                                <span className="ml-2 text-[10px] text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-500/40">
                                  DISQUALIFIED
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-purple-300">
                              {team.current_level > 5 ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <span>🏆 Finished (5/5)</span>
                                </span>
                              ) : (
                                <span>Sector {team.current_level} / 5</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right text-amber-400 font-bold">{team.score}</td>
                            <td className="py-2.5 px-3 text-right text-slate-400">
                              {(team.elapsed_time || 0) + (team.penalties || 0)}s
                              {team.penalties > 0 && <span className="text-rose-400 text-[10px] ml-1">(+{team.penalties}s)</span>}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleAdjustPoints(team.team_id, 100)}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 text-[11px] font-bold cursor-pointer"
                                  title="Add +100 Bonus Points"
                                >
                                  +100
                                </button>
                                <button
                                  onClick={() => handleResetTeam(team.team_id)}
                                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 cursor-pointer"
                                  title="Reset Squad Score"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTeam(team.team_id)}
                                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 cursor-pointer"
                                  title="Remove Squad"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: PRE-REGISTER CUSTOM TEAM (ANY NUMBER OF TEAMS) */}
          {/* ============================================================== */}
          {activeTab === 'quick_add' && (
            <div className="max-w-xl mx-auto w-full p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-5 shadow-2xl">
              <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs uppercase tracking-widest font-bold border-b border-slate-800 pb-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Pre-Register Participating Squad</span>
              </div>

              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Accepts any number of teams! Pre-register teams before or during the contest with a custom identifier code, custom squad name, and chosen cyberpunk avatar.
              </p>

              <form onSubmit={handleAddNewTeam} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">TEAM IDENTIFIER CODE:</label>
                  <input
                    type="text"
                    value={newTeamId}
                    onChange={(e) => setNewTeamId(e.target.value.toUpperCase())}
                    placeholder="e.g. TEAM-51, TEAM-52, ALPHA-01..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-cyan-400 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">SQUAD / TEAM NAME:</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Cyber Ninjas, Quantum Vipers..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-2">CHOOSE SQUAD PROFILE AVATAR:</label>
                  <div className="grid grid-cols-8 gap-2">
                    {TEAM_AVATARS.map((av) => (
                      <button
                        type="button"
                        key={av.id}
                        onClick={() => {
                          sounds.playClick();
                          setNewTeamAvatar(av.emoji);
                        }}
                        className={`h-11 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                          newTeamAvatar === av.emoji
                            ? 'bg-cyan-500/30 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-110'
                            : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                        }`}
                        title={av.label}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {addSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{addSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>PRE-REGISTER TEAM FOR CONTEST</span>
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: PASSCODE AUTHENTICATION GATEWAY */}
          {/* ============================================================== */}
          {activeTab === 'login' && (
            <div className="max-w-xl mx-auto w-full p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-rose-500/40 space-y-6 shadow-2xl">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-rose-500/50 flex items-center justify-center text-3xl mx-auto shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                  🛡️
                </div>
                <h4 className="text-base font-display font-bold text-white">
                  Admin Seat Authentication Gateway
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Select your assigned admin seat or use the 1-click quick login button below.
                </p>
              </div>

              {/* 1-Click Login List */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold text-xs font-mono">
                  SELECT SEAT (1-CLICK QUICK ACCESS):
                </label>
                <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                  {admins.map((adm, i) => (
                    <div
                      key={adm.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        selectedAdminId === adm.id
                          ? 'bg-rose-950/60 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setSelectedAdminId(adm.id);
                          setEnteredPasscode(adm.passcode);
                          setLoginError('');
                        }}
                        className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                      >
                        <span className="text-2xl">{adm.avatar}</span>
                        <div>
                          <div className="font-bold text-slate-200">{adm.name}</div>
                          <div className="text-[10px] text-slate-400">{adm.role} &bull; Seat #{i + 1}</div>
                        </div>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(adm)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span>1-Click Enter</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passcode Entry Form */}
              <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-bold">MANUAL PASSCODE VERIFICATION:</label>
                    <button
                      type="button"
                      onClick={() => {
                        const target = admins.find((a) => a.id === selectedAdminId);
                        if (target) setEnteredPasscode(target.passcode);
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                    >
                      Autofill Passcode
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={enteredPasscode}
                      onChange={(e) => setEnteredPasscode(e.target.value)}
                      placeholder="Enter admin passcode (e.g. ADMIN-2026)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="text-rose-400 text-xs font-mono font-bold bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-display font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.6)] cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>VERIFY PASSCODE &amp; ACCESS</span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer (Fixed at bottom) */}
        <div className="flex-shrink-0 p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div>
            Total Participating Squads in System: <strong className="text-cyan-300">{teams.length}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-display text-xs cursor-pointer"
            >
              Close Council Panel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
