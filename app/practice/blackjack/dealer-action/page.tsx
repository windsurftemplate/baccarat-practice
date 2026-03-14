'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../lib/types';
import { bjTotal, isSoft, randomCard } from '../../../../lib/bj';
import CardView from '../../../../components/Card';

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
type AnswerState = { selected: 'hit' | 'stand'; correct: boolean } | null;

function dealerAction(hand: Card[], h17: boolean): 'hit' | 'stand' {
  const total = bjTotal(hand);
  const soft = isSoft(hand);
  if (total < 17) return 'hit';
  if (total > 17) return 'stand';
  // total === 17
  if (soft && h17) return 'hit';
  return 'stand';
}

function freshRound(h17: boolean) {
  let hand: Card[];
  do {
    const n = 2 + Math.floor(Math.random() * 3); // 2-4 cards
    hand = Array.from({ length: n }, () => randomCard());
  } while (bjTotal(hand) > 21);
  const action = dealerAction(hand, h17);
  return { hand, action };
}

export default function DealerActionDrill() {
  const [h17, setH17] = useState(true);
  const [{ hand, action }, setRound] = useState(() => freshRound(true));
  const [answer, setAnswer] = useState<AnswerState>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);

  function nextHand(rule = h17) {
    setRound(freshRound(rule));
    setAnswer(null);
  }

  function handleRuleToggle() {
    const next = !h17;
    setH17(next);
    nextHand(next);
  }

  function handleAnswer(val: 'hit' | 'stand') {
    if (answer) return;
    const correct = val === action;
    setAnswer({ selected: val, correct });
    setStats(s => {
      const newStreak = correct ? s.streak + 1 : 0;
      return { correct: s.correct + (correct ? 1 : 0), total: s.total + 1, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak) };
    });
    if (correct) { const rule = h17; setTimeout(() => nextHand(rule), 380); }
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
  const total = bjTotal(hand);
  const soft = isSoft(hand);

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #15803d' }}>
        <Link href="/practice/blackjack" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Blackjack</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>🎴 Dealer Action</div>
        <button onClick={() => { setStats(emptyStats()); nextHand(h17); }} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Answered" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>

      <div className="flex-1 felt flex flex-col items-center justify-center gap-8 px-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Dealer must:
          </div>
          <button onClick={handleRuleToggle} style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '4px 12px', borderRadius: 6, cursor: 'pointer', touchAction: 'manipulation',
            background: h17 ? 'rgba(251,191,36,0.18)' : 'rgba(99,102,241,0.18)',
            border: h17 ? '1.5px solid #fbbf24' : '1.5px solid #818cf8',
            color: h17 ? '#fbbf24' : '#a5b4fc',
          }}>{h17 ? 'H17' : 'S17'}</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', justifyContent: 'center', flexWrap: 'wrap' }}>
            {hand.map((card, i) => <CardView key={i} card={card} delay={i * 100} />)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            {soft ? `Soft ${total}` : `Hard ${total}`}
          </div>
        </div>

        {answer && (
          <div style={{ fontSize: 15, fontWeight: 900, color: answer.correct ? '#4ade80' : '#f87171', textAlign: 'center' }}>
            {answer.correct
              ? `✓ ${action === 'hit' ? 'Hit' : 'Stand'}`
              : `✗ Dealer must ${action === 'hit' ? 'Hit' : 'Stand'}`}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 300 }}>
          {(['hit', 'stand'] as const).map(val => {
            const label = val === 'hit' ? 'Hit' : 'Stand';
            const isSelected = answer?.selected === val;
            const isCorrect = answer !== null && val === action;
            let bg = 'rgba(255,255,255,0.06)', border = 'rgba(255,255,255,0.15)', color = '#f5f0e8';
            if (answer) {
              if (isCorrect) { bg = 'rgba(22,163,74,0.3)'; border = '#4ade80'; color = '#4ade80'; }
              else if (isSelected) { bg = 'rgba(220,38,38,0.3)'; border = '#f87171'; color = '#f87171'; }
              else { bg = 'rgba(255,255,255,0.03)'; border = 'rgba(255,255,255,0.06)'; color = 'rgba(255,255,255,0.25)'; }
            }
            return (
              <button key={val} onClick={() => handleAnswer(val)} style={{
                height: 72, fontSize: 20, fontWeight: 900, borderRadius: 12,
                cursor: answer ? 'default' : 'pointer', touchAction: 'manipulation',
                background: bg, border: `2px solid ${border}`, color,
                transition: 'all 0.15s',
              }}>{label}</button>
            );
          })}
        </div>

        {answer && !answer.correct && (
          <button onClick={() => nextHand(h17)} style={{
            padding: '10px 32px', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            borderRadius: 12, background: '#15803d', color: '#fff', border: '1px solid rgba(34,197,94,0.5)',
            cursor: 'pointer', touchAction: 'manipulation',
          }}>Next →</button>
        )}

        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center' }}>
          H17 = hit soft 17 · S17 = stand on all 17s
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
