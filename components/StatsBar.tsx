'use client';
import { useState } from 'react';
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
  const [showTotal, setShowTotal] = useState(false);

  return (
    <div style={{ background: 'rgba(0,0,0,0.6)', borderTop: '2px solid #7a1826' }}>
      <div className="flex items-center justify-between px-3 py-1.5">

        {/* Bottom-left: shoe count + total bets (hidden until tap) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>
            Shoe: <strong style={{ color: 'rgba(232,200,106,0.6)' }}>{shoeCount}</strong>
          </span>
          {totalBets > 0 && (
            <button
              onClick={() => setShowTotal(s => !s)}
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Total:</span>
              <strong style={{
                color: '#e8c86a',
                fontSize: 22,
                fontFamily: 'Georgia, serif',
                letterSpacing: '0.05em',
                filter: showTotal ? 'none' : 'blur(6px)',
                transition: 'filter 0.2s',
                userSelect: 'none',
              }}>
                ${totalBets}
              </strong>
            </button>
          )}
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
              touchAction: 'manipulation',
              minWidth: 72,
              minHeight: 40,
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
