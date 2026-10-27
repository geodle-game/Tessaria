/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Direction = 'north' | 'east' | 'south' | 'west';

export interface Connections {
  north: boolean;
  east: boolean;
  south: boolean;
  west: boolean;
}

export type TileType =
  | 'path'          // Flux Conduit
  | 'rotor'         // Entangled / Linked Rotor
  | 'source'        // Singularity Core
  | 'destination'   // Resonance Receptor
  | 'gate'          // Paired Dimensional Gate
  | 'wall'          // Null Barrier
  | 'empty';        // Vacuum Cell

export type LinkType = 'sync' | 'chiral'; // sync = CW/CW, chiral = CW/CCW

export interface TileNode {
  id: string;
  type: TileType;
  connections: Connections;
  isRotatable: boolean;
  isMovable: boolean; // movable by row/column shifts (true for path tiles, false for source/dest/gate/wall)
  // Entangled link across layers
  linkId?: string;
  linkType?: LinkType;
  // Dimensional Gate properties
  gateId?: string;
  pairedGateId?: string;
  gateTargetLayer?: LayerId;
  gateTargetRow?: number;
  gateTargetCol?: number;
  gateRotationDelta?: 1 | -1 | 0 | 2; // default +1 (90° CW on transfer)
}

export type LayerId = 'A' | 'B';

export interface LayerState {
  id: LayerId;
  name: string;
  width: number;
  height: number;
  grid: (TileNode | null)[][];
}

export interface DualLayerState {
  layerA: LayerState;
  layerB: LayerState;
}

export interface LayerValidationResult {
  sourcePositions: { row: number; col: number }[];
  destinationPositions: { row: number; col: number }[];
  energizedTileIds: Set<string>;
  reachedDestinations: Set<string>;
  activeGates: Set<string>;
}

export interface DualValidationResult {
  layerA: LayerValidationResult;
  layerB: LayerValidationResult;
  isComplete: boolean;
  totalObjectives: number;
  completedObjectives: number;
}

export type PlayerActionType = 'rotate' | 'shift_row' | 'shift_col';

export interface RotateAction {
  type: 'rotate';
  layer: LayerId;
  row: number;
  col: number;
  direction?: 1 | -1; // 1 = 90° CW (default), -1 = 90° CCW
  timestamp?: number;
}

export interface ShiftRowAction {
  type: 'shift_row';
  layer: LayerId;
  row: number;
  direction: 1 | -1; // 1 = right, -1 = left
  timestamp?: number;
}

export interface ShiftColAction {
  type: 'shift_col';
  layer: LayerId;
  col: number;
  direction: 1 | -1; // 1 = down, -1 = up
  timestamp?: number;
}

export type PlayerAction = RotateAction | ShiftRowAction | ShiftColAction;

export interface HistoryStep {
  state: DualLayerState;
  moves: number;
  lastAction?: PlayerAction;
  description?: string;
}

export interface LevelDesignDoc {
  mechanicTested: string;
  intendedSolution: string;
  whySolutionWorks: string;
  constraints: string;
  alternativeSolutions: string;
  solvabilityCheck: string;
  redundancyCheck: string;
}

export interface LevelDefinition {
  id: number;
  chapter: 1 | 2 | 3;
  chapterTitle: string;
  title: string;
  subtitle: string;
  description: string;
  conceptBadge: string;
  width: number;
  height: number;
  parMoves: number;
  contextualIntro?: {
    headline: string;
    body: string;
    pieceKey?: string;
  };
  designDoc: LevelDesignDoc;
  layerA: {
    name?: string;
    tiles: (TileNodeConfig | null)[][];
  };
  layerB?: {
    name?: string;
    tiles: (TileNodeConfig | null)[][];
  };
}

export interface TileNodeConfig {
  id?: string;
  type: TileType;
  connections: Direction[] | Connections;
  isRotatable?: boolean;
  isMovable?: boolean;
  linkId?: string;
  linkType?: LinkType;
  gateId?: string;
  pairedGateId?: string;
  gateTargetLayer?: LayerId;
  gateTargetRow?: number;
  gateTargetCol?: number;
  gateRotationDelta?: 1 | -1 | 0 | 2;
}

export interface LevelProgress {
  completed: boolean;
  bestMoves: number;
  stars: number;
  unlocked: boolean;
}

export interface UserProgressData {
  levels: Record<number, LevelProgress>;
  currentLevelId: number;
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface EncyclopediaEntry {
  id: string;
  name: string;
  category: 'core' | 'conduit' | 'anomaly' | 'boundary';
  accentColor: string;
  oneSentence: string;
  rules: string[];
  cannotDo: string[];
  interactsWith: string[];
  validExample: {
    title: string;
    description: string;
    diagramType: string;
  };
  invalidExample: {
    title: string;
    description: string;
    diagramType: string;
  };
}
