'use client';
import { Card as CardType } from '../lib/types';
import Card from './Card';

interface Props {
  label: string;
  hand: CardType[];
  total: number | null;
  winner?: boolean;
  /** Offset for interleaved deal order: PLAYER=0, BANKER=200 */
  startDelay?: number;
}

export default function CardHand({ label, hand, total, winner, startDelay = 0 }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Cards row — no empty placeholders; show nothing until dealt */}
      <div className="flex gap-1 items-end" style={{ minHeight: 'clamp(74px, 13vw, 216px)' }}>
        {hand.map((card, i) => (
          // Interleaved delay: P1=0, B1=200, P2=400, B2=600
          <Card key={i} card={card} delay={startDelay + i * 400} />
        ))}
      </div>

      {/* Score bubble */}
      {total !== null && hand.length > 0 && (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold"
          style={{
            background: winner
              ? (label === 'PLAYER' ? '#2563eb' : '#dc2626')
              : 'rgba(0,0,0,0.55)',
            color: winner ? '#fff' : 'rgba(255,255,255,0.75)',
            border: winner
              ? `2px solid ${label === 'PLAYER' ? '#60a5fa' : '#f87171'}`
              : '2px solid rgba(255,255,255,0.2)',
            boxShadow: winner ? '0 0 14px rgba(255,255,255,0.35)' : 'none',
          }}
        >
          {total}
        </div>
      )}
    </div>
  );
}
