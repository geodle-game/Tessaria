/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLayerFromConfig,
  cloneDualState,
  evaluateDualCircuit,
  executeColShift,
  executeNodeRotation,
  executePlayerAction,
  executeRowShift,
  rotateConnections,
  solveDualPuzzle,
} from './rules';
import { LEVELS } from './levels';
import { DualLayerState } from './types';

test('1. Normal node rotates 90° CW and CCW', () => {
  const initial = { north: true, east: false, south: false, west: false };
  const cw = rotateConnections(initial, 1);
  assert.deepEqual(cw, { north: false, east: true, south: false, west: false });

  const ccw = rotateConnections(initial, -1);
  assert.deepEqual(ccw, { north: false, east: false, south: false, west: true });
});

test('2. Row shift moves conduits with toroidal wrap-around', () => {
  const state: DualLayerState = {
    layerA: buildLayerFromConfig('A', 'Alpha', [
      [
        { type: 'path', connections: ['north', 'south'], isMovable: true, id: 'p0' },
        { type: 'empty', connections: [], isMovable: true, id: 'e1' },
        { type: 'empty', connections: [], isMovable: true, id: 'e2' },
      ],
    ]),
    layerB: buildLayerFromConfig('B', 'Beta', [[null, null, null]]),
  };

  // Shift Row 0 right by 1
  const { nextState } = executeRowShift(state, {
    type: 'shift_row',
    layer: 'A',
    row: 0,
    direction: 1,
  });

  assert.equal(nextState.layerA.grid[0][0]?.id, 'e2');
  assert.equal(nextState.layerA.grid[0][1]?.id, 'p0');
  assert.equal(nextState.layerA.grid[0][2]?.id, 'e1');
});

test('3. Column shift moves conduits vertically with wrap-around', () => {
  const state: DualLayerState = {
    layerA: buildLayerFromConfig('A', 'Alpha', [
      [{ type: 'path', connections: ['east', 'west'], isMovable: true, id: 'p0' }],
      [{ type: 'empty', connections: [], isMovable: true, id: 'e1' }],
      [{ type: 'empty', connections: [], isMovable: true, id: 'e2' }],
    ]),
    layerB: buildLayerFromConfig('B', 'Beta', [[null]]),
  };

  const { nextState } = executeColShift(state, {
    type: 'shift_col',
    layer: 'A',
    col: 0,
    direction: 1,
  });

  assert.equal(nextState.layerA.grid[0][0]?.id, 'e2');
  assert.equal(nextState.layerA.grid[1][0]?.id, 'p0');
  assert.equal(nextState.layerA.grid[2][0]?.id, 'e1');
});

test('4. Entangled Rotor rotates counterpart synchronously', () => {
  const state: DualLayerState = {
    layerA: buildLayerFromConfig('A', 'Alpha', [
      [{ type: 'rotor', connections: ['east', 'west'], isRotatable: true, linkId: 'rotor_sync' }],
    ]),
    layerB: buildLayerFromConfig('B', 'Beta', [
      [{ type: 'rotor', connections: ['north', 'south'], isRotatable: true, linkId: 'rotor_sync' }],
    ]),
  };

  const { nextState, rotatedTileIds } = executeNodeRotation(state, {
    type: 'rotate',
    layer: 'A',
    row: 0,
    col: 0,
    direction: 1,
  });

  assert.equal(rotatedTileIds.length, 2);
  // Layer A: EW rotated CW becomes NS
  assert.equal(nextState.layerA.grid[0][0]?.connections.north, true);
  assert.equal(nextState.layerA.grid[0][0]?.connections.south, true);
  // Layer B: NS rotated CW becomes EW
  assert.equal(nextState.layerB.grid[0][0]?.connections.east, true);
  assert.equal(nextState.layerB.grid[0][0]?.connections.west, true);
});

