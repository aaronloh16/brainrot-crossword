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
          ? "border-yellow-500/50 bg-yellow-500/5 shadow-lg shadow-yellow-500/20"
          : "border-zinc-800 bg-zinc-950"
      }`}
      style={{
        borderTopColor: !isWinner ? `${model.color}40` : undefined,
        borderTopWidth: !isWinner ? '2px' : undefined,
      }}
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
            <div className="w-6 h-6 flex-shrink-0 relative">
              <img
                src={model.icon}
                alt={model.name}
                className="w-full h-full object-contain"
              />
            </div>
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
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: model.color,
              opacity: 0.9,
            }}
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
    <div className="rounded-xl border-2 border-dashed border-zinc-800/50 flex flex-col items-center justify-center min-h-[280px] bg-zinc-950/30 transition-all hover:border-zinc-700/50 hover:bg-zinc-950/40">
      <div className="w-12 h-12 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-2">
        <svg
          className="w-6 h-6 text-zinc-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <p className="text-zinc-700 text-xs font-medium">Empty slot</p>
      <p className="text-zinc-800 text-[10px] mt-1">Select up to 4 models</p>
    </div>
  );
}
