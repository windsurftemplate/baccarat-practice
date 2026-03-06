import { RoundResult } from './types';

export interface BigRoadCell {
  winner: 'player' | 'banker';
  ties: number;
}
export type BigRoadColumn = BigRoadCell[];

export function buildBigRoad(history: RoundResult[]): BigRoadColumn[] {
  const columns: BigRoadColumn[] = [];
  let lastNonTie: 'player' | 'banker' | null = null;

  for (const round of history) {
    const w = round.outcome.winner;
    if (w === 'tie') {
      if (columns.length > 0) {
        const lastCol = columns[columns.length - 1];
        lastCol[lastCol.length - 1].ties++;
      }
      continue;
    }

    if (lastNonTie === null || w !== lastNonTie) {
      columns.push([{ winner: w, ties: 0 }]);
    } else {
      const lastCol = columns[columns.length - 1];
      if (lastCol.length >= 6) {
        columns.push([{ winner: w, ties: 0 }]);
      } else {
        lastCol.push({ winner: w, ties: 0 });
      }
    }
    lastNonTie = w;
  }

  return columns;
}

export interface BeadCell { winner: 'player' | 'banker' | 'tie'; }

export function buildBeadPlate(history: RoundResult[]): BeadCell[][] {
  const ROWS = 6;
  const columns: BeadCell[][] = [];
  for (let i = 0; i < history.length; i++) {
    const col = Math.floor(i / ROWS);
    const row = i % ROWS;
    if (row === 0) columns.push([]);
    columns[col][row] = { winner: history[i].outcome.winner };
  }
  return columns;
}
