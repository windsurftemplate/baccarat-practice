'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../lib/types';
import { bjTotal, randomCard } from '../../../../lib/bj';
import CardView from '../../../../components/Card';

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
type AnswerState = { selected: number; correct: boolean } | null;
type BetType = 'upcard' | 'buster';
type Round = { card: Card | null; hand: Card[] | null; bustCards: number; bet: number; multiplier: number; correct: number; options: number[]; };

function upcardMultiplier(card: Card): number {
  if (card.rank === 'A') return 11;
  if (['10','J','Q','K'].includes(card.rank)) return 3;
  if (card.rank === '9') return 7;
  if (card.rank === '8') return 5;
  if (card.rank === '7') return 4;
  return 2;
}

function busterMultiplier(cardCount: number): number {
  if (cardCount <= 4) return 2;
  if (cardCount === 5) return 3;
  if (cardCount === 6) return 4;
  return 7;
}

const BETS = [5, 10, 25, 50, 100];

function makeOpts(correct: number, bet: number): number[] {
  const opts = new Set([correct]);
  const candidates = [bet * 2, bet * 3, bet * 4, bet * 5, bet * 7, bet * 11, correct + bet, Math.max(0, correct - bet)].filter(n => n > 0 && n !== correct);
  candidates.sort(() => Math.random() - 0.5);
  for (const n of candidates) { if (opts.size >= 4) break; opts.add(n); }
  return [...opts].sort(() => Math.random() - 0.5);
}

function freshUpcardRound() {
  const card = randomCard();
  const multiplier = upcardMultiplier(card);
  const bet = BETS[Math.floor(Math.random() * BETS.length)];
  const correct = bet * multiplier;
  return { card, hand: null as Card[] | null, bustCards: 0, bet, multiplier, correct, options: makeOpts(correct, bet) };
}

function freshBusterRound() {
  let hand: Card[] = [];
  let attempts = 0;
  do {
    hand = [randomCard(), randomCard()];
    while (bjTotal(hand) <= 21 && hand.length < 9) hand.push(randomCard());
    attempts++;
  } while (bjTotal(hand) <= 21 && attempts < 20);
  const cardCount = hand.length;
  const multiplier = busterMultiplier(cardCount);
  const bet = BETS[Math.floor(Math.random() * BETS.length)];
  const correct = bet * multiplier;
  return { card: null as Card | null, hand, bustCards: cardCount, bet, multiplier, correct, options: makeOpts(correct, bet) };
}

export default function SideBetsDrill() {
  const [betType, setBetType] = useState<BetType>('upcard');
  const [round, setRound] = useState<Round>(() => freshUpcardRound());
  const [answer, setAnswer] = useState<AnswerState>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);

  function nextHand(type = betType) {
    setRound(type === 'upcard' ? freshUpcardRound() : freshBusterRound());
    setAnswer(null);
  }

  function handleTypeToggle(type: BetType) {
    setBetType(type);
    nextHand(type);
  }

  function handleAnswer(val: number) {
    if (answer) return;
    const isCorrect = val === round.correct;
    setAnswer({ selected: val, correct: isCorrect });
    setStats(s => { const ns = isCorrect ? s.streak + 1 : 0; return { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1, streak: ns, bestStreak: Math.max(s.bestStreak, ns) }; });
    if (isCorrect) { const t = betType; setTimeout(() => nextHand(t), 380); }
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-3 py-1.5" style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #6d28d9' }}>
        <Link href="/practice/blackjack" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Blackjack</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>🎰 Side Bets</div>
        <button onClick={() => { setStats(emptyStats()); nextHand(betType); }} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Answered" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>
      <div className="flex-1 felt flex flex-col items-center justify-center gap-6 px-6">
        <div style={{ display: 'flex', gap: 8 }}>
          {(['upcard', 'buster'] as BetType[]).map(type => (
            <button key={type} onClick={() => handleTypeToggle(type)} style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 8, cursor: 'pointer', touchAction: 'manipulation', background: betType === type ? 'rgba(109,40,217,0.3)' : 'rgba(255,255,255,0.06)', border: betType === type ? '2px solid #a78bfa' : '1px solid rgba(255,255,255,0.12)', color: betType === type ? '#c4b5fd' : 'rgba(255,255,255,0.4)' }}>{type === 'upcard' ? 'Upcard' : 'Buster'}</button>
          ))}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>What does the side bet pay?</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {betType === 'upcard' && round.card && (
            <>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Dealer upcard</div>
              <CardView card={round.card} delay={0} />
            </>
          )}
          {betType === 'buster' && round.hand && (
            <>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Dealer busts with {round.bustCards} cards</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                {round.hand.map((card, i) => <CardView key={i} card={card} delay={i * 60} small />)}
              </div>
            </>
          )}
          <div style={{ color: '#fbbf24', fontSize: 22, fontWeight: 900 }}>Bet: ${round.bet}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Pays {round.multiplier}:1</div>
        </div>
        {answer && (
          <div style={{ fontSize: 15, fontWeight: 900, color: answer.correct ? '#4ade80' : '#f87171', textAlign: 'center' }}>
            {answer.correct ? `✓ Pays $${round.correct}` : `✗ Pays $${round.correct}`}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 300 }}>
          {round.options.map(opt => {
            const isSelected = answer?.selected === opt;
            const isCorrectOpt = opt === round.correct;
            let bg = 'rgba(255,255,255,0.06)', border = 'rgba(255,255,255,0.15)', color = '#f5f0e8';
            if (answer) {
              if (isCorrectOpt) { bg = 'rgba(22,163,74,0.3)'; border = '#4ade80'; color = '#4ade80'; }
              else if (isSelected) { bg = 'rgba(220,38,38,0.3)'; border = '#f87171'; color = '#f87171'; }
              else { bg = 'rgba(255,255,255,0.03)'; border = 'rgba(255,255,255,0.06)'; color = 'rgba(255,255,255,0.25)'; }
            }
            return (
              <button key={opt} onClick={() => handleAnswer(opt)} style={{ height: 64, fontSize: 22, fontWeight: 900, borderRadius: 12, cursor: answer ? 'default' : 'pointer', touchAction: 'manipulation', background: bg, border: `2px solid ${border}`, color, transition: 'all 0.15s', boxShadow: isCorrectOpt && answer ? '0 0 16px rgba(74,222,128,0.4)' : 'none' }}>${opt}</button>
            );
          })}
        </div>
        {answer && !answer.correct && (
          <button onClick={() => nextHand(betType)} style={{ padding: '10px 32px', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 12, background: '#6d28d9', color: '#fff', border: '1px solid rgba(139,92,246,0.5)', cursor: 'pointer', touchAction: 'manipulation' }}>Next →</button>
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <span style={{ color: color ?? '#fff', fontSize: 14, fontWeight: 900 }}>{value}</span>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    </div>
  );
}
