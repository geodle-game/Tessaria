/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Eye,
  Sliders,
  HelpCircle,
  Home,
  Check,
  ArrowRightLeft,
  BookOpen,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onRestartLevel: () => void;
  onGoToLevelSelect: () => void;
  onResetAllProgress: () => void;
  onOpenEncyclopedia?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  reducedMotion,
  onToggleReducedMotion,
  onRestartLevel,
  onGoToLevelSelect,
  onResetAllProgress,
  onOpenEncyclopedia,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'guide'>('settings');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0f1a] p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-lg font-bold text-[#f4efe6]">System & Rules</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white cursor-pointer"
            aria-label="Close Settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/[0.04] p-1 border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Settings & Navigation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            How to Play
          </button>
        </div>

        {/* TAB 1: SETTINGS */}
        {activeTab === 'settings' ? (
          <div className="flex flex-col gap-4">
            {/* Open Codex Button */}
            {onOpenEncyclopedia && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEncyclopedia();
                }}
                className="flex items-center justify-between p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-bold font-mono">Tessaria Piece Codex</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400/70 border border-cyan-500/30 px-2 py-0.5 rounded">
                  View Rules
                </span>
              </button>
            )}

            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-white/40" />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#f4efe6]">Sound Synthesis</span>
                  <span className="text-xs text-white/40">Synthesizer chimes & audio cues</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleSound}
                className={`relative inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  soundEnabled ? 'bg-cyan-500' : 'bg-white/20'
                }`}
                aria-label="Toggle Sound"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-cyan-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#f4efe6]">Reduced Motion</span>
                  <span className="text-xs text-white/40">Disable slide and rotation animations</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleReducedMotion}
                className={`relative inline-flex h-6 w-12 items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  reducedMotion ? 'bg-cyan-500' : 'bg-white/20'
                }`}
                aria-label="Toggle Reduced Motion"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                    reducedMotion ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* In-Game Actions */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  onRestartLevel();
                  onClose();
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Sector</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onGoToLevelSelect();
                  onClose();
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Level Select</span>
              </button>
            </div>

            {/* Reset Progress */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="text-xs text-white/40 hover:text-red-400 transition-colors text-left cursor-pointer"
                >
                  Clear Saved Progress
                </button>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-red-500/30 bg-red-950/20 text-xs">
                  <span className="text-red-300">Reset all progress and records?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onResetAllProgress();
                        setConfirmReset(false);
                      }}
                      className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-2 py-1 rounded border border-white/10 hover:bg-white/10 text-white/70 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: HOW TO PLAY */
          <div className="flex flex-col gap-3.5 text-xs text-white/80 leading-relaxed">
            <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
              <div className="font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span>The Dual Manifold</span>
              </div>
              <p className="text-white/70">
                Puzzles operate across Layer A (Cyan) and Layer B (Violet). Switch layers at any time without spending moves. Both layers share a unified state.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-950/20">
              <div className="font-semibold text-purple-400 mb-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>Move System</span>
              </div>
              <p className="text-white/70">
                Click a conduit to rotate it 90° (1 move). Click margin arrows to shift entire rows or columns (1 move). Tiles wrap seamlessly around board edges.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-violet-500/30 bg-violet-950/20">
              <div className="font-semibold text-violet-300 mb-1 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-violet-400" />
                <span>Entangled Rotors & Dimensional Gates</span>
              </div>
              <p className="text-white/70">
                Entangled Rotors (marked ⟳) share rotation across layers: rotating one turns its counterpart immediately. Dimensional Gates transfer physical conduits across the fold and conduct energy beams through the 4th dimension.
              </p>
            </div>

            <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-[11px] font-mono text-white/50">
              Hotkeys: <span className="text-white">Tab</span> Switch Layer · <span className="text-white">Z/U</span> Undo · <span className="text-white">R</span> Restart · <span className="text-white">H</span> Hint · <span className="text-white">C</span> Codex
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs tracking-wide transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            Resume Sector
          </button>
        </div>
      </div>
    </div>
  );
};
