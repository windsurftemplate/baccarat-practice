'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../lib/types';
import { isSoft, bjTotal, randomCard } from '../../../../lib/bj';
import CardView from '../../../../components/Card';

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
type AnswerState = { selected: boolean; correct: boolean } | null;

function freshRound() {
  const wantSoft = Math.random() < 0.5;
  let hand: Card[];
  let attempts = 0;
  do {
    const n = 2 + Math.floor(Math.random() * 2); // 2-3 cards
    hand = Array.from({ length: n }, () => randomCard());
    attempts++;
  } while (attempts < 10 && isSoft(hand) !== wantSoft);
  const soft = isSoft(hand);
  const total = bjTotal(hand);
  const aceCount = hand.filter(c => c.rank === 'A').length;
  const explanation = soft
    ? `Soft — ace counts as 11, total is ${total} without busting`
    : aceCount > 0
      ? `Hard — ace must count as 1, total is ${total} (counting as 11 would bust)`
      : `Hard — no ace, total is ${total}`;
  return { hand, soft, explanation };
}

export default function SoftHardDrill() {
  const [{ hand, soft, explanation }, setRound] = useState(() => freshRound());
  const [answer, setAnswer] = useState<AnswerState>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);

  function nextHand() {
    setRound(freshRound());
    setAnswer(null);
  }

  function handleAnswer(val: boolean) {
    if (answer) return;
    const correct = val === soft;
    setAnswer({ selected: val, correct });
    setStats(s => {
      const newStreak = correct ? s.streak + 1 : 0;
      return { correct: s.correct + (correct ? 1 : 0), total: s.total + 1, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak) };
    });
    if (correct) setTimeout(nextHand, 380);
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #0369a1' }}>
        <Link href="/practice/blackjack" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Blackjack</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>🂠 Soft vs Hard</div>
        <button onClick={() => { setStats(emptyStats()); nextHand(); }} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Answered" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>

      <div className="flex-1 felt flex flex-col items-center justify-center gap-8 px-6">
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Soft or Hard?
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', justifyContent: 'center' }}>
          {hand.map((card, i) => <CardView key={i} card={card} delay={i * 100} />)}
        </div>

        {answer && (
          <div style={{ fontSize: 13, fontWeight: 700, color: answer.correct ? '#4ade80' : '#f87171', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
            {answer.correct ? '✓ ' : '✗ '}{explanation}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 300 }}>
          {([true, false] as const).map(val => {
            const label = val ? 'Soft' : 'Hard';
            const isSelected = answer?.selected === val;
            const isCorrect = answer !== null && val === soft;
            let bg = 'rgba(255,255,255,0.06)', border = 'rgba(255,255,255,0.15)', color = '#f5f0e8';
            if (answer) {
              if (isCorrect) { bg = 'rgba(22,163,74,0.3)'; border = '#4ade80'; color = '#4ade80'; }
              else if (isSelected) { bg = 'rgba(220,38,38,0.3)'; border = '#f87171'; color = '#f87171'; }
              else { bg = 'rgba(255,255,255,0.03)'; border = 'rgba(255,255,255,0.06)'; color = 'rgba(255,255,255,0.25)'; }
            }
            return (
              <button key={label} onClick={() => handleAnswer(val)} style={{
                height: 72, fontSize: 20, fontWeight: 900, borderRadius: 12,
                cursor: answer ? 'default' : 'pointer', touchAction: 'manipulation',
                background: bg, border: `2px solid ${border}`, color,
                transition: 'all 0.15s',
              }}>{label}</button>
            );
          })}
        </div>

        {answer && !answer.correct && (
          <button onClick={nextHand} style={{
            padding: '10px 32px', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            borderRadius: 12, background: '#0369a1', color: '#fff', border: '1px solid rgba(14,165,233,0.5)',
            cursor: 'pointer', touchAction: 'manipulation',
          }}>Next →</button>
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
