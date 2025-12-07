# RizzWord - Architecture & Design

A real-time AI model evaluation game where multiple LLMs compete to solve a Gen Z slang crossword puzzle. Which AI has the most rizz?

## Overview

This app demonstrates **Vercel AI Gateway** capabilities by racing multiple AI models against each other in solving a crossword puzzle filled with internet slang ("brainrot") terms. It's a fun way to evaluate how well different LLMs understand Gen Z culture.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI Integration**: Vercel AI SDK + AI Gateway
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  page.tsx          - Main game flow & state management          │
│  ModelSelector     - UI for picking AI models to race           │
│  RaceArena         - Orchestrates the race, manages model state │
│  ModelRacer        - Individual model's crossword + progress    │
│  CrosswordGrid     - SVG-based crossword visualization          │
│  Results           - Leaderboard & statistics                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST /api/solve
                              │ (one request per clue per model)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (API Route)                          │
├─────────────────────────────────────────────────────────────────┤
│  /api/solve/route.ts                                            │
│    - Receives clue + model ID + known letters                   │
│    - Uses Vercel AI Gateway to call the appropriate model       │
│    - Returns the model's answer                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ AI Gateway (single API key)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel AI Gateway                            │
├─────────────────────────────────────────────────────────────────┤
│  Routes requests to appropriate providers:                      │
│    - openai/gpt-4o, openai/gpt-4o-mini                         │
│    - anthropic/claude-sonnet-4.5, anthropic/claude-haiku-4.5   │
│    - google/gemini-2.0-flash                                    │
│    - xai/grok-4, xai/grok-4-fast-non-reasoning                 │
└─────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Vercel AI Gateway for Multi-Model Access

**Why**: Instead of managing separate API keys for OpenAI, Anthropic, Google, and xAI, we use a single `AI_GATEWAY_API_KEY`. The gateway abstracts provider differences and handles routing.

```typescript
// One unified interface for all models
import { gateway } from "@ai-sdk/gateway";

const model = gateway("openai/gpt-4o");      // OpenAI
const model = gateway("anthropic/claude-3-5-sonnet"); // Anthropic
const model = gateway("xai/grok-4");          // xAI
```

### 2. Sequential Solving with Intersecting Letters

**Why**: Real crosswords use intersecting letters as hints. When a model solves one clue, those letters become available to help solve intersecting clues.

```typescript
// Each clue gets context about already-filled letters
const knownLetters = getKnownLetters(gridState, clue);
// Returns something like "S_G_A" if some letters are filled
```

**Prompt includes**:
- The clue text
- Word length
- Any known letters from intersecting words

### 3. Parallel Model Racing

**Why**: All models race simultaneously for a fair comparison. Each model maintains its own grid state.

```typescript
// All models start at the same time
const results = await Promise.all(
  selectedModels.map((model) => runModelRace(model))
);
```

### 4. SVG-Based Crossword Grid

**Why**: SVG provides crisp rendering at any size, easy styling with gradients/filters, and smooth animations.

```typescript
// Each cell is an SVG rect + text
<rect fill="url(#correctBg)" /> // Gradient fills
<text fill="#6ee7b7">A</text>   // Letter
```

### 5. Client-Side State Management

**Why**: Simple useState hooks are sufficient for this app. No need for Redux/Zustand since state is localized to the race component.

```typescript
// Each model has isolated state
const [modelStates, setModelStates] = useState<Map<string, ModelState>>(new Map());
```

## Data Flow

### 1. Race Initialization
```
User selects models → Click "Start Race" → 3-2-1 countdown
→ Initialize empty grid state for each model
→ Start timer
```

### 2. Solving Loop (per model)
```
For each clue in order:
  1. Get known letters from current grid state
  2. POST /api/solve with { clue, length, knownLetters, modelId }
  3. Gateway routes to correct AI provider
  4. Model returns answer
  5. Fill answer into grid, mark cells correct/wrong
  6. Update progress bar
  7. Small delay for visual effect
  8. Next clue
```

### 3. Race Completion
```
All models finish → Calculate rankings (correct answers, then time)
→ Display results with winner celebration
→ Show statistics
```

## File Structure

```
brainrot-crossword/
├── app/
│   ├── page.tsx              # Main page with game phases
│   ├── globals.css           # Tailwind + custom styles
│   └── api/
│       └── solve/
│           └── route.ts      # AI Gateway API endpoint
├── components/
│   ├── CrosswordGrid.tsx     # SVG crossword renderer
│   ├── ModelRacer.tsx        # Single model's race panel
│   ├── RaceArena.tsx         # Race orchestration logic
│   ├── ModelSelector.tsx     # Model picker UI
│   └── Results.tsx           # Leaderboard display
├── lib/
│   ├── crossword-data.ts     # Puzzle definition + grid utils
│   └── models.ts             # AI model configurations
└── .env                      # AI_GATEWAY_API_KEY
```

## API Route Details

### POST /api/solve

**Request**:
```typescript
{
  modelId: string;      // e.g., "gpt-4o"
  clue: string;         // e.g., "Lone wolf grindset archetype"
  length: number;       // e.g., 5
  knownLetters: string; // e.g., "S_G_A" or "_____"
  direction: "across" | "down";
  number: string;       // Clue number
}
```

**Response**:
```typescript
{
  answer: string;       // e.g., "SIGMA"
  modelId: string;
  clueNumber: string;
  direction: string;
  timeMs: number;       // How long the API call took
}
```

**Prompt Engineering**:
```
You are solving a crossword puzzle about Gen Z internet slang.

Clue: "Lone wolf grindset archetype"
Length: 5 letters
Known letters: S_G_A (underscores are unknown)

Important: Respond with ONLY the answer word in uppercase letters.
```

## Crossword Data Structure

```typescript
// Each clue defines position and answer
{
  across: {
    "1": { clue: "...", answer: "SIGMA", row: 0, col: 0 },
    "7": { clue: "...", answer: "RIZZ", row: 6, col: 3 },
  },
  down: {
    "1": { clue: "...", answer: "SKIBIDI", row: 0, col: 0 },
    "4": { clue: "...", answer: "GRIDDY", row: 0, col: 2 },
  }
}
```

The grid is generated dynamically from this data, calculating cell numbers and intersections.

## Scoring System

1. **Primary**: Number of correct answers (higher is better)
2. **Tiebreaker**: Total time (lower is better)

```typescript
results.sort((a, b) => {
  if (b.correctCount !== a.correctCount) {
    return b.correctCount - a.correctCount; // More correct = better
  }
  return a.endTime - b.endTime; // Faster = better
});
```

## Environment Variables

```bash
# Required: Vercel AI Gateway API key
AI_GATEWAY_API_KEY=your_key_here
```

Get your key from: Vercel Dashboard → AI Gateway → API Keys → Create Key

## Future Improvements

- [ ] Add more crossword puzzles (different themes)
- [ ] User can input their own clues
- [ ] Streaming responses for real-time letter reveal
- [ ] Persistent leaderboards across sessions
- [ ] Sound effects and more animations
- [ ] Mobile-optimized layout

