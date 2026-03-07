'use client';
import { useState } from 'react';
import Link from 'next/link';

// ─── Chip definitions ─────────────────────────────────────────────────────────

interface ChipDef {
  value: number;
  color: string;
  rim: string;
  name: string;
}

const CHIPS: ChipDef[] = [
  { value: 1,   color: '#166534', rim: '#22c55e', name: 'Green'  },
  { value: 5,   color: '#991b1b', rim: '#ef4444', name: 'Red'    },
  { value: 20,  color: '#075985', rim: '#38bdf8', name: 'Blue'   },
  { value: 100, color: '#581c87', rim: '#a855f7', name: 'Purple' },
];

// ─── Difficulty ───────────────────────────────────────────────────────────────

interface Difficulty {
  label: string;
  color: string;
  maxTypes: number;  // how many chip types appear
  maxCount: number;  // max chips per type
  numOptions: number;
}

const LEVELS: Difficulty[] = [
  { label: 'Easy',   color: '#4ade80', maxTypes: 2, maxCount: 3, numOptions: 4 },
  { label: 'Medium', color: '#fbbf24', maxTypes: 3, maxCount: 4, numOptions: 6 },
  { label: 'Hard',   color: '#f87171', maxTypes: 4, maxCount: 6, numOptions: 6 },
  { label: 'Expert', color: '#c084fc', maxTypes: 4, maxCount: 9, numOptions: 8 },
];

function getLevel(streak: number): Difficulty {
  if (streak >= 15) return LEVELS[3];
  if (streak >= 8)  return LEVELS[2];
  if (streak >= 3)  return LEVELS[1];
  return LEVELS[0];
}

// ─── Generation ───────────────────────────────────────────────────────────────

interface ChipStack { chip: ChipDef; count: number; }

function generateScenario(streak: number): { stacks: ChipStack[]; total: number } {
  const lvl = getLevel(streak);
  const stacks: ChipStack[] = [];
  let total = 0;

  // Pick which chip types appear (random subset up to maxTypes)
  const shuffled = [...CHIPS].sort(() => Math.random() - 0.5).slice(0, lvl.maxTypes);
  // Must include at least 2 types
  const types = shuffled.length >= 2 ? shuffled : CHIPS.slice(0, 2);

  for (const chip of types) {
    // Higher difficulty → more chips per stack
    const count = 1 + Math.floor(Math.random() * lvl.maxCount);
    stacks.push({ chip, count });
    total += chip.value * count;
  }

  if (total === 0) return generateScenario(streak);

  // Sort stacks by value for consistent rack layout
  stacks.sort((a, b) => a.chip.value - b.chip.value);
  return { stacks, total };
}

function makeOptions(correct: number, stacks: ChipStack[], numOptions: number): number[] {
  const pool = new Set([correct]);

  // Off by 1 chip (over and under) for each denomination present
  for (const { chip } of stacks) {
    if (pool.size >= numOptions) break;
    pool.add(correct + chip.value);
    if (pool.size < numOptions && correct - chip.value > 0) pool.add(correct - chip.value);
  }

  // Off by 2 chips
  for (const { chip } of stacks) {
    if (pool.size >= numOptions) break;
    pool.add(correct + chip.value * 2);
    if (pool.size < numOptions && correct - chip.value * 2 > 0) pool.add(correct - chip.value * 2);
  }

  // Off by a different denomination (confusion between chip colors)
  for (const { chip } of stacks) {
    if (pool.size >= numOptions) break;
    // Swap with next denomination
    const next = CHIPS.find(c => c.value !== chip.value && !stacks.some(s => s.chip.value === c.value));
    if (next) {
      const v = correct - chip.value + next.value;
      if (v > 0) pool.add(v);
    }
  }

  // Fill remainder with nearby random values
  let attempts = 0;
  while (pool.size < numOptions && attempts < 100) {
    attempts++;
    const chip = stacks[Math.floor(Math.random() * stacks.length)].chip;
    const delta = (Math.random() > 0.5 ? 1 : -1) * chip.value * Math.ceil(Math.random() * 3);
    const v = correct + delta;
    if (v > 0) pool.add(v);
  }

  return [...pool].sort(() => Math.random() - 0.5);
}

// ─── Rack + Chip Stack Visual ────────────────────────────────────────────────

const CHIP_D   = 48;  // chip diameter
const CHIP_GAP = 4;   // gap between chips in a row
const ROW_H    = 20;  // vertical offset per chip in a stack (side view)

// Show chips in a rack: horizontal layout where each denomination
// is a column of chips shown in "side-view stack" style.
// Each chip is an oval slice (like looking at a chip stack from the side).

function RackView({ stacks }: { stacks: ChipStack[] }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #1a1008 0%, #0d0a04 100%)',
      border: '3px solid #8a6914',
      borderRadius: 12,
      padding: '14px 20px 10px',
      display: 'flex',
      gap: 18,
      alignItems: 'flex-end',
      justifyContent: 'center',
      boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6)',
      position: 'relative',
    }}>
      {/* Rack label */}
      <div style={{
        position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
        background: '#8a6914', color: '#fef3c7', fontSize: 8, fontWeight: 900,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        padding: '2px 10px', borderRadius: 4,
      }}>Chip Rack</div>

      {stacks.map(({ chip, count }) => (
        <StackColumn key={chip.value} chip={chip} count={count} />
      ))}
    </div>
  );
}

