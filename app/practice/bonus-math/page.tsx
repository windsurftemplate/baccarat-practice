'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// ─── Bonus definitions ────────────────────────────────────────────────────────

type Zone = 'dragon7' | 'panda8' | 'ruby_small' | 'ruby_big' | 'tie';
const ZONES: Zone[] = ['dragon7', 'panda8', 'ruby_small', 'ruby_big', 'tie'];

const ZONE_META: Record<Zone, {
  label: string; short: string; color: string; rate: string; multiple: number;
  shortcut: string; shortcutDetail: string; trigger: string;
}> = {
  dragon7:    { label: 'Dragon 7',   short: 'D7',  color: '#a855f7', rate: '40:1', multiple: 40, shortcut: '×4, then add a zero',  shortcutDetail: '$25 × 4 = $100 → $1,000',          trigger: 'Banker 3-card total 7 wins' },
  panda8:     { label: 'Panda 8',    short: 'P8',  color: '#10b981', rate: '25:1', multiple: 25, shortcut: '×100 ÷ 4',             shortcutDetail: '$100 × 25 → $10,000 ÷ 4 = $2,500', trigger: 'Player 3-card total 8 wins' },
  ruby_small: { label: 'Small Ruby', short: 'SR',  color: '#f43f5e', rate: '10:1', multiple: 10, shortcut: 'Add a zero',            shortcutDetail: '$35 × 10 → $350',                  trigger: 'Either side: 3-card total 9' },
  ruby_big:   { label: 'Big Ruby',   short: 'BR',  color: '#f97316', rate: '75:1', multiple: 75, shortcut: '×100 − ×25',           shortcutDetail: '$25×100=$2,500 − $25×25=$625=$1,875', trigger: 'Both sides 3-card 9 (Tie)' },
  tie:        { label: 'Tie',        short: 'TIE', color: '#4ade80', rate: '9:1',  multiple: 9,  shortcut: '×10 − bet',            shortcutDetail: '$35×10=$350 − $35=$315',            trigger: 'Tie' },
};

// ─── Chip display ─────────────────────────────────────────────────────────────

const CHIP_STYLE: Record<number, { bg: string; rim: string; text: string }> = {
  5:   { bg: '#a12020', rim: '#c0392b', text: '#fff' },
  10:  { bg: '#1a5fa8', rim: '#2980b9', text: '#fff' },
  25:  { bg: '#1a7a3a', rim: '#27ae60', text: '#fff' },
  50:  { bg: '#5b1e8a', rim: '#7c3aed', text: '#fff' },
  100: { bg: '#1f2937', rim: '#4b5563', text: '#e8c86a' },
};

function betToChips(bet: number): number[] {
  const chips: number[] = [];
  let r = bet;
  for (const d of [100, 50, 25, 10, 5]) {
    while (r >= d) { chips.push(d); r -= d; }
  }
  return chips;
}

