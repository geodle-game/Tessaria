# TESSARIA

> A high-dimensional geometric puzzle game inspired by 4D tesseract mechanics.

TESSARIA is an original puzzle game where the player manipulates a grid containing geometric path tiles to establish a continuous energetic connection between a **SOURCE** tile (Alpha) and a **DESTINATION** tile (Omega).

Instead of sliding individual tiles or matching numbers, you shift entire rows and columns with toroidal edge wrapping and rotate path conduits through **Dimensional Gates**.

---

## Game Mechanics

1. **Row & Column Shifting**:
   - Selecting a row and moving left or right shifts all tiles in that row by one cell.
   - Selecting a column and moving up or down shifts all tiles in that column by one cell.
   - Tiles leaving any edge wrap around to the opposite side of the grid.
   - Every shift counts as one move.

2. **Dimensional Gates**:
   - Luminous violet seams mark dimensional fold rifts in 4D space.
   - When a tile crosses a designated gate boundary, its path connections rotate by 90° in the specified direction (clockwise or counter-clockwise).
   - Normal movement does not rotate tiles; only crossing the gate boundary triggers the 4D fold rotation.
   - Shifts are deterministic and fully reversible with Undo.

3. **Path Validation**:
   - Calculated via Breadth-First Search (BFS) graph traversal after each move.
   - A connection is established between two adjacent tiles only when **both tiles** share matching connection openings on their shared edge.
   - Victory triggers when a continuous valid path connects the Source to the Destination.

---

## 24 Handcrafted Sectors Across Three Chapters

- **Chapter I — The Surface (Levels 1 – 8)**:
  - Teaches path matching, orthogonal axes, elbow corner routing, and multi-lane shifts.
- **Chapter II — The Fold (Levels 9 – 16)**:
  - Introduces toroidal edge wrapping and Dimensional Gates.
- **Chapter III — The Tesseract (Levels 17 – 24)**:
  - Combines dual chiral gates (CW and CCW), 5×5 spatial dimensions, and multi-step planning.

---

## Controls & Accessibility

- **Mouse / Touch**:
  - Click directional arrow buttons on row and column headers.
  - Swipe or drag directly along any row or column to slide.
- **Keyboard Shortcuts**:
  - `Z` or `U`: Undo move
  - `R`: Reset current sector
  - `H`: Progressive Hint (1st press highlights optimal lane; 2nd press reveals direction)
  - `M`: Toggle audio mute
  - `Esc`: Pause & Settings
  - `Space` / `Enter`: Start game or advance to next sector
- **Audio**:
  - Procedural Web Audio API sound synthesizer (no external audio files required).
- **Reduced Motion**:
  - Accessible in Settings to disable sliding and rotation animations.
- **Persistence**:
  - Progress, best moves, and star ratings persist in `localStorage`.

---

## Development & Testing

### Running Unit Tests
All rules, wrapping topology, gate rotations, undo reversibility, and solvability across all 24 levels are verified with Node's built-in test runner:

```bash
npx --yes tsx --test src/game/rules.test.ts
```

### Local Development Server
```bash
npm run dev
```

### Static Build & Export
```bash
npm run build
```
The output in `dist/` is 100% static, requires no backend or environment variables, and supports deployment on GitHub Pages or any static host.
