import React, { useState } from 'react';
import { Database, Check, Copy, AlertCircle, RefreshCw, X, Radio, ExternalLink } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { sounds } from '../services/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

const SQL_SETUP_SCRIPT = `-- Create Leaderboard Table for Digital Tech Treasure Hunt 2026
create table if not exists public.leaderboard (
  team_id text primary key,
  team_name text not null,
  avatar text default '🚀',
  current_level int default 1,
  score int default 0,
  elapsed_time int default 0,
  penalties int default 0,
  is_disqualified boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Migrations (if table was created previously):
alter table public.leaderboard add column if not exists avatar text default '🚀';
alter table public.leaderboard add column if not exists is_disqualified boolean default false;

-- Enable Row Level Security (RLS) & Public Access
alter table public.leaderboard enable row level security;

create policy "Allow public access" on public.leaderboard
for all using (true) with check (true);

-- Enable Realtime Sync
alter publication supabase_realtime add table public.leaderboard;
`;

export const SupabaseSettingsModal: React.FC<Props> = ({ isOpen, onClose, onConfigUpdated }) => {
  const currentConfig = supabaseService.getConfig();
  const [url, setUrl] = useState<string>(currentConfig.url);
  const [key, setKey] = useState<string>(currentConfig.key);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard?.writeText(SQL_SETUP_SCRIPT);
    sounds.playCapture();
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setTesting(true);
    setTestResult(null);

    const res = await supabaseService.testConnection(url, key);
    setTesting(false);
    setTestResult(res);

    if (res.success) {
      supabaseService.setConfig(url, key);
      onConfigUpdated();
      sounds.playLevelWin();
    } else {
      sounds.playBuzzer();
    }
  };

  const handleSaveWithoutTest = () => {
    sounds.playClick();
    supabaseService.setConfig(url, key);
    onConfigUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel-purple border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-display font-bold text-white tracking-wide">
                  Supabase Realtime Sync Settings
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  supabaseService.isConnected()
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}>
                  {supabaseService.isConnected() ? 'ONLINE & SYNCED' : 'LOCAL SIMULATED MESH'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Configure your Supabase project keys to link all 50 teams in real time
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
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6">
          {/* Credentials Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1">
                SUPABASE PROJECT URL:
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1">
                SUPABASE ANON KEY:
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono leading-relaxed ${
                  testResult.success
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                }`}
              >
                {testResult.message}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={testing}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Verifying Table...' : 'Test & Save Connection'}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveWithoutTest}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>

          {/* SQL Setup Script Section */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>Supabase SQL Setup Script</span>
              </div>
              <button
                onClick={handleCopySql}
                className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-300 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800 select-all">
              {SQL_SETUP_SCRIPT}
            </pre>
            <p className="text-[11px] text-slate-500 font-mono mt-2">
              Run this script once in your Supabase project&apos;s SQL Editor to provision the table and enable real-time replication for all 50 teams.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-display text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
