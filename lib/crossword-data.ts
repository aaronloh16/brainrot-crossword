// Crossword puzzle data for the Brainrot AI Race
// Grid is 10 rows x 8 columns

export interface ClueData {
  clue: string;
  answer: string;
  row: number;
  col: number;
}

export interface CrosswordData {
  across: Record<string, ClueData>;
  down: Record<string, ClueData>;
}

// The crossword grid layout:
//       0 1 2 3 4 5 6 7
//    0  S I G M A # # #     1-ACROSS: SIGMA
//    1  U # Y # # # # #     1-DOWN: SUS, 2-DOWN: GYATT
//    2  S # A # # # # #     
//    3  # S T # # # # #     3-DOWN: SKIBIDI
//    4  # K T # # # R #     4-DOWN: RATIO
//    5  R I Z Z C # A #     5-ACROSS: RIZZ, 6-DOWN: COOK
//    6  # B # # O # T #     
//    7  # I # # O H I O     7-ACROSS: OHIO
//    8  # D # # K # O #     
//    9  # I # # # # # #     

export const crosswordData: CrosswordData = {
  across: {
    "1": {
      clue: "Lone wolf grindset archetype",
      answer: "SIGMA",
      row: 0,
      col: 0,
    },
    "5": {
      clue: "Charisma stat that unlocks the number",
      answer: "RIZZ",
      row: 5,
      col: 0,
    },
    "7": {
      clue: "State where everything is allegedly sus",
      answer: "OHIO",
      row: 7,
      col: 4,
    },
  },
  down: {
    "1": {
      clue: "Short for suspicious, thanks to a certain game",
      answer: "SUS",
      row: 0,
      col: 0,
    },
    "2": {
      clue: "Exclamation upon witnessing substantial curves",
      answer: "GYATT",
      row: 0,
      col: 2,
    },
    "3": {
      clue: "Toilet-dwelling antagonist with catchy tune",
      answer: "SKIBIDI",
      row: 3,
      col: 1,
    },
    "4": {
      clue: "Getting owned when replies exceed likes",
      answer: "RATIO",
      row: 4,
      col: 6,
    },
    "6": {
      clue: '"Let him ___" - genius at work',
      answer: "COOK",
      row: 5,
      col: 4,
    },
  },
};

// Grid dimensions
export const GRID_ROWS = 10;
export const GRID_COLS = 8;

// Type for a cell in the grid
export interface GridCell {
  letter: string | null; // null means blocked cell
  number?: number; // clue number if this is a starting cell
  acrossClue?: string; // clue number for across word this cell belongs to
  downClue?: string; // clue number for down word this cell belongs to
}

// Generate the grid from crossword data
export function generateGrid(data: CrosswordData): GridCell[][] {
  // Initialize empty grid
  const grid: GridCell[][] = Array(GRID_ROWS)
    .fill(null)
    .map(() =>
      Array(GRID_COLS)
        .fill(null)
        .map(() => ({ letter: null }))
    );

  // Track which cells have numbers
  const numberedCells = new Map<string, number>();

  // Helper to get cell key
  const cellKey = (row: number, col: number) => `${row},${col}`;

  // Collect all starting positions and assign numbers
  const startingPositions: { row: number; col: number; clueNum: string }[] = [];

  for (const [num, clue] of Object.entries(data.across)) {
    startingPositions.push({ row: clue.row, col: clue.col, clueNum: num });
  }
  for (const [num, clue] of Object.entries(data.down)) {
    startingPositions.push({ row: clue.row, col: clue.col, clueNum: num });
  }

  // Sort by position (top to bottom, left to right)
  startingPositions.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  // Assign numbers to unique positions
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

  // Fill in down words
  for (const [num, clue] of Object.entries(data.down)) {
    for (let i = 0; i < clue.answer.length; i++) {
      const row = clue.row + i;
      const col = clue.col;
      grid[row][col].letter = clue.answer[i];
      grid[row][col].downClue = num;
      if (i === 0 && !grid[row][col].number) {
        grid[row][col].number = numberedCells.get(cellKey(row, col));
      }
    }
  }

  return grid;
}

// Get all clues in order for solving
export interface ClueForSolving {
  number: string;
  direction: "across" | "down";
  clue: string;
  answer: string;
  row: number;
  col: number;
  length: number;
}

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

  // Sort by clue number
  clues.sort((a, b) => parseInt(a.number) - parseInt(b.number));

  return clues;
}

// Get known letters for a clue based on current grid state
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

// Fill answer into grid state
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

// Create empty grid state
export function createEmptyGridState(): (string | null)[][] {
  return Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLS).fill(null));
}

