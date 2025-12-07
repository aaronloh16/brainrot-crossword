// Crossword puzzle data for the Brainrot AI Race
// Grid is 12 rows x 10 columns - expanded version with 13 words!

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

// The crossword grid layout (12 x 10):
//       0 1 2 3 4 5 6 7 8 9
//    0  S I G M A # B L U D     1-ACROSS: SIGMA, 2-ACROSS: BLUD
//    1  K # R S U S U # # #     3-ACROSS: SUS
//    2  I # I # R # S # # #     
//    3  B # D # A # S # # #     
//    4  I # D # # # I # # #     1-DOWN: SKIBIDI, 4-DOWN: GRIDDY
//    5  D # Y # # # N # # #     5-DOWN: AURA, 6-DOWN: BUSSIN
//    6  I # # R I Z Z # # #     7-ACROSS: RIZZ
//    7  # # # A # # # # # #     
//    8  G Y A T T # C A P #     8-ACROSS: GYATT, 9-ACROSS: CAP
//    9  # # # I # # O # # #     10-DOWN: RATIO, 11-DOWN: COOK
//   10  # # # O H I O # # #     12-ACROSS: OHIO
//   11  # # # # # # K # # #     

export const crosswordData: CrosswordData = {
  across: {
    "1": {
      clue: "Lone wolf grindset archetype, male in his prime",
      answer: "SIGMA",
      row: 0,
      col: 0,
    },
    "2": {
      clue: "British term for 'bro' or 'mate'",
      answer: "BLUD",
      row: 0,
      col: 6,
    },
    "3": {
      clue: "When the imposter is acting kinda...",
      answer: "SUS",
      row: 1,
      col: 3,
    },
    "7": {
      clue: "Charisma stat that gets you the number fr fr",
      answer: "RIZZ",
      row: 6,
      col: 3,
    },
    "8": {
      clue: "What you exclaim when you see something... substantial",
      answer: "GYATT",
      row: 8,
      col: 0,
    },
    "9": {
      clue: "No ___ = I'm being completely serious rn",
      answer: "CAP",
      row: 8,
      col: 6,
    },
    "12": {
      clue: "State where literally anything weird can happen",
      answer: "OHIO",
      row: 10,
      col: 3,
    },
  },
  down: {
    "1": {
      clue: "Toilet-dwelling menace with an absolute banger of a theme song",
      answer: "SKIBIDI",
      row: 0,
      col: 0,
    },
    "4": {
      clue: "Post-touchdown dance that went absolutely viral",
      answer: "GRIDDY",
      row: 0,
      col: 2,
    },
    "5": {
      clue: "Invisible points you gain (+100) or lose (-1000)",
      answer: "AURA",
      row: 0,
      col: 4,
    },
    "6": {
      clue: "When food is so good it's absolutely ___",
      answer: "BUSSIN",
      row: 0,
      col: 6,
    },
    "10": {
      clue: "Getting L + ___ in the comments",
      answer: "RATIO",
      row: 6,
      col: 3,
    },
    "11": {
      clue: "'Let him ___' - he's about to do something crazy",
      answer: "COOK",
      row: 8,
      col: 6,
    },
  },
};

// Grid dimensions
export const GRID_ROWS = 12;
export const GRID_COLS = 10;

// Type for a cell in the grid
export interface GridCell {
  letter: string | null;
  number?: number;
  acrossClue?: string;
  downClue?: string;
}

// Generate the grid from crossword data
export function generateGrid(data: CrosswordData): GridCell[][] {
  const grid: GridCell[][] = Array(GRID_ROWS)
    .fill(null)
    .map(() =>
      Array(GRID_COLS)
        .fill(null)
        .map(() => ({ letter: null }))
    );

  const numberedCells = new Map<string, number>();
  const cellKey = (row: number, col: number) => `${row},${col}`;

  const startingPositions: { row: number; col: number; clueNum: string }[] = [];

  for (const [num, clue] of Object.entries(data.across)) {
    startingPositions.push({ row: clue.row, col: clue.col, clueNum: num });
  }
  for (const [num, clue] of Object.entries(data.down)) {
    startingPositions.push({ row: clue.row, col: clue.col, clueNum: num });
  }

  startingPositions.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  let currentNumber = 1;
  for (const pos of startingPositions) {
    const key = cellKey(pos.row, pos.col);
    if (!numberedCells.has(key)) {
      numberedCells.set(key, currentNumber);
      currentNumber++;
    }
  }

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

  clues.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  return clues;
}

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

export function createEmptyGridState(): (string | null)[][] {
  return Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLS).fill(null));
}
