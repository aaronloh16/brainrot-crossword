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
  correctAnswers?: Set<string>; // Set of "row,col" keys that are correct
  wrongAnswers?: Set<string>; // Set of "row,col" keys that are wrong
  highlightCell?: { row: number; col: number } | null;
  size?: "small" | "medium" | "large";
}

const CELL_SIZES = {
  small: 28,
  medium: 36,
  large: 44,
};

export function CrosswordGrid({
  gridState,
  correctAnswers = new Set(),
  wrongAnswers = new Set(),
  highlightCell = null,
  size = "medium",
}: CrosswordGridProps) {
  const cellSize = CELL_SIZES[size];
  const baseGrid = useMemo(() => generateGrid(crosswordData), []);

  const width = GRID_COLS * cellSize;
  const height = GRID_ROWS * cellSize;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      style={{ maxWidth: width }}
    >
      {/* Background */}
      <rect width={width} height={height} fill="#1a1a2e" rx={4} />

      {/* Grid cells */}
      {baseGrid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const x = colIndex * cellSize;
          const y = rowIndex * cellSize;
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
  // Blocked cell (no letter)
  if (cell.letter === null) {
    return (
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill="#0f0f1a"
        stroke="#1a1a2e"
        strokeWidth={1}
      />
    );
  }

  // Active cell with letter
  let fillColor = "#16213e"; // Default dark blue
  let strokeColor = "#0f4c75"; // Border

  if (isHighlighted) {
    fillColor = "#fbbf24"; // Yellow highlight
    strokeColor = "#f59e0b";
  } else if (isCorrect) {
    fillColor = "#065f46"; // Green
    strokeColor = "#10b981";
  } else if (isWrong) {
    fillColor = "#7f1d1d"; // Red
    strokeColor = "#ef4444";
  }

  const fontSize = size * 0.5;
  const numberSize = size * 0.25;

  return (
    <g>
      {/* Cell background */}
      <rect
        x={x + 1}
        y={y + 1}
        width={size - 2}
        height={size - 2}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
        rx={3}
      />

      {/* Clue number */}
      {cell.number && (
        <text
          x={x + 4}
          y={y + numberSize + 2}
          fontSize={numberSize}
          fill="#94a3b8"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {cell.number}
        </text>
      )}

      {/* Letter (guess) */}
      {guess && (
        <text
          x={x + size / 2}
          y={y + size / 2 + fontSize * 0.35}
          fontSize={fontSize}
          fill={isCorrect ? "#34d399" : isWrong ? "#f87171" : "#e2e8f0"}
          fontFamily="system-ui, sans-serif"
          fontWeight="bold"
          textAnchor="middle"
        >
          {guess}
        </text>
      )}
    </g>
  );
}

// Clue display component
interface ClueListProps {
  direction: "across" | "down";
  completedClues?: Set<string>;
}

export function ClueList({ direction, completedClues = new Set() }: ClueListProps) {
  const clues = Object.entries(
    direction === "across" ? crosswordData.across : crosswordData.down
  );

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
        {direction}
      </h3>
      <ul className="space-y-1">
        {clues.map(([num, data]) => {
          const isComplete = completedClues.has(`${direction}-${num}`);
          return (
            <li
              key={num}
              className={`text-sm ${
                isComplete
                  ? "text-emerald-400 line-through opacity-70"
                  : "text-slate-300"
              }`}
            >
              <span className="font-mono text-cyan-500 mr-2">{num}.</span>
              {data.clue}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

