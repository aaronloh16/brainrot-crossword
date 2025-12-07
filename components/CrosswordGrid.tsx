"use client";

import {
  generateGrid,
  crosswordData,
  GRID_ROWS,
  GRID_COLS,
  GridCell,
} from "@/lib/crossword-data";
import { useMemo } from "react";

interface CrosswordGridProps {
  gridState: (string | null)[][];
  correctAnswers?: Set<string>;
  wrongAnswers?: Set<string>;
  highlightCell?: { row: number; col: number } | null;
  size?: "small" | "medium" | "large";
  showAnimation?: boolean;
}

const CELL_SIZES = {
  small: 24,
  medium: 32,
  large: 40,
};

export function CrosswordGrid({
  gridState,
  correctAnswers = new Set(),
  wrongAnswers = new Set(),
  highlightCell = null,
  size = "medium",
  showAnimation = false,
}: CrosswordGridProps) {
  const cellSize = CELL_SIZES[size];
  const baseGrid = useMemo(() => generateGrid(crosswordData), []);
  const padding = 2;

  const width = GRID_COLS * cellSize + padding * 2;
  const height = GRID_ROWS * cellSize + padding * 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto drop-shadow-2xl"
      style={{ maxWidth: width }}
    >
      {/* Definitions for gradients and filters */}
      <defs>
        <linearGradient id="gridBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="cellBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="correctBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#065f46" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="wrongBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="highlightBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background with rounded corners */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="url(#gridBg)"
        rx={8}
        ry={8}
      />

      {/* Grid cells */}
      {baseGrid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const x = colIndex * cellSize + padding;
          const y = rowIndex * cellSize + padding;
          const key = `${rowIndex},${colIndex}`;
          const guess = gridState[rowIndex]?.[colIndex];
          const isCorrect = correctAnswers.has(key);
          const isWrong = wrongAnswers.has(key);
          const isHighlighted =
            highlightCell?.row === rowIndex && highlightCell?.col === colIndex;

          return (
            <Cell
              key={key}
              cell={cell}
              x={x}
              y={y}
              size={cellSize}
              guess={guess}
              isCorrect={isCorrect}
              isWrong={isWrong}
              isHighlighted={isHighlighted}
              showAnimation={showAnimation}
            />
          );
        })
      )}
    </svg>
  );
}

interface CellProps {
  cell: GridCell;
  x: number;
  y: number;
  size: number;
  guess: string | null;
  isCorrect: boolean;
  isWrong: boolean;
  isHighlighted: boolean;
  showAnimation: boolean;
}

function Cell({
  cell,
  x,
  y,
  size,
  guess,
  isCorrect,
  isWrong,
  isHighlighted,
}: CellProps) {
  if (cell.letter === null) {
    return (
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill="#030712"
        rx={2}
      />
    );
  }

  let fillGradient = "url(#cellBg)";
  let strokeColor = "#334155";
  let glowFilter = "";

  if (isHighlighted) {
    fillGradient = "url(#highlightBg)";
    strokeColor = "#fbbf24";
    glowFilter = "url(#glow)";
  } else if (isCorrect) {
    fillGradient = "url(#correctBg)";
    strokeColor = "#10b981";
    glowFilter = "url(#glow)";
  } else if (isWrong) {
    fillGradient = "url(#wrongBg)";
    strokeColor = "#ef4444";
  }

  const fontSize = size * 0.5;
  const numberSize = size * 0.28;
  const gap = 1;

  return (
    <g filter={glowFilter}>
      <rect
        x={x + gap}
        y={y + gap}
        width={size - gap * 2}
        height={size - gap * 2}
        fill={fillGradient}
        stroke={strokeColor}
        strokeWidth={1.5}
        rx={4}
      />

      {cell.number && (
        <text
          x={x + 3}
          y={y + numberSize + 1}
          fontSize={numberSize}
          fill="#64748b"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
        >
          {cell.number}
        </text>
      )}

      {guess && (
        <text
          x={x + size / 2}
          y={y + size / 2 + fontSize * 0.35}
          fontSize={fontSize}
          fill={isCorrect ? "#6ee7b7" : isWrong ? "#fca5a5" : "#f1f5f9"}
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          textAnchor="middle"
          style={{
            textShadow: isCorrect
              ? "0 0 8px rgba(110, 231, 183, 0.5)"
              : isWrong
              ? "0 0 8px rgba(252, 165, 165, 0.5)"
              : "none",
          }}
        >
          {guess}
        </text>
      )}
    </g>
  );
}

interface ClueListProps {
  direction: "across" | "down";
  completedClues?: Set<string>;
}

export function ClueList({ direction, completedClues = new Set() }: ClueListProps) {
  const clues = Object.entries(
    direction === "across" ? crosswordData.across : crosswordData.down
  );

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
        {direction}
      </h3>
      <ul className="space-y-2">
        {clues.map(([num, data]) => {
          const isComplete = completedClues.has(`${direction}-${num}`);
          return (
            <li
              key={num}
              className={`text-xs leading-relaxed transition-all duration-300 ${
                isComplete
                  ? "text-emerald-400/70 line-through"
                  : "text-slate-400"
              }`}
            >
              <span className="font-mono font-bold text-purple-400 mr-1.5">
                {num}.
              </span>
              {data.clue}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
