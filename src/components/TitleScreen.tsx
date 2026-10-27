/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ArrowRight, BookOpen, Layers, Sparkles } from 'lucide-react';
import { TesseractVisual } from './TesseractVisual';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenLevelSelect: () => void;
  onOpenHowToPlay: () => void;
  currentLevelId: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLevelSelect,
  onOpenHowToPlay,
  currentLevelId,
}) => {
  // Bind Enter and Space keys to start game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[92vh] w-full max-w-xl mx-auto px-4 py-8 animate-fade-in text-center">
      {/* Top Brand Subtitle */}
      <div className="flex flex-col items-center gap-1 mt-2">
        <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-cyan-400/90 font-semibold">
          High-Dimensional Geometric Puzzle
        </span>
      </div>

      {/* Hero Showcase Centerpiece */}
      <div className="flex flex-col items-center my-auto">
        <div className="relative mb-6">
          <TesseractVisual size={260} speed={0.009} interactive={true} />
          <div className="absolute inset-0 pointer-events-none rounded-full bg-cyan-500/5 blur-3xl -z-10" />
        </div>

        {/* Custom Geometric Title Lockup */}
        <div className="flex flex-col items-center mb-3">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-[#f4efe6] flex items-center justify-center font-sans">
            TESSARIA
          </h1>
          <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2 mb-3" />
          <p className="text-sm text-white/60 max-w-sm leading-relaxed">
            Manipulate two interconnected spatial layers. Rotate entangled conduits, trigger cross-dimensional flux gates, and master the 4D manifold.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col gap-2.5 w-full max-w-xs mt-4">
          <button
            type="button"
            data-start="true"
            onClick={onStartGame}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>{currentLevelId > 1 ? `Continue Sector #${currentLevelId}` : 'Enter Tessaria'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenLevelSelect}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sectors (18)</span>
            </button>

            <button
              type="button"
              onClick={onOpenHowToPlay}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Codex & Rules</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Safe Margin Control Hint */}
      <footer className="text-[11px] font-mono text-white/40 tracking-wider">
        Dual Spatial Layers · Entangled Rotors · Paired Dimensional Gates · Toroidal Wrap
      </footer>
    </div>
  );
};
