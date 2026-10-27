/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Connections,
  Direction,
  DualLayerState,
  DualValidationResult,
  LayerId,
  LayerState,
  LayerValidationResult,
  PlayerAction,
  RotateAction,
  ShiftColAction,
  ShiftRowAction,
  TileNode,
  TileNodeConfig,
} from './types';

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

export const DIRECTION_DELTA: Record<Direction, { dr: number; dc: number }> = {
  north: { dr: -1, dc: 0 },
  south: { dr: 1, dc: 0 },
  east: { dr: 0, dc: 1 },
  west: { dr: 0, dc: -1 },
};

export function normalizeConnections(input: Direction[] | Connections): Connections {
  if (Array.isArray(input)) {
    return {
      north: input.includes('north'),
      east: input.includes('east'),
      south: input.includes('south'),
      west: input.includes('west'),
    };
  }
  return {
    north: !!input.north,
    east: !!input.east,
    south: !!input.south,
    west: !!input.west,
  };
}

export function rotateConnections(
  conn: Connections,
  direction: 1 | -1 | 0 | 2 = 1
): Connections {
  if (direction === 0) return { ...conn };
  if (direction === 2) {
    return {
      north: conn.south,
      east: conn.west,
      south: conn.north,
      west: conn.east,
    };
  }
  if (direction === 1) {
    // 90° Clockwise: North -> East, East -> South, South -> West, West -> North
    return {
      north: conn.west,
      east: conn.north,
      south: conn.east,
      west: conn.south,
    };
  } else {
    // 90° Counter-Clockwise: North -> West, West -> South, South -> East, East -> North
    return {
      north: conn.east,
      east: conn.south,
      south: conn.west,
      west: conn.north,
    };
  }
}

export function createTileNode(config: TileNodeConfig, defaultId: string): TileNode {
  // Anchored structures that do not move during row/col shifts:
  const isAnchored =
    config.type === 'source' ||
    config.type === 'destination' ||
    config.type === 'wall' ||
    config.type === 'rotor';

  return {
    id: config.id || defaultId,
    type: config.type,
    connections: normalizeConnections(config.connections),
    isRotatable: config.isRotatable ?? (config.type === 'rotor' || config.type === 'path'),
    isMovable: config.isMovable ?? !isAnchored,
    linkId: config.linkId,
    linkType: config.linkType || 'sync',
    gateId: config.gateId,
    pairedGateId: config.pairedGateId,
    gateTargetLayer: config.gateTargetLayer,
    gateTargetRow: config.gateTargetRow,
    gateTargetCol: config.gateTargetCol,
    gateRotationDelta: config.gateRotationDelta ?? 1,
  };
}

export function buildLayerFromConfig(
  id: LayerId,
  name: string,
  configs: (TileNodeConfig | null)[][]
): LayerState {
  const height = configs.length;
  const width = height > 0 ? configs[0].length : 0;
  const grid: (TileNode | null)[][] = [];

  for (let r = 0; r < height; r++) {
    const row: (TileNode | null)[] = [];
    for (let c = 0; c < width; c++) {
      const cfg = configs[r][c];
      if (cfg) {
        const defaultId = `${id}_${r}_${c}_${cfg.type}`;
        row.push(createTileNode(cfg, defaultId));
      } else {
        row.push(null);
      }
    }
    grid.push(row);
  }

  return { id, name, width, height, grid };
}

export function cloneLayer(layer: LayerState): LayerState {
  return {
    id: layer.id,
    name: layer.name,
    width: layer.width,
    height: layer.height,
    grid: layer.grid.map((row) =>
      row.map((tile) => {
        if (!tile) return null;
        return {
          ...tile,
          connections: { ...tile.connections },
        };
      })
    ),
  };
}

export function cloneDualState(state: DualLayerState): DualLayerState {
  return {
    layerA: cloneLayer(state.layerA),
    layerB: cloneLayer(state.layerB),
  };
}

/**
 * Rotates a node at (row, col) in the specified layer.
 * If the node has an entangled link, simultaneously updates its counterpart in the other layer.
 */
