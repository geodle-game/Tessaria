/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Link as LinkIcon,
  Minimize2,
  Radio,
  RotateCw,
  ShieldAlert,
  Sparkles,
  Square,
  X,
  XCircle,
  Zap,
} from 'lucide-react';

export interface EncyclopediaEntryData {
  id: string;
  name: string;
  subtitle: string;
  category: 'Emitter / Receiver' | 'Conduit' | 'Trans-Dimensional' | 'Barrier';
  accentColor: string;
  badge: string;
  oneSentence: string;
  rules: string[];
  cannotDo: string[];
  interactsWith: string[];
  validExample: {
    title: string;
    description: string;
  };
  invalidExample: {
    title: string;
    description: string;
  };
}

export const ENCYCLOPEDIA_ENTRIES: EncyclopediaEntryData[] = [
  {
    id: 'source',
    name: 'Singularity Core',
    subtitle: 'Primary Energy Origin',
    category: 'Emitter / Receiver',
    accentColor: '#00f0ff',
    badge: 'CORE',
    oneSentence: 'The fixed dimensional origin that continuously emits high-frequency energy along its open output conduits.',
    rules: [
      'Emits energy strictly in the direction of its designated output ports.',
      'Must connect directly to a matching opening on an adjacent conduit or gate.',
      'Remains anchored to the manifold; cannot be shifted by row or column displacements.',
      'Cannot be manually rotated unless explicitly designated by sector protocols.',
    ],
    cannotDo: [
      'Cannot emit energy through a solid Null Barrier.',
      'Cannot bridge diagonally or connect across mismatched edges.',
      'Cannot be relocated by row/column shifting.',
    ],
    interactsWith: ['Flux Conduit', 'Entangled Rotor', 'Dimensional Gate'],
    validExample: {
      title: 'Valid Connection',
      description: 'Core output aligns flush with adjacent conduit opening, allowing signal to flow freely.',
    },
    invalidExample: {
      title: 'Mismatched Edge',
      description: 'Core faces a closed edge or perpendicular track. Energy cannot penetrate.',
    },
  },

  {
    id: 'destination',
    name: 'Resonance Receptor',
    subtitle: 'Dimensional Termination Core',
    category: 'Emitter / Receiver',
    accentColor: '#f59e0b',
    badge: 'RECEPTOR',
    oneSentence: 'The unpowered target chamber that illuminates into resonance when a valid continuous circuit reaches it from the Singularity.',
    rules: [
      'Activates only when energy successfully traverses from the source to its receiving port.',
      'In multi-receptor sectors, all required receptors across both layers must be energized simultaneously.',
      'Anchored to the manifold; cannot be shifted or displaced.',
      'A path merely touching the border of the tile is insufficient; matching edge connectivity is required.',
    ],
    cannotDo: [
      'Cannot activate if any intermediate connection in the chain is broken.',
      'Cannot be moved into another row or column.',
      'Cannot generate its own power.',
    ],
    interactsWith: ['Flux Conduit', 'Entangled Rotor', 'Dimensional Gate'],
    validExample: {
      title: 'Resonant Closure',
      description: 'Incoming conduit opening matches receptor input port. The core ignites with gold resonance.',
    },
    invalidExample: {
      title: 'Broken Transmission',
      description: 'A conduit is turned away by 90°. Energy halts, leaving the receptor unpowered.',
    },
  },

  {
    id: 'path',
    name: 'Flux Conduit',
    subtitle: 'Modular Geometric Track',
    category: 'Conduit',
    accentColor: '#38bdf8',
    badge: 'PATH',
    oneSentence: 'Conductive track tiles (Straight, Corner, T-Junction, Cross) that transport the dimensional beam between adjacent nodes.',
    rules: [
      'Energy flows through the tile only between connected matching sides (North, East, South, West).',
      'Rotatable conduits turn 90° clockwise upon player interaction (1 move).',
      'Movable conduits shift laterally along rows or vertically along columns with toroidal edge wrapping.',
      'Corners redirect energy 90°; T-junctions split energy into multiple simultaneous directions.',
    ],
    cannotDo: [
      'Cannot conduct energy diagonally.',
      'Cannot connect to an adjacent cell if that neighbor does not have a matching open opening.',
      'Cannot rotate if marked as fixed.',
    ],
    interactsWith: ['Singularity Core', 'Resonance Receptor', 'Entangled Rotor', 'Dimensional Gate'],
    validExample: {
      title: 'Flush Conduction',
      description: 'Two adjacent conduits share matching openings on their common boundary, conducting beam continuously.',
    },
    invalidExample: {
      title: 'Perpendicular Dead-End',
      description: 'Conduit opening abuts a flat, unopened side of an adjacent tile, terminating signal.',
    },
  },

  {
    id: 'rotor',
    name: 'Entangled Rotor',
    subtitle: 'Cross-Layer Quantum Conduit',
    category: 'Trans-Dimensional',
    accentColor: '#c084fc',
    badge: 'LINK ⟳',
    oneSentence: 'A quantum-entangled conduit paired across layers: rotating one rotor immediately and identically rotates its partner on the opposite manifold.',
    rules: [
      'Player clicks to rotate the rotor by 90° clockwise (counts as 1 move).',
      'The paired rotor on the other layer immediately turns in unison (0 extra moves).',
      'Reversible through Undo; restoring prior state restores both rotors synchronously.',
      'Conduits on both layers must be configured to accommodate the shared rotation.',
    ],
    cannotDo: [
      'Cannot be rotated independently of its entangled partner.',
      'Cannot shift positions during row/column shifts (anchored to manifold).',
      'Cannot teleport across layers.',
    ],
    interactsWith: ['Singularity Core', 'Flux Conduit', 'Dimensional Gate', 'Resonance Receptor'],
    validExample: {
      title: 'Harmonic Sync',
      description: 'Rotating Rotor α on Layer A aligns with source, simultaneously turning Rotor α on Layer B to reach receptor.',
    },
    invalidExample: {
      title: 'Phase Conflict',
      description: 'Rotating the rotor fixes Layer A, but leaves Layer B misaligned. A prior row shift is needed to harmonize both.',
    },
  },

  {
    id: 'gate',
    name: 'Dimensional Gate',
    subtitle: 'Paired Hyperplane Aperture',
    category: 'Trans-Dimensional',
    accentColor: '#a855f7',
    badge: 'GATE Ω',
    oneSentence: 'A trans-dimensional aperture that transfers physical conduits across the fold into the opposite layer, and conducts energy beams directly through the 4D bridge.',
    rules: [
      'Each gate is permanently paired with a specific gate on the other layer (Gate Ω-A ↔ Gate Ω-B).',
      'When a conduit is shifted into a gate, it emerges at the paired gate in the other layer, rotated by 90° clockwise.',
      'If the target destination cell on the opposite layer is occupied, the transfer aborts safely without tile loss or duplication.',
      'Energy entering a gate in Layer A conducts through the fold and emerges from the paired gate in Layer B.',
    ],
    cannotDo: [
      'Cannot transfer tiles if the target cell is blocked by a wall or occupied tile.',
      'Cannot delete or clone tiles under any condition.',
      'Cannot silently teleport tiles outside of explicit shift actions.',
    ],
    interactsWith: ['Flux Conduit', 'Entangled Rotor', 'Null Barrier'],
    validExample: {
      title: 'Fold Passage',
      description: 'Conduit shifted into Gate Ω on Layer A transfers across the manifold, landing rotated on Layer B.',
    },
    invalidExample: {
      title: 'Obstructed Transfer',
      description: 'Paired gate cell in Layer B contains an immovable obstacle. Conduit safely remains on Layer A.',
    },
  },

  {
    id: 'wall',
    name: 'Null Barrier',
    subtitle: 'Impassive Monolith',
    category: 'Barrier',
    accentColor: '#64748b',
    badge: 'BARRIER',
    oneSentence: 'A dense, impenetrable barrier that permanently blocks energy paths and prevents conduit placement.',
    rules: [
      'Completely non-conductive; absorbs all incoming signal without reflection.',
      'Impassable by shifting conduits; defines the rigid boundaries of the circuit matrix.',
      'Fixed in position; never rotates or shifts.',
    ],
    cannotDo: [
      'Cannot be passed through, rotated, or shifted.',
      'Cannot conduct or transmit energy under any condition.',
    ],
    interactsWith: ['None (Blocks all)'],
    validExample: {
      title: 'Defensive Perimeter',
      description: 'Defines the structural routing perimeter, requiring player to navigate through open channels.',
    },
    invalidExample: {
      title: 'Beam Absorption',
      description: 'Pointing a beam directly into a Null Barrier absorbs the energy, failing to reach the receptor.',
    },
  },

  {
    id: 'empty',
    name: 'Vacuum Cell',
    subtitle: 'Dimensional Void',
    category: 'Conduit',
    accentColor: '#475569',
    badge: 'VOID',
    oneSentence: 'An unoccupied spatial coordinate capable of receiving movable conduits during row and column shifts.',
    rules: [
      'Contains no conduit and carries no signal.',
      'Acts as an open slot for sliding conduits during row/column shifts.',
      'Can accept incoming tiles transferred through Dimensional Gates.',
    ],
    cannotDo: [
      'Cannot transmit or store energy.',
      'Cannot connect to adjacent conduits.',
    ],
    interactsWith: ['Flux Conduit (as open receiver slot)'],
    validExample: {
      title: 'Open Transit Slot',
      description: 'Provides space for a conduit to slide into place without obstruction.',
    },
    invalidExample: {
      title: 'Conductance Gap',
      description: 'Attempting to send an energy beam into empty space drops the signal completely.',
    },
  },
];

