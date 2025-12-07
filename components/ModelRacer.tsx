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
      className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
        isWinner
          ? "ring-2 ring-yellow-400 shadow-2xl shadow-yellow-500/30"
          : isFinished
          ? "opacity-80"
          : ""
      }`}
      style={{
        background: isWinner
          ? "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)"
          : "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.9) 100%)",
      }}
    >
      {/* Accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${model.color} 0%, ${model.color}88 100%)`,
        }}
      />

      {/* Winner badge */}
      {isWinner && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            WINNER
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: `linear-gradient(135deg, ${model.color}33 0%, ${model.color}11 100%)`,
                border: `1px solid ${model.color}44`,
              }}
            >
              {model.avatar}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{model.name}</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-400">{totalCorrect} correct</span>
                <span className="text-slate-500">•</span>
                <span className="text-red-400">{totalWrong} wrong</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className="font-mono text-2xl font-bold"
              style={{ color: model.color }}
            >
              {formatTime(timeElapsed)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 transition-all duration-300 rounded-full"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${model.color} 0%, ${model.color}cc 100%)`,
              boxShadow: `0 0 12px ${model.color}66`,
            }}
          />
          <div
            className="absolute inset-y-0 left-0 transition-all duration-300 rounded-full opacity-50"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, transparent 0%, ${model.color} 100%)`,
              filter: "blur(4px)",
            }}
          />
        </div>

        {/* Crossword grid */}
        <div className="flex justify-center bg-slate-900/50 rounded-xl p-3">
          <CrosswordGrid
            gridState={gridState}
            correctAnswers={correctCells}
            wrongAnswers={wrongCells}
            highlightCell={currentClue}
            size="small"
            showAnimation={!isFinished}
          />
        </div>

        {/* Status */}
        <div className="mt-3 text-center">
          {isFinished ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-slate-400 text-sm">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: model.color }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: model.color }}
                />
              </span>
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
    <div className="rounded-2xl border-2 border-dashed border-slate-700/50 flex items-center justify-center min-h-[380px] bg-slate-900/20">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-800/50 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-slate-600"
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
        <p className="text-slate-600 text-sm">Empty slot</p>
      </div>
    </div>
  );
}