function StackColumn({ chip, count }: ChipStack) {
  // Show chips as top-view circles stacked vertically with slight offset
  const STEP = 14; // px between chips
  const stackH = CHIP_D + (count - 1) * STEP;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {/* Stack of circles */}
      <div style={{ position: 'relative', width: CHIP_D, height: stackH }}>
        {Array.from({ length: count }, (_, i) => {
          const isTop = i === count - 1;
          return (
            <div key={i} style={{
              position: 'absolute',
              bottom: i * STEP,
              left: 0,
              width: CHIP_D,
              height: CHIP_D,
              borderRadius: '50%',
              background: isTop
                ? `radial-gradient(circle at 33% 30%, ${chip.rim}99, ${chip.color})`
                : `radial-gradient(circle at 33% 30%, ${chip.rim}55, ${chip.color}cc)`,
              border: `2px solid ${isTop ? chip.rim : chip.rim + '88'}`,
              boxShadow: isTop
                ? `0 2px 8px rgba(0,0,0,0.7), 0 0 6px ${chip.rim}33`
                : `0 1px 3px rgba(0,0,0,0.5)`,
              zIndex: i,
              // Dashed ring on every visible chip
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isTop && (
                <div style={{
                  position: 'absolute', inset: 5, borderRadius: '50%',
                  border: `1.5px dashed ${chip.rim}88`,
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Color name below each stack */}
      <span style={{ color: chip.rim, fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {chip.name}
      </span>
    </div>
  );
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
type AnswerState = { selected: number; correct: boolean } | null;

function freshRound(streak: number) {
  const s = generateScenario(streak);
  const lvl = getLevel(streak);
  return { scenario: s, options: makeOptions(s.total, s.stacks, lvl.numOptions) };
}

export default function ChipsDrill() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [{ scenario, options }, setRound] = useState(() => freshRound(0));
  const [answer, setAnswer] = useState<AnswerState>(null);

  const { stacks, total } = scenario;
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

  // Layout: 2 or 4 columns depending on numOptions
  const cols = lvl.numOptions <= 4 ? 2 : lvl.numOptions === 6 ? 3 : 4;

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #7a1826' }}>
        <Link href="/practice" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Drills</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>🪙 Chip Count</div>
        <button onClick={() => { setStats(emptyStats()); nextScenario(0); }} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
      </div>

      {/* Stats + difficulty bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '5px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Counted" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        {/* Difficulty badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <span style={{ color: lvl.color, fontSize: 11, fontWeight: 900, border: `1px solid ${lvl.color}66`, borderRadius: 5, padding: '1px 7px' }}>{lvl.label}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Level</span>
        </div>
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>

      {/* Felt */}
      <div className="flex-1 felt flex flex-col items-center justify-center gap-6 px-4">

        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          What is the total value?
        </div>

        {/* Rack */}
        <div style={{ position: 'relative' }}>
          <RackView stacks={stacks} />

          {/* Answer feedback overlay */}
          {answer && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 12,
              background: answer.correct ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)',
              border: `2px solid ${answer.correct ? '#4ade80' : '#f87171'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 34, fontWeight: 900,
              color: answer.correct ? '#4ade80' : '#f87171',
            }}>
              {answer.correct ? '✓' : `$${total}`}
            </div>
          )}
        </div>

        {/* Chip legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {CHIPS.map(c => (
            <div key={c.value} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.color, border: `1.5px solid ${c.rim}`, flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{c.name} = ${c.value}</span>
            </div>
          ))}
        </div>

        {/* Answer buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 8,
          width: '100%',
          maxWidth: cols === 4 ? 380 : 320,
        }}>
          {options.map(opt => {
            const isSelected = answer?.selected === opt;
            const isCorrectOpt = opt === total;
            let bg = 'rgba(255,255,255,0.06)';
            let border = 'rgba(255,255,255,0.15)';
            let color = '#f5f0e8';
            if (answer) {
              if (isCorrectOpt) { bg = 'rgba(22,163,74,0.3)'; border = '#4ade80'; color = '#4ade80'; }
              else if (isSelected) { bg = 'rgba(220,38,38,0.3)'; border = '#f87171'; color = '#f87171'; }
              else { bg = 'rgba(255,255,255,0.03)'; border = 'rgba(255,255,255,0.06)'; color = 'rgba(255,255,255,0.25)'; }
            }
            return (
              <button key={opt} onClick={() => handleAnswer(opt)} style={{
                height: 52, fontSize: 18, fontWeight: 900,
                borderRadius: 10, cursor: answer ? 'default' : 'pointer', touchAction: 'manipulation',
                background: bg, border: `2px solid ${border}`, color,
                transition: 'all 0.15s',
                boxShadow: isCorrectOpt && answer ? '0 0 12px rgba(74,222,128,0.4)' : 'none',
              }}>
                ${opt}
              </button>
            );
          })}
        </div>

        {answer && !answer.correct && (
          <button onClick={() => nextScenario(0)} style={{
            padding: '9px 28px', fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            borderRadius: 10, background: '#7a1826', color: '#fff', border: '1px solid rgba(200,80,100,0.5)',
            cursor: 'pointer', touchAction: 'manipulation',
          }}>
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
