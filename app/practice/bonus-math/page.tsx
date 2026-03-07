'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// ─── Bonus definitions ────────────────────────────────────────────────────────

type Zone = 'dragon7' | 'panda8' | 'ruby_small' | 'ruby_big' | 'tie';
const ZONES: Zone[] = ['dragon7', 'panda8', 'ruby_small', 'ruby_big', 'tie'];

const ZONE_META: Record<Zone, {
  label: string; short: string; color: string;
  rate: string; multiple: number;
  shortcut: string; shortcutDetail: string;
}> = {
  dragon7:    { label: 'Dragon 7',   short: 'D7',  color: '#a855f7', rate: '40:1', multiple: 40, shortcut: '×4, then add a zero',   shortcutDetail: '$25 × 40 → $25 × 4 = $100 → $1,000' },
  panda8:     { label: 'Panda 8',    short: 'P8',  color: '#10b981', rate: '25:1', multiple: 25, shortcut: '×100 ÷ 4',              shortcutDetail: '$25 × 25 → $2,500 ÷ 4 = $625' },
  ruby_small: { label: 'Small Ruby', short: 'SR',  color: '#f43f5e', rate: '10:1', multiple: 10, shortcut: 'Add a zero',             shortcutDetail: '$35 × 10 → $350' },
  ruby_big:   { label: 'Big Ruby',   short: 'BR',  color: '#f97316', rate: '75:1', multiple: 75, shortcut: '×100 − ×25',            shortcutDetail: '$25 × 75 → $2,500 − $625 = $1,875' },
  tie:        { label: 'Tie',        short: 'TIE', color: '#4ade80', rate: '9:1',  multiple: 9,  shortcut: '×10 − bet',             shortcutDetail: '$35 × 9 → $350 − $35 = $315' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHIP_DENOMS = [5, 10, 25, 50, 100];

function randomBet(): number {
  const count = Math.random() < 0.45 ? 1 : 2;
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += CHIP_DENOMS[Math.floor(Math.random() * CHIP_DENOMS.length)];
  }
  return total;
}

function randomZone(): Zone { return ZONES[Math.floor(Math.random() * ZONES.length)]; }

// Decompose bet into denomination groups for the breakdown panel
interface DenomLine { denom: number; count: number; subtotal: number; pays: number }
function decompose(bet: number, multiple: number): DenomLine[] {
  const lines: DenomLine[] = [];
  let r = bet;
  for (const d of [100, 50, 25, 10, 5]) {
    if (r >= d) {
      const count = Math.floor(r / d);
      const subtotal = count * d;
      lines.push({ denom: d, count, subtotal, pays: subtotal * multiple });
      r -= subtotal;
    }
  }
  return lines;
}

function makeOptions(correct: number): number[] {
  const pool = new Set([correct]);
  const candidates = [
    Math.round(correct * 0.9), Math.round(correct * 1.1),
    correct - correct % 50 === correct ? correct - 50 : correct + 50,
    Math.round(correct * 0.8), Math.round(correct * 1.2),
    correct - 100, correct + 100,
  ];
  for (const c of candidates) {
    if (pool.size >= 4) break;
    if (c > 0 && c !== correct) pool.add(c);
  }
  const fallbacks = [correct * 2, Math.round(correct * 0.5), correct + 25, correct - 25, correct + 50];
  for (const v of fallbacks) {
    if (pool.size >= 4) break;
    if (v > 0 && v !== correct) pool.add(v);
  }
  let attempts = 0;
  while (pool.size < 4 && attempts < 50) {
    attempts++;
    const r = Math.round(correct * (0.6 + Math.random() * 0.8));
    if (r > 0 && r !== correct) pool.add(r);
  }
  return [...pool].sort(() => Math.random() - 0.5);
}

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });

type Phase = 'question' | 'answered';
type ZoneFilter = Zone | null;

const TIMER_SECONDS = 5;

