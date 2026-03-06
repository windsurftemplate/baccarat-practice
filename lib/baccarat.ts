import { Card, Suit, Rank, Bets, RoundOutcome, PlayerRoundResult, TablePlayer } from './types';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function rankValue(rank: Rank): number {
  if (rank === 'A') return 1;
  const n = parseInt(rank);
  if (!isNaN(n)) return n >= 10 ? 0 : n;
  return 0;
}

export const EMPTY_BETS: Bets = {
  player: 0, banker: 0, tie: 0,
  gold7: 0, jade8: 0, ruby: 0,
};

const PLAYER_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];
let playerCounter = 1;

export function makePlayer(overrides: Partial<{ name: string; balance: number }> = {}): import('./types').TablePlayer {
  const idx = (playerCounter - 1) % PLAYER_COLORS.length;
  return {
    id: `p${playerCounter}`,
    name: overrides.name ?? `Player ${playerCounter++}`,
    balance: overrides.balance ?? 1000,
    bets: { ...EMPTY_BETS },
    color: PLAYER_COLORS[idx],
  };
}

export function createShoe(numDecks = 8): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < numDecks; d++)
    for (const suit of SUITS)
      for (const rank of RANKS)
        shoe.push({ suit, rank, value: rankValue(rank) });

  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

export function handTotal(cards: Card[]): number {
  return cards.reduce((s, c) => s + c.value, 0) % 10;
}

/** True if player hand should draw (per Punto Banco rules) */
export function playerShouldDraw(total: number): boolean {
  return total <= 5;
}

/** True if banker hand should draw (per Punto Banco rules) */
export function bankerShouldDraw(bankerTotal: number, playerThird: Card | null): boolean {
  if (!playerThird) return bankerTotal <= 5;
  const v = playerThird.value;
  switch (bankerTotal) {
    case 0: case 1: case 2: return true;
    case 3: return v !== 8;
    case 4: return v >= 2 && v <= 7;
    case 5: return v >= 4 && v <= 7;
    case 6: return v === 6 || v === 7;
    default: return false;
  }
}

export function dealInitial(shoe: Card[]): {
  playerHand: Card[];
  bankerHand: Card[];
  remainingShoe: Card[];
} {
  const s = [...shoe];
  const draw = () => s.shift()!;
  return {
    playerHand: [draw(), draw()],
    bankerHand: [draw(), draw()],
    remainingShoe: s,
  };
}

export function drawCard(shoe: Card[]): { card: Card; remainingShoe: Card[] } {
  const s = [...shoe];
  return { card: s.shift()!, remainingShoe: s };
}

export function determineOutcome(playerHand: Card[], bankerHand: Card[]): RoundOutcome {
  const pTotal = handTotal(playerHand);
  const bTotal = handTotal(bankerHand);

  let winner: RoundOutcome['winner'];
  if (pTotal > bTotal) winner = 'player';
  else if (bTotal > pTotal) winner = 'banker';
  else winner = 'tie';

  const p3 = playerHand.length === 3;
  const b3 = bankerHand.length === 3;

  const isGold7     = winner === 'banker' && b3 && bTotal === 7;
  const isJade8     = winner === 'player' && p3 && pTotal === 8;
  const isBigRuby   = p3 && b3 && pTotal === 9 && bTotal === 9;
  const isSmallRuby = !isBigRuby && (
    (winner === 'player' && p3 && pTotal === 9) ||
    (winner === 'banker' && b3 && bTotal === 9)
  );
  const rubyPayout: 10 | 75 | 0 = isBigRuby ? 75 : isSmallRuby ? 10 : 0;

  return { winner, playerTotal: pTotal, bankerTotal: bTotal, isGold7, isJade8, isSmallRuby, isBigRuby, rubyPayout };
}

export function calculatePayouts(outcome: RoundOutcome, bets: Bets): Bets {
  const { winner, isGold7, isJade8, isBigRuby, isSmallRuby, rubyPayout } = outcome;
  const p: Bets = { ...EMPTY_BETS };

  // Player base bet
  if (winner === 'player') p.player = bets.player;
  else if (winner === 'banker') p.player = -bets.player;
  else p.player = isBigRuby ? 0 : bets.player; // tie: 1:1 normally, push on Big Ruby

  // Banker base bet
  if (winner === 'banker') p.banker = isGold7 ? 0 : bets.banker; // Gold7 → push
  else if (winner === 'player') p.banker = -bets.banker;
  else p.banker = isBigRuby ? 0 : bets.banker; // tie: 1:1 normally, push on Big Ruby

  // Tie bet
  p.tie = winner === 'tie' ? bets.tie * 9 : -bets.tie;

  // Side bets
  p.gold7 = isGold7   ? bets.gold7 * 40 : -bets.gold7;
  p.jade8 = isJade8   ? bets.jade8 * 25 : -bets.jade8;
  p.ruby  = rubyPayout > 0 ? bets.ruby * rubyPayout : -bets.ruby;

  return p;
}

export function buildPlayerResult(
  player: TablePlayer,
  outcome: RoundOutcome,
): PlayerRoundResult {
  const payouts = calculatePayouts(outcome, player.bets);
  const netChange = Object.values(payouts).reduce((s, v) => s + v, 0);
  return { playerId: player.id, playerName: player.name, betsPlaced: { ...player.bets }, payouts, netChange };
}

/** Generate a random bet for a player (auto-bet) */
export function autoGenerateBets(balance: number): Bets {
  const base = balance >= 500 ? 25 : balance >= 100 ? 10 : 5;
  const bets: Bets = { ...EMPTY_BETS };

  const r = Math.random();
  const chips = 1 + Math.floor(Math.random() * 4);
  if (r < 0.48)      bets.player = base * chips;
  else if (r < 0.96) bets.banker = base * chips;
  else               bets.tie = base;

  if (Math.random() < 0.2) bets.gold7 = base;
  if (Math.random() < 0.2) bets.jade8 = base;
  if (Math.random() < 0.15) bets.ruby = base;

  const total = Object.values(bets).reduce((s, v) => s + v, 0);
  if (total > balance) return { ...EMPTY_BETS, player: Math.min(base, balance) };
  return bets;
}

export function totalBetAmount(bets: Bets): number {
  return Object.values(bets).reduce((s, v) => s + v, 0);
}
