'use client';
import { useState } from 'react';
import Link from 'next/link';

// ─── Chip definitions ─────────────────────────────────────────────────────────

const CHIPS = [
  { value: 1,   color: '#166534', rim: '#22c55e', name: 'Green',  label: '$1'   },
  { value: 5,   color: '#991b1b', rim: '#ef4444', name: 'Red',    label: '$5'   },
  { value: 20,  color: '#075985', rim: '#38bdf8', name: 'Blue',   label: '$20'  },
  { value: 100, color: '#581c87', rim: '#a855f7', name: 'Purple', label: '$100' },
] as const;

type Chip = typeof CHIPS[number];

const RACK_SIZE  = 100; // chips in a full rack
const STACK_SIZE = 20;  // chips in a stack

interface RackGroup {
  chip: Chip;
  racks:  number; // full racks (100 chips each)
  stacks: number; // additional stacks (20 chips each)
}

function groupValue(g: RackGroup): number {
  return (g.racks * RACK_SIZE + g.stacks * STACK_SIZE) * g.chip.value;
}

// ─── Scenario generation ──────────────────────────────────────────────────────

function generateScenario(streak: number): { groups: RackGroup[]; total: number } {
  const isHard = streak >= 10;
  const isMed  = streak >= 4;

  const groups: RackGroup[] = [];

  // $100 Purple — primary driver of bank value (always present)
  const purpleRacks  = 1 + Math.floor(Math.random() * (isHard ? 3 : isMed ? 2 : 2));
  const purpleStacks = isMed ? Math.floor(Math.random() * 4) : 0;
  groups.push({ chip: CHIPS[3], racks: purpleRacks, stacks: purpleStacks });

  // $20 Blue — nearly always present
  if (Math.random() < (isMed ? 0.85 : 0.6)) {
    const blueRacks  = Math.floor(Math.random() * (isHard ? 4 : 3));
    const blueStacks = isMed ? Math.floor(Math.random() * 3) : Math.random() < 0.35 ? 1 : 0;
    if (blueRacks + blueStacks > 0) {
      groups.push({ chip: CHIPS[2], racks: blueRacks, stacks: blueStacks });
    }
  }

  // $5 Red — appears at medium+
  if (isMed && Math.random() < 0.55) {
    const redRacks  = Math.floor(Math.random() * (isHard ? 3 : 2));
    const redStacks = Math.floor(Math.random() * (isHard ? 4 : 2));
    if (redRacks + redStacks > 0) {
      groups.push({ chip: CHIPS[1], racks: redRacks, stacks: redStacks });
    }
  }

  // $1 Green — appears at hard only
  if (isHard && Math.random() < 0.4) {
    const greenRacks  = Math.floor(Math.random() * 3);
    const greenStacks = Math.floor(Math.random() * 3);
    if (greenRacks + greenStacks > 0) {
      groups.push({ chip: CHIPS[0], racks: greenRacks, stacks: greenStacks });
    }
  }

  const total = groups.reduce((sum, g) => sum + groupValue(g), 0);
  if (total === 0) return generateScenario(streak);

  groups.sort((a, b) => b.chip.value - a.chip.value); // highest denom first
  return { groups, total };
}

function makeOptions(correct: number, groups: RackGroup[]): number[] {
  const pool = new Set<number>([correct]);

  // Off by one stack or one rack of each denomination present
  for (const g of groups) {
    const stackVal = g.chip.value * STACK_SIZE;
    const rackVal  = g.chip.value * RACK_SIZE;
    for (const delta of [stackVal, -stackVal, rackVal, -rackVal]) {
      if (pool.size >= 4) break;
      const v = correct + delta;
      if (v > 0 && v !== correct) pool.add(v);
    }
    if (pool.size >= 4) break;
  }

  // Fill if needed
  let attempts = 0;
  while (pool.size < 4 && attempts < 80) {
    attempts++;
    const g = groups[Math.floor(Math.random() * groups.length)];
    const delta = g.chip.value * RACK_SIZE * (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2));
    const v = correct + delta;
    if (v > 0 && v !== correct) pool.add(v);
  }

  return [...pool].slice(0, 4).sort(() => Math.random() - 0.5);
}

// ─── Visuals ──────────────────────────────────────────────────────────────────

