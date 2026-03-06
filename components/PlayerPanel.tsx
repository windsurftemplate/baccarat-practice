'use client';
import { TablePlayer, GamePhase, Action } from '../lib/types';
import PlayerCard from './PlayerCard';

interface Props {
  players: TablePlayer[];
  activePlayerId: string | null;
  phase: GamePhase;
  dispatch: (action: Action) => void;
}

export default function PlayerPanel({ players, activePlayerId, phase, dispatch }: Props) {
  const isBetting = phase === 'betting';

  return (
    <div
      className="flex items-stretch gap-2 px-3 py-2 overflow-x-auto"
      style={{ background: 'rgba(0,0,0,0.5)', borderTop: '2px solid #7a1826' }}
    >
      {players.map((p, i) => (
        <PlayerCard
          key={p.id}
          player={p}
          position={i + 1}
          isActive={p.id === activePlayerId}
          isBetting={isBetting}
          onSelect={() => dispatch({ type: 'SELECT_PLAYER', id: p.id })}
          onAutobet={() => dispatch({ type: 'AUTOBET', id: p.id })}
          onRemove={() => dispatch({ type: 'REMOVE_PLAYER', id: p.id })}
          onClearBets={() => dispatch({ type: 'CLEAR_PLAYER_BETS', id: p.id })}
        />
      ))}

      {/* Add player button */}
      {isBetting && players.length < 6 && (
        <button
          className="flex flex-col items-center justify-center rounded-xl px-4 py-2 gap-1 transition-colors"
          style={{
            border: '2px dashed rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.4)',
            minWidth: 80,
            background: 'transparent',
          }}
          onClick={() => dispatch({ type: 'ADD_PLAYER' })}
        >
          <span className="text-2xl">+</span>
          <span className="text-xs tracking-wider">Seat</span>
        </button>
      )}
    </div>
  );
}
