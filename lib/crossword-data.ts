/**
 * Crossword Puzzle Data & Utilities
 * 
 * This file contains:
 * 1. The crossword puzzle definition (words, clues, positions)
 * 2. Grid generation logic
 * 3. Helper functions for solving (getting known letters, filling answers)
 * 
 * Grid Coordinate System:
 * - (row, col) where row 0 is top, col 0 is left
 * - Words go either "across" (left-to-right) or "down" (top-to-bottom)
 * 
 * The crossword was designed so words intersect at shared letters,
 * allowing models to use filled letters as hints for unsolved clues.
 */

// === Type Definitions ===

export interface ClueData {
  clue: string;    // The hint shown to players/AI
  answer: string;  // The correct answer (uppercase)
  row: number;     // Starting row (0-indexed)
  col: number;     // Starting column (0-indexed)
}

export interface CrosswordData {
  across: Record<string, ClueData>;  // Key = clue number
  down: Record<string, ClueData>;
}

// === The Crossword Puzzle ===

/**
 * Grid Layout Visualization (12 rows x 10 cols):
 * 
 *       0 1 2 3 4 5 6 7 8 9
 *    0  S I G M A # B L U D     SIGMA across, BLUD across
 *    1  K # R S U S U # # #     SUS across
 *    2  I # I # R # S # # #     
 *    3  B # D # A # S # # #     SKIBIDI down, GRIDDY down
 *    4  I # D # # # I # # #     AURA down, BUSSIN down
 *    5  D # Y # # # N # # #     
 *    6  I # # R I Z Z # # #     RIZZ across
 *    7  # # # A # # # # # #     
 *    8  S A L T Y # C A P #     SALTY across, CAP across
 *    9  # # # I # # O # # #     RATIO down, COOK down
 *   10  # # # O H I O # # #     OHIO across
 *   11  # # # # # # K # # #     
 * 
 * Words and their intersections:
 * - SIGMA & SKIBIDI share 'S' at (0,0)
 * - SIGMA & GRIDDY share 'G' at (0,2)
 * - SIGMA & AURA share 'A' at (0,4)
 * - BLUD & BUSSIN share 'B' at (0,6)
 * - SUS & AURA share 'U' at (1,4)
 * - RIZZ & RATIO share 'R' at (6,3)
 * - SALTY & RATIO share 'T' at (8,3)
 * - CAP & COOK share 'C' at (8,6)
 * - OHIO & RATIO share 'O' at (10,3)
 * - OHIO & COOK share 'O' at (10,6)
 */

export const crosswordData: CrosswordData = {
  across: {
    "1": {
      clue: "lone wolf grindset archetype, peak masculinity",
      answer: "SIGMA",
      row: 0,
      col: 0,
    },
    "2": {
      clue: "Australian term for 'bro' or 'mate'",
      answer: "BRUV",
      row: 0,
      col: 6,
    },
    "3": {
      clue: "when the imposter is acting kinda...",
      answer: "SUS",
      row: 1,
      col: 3,
    },
    "7": {
      clue: "charisma stat that gets you the number fr fr",
      answer: "RIZZ",
      row: 6,
      col: 3,
    },
    "8": {
      clue: "being bitter about taking an L",
      answer: "SALTY",
      row: 8,
      col: 0,
    },
    "9": {
      clue: "no ___ = i'm being completely serious rn",
      answer: "CAP",
      row: 8,
      col: 6,
    },
    "12": {
      clue: "state where literally anything weird can happen",
      answer: "OHIO",
      row: 10,
      col: 3,
    },
  },
  down: {
    "1": {
      clue: "toilet-dwelling menace with an absolute banger theme song",
      answer: "SKIBIDI",
      row: 0,
      col: 0,
    },
    "4": {
      clue: "post-touchdown dance that went viral",
      answer: "GRIDDY",
      row: 0,
      col: 2,
    },
    "5": {
      clue: "invisible points you gain (+100) or lose (-1000)",
      answer: "AURA",
      row: 0,
      col: 4,
    },
    "6": {
      clue: "when food is so good it's absolutely ___",
      answer: "BUSSIN",
      row: 0,
      col: 6,
    },
    "10": {
      clue: "getting L + ___ in the comments",
      answer: "RATIO",
      row: 6,
      col: 3,
    },
    "11": {
      clue: "'let him ___' ",
      answer: "COOK",
      row: 8,
      col: 6,
    },
  },
};

// === Grid Constants ===

export const GRID_ROWS = 12;
export const GRID_COLS = 10;

// === Grid Cell Type ===

export interface GridCell {
  letter: string | null;  // null = blocked/black cell
  number?: number;        // Clue number displayed in cell (if starting cell)
  acrossClue?: string;    // Which across clue this cell belongs to
  downClue?: string;      // Which down clue this cell belongs to
}

// === Grid Generation ===

