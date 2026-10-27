/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProgressData } from './types';
import { LEVELS } from './levels';

const STORAGE_KEY = 'tessaria_dual_progress_v2';

export function getDefaultProgress(): UserProgressData {
  const levelsRecord: UserProgressData['levels'] = {};

  for (const level of LEVELS) {
    levelsRecord[level.id] = {
      completed: false,
      bestMoves: 0,
      stars: 0,
      unlocked: level.id === 1,
    };
  }

  return {
    levels: levelsRecord,
    currentLevelId: 1,
    soundEnabled: true,
    reducedMotion: false,
  };
}

export function loadProgress(): UserProgressData {
  if (typeof window === 'undefined') return getDefaultProgress();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();

    const parsed = JSON.parse(raw);
    const defaults = getDefaultProgress();

    const merged: UserProgressData = {
      ...defaults,
      ...parsed,
      levels: { ...defaults.levels, ...(parsed.levels || {}) },
    };

    if (merged.levels[1]) {
      merged.levels[1].unlocked = true;
    }

    return merged;
  } catch (err) {
    console.warn('Failed to parse saved progress, restoring defaults', err);
    return getDefaultProgress();
  }
}

export function saveProgress(data: UserProgressData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to write progress to localStorage', err);
  }
}

export function recordLevelSuccess(
  levelId: number,
  moves: number,
  parMoves: number
): { progress: UserProgressData; isNewBest: boolean; stars: number } {
  const progress = loadProgress();
  const current = progress.levels[levelId] || {
    completed: false,
    bestMoves: 0,
    stars: 0,
    unlocked: true,
  };

  let stars = 1;
  if (moves <= parMoves) {
    stars = 3;
  } else if (moves <= parMoves + 2) {
    stars = 2;
  }

  const isNewBest = current.bestMoves === 0 || moves < current.bestMoves;
  const bestMoves = current.bestMoves === 0 ? moves : Math.min(current.bestMoves, moves);
  const highestStars = Math.max(current.stars, stars);

  progress.levels[levelId] = {
    completed: true,
    bestMoves,
    stars: highestStars,
    unlocked: true,
  };

  // Unlock next level
  const nextLevelId = levelId + 1;
  if (progress.levels[nextLevelId]) {
    progress.levels[nextLevelId].unlocked = true;
  }

  saveProgress(progress);
  return { progress, isNewBest, stars: highestStars };
}
