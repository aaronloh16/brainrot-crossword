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

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-900/50 to-amber-900/50 ring-2 ring-yellow-400";
      case 2:
        return "from-slate-700/50 to-slate-600/50 ring-2 ring-slate-400";
      case 3:
        return "from-amber-900/30 to-orange-900/30 ring-2 ring-orange-400";
      default:
        return "from-slate-800/50 to-slate-700/50";
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-4xl font-black text-center mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        RACE RESULTS
      </h2>

      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.model.id}
            className={`rounded-xl p-6 bg-gradient-to-r ${getRankClass(result.rank)} transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl">{getRankEmoji(result.rank)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{result.model.avatar}</span>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: result.model.color }}
                  >
                    {result.model.name}
                  </h3>
                </div>
                <div className="flex gap-6 text-sm">
                  <span className="text-slate-400">
                    Time:{" "}
                    <span className="text-cyan-400 font-mono">
                      {formatTime(result.timeMs)}
                    </span>
                  </span>
                  <span className="text-slate-400">
                    Correct:{" "}
                    <span className="text-emerald-400 font-mono">
                      {result.correctAnswers}
                    </span>
                  </span>
                  <span className="text-slate-400">
                    Wrong:{" "}
                    <span className="text-red-400 font-mono">
                      {result.wrongAnswers}
                    </span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-slate-500">
                  #{result.rank}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onPlayAgain}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:from-purple-400 hover:to-pink-400 transition-all transform hover:scale-105"
        >
          RACE AGAIN
        </button>
      </div>

      {/* Fun stats */}
      <div className="mt-12 p-6 rounded-xl bg-slate-800/50 border border-slate-700">
        <h3 className="text-lg font-bold text-slate-300 mb-4">Brainrot Knowledge Analysis</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Best Accuracy:</span>
            <span className="ml-2 text-emerald-400">
              {results.length > 0
                ? `${results.reduce((best, r) => Math.max(best, r.correctAnswers), 0)} / 8`
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Fastest Time:</span>
            <span className="ml-2 text-cyan-400 font-mono">
              {results.length > 0
                ? formatTime(Math.min(...results.map((r) => r.timeMs)))
                : "N/A"}
            </span>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500 italic">
          These AI models were tested on their knowledge of Gen Z internet slang.
          No cap, some of them are absolutely bussin at this fr fr.
        </p>
      </div>
    </div>
  );
}