export function executeNodeRotation(
  state: DualLayerState,
  action: RotateAction
): { nextState: DualLayerState; rotatedTileIds: string[]; triggeredLinkId?: string } {
  const nextState = cloneDualState(state);
  const activeLayer = action.layer === 'A' ? nextState.layerA : nextState.layerB;
  const otherLayer = action.layer === 'A' ? nextState.layerB : nextState.layerA;

  const targetTile = activeLayer.grid[action.row]?.[action.col];
  if (!targetTile || !targetTile.isRotatable) {
    return { nextState: state, rotatedTileIds: [] };
  }

  const rotDir = action.direction ?? 1;
  targetTile.connections = rotateConnections(targetTile.connections, rotDir);
  const rotatedTileIds: string[] = [targetTile.id];
  let triggeredLinkId: string | undefined = undefined;

  // Propagate to linked counterpart in the other layer
  if (targetTile.linkId) {
    triggeredLinkId = targetTile.linkId;
    const linkType = targetTile.linkType || 'sync';
    const otherDir = linkType === 'chiral' ? (rotDir === 1 ? -1 : 1) : rotDir;

    for (let r = 0; r < otherLayer.height; r++) {
      for (let c = 0; c < otherLayer.width; c++) {
        const otherTile = otherLayer.grid[r][c];
        if (otherTile && otherTile.linkId === targetTile.linkId) {
          otherTile.connections = rotateConnections(otherTile.connections, otherDir as 1 | -1);
          rotatedTileIds.push(otherTile.id);
        }
      }
    }
  }

  return { nextState, rotatedTileIds, triggeredLinkId };
}

/**
 * Shifts an entire row left or right with toroidal wrap-around.
 * Movable conduits slide across open slots and through Dimensional Gates.
 */
export function executeRowShift(
  state: DualLayerState,
  action: ShiftRowAction
): { nextState: DualLayerState; shiftedTileIds: string[]; transferOccurred: boolean } {
  const nextState = cloneDualState(state);
  const activeLayer = action.layer === 'A' ? nextState.layerA : nextState.layerB;

  const r = action.row;
  if (r < 0 || r >= activeLayer.height) {
    return { nextState: state, shiftedTileIds: [], transferOccurred: false };
  }

  const width = activeLayer.width;
  const dir = action.direction; // 1 = right, -1 = left
  const currentRow = activeLayer.grid[r];

  // Movable tracks: empty cells, movable conduits, and dimensional gates (which can receive conduits)
  const movableIndices: number[] = [];
  for (let c = 0; c < width; c++) {
    const tile = currentRow[c];
    if (!tile || tile.isMovable || tile.type === 'empty' || tile.type === 'gate') {
      movableIndices.push(c);
    }
  }

  if (movableIndices.length < 2) {
    return { nextState: state, shiftedTileIds: [], transferOccurred: false };
  }

  const shiftedTileIds: string[] = [];
  let transferOccurred = false;

  // Extract movable slice
  const slice: (TileNode | null)[] = movableIndices.map((idx) => currentRow[idx]);
  const n = slice.length;
  const shiftedSlice: (TileNode | null)[] = new Array(n);

  for (let i = 0; i < n; i++) {
    const targetIdx = (i + (dir === 1 ? 1 : -1) + n) % n;
    shiftedSlice[targetIdx] = slice[i];
  }

  // Put shifted tiles back and process gate transfers
  for (let i = 0; i < n; i++) {
    const colIdx = movableIndices[i];
    let tile = shiftedSlice[i];
    const originalFixture = currentRow[colIdx];

    if (tile && tile.type !== 'gate') {
      shiftedTileIds.push(tile.id);

      // Check if moving into a paired Dimensional Gate
      if (originalFixture && originalFixture.type === 'gate' && originalFixture.gateTargetLayer) {
        const tLayer = originalFixture.gateTargetLayer === 'A' ? nextState.layerA : nextState.layerB;
        const tRow = originalFixture.gateTargetRow ?? r;
        const tCol = originalFixture.gateTargetCol ?? colIdx;

        const destOccupant = tLayer.grid[tRow]?.[tCol];
        const isFree =
          !destOccupant ||
          destOccupant.type === 'empty' ||
          (destOccupant.type === 'gate' && (!destOccupant.connections.north && !destOccupant.connections.east && !destOccupant.connections.south && !destOccupant.connections.west));

        if (isFree) {
          // Transfer to target layer
          tile = {
            ...tile,
            connections: rotateConnections(tile.connections, originalFixture.gateRotationDelta ?? 1),
          };
          tLayer.grid[tRow][tCol] = tile;
          activeLayer.grid[r][colIdx] = originalFixture; // keep gate in place
          transferOccurred = true;
          continue;
        }
      }
    }

    // If target position is a gate and no tile transferred into it, retain the gate fixture
    if (originalFixture && originalFixture.type === 'gate' && (!tile || tile.type === 'empty')) {
      activeLayer.grid[r][colIdx] = originalFixture;
    } else {
      activeLayer.grid[r][colIdx] = tile;
    }
  }

  return { nextState, shiftedTileIds, transferOccurred };
}

