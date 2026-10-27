/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ArrowRight, Check, RotateCcw, Sparkles, Star, Trophy } from 'lucide-react';
import { LevelDefinition } from '../game/types';
import { TesseractVisual } from './TesseractVisual';

interface VictoryModalProps {
  level: LevelDefinition;
  moves: number;
  stars: number;
  isNewBest: boolean;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  moves,
  stars,
  isNewBest,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  // Bind Enter / Space to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (hasNextLevel) {
          onNextLevel();
        } else {
          onLevelSelect();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasNextLevel, onNextLevel, onLevelSelect]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl border border-cyan-500/40 bg-[#0d0f1a] p-6 shadow-2xl text-center flex flex-col items-center">
        {/* Decorative Mini-Tesseract Fanfare */}
        <div className="relative mb-2">
          <TesseractVisual size={120} speed={0.02} interactive={false} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Title Lockup */}
        <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-1">
          Dimensional Convergence
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#f4efe6] mb-1">
          {level.title} Clear
        </h2>
        <p className="text-xs text-white/60 mb-5">
          Conduit successfully established across folded dimensions.
        </p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <div
                key={`star-${starIdx}`}
                className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-all ${
                  isEarned
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                    : 'border-white/10 bg-white/5 text-white/20'
                }`}
              >
                <Star
                  className={`w-5 h-5 ${isEarned ? 'fill-cyan-400' : ''}`}
                />
              </div>
            );
          })}
        </div>

        {/* Performance Metrics Box */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.03] py-2.5 px-3">
            <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
              Moves Taken
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-[#f4efe6] tabular-nums">
                {moves}
              </span>
              <span className="text-[11px] font-mono text-white/40">
                / {level.parMoves} par
              </span>
            </div>
            {isNewBest && (
              <span className="text-[10px] font-semibold text-emerald-400 mt-0.5">
                New Record
              </span>
            )}
          </div>

          <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.03] py-2.5 px-3">
            <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
              Efficiency
            </span>
            <span className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
              {moves <= level.parMoves ? 'Optimal' : `+${moves - level.parMoves}`}
            </span>
            <span className="text-[10px] text-white/50 mt-0.5">
              {moves <= level.parMoves ? 'Flawless solution' : 'Completed'}
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="w-full flex flex-col gap-2">
          {hasNextLevel ? (
            <button
              type="button"
              data-start="true"
              onClick={onNextLevel}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Next Sector</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              data-start="true"
              onClick={onLevelSelect}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all"
            >
              <span>Grand Complete — Return to Map</span>
              <Trophy className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 w-full mt-1">
            <button
              type="button"
              onClick={onReplay}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
            <button
              type="button"
              onClick={onLevelSelect}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-colors"
            >
              <span>Level Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