/**
 * Generate the visual grid from crossword data
 * 
 * This creates a 2D array of cells, calculating:
 * - Which cells are used (have letters) vs blocked
 * - Clue numbers for starting cells
 * - Which clues each cell belongs to (for highlighting)
 */
export function generateGrid(data: CrosswordData): GridCell[][] {
  // Initialize with all blocked cells
  const grid: GridCell[][] = Array(GRID_ROWS)
    .fill(null)
    .map(() =>
      Array(GRID_COLS)
        .fill(null)
        .map(() => ({ letter: null }))
    );

  // Track starting positions to assign clue numbers
  const numberedCells = new Map<string, number>();
  const cellKey = (row: number, col: number) => `${row},${col}`;

  // Collect all clue starting positions
  const startingPositions: { row: number; col: number; clueNum: string }[] = [];

  for (const [num, clue] of Object.entries(data.across)) {
    startingPositions.push({ row: clue.row, col: clue.col, clueNum: num });
  }
  for (const [num, clue] of Object.entries(data.down)) {
    startingPositions.push({ row: clue.row, col: clue.col, clueNum: num });
  }

  // Sort top-to-bottom, left-to-right (standard crossword numbering)
  startingPositions.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  // Assign sequential numbers to unique starting positions
  let currentNumber = 1;
  for (const pos of startingPositions) {
    const key = cellKey(pos.row, pos.col);
    if (!numberedCells.has(key)) {
      numberedCells.set(key, currentNumber);
      currentNumber++;
    }
  }

  // Fill in across words
  for (const [num, clue] of Object.entries(data.across)) {
    for (let i = 0; i < clue.answer.length; i++) {
      const row = clue.row;
      const col = clue.col + i;
      grid[row][col].letter = clue.answer[i];
      grid[row][col].acrossClue = num;
      if (i === 0) {
        grid[row][col].number = numberedCells.get(cellKey(row, col));
      }
    }
  }

  // Fill in down words (may overlap with across)
  for (const [num, clue] of Object.entries(data.down)) {
    for (let i = 0; i < clue.answer.length; i++) {
      const row = clue.row + i;
      const col = clue.col;
      grid[row][col].letter = clue.answer[i];
      grid[row][col].downClue = num;
      // Only set number if not already set by an across word
      if (i === 0 && !grid[row][col].number) {
        grid[row][col].number = numberedCells.get(cellKey(row, col));
      }
    }
  }

  return grid;
}

// === Solving Utilities ===

/**
 * Represents a clue ready for solving, with all needed context
 */
export interface ClueForSolving {
  number: string;
  direction: "across" | "down";
  clue: string;
  answer: string;     // The correct answer (for checking)
  row: number;
  col: number;
  length: number;
}

/**
 * Get all clues in solving order (by clue number)
 */
export function getCluesInOrder(data: CrosswordData): ClueForSolving[] {
  const clues: ClueForSolving[] = [];

  for (const [num, clue] of Object.entries(data.across)) {
    clues.push({
      number: num,
      direction: "across",
      clue: clue.clue,
      answer: clue.answer,
      row: clue.row,
      col: clue.col,
      length: clue.answer.length,
    });
  }

  for (const [num, clue] of Object.entries(data.down)) {
    clues.push({
      number: num,
      direction: "down",
      clue: clue.clue,
      answer: clue.answer,
      row: clue.row,
      col: clue.col,
      length: clue.answer.length,
    });
  }

  // Sort by clue number for consistent solving order
  clues.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  return clues;
}

/**
 * Get the known letters pattern for a clue based on current grid state
 * 
 * Returns a string like "S_G_A" where filled letters are shown
 * and underscores represent unknown positions.
 * 
 * This is sent to the AI as a hint - intersecting letters help
 * the model deduce answers even for unfamiliar terms.
 */
export function getKnownLetters(
  gridState: (string | null)[][],
  clue: ClueForSolving
): string {
  let known = "";
  for (let i = 0; i < clue.length; i++) {
    const row = clue.direction === "across" ? clue.row : clue.row + i;
    const col = clue.direction === "across" ? clue.col + i : clue.col;
    const letter = gridState[row]?.[col];
    known += letter || "_";
  }
  return known;
}

/**
 * Fill an answer into the grid state
 * Returns a new grid (immutable update)
 */
export function fillAnswer(
  gridState: (string | null)[][],
  clue: ClueForSolving,
  answer: string
): (string | null)[][] {
  const newGrid = gridState.map((row) => [...row]);
  for (let i = 0; i < answer.length; i++) {
    const row = clue.direction === "across" ? clue.row : clue.row + i;
    const col = clue.direction === "across" ? clue.col + i : clue.col;
    newGrid[row][col] = answer[i].toUpperCase();
  }
  return newGrid;
}

/**
 * Create an empty grid state (all nulls)
 * Used to initialize each model's grid at race start
 */
export function createEmptyGridState(): (string | null)[][] {
  return Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLS).fill(null));
}