/**
 * Shifts an entire column up or down with toroidal wrap-around.
 */
export function executeColShift(
  state: DualLayerState,
  action: ShiftColAction
): { nextState: DualLayerState; shiftedTileIds: string[]; transferOccurred: boolean } {
  const nextState = cloneDualState(state);
  const activeLayer = action.layer === 'A' ? nextState.layerA : nextState.layerB;

  const c = action.col;
  if (c < 0 || c >= activeLayer.width) {
    return { nextState: state, shiftedTileIds: [], transferOccurred: false };
  }

  const height = activeLayer.height;
  const dir = action.direction; // 1 = down, -1 = up

  const movableIndices: number[] = [];
  for (let r = 0; r < height; r++) {
    const tile = activeLayer.grid[r][c];
    if (!tile || tile.isMovable || tile.type === 'empty' || tile.type === 'gate') {
      movableIndices.push(r);
    }
  }

  if (movableIndices.length < 2) {
    return { nextState: state, shiftedTileIds: [], transferOccurred: false };
  }

  const shiftedTileIds: string[] = [];
  let transferOccurred = false;

  const slice: (TileNode | null)[] = movableIndices.map((idx) => activeLayer.grid[idx][c]);
  const n = slice.length;
  const shiftedSlice: (TileNode | null)[] = new Array(n);

  for (let i = 0; i < n; i++) {
    const targetIdx = (i + (dir === 1 ? 1 : -1) + n) % n;
    shiftedSlice[targetIdx] = slice[i];
  }

  for (let i = 0; i < n; i++) {
    const rowIdx = movableIndices[i];
    let tile = shiftedSlice[i];
    const originalFixture = activeLayer.grid[rowIdx][c];

    if (tile && tile.type !== 'gate') {
      shiftedTileIds.push(tile.id);

      if (originalFixture && originalFixture.type === 'gate' && originalFixture.gateTargetLayer) {
        const tLayer = originalFixture.gateTargetLayer === 'A' ? nextState.layerA : nextState.layerB;
        const tRow = originalFixture.gateTargetRow ?? rowIdx;
        const tCol = originalFixture.gateTargetCol ?? c;

        const destOccupant = tLayer.grid[tRow]?.[tCol];
        const isFree =
          !destOccupant ||
          destOccupant.type === 'empty' ||
          (destOccupant.type === 'gate' && (!destOccupant.connections.north && !destOccupant.connections.east && !destOccupant.connections.south && !destOccupant.connections.west));

        if (isFree) {
          tile = {
            ...tile,
            connections: rotateConnections(tile.connections, originalFixture.gateRotationDelta ?? 1),
          };
          tLayer.grid[tRow][tCol] = tile;
          activeLayer.grid[rowIdx][c] = originalFixture;
          transferOccurred = true;
          continue;
        }
      }
    }

    if (originalFixture && originalFixture.type === 'gate' && (!tile || tile.type === 'empty')) {
      activeLayer.grid[rowIdx][c] = originalFixture;
    } else {
      activeLayer.grid[rowIdx][c] = tile;
    }
  }

  return { nextState, shiftedTileIds, transferOccurred };
}

/**
 * Universal player action dispatcher
 */
export function executePlayerAction(
  state: DualLayerState,
  action: PlayerAction
): { nextState: DualLayerState; affectedTileIds: string[]; note?: string } {
  if (action.type === 'rotate') {
    const res = executeNodeRotation(state, action);
    return {
      nextState: res.nextState,
      affectedTileIds: res.rotatedTileIds,
      note: res.triggeredLinkId ? `Entangled Link ${res.triggeredLinkId} Synchronized` : undefined,
    };
  } else if (action.type === 'shift_row') {
    const res = executeRowShift(state, action);
    return {
      nextState: res.nextState,
      affectedTileIds: res.shiftedTileIds,
      note: res.transferOccurred ? 'Dimensional Gate Transfer' : undefined,
    };
  } else if (action.type === 'shift_col') {
    const res = executeColShift(state, action);
    return {
      nextState: res.nextState,
      affectedTileIds: res.shiftedTileIds,
      note: res.transferOccurred ? 'Dimensional Gate Transfer' : undefined,
    };
  }
  return { nextState: state, affectedTileIds: [] };
}

