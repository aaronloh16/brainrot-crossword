"use client";

import { CrosswordGrid } from "./CrosswordGrid";
import { ModelConfig } from "@/lib/models";

interface ModelRacerProps {
  model: ModelConfig;
  gridState: (string | null)[][];
  correctCells: Set<string>;
  wrongCells: Set<string>;
  currentClue: { row: number; col: number } | null;
  progress: number;
  timeElapsed: number;
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
      className={`relative rounded-xl border transition-all ${
        isWinner
          ? "border-yellow-500/50 bg-yellow-500/5"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      {/* Winner badge */}
      {isWinner && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full">
            WINNER
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{model.avatar}</span>
            <div>
              <h3 className="text-sm font-medium text-white">{model.name}</h3>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                <span className="text-green-500">{totalCorrect}✓</span>
                <span className="text-red-500">{totalWrong}✗</span>
              </div>
            </div>
          </div>
          <div className="font-mono text-lg font-medium text-zinc-300">
            {formatTime(timeElapsed)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-white/80 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Grid */}
        <div className="flex justify-center bg-black/50 rounded-lg p-2">
          <CrosswordGrid
            gridState={gridState}
            correctAnswers={correctCells}
            wrongAnswers={wrongCells}
            highlightCell={currentClue}
            size="xs"
          />
        </div>

        {/* Status */}
        <div className="mt-3 text-center text-xs text-zinc-500">
          {isFinished ? (
            <span className="text-green-500">Complete</span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Solving...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyModelSlot() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 flex items-center justify-center min-h-[280px] bg-zinc-950/50">
      <p className="text-zinc-700 text-xs">Empty slot</p>
    </div>
  );
}
