/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Check, Lock, Play, Star, Trophy } from 'lucide-react';
import { UserProgressData } from '../game/types';
import { LEVELS } from '../game/levels';

interface ChapterSelectProps {
  progress: UserProgressData;
  onSelectLevel: (levelId: number) => void;
  onBackToTitle: () => void;
}

export const ChapterSelect: React.FC<ChapterSelectProps> = ({
  progress,
  onSelectLevel,
  onBackToTitle,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<1 | 2 | 3>(1);

  const chapters = [
    {
      id: 1 as const,
      numeral: 'I',
      name: 'Foundations',
      desc: 'Linear conduits, corners, junctions, row & column shifts, and edge wrapping',
    },
    {
      id: 2 as const,
      numeral: 'II',
      name: 'Connections',
      desc: 'Cross-layer reasoning, Entangled Rotors, and Paired Dimensional Gates',
    },
    {
      id: 3 as const,
      numeral: 'III',
      name: 'Paradoxes',
      desc: 'High-dimensional paradoxes, multi-phase states, and grand synthesis',
    },
  ];

  const currentChapterLevels = LEVELS.filter((l) => l.chapter === selectedChapter);

  let totalStars = 0;
  let totalCompleted = 0;
  Object.values(progress.levels).forEach((l) => {
    totalStars += l.stars || 0;
    if (l.completed) totalCompleted++;
  });

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6 animate-fade-in">
      {/* Top Navigation & Status */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToTitle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Title</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-mono font-medium text-amber-400 bg-amber-950/30 border border-amber-800/40 px-2.5 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{totalStars} / 54</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono font-medium text-cyan-400 bg-cyan-950/30 border border-cyan-800/40 px-2.5 py-1 rounded-full">
            <Trophy className="w-3.5 h-3.5" />
            <span>{totalCompleted} / 18 Solved</span>
          </div>
        </div>
      </div>

      {/* Chapter Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {chapters.map((ch) => {
          const chLevels = LEVELS.filter((l) => l.chapter === ch.id);
          const chSolved = chLevels.filter((l) => progress.levels[l.id]?.completed).length;
          const isSelected = selectedChapter === ch.id;

          return (
            <button
              key={`chapter-tab-${ch.id}`}
              type="button"
              onClick={() => setSelectedChapter(ch.id)}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-cyan-400 bg-[#121c2c] ring-1 ring-cyan-400/50 shadow-md'
                  : 'border-white/10 bg-[#0f101a] hover:bg-[#141624] text-white/70'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400">
                  Chapter {ch.numeral}
                </span>
                <span className="text-[11px] font-mono text-white/50">
                  {chSolved}/{chLevels.length}
                </span>
              </div>
              <span className="text-sm font-bold text-[#f4efe6] mb-0.5">{ch.name}</span>
              <span className="text-[11px] text-white/40 line-clamp-1">{ch.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Levels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {currentChapterLevels.map((level) => {
          const lvlData = progress.levels[level.id] || {
            completed: false,
            bestMoves: 0,
            stars: 0,
            unlocked: level.id === 1,
          };

          return (
            <button
              key={`level-card-${level.id}`}
              type="button"
              disabled={!lvlData.unlocked}
              onClick={() => onSelectLevel(level.id)}
              className={`group relative flex flex-col p-4 rounded-xl border transition-all text-left ${
                !lvlData.unlocked
                  ? 'border-white/5 bg-white/[0.01] opacity-40 cursor-not-allowed'
                  : lvlData.completed
                  ? 'border-cyan-500/30 bg-[#0e1724] hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer'
                  : 'border-white/10 bg-[#121420] hover:border-white/30 hover:bg-[#171929] cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-white/50 group-hover:text-cyan-400 transition-colors">
                  #{level.id}
                </span>
                {lvlData.unlocked ? (
                  lvlData.completed ? (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= lvlData.stars
                              ? 'text-cyan-400 fill-cyan-400'
                              : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <Play className="w-3.5 h-3.5 text-white/40 group-hover:text-cyan-400 transition-colors" />
                  )
                ) : (
                  <Lock className="w-3.5 h-3.5 text-white/30" />
                )}
              </div>

              <span className="text-sm font-semibold text-[#f4efe6] mb-1 line-clamp-1">
                {level.title}
              </span>

              <span className="text-[11px] font-mono text-cyan-400/80 mb-2">
                {level.conceptBadge}
              </span>

              <div className="flex items-center justify-between text-[11px] font-mono text-white/40 mt-auto pt-2 border-t border-white/5">
                <span>Par: {level.parMoves}</span>
                {lvlData.bestMoves > 0 && (
                  <span className="text-emerald-400">Best: {lvlData.bestMoves}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
