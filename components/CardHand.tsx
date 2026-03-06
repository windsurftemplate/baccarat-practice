'use client';
import { Card as CardType } from '../lib/types';
import Card from './Card';

interface Props {
  label: string;
  hand: CardType[];
  total: number | null;
  winner?: boolean;
}

export default function CardHand({ label, hand, total, winner }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label */}
      <div
        className="text-xs font-bold tracking-widest uppercase px-3 py-0.5 rounded"
        style={{
          color: label === 'PLAYER' ? '#93c5fd' : '#fca5a5',
          background: label === 'PLAYER' ? 'rgba(37,99,235,0.25)' : 'rgba(220,38,38,0.25)',
          border: `1px solid ${label === 'PLAYER' ? 'rgba(37,99,235,0.5)' : 'rgba(220,38,38,0.5)'}`,
        }}
      >
        {label}
      </div>

      {/* Cards row */}
      <div className="flex gap-1 items-center" style={{ minHeight: 216 }}>
        {hand.length === 0 ? (
          <div className="flex gap-1">
            {[0, 1].map(i => (
              <div
                key={i}
                style={{ width: 152, height: 216, borderRadius: 6, border: '2px dashed rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.12)' }}
              />
            ))}
          </div>
        ) : (
          hand.map((card, i) => (
            <Card key={i} card={card} delay={i * 200} />
          ))
        )}
      </div>

      {/* Score bubble */}
      {total !== null && hand.length > 0 && (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold"
          style={{
            background: winner
              ? (label === 'PLAYER' ? '#2563eb' : '#dc2626')
              : 'rgba(0,0,0,0.5)',
            color: winner ? '#fff' : 'rgba(255,255,255,0.7)',
            border: winner
              ? `2px solid ${label === 'PLAYER' ? '#60a5fa' : '#f87171'}`
              : '2px solid rgba(255,255,255,0.2)',
            boxShadow: winner ? '0 0 12px rgba(255,255,255,0.3)' : 'none',
          }}
        >
          {total}
        </div>
      )}
    </div>
  );
}
