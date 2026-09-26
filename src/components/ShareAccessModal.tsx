import React, { useEffect, useRef, useState } from 'react';
import { QrCode, Copy, Check, ExternalLink, Download, Sparkles, X, Share2, Smartphone, Laptop, Users, Monitor } from 'lucide-react';
import QRCode from 'qrcode';
import { sounds } from '../services/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeaderboard?: () => void;
}

export const ShareAccessModal: React.FC<Props> = ({ isOpen, onClose, onOpenLeaderboard }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);

  // Compute the best shareable participant URL
  const getShareUrl = (): string => {
    if (typeof window !== 'undefined') {
      const loc = window.location;
      // In dev or preview environments, prefer the current origin without admin hash or query
      const base = loc.origin + loc.pathname;
      return base.replace(/\/$/, '');
    }
    return 'https://ais-pre-dr7srznjvzfjr5vepnihzx-173902379630.asia-east1.run.app';
  };

  const shareUrl = getShareUrl();

  // Render QR Code onto canvas whenever modal opens or mode changes
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        shareUrl,
        {
          width: isProjectorMode ? 320 : 220,
          margin: 2,
          color: {
            dark: '#030712',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        },
        (error) => {
          if (error) console.error('QR code generation failed:', error);
        }
      );
    }
  }, [isOpen, shareUrl, isProjectorMode]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    sounds.playCapture();
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    sounds.playClick();
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'digital-tech-hunt-qr.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleOpenLink = () => {
    sounds.playClick();
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full rounded-3xl glass-panel-purple border-2 border-cyan-400/50 shadow-[0_0_60px_rgba(6,182,212,0.35)] flex flex-col max-h-[92vh] overflow-hidden transition-all duration-300 ${
          isProjectorMode ? 'max-w-3xl' : 'max-w-2xl'
        }`}
      >
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800/90 flex items-center justify-between bg-slate-900/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Share2 className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-display font-bold text-white tracking-wide">
                  Share &amp; Participant Access
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  PUBLIC ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Share this link or QR code with all participants across phones &amp; laptops
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                setIsProjectorMode(!isProjectorMode);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isProjectorMode
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Projector / Big Screen Mode"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isProjectorMode ? 'Standard View' : 'Projector View'}</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1 min-h-0 text-slate-300 text-sm">
          {/* Main QR Code & Link Hero */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-950/70 p-5 rounded-2xl border border-cyan-500/30">
            {/* QR Code Canvas */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="p-3 bg-white rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] border-2 border-cyan-400">
                <canvas ref={canvasRef} className="block rounded-lg" />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleDownloadQr}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR</span>
                </button>
                <button
                  onClick={handleOpenLink}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Link</span>
                </button>
              </div>
            </div>

            {/* Direct Link & Quick Copy */}
            <div className="md:col-span-7 space-y-3">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  1. Official Participant URL
                </span>
                <p className="text-xs text-slate-400 mb-2">
                  Send this exact link to your participants via WhatsApp, Discord, Slack, or event group:
                </p>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="bg-transparent text-cyan-300 font-mono text-xs flex-1 outline-none select-all truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      copied
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED!' : 'COPY'}</span>
                  </button>
                </div>
              </div>

              {/* Quick WhatsApp / Telegram Share */}
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `🚀 Join the Digital Tech Treasure Hunt 2026! Open this link on your phone/laptop to register your squad and start competing: ${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900/90 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>💬 Share on WhatsApp</span>
                </a>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
                    `🚀 Digital Tech Treasure Hunt 2026 - Register and Launch:`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-sky-950/80 border border-sky-500/40 hover:bg-sky-900/90 text-sky-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>✈️ Share on Telegram</span>
                </a>
              </div>
            </div>
          </div>

          {/* How Participants Join: Simple 4-Step Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>How Participants Join on Their Own Devices</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center mb-2">
                  1
                </div>
                <div className="font-semibold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open URL or Scan</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Participants scan the QR code with phone camera or open the link in Chrome / Safari / Edge.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-bold text-xs flex items-center justify-center mb-2">
                  2
                </div>
                <div className="font-semibold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Select Squad Slot</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Each team selects an open slot (e.g. TEAM_01 to TEAM_50) or enters their custom squad ID.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs flex items-center justify-center mb-2">
                  3
                </div>
                <div className="font-semibold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Name &amp; Avatar</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter their Team Name (e.g. &quot;Byte Busters&quot;), pick a squad avatar, and click Launch!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center mb-2">
                  4
                </div>
                <div className="font-semibold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Supabase Sync</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Every station cleared and point earned updates live on the main leaderboard in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Organizer Advice & Projector Tip */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-900/70 border border-cyan-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-white block">
                Pro-Tip for Event Organizers &amp; Proctors:
              </span>
              <p className="text-slate-300 leading-relaxed">
                Connect your laptop to the main hall projector or big screen, switch to <strong>Projector View</strong> or open the <strong>Live Leaderboard</strong>. Keep it on screen throughout the competition so teams can watch the live Zero-G rankings change dynamically as stations are completed!
              </p>
              {onOpenLeaderboard && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLeaderboard();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/50 hover:bg-amber-500/30 text-amber-300 font-mono font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>🏆 Open Live Leaderboard For Projector</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] font-mono text-slate-400">
            Connected Project: <code className="text-cyan-300">nrqvpelwbyhzljbaoiop.supabase.co</code>
          </span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
