'use client';
import { Card as CardType } from '../lib/types';

const SUIT_SYMBOL: Record<string, string> = {
  spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣',
};

const isRed = (suit: string) => suit === 'hearts' || suit === 'diamonds';

interface Props {
  card: CardType;
  delay?: number;
  faceDown?: boolean;
}

export default function Card({ card, delay = 0, faceDown = false }: Props) {
  if (faceDown) {
    return (
      <div
        className="playing-card deal-animate"
        style={{
          width: 152, height: 216,
          animationDelay: `${delay}ms`,
          background: '#1a3a8c',
          border: '2px solid #c8a44a',
        }}
      >
        <div className="w-full h-full rounded flex items-center justify-center"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #1e45a0 0, #1e45a0 2px, transparent 0, transparent 50%)',
            backgroundSize: '8px 8px',
          }} />
      </div>
    );
  }

  const sym = SUIT_SYMBOL[card.suit];
  const red = isRed(card.suit);
  const color = red ? '#c0392b' : '#1a1a2e';

  return (
    <div
      className="playing-card deal-animate select-none"
      style={{ width: 152, height: 216, animationDelay: `${delay}ms` }}
    >
      {/* Top-left */}
      <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 30, color, lineHeight: 1.1 }}>
        <div style={{ fontWeight: 800 }}>{card.rank}</div>
        <div style={{ fontSize: 24 }}>{sym}</div>
      </div>

      {/* Center suit */}
      <div style={{ fontSize: 68, color }}>{sym}</div>

      {/* Bottom-right (rotated) */}
      <div style={{
        position: 'absolute', bottom: 8, right: 12, fontSize: 30,
        color, lineHeight: 1.1, transform: 'rotate(180deg)',
      }}>
        <div style={{ fontWeight: 800 }}>{card.rank}</div>
        <div style={{ fontSize: 24 }}>{sym}</div>
      </div>
    </div>
  );
}