/**
 * Evaluates full energy flow across Layer A and Layer B.
 * Follows graph traversal from Sources to Destinations.
 * Validates matching openings on shared edges and conducts through paired Dimensional Gates.
 */
export function evaluateDualCircuit(state: DualLayerState): DualValidationResult {
  const resA: LayerValidationResult = {
    sourcePositions: [],
    destinationPositions: [],
    energizedTileIds: new Set<string>(),
    reachedDestinations: new Set<string>(),
    activeGates: new Set<string>(),
  };

  const resB: LayerValidationResult = {
    sourcePositions: [],
    destinationPositions: [],
    energizedTileIds: new Set<string>(),
    reachedDestinations: new Set<string>(),
    activeGates: new Set<string>(),
  };

  interface BFSNode {
    layerId: LayerId;
    row: number;
    col: number;
  }

  const visitedA = new Set<string>();
  const visitedB = new Set<string>();
  const queue: BFSNode[] = [];

  // Register sources and destinations
  for (const layer of [state.layerA, state.layerB]) {
    const isA = layer.id === 'A';
    const res = isA ? resA : resB;
    const visited = isA ? visitedA : visitedB;

    for (let r = 0; r < layer.height; r++) {
      for (let c = 0; c < layer.width; c++) {
        const tile = layer.grid[r][c];
        if (!tile) continue;
        if (tile.type === 'source') {
          res.sourcePositions.push({ row: r, col: c });
          res.energizedTileIds.add(tile.id);
          visited.add(`${r},${c}`);
          queue.push({ layerId: layer.id, row: r, col: c });
        } else if (tile.type === 'destination') {
          res.destinationPositions.push({ row: r, col: c });
        }
      }
    }
  }

  const directions: Direction[] = ['north', 'east', 'south', 'west'];

  while (queue.length > 0) {
    const { layerId, row, col } = queue.shift()!;
    const curLayer = layerId === 'A' ? state.layerA : state.layerB;
    const curRes = layerId === 'A' ? resA : resB;
    const curTile = curLayer.grid[row][col];
    if (!curTile) continue;

    // Paired Dimensional Gate cross-manifold conduction
    if (curTile.type === 'gate' && curTile.gateTargetLayer) {
      curRes.activeGates.add(curTile.id);
      const otherLayerId = curTile.gateTargetLayer;
      const otherLayer = otherLayerId === 'A' ? state.layerA : state.layerB;
      const otherRes = otherLayerId === 'A' ? resA : resB;
      const otherVisited = otherLayerId === 'A' ? visitedA : visitedB;
      const targetR = curTile.gateTargetRow ?? row;
      const targetC = curTile.gateTargetCol ?? col;

      const targetGate = otherLayer.grid[targetR]?.[targetC];
      if (targetGate && targetGate.type === 'gate') {
        const gateKey = `${targetR},${targetC}`;
        if (!otherVisited.has(gateKey)) {
          otherVisited.add(gateKey);
          otherRes.energizedTileIds.add(targetGate.id);
          otherRes.activeGates.add(targetGate.id);
          queue.push({ layerId: otherLayerId, row: targetR, col: targetC });
        }
      }
    }

    // Traverse adjacent neighbours
    for (const dir of directions) {
      if (!curTile.connections[dir]) continue;

      const delta = DIRECTION_DELTA[dir];
      const nr = row + delta.dr;
      const nc = col + delta.dc;

      if (nr < 0 || nr >= curLayer.height || nc < 0 || nc >= curLayer.width) {
        continue;
      }

      const nextTile = curLayer.grid[nr][nc];
      if (!nextTile) continue;

      if (nextTile.type === 'wall' || nextTile.type === 'empty') continue;

      const oppDir = OPPOSITE_DIRECTION[dir];
      if (!nextTile.connections[oppDir]) continue;

      const nextKey = `${nr},${nc}`;
      const visited = layerId === 'A' ? visitedA : visitedB;

      if (!visited.has(nextKey)) {
        visited.add(nextKey);
        curRes.energizedTileIds.add(nextTile.id);

        if (nextTile.type === 'destination') {
          curRes.reachedDestinations.add(nextTile.id);
        }

        queue.push({ layerId, row: nr, col: nc });
      }
    }
  }

  let totalObjectives = 0;
  let completedObjectives = 0;

  for (const layer of [state.layerA, state.layerB]) {
    for (let r = 0; r < layer.height; r++) {
      for (let c = 0; c < layer.width; c++) {
        const tile = layer.grid[r][c];
        if (tile && tile.type === 'destination') {
          totalObjectives++;
          const reached = layer.id === 'A' ? resA.reachedDestinations : resB.reachedDestinations;
          if (reached.has(tile.id)) {
            completedObjectives++;
          }
        }
      }
    }
  }

  const isComplete = totalObjectives > 0 && completedObjectives === totalObjectives;

  return {
    layerA: resA,
    layerB: resB,
    isComplete,
    totalObjectives,
    completedObjectives,
  };
}

