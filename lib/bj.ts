import { Card, Suit, Rank } from './types';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export const RANKS_ACE_TO_NINE: Rank[] = ['A','2','3','4','5','6','7','8','9'];

export function randomSuit(): Suit {
  return SUITS[Math.floor(Math.random() * SUITS.length)];
}

export function randomRank(noFace = false): Rank {
  const pool = noFace ? RANKS_ACE_TO_NINE : RANKS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Raw rank value for BJ: A=11, 2-9=pip, 10/J/Q/K=10 */
export function bjRankValue(rank: Rank): number {
  if (rank === 'A') return 11;
  const n = parseInt(rank);
  if (!isNaN(n)) return Math.min(n, 10);
  return 10; // J, Q, K
}

export function makeCard(rank: Rank, suit?: Suit): Card {
  return { rank, suit: suit ?? randomSuit(), value: bjRankValue(rank) };
}

export function randomCard(noFace = false): Card {
  return makeCard(randomRank(noFace));
}

/** BJ total: aces start as 11, reduce by 10 each time hand busts */
export function bjTotal(hand: Card[]): number {
  let total = hand.reduce((s, c) => s + bjRankValue(c.rank), 0);
  let aces = hand.filter(c => c.rank === 'A').length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

export function isBust(hand: Card[]): boolean {
  return bjTotal(hand) > 21;
}

/** True if the hand has an ace counting as 11 */
export function isSoft(hand: Card[]): boolean {
  const hasAce = hand.some(c => c.rank === 'A');
  if (!hasAce) return false;
  const hardTotal = hand.reduce((s, c) => s + (c.rank === 'A' ? 1 : bjRankValue(c.rank)), 0);
  return hardTotal + 10 <= 21;
}

/** Generate 4 nearby answer options including the correct one */
export function makeOptions(correct: number, min = 2, max = 31): number[] {
  const pool = new Set([correct]);
  const candidates: number[] = [];
  for (let d = 1; d <= 20; d++) {
    if (correct - d >= min) candidates.push(correct - d);
    if (correct + d <= max) candidates.push(correct + d);
  }
  candidates.sort(() => Math.random() - 0.5);
  for (const n of candidates) { if (pool.size >= 4) break; pool.add(n); }
  return [...pool].sort(() => Math.random() - 0.5);
}

/** Random hand of n cards */
export function randomHand(n: number, noFace = false): Card[] {
  return Array.from({ length: n }, () => randomCard(noFace));
}
