/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  DualLayerState,
  DualValidationResult,
  LayerId,
  LevelDefinition,
  PlayerAction,
} from '../game/types';
import { TileView } from './TileView';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  BookOpen,
  Info,
  Sparkles,
  X,
} from 'lucide-react';

interface DualGameBoardProps {
  level: LevelDefinition;
  state: DualLayerState;
  validation: DualValidationResult;
  activeLayer: LayerId;
  onSetActiveLayer: (layer: LayerId) => void;
  onPlayerAction: (action: PlayerAction) => void;
  onOpenEncyclopedia: (entryId?: string) => void;
  isLocked?: boolean;
  highlightAction?: PlayerAction | null;
}

export const DualGameBoard: React.FC<DualGameBoardProps> = ({
  level,
  state,
  validation,
  activeLayer,
  onSetActiveLayer,
  onPlayerAction,
  onOpenEncyclopedia,
  isLocked = false,
  highlightAction = null,
}) => {
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Sync intro when level changes
  useEffect(() => {
    setShowIntro(true);
  }, [level.id]);

  // Window resize tracking for responsive grids
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isCompactMobile = windowWidth < 400;

  const maxDim = Math.max(state.layerA.width, state.layerA.height);
  const tileSize = isMobile
    ? maxDim === 4
      ? isCompactMobile
        ? 52
        : 60
      : isCompactMobile
      ? 64
      : 74
    : maxDim === 4
    ? 62
    : 74;

  const gap = 6;

  const renderGridWithShifts = (layerId: LayerId) => {
    const layer = layerId === 'A' ? state.layerA : state.layerB;
    const res = layerId === 'A' ? validation.layerA : validation.layerB;
    const isLayerA = layerId === 'A';
    const isActive = activeLayer === layerId;

    return (
      <div
        className={`flex flex-col items-center transition-opacity duration-200 ${
          isActive ? 'opacity-100' : 'opacity-70 hover:opacity-90'
        }`}
        onClick={() => {
          if (!isActive) onSetActiveLayer(layerId);
        }}
      >
        {/* Layer Header Badge */}
        <div className="flex items-center justify-between w-full mb-2 px-1">
          <div className="flex items-center gap-1.5 cursor-pointer">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isLayerA ? 'bg-cyan-400' : 'bg-purple-400'
              } ${isActive ? 'ring-2 ring-white/50' : ''}`}
            />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-white/90">
              {layer.name}
            </span>
            {isActive && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                ACTIVE
              </span>
            )}
          </div>

          <span className="text-[10px] font-mono text-white/40">
            {res.reachedDestinations.size} / {res.destinationPositions.length} Cores
          </span>
        </div>

        {/* Board with Shift Indicators */}
        <div className="relative flex flex-col items-center">
          {/* Top Column Shift Buttons */}
          <div
            className="flex justify-between items-center mb-1"
            style={{ width: layer.width * tileSize + (layer.width - 1) * gap }}
          >
            {Array.from({ length: layer.width }).map((_, c) => {
              // Check if column has movable items
              let movableCount = 0;
              for (let r = 0; r < layer.height; r++) {
                const tile = layer.grid[r][c];
                if (!tile || tile.isMovable || tile.type === 'empty' || tile.type === 'gate') {
                  movableCount++;
                }
              }
              const canShift = movableCount >= 2;

              return (
                <div
                  key={`top-shift-${layerId}-${c}`}
                  style={{ width: tileSize }}
                  className="flex justify-center"
                >
                  {canShift && isActive && (
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayerAction({
                          type: 'shift_col',
                          layer: layerId,
                          col: c,
                          direction: -1, // Up
                        });
                      }}
                      className="p-1 rounded bg-white/5 hover:bg-white/20 text-white/60 hover:text-white transition-colors cursor-pointer"
                      title={`Shift Column ${c + 1} Up`}
                      aria-label={`Shift Column ${c + 1} Up`}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid and Left/Right Shift Buttons */}
          <div className="flex items-center">
            {/* Left Row Shift Buttons */}
            <div className="flex flex-col justify-between items-center mr-1" style={{ height: layer.height * tileSize + (layer.height - 1) * gap }}>
              {Array.from({ length: layer.height }).map((_, r) => {
                let movableCount = 0;
                for (let c = 0; c < layer.width; c++) {
                  const tile = layer.grid[r][c];
                  if (!tile || tile.isMovable || tile.type === 'empty' || tile.type === 'gate') {
                    movableCount++;
                  }
                }
                const canShift = movableCount >= 2;

                return (
                  <div
                    key={`left-shift-${layerId}-${r}`}
                    style={{ height: tileSize }}
                    className="flex items-center justify-center"
                  >
                    {canShift && isActive && (
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayerAction({
                            type: 'shift_row',
                            layer: layerId,
                            row: r,
                            direction: -1, // Left
                          });
                        }}
                        className="p-1 rounded bg-white/5 hover:bg-white/20 text-white/60 hover:text-white transition-colors cursor-pointer"
                        title={`Shift Row ${r + 1} Left`}
                        aria-label={`Shift Row ${r + 1} Left`}
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grid Surface */}
            <div
              className={`relative rounded-2xl border p-2.5 shadow-2xl backdrop-blur-sm transition-all ${
                isLayerA
                  ? isActive
                    ? 'border-cyan-400/60 bg-[#0d0f1a] ring-1 ring-cyan-400/40'
                    : 'border-cyan-500/20 bg-[#0d0f1a]/80'
                  : isActive
                  ? 'border-purple-400/60 bg-[#100d1a] ring-1 ring-purple-400/40'
                  : 'border-purple-500/20 bg-[#100d1a]/80'
              }`}
              style={{
                display: 'grid',
                gridTemplateRows: `repeat(${layer.height}, ${tileSize}px)`,
                gridTemplateColumns: `repeat(${layer.width}, ${tileSize}px)`,
                gap: `${gap}px`,
              }}
            >
              {layer.grid.map((rowTiles, r) =>
                rowTiles.map((tile, c) => {
                  const isEnergized = !!tile && res.energizedTileIds.has(tile.id);
                  const isLinkedHovered =
                    !!tile && !!tile.linkId && hoveredLinkId === tile.linkId;
                  const isRecommended =
                    highlightAction?.type === 'rotate' &&
                    highlightAction?.layer === layerId &&
                    highlightAction.row === r &&
                    highlightAction.col === c;

                  return (
                    <div
                      key={`tile-${layerId}-${r}-${c}`}
                      style={{ width: tileSize, height: tileSize }}
                      className={`relative ${
                        isRecommended ? 'ring-2 ring-cyan-400 rounded-xl animate-pulse' : ''
                      }`}
                      onMouseEnter={() => {
                        if (tile?.linkId) setHoveredLinkId(tile.linkId);
                      }}
                      onMouseLeave={() => setHoveredLinkId(null)}
                    >
                      <TileView
                        tile={tile}
                        size={tileSize}
                        isEnergized={isEnergized}
                        isLinkedPartnerHovered={isLinkedHovered}
                        layerId={layerId}
                        onRotate={() => {
                          if (!isLocked) {
                            onPlayerAction({
                              type: 'rotate',
                              layer: layerId,
                              row: r,
                              col: c,
                              direction: 1,
                            });
                          }
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Row Shift Buttons */}
            <div className="flex flex-col justify-between items-center ml-1" style={{ height: layer.height * tileSize + (layer.height - 1) * gap }}>
              {Array.from({ length: layer.height }).map((_, r) => {
                let movableCount = 0;
                for (let c = 0; c < layer.width; c++) {
                  const tile = layer.grid[r][c];
                  if (!tile || tile.isMovable || tile.type === 'empty' || tile.type === 'gate') {
                    movableCount++;
                  }
                }
                const canShift = movableCount >= 2;

                return (
                  <div
                    key={`right-shift-${layerId}-${r}`}
                    style={{ height: tileSize }}
                    className="flex items-center justify-center"
                  >
                    {canShift && isActive && (
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayerAction({
                            type: 'shift_row',
                            layer: layerId,
                            row: r,
                            direction: 1, // Right
                          });
                        }}
                        className="p-1 rounded bg-white/5 hover:bg-white/20 text-white/60 hover:text-white transition-colors cursor-pointer"
                        title={`Shift Row ${r + 1} Right`}
                        aria-label={`Shift Row ${r + 1} Right`}
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Column Shift Buttons */}
          <div
            className="flex justify-between items-center mt-1"
            style={{ width: layer.width * tileSize + (layer.width - 1) * gap }}
          >
            {Array.from({ length: layer.width }).map((_, c) => {
              let movableCount = 0;
              for (let r = 0; r < layer.height; r++) {
                const tile = layer.grid[r][c];
                if (!tile || tile.isMovable || tile.type === 'empty' || tile.type === 'gate') {
                  movableCount++;
                }
              }
              const canShift = movableCount >= 2;

              return (
                <div
                  key={`bottom-shift-${layerId}-${c}`}
                  style={{ width: tileSize }}
                  className="flex justify-center"
                >
                  {canShift && isActive && (
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayerAction({
                          type: 'shift_col',
                          layer: layerId,
                          col: c,
                          direction: 1, // Down
                        });
                      }}
                      className="p-1 rounded bg-white/5 hover:bg-white/20 text-white/60 hover:text-white transition-colors cursor-pointer"
                      title={`Shift Column ${c + 1} Down`}
                      aria-label={`Shift Column ${c + 1} Down`}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-2 select-none w-full max-w-4xl mx-auto">
      {/* Contextual Introduction Banner */}
      {level.contextualIntro && showIntro && (
        <div className="w-full max-w-2xl mb-4 p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md flex items-start justify-between gap-3 animate-fade-in text-xs">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">
                {level.contextualIntro.headline}
              </span>
              <p className="text-white/70 leading-relaxed">
                {level.contextualIntro.body}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {level.contextualIntro.pieceKey && (
              <button
                type="button"
                onClick={() => onOpenEncyclopedia(level.contextualIntro?.pieceKey)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-[10px] transition-colors cursor-pointer"
              >
                <BookOpen className="w-3 h-3" />
                <span>Codex Entry</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowIntro(false)}
              className="text-white/40 hover:text-white p-1"
              aria-label="Dismiss Note"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Layer Switcher Tabs (Always visible for quick toggling) */}
      <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-white/[0.04] border border-white/10 w-full max-w-xs">
        <button
          type="button"
          onClick={() => onSetActiveLayer('A')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeLayer === 'A'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span>Layer A (Alpha)</span>
        </button>
        <button
          type="button"
          onClick={() => onSetActiveLayer('B')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeLayer === 'B'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
          <span>Layer B (Beta)</span>
        </button>
      </div>

      {/* Boards Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 w-full">
        {(!isMobile || activeLayer === 'A') && (
          <div className="flex-1 flex justify-center animate-fade-in">
            {renderGridWithShifts('A')}
          </div>
        )}

        {/* Central 4D Dimensional Link Bridge (Desktop) */}
        {!isMobile && (
          <div className="flex flex-col items-center justify-center gap-2 px-2 text-white/30">
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-cyan-400/40 to-purple-400/40" />
            <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-2 text-center">
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
              <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase">
                4D Link
              </span>
            </div>
            <div className="h-12 w-px bg-gradient-to-b from-purple-400/40 via-cyan-400/40 to-transparent" />
          </div>
        )}

        {(!isMobile || activeLayer === 'B') && (
          <div className="flex-1 flex justify-center animate-fade-in">
            {renderGridWithShifts('B')}
          </div>
        )}
      </div>

      {/* Feedback Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-white/60">
        {hoveredLinkId ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-500/40 text-violet-300 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Entangled Link Active: Rotating this node rotates its counterpart across layers!</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-white/40">
            <span>Click conduit to rotate</span>
            <span>·</span>
            <span>Margin arrows shift row/col</span>
            <span>·</span>
            <span>[Tab] switches layer</span>
            <span>·</span>
            <span>[C] Codex</span>
          </div>
        )}
      </div>
    </div>
  );
};
