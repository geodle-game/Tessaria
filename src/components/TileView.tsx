/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TileNode } from '../game/types';
import { RotateCw, RotateCcw } from 'lucide-react';

interface TileViewProps {
  tile: TileNode | null;
  size: number;
  isEnergized?: boolean;
  isLinkedPartnerHovered?: boolean;
  onRotate?: () => void;
  className?: string;
  layerId: 'A' | 'B';
}

export const TileView: React.FC<TileViewProps> = ({
  tile,
  size,
  isEnergized = false,
  isLinkedPartnerHovered = false,
  onRotate,
  className = '',
  layerId,
}) => {
  const center = size / 2;
  const strokeWidth = Math.max(5, size * 0.13);
  const coreRadius = size * 0.17;
  const isLayerA = layerId === 'A';
  const layerAccent = isLayerA ? '#00f0ff' : '#c084fc';

  if (!tile || tile.type === 'empty') {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.015] ${className}`}
        style={{ width: size, height: size }}
        title="Vacuum Cell (Open transit space)"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
      </div>
    );
  }

  if (tile.type === 'wall') {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl border border-white/10 bg-[#0c0d14] shadow-inner ${className}`}
        style={{ width: size, height: size }}
        title="Null Barrier (Impassable)"
      >
        <div className="w-4 h-4 border border-white/20 rotate-45 bg-black/40" />
      </div>
    );
  }

  const { north, east, south, west } = tile.connections;
  const pathColor = isEnergized ? layerAccent : '#e8e2d5'; // Active accent when energized, warm ivory otherwise

  const glowShadow = isEnergized
    ? isLayerA
      ? '0 0 16px rgba(0, 240, 255, 0.6), inset 0 0 10px rgba(0, 240, 255, 0.3)'
      : '0 0 16px rgba(192, 132, 252, 0.6), inset 0 0 10px rgba(192, 132, 252, 0.3)'
    : isLinkedPartnerHovered
    ? '0 0 16px rgba(168, 85, 247, 0.7), inset 0 0 8px rgba(168, 85, 247, 0.4)'
    : 'none';

  return (
    <div
      onClick={tile.isRotatable ? onRotate : undefined}
      className={`group relative flex items-center justify-center rounded-xl select-none transition-all duration-200 ${
        tile.isRotatable ? 'cursor-pointer hover:scale-[1.03] active:scale-[0.97]' : ''
      } ${
        isLinkedPartnerHovered ? 'ring-2 ring-violet-400 border-violet-400 bg-violet-950/40' : ''
      } ${
        isEnergized
          ? isLayerA
            ? 'bg-[#0f1d2b] border-cyan-500/50'
            : 'bg-[#1b122c] border-purple-500/50'
          : tile.type === 'rotor' || tile.linkId
          ? 'bg-[#161424] hover:bg-[#1c1930] border-violet-500/30'
          : 'bg-[#141520] hover:bg-[#1a1b2a] border-white/10'
      } border ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: glowShadow,
      }}
      title={
        tile.type === 'source'
          ? 'Singularity Core'
          : tile.type === 'destination'
          ? 'Resonance Receptor'
          : tile.type === 'rotor'
          ? 'Entangled Rotor (Rotates counterpart)'
          : tile.type === 'gate'
          ? 'Dimensional Gate (Fold Aperture)'
          : 'Flux Conduit'
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="pointer-events-none"
      >
        {/* Conduits / Tracks */}
        <g
          stroke={pathColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {north && <line x1={center} y1={center} x2={center} y2={0} />}
          {east && <line x1={center} y1={center} x2={size} y2={center} />}
          {south && <line x1={center} y1={center} x2={center} y2={size} />}
          {west && <line x1={center} y1={center} x2={0} y2={center} />}
        </g>

        {/* Center node join */}
        {(north || east || south || west) && (
          <circle
            cx={center}
            cy={center}
            r={strokeWidth / 2}
            fill={pathColor}
          />
        )}

        {/* Edge connection pips */}
        {north && <circle cx={center} cy={2.5} r={2} fill={pathColor} />}
        {east && <circle cx={size - 2.5} cy={center} r={2} fill={pathColor} />}
        {south && <circle cx={center} cy={size - 2.5} r={2} fill={pathColor} />}
        {west && <circle cx={2.5} cy={center} r={2} fill={pathColor} />}

        {/* SOURCE Tile Icon */}
        {tile.type === 'source' && (
          <g>
            <circle
              cx={center}
              cy={center}
              r={coreRadius + 3}
              fill="#08080c"
              stroke="#00f0ff"
              strokeWidth="2"
            />
            <circle
              cx={center}
              cy={center}
              r={coreRadius - 2}
              fill="#00f0ff"
              className="animate-pulse"
            />
            <circle cx={center} cy={center} r={3} fill="#ffffff" />
          </g>
        )}

        {/* DESTINATION Tile Icon */}
        {tile.type === 'destination' && (
          <g>
            <rect
              x={center - coreRadius - 2}
              y={center - coreRadius - 2}
              width={(coreRadius + 2) * 2}
              height={(coreRadius + 2) * 2}
              rx={4}
              fill="#08080c"
              stroke={isEnergized ? '#00f0ff' : '#f59e0b'}
              strokeWidth="2"
            />
            <rect
              x={center - coreRadius + 3}
              y={center - coreRadius + 3}
              width={(coreRadius - 3) * 2}
              height={(coreRadius - 3) * 2}
              rx={2}
              fill={isEnergized ? '#00f0ff' : '#f59e0b'}
            />
            <circle cx={center} cy={center} r={2.5} fill="#08080c" />
          </g>
        )}

        {/* ROTOR Quantum Ring */}
        {tile.type === 'rotor' && (
          <g>
            <circle
              cx={center}
              cy={center}
              r={coreRadius + 2}
              fill="none"
              stroke="#c084fc"
              strokeWidth="1.5"
              strokeDasharray="3,2"
              className="animate-spin origin-center"
              style={{ animationDuration: '8s' }}
            />
            <circle cx={center} cy={center} r={coreRadius - 3} fill="#140f24" stroke="#c084fc" strokeWidth="1" />
          </g>
        )}

        {/* GATE Dimensional Aperture */}
        {tile.type === 'gate' && (
          <g>
            <polygon
              points={`
                ${center},${center - coreRadius - 4}
                ${center + coreRadius + 4},${center - coreRadius * 0.5}
                ${center + coreRadius + 4},${center + coreRadius * 0.5}
                ${center},${center + coreRadius + 4}
                ${center - coreRadius - 4},${center + coreRadius * 0.5}
                ${center - coreRadius - 4},${center - coreRadius * 0.5}
              `}
              fill="#0a0814"
              stroke="#a855f7"
              strokeWidth="1.5"
            />
            <circle
              cx={center}
              cy={center}
              r={coreRadius}
              fill="none"
              stroke="#e9d5ff"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <circle
              cx={center}
              cy={center}
              r={3.5}
              fill={isEnergized ? '#00f0ff' : '#a855f7'}
              className="animate-pulse"
            />
          </g>
        )}
      </svg>

      {/* Entangled Link Badge */}
      {tile.linkId && (
        <div
          className={`absolute -top-1.5 -right-1.5 flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[8px] font-mono font-bold shadow-md border ${
            tile.linkType === 'chiral'
              ? 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-500/50'
              : 'bg-violet-950 text-violet-300 border-violet-500/50'
          }`}
          title={`Dimensionally Entangled (${tile.linkType === 'chiral' ? 'Chiral ⟲' : 'Sync ⟳'})`}
        >
          {tile.linkType === 'chiral' ? (
            <RotateCcw className="w-2.5 h-2.5" />
          ) : (
            <RotateCw className="w-2.5 h-2.5" />
          )}
        </div>
      )}

      {/* Gate Badge */}
      {tile.type === 'gate' && (
        <div className="absolute -bottom-1 -left-1 flex items-center rounded bg-purple-950/90 border border-purple-500/40 px-1 text-[7px] font-mono text-purple-200">
          GATE Ω
        </div>
      )}

      {/* Rotatable Hover Cue */}
      {tile.isRotatable && (
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-60 transition-opacity">
          <RotateCw className="w-2.5 h-2.5 text-white/50" />
        </div>
      )}
    </div>
  );
};