// A rack = flat rectangular tray of 100 chips (5 columns × 20)
function RackIcon({ chip, width = 80 }: { chip: Chip; width?: number }) {
  const cols = 5;
  const chipW = Math.floor((width - 16) / cols);
  const chipH = Math.round(chipW * 0.38);
  return (
    <div style={{
      width, background: 'linear-gradient(180deg,#2a1f08,#1a1005)',
      border: `2px solid ${chip.rim}55`, borderRadius: 7,
      padding: '5px 6px 6px',
      boxShadow: `inset 0 1px 6px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)`,
      position: 'relative',
    }}>
      {/* 5 mini stacks of 20 chips */}
      <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        {Array.from({ length: cols }, (_, ci) => (
          <div key={ci} style={{
            width: chipW,
            height: chipH * 5 + 4,
            borderRadius: 4,
            background: `linear-gradient(180deg, ${chip.rim}cc 0%, ${chip.color} 100%)`,
            border: `1px solid ${chip.rim}66`,
            boxShadow: `inset 0 1px 3px rgba(255,255,255,0.15)`,
          }} />
        ))}
      </div>
      {/* Rack label */}
      <div style={{
        marginTop: 4, textAlign: 'center',
        color: chip.rim, fontSize: 8, fontWeight: 900, letterSpacing: '0.08em',
      }}>
        RACK · {chip.label}
      </div>
    </div>
  );
}

// A stack = column of 20 chips
function StackIcon({ chip, size = 40 }: { chip: Chip; size?: number }) {
  const chipCount = 6; // visual slices to show depth
  const sliceH = Math.round(size * 0.18);
  const totalH = size + (chipCount - 1) * sliceH;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ position: 'relative', width: size, height: totalH }}>
        {Array.from({ length: chipCount }, (_, i) => {
          const isTop = i === chipCount - 1;
          return (
            <div key={i} style={{
              position: 'absolute', bottom: i * sliceH, left: 0,
              width: size, height: size,
              borderRadius: '50%',
              background: isTop
                ? `radial-gradient(circle at 33% 30%, ${chip.rim}cc, ${chip.color})`
                : `radial-gradient(circle at 33% 30%, ${chip.rim}55, ${chip.color}cc)`,
              border: `2px solid ${isTop ? chip.rim : chip.rim + '66'}`,
              zIndex: i,
            }}>
              {isTop && (
                <div style={{ position: 'absolute', inset: 5, borderRadius: '50%', border: `1.5px dashed ${chip.rim}88` }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ color: chip.rim, fontSize: 8, fontWeight: 900, letterSpacing: '0.06em' }}>
        STACK
      </div>
    </div>
  );
}

// Full bank display — one row per denomination
function BankView({ groups }: { groups: RackGroup[] }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg,#12100a,#0a0805)',
      border: '2px solid #7a5c14',
      borderRadius: 14,
      padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: 'inset 0 2px 14px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.6)',
      position: 'relative',
    }}>
      {/* Bank label */}
      <div style={{
        position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
        background: '#7a5c14', color: '#fef3c7', fontSize: 8, fontWeight: 900,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        padding: '2px 12px', borderRadius: 4,
      }}>Bank</div>

      {groups.map(g => (
        <div key={g.chip.value} style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          {/* Denomination label */}
          <div style={{ width: 52, flexShrink: 0 }}>
            <div style={{
              background: `radial-gradient(circle at 33% 35%, ${g.chip.rim}88, ${g.chip.color})`,
              border: `2px solid ${g.chip.rim}77`,
              borderRadius: '50%', width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 9, fontWeight: 900 }}>{g.chip.label}</span>
            </div>
          </div>

          {/* Racks */}
          {g.racks > 0 && (
            <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              {Array.from({ length: g.racks }, (_, i) => (
                <RackIcon key={i} chip={g.chip} width={72} />
              ))}
            </div>
          )}

          {/* Stacks */}
          {g.stacks > 0 && (
            <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
              {Array.from({ length: g.stacks }, (_, i) => (
                <StackIcon key={i} chip={g.chip} size={36} />
              ))}
            </div>
          )}

          {/* Separator if both */}
          {g.racks > 0 && g.stacks > 0 && <div style={{ display: 'none' }} />}
        </div>
      ))}
    </div>
  );
}

// ─── Difficulty ───────────────────────────────────────────────────────────────

function getLevel(streak: number): { label: string; color: string } {
  if (streak >= 10) return { label: 'Expert', color: '#c084fc' };
  if (streak >= 4)  return { label: 'Hard',   color: '#f87171' };
  return                   { label: 'Easy',   color: '#4ade80' };
}

// ─── Stats pill ───────────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <span style={{ color: color ?? '#fff', fontSize: 14, fontWeight: 900 }}>{value}</span>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });

function freshRound(streak: number) {
  const s = generateScenario(streak);
  return { scenario: s, options: makeOptions(s.total, s.groups) };
}

