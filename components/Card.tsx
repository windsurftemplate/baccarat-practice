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
  small?: boolean;
}

const CARD_W = 'clamp(72px, 13vw, 190px)';
const CARD_H = 'clamp(100px, 18vw, 266px)';
const CARD_W_SM = 'clamp(38px, 10vw, 62px)';
const CARD_H_SM = 'clamp(54px, 14vw, 88px)';

export default function Card({ card, delay = 0, faceDown = false, small = false }: Props) {
  const w = small ? CARD_W_SM : CARD_W;
  const h = small ? CARD_H_SM : CARD_H;

  if (faceDown) {
    return (
      <div
        className="playing-card deal-animate"
        style={{
          width: w, height: h,
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
  const rankSz = small ? 'clamp(9px, 2.5vw, 14px)' : 'clamp(12px, 2.5vw, 30px)';
  const suitSz = small ? 'clamp(8px, 2vw, 12px)' : 'clamp(10px, 2vw, 24px)';
  const centerSz = small ? 'clamp(14px, 4vw, 22px)' : 'clamp(26px, 5vw, 68px)';

  return (
    <div
      className="playing-card deal-animate select-none"
      style={{ width: w, height: h, animationDelay: `${delay}ms` }}
    >
      {/* Top-left */}
      <div style={{ position: 'absolute', top: '5%', left: '8%', fontSize: rankSz, color, lineHeight: 1.1 }}>
        <div style={{ fontWeight: 800 }}>{card.rank}</div>
        <div style={{ fontSize: suitSz }}>{sym}</div>
      </div>

      {/* Center suit */}
      <div style={{ fontSize: centerSz, color }}>{sym}</div>

      {/* Bottom-right (rotated) */}
      <div style={{
        position: 'absolute', bottom: '5%', right: '8%', fontSize: rankSz,
        color, lineHeight: 1.1, transform: 'rotate(180deg)',
      }}>
        <div style={{ fontWeight: 800 }}>{card.rank}</div>
        <div style={{ fontSize: suitSz }}>{sym}</div>
      </div>
    </div>
  );
}