function freshRound(zoneFilter: ZoneFilter) {
  const zone = zoneFilter ?? randomZone();
  const bet = randomBet();
  const multiple = ZONE_META[zone].multiple;
  return { zone, bet, options: makeOptions(bet * multiple) };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BonusMathDrill() {
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>(null);
  const [round, setRound] = useState(() => freshRound(null));
  const [phase, setPhase] = useState<Phase>('question');
  const [answer, setAnswer] = useState<{ selected: number; correct: boolean } | null>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [timed, setTimed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { zone, bet, options } = round;
  const meta = ZONE_META[zone];
  const correct = bet * meta.multiple;
  const lines = decompose(bet, meta.multiple);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // Timer effect
  useEffect(() => {
    clearTimer();
    if (!timed || phase !== 'question') { setTimeLeft(TIMER_SECONDS); return; }
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { return TIMER_SECONDS; }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  }, [timed, phase, round, clearTimer]);

  // Separate effect to handle timeout (avoids dispatch in state updater)
  useEffect(() => {
    if (timed && phase === 'question' && timeLeft === TIMER_SECONDS && timerRef.current) {
      // just reset — actual timeout handled below
    }
  }, [timed, phase, timeLeft]);

  // Watch for timer hitting 1 → dispatch timeout
  const timeoutFired = useRef(false);
  useEffect(() => {
    if (!timed || phase !== 'question') { timeoutFired.current = false; return; }
    if (timeLeft <= 1 && !timeoutFired.current) {
      timeoutFired.current = true;
      clearTimer();
      // Auto-submit wrong answer
      setAnswer({ selected: -1, correct: false });
      setPhase('answered');
      setStats(s => ({ ...s, correct: s.correct, total: s.total + 1, streak: 0, bestStreak: s.bestStreak }));
    }
  }, [timeLeft, timed, phase, clearTimer]);

  function handleAnswer(val: number) {
    if (phase !== 'question' || answer) return;
    clearTimer();
    const isCorrect = val === correct;
    setAnswer({ selected: val, correct: isCorrect });
    setPhase('answered');
    setStats(s => {
      const newStreak = isCorrect ? s.streak + 1 : 0;
      return { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak) };
    });
    if (isCorrect) setTimeout(nextRound, 400);
  }

  function nextRound() {
    timeoutFired.current = false;
    setRound(freshRound(zoneFilter));
    setAnswer(null);
    setPhase('question');
  }

  function selectFilter(z: ZoneFilter) {
    timeoutFired.current = false;
    setZoneFilter(z);
    setRound(freshRound(z));
    setAnswer(null);
    setPhase('question');
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
  const isAnswered = phase === 'answered';

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #7a1826' }}>
        <Link href="/practice" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          ← Drills
        </Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          🧮 Bonus Math
        </div>
        <button
          onClick={() => { setTimed(t => !t); setRound(freshRound(zoneFilter)); setAnswer(null); setPhase('question'); timeoutFired.current = false; }}
          style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 5, cursor: 'pointer', touchAction: 'manipulation',
            background: timed ? 'rgba(251,191,36,0.2)' : 'none',
            border: timed ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.1)',
            color: timed ? '#fbbf24' : 'rgba(255,255,255,0.3)',
          }}
        >
          ⏱ Timed
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '5px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Done" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
        <button onClick={() => setStats(emptyStats())} style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Reset</button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Zone sidebar */}
        <div style={{
          width: 64, flexShrink: 0, display: 'flex', flexDirection: 'column',
          background: 'rgba(0,0,0,0.45)', borderRight: '1px solid rgba(255,255,255,0.07)',
          padding: '8px 0', gap: 4, overflowY: 'auto',
        }}>
          <button onClick={() => selectFilter(null)} style={{
            margin: '0 5px', padding: '7px 3px', borderRadius: 7,
            border: zoneFilter === null ? '2px solid #e8c86a' : '2px solid rgba(255,255,255,0.08)',
            background: zoneFilter === null ? 'rgba(232,200,106,0.15)' : 'transparent',
            color: zoneFilter === null ? '#e8c86a' : 'rgba(255,255,255,0.3)',
            fontSize: 9, fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase',
            cursor: 'pointer', touchAction: 'manipulation', textAlign: 'center', lineHeight: 1.3,
          }}>ALL<br /><span style={{ fontSize: 8, opacity: 0.7 }}>Random</span></button>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '2px 5px' }} />

          {ZONES.map(z => {
            const m = ZONE_META[z];
            const active = zoneFilter === z;
            return (
              <button key={z} onClick={() => selectFilter(z)} style={{
                margin: '0 5px', padding: '8px 3px',
                border: active ? `2px solid ${m.color}` : '2px solid rgba(255,255,255,0.06)',
                background: active ? `${m.color}22` : 'transparent',
                color: active ? m.color : 'rgba(255,255,255,0.35)',
                cursor: 'pointer', touchAction: 'manipulation',
                textAlign: 'center', lineHeight: 1.3, borderRadius: 7,
                boxShadow: active ? `0 0 10px ${m.color}44` : 'none',
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 10, fontWeight: 900 }}>{m.short}</div>
                <div style={{ fontSize: 8, opacity: 0.75, marginTop: 2, fontWeight: 700 }}>{m.rate}</div>
              </button>
            );
          })}
        </div>

        {/* Main drill area */}
        <div className="felt flex-1 flex flex-col items-center py-4 px-3 gap-3 overflow-hidden min-h-0">

          {/* Zone label */}
          <div style={{
            background: 'rgba(0,0,0,0.4)', border: `2px solid ${meta.color}44`,
            borderRadius: 12, padding: '8px 14px', textAlign: 'center', width: '100%',
          }}>
            <div style={{ color: meta.color, fontSize: 18, fontWeight: 900 }}>
              {meta.label} <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>· {meta.rate}</span>
            </div>
          </div>

          {/* Shortcut card */}
          <div style={{
            width: '100%', borderRadius: 10, padding: '8px 12px',
            background: `${meta.color}12`, border: `1px solid ${meta.color}33`,
          }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
              Mental shortcut
            </div>
            <div style={{ color: meta.color, fontSize: 14, fontWeight: 900 }}>{meta.shortcut}</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 2, fontStyle: 'italic' }}>{meta.shortcutDetail}</div>
          </div>

          {/* Timer bar */}
          {timed && phase === 'question' && (
            <div style={{ width: '100%', height: 5, background: 'rgba(0,0,0,0.4)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(timeLeft / TIMER_SECONDS) * 100}%`,
                background: timeLeft <= 2 ? '#ef4444' : timeLeft <= 3 ? '#f59e0b' : '#4ade80',
                transition: 'width 0.9s linear, background 0.3s',
              }} />
            </div>
          )}

          {/* Bet + question */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}>

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Side bet
              </div>
              <div style={{ color: '#e8c86a', fontSize: 48, fontWeight: 900, lineHeight: 1.1 }}>
                ${bet.toLocaleString()}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Profit on {meta.label}?
              </div>
            </div>

            {/* Answer grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 300, marginTop: 4 }}>
              {options.map(opt => {
                const isCorrectOpt = opt === correct;
                const isSelected = answer?.selected === opt;
                let bg = 'rgba(255,255,255,0.06)';
                let border = 'rgba(255,255,255,0.15)';
                let color = '#f5f0e8';
                if (isAnswered) {
                  if (isCorrectOpt) { bg = 'rgba(22,163,74,0.25)'; border = '#4ade80'; color = '#4ade80'; }
                  else if (isSelected) { bg = 'rgba(220,38,38,0.25)'; border = '#f87171'; color = '#f87171'; }
                  else { bg = 'rgba(255,255,255,0.02)'; border = 'rgba(255,255,255,0.06)'; color = 'rgba(255,255,255,0.2)'; }
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} disabled={isAnswered} style={{
                    height: 56, fontSize: 18, fontWeight: 900,
                    borderRadius: 11, cursor: isAnswered ? 'default' : 'pointer', touchAction: 'manipulation',
                    background: bg, border: `2px solid ${border}`, color,
                    transition: 'all 0.12s',
                    boxShadow: isCorrectOpt && isAnswered ? '0 0 14px rgba(74,222,128,0.4)' : 'none',
                  }}>
                    +${opt.toLocaleString()}
                  </button>
                );
              })}
            </div>

            {/* Timed mode — timeout feedback */}
            {isAnswered && answer?.selected === -1 && (
              <div style={{ color: '#f87171', fontSize: 13, fontWeight: 900 }}>⏱ Time's up!</div>
            )}

            {/* Breakdown panel */}
            {isAnswered && (
              <div style={{
                width: '100%', maxWidth: 300, borderRadius: 10, overflow: 'hidden',
                border: `1px solid ${answer?.correct ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                background: 'rgba(0,0,0,0.4)',
              }}>
                <div style={{
                  padding: '5px 10px',
                  background: answer?.correct ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.12)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  color: answer?.correct ? '#4ade80' : '#f87171',
                  fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {answer?.correct ? '✓ Correct' : `✗ Answer: +$${correct.toLocaleString()}`} · Breakdown
                </div>
                <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {lines.map((l, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                        {l.count > 1 ? `${l.count} × ` : ''}${l.denom.toLocaleString()}
                        {l.count > 1 ? ` = $${l.subtotal.toLocaleString()}` : ''} × {meta.multiple}
                      </span>
                      <span style={{ color: '#e8c86a', fontSize: 12, fontWeight: 900 }}>
                        ${l.pays.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {lines.length > 1 && (
                    <>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '2px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Total</span>
                        <span style={{ color: '#4ade80', fontSize: 14, fontWeight: 900 }}>
                          +${correct.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Next button */}
            {isAnswered && !answer?.correct && (
              <button onClick={nextRound} style={{
                width: '100%', maxWidth: 300, height: 48, fontSize: 15, fontWeight: 900,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                borderRadius: 12, background: '#7a1826', color: '#fff',
                border: '1px solid rgba(200,80,100,0.5)',
                cursor: 'pointer', touchAction: 'manipulation',
              }}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <span style={{ color: color ?? '#fff', fontSize: 13, fontWeight: 900 }}>{value}</span>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    </div>
  );
}