function ChipStack({ bet }: { bet: number }) {
  const chips = betToChips(bet);
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      {chips.map((v, i) => {
        const s = CHIP_STYLE[v] ?? CHIP_STYLE[5];
        return (
          <div key={i} style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: `radial-gradient(circle at 35% 35%, ${s.rim}, ${s.bg})`,
            border: `3px solid ${s.rim}`,
            boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: 5, borderRadius: '50%', border: '1.5px dashed rgba(255,255,255,0.3)' }} />
            <span style={{ color: s.text, fontSize: 10, fontWeight: 900, position: 'relative', zIndex: 1 }}>${v}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Difficulty = 'normal' | 'hard' | 'blind';
type ZoneFilter = Zone | null;

const CHIP_DENOMS = [5, 10, 25, 50, 100];

function randomBet(difficulty: Difficulty): number {
  const maxChips = difficulty === 'hard' ? 4 : difficulty === 'blind' ? 3 : 2;
  const count = 1 + Math.floor(Math.random() * maxChips);
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += CHIP_DENOMS[Math.floor(Math.random() * CHIP_DENOMS.length)];
  }
  return total;
}

function randomZone(): Zone { return ZONES[Math.floor(Math.random() * ZONES.length)]; }

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
    Math.round(correct * 0.8), Math.round(correct * 1.2),
    correct - 100, correct + 100, correct - 50, correct + 50,
  ];
  for (const c of candidates) {
    if (pool.size >= 4) break;
    if (c > 0 && c !== correct) pool.add(c);
  }
  const fallbacks = [correct * 2, Math.round(correct * 0.5), correct + 25, correct - 25];
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

// ─── Teaching data ────────────────────────────────────────────────────────────

const PAYOUT_TABLE_BETS = [5, 10, 25, 50, 100];

interface ZoneTeach {
  why: string;
  steps: string[];
  examples: Array<{ bet: number; steps: string[]; result: number }>;
  memoryTip: string;
}

const ZONE_TEACH: Record<Zone, ZoneTeach> = {
  dragon7: {
    why: '40 = 4 × 10, so multiply by 4 then add a zero.',
    steps: ['Take the bet', 'Multiply by 4', 'Add a zero (×10)'],
    examples: [
      { bet: 25, steps: ['$25 × 4 = $100', '$100 × 10 = $1,000'], result: 1000 },
      { bet: 35, steps: ['Split: $25 + $10', '$25×40 = $1,000', '$10×40 = $400', '$1,000 + $400 = $1,400'], result: 1400 },
    ],
    memoryTip: '"Four times, then add a zero." $5 chip = $200, $25 chip = $1,000.',
  },
  panda8: {
    why: '25 = 100 ÷ 4. So ×25 = ×100 then ÷4 (halve it twice).',
    steps: ['Take the bet', 'Multiply by 100 (add two zeros)', 'Halve it', 'Halve it again'],
    examples: [
      { bet: 25, steps: ['$25 × 100 = $2,500', '÷2 = $1,250', '÷2 = $625'], result: 625 },
      { bet: 100, steps: ['$100 × 100 = $10,000', '÷2 = $5,000', '÷2 = $2,500'], result: 2500 },
    ],
    memoryTip: '"Add two zeros, halve twice." Think: 25¢ = quarter = ¼ of $1, so ×25 = ×100÷4.',
  },
  ruby_small: {
    why: '×10 is the simplest — just move the decimal right one place.',
    steps: ['Take the bet', 'Add a zero (move decimal right)'],
    examples: [
      { bet: 25, steps: ['$25 → $250'], result: 250 },
      { bet: 35, steps: ['$35 × 10 = $350'], result: 350 },
    ],
    memoryTip: '"Just add a zero." Easiest one at the table — instant calculation.',
  },
  ruby_big: {
    why: '75 = 100 − 25. Easier than multiplying by 75 directly.',
    steps: ['Take the bet', 'Multiply by 100 (add two zeros)', 'Subtract ×25 (which is ×100÷4)'],
    examples: [
      { bet: 25, steps: ['$25 × 100 = $2,500', '$25 × 25 = $625', '$2,500 − $625 = $1,875'], result: 1875 },
      { bet: 10, steps: ['$10 × 100 = $1,000', '$10 × 25 = $250', '$1,000 − $250 = $750'], result: 750 },
    ],
    memoryTip: '"Times 100, minus a quarter of that." Alt: ×75 = ×50 + ×25 (double it, then add half).',
  },
  tie: {
    why: '9 = 10 − 1. So ×9 = ×10 then subtract the original bet.',
    steps: ['Take the bet', 'Multiply by 10 (add a zero)', 'Subtract the original bet'],
    examples: [
      { bet: 25, steps: ['$25 × 10 = $250', '$250 − $25 = $225'], result: 225 },
      { bet: 35, steps: ['$35 × 10 = $350', '$350 − $35 = $315'], result: 315 },
    ],
    memoryTip: '"Times ten, give back one." $25 tie = $250 − $25 = $225.',
  },
};

// ─── Teaching modal ───────────────────────────────────────────────────────────

function TeachModal({ onClose, zoneStats }: { onClose: () => void; zoneStats: ZoneStats }) {
  const [tab, setTab] = useState<'table' | 'system'>('table');

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#111720', borderRadius: '20px 20px 0 0',
        border: '2px solid rgba(232,200,106,0.25)', borderBottom: 'none',
        width: '100%', maxWidth: 520,
        maxHeight: '92dvh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 0' }}>
          <div style={{ color: '#e8c86a', fontSize: 13, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Bonus Payout System
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', margin: '12px 16px 0', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          {(['table', 'system'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '7px 4px', fontSize: 11, fontWeight: 800,
              letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', border: 'none',
              background: tab === t ? 'rgba(232,200,106,0.18)' : 'transparent',
              color: tab === t ? '#e8c86a' : 'rgba(255,255,255,0.3)',
              borderBottom: tab === t ? '2px solid #e8c86a' : '2px solid transparent',
            }}>
              {t === 'table' ? '📋 Quick Table' : '⚡ How to Calculate'}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', padding: '14px 16px 32px', flex: 1 }}>
          {tab === 'table' && (
            <>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 10, lineHeight: 1.5 }}>
                Profit paid for each bonus bet. Memorize the <span style={{ color: '#e8c86a' }}>$25</span> row first — it's the most common chip.
              </div>

              {/* Payout table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr>
                      <th style={{ color: 'rgba(255,255,255,0.4)', padding: '5px 6px', textAlign: 'left', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Bet</th>
                      {ZONES.map(z => (
                        <th key={z} style={{ padding: '5px 6px', textAlign: 'center', fontWeight: 900, color: ZONE_META[z].color, borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                          {ZONE_META[z].short}<br />
                          <span style={{ fontSize: 9, opacity: 0.7, fontWeight: 700 }}>{ZONE_META[z].rate}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PAYOUT_TABLE_BETS.map((bet, ri) => (
                      <tr key={bet} style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                        <td style={{ padding: '7px 6px', color: '#e8c86a', fontWeight: 900, fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          ${bet}
                        </td>
                        {ZONES.map(z => {
                          const pays = bet * ZONE_META[z].multiple;
                          return (
                            <td key={z} style={{ padding: '7px 6px', textAlign: 'center', color: '#fff', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              ${pays >= 1000 ? `${(pays / 1000).toFixed(pays % 1000 === 0 ? 0 : 1)}k` : pays}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Per-zone accuracy */}
              <div style={{ marginTop: 16 }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Your accuracy per bonus</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ZONES.map(z => {
                    const zs = zoneStats[z];
                    const zpct = zs.total > 0 ? Math.round((zs.correct / zs.total) * 100) : null;
                    const m = ZONE_META[z];
                    return (
                      <div key={z} style={{ borderRadius: 8, padding: '6px 10px', background: `${m.color}12`, border: `1px solid ${m.color}30`, textAlign: 'center', minWidth: 52 }}>
                        <div style={{ color: m.color, fontSize: 10, fontWeight: 900 }}>{m.short}</div>
                        <div style={{ color: zpct === null ? 'rgba(255,255,255,0.2)' : zpct >= 90 ? '#4ade80' : zpct >= 70 ? '#fbbf24' : '#f87171', fontSize: 12, fontWeight: 900, marginTop: 2 }}>
                          {zpct !== null ? `${zpct}%` : '—'}
                        </div>
                        {zs.total > 0 && <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 8 }}>{zs.total} tries</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {tab === 'system' && (
            <>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 12, lineHeight: 1.5 }}>
                Each bonus has a mental shortcut. Learn the <b style={{ color: '#e8c86a' }}>system</b> — not just the numbers.
                For mixed bets, split by denomination and add the results.
              </div>

              {ZONES.map(z => {
                const m = ZONE_META[z];
                const t = ZONE_TEACH[z];
                return (
                  <div key={z} style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${m.color}30` }}>
                    {/* Zone header */}
                    <div style={{ background: `${m.color}18`, padding: '9px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ color: m.color, fontSize: 14, fontWeight: 900 }}>{m.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{m.trigger}</div>
                      <div style={{ background: `${m.color}22`, border: `1px solid ${m.color}55`, color: m.color, fontSize: 12, fontWeight: 900, borderRadius: 5, padding: '2px 8px' }}>{m.rate}</div>
                    </div>

                    <div style={{ padding: '10px 13px', background: '#0d111a', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Why it works */}
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Why it works</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 1.5 }}>{t.why}</div>
                      </div>

                      {/* Steps */}
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>The steps</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {t.steps.map((step, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <span style={{ color: m.color, fontSize: 10, fontWeight: 900, minWidth: 16, marginTop: 1 }}>{i + 1}.</span>
                              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Worked examples */}
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Worked examples</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {t.examples.map((ex, ei) => (
                            <div key={ei} style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.07)' }}>
                              <div style={{ color: '#e8c86a', fontSize: 12, fontWeight: 900, marginBottom: 5 }}>Bet: ${ex.bet}</div>
                              {ex.steps.map((s, si) => (
                                <div key={si} style={{ color: si === ex.steps.length - 1 ? '#4ade80' : 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: 1.6, fontWeight: si === ex.steps.length - 1 ? 900 : 400 }}>
                                  {si === ex.steps.length - 1 ? '→ ' : '   '}{s}
                                </div>
                              ))}
                              <div style={{ color: m.color, fontSize: 13, fontWeight: 900, marginTop: 4 }}>Profit: +${ex.result.toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Memory tip */}
                      <div style={{ background: `${m.color}0c`, border: `1px solid ${m.color}25`, borderRadius: 7, padding: '7px 10px' }}>
                        <span style={{ color: m.color, fontSize: 10, fontWeight: 900 }}>💡 Memory tip: </span>
                        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>{t.memoryTip}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Mixed bet tip */}
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', fontSize: 10, lineHeight: 1.7 }}>
                <span style={{ color: '#e8c86a', fontWeight: 700 }}>Mixed bets:</span> Always split by denomination.
                Example — $35 Dragon 7 = $25 chip + $10 chip.
                $25×40 = $1,000 · $10×40 = $400 · Total = <span style={{ color: '#4ade80', fontWeight: 700 }}>$1,400</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
type ZoneStats = Record<Zone, { correct: number; total: number }>;
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
const emptyZoneStats = (): ZoneStats => Object.fromEntries(ZONES.map(z => [z, { correct: 0, total: 0 }])) as ZoneStats;

type Phase = 'question' | 'answered';
const TIMER_SECONDS = 5;

function freshRound(zoneFilter: ZoneFilter, difficulty: Difficulty) {
  const zone = zoneFilter ?? randomZone();
  const bet = randomBet(difficulty);
  return { zone, bet, options: makeOptions(bet * ZONE_META[zone].multiple) };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BonusMathDrill() {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>(null);
  const [round, setRound] = useState(() => freshRound(null, 'normal'));
  const [phase, setPhase] = useState<Phase>('question');
  const [answer, setAnswer] = useState<{ selected: number; correct: boolean } | null>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [zoneStats, setZoneStats] = useState<ZoneStats>(emptyZoneStats);
  const [timed, setTimed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [showRef, setShowRef] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutFired = useRef(false);

  const { zone, bet, options } = round;
  const meta = ZONE_META[zone];
  const correct = bet * meta.multiple;
  const lines = decompose(bet, meta.multiple);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    clearTimer();
    if (!timed || phase !== 'question') { setTimeLeft(TIMER_SECONDS); return; }
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => (t <= 1 ? TIMER_SECONDS : t - 1));
    }, 1000);
    return clearTimer;
  }, [timed, phase, round, clearTimer]);

  useEffect(() => {
    if (!timed || phase !== 'question') { timeoutFired.current = false; return; }
    if (timeLeft <= 1 && !timeoutFired.current) {
      timeoutFired.current = true;
      clearTimer();
      setAnswer({ selected: -1, correct: false });
      setPhase('answered');
      setZoneStats(zs => ({ ...zs, [zone]: { correct: zs[zone].correct, total: zs[zone].total + 1 } }));
      setStats(s => ({ ...s, total: s.total + 1, streak: 0 }));
    }
  }, [timeLeft, timed, phase, clearTimer, zone]);

  function handleAnswer(val: number) {
    if (phase !== 'question' || answer) return;
    clearTimer();
    const isCorrect = val === correct;
    setAnswer({ selected: val, correct: isCorrect });
    setPhase('answered');
    setZoneStats(zs => ({ ...zs, [zone]: { correct: zs[zone].correct + (isCorrect ? 1 : 0), total: zs[zone].total + 1 } }));
    setStats(s => {
      const newStreak = isCorrect ? s.streak + 1 : 0;
      return { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak) };
    });
    if (isCorrect) setTimeout(nextRound, 1400);
  }

  function nextRound() {
    timeoutFired.current = false;
    setRound(freshRound(zoneFilter, difficulty));
    setAnswer(null);
    setPhase('question');
  }

  function selectFilter(z: ZoneFilter) {
    timeoutFired.current = false;
    setZoneFilter(z);
    setRound(freshRound(z, difficulty));
    setAnswer(null);
    setPhase('question');
  }

  function selectDifficulty(d: Difficulty) {
    timeoutFired.current = false;
    setDifficulty(d);
    setRound(freshRound(zoneFilter, d));
    setAnswer(null);
    setPhase('question');
  }

  function resetAll() {
    setStats(emptyStats());
    setZoneStats(emptyZoneStats());
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
  const isAnswered = phase === 'answered';
  const showShortcut = difficulty !== 'blind';

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
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setShowRef(true)} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
            color: 'rgba(232,200,106,0.55)', fontSize: 15, padding: '2px 6px',
            cursor: 'pointer', touchAction: 'manipulation', lineHeight: 1,
          }}>ℹ</button>
          <button onClick={() => { setTimed(t => !t); nextRound(); }} style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '3px 7px', borderRadius: 4, cursor: 'pointer', touchAction: 'manipulation',
            background: timed ? 'rgba(251,191,36,0.2)' : 'none',
            border: timed ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.1)',
            color: timed ? '#fbbf24' : 'rgba(255,255,255,0.3)',
          }}>⏱</button>
        </div>
      </div>

      {/* Difficulty tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
        {(['normal', 'hard', 'blind'] as Difficulty[]).map(d => (
          <button key={d} onClick={() => selectDifficulty(d)} style={{
            flex: 1, padding: '6px 4px', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
            textTransform: 'uppercase', cursor: 'pointer', touchAction: 'manipulation', border: 'none',
            background: difficulty === d ? 'rgba(122,24,38,0.45)' : 'transparent',
            color: difficulty === d ? '#f5f0e8' : 'rgba(255,255,255,0.3)',
            borderBottom: difficulty === d ? '2px solid #f87171' : '2px solid transparent',
          }}>
            {d === 'normal' ? 'Normal' : d === 'hard' ? '💀 Hard' : '🙈 Blind'}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '5px 12px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Done" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
        <button onClick={resetAll} style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif', padding: '2px 4px' }}>Reset</button>
      </div>

      {/* ── Zone selector — horizontal scrollable strip ── */}
      <div style={{
        display: 'flex', overflowX: 'auto', gap: 6, padding: '8px 10px',
        background: 'rgba(0,0,0,0.45)', borderBottom: '1px solid rgba(255,255,255,0.07)',
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
        flexShrink: 0,
      }}>
        <button onClick={() => selectFilter(null)} style={{
          flexShrink: 0, padding: '10px 16px', borderRadius: 10,
          border: zoneFilter === null ? '2px solid #e8c86a' : '2px solid rgba(255,255,255,0.1)',
          background: zoneFilter === null ? 'rgba(232,200,106,0.15)' : 'rgba(255,255,255,0.04)',
          color: zoneFilter === null ? '#e8c86a' : 'rgba(255,255,255,0.4)',
          fontSize: 12, fontWeight: 900, textTransform: 'uppercase',
          cursor: 'pointer', touchAction: 'manipulation', textAlign: 'center', lineHeight: 1.3,
          minWidth: 56,
        }}>ALL<br /><span style={{ fontSize: 9, opacity: 0.65 }}>Random</span></button>

        {ZONES.map(z => {
          const m = ZONE_META[z];
          const active = zoneFilter === z;
          const zs = zoneStats[z];
          const zpct = zs.total > 0 ? Math.round((zs.correct / zs.total) * 100) : null;
          const dotColor = zpct === null ? 'rgba(255,255,255,0.25)' : zpct >= 90 ? '#4ade80' : zpct >= 70 ? '#fbbf24' : '#f87171';
          return (
            <button key={z} onClick={() => selectFilter(z)} style={{
              flexShrink: 0, padding: '10px 16px', borderRadius: 10,
              border: active ? `2px solid ${m.color}` : '2px solid rgba(255,255,255,0.08)',
              background: active ? `${m.color}22` : 'rgba(255,255,255,0.03)',
              color: active ? m.color : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', touchAction: 'manipulation',
              textAlign: 'center', lineHeight: 1.3, minWidth: 60,
              boxShadow: active ? `0 0 14px ${m.color}44` : 'none',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{m.short}</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 1, fontWeight: 700 }}>{m.rate}</div>
              <div style={{ fontSize: 9, fontWeight: 900, color: dotColor, marginTop: 2 }}>
                {zpct !== null ? `${zpct}%` : '—'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Main drill area */}
        <div className="felt flex-1 flex flex-col items-center py-3 px-3 gap-3 overflow-y-auto min-h-0">

          {/* Zone label */}
          <div style={{
            background: 'rgba(0,0,0,0.4)', border: `2px solid ${meta.color}44`,
            borderRadius: 12, padding: '7px 14px', textAlign: 'center', width: '100%',
          }}>
            <div style={{ color: meta.color, fontSize: 17, fontWeight: 900 }}>
              {meta.label} <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>· {meta.rate}</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 2 }}>{meta.trigger}</div>
          </div>

          {/* Shortcut card — hidden in Blind mode */}
          {showShortcut ? (
            <div style={{
              width: '100%', borderRadius: 10, padding: '8px 12px',
              background: `${meta.color}12`, border: `1px solid ${meta.color}33`,
            }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
                Mental shortcut
              </div>
              <div style={{ color: meta.color, fontSize: 14, fontWeight: 900 }}>{meta.shortcut}</div>
              <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, marginTop: 2, fontStyle: 'italic' }}>{meta.shortcutDetail}</div>
            </div>
          ) : (
            <div style={{
              width: '100%', borderRadius: 10, padding: '8px 12px',
              background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)',
              textAlign: 'center',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 700 }}>🙈 Blind mode — shortcut hidden</div>
            </div>
          )}

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

          {/* Bet display */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Side bet
            </div>
            <ChipStack bet={bet} />
            <div style={{ color: '#e8c86a', fontSize: 36, fontWeight: 900, lineHeight: 1, marginTop: 6 }}>
              ${bet.toLocaleString()}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
              Profit on {meta.label}?
            </div>
          </div>

          {/* Answer grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 310 }}>
            {options.map(opt => {
              const isCorrectOpt = opt === correct;
              const isSelected = answer?.selected === opt;
              let bg = 'rgba(255,255,255,0.06)';
              let border = 'rgba(255,255,255,0.15)';
              let color = '#f5f0e8';
              if (isAnswered) {
                if (isCorrectOpt) { bg = 'rgba(22,163,74,0.25)'; border = '#4ade80'; color = '#4ade80'; }
                else if (isSelected) { bg = 'rgba(220,38,38,0.25)'; border = '#f87171'; color = '#f87171'; }
                else { bg = 'rgba(255,255,255,0.02)'; border = 'rgba(255,255,255,0.05)'; color = 'rgba(255,255,255,0.18)'; }
              }
              return (
                <button key={opt} onClick={() => handleAnswer(opt)} disabled={isAnswered} style={{
                  height: 58, fontSize: 18, fontWeight: 900,
                  borderRadius: 11, cursor: isAnswered ? 'default' : 'pointer', touchAction: 'manipulation',
                  background: bg, border: `2px solid ${border}`, color,
                  transition: 'all 0.12s',
                  boxShadow: isCorrectOpt && isAnswered ? '0 0 16px rgba(74,222,128,0.45)' : 'none',
                }}>
                  +${opt.toLocaleString()}
                </button>
              );
            })}
          </div>

          {/* Timeout label */}
          {isAnswered && answer?.selected === -1 && (
            <div style={{ color: '#f87171', fontSize: 13, fontWeight: 900 }}>⏱ Time's up!</div>
          )}

          {/* Breakdown panel — always shown after answering */}
          {isAnswered && (
            <div style={{
              width: '100%', maxWidth: 310, borderRadius: 10, overflow: 'hidden',
              border: `1px solid ${answer?.correct ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
              background: 'rgba(0,0,0,0.45)',
            }}>
              <div style={{
                padding: '5px 12px',
                background: answer?.correct ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.12)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                color: answer?.correct ? '#4ade80' : '#f87171',
                fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {answer?.correct ? '✓ Correct' : `✗ Correct: +$${correct.toLocaleString()}`} · Breakdown
              </div>
              <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {lines.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                      {l.count > 1 ? `${l.count}×$${l.denom} ($${l.subtotal})` : `$${l.denom}`} × {meta.multiple}
                    </span>
                    <span style={{ color: '#e8c86a', fontSize: 13, fontWeight: 900 }}>
                      ${l.pays.toLocaleString()}
                    </span>
                  </div>
                ))}
                {lines.length > 1 && (
                  <>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Total profit</span>
                      <span style={{ color: '#4ade80', fontSize: 15, fontWeight: 900 }}>+${correct.toLocaleString()}</span>
                    </div>
                  </>
                )}
                {/* Shortcut reminder in Blind mode */}
                {!showShortcut && (
                  <div style={{ marginTop: 4, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', fontSize: 10, fontStyle: 'italic' }}>
                    Shortcut: {meta.shortcut}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next button — always shown on wrong, auto-advances on correct */}
          {isAnswered && !answer?.correct && (
            <button onClick={nextRound} style={{
              width: '100%', maxWidth: 310, height: 48, fontSize: 15, fontWeight: 900,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              borderRadius: 12, background: '#7a1826', color: '#fff',
              border: '1px solid rgba(200,80,100,0.5)',
              cursor: 'pointer', touchAction: 'manipulation',
            }}>
              Next →
            </button>
          )}
          {isAnswered && answer?.correct && (
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center' }}>Auto-advancing…</div>
          )}
        </div>
      </div>

      {/* Reference / Teaching modal */}
      {showRef && <TeachModal onClose={() => setShowRef(false)} zoneStats={zoneStats} />}
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
