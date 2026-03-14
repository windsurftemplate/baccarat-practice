'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../lib/types';
import { bjTotal, isSoft, randomCard } from '../../../../lib/bj';
import CardView from '../../../../components/Card';

type Play = 'Hit' | 'Stand' | 'Double' | 'Split';

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
type AnswerState = { selected: Play; correct: boolean } | null;

function basicStrategy(hand: Card[], upcardValue: number): Play {
  const total = bjTotal(hand);
  const soft = isSoft(hand);
  const isPair = hand.length === 2 && hand[0].value === hand[1].value;

  if (isPair) {
    const pairVal = hand[0].value;
    if (pairVal === 11) return 'Split';
    if (pairVal === 10) return 'Stand';
    if (pairVal === 9) return (upcardValue === 7 || upcardValue >= 10) ? 'Stand' : 'Split';
    if (pairVal === 8) return 'Split';
    if (pairVal === 7) return upcardValue <= 7 ? 'Split' : 'Hit';
    if (pairVal === 6) return upcardValue <= 6 ? 'Split' : 'Hit';
    if (pairVal === 5) return upcardValue <= 9 ? 'Double' : 'Hit';
    if (pairVal === 4) return (upcardValue === 5 || upcardValue === 6) ? 'Split' : 'Hit';
    if (pairVal <= 3) return upcardValue <= 7 ? 'Split' : 'Hit';
  }

  if (soft) {
    if (total >= 19) return 'Stand';
    if (total === 18) return upcardValue <= 6 ? 'Double' : upcardValue <= 8 ? 'Stand' : 'Hit';
    if (total === 17) return (upcardValue >= 3 && upcardValue <= 6) ? 'Double' : 'Hit';
    if (total === 16 || total === 15) return (upcardValue >= 4 && upcardValue <= 6) ? 'Double' : 'Hit';
    if (total === 14 || total === 13) return (upcardValue >= 5 && upcardValue <= 6) ? 'Double' : 'Hit';
    return 'Hit';
  }

  if (total >= 17) return 'Stand';
  if (total >= 13) return upcardValue <= 6 ? 'Stand' : 'Hit';
  if (total === 12) return (upcardValue >= 4 && upcardValue <= 6) ? 'Stand' : 'Hit';
  if (total === 11) return upcardValue <= 10 ? 'Double' : 'Hit';
  if (total === 10) return upcardValue <= 9 ? 'Double' : 'Hit';
  if (total === 9) return (upcardValue >= 3 && upcardValue <= 6) ? 'Double' : 'Hit';
  return 'Hit';
}

function freshRound() {
  const hand = [randomCard(), randomCard()];
  const upcard = randomCard();
  const correct = basicStrategy(hand, upcard.value);
  return { hand, upcard, correct };
}

const PLAYS: Play[] = ['Hit', 'Stand', 'Double', 'Split'];

export default function BasicStrategyDrill() {
  const [{ hand, upcard, correct }, setRound] = useState(() => freshRound());
  const [answer, setAnswer] = useState<AnswerState>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);

  function nextHand() {
    setRound(freshRound());
    setAnswer(null);
  }

  function handleAnswer(val: Play) {
    if (answer) return;
    const isCorrect = val === correct;
    setAnswer({ selected: val, correct: isCorrect });
    setStats(s => {
      const newStreak = isCorrect ? s.streak + 1 : 0;
      return { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak) };
    });
    if (isCorrect) setTimeout(nextHand, 380);
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
  const playerTotal = bjTotal(hand);
  const soft = isSoft(hand);

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #7a1826' }}>
        <Link href="/practice/blackjack" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Blackjack</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>📊 Basic Strategy</div>
        <button onClick={() => { setStats(emptyStats()); nextHand(); }} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Answered" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>

      <div className="flex-1 felt flex flex-col items-center justify-center gap-6 px-6">
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Basic strategy play?
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Player</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {hand.map((card, i) => <CardView key={i} card={card} delay={i * 100} />)}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
              {soft ? `Soft ${playerTotal}` : playerTotal}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dealer</div>
            <CardView card={upcard} delay={200} />
          </div>
        </div>

        {answer && (
          <div style={{ fontSize: 15, fontWeight: 900, color: answer.correct ? '#4ade80' : '#f87171', textAlign: 'center' }}>
            {answer.correct ? `✓ ${correct}` : `✗ Correct: ${correct}`}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 300 }}>
          {PLAYS.map(play => {
            const isSelected = answer?.selected === play;
            const isCorrectOpt = play === correct;
            let bg = 'rgba(255,255,255,0.06)', border = 'rgba(255,255,255,0.15)', color = '#f5f0e8';
            if (answer) {
              if (isCorrectOpt) { bg = 'rgba(22,163,74,0.3)'; border = '#4ade80'; color = '#4ade80'; }
              else if (isSelected) { bg = 'rgba(220,38,38,0.3)'; border = '#f87171'; color = '#f87171'; }
              else { bg = 'rgba(255,255,255,0.03)'; border = 'rgba(255,255,255,0.06)'; color = 'rgba(255,255,255,0.25)'; }
            }
            return (
              <button key={play} onClick={() => handleAnswer(play)} style={{
                height: 64, fontSize: 20, fontWeight: 900, borderRadius: 12,
                cursor: answer ? 'default' : 'pointer', touchAction: 'manipulation',
                background: bg, border: `2px solid ${border}`, color,
                transition: 'all 0.15s', boxShadow: isCorrectOpt && answer ? '0 0 16px rgba(74,222,128,0.4)' : 'none',
              }}>{play}</button>
            );
          })}
        </div>

        {answer && !answer.correct && (
          <button onClick={nextHand} style={{
            padding: '10px 32px', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            borderRadius: 12, background: '#7a1826', color: '#fff', border: '1px solid rgba(200,80,100,0.5)',
            cursor: 'pointer', touchAction: 'manipulation',
          }}>Next →</button>
        )}

        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center' }}>
          Multi-deck Vegas basic strategy
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