export default function ChipsDrill() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [{ scenario, options }, setRound] = useState(() => freshRound(0));
  const [answer, setAnswer] = useState<{ selected: number; correct: boolean } | null>(null);

  const { groups, total } = scenario;
  const lvl = getLevel(stats.streak);

  function nextScenario(newStreak: number) {
    setRound(freshRound(newStreak));
    setAnswer(null);
  }

  function handleAnswer(val: number) {
    if (answer) return;
    const correct = val === total;
    setAnswer({ selected: val, correct });
    let newStreak = 0;
    setStats(s => {
      newStreak = correct ? s.streak + 1 : 0;
      return { correct: s.correct + (correct ? 1 : 0), total: s.total + 1, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak) };
    });
    if (correct) setTimeout(() => nextScenario(newStreak), 450);
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #7a1826' }}>
        <Link href="/practice" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Drills</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>🪙 Chip Count</div>
        <button onClick={() => { setStats(emptyStats()); nextScenario(0); }} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', touchAction: 'manipulation' }}>Reset</button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '5px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Counted" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <span style={{ color: lvl.color, fontSize: 11, fontWeight: 900, border: `1px solid ${lvl.color}66`, borderRadius: 5, padding: '1px 7px' }}>{lvl.label}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Level</span>
        </div>
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>

      {/* Felt */}
      <div className="flex-1 felt flex flex-col items-center justify-center gap-5 px-4 overflow-y-auto">

        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          What is the total bank value?
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em' }}>
            RACK = 100 chips &nbsp;·&nbsp; STACK = 20 chips
          </div>
        </div>

        {/* Bank visual */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
          <BankView groups={groups} />

          {/* Answer feedback overlay */}
          {answer && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 14,
              background: answer.correct ? 'rgba(22,163,74,0.22)' : 'rgba(220,38,38,0.22)',
              border: `2px solid ${answer.correct ? '#4ade80' : '#f87171'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 900,
              color: answer.correct ? '#4ade80' : '#f87171',
            }}>
              {answer.correct ? '✓' : `$${total.toLocaleString()}`}
            </div>
          )}
        </div>

        {/* Breakdown (shown after answering) */}
        {answer && (
          <div style={{
            width: '100%', maxWidth: 420,
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '8px 12px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {groups.map(g => {
              const rackVal  = g.racks  * RACK_SIZE  * g.chip.value;
              const stackVal = g.stacks * STACK_SIZE * g.chip.value;
              return (
                <div key={g.chip.value} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: g.chip.rim }}>
                    {g.chip.label} · {g.racks > 0 ? `${g.racks} rack${g.racks > 1 ? 's' : ''}` : ''}{g.racks > 0 && g.stacks > 0 ? ' + ' : ''}{g.stacks > 0 ? `${g.stacks} stack${g.stacks > 1 ? 's' : ''}` : ''}
                  </span>
                  <span style={{ color: '#e8c86a', fontWeight: 900 }}>
                    ${(rackVal + stackVal).toLocaleString()}
                  </span>
                </div>
              );
            })}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '3px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 900 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Total</span>
              <span style={{ color: '#4ade80' }}>${total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Answer buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 420 }}>
          {options.map(opt => {
            const isSelected    = answer?.selected === opt;
            const isCorrectOpt  = opt === total;
            let bg = 'rgba(255,255,255,0.06)', border = 'rgba(255,255,255,0.15)', color = '#f5f0e8';
            if (answer) {
              if (isCorrectOpt)  { bg = 'rgba(22,163,74,0.3)';  border = '#4ade80'; color = '#4ade80'; }
              else if (isSelected) { bg = 'rgba(220,38,38,0.3)'; border = '#f87171'; color = '#f87171'; }
              else                 { bg = 'rgba(255,255,255,0.02)'; border = 'rgba(255,255,255,0.05)'; color = 'rgba(255,255,255,0.2)'; }
            }
            return (
              <button key={opt} onClick={() => handleAnswer(opt)} style={{
                height: 56, fontSize: 18, fontWeight: 900,
                borderRadius: 12, cursor: answer ? 'default' : 'pointer', touchAction: 'manipulation',
                background: bg, border: `2px solid ${border}`, color,
                transition: 'all 0.15s',
                boxShadow: isCorrectOpt && answer ? '0 0 14px rgba(74,222,128,0.4)' : 'none',
              }}>
                ${opt.toLocaleString()}
              </button>
            );
          })}
        </div>

        {answer && !answer.correct && (
          <button onClick={() => nextScenario(0)} style={{
            padding: '10px 32px', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            borderRadius: 12, background: '#7a1826', color: '#fff', border: '1px solid rgba(200,80,100,0.5)',
            cursor: 'pointer', touchAction: 'manipulation',
          }}>
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
