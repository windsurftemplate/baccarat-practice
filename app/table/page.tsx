'use client';
import { useReducer } from 'react';
import { GameState, Action } from '../../lib/types';
import {
  EMPTY_BETS, createShoe, makePlayer,
  dealInitial, drawCard, determineOutcome, buildPlayerResult,
  autoGenerateBets, totalBetAmount,
} from '../../lib/baccarat';
import BaccaratTable from '../../components/BaccaratTable';

const firstPlayer = makePlayer({ name: 'Player 1' });

const initialState: GameState = {
  phase: 'betting',
  shoe: createShoe(),
  playerHand: [],
  bankerHand: [],
  players: [firstPlayer],
  activePlayerId: firstPlayer.id,
  selectedChip: 25,
  result: null,
  history: [],
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {

    case 'SELECT_CHIP':
      return { ...state, selectedChip: action.chip };

    case 'SELECT_PLAYER':
      return { ...state, activePlayerId: action.id };

    case 'PLACE_BET': {
      if (state.phase !== 'betting') return state;
      const player = state.players.find(p => p.id === action.playerId);
      if (!player) return state;
      const newAmount = player.bets[action.zone] + state.selectedChip;
      const newTotal = totalBetAmount({ ...player.bets, [action.zone]: newAmount });
      if (newTotal > player.balance) return state;
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.playerId
            ? { ...p, bets: { ...p.bets, [action.zone]: newAmount } }
            : p
        ),
      };
    }

    case 'CLEAR_PLAYER_BETS':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.id ? { ...p, bets: { ...EMPTY_BETS } } : p
        ),
      };

    case 'AUTOBET': {
      const player = state.players.find(p => p.id === action.id);
      if (!player) return state;
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.id ? { ...p, bets: autoGenerateBets(p.balance) } : p
        ),
      };
    }

    case 'ADD_PLAYER': {
      if (state.players.length >= 6) return state;
      const newPlayer = makePlayer();
      return {
        ...state,
        players: [...state.players, newPlayer],
        activePlayerId: newPlayer.id,
      };
    }

    case 'REMOVE_PLAYER': {
      if (state.players.length <= 1) return state;
      const remaining = state.players.filter(p => p.id !== action.id);
      const newActive = state.activePlayerId === action.id ? remaining[0].id : state.activePlayerId;
      return { ...state, players: remaining, activePlayerId: newActive };
    }

    case 'DEAL': {
      if (state.phase !== 'betting') return state;
      const hasBets = state.players.some(p => totalBetAmount(p.bets) > 0);
      if (!hasBets) return state;

      let shoe = state.shoe;
      if (shoe.length < 52) shoe = createShoe();

      const { playerHand, bankerHand, remainingShoe } = dealInitial(shoe);
      const pTotal = playerHand.reduce((s, c) => s + c.value, 0) % 10;
      const bTotal = bankerHand.reduce((s, c) => s + c.value, 0) % 10;

      // Natural: skip hit/stand decisions
      if (pTotal >= 8 || bTotal >= 8) {
        return finishRound({ ...state, shoe: remainingShoe }, playerHand, bankerHand, remainingShoe);
      }

      return {
        ...state,
        phase: 'player-turn',
        shoe: remainingShoe,
        playerHand,
        bankerHand,
      };
    }

    case 'PLAYER_HIT': {
      if (state.phase !== 'player-turn') return state;
      const { card, remainingShoe } = drawCard(state.shoe);
      return { ...state, phase: 'banker-turn', shoe: remainingShoe, playerHand: [...state.playerHand, card] };
    }

    case 'PLAYER_STAND':
      if (state.phase !== 'player-turn') return state;
      return { ...state, phase: 'banker-turn' };

    case 'BANKER_HIT': {
      if (state.phase !== 'banker-turn') return state;
      const { card, remainingShoe } = drawCard(state.shoe);
      return finishRound(state, state.playerHand, [...state.bankerHand, card], remainingShoe);
    }

    case 'BANKER_STAND':
      if (state.phase !== 'banker-turn') return state;
      return finishRound(state, state.playerHand, state.bankerHand, state.shoe);

    case 'NEXT_ROUND':
      return {
        ...state,
        phase: 'betting',
        playerHand: [],
        bankerHand: [],
        players: state.players.map(p => ({ ...p, bets: { ...EMPTY_BETS } })),
        result: null,
      };

    case 'SET_BALANCE':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.id ? { ...p, balance: action.balance } : p
        ),
      };

    case 'REBET': {
      if (state.phase !== 'betting' || !state.result) return state;
      return {
        ...state,
        players: state.players.map(p => {
          const lastBets = state.result!.playerResults.find(r => r.playerId === p.id)?.betsPlaced;
          if (!lastBets) return p;
          return totalBetAmount(lastBets) <= p.balance ? { ...p, bets: { ...lastBets } } : p;
        }),
      };
    }

    default:
      return state;
  }
}

function finishRound(
  state: GameState,
  playerHand: GameState['playerHand'],
  bankerHand: GameState['bankerHand'],
  shoe: GameState['shoe'],
): GameState {
  const outcome = determineOutcome(playerHand, bankerHand);
  const playerResults = state.players
    .filter(p => totalBetAmount(p.bets) > 0)
    .map(p => buildPlayerResult(p, outcome));
  const result = { playerHand, bankerHand, outcome, playerResults };
  return {
    ...state,
    phase: 'result',
    shoe,
    playerHand,
    bankerHand,
    players: state.players.map(p => {
      const pr = playerResults.find(r => r.playerId === p.id);
      return pr ? { ...p, balance: p.balance + pr.netChange } : p;
    }),
    result,
    history: [...state.history, result],
  };
}

export default function Page() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <BaccaratTable state={state} dispatch={dispatch} />;
}
