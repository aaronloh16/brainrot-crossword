"use client";

import { RaceResult } from "./RaceArena";
import { CrosswordGrid } from "./CrosswordGrid";

interface ResultsProps {
  results: RaceResult[];
  onPlayAgain: () => void;
}

export function Results({ results, onPlayAgain }: ResultsProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
  };

  const totalClues = 13;
  const winner = results[0];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Winner announcement with their completed crossword */}
      {winner && (
        <div className="text-center mb-12 pt-8">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold mb-2">{winner.model.name} wins!</h2>
          <p className="text-zinc-400 mb-8">
            {winner.correctAnswers}/{totalClues} correct in {formatTime(winner.timeMs)}
          </p>

          {/* Winner's completed crossword */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">final crossword</h3>
            <div className="inline-block bg-zinc-950 rounded-2xl border border-zinc-800 p-6">
              <CrosswordGrid
                gridState={winner.finalGridState}
                correctAnswers={new Set(winner.correctCells)}
                wrongAnswers={new Set(winner.wrongCells)}
                size="medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-3 mb-10">
        {results.map((result, index) => (
          <div
            key={result.model.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              index === 0
                ? "border-yellow-500/30 bg-yellow-500/5"
                : "border-zinc-800 bg-zinc-950"
            }`}
          >
            {/* Rank */}
            <div className="text-2xl font-bold text-zinc-600 w-8">
              {result.rank}
            </div>

            {/* Model */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-6 h-6 flex-shrink-0 relative">
                <img
                  src={result.model.icon}
                  alt={result.model.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-medium">{result.model.name}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-right">
                <div className="text-green-500 font-mono">{result.correctAnswers}/{totalClues}</div>
                <div className="text-[10px] text-zinc-600">correct</div>
              </div>
              <div className="text-right">
                <div className="text-zinc-300 font-mono">{formatTime(result.timeMs)}</div>
                <div className="text-[10px] text-zinc-600">time</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Play again */}
      <div className="text-center">
        <button
          onClick={onPlayAgain}
          className="group relative inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-xl group-hover:blur-2xl transition-all" />
          <svg className="relative w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="relative">Race Again</span>
        </button>
      </div>

      {/* Stats card */}
      <div className="mt-16 p-6 rounded-xl border border-zinc-800 bg-zinc-950">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">Race Statistics</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-white">
              {results.length > 0
                ? Math.round(
                    (results.reduce((sum, r) => sum + r.correctAnswers, 0) /
                      (results.length * totalClues)) *
                      100
                  )
                : 0}%
            </div>
            <div className="text-xs text-zinc-600">Avg Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              {results.length > 0
                ? formatTime(Math.min(...results.map((r) => r.timeMs)))
                : "0:00"}
            </div>
            <div className="text-xs text-zinc-600">Fastest</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {results.length}
            </div>
            <div className="text-xs text-zinc-600">Models</div>
          </div>
        </div>
      </div>

      {/* Share prompt */}
      <div className="mt-8 text-center">
        <p className="text-xs text-zinc-600">
          Share your results on Twitter with #RizzWord
        </p>
      </div>
    </div>
  );
}