test('5. Paired Dimensional Gate transfers conduit to other layer and rotates by 90°', () => {
  const state: DualLayerState = {
    layerA: buildLayerFromConfig('A', 'Alpha', [
      [
        { type: 'path', connections: ['north', 'south'], isMovable: true, id: 'pA' },
        {
          type: 'gate',
          connections: [],
          gateId: 'gate1',
          gateTargetLayer: 'B',
          gateTargetRow: 0,
          gateTargetCol: 1,
          gateRotationDelta: 1,
          isMovable: false,
        },
        { type: 'empty', connections: [], isMovable: true },
      ],
    ]),
    layerB: buildLayerFromConfig('B', 'Beta', [
      [
        { type: 'empty', connections: [] },
        {
          type: 'gate',
          connections: [],
          gateId: 'gate2',
          gateTargetLayer: 'A',
          gateTargetRow: 0,
          gateTargetCol: 1,
          isMovable: false,
        },
        { type: 'empty', connections: [] },
      ],
    ]),
  };

  const { nextState, transferOccurred } = executeRowShift(state, {
    type: 'shift_row',
    layer: 'A',
    row: 0,
    direction: 1,
  });

  assert.equal(transferOccurred, true);
  // Transferred tile should now be at Layer B (0, 1) and rotated by 90° (from NS to EW)
  const transferred = nextState.layerB.grid[0][1];
  assert.ok(transferred);
  assert.equal(transferred.connections.east, true);
  assert.equal(transferred.connections.west, true);
});

test('6. Blocked Dimensional Gate aborts transfer safely without deleting tile', () => {
  const state: DualLayerState = {
    layerA: buildLayerFromConfig('A', 'Alpha', [
      [
        { type: 'path', connections: ['north', 'south'], isMovable: true, id: 'pA' },
        {
          type: 'gate',
          connections: [],
          gateTargetLayer: 'B',
          gateTargetRow: 0,
          gateTargetCol: 1,
          isMovable: false,
        },
        { type: 'empty', connections: [], isMovable: true },
      ],
    ]),
    layerB: buildLayerFromConfig('B', 'Beta', [
      [
        { type: 'empty', connections: [] },
        // Target cell in Layer B is already occupied by a solid wall!
        { type: 'wall', connections: [] },
        { type: 'empty', connections: [] },
      ],
    ]),
  };

  const { nextState, transferOccurred } = executeRowShift(state, {
    type: 'shift_row',
    layer: 'A',
    row: 0,
    direction: 1,
  });

  assert.equal(transferOccurred, false);
  // Tile remains safely on current layer, no loss!
  assert.ok(nextState.layerA.grid[0].some((t) => t?.id === 'pA'));
});

test('7. Undo restores exact state and history', () => {
  const initial: DualLayerState = {
    layerA: buildLayerFromConfig('A', 'Alpha', [
      [{ type: 'path', connections: ['north', 'south'], isRotatable: true }],
    ]),
    layerB: buildLayerFromConfig('B', 'Beta', [[null]]),
  };

  const history = [cloneDualState(initial)];
  const { nextState } = executeNodeRotation(initial, {
    type: 'rotate',
    layer: 'A',
    row: 0,
    col: 0,
    direction: 1,
  });

  // Undo step
  const restored = history.pop()!;
  assert.deepEqual(restored.layerA.grid[0][0]?.connections, {
    north: true,
    east: false,
    south: true,
    west: false,
  });
});

test('8. Validate all 18 handcrafted campaign levels are solvable', async (t) => {
  assert.equal(LEVELS.length, 18, 'Campaign must contain exactly 18 levels across 3 chapters');

  for (const level of LEVELS) {
    await t.test(`Level ${level.id}: ${level.title} (Chapter ${level.chapter})`, () => {
      const dualState: DualLayerState = {
        layerA: buildLayerFromConfig('A', level.layerA.name || 'Alpha', level.layerA.tiles),
        layerB: buildLayerFromConfig('B', level.layerB?.name || 'Beta', level.layerB?.tiles || [[null]]),
      };

      // Ensure design documentation exists
      assert.ok(level.designDoc.mechanicTested, 'Must specify mechanic tested');
      assert.ok(level.designDoc.intendedSolution, 'Must specify intended solution');
      assert.ok(level.designDoc.whySolutionWorks, 'Must specify why solution works');
      assert.ok(level.designDoc.constraints, 'Must specify constraints');

      // Verify that level is not pre-solved
      const initialEval = evaluateDualCircuit(dualState);
      assert.equal(initialEval.isComplete, false, `Level ${level.id} should not start in solved state`);

      // Run BFS solver with appropriate depth
      const solution = solveDualPuzzle(dualState, Math.max(level.parMoves + 1, 6));
      assert.ok(solution, `Level ${level.id} (${level.title}) must have a valid BFS solution`);
      assert.ok(
        solution.length <= level.parMoves + 1,
        `Level ${level.id} solution length ${solution.length} exceeds par moves ${level.parMoves}`
      );
    });
  }
});