/**
 * Compact state serializer for BFS validation
 */
export function serializeDualState(state: DualLayerState): string {
  const serializeLayer = (l: LayerState) =>
    l.grid
      .map((row) =>
        row
          .map((t) => {
            if (!t) return '.';
            const c = t.connections;
            const mask =
              (c.north ? 1 : 0) |
              (c.east ? 2 : 0) |
              (c.south ? 4 : 0) |
              (c.west ? 8 : 0);
            return `${t.type[0]}${t.id[0]}${mask}`;
          })
          .join('')
      )
      .join('/');

  return `${serializeLayer(state.layerA)}|${serializeLayer(state.layerB)}`;
}

/**
 * Comprehensive breadth-first search validator & hint generator.
 */
export function solveDualPuzzle(
  initialState: DualLayerState,
  maxDepth: number = 6
): PlayerAction[] | null {
  const initialEval = evaluateDualCircuit(initialState);
  if (initialEval.isComplete) {
    return [];
  }

  interface QueueItem {
    state: DualLayerState;
    moves: PlayerAction[];
  }

  const queue: QueueItem[] = [{ state: initialState, moves: [] }];
  const visited = new Set<string>();
  visited.add(serializeDualState(initialState));

  while (queue.length > 0) {
    const { state, moves } = queue.shift()!;
    if (moves.length >= maxDepth) continue;

    // Enumerate legal actions from current state
    const candidateActions: PlayerAction[] = [];

    for (const layer of [state.layerA, state.layerB]) {
      // 1. Rotations
      for (let r = 0; r < layer.height; r++) {
        for (let c = 0; c < layer.width; c++) {
          const tile = layer.grid[r][c];
          if (tile && tile.isRotatable) {
            candidateActions.push({
              type: 'rotate',
              layer: layer.id,
              row: r,
              col: c,
              direction: 1,
            });
          }
        }
      }

      // 2. Row shifts
      for (let r = 0; r < layer.height; r++) {
        let movableCount = 0;
        for (let c = 0; c < layer.width; c++) {
          const tile = layer.grid[r][c];
          if (!tile || tile.isMovable || tile.type === 'empty' || tile.type === 'gate') movableCount++;
        }
        if (movableCount >= 2) {
          candidateActions.push({
            type: 'shift_row',
            layer: layer.id,
            row: r,
            direction: 1,
          });
          candidateActions.push({
            type: 'shift_row',
            layer: layer.id,
            row: r,
            direction: -1,
          });
        }
      }

      // 3. Col shifts
      for (let c = 0; c < layer.width; c++) {
        let movableCount = 0;
        for (let r = 0; r < layer.height; r++) {
          const tile = layer.grid[r][c];
          if (!tile || tile.isMovable || tile.type === 'empty' || tile.type === 'gate') movableCount++;
        }
        if (movableCount >= 2) {
          candidateActions.push({
            type: 'shift_col',
            layer: layer.id,
            col: c,
            direction: 1,
          });
          candidateActions.push({
            type: 'shift_col',
            layer: layer.id,
            col: c,
            direction: -1,
          });
        }
      }
    }

    for (const action of candidateActions) {
      const { nextState } = executePlayerAction(state, action);
      const stateKey = serializeDualState(nextState);

      if (!visited.has(stateKey)) {
        visited.add(stateKey);
        const newMoves = [...moves, action];
        const evalRes = evaluateDualCircuit(nextState);

        if (evalRes.isComplete) {
          return newMoves;
        }

        queue.push({ state: nextState, moves: newMoves });
      }
    }
  }

  return null;
}
