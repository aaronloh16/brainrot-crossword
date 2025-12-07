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
  size?: "xs" | "small" | "medium" | "large";
  showAnimation?: boolean;
}

const CELL_SIZES = {
  xs: 18,
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
}: CrosswordGridProps) {
  const cellSize = CELL_SIZES[size];
  const baseGrid = useMemo(() => generateGrid(crosswordData), []);
  const padding = 2;

  const width = GRID_COLS * cellSize + padding * 2;
  const height = GRID_ROWS * cellSize + padding * 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      style={{ maxWidth: width }}
    >
      {/* Background */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#09090b"
        rx={6}
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
  if (cell.letter === null) {
    return (
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill="#000"
        rx={2}
      />
    );
  }

  let fillColor = "#18181b";
  let strokeColor = "#27272a";

  if (isHighlighted) {
    fillColor = "#facc15";
    strokeColor = "#fbbf24";
  } else if (isCorrect) {
    fillColor = "#14532d";
    strokeColor = "#22c55e";
  } else if (isWrong) {
    fillColor = "#450a0a";
    strokeColor = "#ef4444";
  }

  const fontSize = size * 0.5;
  const numberSize = size * 0.28;
  const gap = 1;

  return (
    <g>
      <rect
        x={x + gap}
        y={y + gap}
        width={size - gap * 2}
        height={size - gap * 2}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1}
        rx={3}
      />

      {cell.number && (
        <text
          x={x + 3}
          y={y + numberSize + 1}
          fontSize={numberSize}
          fill="#52525b"
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
          fill={isCorrect ? "#4ade80" : isWrong ? "#f87171" : "#e4e4e7"}
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          textAnchor="middle"
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
    <div>
      <h4 className="text-[10px] font-medium uppercase tracking-wider text-zinc-600 mb-3">
        {direction}
      </h4>
      <ul className="space-y-2">
        {clues.map(([num, data]) => {
          const isComplete = completedClues.has(`${direction}-${num}`);
          return (
            <li
              key={num}
              className={`text-xs leading-relaxed ${
                isComplete
                  ? "text-green-500/60 line-through"
                  : "text-zinc-500"
              }`}
            >
              <span className="font-mono text-zinc-600 mr-1.5">{num}.</span>
              {data.clue}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
