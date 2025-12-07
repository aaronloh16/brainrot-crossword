"use client";

import { useState, useCallback } from "react";
import { ModelSelector } from "@/components/ModelSelector";
import { RaceArena, RaceResult } from "@/components/RaceArena";
import { Results } from "@/components/Results";
import { ClueList } from "@/components/CrosswordGrid";
import { ModelConfig, getDefaultModels } from "@/lib/models";

type GamePhase = "select" | "race" | "results";

export default function Home() {
  const [phase, setPhase] = useState<GamePhase>("select");
  const [selectedModels, setSelectedModels] = useState<ModelConfig[]>(getDefaultModels);
  const [results, setResults] = useState<RaceResult[]>([]);

  const handleModelToggle = useCallback((model: ModelConfig) => {
    setSelectedModels((prev) => {
      const exists = prev.find((m) => m.id === model.id);
      if (exists) {
        return prev.filter((m) => m.id !== model.id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, model];
    });
  }, []);

  const handleStartGame = useCallback(() => {
    if (selectedModels.length >= 2) {
      setPhase("race");
    }
  }, [selectedModels]);

  const handleRaceComplete = useCallback((raceResults: RaceResult[]) => {
    setResults(raceResults);
    setPhase("results");
  }, []);

  const handlePlayAgain = useCallback(() => {
    setResults([]);
    setPhase("select");
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-purple-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight">RizzWord</span>
              <span className="text-[10px] font-medium text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                AI EVAL
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://vercel.com/ai-gateway"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Powered by AI Gateway
              </a>
              <a
                href="https://github.com/aaronloh16/rizzword-model-eval"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6">
          {phase === "select" && (
            <>
              {/* Hero */}
              <div className="pt-20 pb-16 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-zinc-500 mb-6">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Vercel AI Gateway Hackathon
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6">
                  Which AI has the
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                    most rizz?
                  </span>
                </h1>
                <p className="text-lg text-zinc-400 max-w-lg mx-auto mb-10">
                  Race GPT-5 Pro, Claude 4.5, Gemini 3 Pro, and Grok 4 to solve a Gen Z slang crossword.
                  See which AI truly understands internet culture.
                </p>

                {selectedModels.length >= 2 && (
                  <button
                    onClick={handleStartGame}
                    className="group relative inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-xl group-hover:blur-2xl transition-all" />
                    <span className="relative">Start Race</span>
                    <svg
                      className="relative w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Main content grid */}
              <div className="grid lg:grid-cols-3 gap-6 pb-20">
                {/* Model selector */}
                <div className="lg:col-span-2 bg-zinc-950 rounded-2xl border border-zinc-900 p-4 sm:p-6">
                  <ModelSelector
                    selectedModels={selectedModels}
                    onModelToggle={handleModelToggle}
                  />
                </div>

                {/* Clues preview */}
                <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-6">
                  <h3 className="text-sm font-medium text-zinc-400 mb-4">Crossword Clues</h3>
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                    <ClueList direction="across" />
                    <ClueList direction="down" />
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="border-t border-zinc-900 py-20">
                <h2 className="text-center text-sm font-medium text-zinc-500 mb-12">
                  HOW IT WORKS
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl">
                      🤖
                    </div>
                    <h3 className="font-medium mb-2">1. Pick your fighters</h3>
                    <p className="text-sm text-zinc-500">
                      Choose 2-4 AI models to compete
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl">
                      ⚡
                    </div>
                    <h3 className="font-medium mb-2">2. Watch them race</h3>
                    <p className="text-sm text-zinc-500">
                      Models solve clues in real-time, using intersecting letters as hints
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl">
                      🏆
                    </div>
                    <h3 className="font-medium mb-2">3. Crown the winner</h3>
                    <p className="text-sm text-zinc-500">
                      See which AI truly understands Gen Z culture
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms showcase */}
              <div className="border-t border-zinc-900 py-16">
                <p className="text-center text-sm text-zinc-600 mb-8">
                  Featuring terms like
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {["SKIBIDI", "RIZZ", "SALTY", "SIGMA", "BUSSIN", "OHIO", "AURA", "SUS"].map((term) => (
                    <span
                      key={term}
                      className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-full text-sm font-mono text-zinc-400"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {phase === "race" && (
            <div className="py-8">
              <RaceArena
                selectedModels={selectedModels}
                onRaceComplete={handleRaceComplete}
              />
            </div>
          )}

          {phase === "results" && (
            <div className="py-8">
              <Results results={results} onPlayAgain={handlePlayAgain} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-900 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
            <p className="text-xs text-zinc-600">
              Built for the Vercel AI Gateway Hackathon
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-600">
              <a href="https://sdk.vercel.ai" className="hover:text-white transition-colors">
                AI SDK
              </a>
              <a href="https://vercel.com/ai-gateway" className="hover:text-white transition-colors">
                AI Gateway
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
