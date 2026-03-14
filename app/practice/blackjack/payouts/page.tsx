'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
type AnswerState = { selected: number; correct: boolean } | null;
type ResultType = 'Blackjack (3:2)' | 'Even Money' | 'Insurance (2:1)' | 'Push';

const BJ_BETS = [10, 20, 50, 100, 200];
const OTHER_BETS = [5, 10, 15, 20, 25, 50, 100];
const RESULTS: ResultType[] = ['Blackjack (3:2)', 'Even Money', 'Insurance (2:1)', 'Push'];

function calcPayout(bet: number, result: ResultType): number {
  if (result === 'Blackjack (3:2)') return bet * 1.5;
  if (result === 'Even Money') return bet;
  if (result === 'Insurance (2:1)') return bet;
  return 0;
}

function freshRound() {
  const result = RESULTS[Math.floor(Math.random() * RESULTS.length)];
  const betPool = result === 'Blackjack (3:2)' ? BJ_BETS : OTHER_BETS;
  const bet = betPool[Math.floor(Math.random() * betPool.length)];
  const correct = calcPayout(bet, result);
  const opts = new Set([correct]);
  const candidates = [bet * 0.5, bet, bet * 1.5, bet * 2, bet * 3, bet - 5, bet + 5, correct + bet, correct - bet].filter(n => n >= 0 && n !== correct);
  candidates.sort(() => Math.random() - 0.5);
  for (const n of candidates) { if (opts.size >= 4) break; opts.add(n); }
  return { bet, result, correct, options: [...opts].sort(() => Math.random() - 0.5) };
}

export default function BJPayoutDrill() {
  const [{ bet, result, correct, options }, setRound] = useState(() => freshRound());
  const [answer, setAnswer] = useState<AnswerState>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);

  function nextHand() { setRound(freshRound()); setAnswer(null); }

  function handleAnswer(val: number) {
    if (answer) return;
    const isCorrect = val === correct;
    setAnswer({ selected: val, correct: isCorrect });
    setStats(s => { const ns = isCorrect ? s.streak + 1 : 0; return { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1, streak: ns, bestStreak: Math.max(s.bestStreak, ns) }; });
    if (isCorrect) setTimeout(nextHand, 380);
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-3 py-1.5" style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #b45309' }}>
        <Link href="/practice/blackjack" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Blackjack</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>💰 Payouts</div>
        <button onClick={() => { setStats(emptyStats()); nextHand(); }} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Answered" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>
      <div className="flex-1 felt flex flex-col items-center justify-center gap-8 px-6">
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>What is the payout?</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '20px 28px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: '#fbbf24', fontSize: 28, fontWeight: 900 }}>${bet} bet</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: 700 }}>{result}</div>
        </div>
        {answer && (
          <div style={{ fontSize: 15, fontWeight: 900, color: answer.correct ? '#4ade80' : '#f87171', textAlign: 'center' }}>
            {answer.correct ? `✓ Pays $${correct}` : `✗ Pays $${correct}`}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 300 }}>
          {options.map(opt => {
            const isSelected = answer?.selected === opt;
            const isCorrectOpt = opt === correct;
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
          <button onClick={nextHand} style={{ padding: '10px 32px', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 12, background: '#b45309', color: '#fff', border: '1px solid rgba(245,158,11,0.5)', cursor: 'pointer', touchAction: 'manipulation' }}>Next →</button>
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
