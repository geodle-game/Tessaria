/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface TesseractProps {
  size?: number;
  className?: string;
  speed?: number;
  interactive?: boolean;
}

// 16 vertices of a 4D hypercube in [-1, 1]^4
const BASE_VERTICES_4D: number[][] = [];
for (let x = -1; x <= 1; x += 2) {
  for (let y = -1; y <= 1; y += 2) {
    for (let z = -1; z <= 1; z += 2) {
      for (let w = -1; w <= 1; w += 2) {
        BASE_VERTICES_4D.push([x, y, z, w]);
      }
    }
  }
}

// 32 edges connecting vertices that differ by exactly 1 coordinate
const EDGES_4D: [number, number][] = [];
for (let i = 0; i < 16; i++) {
  for (let j = i + 1; j < 16; j++) {
    let diffs = 0;
    for (let k = 0; k < 4; k++) {
      if (BASE_VERTICES_4D[i][k] !== BASE_VERTICES_4D[j][k]) diffs++;
    }
    if (diffs === 1) {
      EDGES_4D.push([i, j]);
    }
  }
}

export const TesseractVisual: React.FC<TesseractProps> = ({
  size = 280,
  className = '',
  speed = 0.008,
  interactive = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const anglesRef = useRef({ xy: 0, zw: 0, xz: 0.2 });
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    let animId: number;

    const render = () => {
      // Advance 4D rotation angles
      anglesRef.current.xy += speed;
      anglesRef.current.zw += speed * 0.7;

      if (interactive && mouseRef.current.active) {
        anglesRef.current.xz += (mouseRef.current.x * 0.01 - anglesRef.current.xz) * 0.05;
      }

      const { xy, zw, xz } = anglesRef.current;
      const cosXY = Math.cos(xy);
      const sinXY = Math.sin(xy);
      const cosZW = Math.cos(zw);
      const sinZW = Math.sin(zw);
      const cosXZ = Math.cos(xz);
      const sinXZ = Math.sin(xz);

      // Project 16 vertices to 2D
      const projected2D: { x: number; y: number; depth: number }[] = [];
      const scale = size * 0.22;
      const center = size / 2;

      for (const [x0, y0, z0, w0] of BASE_VERTICES_4D) {
        // Rotate in XY plane
        let x = x0 * cosXY - y0 * sinXY;
        let y = x0 * sinXY + y0 * cosXY;
        let z = z0;
        let w = w0;

        // Rotate in ZW plane
        const z1 = z * cosZW - w * sinZW;
        w = z * sinZW + w * cosZW;
        z = z1;

        // Rotate in XZ plane
        const x2 = x * cosXZ - z * sinXZ;
        z = x * sinXZ + z * cosXZ;
        x = x2;

        // 4D perspective projection to 3D: distance d = 2.5
        const d4 = 2.4;
        const p4 = 1 / (d4 - w);
        const x3 = x * p4;
        const y3 = y * p4;
        const z3 = z * p4;

        // 3D perspective projection to 2D screen
        const d3 = 3.2;
        const p3 = 1 / (d3 - z3);
        const screenX = center + x3 * p3 * scale * 2.8;
        const screenY = center + y3 * p3 * scale * 2.8;

        projected2D.push({ x: screenX, y: screenY, depth: w + z });
      }

      // Update SVG path lines
      const svg = svgRef.current;
      if (svg) {
        // Lines
        const linesGroup = svg.querySelector('#tesseract-lines');
        if (linesGroup) {
          let lineSvg = '';
          for (const [i, j] of EDGES_4D) {
            const p1 = projected2D[i];
            const p2 = projected2D[j];
            const avgDepth = (p1.depth + p2.depth) / 2;
            const opacity = Math.max(0.18, Math.min(0.85, (avgDepth + 2.5) / 5));
            const strokeColor = avgDepth > 0.2 ? '#22d3ee' : '#a855f7';
            const strokeWidth = avgDepth > 0.2 ? '1.5' : '1.0';

            lineSvg += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-opacity="${opacity.toFixed(2)}" stroke-linecap="round" />`;
          }
          linesGroup.innerHTML = lineSvg;
        }

        // Vertices
        const vertsGroup = svg.querySelector('#tesseract-verts');
        if (vertsGroup) {
          let vertSvg = '';
          for (const p of projected2D) {
            const r = p.depth > 0 ? '2.5' : '1.8';
            const color = p.depth > 0.3 ? '#22d3ee' : '#e0e7ff';
            const opacity = Math.max(0.3, Math.min(0.95, (p.depth + 2.5) / 5));
            vertSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${color}" fill-opacity="${opacity.toFixed(2)}" />`;
          }
          vertsGroup.innerHTML = vertSvg;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [size, speed, interactive]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left - rect.width / 2) / (rect.width / 2),
      y: (e.clientY - rect.top - rect.height / 2) / (rect.height / 2),
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`pointer-events-auto transition-transform ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Interactive 4D Tesseract Wireframe Projection"
    >
      <g id="tesseract-lines" />
      <g id="tesseract-verts" />
    </svg>
  );
};
