'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── Chip defs ────────────────────────────────────────────────────────────────

const CHIP_DEFS = [
  { value: 5,   color: '#c0392b', rim: '#e74c3c',  label: '5'   },
  { value: 10,  color: '#1a5fa8', rim: '#2980b9',  label: '10'  },
  { value: 25,  color: '#1a7a3a', rim: '#27ae60',  label: '25'  },
  { value: 50,  color: '#6b21a8', rim: '#9333ea',  label: '50'  },
  { value: 100, color: '#1f2937', rim: '#4b5563',  label: '100', text: '#e8c86a' },
  { value: 500, color: '#92400e', rim: '#b8860b',  label: '500', text: '#fde68a' },
];

function Chip3D({ value, size = 54, active = false, onClick }: {
  value: number; size?: number; active?: boolean; onClick?: () => void;
}) {
  const def = CHIP_DEFS.find(c => c.value === value) ?? CHIP_DEFS[0];
  const text = def.text ?? '#fff';
  const fontSize = value >= 100 ? size * 0.18 : size * 0.22;
  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: `radial-gradient(circle at 35% 35%, ${def.rim}, ${def.color})`,
        border: active ? `3px solid #e8c86a` : `3px solid ${def.rim}`,
        boxShadow: active
          ? `0 0 0 2px #e8c86a, 0 0 20px rgba(232,200,106,0.8), 0 6px 14px rgba(0,0,0,0.7)`
          : `0 5px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15)`,
        cursor: onClick ? 'pointer' : 'default',
        transform: active ? 'translateY(-6px) scale(1.12)' : 'scale(1)',
        transition: 'all 0.15s ease',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        touchAction: 'manipulation',
      }}
    >
      <div style={{
        position: 'absolute', inset: size * 0.09,
        borderRadius: '50%',
        border: '1.5px dashed rgba(255,255,255,0.4)',
        pointerEvents: 'none',
      }} />
      <span style={{
        color: text, fontSize, fontWeight: 900,
        fontFamily: 'Georgia, serif', letterSpacing: -0.5,
        position: 'relative', zIndex: 1,
        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
      }}>
        ${def.label}
      </span>
    </button>
  );
}

// ─── Bonus bet definitions ────────────────────────────────────────────────────

type Zone = 'dragon7' | 'panda8' | 'ruby_small' | 'ruby_big' | 'tie';

const ZONE_META: Record<Zone, { label: string; short: string; color: string; rate: string; multiple: number; trigger: string; baseNote: string }> = {
  dragon7:    { label: 'Dragon 7',   short: 'D7',  color: '#a855f7', rate: '40:1', multiple: 40, trigger: 'Banker 3-card total 7 wins',      baseNote: 'Banker base bet → PUSH' },
  panda8:     { label: 'Panda 8',    short: 'P8',  color: '#10b981', rate: '25:1', multiple: 25, trigger: 'Player 3-card total 8 wins',       baseNote: 'Player base bet → pays 1:1' },
  ruby_small: { label: 'Small Ruby', short: 'SR',  color: '#f43f5e', rate: '10:1', multiple: 10, trigger: 'Either side: 3-card total 9',      baseNote: 'Base bet pays normally' },
  ruby_big:   { label: 'Big Ruby',   short: 'BR',  color: '#f97316', rate: '75:1', multiple: 75, trigger: 'Both sides: 3-card total 9 (Tie)', baseNote: 'Base bets → PUSH  |  Tie → 9:1' },
  tie:        { label: 'Tie',        short: 'TIE', color: '#4ade80', rate: '9:1',  multiple: 9,  trigger: 'Tie',                              baseNote: 'Player & Banker base bets → 1:1' },
};

const ZONES: Zone[] = ['dragon7', 'panda8', 'ruby_small', 'ruby_big', 'tie'];

function randomZone(): Zone { return ZONES[Math.floor(Math.random() * ZONES.length)]; }