interface EncyclopediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEntryId?: string;
}

export const EncyclopediaModal: React.FC<EncyclopediaModalProps> = ({
  isOpen,
  onClose,
  initialEntryId,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialEntryId || ENCYCLOPEDIA_ENTRIES[0].id
  );

  if (!isOpen) return null;

  const currentEntry =
    ENCYCLOPEDIA_ENTRIES.find((e) => e.id === selectedId) || ENCYCLOPEDIA_ENTRIES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Tessaria Piece Codex"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#090b14] border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 overflow-hidden text-[#f4efe6]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e111d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-mono tracking-wide text-white">
                  TESSARIA CODEX
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
                  Authoritative Rulebook
                </span>
              </div>
              <p className="text-xs text-white/50">
                Official specifications for all dimensional pieces, physics & mechanics
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Codex"
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Sidebar & Detail View */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          {/* Piece Navigation Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#0a0d18] overflow-y-auto p-3 flex md:flex-col gap-1.5 shrink-0">
            {ENCYCLOPEDIA_ENTRIES.map((entry) => {
              const isSelected = entry.id === currentEntry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedId(entry.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer whitespace-nowrap md:whitespace-normal ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-sm'
                      : 'border-transparent hover:bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.accentColor }}
                    />
                    <span className="text-xs font-semibold">{entry.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-white/40 border border-white/10 px-1.5 py-0.5 rounded">
                    {entry.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed Entry Specifications */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 bg-gradient-to-b from-[#090b14] to-[#07080f]">
            {/* Header info */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border"
                    style={{
                      borderColor: `${currentEntry.accentColor}66`,
                      color: currentEntry.accentColor,
                      backgroundColor: `${currentEntry.accentColor}15`,
                    }}
                  >
                    {currentEntry.category}
                  </span>
                  <span className="text-xs font-mono text-white/40">{currentEntry.badge}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {currentEntry.name}
                </h3>
                <p className="text-xs font-mono text-cyan-400/80">{currentEntry.subtitle}</p>
              </div>

              {/* Interacts With Pill Group */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-white/40 block mb-1">
                  Interacts With
                </span>
                <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                  {currentEntry.interactsWith.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* One-Sentence Summary */}
            <div
              className="p-3.5 rounded-xl border bg-black/30 text-sm leading-relaxed text-white/90"
              style={{ borderColor: `${currentEntry.accentColor}44` }}
            >
              <strong className="text-white block text-xs font-mono uppercase tracking-wide mb-1 opacity-70">
                Core Function
              </strong>
              {currentEntry.oneSentence}
            </div>

            {/* Rules & Limitations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Authorized Rules */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide mb-2.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Governing Laws</span>
                </div>
                <ul className="space-y-2 text-xs text-white/80">
                  {currentEntry.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400/80 mt-0.5">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Absolute Prohibitions */}
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/10">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400 uppercase tracking-wide mb-2.5">
                  <XCircle className="w-4 h-4" />
                  <span>Physical Limitations</span>
                </div>
                <ul className="space-y-2 text-xs text-white/80">
                  {currentEntry.cannotDo.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400/80 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Visual Behavior Comparison */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
                Behavioral Demonstrations
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Valid Demonstration */}
                <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-[#0e1422] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {currentEntry.validExample.title}
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      CORRECT
                    </span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {currentEntry.validExample.description}
                  </p>
                </div>

                {/* Invalid Demonstration */}
                <div className="p-3.5 rounded-xl border border-white/10 bg-[#120f17] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-white/60">
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      {currentEntry.invalidExample.title}
                    </span>
                    <span className="text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                      BLOCKED
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {currentEntry.invalidExample.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-[#0a0d18] text-xs font-mono text-white/40">
          <span>Row/Col Shifts · Linked Rotors · Paired Dimensional Gates</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 font-semibold transition-colors cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
