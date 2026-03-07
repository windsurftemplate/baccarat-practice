'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '../../../lib/types';
import { createShoe, handTotal } from '../../../lib/baccarat';
import CardView from '../../../components/Card';

function drawTwo(shoe: Card[]): { cards: Card[]; shoe: Card[] } {
  const s = [...shoe];
  if (s.length < 10) {
    const fresh = createShoe();
    return { cards: [fresh[0], fresh[1]], shoe: fresh.slice(2) };
  }
  return { cards: [s[0], s[1]], shoe: s.slice(2) };
}

function nextHand(shoe: Card[]) {
  const s = shoe.length < 10 ? createShoe() : shoe;
  return {
    playerCards: [s[0], s[1]],
    bankerCards: [s[2], s[3]],
    shoe: s.slice(4),
  };
}

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });

type Answer = 'natural' | 'no' | null;
type Phase = 'player' | 'banker' | 'result';

export default function NaturalsDrill() {
  const [hand, setHand] = useState(() => {
    const s = createShoe();
    return { playerCards: [s[0], s[1]], bankerCards: [s[2], s[3]], shoe: s.slice(4) };
  });
  const [phase, setPhase] = useState<Phase>('player');
  const [playerAnswer, setPlayerAnswer] = useState<Answer>(null);
  const [bankerAnswer, setBankerAnswer] = useState<Answer>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);

  const pTotal = handTotal(hand.playerCards);
  const bTotal = handTotal(hand.bankerCards);
  const pIsNatural = pTotal >= 8;
  const bIsNatural = bTotal >= 8;

  function handleAnswer(isNatural: boolean) {
    const correct = isNatural === (phase === 'player' ? pIsNatural : bIsNatural);

    if (phase === 'player') {
      setPlayerAnswer(isNatural ? 'natural' : 'no');
      setPhase('banker');
      // Update streak only at end of hand
    } else {
      // banker phase → go to result
      const pAnswer = playerAnswer;
      const pCorrect = (pAnswer === 'natural') === pIsNatural;
      const bCorrect = isNatural === bIsNatural;
      const allCorrect = pCorrect && bCorrect;
      setBankerAnswer(isNatural ? 'natural' : 'no');
      setPhase('result');
      setStats(s => {
        const newStreak = allCorrect ? s.streak + 1 : 0;
        return {
          correct: s.correct + (allCorrect ? 1 : 0),
          total: s.total + 1,
          streak: newStreak,
          bestStreak: Math.max(s.bestStreak, newStreak),
        };
      });
    }
  }

  function handleNext() {
    const h = nextHand(hand.shoe);
    setHand(h);
    setPhase('player');
    setPlayerAnswer(null);
    setBankerAnswer(null);
  }

  const isResult = phase === 'result';
  const pCorrect = playerAnswer !== null && (playerAnswer === 'natural') === pIsNatural;
  const bCorrect = bankerAnswer !== null && (bankerAnswer === 'natural') === bIsNatural;
  const allCorrect = isResult && pCorrect && bCorrect;
  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #7a1826' }}>
        <Link href="/practice" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Drills</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>⚡ Natural Recognition</div>
        <button onClick={() => setStats(emptyStats())} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Hands" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>

      {/* Felt */}
      <div className="flex-1 felt flex flex-col items-center gap-4 py-5 px-4">

        {/* Phase label */}
        <div style={{ color: phase === 'player' ? '#93c5fd' : phase === 'banker' ? '#fca5a5' : allCorrect ? '#4ade80' : '#f87171', fontSize: 14, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          {phase === 'player' && 'Is Player a Natural? (8 or 9)'}
          {phase === 'banker' && 'Is Banker a Natural? (8 or 9)'}
          {isResult && (allCorrect ? '✓ Correct!' : '✗ Wrong')}
        </div>

        {/* Cards layout */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'flex-start' }}>

          {/* Player hand */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', color: '#93c5fd', textTransform: 'uppercase', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 5, padding: '2px 10px' }}>Player</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {hand.playerCards.map((c, i) => <CardView key={i} card={c} delay={i * 80} />)}
            </div>
            {/* Result indicator */}
            {isResult && (
              <div style={{ fontSize: 11, fontWeight: 900, color: pCorrect ? '#4ade80' : '#f87171' }}>
                {pIsNatural ? `Natural ${pTotal}` : `Total ${pTotal} — No`} {pCorrect ? '✓' : '✗'}
              </div>
            )}
            {phase === 'banker' && playerAnswer && (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                You said: {playerAnswer === 'natural' ? 'Natural' : 'No'} {(playerAnswer === 'natural') === pIsNatural ? '✓' : '✗'}
              </div>
            )}
          </div>

          <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 20, paddingTop: 50 }}>VS</div>

          {/* Banker hand */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', color: '#fca5a5', textTransform: 'uppercase', background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 5, padding: '2px 10px' }}>Banker</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {hand.bankerCards.map((c, i) => <CardView key={i} card={c} delay={i * 80} />)}
            </div>
            {isResult && (
              <div style={{ fontSize: 11, fontWeight: 900, color: bCorrect ? '#4ade80' : '#f87171' }}>
                {bIsNatural ? `Natural ${bTotal}` : `Total ${bTotal} — No`} {bCorrect ? '✓' : '✗'}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {!isResult && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{
                flex: 1, height: 80, fontSize: 18, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
                borderRadius: 16, cursor: 'pointer', touchAction: 'manipulation', border: '2px solid #fbbf24',
                background: 'linear-gradient(160deg, #78350f, #92400e)', color: '#fef3c7',
                boxShadow: '0 4px 20px rgba(251,191,36,0.4)',
              }} onClick={() => handleAnswer(true)}>
                Natural!
              </button>
              <button style={{
                flex: 1, height: 80, fontSize: 18, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
                borderRadius: 16, cursor: 'pointer', touchAction: 'manipulation', border: '2px solid rgba(255,255,255,0.25)',
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
                boxShadow: 'none',
              }} onClick={() => handleAnswer(false)}>
                No Natural
              </button>
            </div>
          )}
          {isResult && (
            <button style={{
              width: '100%', height: 64, fontSize: 17, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
              borderRadius: 16, background: '#7a1826', color: '#fff', border: '1px solid rgba(200,80,100,0.5)',
              boxShadow: '0 0 20px rgba(122,24,38,0.5)', cursor: 'pointer', touchAction: 'manipulation',
            }} onClick={handleNext}>Next Hand →</button>
          )}
        </div>

        {/* Tip */}
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, textAlign: 'center', marginTop: 4 }}>
          Natural = hand total of 8 or 9 · No draw rules apply
        </div>
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