function makeOptions(correct: number): number[] {
  const pool = new Set([correct]);
  const candidates = [
    Math.round(correct * 0.9), Math.round(correct * 1.1),
    correct - 5, correct + 5,
    Math.round(correct * 0.8), Math.round(correct * 1.2),
  ];
  for (const c of candidates) {
    if (pool.size >= 4) break;
    if (c > 0 && c !== correct) pool.add(c);
  }
  const fallbacks = [correct * 2, correct * 3, Math.round(correct * 0.5), correct + 1, correct - 1, correct + 2];
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
type Phase = 'pick-chip' | 'answering' | 'answered';
type ZoneFilter = Zone | null;

export default function PayoutsDrill() {
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>(null);
  const [zone, setZone] = useState<Zone>('dragon7');
  useEffect(() => { setZone(randomZone()); }, []);
  const [betAmount, setBetAmount] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [answer, setAnswer] = useState<{ selected: number; correct: boolean } | null>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [phase, setPhase] = useState<Phase>('pick-chip');
  const [showLearn, setShowLearn] = useState(false);

  const meta = ZONE_META[zone];
  const correctAmount = betAmount * meta.multiple;

  function selectFilter(z: ZoneFilter) {
    setZoneFilter(z);
    const next = z ?? randomZone();
    setZone(next);
    setBetAmount(0);
    setOptions([]);
    setAnswer(null);
    setPhase('pick-chip');
  }

  function addChip(value: number) {
    if (phase !== 'pick-chip') return;
    setBetAmount(prev => prev + value);
  }

  function confirmBet() {
    if (phase !== 'pick-chip' || betAmount === 0) return;
    setOptions(makeOptions(betAmount * meta.multiple));
    setAnswer(null);
    setPhase('answering');
  }

  function randomBet() {
    if (phase !== 'pick-chip') return;
    const count = Math.floor(Math.random() * 3) + 1;
    let amount = 0;
    for (let i = 0; i < count; i++) {
      amount += CHIP_DEFS[Math.floor(Math.random() * CHIP_DEFS.length)].value;
    }
    setOptions(makeOptions(amount * meta.multiple));
    setBetAmount(amount);
    setAnswer(null);
    setPhase('answering');
  }

  function handleAnswer(val: number) {
    if (phase !== 'answering' || answer) return;
    const correct = val === correctAmount;
    setAnswer({ selected: val, correct });
    setPhase('answered');
    setStats(s => {
      const newStreak = correct ? s.streak + 1 : 0;
      return { correct: s.correct + (correct ? 1 : 0), total: s.total + 1, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak) };
    });
    if (correct) setTimeout(nextRound, 500);
  }

  function nextRound() {
    const next = zoneFilter ?? randomZone();
    setZone(next);
    setBetAmount(0);
    setOptions([]);
    setAnswer(null);
    setPhase('pick-chip');
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #7a1826' }}>
        <Link href="/practice" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Drills</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>💰 Bonus Payouts</div>
        <button
          onClick={() => setShowLearn(true)}
          style={{
            width: 40, background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(232,200,106,0.55)', fontSize: 20, lineHeight: 1,
            touchAction: 'manipulation', padding: 4,
          }}
        >ℹ</button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '5px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Done" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>

      {/* ── Zone selector — horizontal scrollable strip ── */}
      <div style={{
        display: 'flex', overflowX: 'auto', gap: 6, padding: '8px 10px',
        background: 'rgba(0,0,0,0.45)', borderBottom: '1px solid rgba(255,255,255,0.07)',
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
        flexShrink: 0,
      }}>
        {/* ALL button */}
        <button
          onClick={() => selectFilter(null)}
          style={{
            flexShrink: 0, padding: '10px 16px', borderRadius: 10,
            border: zoneFilter === null ? '2px solid #e8c86a' : '2px solid rgba(255,255,255,0.1)',
            background: zoneFilter === null ? 'rgba(232,200,106,0.15)' : 'rgba(255,255,255,0.04)',
            color: zoneFilter === null ? '#e8c86a' : 'rgba(255,255,255,0.4)',
            fontSize: 12, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase',
            cursor: 'pointer', touchAction: 'manipulation', lineHeight: 1.3, textAlign: 'center',
            minWidth: 56,
          }}
        >
          ALL<br /><span style={{ fontSize: 9, opacity: 0.65 }}>Random</span>
        </button>

        {/* Per-zone buttons */}
        {ZONES.map(z => {
          const m = ZONE_META[z];
          const active = zoneFilter === z;
          return (
            <button
              key={z}
              onClick={() => selectFilter(z)}
              style={{
                flexShrink: 0, padding: '10px 16px', borderRadius: 10,
                border: active ? `2px solid ${m.color}` : '2px solid rgba(255,255,255,0.08)',
                background: active ? `${m.color}22` : 'rgba(255,255,255,0.03)',
                color: active ? m.color : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', touchAction: 'manipulation',
                textAlign: 'center', lineHeight: 1.3,
                boxShadow: active ? `0 0 14px ${m.color}44` : 'none',
                transition: 'all 0.15s', minWidth: 60,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 900 }}>{m.short}</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2, fontWeight: 700 }}>{m.rate}</div>
            </button>
          );
        })}
      </div>

      {/* ── Drill area ── */}
      <div className="felt flex-1 flex flex-col items-center justify-between py-4 px-4 overflow-hidden min-h-0">

        {/* Active zone card */}
        <div style={{
          background: 'rgba(0,0,0,0.45)', border: `2px solid ${meta.color}55`,
          borderRadius: 14, padding: '12px 16px', textAlign: 'center', width: '100%',
          boxShadow: `0 0 20px ${meta.color}1a`,
        }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
            {meta.trigger}
          </div>
          <div style={{ color: meta.color, fontSize: 22, fontWeight: 900 }}>
            {meta.label} <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>· {meta.rate}</span>
          </div>
          <div style={{
            marginTop: 7, padding: '3px 8px', borderRadius: 5,
            background: `${meta.color}12`, border: `1px solid ${meta.color}28`,
            color: 'rgba(255,255,255,0.45)', fontSize: 9, fontStyle: 'italic',
          }}>
            {meta.baseNote}
          </div>
        </div>

        {/* Center: bet display + answers */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'center', width: '100%' }}>

          {betAmount === 0 && phase === 'pick-chip' ? (
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Tap chips below to place a bet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ color: '#e8c86a', fontSize: 42, fontWeight: 900, fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                ${betAmount.toLocaleString()}
              </div>
              {phase === 'answering' && (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Side bet profit?
                </div>
              )}
              {phase === 'answered' && answer && (
                <div style={{ color: answer.correct ? '#4ade80' : '#f87171', fontSize: 13, fontWeight: 900, textAlign: 'center' }}>
                  {answer.correct
                    ? `✓ +$${correctAmount.toLocaleString()}`
                    : `✗ Correct: +$${correctAmount.toLocaleString()} ($${betAmount} × ${meta.multiple})`}
                </div>
              )}
            </div>
          )}

          {/* Answer grid */}
          {(phase === 'answering' || phase === 'answered') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
              {options.map(opt => {
                const isCorrect = opt === correctAmount;
                const isSelected = opt === answer?.selected;
                let bg = 'rgba(255,255,255,0.06)';
                let border = 'rgba(255,255,255,0.15)';
                let color = '#f5f0e8';
                if (phase === 'answered') {
                  if (isCorrect) { bg = 'rgba(22,163,74,0.25)'; border = '#4ade80'; color = '#4ade80'; }
                  else if (isSelected) { bg = 'rgba(220,38,38,0.25)'; border = '#f87171'; color = '#f87171'; }
                  else { bg = 'rgba(255,255,255,0.02)'; border = 'rgba(255,255,255,0.06)'; color = 'rgba(255,255,255,0.2)'; }
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} disabled={phase === 'answered'} style={{
                    height: 64, fontSize: 20, fontWeight: 900,
                    borderRadius: 14, cursor: phase === 'answering' ? 'pointer' : 'default',
                    touchAction: 'manipulation',
                    background: bg, border: `2px solid ${border}`, color,
                    transition: 'all 0.12s',
                    boxShadow: isCorrect && phase === 'answered' ? '0 0 16px rgba(74,222,128,0.4)' : 'none',
                  }}>
                    +${opt.toLocaleString()}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {phase === 'pick-chip' && (
            <>
              {/* Chip tray — two rows on narrow screens via wrapping */}
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
                flexWrap: 'wrap', gap: 8,
                paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)',
              }}>
                {CHIP_DEFS.map(chip => (
                  <Chip3D key={chip.value} value={chip.value} size={52} onClick={() => addChip(chip.value)} />
                ))}
              </div>
              <button
                onClick={randomBet}
                style={{
                  width: '100%', height: 44, fontSize: 13, fontWeight: 800,
                  borderRadius: 10, background: 'rgba(255,255,255,0.05)',
                  border: '1px dashed rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.45)',
                  cursor: 'pointer', touchAction: 'manipulation', letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                ⚡ Random Bet
              </button>
              {betAmount > 0 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setBetAmount(0)}
                    style={{
                      flex: 1, height: 50, fontSize: 14, fontWeight: 700,
                      borderRadius: 12, background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)',
                      cursor: 'pointer', touchAction: 'manipulation',
                    }}
                  >Clear</button>
                  <button
                    onClick={confirmBet}
                    style={{
                      flex: 2, height: 50, fontSize: 15, fontWeight: 900,
                      borderRadius: 12, background: meta.color,
                      border: 'none', color: '#000',
                      cursor: 'pointer', touchAction: 'manipulation',
                      letterSpacing: '0.05em',
                    }}
                  >Place Bet →</button>
                </div>
              )}
            </>
          )}
          {phase === 'answered' && (
            <button onClick={nextRound} style={{
              width: '100%', height: 56, fontSize: 16, fontWeight: 900,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              borderRadius: 14, background: '#7a1826', color: '#fff',
              border: '1px solid rgba(200,80,100,0.5)',
              cursor: 'pointer', touchAction: 'manipulation',
            }}>
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Learn modal */}
      {showLearn && (
        <div
          onClick={() => setShowLearn(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#111720', borderRadius: '20px 20px 0 0',
              border: '2px solid rgba(232,200,106,0.25)', borderBottom: 'none',
              width: '100%', maxWidth: 500,
              padding: '20px 16px 32px',
              maxHeight: '88dvh', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ color: '#e8c86a', fontSize: 14, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Bonus Payout Guide
              </div>
              <button onClick={() => setShowLearn(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>
            </div>

            {ZONES.map(z => {
              const m = ZONE_META[z];
              const exampleBet = 25;
              const exampleWin = exampleBet * m.multiple;
              return (
                <div key={z} style={{
                  marginBottom: 12, borderRadius: 12, padding: '12px 14px',
                  background: `${m.color}0f`, border: `1.5px solid ${m.color}33`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ color: m.color, fontSize: 14, fontWeight: 900 }}>{m.label}</div>
                    <div style={{
                      background: `${m.color}22`, border: `1px solid ${m.color}55`,
                      color: m.color, fontSize: 11, fontWeight: 900,
                      borderRadius: 6, padding: '2px 8px',
                    }}>{m.rate}</div>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginBottom: 6, lineHeight: 1.5 }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.08em' }}>Trigger: </span>
                    {m.trigger}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(0,0,0,0.3)', borderRadius: 7, padding: '6px 10px',
                    marginBottom: 4,
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700 }}>Example:</span>
                    <span style={{ color: '#e8c86a', fontSize: 12, fontWeight: 900 }}>${exampleBet} bet</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>→</span>
                    <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 900 }}>+${exampleWin.toLocaleString()}</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9 }}>({m.multiple}×)</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontStyle: 'italic' }}>
                    {m.baseNote}
                  </div>
                </div>
              );
            })}

            <div style={{
              marginTop: 8, padding: '10px 12px', borderRadius: 10,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.35)', fontSize: 10, lineHeight: 1.6,
            }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>How to calculate:</span>{' '}
              Multiply your bonus bet amount by the payout rate. Dragon 7 at 40:1 means a $25 bet returns $1,000 in profit. The original bet is also returned.
            </div>
          </div>
        </div>
      )}
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
