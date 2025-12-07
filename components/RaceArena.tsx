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
  GRID_ROWS,
  GRID_COLS,
} from "@/lib/crossword-data";

interface RaceArenaProps {
  selectedModels: ModelConfig[];
  onRaceComplete: (results: RaceResult[]) => void;
}

export interface RaceResult {
  model: ModelConfig;
  timeMs: number;
  correctAnswers: number;
  wrongAnswers: number;
  rank: number;
}

interface ModelState {
  gridState: (string | null)[][];
  correctCells: Set<string>;
  wrongCells: Set<string>;
  currentClueIndex: number;
  isFinished: boolean;
  startTime: number;
  endTime: number | null;
  correctCount: number;
  wrongCount: number;
}

export function RaceArena({ selectedModels, onRaceComplete }: RaceArenaProps) {
  const [isRacing, setIsRacing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [modelStates, setModelStates] = useState<Map<string, ModelState>>(
    new Map()
  );
  const [elapsedTimes, setElapsedTimes] = useState<Map<string, number>>(
    new Map()
  );
  const clues = useRef(getCluesInOrder(crosswordData));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const raceStartTimeRef = useRef<number>(0);

  // Initialize model states
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

  // Timer for elapsed time display
  useEffect(() => {
    if (isRacing) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        setElapsedTimes((prev) => {
          const next = new Map(prev);
          selectedModels.forEach((model) => {
            const state = modelStates.get(model.id);
            if (state && !state.isFinished) {
              next.set(model.id, Math.floor((now - raceStartTimeRef.current) / 1000));
            }
          });
          return next;
        });
      }, 100);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isRacing, selectedModels, modelStates]);

  // Solve a single clue for a model
  const solveClue = useCallback(
    async (model: ModelConfig, clue: ClueForSolving, gridState: (string | null)[][]) => {
      const knownLetters = getKnownLetters(gridState, clue);

      try {
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
          // Return a placeholder so the race can continue
          return "_".repeat(clue.length);
        }

        return result.answer as string;
      } catch (error) {
        console.error(`Error solving clue for ${model.name}:`, error);
        // Return a placeholder so the race can continue
        return "_".repeat(clue.length);
      }
    },
    []
  );

  // Run the race for a single model
  const runModelRace = useCallback(
    async (model: ModelConfig) => {
      const state = modelStates.get(model.id);
      if (!state) return;

      let currentGridState = state.gridState;
      let correctCount = 0;
      let wrongCount = 0;
      const correctCells = new Set<string>();
      const wrongCells = new Set<string>();

      for (let i = 0; i < clues.current.length; i++) {
        const clue = clues.current[i];

        // Update current clue index
        setModelStates((prev) => {
          const next = new Map(prev);
          const s = next.get(model.id);
          if (s) {
            next.set(model.id, { ...s, currentClueIndex: i });
          }
          return next;
        });

        // Solve the clue
        const answer = await solveClue(model, clue, currentGridState);

        if (answer) {
          // Check if answer is correct
          const isCorrect = answer === clue.answer;

          // Fill in the grid
          currentGridState = fillAnswer(currentGridState, clue, answer);

          // Mark cells as correct or wrong
          for (let j = 0; j < clue.length; j++) {
            const row = clue.direction === "across" ? clue.row : clue.row + j;
            const col = clue.direction === "across" ? clue.col + j : clue.col;
            const key = `${row},${col}`;
            
            if (isCorrect) {
              correctCells.add(key);
              wrongCells.delete(key); // In case it was marked wrong before
            } else {
              // Only mark as wrong if the specific letter is wrong
              const guessedLetter = answer[j];
              const correctLetter = clue.answer[j];
              if (guessedLetter !== correctLetter) {
                wrongCells.add(key);
              } else {
                correctCells.add(key);
              }
            }
          }

          if (isCorrect) {
            correctCount++;
          } else {
            wrongCount++;
          }

          // Update state
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
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Mark as finished
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

      return { model, endTime, correctCount, wrongCount };
    },
    [modelStates, solveClue]
  );

  // Start the race
  const startRace = useCallback(async () => {
    // Countdown
    setCountdown(3);
    await new Promise((r) => setTimeout(r, 1000));
    setCountdown(2);
    await new Promise((r) => setTimeout(r, 1000));
    setCountdown(1);
    await new Promise((r) => setTimeout(r, 1000));
    setCountdown(null);

    // Reset states and start
    const startTime = Date.now();
    raceStartTimeRef.current = startTime;
    
    setModelStates((prev) => {
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

    // Run all models in parallel
    const results = await Promise.all(
      selectedModels.map((model) => runModelRace(model))
    );

    setIsRacing(false);

    // Calculate rankings
    const validResults = results.filter((r): r is NonNullable<typeof r> => r !== undefined);
    validResults.sort((a, b) => {
      // First by correct answers (descending)
      if (b.correctCount !== a.correctCount) {
        return b.correctCount - a.correctCount;
      }
      // Then by time (ascending)
      return a.endTime - b.endTime;
    });

    const finalResults: RaceResult[] = validResults.map((r, i) => ({
      model: r.model,
      timeMs: r.endTime - startTime,
      correctAnswers: r.correctCount,
      wrongAnswers: r.wrongCount,
      rank: i + 1,
    }));

    onRaceComplete(finalResults);
  }, [selectedModels, runModelRace, onRaceComplete]);

  // Calculate progress for each model
  const getProgress = (modelId: string) => {
    const state = modelStates.get(modelId);
    if (!state) return 0;
    return (state.currentClueIndex / clues.current.length) * 100;
  };

  // Find winner
  const finishedModels = Array.from(modelStates.entries())
    .filter(([, state]) => state.isFinished)
    .sort((a, b) => {
      if (b[1].correctCount !== a[1].correctCount) {
        return b[1].correctCount - a[1].correctCount;
      }
      return (a[1].endTime || 0) - (b[1].endTime || 0);
    });
  const winnerId = finishedModels.length === selectedModels.length ? finishedModels[0]?.[0] : null;

  return (
    <div className="relative">
      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="text-9xl font-black text-cyan-400 animate-ping">
            {countdown}
          </div>
        </div>
      )}

      {/* Start button */}
      {!isRacing && countdown === null && (
        <div className="text-center mb-8">
          <button
            onClick={startRace}
            className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-xl rounded-full hover:from-cyan-400 hover:to-purple-400 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            START RACE
          </button>
        </div>
      )}

      {/* Racing grid - 2x2 layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((index) => {
          const model = selectedModels[index];
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

