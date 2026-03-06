'use client';
import { GamePhase } from '../lib/types';
import ChipTray from './ChipTray';

interface Props {
  phase: GamePhase;
  totalBets: number;
  shoeCount: number;
  canDeal: boolean;
  selectedChip: number;
  onSelectChip: (v: number) => void;
  onDeal: () => void;
}

export default function StatsBar({ phase, totalBets, shoeCount, canDeal, selectedChip, onSelectChip, onDeal }: Props) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.6)', borderTop: '2px solid #7a1826' }}>
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span>Shoe: <strong style={{ color: '#e8c86a' }}>{shoeCount}</strong></span>
          {totalBets > 0 && <span>Total bets: <strong style={{ color: '#e8c86a' }}>${totalBets}</strong></span>}
        </div>

        {phase === 'betting' && (
          <button
            onClick={onDeal}
            disabled={!canDeal}
            className="px-6 py-1.5 rounded-lg font-black uppercase tracking-wider text-sm disabled:opacity-30 transition-all"
            style={{
              background: canDeal ? '#7a1826' : 'rgba(122,24,38,0.3)',
              color: canDeal ? '#fff' : 'rgba(255,255,255,0.3)',
              boxShadow: canDeal ? '0 0 18px rgba(122,24,38,0.6), 0 2px 8px rgba(0,0,0,0.5)' : 'none',
              border: canDeal ? '1px solid rgba(200,80,100,0.5)' : '1px solid transparent',
            }}
          >
            DEAL
          </button>
        )}

        {(phase === 'player-turn' || phase === 'banker-turn') && (
          <div className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded"
            style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}>
            {phase === 'player-turn' ? '▶ Player Turn' : '▶ Banker Turn'}
          </div>
        )}
      </div>
      <ChipTray selected={selectedChip} onSelect={onSelectChip} />
    </div>
  );
}
