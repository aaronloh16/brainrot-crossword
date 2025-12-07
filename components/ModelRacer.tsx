"use client";

import { CrosswordGrid } from "./CrosswordGrid";
import { ModelConfig } from "@/lib/models";
import { GRID_COLS, GRID_ROWS } from "@/lib/crossword-data";

interface ModelRacerProps {
  model: ModelConfig;
  gridState: (string | null)[][];
  correctCells: Set<string>;
  wrongCells: Set<string>;
  currentClue: { row: number; col: number } | null;
  progress: number; // 0-100
  timeElapsed: number; // seconds
  isFinished: boolean;
  isWinner: boolean;
  totalCorrect: number;
  totalWrong: number;
}

export function ModelRacer({
  model,
  gridState,
  correctCells,
  wrongCells,
  currentClue,
  progress,
  timeElapsed,
  isFinished,
  isWinner,
  totalCorrect,
  totalWrong,
}: ModelRacerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`relative rounded-xl p-4 transition-all duration-300 ${
        isWinner
          ? "bg-gradient-to-br from-yellow-900/50 to-amber-900/50 ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/20"
          : isFinished
          ? "bg-slate-800/50 opacity-75"
          : "bg-slate-900/80"
      }`}
      style={{
        borderLeft: `4px solid ${model.color}`,
      }}
    >
      {/* Winner badge */}
      {isWinner && (
        <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full animate-bounce">
          WINNER!
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{model.avatar}</span>
          <h3 className="font-bold text-white">{model.name}</h3>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg text-cyan-400">
            {formatTime(timeElapsed)}
          </div>
          <div className="text-xs text-slate-400">
            {totalCorrect} correct / {totalWrong} wrong
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: model.color,
            boxShadow: `0 0 10px ${model.color}`,
          }}
        />
      </div>

      {/* Crossword grid */}
      <div className="flex justify-center">
        <CrosswordGrid
          gridState={gridState}
          correctAnswers={correctCells}
          wrongAnswers={wrongCells}
          highlightCell={currentClue}
          size="small"
        />
      </div>

      {/* Status indicator */}
      <div className="mt-3 text-center text-sm">
        {isFinished ? (
          <span className="text-emerald-400">Completed!</span>
        ) : (
          <span className="text-slate-400 animate-pulse">Solving...</span>
        )}
      </div>
    </div>
  );
}

// Empty state for when model slot is not filled
export function EmptyModelSlot() {
  return (
    <div className="rounded-xl p-4 bg-slate-900/40 border-2 border-dashed border-slate-700 flex items-center justify-center min-h-[300px]">
      <p className="text-slate-500 text-sm">Select a model</p>
    </div>
  );
}

