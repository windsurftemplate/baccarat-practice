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

const CARD_W = 'clamp(52px, 9vw, 152px)';
const CARD_H = 'clamp(74px, 13vw, 216px)';

export default function Card({ card, delay = 0, faceDown = false }: Props) {
  if (faceDown) {
    return (
      <div
        className="playing-card deal-animate"
        style={{
          width: CARD_W, height: CARD_H,
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
      style={{ width: CARD_W, height: CARD_H, animationDelay: `${delay}ms` }}
    >
      {/* Top-left */}
      <div style={{ position: 'absolute', top: '5%', left: '8%', fontSize: 'clamp(12px, 2.5vw, 30px)', color, lineHeight: 1.1 }}>
        <div style={{ fontWeight: 800 }}>{card.rank}</div>
        <div style={{ fontSize: 'clamp(10px, 2vw, 24px)' }}>{sym}</div>
      </div>

      {/* Center suit */}
      <div style={{ fontSize: 'clamp(26px, 5vw, 68px)', color }}>{sym}</div>

      {/* Bottom-right (rotated) */}
      <div style={{
        position: 'absolute', bottom: '5%', right: '8%', fontSize: 'clamp(12px, 2.5vw, 30px)',
        color, lineHeight: 1.1, transform: 'rotate(180deg)',
      }}>
        <div style={{ fontWeight: 800 }}>{card.rank}</div>
        <div style={{ fontSize: 'clamp(10px, 2vw, 24px)' }}>{sym}</div>
      </div>
    </div>
  );
}
