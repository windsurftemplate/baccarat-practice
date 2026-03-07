export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

export interface Bets {
  player: number;
  banker: number;
  tie: number;
  gold7: number;
  jade8: number;
  ruby: number;
}
export type BetKey = keyof Bets;

/** The outcome facts for a round — independent of any player's bet amounts */
export interface RoundOutcome {
  winner: 'player' | 'banker' | 'tie';
  playerTotal: number;
  bankerTotal: number;
  isGold7: boolean;
  isJade8: boolean;
  isSmallRuby: boolean;
  isBigRuby: boolean;
  rubyPayout: 10 | 75 | 0;
}

export interface PlayerRoundResult {
  playerId: string;
  playerName: string;
  betsPlaced: Bets;
  payouts: Bets;
  netChange: number;
}

export interface RoundResult {
  playerHand: Card[];
  bankerHand: Card[];
  outcome: RoundOutcome;
  playerResults: PlayerRoundResult[];
}

/** A person sitting at the table placing bets */
export interface TablePlayer {
  id: string;
  name: string;
  balance: number;
  bets: Bets;
  color: string;
}

/**
 * betting      → dealer sets bets for each player, then hits Deal
 * player-turn  → dealer decides HIT or STAND for the Player hand
 * banker-turn  → dealer decides HIT or STAND for the Banker hand
 * result       → payouts shown
 */
export type GamePhase = 'betting' | 'player-turn' | 'banker-turn' | 'result';

export interface GameState {
  phase: GamePhase;
  shoe: Card[];
  playerHand: Card[];
  bankerHand: Card[];
  players: TablePlayer[];
  activePlayerId: string | null;
  selectedChip: number;
  result: RoundResult | null;
  history: RoundResult[];
}

export type Action =
  | { type: 'SELECT_CHIP'; chip: number }
  | { type: 'SELECT_PLAYER'; id: string }
  | { type: 'PLACE_BET'; zone: BetKey; playerId: string }
  | { type: 'CLEAR_PLAYER_BETS'; id: string }
  | { type: 'AUTOBET'; id: string }
  | { type: 'ADD_PLAYER' }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'DEAL' }
  | { type: 'PLAYER_HIT' }
  | { type: 'PLAYER_STAND' }
  | { type: 'BANKER_HIT' }
  | { type: 'BANKER_STAND' }
  | { type: 'NEXT_ROUND' }
  | { type: 'REBET' }
  | { type: 'SET_BALANCE'; id: string; balance: number };
