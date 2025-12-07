"use client";

import { RaceResult } from "./RaceArena";

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

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "🏅";
    }
  };

  const totalClues = 13; // Updated for bigger crossword
  const winner = results[0];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Winner celebration */}
      {winner && (
        <div className="text-center mb-12">
          <div className="inline-block animate-bounce mb-4">
            <span className="text-7xl">{getRankEmoji(1)}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-3">
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              {winner.model.name}
            </span>
          </h2>
          <p className="text-xl text-slate-400">
            wins with{" "}
            <span className="text-emerald-400 font-bold">
              {winner.correctAnswers}/{totalClues}
            </span>{" "}
            correct in{" "}
            <span className="text-cyan-400 font-mono font-bold">
              {formatTime(winner.timeMs)}
            </span>
          </p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-4 mb-10">
        {results.map((result, index) => (
          <div
            key={result.model.id}
            className={`relative rounded-2xl overflow-hidden transition-all hover:scale-[1.02] ${
              index === 0
                ? "ring-2 ring-yellow-400/50 shadow-2xl shadow-yellow-500/20"
                : ""
            }`}
            style={{
              background:
                index === 0
                  ? "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)"
                  : "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.6) 100%)",
            }}
          >
            {/* Rank indicator bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{
                background:
                  index === 0
                    ? "linear-gradient(180deg, #fbbf24, #f59e0b)"
                    : index === 1
                    ? "linear-gradient(180deg, #94a3b8, #64748b)"
                    : index === 2
                    ? "linear-gradient(180deg, #f59e0b, #d97706)"
                    : result.model.color,
              }}
            />

            <div className="p-6 pl-8">
              <div className="flex items-center gap-6">
                {/* Rank */}
                <div className="text-5xl">{getRankEmoji(result.rank)}</div>

                {/* Model info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{result.model.avatar}</span>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: result.model.color }}
                    >
                      {result.model.name}
                    </h3>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-slate-400">Time:</span>
                      <span className="text-cyan-400 font-mono font-bold">
                        {formatTime(result.timeMs)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-emerald-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-slate-400">Correct:</span>
                      <span className="text-emerald-400 font-bold">
                        {result.correctAnswers}/{totalClues}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-slate-400">Wrong:</span>
                      <span className="text-red-400 font-bold">
                        {result.wrongAnswers}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rank number */}
                <div className="text-5xl font-black text-slate-700/50">
                  #{result.rank}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action button */}
      <div className="text-center mb-12">
        <button
          onClick={onPlayAgain}
          className="group relative px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl overflow-hidden transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/25"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            RACE AGAIN
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Fun stats card */}
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/50">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Brainrot Knowledge Analysis
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-black text-cyan-400">
              {results.length > 0
                ? Math.round(
                    (results.reduce((sum, r) => sum + r.correctAnswers, 0) /
                      (results.length * totalClues)) *
                      100
                  )
                : 0}
              %
            </div>
            <div className="text-xs text-slate-500 mt-1">Avg. Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-purple-400">
              {results.length > 0
                ? formatTime(Math.min(...results.map((r) => r.timeMs)))
                : "0:00"}
            </div>
            <div className="text-xs text-slate-500 mt-1">Fastest Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-400">
              {results.length > 0
                ? Math.max(...results.map((r) => r.correctAnswers))
                : 0}
              /{totalClues}
            </div>
            <div className="text-xs text-slate-500 mt-1">Best Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-pink-400">
              {results.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Models Tested</div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-800/50">
          <p className="text-sm text-slate-500 text-center italic">
            These AI models were tested on their knowledge of Gen Z internet
            slang. No cap, some of them are absolutely bussin at this fr fr.
            The models with the most rizz clearly understand the culture.
          </p>
        </div>
      </div>
    </div>
  );
}
