'use client';
import { TablePlayer } from '../lib/types';
import { totalBetAmount } from '../lib/baccarat';

interface Props {
  player: TablePlayer;
  position: number;
  isActive: boolean;
  isBetting: boolean;
  onSelect: () => void;
  onAutobet: () => void;
  onRemove: () => void;
  onClearBets: () => void;
}

const BET_LABELS: Record<string, string> = {
  player: 'P', banker: 'B', tie: 'T', gold7: 'G7', jade8: 'J8', ruby: 'Rb',
};

export default function PlayerCard({ player, position, isActive, isBetting, onSelect, onAutobet, onRemove, onClearBets }: Props) {
  const total = totalBetAmount(player.bets);
  const hasBets = total > 0;

  const activeBets = Object.entries(player.bets)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${BET_LABELS[k]}:$${v}`)
    .join(' ');

  return (
    <div
      className="relative flex flex-col gap-1 rounded-xl cursor-pointer select-none transition-all overflow-hidden"
      style={{
        background: isActive ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)',
        border: `2px solid ${isActive ? player.color : 'rgba(255,255,255,0.1)'}`,
        boxShadow: isActive ? `0 0 16px ${player.color}44` : 'none',
        minWidth: 130,
      }}
      onClick={onSelect}
    >
      {/* Position number — top-left like casino table */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 28,
        height: 28,
        background: isActive ? player.color : 'rgba(255,255,255,0.07)',
        borderBottomRightRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 900,
        color: isActive ? '#000' : 'rgba(255,255,255,0.35)',
        fontFamily: 'Georgia, serif',
      }}>
        {position}
      </div>

      {/* Remove button */}
      <button
        className="absolute top-1 right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
        onClick={e => { e.stopPropagation(); onRemove(); }}
      >
        ✕
      </button>

      {/* Content */}
      <div className="flex flex-col gap-1 p-2 pt-7">
        {/* Name */}
        <span className="text-xs font-bold truncate pr-2" style={{ color: player.color }}>{player.name}</span>

        {/* Balance */}
        <div className="text-sm font-black" style={{ color: '#e8c86a', fontFamily: 'Georgia, serif' }}>
          ${player.balance.toLocaleString()}
        </div>

        {/* Current bets */}
        {hasBets ? (
          <div className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.6)' }}>{activeBets}</div>
        ) : (
          <div className="text-xs italic" style={{ color: 'rgba(255,255,255,0.25)' }}>No bets</div>
        )}

        {/* Actions */}
        {isBetting && (
          <div className="flex gap-1 mt-0.5">
            <button
              className="flex-1 text-xs rounded px-1 py-0.5 font-bold tracking-wide"
              style={{ background: '#16a34a', color: '#fff' }}
              onClick={e => { e.stopPropagation(); onAutobet(); }}
            >
              Auto
            </button>
            {hasBets && (
              <button
                className="flex-1 text-xs rounded px-1 py-0.5 font-semibold"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                onClick={e => { e.stopPropagation(); onClearBets(); }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
