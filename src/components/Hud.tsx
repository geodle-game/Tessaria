/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Pause, RotateCcw, Undo2, Volume2, VolumeX, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';
import { LevelDefinition } from '../game/types';

interface HudProps {
  level: LevelDefinition;
  moves: number;
  bestMoves: number;
  completedObjectives: number;
  totalObjectives: number;
  canUndo: boolean;
  onUndo: () => void;
  onRestart: () => void;
  onHint: () => void;
  onOpenSettings: () => void;
  onOpenEncyclopedia: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hintStep: number;
}

export const Hud: React.FC<HudProps> = ({
  level,
  moves,
  bestMoves,
  completedObjectives,
  totalObjectives,
  canUndo,
  onUndo,
  onRestart,
  onHint,
  onOpenSettings,
  onOpenEncyclopedia,
  soundEnabled,
  onToggleSound,
  hintStep,
}) => {
  return (
    <header className="w-full max-w-3xl mx-auto px-4 py-2 flex flex-col gap-2">
      {/* Top Bar: Chapter, Level Title, Concept Badge & Utility Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              {level.chapterTitle}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300">
              {level.conceptBadge}
            </span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-[#f4efe6] flex items-center gap-2 mt-0.5">
            <span>{level.title}</span>
            <span className="text-xs font-mono font-normal text-white/40">
              #{level.id}
            </span>
          </h1>
        </div>

        {/* Quick Utility Icon Dock */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenEncyclopedia}
            tabIndex={-1}
            className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 hover:text-cyan-200 transition-colors text-xs font-mono font-medium cursor-pointer"
            title="Open Tessaria Codex [C]"
            aria-label="Open Tessaria Codex"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Codex</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            tabIndex={-1}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Audio [M]' : 'Unmute Audio [M]'}
            aria-label={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/40" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            tabIndex={-1}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Pause & Settings [Esc]"
            aria-label="Pause & Settings"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Strip & Control Dock */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#12131f] px-3.5 py-2 shadow-inner">
        {/* Moves, Par & Objectives Readout */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-wider uppercase text-white/50">
              Moves
            </span>
            <span
              className={`text-lg font-mono font-bold tabular-nums leading-none ${
                moves <= level.parMoves ? 'text-cyan-400' : 'text-amber-400'
              }`}
            >
              {moves}
            </span>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-wider uppercase text-white/40">
              Par
            </span>
            <span className="text-sm font-mono font-semibold text-white/70 tabular-nums leading-tight">
              {level.parMoves}
            </span>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-wider uppercase text-white/40">
              Cores
            </span>
            <div className="flex items-center gap-1 leading-tight">
              <span className="text-sm font-mono font-semibold text-cyan-300 tabular-nums">
                {completedObjectives}/{totalObjectives}
              </span>
              {completedObjectives === totalObjectives && totalObjectives > 0 && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
          </div>

          {bestMoves > 0 && (
            <>
              <div className="hidden sm:block h-6 w-px bg-white/10" />
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] font-mono tracking-wider uppercase text-white/40">
                  Best
                </span>
                <span className="text-sm font-mono font-semibold text-emerald-400 tabular-nums leading-tight">
                  {bestMoves}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Tactical Controls: Undo, Restart, Hint */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              canUndo
                ? 'border-white/10 bg-white/5 hover:bg-white/15 text-white/90 hover:text-white cursor-pointer'
                : 'border-white/5 bg-transparent text-white/20 cursor-not-allowed'
            }`}
            title="Undo last move [Z or U]"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-white/90 hover:text-white text-xs font-medium transition-all cursor-pointer"
            title="Restart level [R]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={onHint}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              hintStep > 0
                ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 ring-1 ring-cyan-400'
                : 'border-white/10 bg-white/5 hover:bg-white/15 text-white/90 hover:text-white'
            }`}
            title={hintStep === 0 ? 'Request Hint [H]' : 'Clear Hint [H]'}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">
              {hintStep === 0 ? 'Hint' : 'Active'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
