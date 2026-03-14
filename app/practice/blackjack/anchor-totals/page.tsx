'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card, Suit, Rank } from '../../../../lib/types';
import { bjTotal, makeOptions, randomCard, randomSuit } from '../../../../lib/bj';
import CardView from '../../../../components/Card';

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
type AnswerState = { selected: number; correct: boolean } | null;

function anchorRank(value: number): Rank {
  if (value === 1) return 'A';
  return String(value) as Rank;
}

function makeAnchorCard(anchorValue: number): Card {
  const rank = anchorRank(anchorValue);
  const suit = randomSuit();
  // Ace displayed as 'A', BJ value = 11
  const value = anchorValue === 1 ? 11 : anchorValue;
  return { rank, suit, value };
}

function freshRound(anchorValue: number, extraCards: number, noFace: boolean) {
  const anchor = makeAnchorCard(anchorValue);
  const randoms = Array.from({ length: extraCards }, () => randomCard(noFace));
  const hand = [anchor, ...randoms];
  const total = bjTotal(hand);
  return { hand, options: makeOptions(total, 2, 31), total };
}

export default function BJAnchorTotalsDrill() {
  const [anchor, setAnchor] = useState(8);
  const [cardCount, setCardCount] = useState(2);
  const [noFace, setNoFace] = useState(false);
  const [{ hand, options, total }, setRound] = useState(() => freshRound(8, 2, false));
  const [answer, setAnswer] = useState<AnswerState>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);

  function nextHand(a = anchor, c = cardCount, nf = noFace) {
    setRound(freshRound(a, c, nf));
    setAnswer(null);
  }

  function handleAnswer(val: number) {
    if (answer) return;
    const correct = val === total;
    setAnswer({ selected: val, correct });
    setStats(s => {
      const newStreak = correct ? s.streak + 1 : 0;
      return { correct: s.correct + (correct ? 1 : 0), total: s.total + 1, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak) };
    });
    if (correct) setTimeout(() => nextHand(anchor, cardCount, noFace), 380);
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #0f766e' }}>
        <Link href="/practice/blackjack" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Blackjack</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>🎯 Anchor Totals</div>
        <button onClick={() => { setStats(emptyStats()); nextHand(); setAnswer(null); }} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Answered" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>

      <div className="flex-1 felt flex flex-col items-center justify-center gap-6 px-6">
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          What is the total?
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Anchor card</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1,2,3,4,5,6,7,8,9].map(v => (
                <button key={v} onClick={() => { setAnchor(v); nextHand(v, cardCount, noFace); }} style={{
                  width: 32, height: 32, fontSize: 14, fontWeight: 900, borderRadius: 7,
                  background: anchor === v ? 'rgba(232,200,106,0.2)' : 'rgba(255,255,255,0.06)',
                  border: anchor === v ? '2px solid #e8c86a' : '1px solid rgba(255,255,255,0.12)',
                  color: anchor === v ? '#e8c86a' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer', touchAction: 'manipulation',
                }}>{v === 1 ? 'A' : v}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Extra cards</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1,2,3,4].map(n => (
                <button key={n} onClick={() => { setCardCount(n); nextHand(anchor, n, noFace); }} style={{
                  width: 32, height: 32, fontSize: 14, fontWeight: 900, borderRadius: 7,
                  background: cardCount === n ? 'rgba(148,163,184,0.25)' : 'rgba(255,255,255,0.06)',
                  border: cardCount === n ? '2px solid #94a3b8' : '1px solid rgba(255,255,255,0.12)',
                  color: cardCount === n ? '#cbd5e1' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer', touchAction: 'manipulation',
                }}>{n}</button>
              ))}
            </div>
          </div>
          <button onClick={() => { const next = !noFace; setNoFace(next); nextHand(anchor, cardCount, next); }} style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '5px 14px', borderRadius: 7, cursor: 'pointer', touchAction: 'manipulation',
            background: noFace ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.06)',
            border: noFace ? '1.5px solid #fbbf24' : '1px solid rgba(255,255,255,0.12)',
            color: noFace ? '#fbbf24' : 'rgba(255,255,255,0.4)',
          }}>
            {noFace ? '✓ No 10s / Face' : 'No 10s / Face'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center' }}>
            {hand.map((card, i) => (
              <div key={i} style={i === 0 ? { borderRadius: 10, boxShadow: '0 0 0 2px #e8c86a, 0 0 12px rgba(232,200,106,0.4)' } : {}}>
                <CardView card={card} delay={i * 100} />
              </div>
            ))}
          </div>
          {answer && (
            <div style={{ fontSize: 15, fontWeight: 900, color: answer.correct ? '#4ade80' : '#f87171' }}>
              {answer.correct ? `✓ Total is ${total}` : `✗ Total is ${total} (${hand.map(c => c.value).join(' + ')})`}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 300 }}>
          {options.map(opt => {
            const isSelected = answer?.selected === opt;
            const isCorrectOpt = opt === total;
            let bg = 'rgba(255,255,255,0.06)', border = 'rgba(255,255,255,0.15)', color = '#f5f0e8';
            if (answer) {
              if (isCorrectOpt) { bg = 'rgba(22,163,74,0.3)'; border = '#4ade80'; color = '#4ade80'; }
              else if (isSelected) { bg = 'rgba(220,38,38,0.3)'; border = '#f87171'; color = '#f87171'; }
              else { bg = 'rgba(255,255,255,0.03)'; border = 'rgba(255,255,255,0.06)'; color = 'rgba(255,255,255,0.25)'; }
            }
            return (
              <button key={opt} onClick={() => handleAnswer(opt)} style={{
                height: 64, fontSize: 28, fontWeight: 900, borderRadius: 12,
                cursor: answer ? 'default' : 'pointer', touchAction: 'manipulation',
                background: bg, border: `2px solid ${border}`, color,
                transition: 'all 0.15s', boxShadow: isCorrectOpt && answer ? '0 0 16px rgba(74,222,128,0.4)' : 'none',
              }}>{opt}</button>
            );
          })}
        </div>

        {answer && !answer.correct && (
          <button onClick={() => nextHand(anchor, cardCount, noFace)} style={{
            padding: '10px 32px', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            borderRadius: 12, background: '#0f766e', color: '#fff', border: '1px solid rgba(20,184,166,0.5)',
            cursor: 'pointer', touchAction: 'manipulation',
          }}>Next →</button>
        )}

        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center' }}>
          Gold-bordered card is fixed · other cards are random
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
