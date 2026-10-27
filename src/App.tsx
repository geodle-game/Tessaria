/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  DualLayerState,
  DualValidationResult,
  HistoryStep,
  LayerId,
  LevelDefinition,
  PlayerAction,
  UserProgressData,
} from './game/types';
import { LEVELS } from './game/levels';
import {
  buildLayerFromConfig,
  evaluateDualCircuit,
  executePlayerAction,
  solveDualPuzzle,
} from './game/rules';
import {
  getDefaultProgress,
  loadProgress,
  recordLevelSuccess,
  saveProgress,
} from './game/storage';
import { sound } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { ChapterSelect } from './components/ChapterSelect';
import { Hud } from './components/Hud';
import { DualGameBoard } from './components/DualGameBoard';
import { VictoryModal } from './components/VictoryModal';
import { SettingsModal } from './components/SettingsModal';
import { EncyclopediaModal } from './components/EncyclopediaModal';

type AppScreen = 'title' | 'select' | 'playing';

function initDualStateForLevel(level: LevelDefinition): DualLayerState {
  const emptyBGrid = Array.from({ length: level.height }, () =>
    Array.from({ length: level.width }, () => null)
  );

  return {
    layerA: buildLayerFromConfig('A', level.layerA.name || 'Layer A · Alpha Manifold', level.layerA.tiles),
    layerB: buildLayerFromConfig(
      'B',
      level.layerB?.name || 'Layer B · Beta Hyperplane',
      level.layerB?.tiles || emptyBGrid
    ),
  };
}

