/**
 * RaceArena Component
 * 
 * This is the core game logic component that orchestrates the AI race.
 * It manages multiple models solving the crossword simultaneously,
 * tracks their progress, and determines the winner.
 * 
 * Key responsibilities:
 * 1. Initialize isolated state for each racing model
 * 2. Run the countdown before race starts
 * 3. Execute parallel solving loops for all models
 * 4. Update UI in real-time as models answer clues
 * 5. Determine winner and calculate final rankings
 * 
 * Architecture Notes:
 * - Each model has its own gridState (isolated solving)
 * - Models solve clues sequentially but race in parallel
 * - Intersecting letters from solved clues help with later clues
 * - API calls go to /api/solve which uses Vercel AI Gateway
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ModelRacer, EmptyModelSlot } from "./ModelRacer";
import { ModelConfig } from "@/lib/models";
import {
  crosswordData,
  getCluesInOrder,
  getKnownLetters,
  fillAnswer,
  createEmptyGridState,
  ClueForSolving,
} from "@/lib/crossword-data";

// Props passed from parent (page.tsx)
interface RaceArenaProps {
  selectedModels: ModelConfig[];  // 2-4 models to race
  onRaceComplete: (results: RaceResult[]) => void;  // Callback when race ends
}

// Final results for each model
export interface RaceResult {
  model: ModelConfig;
  timeMs: number;        // Total time to complete
  correctAnswers: number;
  wrongAnswers: number;
  rank: number;          // 1 = winner
  finalGridState: (string | null)[][];  // The completed crossword grid
  correctCells: string[];   // Cells that were correct (serialized for passing to results)
  wrongCells: string[];     // Cells that were wrong
}

// Internal state tracked per model during the race
interface ModelState {
  gridState: (string | null)[][];  // Current filled letters
  correctCells: Set<string>;        // "row,col" keys of correct cells
  wrongCells: Set<string>;          // "row,col" keys of wrong cells
  currentClueIndex: number;         // Which clue they're on
  isFinished: boolean;
  startTime: number;
  endTime: number | null;
  correctCount: number;
  wrongCount: number;
}

export function RaceArena({ selectedModels, onRaceComplete }: RaceArenaProps) {
  // === State ===
  const [isRacing, setIsRacing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Map of modelId -> ModelState for each racing model
  const [modelStates, setModelStates] = useState<Map<string, ModelState>>(new Map());
  
  // Elapsed time display (updated frequently during race)
  const [elapsedTimes, setElapsedTimes] = useState<Map<string, number>>(new Map());
  
  // === Refs (persist across renders without causing re-renders) ===
  const clues = useRef(getCluesInOrder(crosswordData));  // All clues in solving order
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const raceStartTimeRef = useRef<number>(0);

  // === Initialize model states when selected models change ===
  useEffect(() => {
    const states = new Map<string, ModelState>();
    selectedModels.forEach((model) => {
      states.set(model.id, {
        gridState: createEmptyGridState(),
        correctCells: new Set(),
        wrongCells: new Set(),
        currentClueIndex: 0,
        isFinished: false,
        startTime: 0,
        endTime: null,
        correctCount: 0,
        wrongCount: 0,
      });
    });
    setModelStates(states);
  }, [selectedModels]);

  // === Timer effect - updates elapsed time display during race ===
  useEffect(() => {
    if (isRacing) {
      // Update every 100ms for smooth timer display
      timerRef.current = setInterval(() => {
        const now = Date.now();
        setElapsedTimes((prev) => {
          const next = new Map(prev);
          selectedModels.forEach((model) => {
            const state = modelStates.get(model.id);
            // Only update time for models still racing
            if (state && !state.isFinished) {
              next.set(model.id, Math.floor((now - raceStartTimeRef.current) / 1000));
            }
          });
          return next;
        });
      }, 100);

      // Cleanup on unmount or when race ends
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isRacing, selectedModels, modelStates]);

  // === Solve a single clue by calling the API ===
  const solveClue = useCallback(
    async (model: ModelConfig, clue: ClueForSolving, gridState: (string | null)[][]) => {
      // Get any letters already filled from intersecting words
      const knownLetters = getKnownLetters(gridState, clue);

      try {
        // Call our API route which uses Vercel AI Gateway
        const response = await fetch("/api/solve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: model.id,
            clue: clue.clue,
            length: clue.length,
            knownLetters,
            direction: clue.direction,
            number: clue.number,
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          console.error(`API error for ${model.name}:`, result.error);
          // Return placeholder so race can continue (counts as wrong)
          return "_".repeat(clue.length);
        }

        return result.answer as string;
      } catch (error) {
        console.error(`Error solving clue for ${model.name}:`, error);
        return "_".repeat(clue.length);
      }
    },
    []
  );

  // === Run the complete race for a single model ===
  const runModelRace = useCallback(
    async (model: ModelConfig) => {
      const state = modelStates.get(model.id);
      if (!state) return;

      // Track progress through the race
      let currentGridState = state.gridState;
      let correctCount = 0;
      let wrongCount = 0;
      const correctCells = new Set<string>();
      const wrongCells = new Set<string>();

      // Solve each clue sequentially
      // (Sequential so intersecting letters can help later clues)
      for (let i = 0; i < clues.current.length; i++) {
        const clue = clues.current[i];

        // Update UI to show which clue we're on
        setModelStates((prev) => {
          const next = new Map(prev);
          const s = next.get(model.id);
          if (s) {
            next.set(model.id, { ...s, currentClueIndex: i });
          }
          return next;
        });

        // Get the model's answer from the API
        const answer = await solveClue(model, clue, currentGridState);

        if (answer) {
          // Check correctness
          const isCorrect = answer === clue.answer;

          // Fill answer into the grid (even if wrong - it affects intersections)
          currentGridState = fillAnswer(currentGridState, clue, answer);

          // Mark individual cells as correct/wrong for UI coloring
          for (let j = 0; j < clue.length; j++) {
            const row = clue.direction === "across" ? clue.row : clue.row + j;
            const col = clue.direction === "across" ? clue.col + j : clue.col;
            const key = `${row},${col}`;
            
            if (isCorrect) {
              correctCells.add(key);
              wrongCells.delete(key);  // May have been marked wrong by another clue
            } else {
              // Per-letter accuracy: some letters might be right
              const guessedLetter = answer[j];
              const correctLetter = clue.answer[j];
              if (guessedLetter !== correctLetter) {
                wrongCells.add(key);
              } else {
                correctCells.add(key);
              }
            }
          }

          // Update counts
          if (isCorrect) {
            correctCount++;
          } else {
            wrongCount++;
          }

          // Update state for real-time UI updates
          setModelStates((prev) => {
            const next = new Map(prev);
            next.set(model.id, {
              ...state,
              gridState: currentGridState,
              correctCells: new Set(correctCells),
              wrongCells: new Set(wrongCells),
              currentClueIndex: i + 1,
              correctCount,
              wrongCount,
            });
            return next;
          });
        }

        // Small delay between clues for visual effect
        // (Makes it easier to watch the race progress)
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Model finished - record end time
      const endTime = Date.now();
      setModelStates((prev) => {
        const next = new Map(prev);
        const s = next.get(model.id);
        if (s) {
          next.set(model.id, {
            ...s,
            isFinished: true,
            endTime,
            correctCount,
            wrongCount,
          });
        }
        return next;
      });

      return { 
        model, 
        endTime, 
        correctCount, 
        wrongCount, 
        finalGridState: currentGridState,
        correctCells: Array.from(correctCells),
        wrongCells: Array.from(wrongCells),
      };
    },
    [modelStates, solveClue]
  );

  // === Start the race ===
  const startRace = useCallback(async () => {
    // Dramatic countdown: 3... 2... 1... GO!
    setCountdown(3);
    await new Promise((r) => setTimeout(r, 800));
    setCountdown(2);
    await new Promise((r) => setTimeout(r, 800));
    setCountdown(1);
    await new Promise((r) => setTimeout(r, 800));
    setCountdown(0);  // Show "GO!" instead of null
    await new Promise((r) => setTimeout(r, 500));
    setCountdown(null);

    // Reset all model states for fresh start
    const startTime = Date.now();
    raceStartTimeRef.current = startTime;
    
    setModelStates(() => {
      const next = new Map<string, ModelState>();
      selectedModels.forEach((model) => {
        next.set(model.id, {
          gridState: createEmptyGridState(),
          correctCells: new Set(),
          wrongCells: new Set(),
          currentClueIndex: 0,
          isFinished: false,
          startTime,
          endTime: null,
          correctCount: 0,
          wrongCount: 0,
        });
      });
      return next;
    });

    setIsRacing(true);

    // Start all models racing in parallel!
    // Promise.all waits for all to finish
    const results = await Promise.all(
      selectedModels.map((model) => runModelRace(model))
    );

    setIsRacing(false);

    // Calculate final rankings
    const validResults = results.filter((r): r is NonNullable<typeof r> => r !== undefined);
    
    // Sort by: 1) Most correct answers, 2) Fastest time (tiebreaker)
    validResults.sort((a, b) => {
      if (b.correctCount !== a.correctCount) {
        return b.correctCount - a.correctCount;
      }
      return a.endTime - b.endTime;
    });

    // Build final results with rankings
    const finalResults: RaceResult[] = validResults.map((r, i) => ({
      model: r.model,
      timeMs: r.endTime - startTime,
      correctAnswers: r.correctCount,
      wrongAnswers: r.wrongCount,
      rank: i + 1,
      finalGridState: r.finalGridState,
      correctCells: r.correctCells,
      wrongCells: r.wrongCells,
    }));

    // Notify parent component that race is complete
    onRaceComplete(finalResults);
  }, [selectedModels, runModelRace, onRaceComplete]);

  // === Helper: Calculate progress percentage for a model ===
  const getProgress = (modelId: string) => {
    const state = modelStates.get(modelId);
    if (!state) return 0;
    return (state.currentClueIndex / clues.current.length) * 100;
  };

  // === Determine current winner (most correct, then fastest) ===
  const finishedModels = Array.from(modelStates.entries())
    .filter(([, state]) => state.isFinished)
    .sort((a, b) => {
      if (b[1].correctCount !== a[1].correctCount) {
        return b[1].correctCount - a[1].correctCount;
      }
      return (a[1].endTime || 0) - (b[1].endTime || 0);
    });
  
  // Only show winner after ALL models have finished
  const winnerId = finishedModels.length === selectedModels.length 
    ? finishedModels[0]?.[0] 
    : null;

  // === Render ===
  return (
    <div className="relative">
      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm px-4">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 blur-3xl opacity-50">
              <div className={`font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent ${countdown === 0 ? 'text-[80px] sm:text-[120px]' : 'text-[100px] sm:text-[150px]'}`}>
                {countdown === 0 ? 'GO!' : countdown}
              </div>
            </div>
            {/* Main countdown */}
            <div className={`relative font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent ${countdown === 0 ? 'text-[80px] sm:text-[120px] animate-bounce' : 'text-[100px] sm:text-[150px] animate-pulse'}`}>
              {countdown === 0 ? 'GO!' : countdown}
            </div>
          </div>
        </div>
      )}

      {/* Start button */}
      {!isRacing && countdown === null && (
        <div className="text-center mb-8">
          <button
            onClick={startRace}
            className="group relative inline-flex items-center gap-2 bg-white text-black font-semibold px-10 py-4 rounded-full hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-xl group-hover:blur-2xl transition-all" />
            <svg className="relative w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="relative">Start Race</span>
          </button>
        </div>
      )}

      {/* Racing grid - 2x2 layout for up to 4 models */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {[0, 1, 2, 3].map((index) => {
          const model = selectedModels[index];
          
          // Empty slot if less than 4 models selected
          if (!model) {
            return <EmptyModelSlot key={index} />;
          }

          const state = modelStates.get(model.id);
          const currentClue = state ? clues.current[state.currentClueIndex] : null;

          return (
            <ModelRacer
              key={model.id}
              model={model}
              gridState={state?.gridState || createEmptyGridState()}
              correctCells={state?.correctCells || new Set()}
              wrongCells={state?.wrongCells || new Set()}
              currentClue={
                currentClue
                  ? { row: currentClue.row, col: currentClue.col }
                  : null
              }
              currentClueText={currentClue?.clue}
              currentClueNumber={currentClue?.number}
              currentClueDirection={currentClue?.direction}
              progress={getProgress(model.id)}
              timeElapsed={elapsedTimes.get(model.id) || 0}
              isFinished={state?.isFinished || false}
              isWinner={winnerId === model.id}
              totalCorrect={state?.correctCount || 0}
              totalWrong={state?.wrongCount || 0}
            />
          );
        })}
      </div>
    </div>
  );
}