export default function App() {
  const [progress, setProgress] = useState<UserProgressData>(() => loadProgress());
  const [screen, setScreen] = useState<AppScreen>('title');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [activeLayer, setActiveLayer] = useState<LayerId>('A');

  const currentLevel = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];
  const [dualState, setDualState] = useState<DualLayerState>(() =>
    initDualStateForLevel(currentLevel)
  );
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showVictory, setShowVictory] = useState<boolean>(false);
  const [victoryStats, setVictoryStats] = useState<{
    stars: number;
    isNewBest: boolean;
  }>({ stars: 0, isNewBest: false });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showEncyclopedia, setShowEncyclopedia] = useState<boolean>(false);
  const [encyclopediaEntryId, setEncyclopediaEntryId] = useState<string | undefined>(undefined);
  const [hintStep, setHintStep] = useState<number>(0);
  const [hintAction, setHintAction] = useState<PlayerAction | null>(null);

  // Sound sync
  useEffect(() => {
    sound.setEnabled(progress.soundEnabled);
  }, [progress.soundEnabled]);

  // Autostart handler from query params (?autostart=1 or ?level=X)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        const targetLvl = parseInt(params.get('level') || '1', 10);
        const validId = Math.max(1, Math.min(LEVELS.length, isNaN(targetLvl) ? 1 : targetLvl));
        loadLevel(validId);
        setScreen('playing');
      }
    }
  }, []);

  // Sync state to body dataset
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (showVictory) {
      document.body.dataset.state = 'gameover';
    } else if (showSettings || showEncyclopedia) {
      document.body.dataset.state = 'paused';
    } else {
      document.body.dataset.state = screen;
    }
  }, [screen, showVictory, showSettings, showEncyclopedia]);

  // Load a specific level
  const loadLevel = useCallback((levelId: number) => {
    const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    setCurrentLevelId(level.id);
    setActiveLayer('A');
    const initialDual = initDualStateForLevel(level);
    setDualState(initialDual);
    setHistory([{ state: initialDual, moves: 0 }]);
    setMoves(0);
    setShowVictory(false);
    setHintStep(0);
    setHintAction(null);
    setIsLocked(false);
  }, []);

  // Current circuit evaluation
  const validation: DualValidationResult = evaluateDualCircuit(dualState);

  // Check victory condition
  useEffect(() => {
    if (validation.isComplete && !showVictory && screen === 'playing' && moves > 0) {
      sound.playVictory();
      setIsLocked(true);

      const timer = setTimeout(() => {
        const { progress: updated, isNewBest, stars } = recordLevelSuccess(
          currentLevel.id,
          moves,
          currentLevel.parMoves
        );
        setProgress(updated);
        setVictoryStats({ stars, isNewBest });
        setShowVictory(true);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [validation.isComplete, showVictory, screen, moves, currentLevel]);

  // Execute unified player action (rotations and row/col shifts)
  const handlePlayerAction = useCallback(
    (action: PlayerAction) => {
      if (isLocked || showVictory) return;

      const { nextState, note } = executePlayerAction(dualState, action);

      if (note && note.includes('Entangled')) {
        sound.playGateTwist(); // Entangled chime
      } else if (note && note.includes('Transfer')) {
        sound.playGateTwist(); // Dimensional gate fold chime
      } else if (action.type === 'rotate') {
        sound.playShift(action.direction);
      } else {
        sound.playShift(action.direction > 0 ? 1 : -1);
      }

      // Check if a new gate opened or new destination was reached
      const nextValidation = evaluateDualCircuit(nextState);
      if (
        nextValidation.completedObjectives > validation.completedObjectives &&
        !nextValidation.isComplete
      ) {
        sound.playConnect();
      }

      const nextMoves = moves + 1;
      setMoves(nextMoves);
      setDualState(nextState);
      setHistory((prev) => [
        ...prev,
        { state: nextState, moves: nextMoves, lastAction: action },
      ]);

      // Clear hint if matched
      if (
        hintAction &&
        hintAction.type === action.type &&
        hintAction.layer === action.layer
      ) {
        if (
          (action.type === 'rotate' && hintAction.type === 'rotate' && hintAction.row === action.row && hintAction.col === action.col) ||
          (action.type === 'shift_row' && hintAction.type === 'shift_row' && hintAction.row === action.row) ||
          (action.type === 'shift_col' && hintAction.type === 'shift_col' && hintAction.col === action.col)
        ) {
          setHintStep(0);
          setHintAction(null);
        }
      } else if (hintStep > 0) {
        setHintStep(0);
        setHintAction(null);
      }
    },
    [dualState, isLocked, showVictory, moves, validation, hintAction, hintStep]
  );

  // Undo move
  const handleUndo = useCallback(() => {
    if (history.length <= 1 || isLocked || showVictory) return;
    sound.playUndo();

    const newHistory = history.slice(0, -1);
    const lastStep = newHistory[newHistory.length - 1];

    setDualState(lastStep.state);
    setMoves(lastStep.moves);
    setHistory(newHistory);
    setHintStep(0);
    setHintAction(null);
  }, [history, isLocked, showVictory]);

  // Restart level
  const handleRestart = useCallback(() => {
    sound.playClick();
    loadLevel(currentLevel.id);
  }, [loadLevel, currentLevel.id]);

  // Open Encyclopedia
  const handleOpenEncyclopedia = useCallback((entryId?: string) => {
    sound.playClick();
    setEncyclopediaEntryId(entryId);
    setShowEncyclopedia(true);
  }, []);

  // Progressive Hint using BFS Solver
  const handleHint = useCallback(() => {
    sound.playClick();
    if (hintStep === 0) {
      const solution = solveDualPuzzle(dualState, 6);
      if (solution && solution.length > 0) {
        setHintAction(solution[0]);
        setHintStep(1); // Highlights recommended action
      }
    } else {
      setHintStep(0);
      setHintAction(null);
    }
  }, [hintStep, dualState]);

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    const nextVal = !progress.soundEnabled;
    const updated = { ...progress, soundEnabled: nextVal };
    setProgress(updated);
    saveProgress(updated);
  }, [progress]);

  // Reduced motion toggle
  const handleToggleReducedMotion = useCallback(() => {
    const nextVal = !progress.reducedMotion;
    const updated = { ...progress, reducedMotion: nextVal };
    setProgress(updated);
    saveProgress(updated);
  }, [progress]);

  // Reset all progress
  const handleResetAllProgress = useCallback(() => {
    const defaults = getDefaultProgress();
    setProgress(defaults);
    saveProgress(defaults);
    loadLevel(1);
    setScreen('title');
  }, [loadLevel]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (showEncyclopedia) {
          setShowEncyclopedia(false);
        } else {
          setShowSettings((prev) => !prev);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleSound();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setShowEncyclopedia((prev) => !prev);
      } else if (screen === 'playing') {
        if (e.key === 'Tab') {
          e.preventDefault();
          setActiveLayer((prev) => (prev === 'A' ? 'B' : 'A'));
          sound.playClick();
        } else if (e.key === 'z' || e.key === 'Z' || e.key === 'u' || e.key === 'U') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          handleRestart();
        } else if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          handleHint();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, showEncyclopedia, handleUndo, handleRestart, handleHint, handleToggleSound]);

  // Advancing to next level from Victory modal
  const handleNextLevel = () => {
    sound.playClick();
    const nextId = currentLevel.id + 1;
    if (nextId <= LEVELS.length) {
      loadLevel(nextId);
    } else {
      setScreen('select');
      setShowVictory(false);
    }
  };

  const currentLevelProgress = progress.levels[currentLevel.id] || {
    bestMoves: 0,
    stars: 0,
    completed: false,
    unlocked: true,
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-[#f4efe6] flex flex-col items-center justify-between overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* SCREEN 1: TITLE */}
      {screen === 'title' && (
        <TitleScreen
          currentLevelId={currentLevelId}
          onStartGame={() => {
            sound.playClick();
            loadLevel(currentLevelId);
            setScreen('playing');
          }}
          onOpenLevelSelect={() => {
            sound.playClick();
            setScreen('select');
          }}
          onOpenHowToPlay={() => {
            handleOpenEncyclopedia();
          }}
        />
      )}

      {/* SCREEN 2: CHAPTER & LEVEL SELECT */}
      {screen === 'select' && (
        <ChapterSelect
          progress={progress}
          onSelectLevel={(id) => {
            sound.playClick();
            loadLevel(id);
            setScreen('playing');
          }}
          onBackToTitle={() => {
            sound.playClick();
            setScreen('title');
          }}
        />
      )}

      {/* SCREEN 3: ACTIVE PUZZLE */}
      {screen === 'playing' && (
        <main className="w-full flex flex-col items-center justify-between min-h-screen py-2">
          <Hud
            level={currentLevel}
            moves={moves}
            bestMoves={currentLevelProgress.bestMoves}
            completedObjectives={validation.completedObjectives}
            totalObjectives={validation.totalObjectives}
            canUndo={history.length > 1}
            onUndo={handleUndo}
            onRestart={handleRestart}
            onHint={handleHint}
            onOpenSettings={() => setShowSettings(true)}
            onOpenEncyclopedia={() => handleOpenEncyclopedia()}
            soundEnabled={progress.soundEnabled}
            onToggleSound={handleToggleSound}
            hintStep={hintStep}
          />

          <div className="flex-1 flex flex-col items-center justify-center my-auto w-full px-2">
            <DualGameBoard
              level={currentLevel}
              state={dualState}
              validation={validation}
              activeLayer={activeLayer}
              onSetActiveLayer={setActiveLayer}
              onPlayerAction={handlePlayerAction}
              onOpenEncyclopedia={handleOpenEncyclopedia}
              isLocked={isLocked}
              highlightAction={hintStep >= 1 ? hintAction : null}
            />
          </div>
        </main>
      )}

      {/* VICTORY MODAL */}
      {showVictory && (
        <VictoryModal
          level={currentLevel}
          moves={moves}
          stars={victoryStats.stars}
          isNewBest={victoryStats.isNewBest}
          hasNextLevel={currentLevel.id < LEVELS.length}
          onNextLevel={handleNextLevel}
          onReplay={() => {
            sound.playClick();
            loadLevel(currentLevel.id);
          }}
          onLevelSelect={() => {
            sound.playClick();
            setShowVictory(false);
            setScreen('select');
          }}
        />
      )}

      {/* PAUSE / SETTINGS MODAL */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
        reducedMotion={progress.reducedMotion}
        onToggleReducedMotion={handleToggleReducedMotion}
        onRestartLevel={() => {
          handleRestart();
          setShowSettings(false);
        }}
        onGoToLevelSelect={() => {
          setShowSettings(false);
          setScreen('select');
        }}
        onResetAllProgress={handleResetAllProgress}
        onOpenEncyclopedia={() => {
          setShowSettings(false);
          handleOpenEncyclopedia();
        }}
      />

      {/* ENCYCLOPEDIA CODEX MODAL */}
      <EncyclopediaModal
        isOpen={showEncyclopedia}
        onClose={() => setShowEncyclopedia(false)}
        initialEntryId={encyclopediaEntryId}
      />
    </div>
  );
}
