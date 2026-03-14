# Blackjack Drills Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add a blackjack dealer practice section with 8 drills under `/practice/blackjack`, linked from the main practice hub.

**Architecture:** Separate hub at `app/practice/blackjack/page.tsx`, each drill at `app/practice/blackjack/[drill]/page.tsx`. All drills are self-contained `'use client'` pages following the established baccarat drill pattern (stats bar, felt background, CardView, 4-button or 2-button answer grid, auto-advance). Shared BJ math lives in `lib/bj.ts`.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, existing `Card`/`Suit`/`Rank` types from `lib/types.ts`, `CardView` from `components/Card.tsx`.

---

## Established Patterns (read these files before starting)

- `app/practice/anchor-totals/page.tsx` — full drill template with pickers, stats, felt, answer grid
- `app/practice/page.tsx` — hub page with `DRILLS` array
- `components/Card.tsx` — `<CardView card={card} delay={n} />` props: `card`, `delay?`, `faceDown?`, `small?`
- `lib/types.ts` — `Card`, `Suit`, `Rank` types; `Card.value` is set at creation time

## Shared constants (copy into each drill file as needed)

```ts
const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
type AnswerState = { selected: number | string; correct: boolean } | null;
```

## Shared UI snippets

**Header:**
```tsx
<div className="flex items-center justify-between px-3 py-1.5"
  style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #1d4ed8' }}>
  <Link href="/practice/blackjack" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Blackjack</Link>
  <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>DRILL TITLE</div>
  <button onClick={() => setStats(emptyStats())} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
</div>
```

**Stats bar:**
```tsx
<div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
  <StatPill label="Answered" value={String(stats.total)} />
  <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
  <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
  <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
</div>
```

**StatPill component (add to bottom of every drill file):**
```tsx
function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <span style={{ color: color ?? '#fff', fontSize: 14, fontWeight: 900 }}>{value}</span>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    </div>
  );
}
```

**Outer wrapper:**
```tsx
<div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>
```

**Felt area:**
```tsx
<div className="flex-1 felt flex flex-col items-center justify-center gap-8 px-6">
```

**4-button answer grid:**
```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 300 }}>
  {options.map(opt => {
    const isSelected = answer?.selected === opt;
    const isCorrectOpt = opt === correctAnswer;
    let bg = 'rgba(255,255,255,0.06)', border = 'rgba(255,255,255,0.15)', color = '#f5f0e8';
    if (answer) {
      if (isCorrectOpt) { bg = 'rgba(22,163,74,0.3)'; border = '#4ade80'; color = '#4ade80'; }
      else if (isSelected) { bg = 'rgba(220,38,38,0.3)'; border = '#f87171'; color = '#f87171'; }
      else { bg = 'rgba(255,255,255,0.03)'; border = 'rgba(255,255,255,0.06)'; color = 'rgba(255,255,255,0.25)'; }
    }
    return (
      <button key={String(opt)} onClick={() => handleAnswer(opt)} style={{
        height: 64, fontSize: 28, fontWeight: 900, borderRadius: 12,
        cursor: answer ? 'default' : 'pointer', touchAction: 'manipulation',
        background: bg, border: `2px solid ${border}`, color,
        transition: 'all 0.15s', boxShadow: isCorrectOpt && answer ? '0 0 16px rgba(74,222,128,0.4)' : 'none',
      }}>{opt}</button>
    );
  })}
</div>
```

**2-button binary grid (for Bust Check, Soft/Hard, Dealer Action):**
```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 300 }}>
  {(['Yes','No'] as const).map(opt => { /* same coloring logic */ })}
</div>
```

**Next button (wrong answer):**
```tsx
{answer && !answer.correct && (
  <button onClick={() => nextHand()} style={{
    padding: '10px 32px', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
    borderRadius: 12, background: '#1d4ed8', color: '#fff', border: '1px solid rgba(99,102,241,0.5)',
    cursor: 'pointer', touchAction: 'manipulation',
  }}>Next →</button>
)}
```

**Auto-advance on correct:**
```ts
if (correct) setTimeout(() => nextHand(), 380);
```

---

## Task 1: Shared BJ utility library

**Files:**
- Create: `lib/bj.ts`

**Step 1: Create the file**

```ts
import { Card, Suit, Rank } from './types';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export const RANKS_NO_FACE: Rank[] = ['A','2','3','4','5','6','7','8','9'];

export function randomSuit(): Suit {
  return SUITS[Math.floor(Math.random() * SUITS.length)];
}

export function randomRank(noFace = false): Rank {
  const pool = noFace ? RANKS_NO_FACE : RANKS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Raw rank value for BJ: A=11, 2-9=pip, 10/J/Q/K=10 */
export function bjRankValue(rank: Rank): number {
  if (rank === 'A') return 11;
  const n = parseInt(rank);
  if (!isNaN(n)) return Math.min(n, 10);
  return 10; // J, Q, K
}

export function makeCard(rank: Rank, suit?: Suit): Card {
  return { rank, suit: suit ?? randomSuit(), value: bjRankValue(rank) };
}

export function randomCard(noFace = false): Card {
  return makeCard(randomRank(noFace));
}

/** BJ total: aces start as 11, reduce by 10 each time hand busts */
export function bjTotal(hand: Card[]): number {
  let total = hand.reduce((s, c) => s + c.value, 0);
  let aces = hand.filter(c => c.rank === 'A').length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

export function isBust(hand: Card[]): boolean {
  return bjTotal(hand) > 21;
}

/** True if the hand has an ace counting as 11 */
export function isSoft(hand: Card[]): boolean {
  const hasAce = hand.some(c => c.rank === 'A');
  if (!hasAce) return false;
  const hardTotal = hand.reduce((s, c) => s + (c.rank === 'A' ? 1 : c.value), 0);
  return hardTotal + 10 <= 21;
}

/** Generate 4 nearby answer options including the correct one */
export function makeOptions(correct: number, min = 2, max = 31): number[] {
  const pool = new Set([correct]);
  const candidates: number[] = [];
  for (let d = 1; d <= 20; d++) {
    if (correct - d >= min) candidates.push(correct - d);
    if (correct + d <= max) candidates.push(correct + d);
  }
  candidates.sort(() => Math.random() - 0.5);
  for (const n of candidates) { if (pool.size >= 4) break; pool.add(n); }
  return [...pool].sort(() => Math.random() - 0.5);
}

/** Random hand of n cards */
export function randomHand(n: number, noFace = false): Card[] {
  return Array.from({ length: n }, () => randomCard(noFace));
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd /Users/nelson/projects/baccarat-practice && npx tsc --noEmit
```
Expected: no errors.

**Step 3: Commit**

```bash
git add lib/bj.ts && git commit -m "feat: add shared blackjack utility library"
```

---

## Task 2: Add Blackjack entry to main practice hub

**Files:**
- Modify: `app/practice/page.tsx`

**Step 1: Add entry to `DRILLS` array**

Add this object to the end of the `DRILLS` array in `app/practice/page.tsx`:

```ts
{
  href: '/practice/blackjack',
  title: 'Blackjack Drills',
  subtitle: 'Dealer practice',
  description: 'Eight drills for blackjack dealers: hand totals, bust detection, dealer actions, basic strategy, payouts, and side bets.',
  color: '#1d4ed8',
  glow: 'rgba(59,130,246,0.5)',
  border: 'rgba(147,197,253,0.4)',
  icon: '🃏',
  tags: ['Blackjack', 'Dealer', 'Strategy', 'Math'],
},
```

**Step 2: Verify in browser** — main `/practice` page should show the new card at the bottom.

**Step 3: Commit**

```bash
git add app/practice/page.tsx && git commit -m "feat: add blackjack drills entry to practice hub"
```

---

## Task 3: Blackjack hub page

**Files:**
- Create: `app/practice/blackjack/page.tsx`

**Step 1: Create the file**

```tsx
'use client';
import Link from 'next/link';

const DRILLS = [
  {
    href: '/practice/blackjack/hand-totals',
    title: 'Hand Totals',
    subtitle: 'What is the total?',
    description: 'Flash 2–5 cards and tap the correct blackjack total. Aces auto-select best value. Busted hands shown in red.',
    color: '#7c3aed',
    glow: 'rgba(139,92,246,0.5)',
    border: 'rgba(196,181,253,0.4)',
    icon: '🔢',
    tags: ['Arithmetic', 'Speed'],
  },
  {
    href: '/practice/blackjack/anchor-totals',
    title: 'Anchor Totals',
    subtitle: 'Count with a fixed card',
    description: 'Pick an anchor card (1–9), then count it with random extras. Great for drilling specific card values.',
    color: '#0f766e',
    glow: 'rgba(20,184,166,0.5)',
    border: 'rgba(94,234,212,0.4)',
    icon: '🎯',
    tags: ['Arithmetic', 'Focused'],
  },
  {
    href: '/practice/blackjack/bust-check',
    title: 'Bust or No Bust',
    subtitle: 'Is the hand over 21?',
    description: 'Flash a hand — instantly decide if it busts. Fast binary drill for warm-up.',
    color: '#b91c1c',
    glow: 'rgba(220,38,38,0.5)',
    border: 'rgba(248,113,113,0.4)',
    icon: '💥',
    tags: ['Speed', 'Warm-up'],
  },
  {
    href: '/practice/blackjack/soft-hard',
    title: 'Soft vs Hard',
    subtitle: 'Soft or Hard?',
    description: 'Identify soft and hard hands instantly. Essential for applying dealer rules correctly.',
    color: '#0369a1',
    glow: 'rgba(14,165,233,0.5)',
    border: 'rgba(125,211,252,0.4)',
    icon: '🂠',
    tags: ['Recognition', 'Rules'],
  },
  {
    href: '/practice/blackjack/dealer-action',
    title: 'Dealer Action',
    subtitle: 'Hit or Stand?',
    description: 'Given a dealer hand and house rule (H17/S17), decide the correct dealer action.',
    color: '#15803d',
    glow: 'rgba(34,197,94,0.5)',
    border: 'rgba(74,222,128,0.4)',
    icon: '🎴',
    tags: ['Rules', 'H17', 'S17'],
  },
  {
    href: '/practice/blackjack/basic-strategy',
    title: 'Basic Strategy',
    subtitle: 'Hit / Stand / Double / Split?',
    description: 'Player hand vs dealer upcard — tap the correct basic strategy play. Multi-deck Vegas chart.',
    color: '#7a1826',
    glow: 'rgba(220,38,38,0.5)',
    border: 'rgba(248,113,113,0.4)',
    icon: '📊',
    tags: ['Strategy', 'Core'],
  },
  {
    href: '/practice/blackjack/payouts',
    title: 'Payout Drill',
    subtitle: 'What is the payout?',
    description: 'Given a bet and result — Blackjack 3:2, even money, insurance 2:1, push — tap the correct net payout.',
    color: '#b45309',
    glow: 'rgba(245,158,11,0.5)',
    border: 'rgba(252,211,77,0.4)',
    icon: '💰',
    tags: ['Math', 'Money'],
  },
  {
    href: '/practice/blackjack/side-bets',
    title: 'Side Bet Payouts',
    subtitle: 'Upcard & Buster',
    description: 'Toggle between Upcard and Buster Blackjack side bets. Given the scenario, tap the correct payout multiplier.',
    color: '#6d28d9',
    glow: 'rgba(139,92,246,0.5)',
    border: 'rgba(196,181,253,0.4)',
    icon: '🎰',
    tags: ['Side Bets', 'Math'],
  },
];

export default function BlackjackHub() {
  return (
    <div className="flex flex-col" style={{ background: '#080c10', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #1d4ed8' }}>
        <Link href="/practice" className="text-xs font-bold tracking-widest uppercase"
          style={{ color: 'rgba(232,200,106,0.6)' }}>← Practice</Link>
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#e8c86a', letterSpacing: '0.2em' }}>
          ♠ Blackjack Drills ♠
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DRILLS.map(drill => (
          <Link key={drill.href} href={drill.href} style={{
            textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'flex-start',
            background: `linear-gradient(135deg, ${drill.color}22 0%, rgba(0,0,0,0) 60%)`,
            border: `1.5px solid ${drill.border}`, borderRadius: 14, padding: '14px 16px',
            cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
          }}>
            <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{drill.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ color: '#f5f0e8', fontSize: 16, fontWeight: 900 }}>{drill.title}</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{drill.subtitle}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: '4px 0 8px', lineHeight: 1.5 }}>
                {drill.description}
              </p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {drill.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
                    background: `${drill.color}33`, color: 'rgba(255,255,255,0.55)',
                    border: `1px solid ${drill.border}`, borderRadius: 4,
                    padding: '2px 6px', textTransform: 'uppercase',
                  }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20, flexShrink: 0, alignSelf: 'center' }}>›</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add app/practice/blackjack/page.tsx && git commit -m "feat: add blackjack drill hub page"
```

---

## Task 4: Hand Totals drill

**Files:**
- Create: `app/practice/blackjack/hand-totals/page.tsx`

**Step 1: Create the file**

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../lib/types';
import { bjTotal, isBust, makeOptions, randomCard } from '../../../../lib/bj';
import CardView from '../../../../components/Card';

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
type AnswerState = { selected: number; correct: boolean } | null;

function freshRound(cardCount: number) {
  const hand = Array.from({ length: cardCount }, () => randomCard());
  const total = bjTotal(hand);
  return { hand, options: makeOptions(total, 2, 31), total };
}

export default function BJHandTotalsDrill() {
  const [cardCount, setCardCount] = useState(2);
  const [{ hand, options, total }, setRound] = useState(() => freshRound(2));
  const [answer, setAnswer] = useState<AnswerState>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);

  function nextHand(count = cardCount) {
    setRound(freshRound(count));
    setAnswer(null);
  }

  function handleCardCountChange(n: number) {
    setCardCount(n);
    nextHand(n);
  }

  function handleAnswer(val: number) {
    if (answer) return;
    const correct = val === total;
    setAnswer({ selected: val, correct });
    setStats(s => {
      const newStreak = correct ? s.streak + 1 : 0;
      return { correct: s.correct + (correct ? 1 : 0), total: s.total + 1, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak) };
    });
    if (correct) setTimeout(() => nextHand(), 380);
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
  const bust = isBust(hand);

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #1d4ed8' }}>
        <Link href="/practice/blackjack" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Blackjack</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>🔢 Hand Totals</div>
        <button onClick={() => setStats(emptyStats())} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Answered" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>

      <div className="flex-1 felt flex flex-col items-center justify-center gap-8 px-6">
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          What is the total?
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cards</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[2,3,4,5].map(n => (
              <button key={n} onClick={() => handleCardCountChange(n)} style={{
                width: 36, height: 36, fontSize: 14, fontWeight: 900, borderRadius: 7,
                background: cardCount === n ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
                border: cardCount === n ? '2px solid #818cf8' : '1px solid rgba(255,255,255,0.12)',
                color: cardCount === n ? '#a5b4fc' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer', touchAction: 'manipulation',
              }}>{n}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center' }}>
            {hand.map((card, i) => <CardView key={i} card={card} delay={i * 100} />)}
          </div>
          {answer && (
            <div style={{ fontSize: 15, fontWeight: 900, color: answer.correct ? '#4ade80' : '#f87171' }}>
              {answer.correct
                ? `✓ Total is ${total}${bust ? ' — Bust!' : ''}`
                : `✗ Total is ${total}${bust ? ' — Bust!' : ''}`}
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
          <button onClick={() => nextHand()} style={{
            padding: '10px 32px', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            borderRadius: 12, background: '#1d4ed8', color: '#fff', border: '1px solid rgba(99,102,241,0.5)',
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
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add app/practice/blackjack/hand-totals/page.tsx && git commit -m "feat: add BJ hand totals drill"
```

---

## Task 5: Anchor Totals drill (BJ variant)

**Files:**
- Create: `app/practice/blackjack/anchor-totals/page.tsx`

Same as baccarat anchor totals but uses `bjTotal` (real count, not mod-10). Aces auto-select best value. "No 10s/Face" toggle applies to random cards only.

**Step 1: Create the file**

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card, Suit, Rank } from '../../../../lib/types';
import { bjTotal, makeOptions, randomCard, randomSuit, RANKS_NO_FACE, RANKS } from '../../../../lib/bj';
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
  // anchor value 1 = Ace, displayed as 'A', BJ value = 11
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
    if (correct) setTimeout(() => nextHand(), 380);
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #0f766e' }}>
        <Link href="/practice/blackjack" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Blackjack</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>🎯 Anchor Totals</div>
        <button onClick={() => setStats(emptyStats())} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
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
          <button onClick={() => { setNoFace(!noFace); nextHand(anchor, cardCount, !noFace); }} style={{
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
          <button onClick={() => nextHand()} style={{
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
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add app/practice/blackjack/anchor-totals/page.tsx && git commit -m "feat: add BJ anchor totals drill"
```

---

## Task 6: Bust or No Bust drill

**Files:**
- Create: `app/practice/blackjack/bust-check/page.tsx`

**Step 1: Create the file**

Generate a random 2–5 card hand. Show the cards. Two large buttons: **Bust** / **No Bust**. Correct = `bjTotal(hand) > 21`.

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../lib/types';
import { bjTotal, randomCard } from '../../../../lib/bj';
import CardView from '../../../../components/Card';

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
type AnswerState = { selected: boolean; correct: boolean } | null;

function freshRound() {
  // Bias toward variety: 40% bust, 60% not bust
  let hand: Card[];
  do {
    const n = 2 + Math.floor(Math.random() * 4); // 2-5 cards
    hand = Array.from({ length: n }, () => randomCard());
  } while (false); // just one attempt — natural distribution is fine
  return { hand, bust: bjTotal(hand) > 21 };
}

export default function BustCheckDrill() {
  const [{ hand, bust }, setRound] = useState(() => freshRound());
  const [answer, setAnswer] = useState<AnswerState>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);

  function nextHand() {
    setRound(freshRound());
    setAnswer(null);
  }

  function handleAnswer(val: boolean) {
    if (answer) return;
    const correct = val === bust;
    setAnswer({ selected: val, correct });
    setStats(s => {
      const newStreak = correct ? s.streak + 1 : 0;
      return { correct: s.correct + (correct ? 1 : 0), total: s.total + 1, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak) };
    });
    if (correct) setTimeout(nextHand, 380);
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;
  const total = bjTotal(hand);

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #b91c1c' }}>
        <Link href="/practice/blackjack" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Blackjack</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>💥 Bust Check</div>
        <button onClick={() => setStats(emptyStats())} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Answered" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>

      <div className="flex-1 felt flex flex-col items-center justify-center gap-8 px-6">
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Does this hand bust?
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center' }}>
          {hand.map((card, i) => <CardView key={i} card={card} delay={i * 100} />)}
        </div>

        {answer && (
          <div style={{ fontSize: 15, fontWeight: 900, color: answer.correct ? '#4ade80' : '#f87171', textAlign: 'center' }}>
            {answer.correct
              ? `✓ ${bust ? `Bust! (${total})` : `No bust (${total})`}`
              : `✗ ${bust ? `Bust! (${total})` : `No bust (${total})`}`}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 300 }}>
          {([true, false] as const).map(val => {
            const label = val ? 'Bust' : 'No Bust';
            const isSelected = answer?.selected === val;
            const isCorrect = answer && val === bust;
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
            borderRadius: 12, background: '#b91c1c', color: '#fff', border: '1px solid rgba(239,68,68,0.5)',
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
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add app/practice/blackjack/bust-check/page.tsx && git commit -m "feat: add BJ bust check drill"
```

---

## Task 7: Soft vs Hard drill

**Files:**
- Create: `app/practice/blackjack/soft-hard/page.tsx`

Flash a 2–3 card hand. Two buttons: **Soft** / **Hard**. Correct = `isSoft(hand)`. Show brief explanation on wrong answer (e.g. "Soft — ace counts as 11 without busting").

**Step 1: Create the file**

```tsx
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
  // Ensure some variety — roughly 50/50 soft/hard by biasing
  let hand: Card[];
  const wantSoft = Math.random() < 0.5;
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
        <button onClick={() => setStats(emptyStats())} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
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
            const isCorrect = answer && val === soft;
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
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add app/practice/blackjack/soft-hard/page.tsx && git commit -m "feat: add BJ soft vs hard drill"
```

---

## Task 8: Dealer Action drill

**Files:**
- Create: `app/practice/blackjack/dealer-action/page.tsx`

Show dealer's face-up hand. Toggle between H17 and S17. Tap **Hit** or **Stand**.

**Rules:**
- Hard 16 or below: always Hit
- Hard 17 or above: always Stand
- Soft 17: Hit if H17, Stand if S17
- Soft 18+: always Stand

```tsx
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
  // Generate a dealer hand that's in a decision range (12-17 interesting, sometimes 18+)
  let hand: Card[];
  do {
    const n = 2 + Math.floor(Math.random() * 3); // 2-4 cards
    hand = Array.from({ length: n }, () => randomCard());
  } while (bjTotal(hand) > 21); // re-roll busted hands — dealer wouldn't reach that point
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
    if (correct) setTimeout(() => nextHand(), 380);
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
        <button onClick={() => setStats(emptyStats())} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
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
            const isCorrect = answer && val === action;
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
          <button onClick={() => nextHand()} style={{
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
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add app/practice/blackjack/dealer-action/page.tsx && git commit -m "feat: add BJ dealer action drill"
```

---

## Task 9: Basic Strategy drill

**Files:**
- Create: `app/practice/blackjack/basic-strategy/page.tsx`

Show player hand (2 cards) + dealer upcard (1 card face up). Four buttons: **Hit** / **Stand** / **Double** / **Split**.

Uses standard multi-deck Vegas basic strategy. Encode as a lookup function.

**The strategy lookup (implement in the file):**

```ts
type Play = 'Hit' | 'Stand' | 'Double' | 'Split';

// upcard: numeric value 2-11 (A=11)
function basicStrategy(hand: Card[], upcardValue: number): Play {
  const total = bjTotal(hand);
  const soft = isSoft(hand);
  const isPair = hand.length === 2 && hand[0].value === hand[1].value;

  // Pairs (only for 2-card hands with equal value)
  if (isPair) {
    const pairVal = hand[0].value; // 11=A, 10=10/J/Q/K, etc.
    if (pairVal === 11) return 'Split'; // A,A
    if (pairVal === 10) return 'Stand'; // 10,10
    if (pairVal === 9) return upcardValue === 7 || upcardValue >= 10 ? 'Stand' : 'Split';
    if (pairVal === 8) return 'Split'; // 8,8
    if (pairVal === 7) return upcardValue <= 7 ? 'Split' : 'Hit';
    if (pairVal === 6) return upcardValue <= 6 ? 'Split' : 'Hit';
    if (pairVal === 5) return upcardValue <= 9 ? 'Double' : 'Hit'; // never split 5s
    if (pairVal === 4) return (upcardValue === 5 || upcardValue === 6) ? 'Split' : 'Hit';
    if (pairVal === 3 || pairVal === 2) return upcardValue <= 7 ? 'Split' : 'Hit';
  }

  // Soft hands
  if (soft) {
    if (total >= 19) return 'Stand';
    if (total === 18) {
      if (upcardValue <= 6) return 'Double';
      if (upcardValue <= 8) return 'Stand';
      return 'Hit';
    }
    if (total === 17) return upcardValue >= 3 && upcardValue <= 6 ? 'Double' : 'Hit';
    if (total === 16 || total === 15) return upcardValue >= 4 && upcardValue <= 6 ? 'Double' : 'Hit';
    if (total === 14 || total === 13) return upcardValue >= 5 && upcardValue <= 6 ? 'Double' : 'Hit';
    return 'Hit';
  }

  // Hard hands
  if (total >= 17) return 'Stand';
  if (total >= 13) return upcardValue <= 6 ? 'Stand' : 'Hit';
  if (total === 12) return upcardValue >= 4 && upcardValue <= 6 ? 'Stand' : 'Hit';
  if (total === 11) return upcardValue <= 10 ? 'Double' : 'Hit';
  if (total === 10) return upcardValue <= 9 ? 'Double' : 'Hit';
  if (total === 9) return upcardValue >= 3 && upcardValue <= 6 ? 'Double' : 'Hit';
  return 'Hit'; // 8 or below
}
```

**Full file:**

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../lib/types';
import { bjTotal, isSoft, randomCard, makeCard, randomSuit, RANKS } from '../../../../lib/bj';
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
        <button onClick={() => setStats(emptyStats())} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
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

        {/* Layout: player hand vs dealer upcard */}
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
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add app/practice/blackjack/basic-strategy/page.tsx && git commit -m "feat: add BJ basic strategy drill"
```

---

## Task 10: Payout Drill

**Files:**
- Create: `app/practice/blackjack/payouts/page.tsx`

Given a bet and result type, tap the correct net payout.

**Payout rules:**
- Blackjack 3:2 → payout = bet × 1.5 (rounded to nearest dollar if needed)
- Even Money → payout = bet × 1 (when player has BJ vs dealer ace, opts for even money)
- Insurance 2:1 → payout = (bet / 2) × 2 = bet (insurance bet is half the original; pays 2:1)
- Push → payout = 0

Bet amounts: $5, $10, $15, $20, $25, $50, $100 (always divisible to avoid fractional payouts on 3:2).
Use even multiples of $2 for 3:2: $10, $20, $50, $100, $200.

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
type AnswerState = { selected: number; correct: boolean } | null;

type ResultType = 'Blackjack (3:2)' | 'Even Money' | 'Insurance (2:1)' | 'Push';

const BJ_BETS = [10, 20, 50, 100, 200]; // divisible by 2 for clean 3:2
const OTHER_BETS = [5, 10, 15, 20, 25, 50, 100];

function calcPayout(bet: number, result: ResultType): number {
  if (result === 'Blackjack (3:2)') return bet * 1.5;
  if (result === 'Even Money') return bet;
  if (result === 'Insurance (2:1)') return bet; // insurance is half the bet paying 2:1
  return 0; // Push
}

function freshRound() {
  const results: ResultType[] = ['Blackjack (3:2)', 'Even Money', 'Insurance (2:1)', 'Push'];
  const result = results[Math.floor(Math.random() * results.length)];
  const betPool = result === 'Blackjack (3:2)' ? BJ_BETS : OTHER_BETS;
  const bet = betPool[Math.floor(Math.random() * betPool.length)];
  const correct = calcPayout(bet, result);
  // Generate 3 wrong answers
  const pool = new Set([correct]);
  const candidates = [-bet, bet * 0.5, bet * 1.5, bet * 2, bet * 3, bet - 5, bet + 5, bet * 2 - 5].filter(n => n >= 0 && n !== correct);
  candidates.sort(() => Math.random() - 0.5);
  for (const n of candidates) { if (pool.size >= 4) break; pool.add(n); }
  const options = [...pool].sort(() => Math.random() - 0.5);
  return { bet, result, correct, options };
}

export default function BJPayoutDrill() {
  const [{ bet, result, correct, options }, setRound] = useState(() => freshRound());
  const [answer, setAnswer] = useState<AnswerState>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);

  function nextHand() {
    setRound(freshRound());
    setAnswer(null);
  }

  function handleAnswer(val: number) {
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

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #b45309' }}>
        <Link href="/practice/blackjack" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Blackjack</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>💰 Payouts</div>
        <button onClick={() => setStats(emptyStats())} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Answered" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>

      <div className="flex-1 felt flex flex-col items-center justify-center gap-8 px-6">
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          What is the payout?
        </div>

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
              <button key={opt} onClick={() => handleAnswer(opt)} style={{
                height: 64, fontSize: 22, fontWeight: 900, borderRadius: 12,
                cursor: answer ? 'default' : 'pointer', touchAction: 'manipulation',
                background: bg, border: `2px solid ${border}`, color,
                transition: 'all 0.15s', boxShadow: isCorrectOpt && answer ? '0 0 16px rgba(74,222,128,0.4)' : 'none',
              }}>${opt}</button>
            );
          })}
        </div>

        {answer && !answer.correct && (
          <button onClick={nextHand} style={{
            padding: '10px 32px', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            borderRadius: 12, background: '#b45309', color: '#fff', border: '1px solid rgba(245,158,11,0.5)',
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
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add app/practice/blackjack/payouts/page.tsx && git commit -m "feat: add BJ payout drill"
```

---

## Task 11: Side Bet Payouts drill

**Files:**
- Create: `app/practice/blackjack/side-bets/page.tsx`

Toggle between **Upcard** and **Buster Blackjack** side bets. Given a scenario, tap the correct payout multiplier.

**Upcard side bet paytable** (dealer's face-up card):
- Ace: 11:1
- King, Queen, Jack, 10: 3:1
- 9: 7:1
- 8: 5:1
- 7: 4:1
- 2–6: 2:1

**Buster Blackjack paytable** (dealer busts; pays based on number of dealer bust cards):
- 3-card bust: 2:1
- 4-card bust: 2:1
- 5-card bust: 3:1
- 6-card bust: 4:1
- 7-card bust: 7:1
- 8+ card bust: 7:1

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../lib/types';
import { randomCard, bjTotal } from '../../../../lib/bj';
import CardView from '../../../../components/Card';

interface Stats { correct: number; total: number; streak: number; bestStreak: number; }
const emptyStats = (): Stats => ({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
type AnswerState = { selected: number; correct: boolean } | null;
type BetType = 'upcard' | 'buster';

// Upcard: multiplier based on dealer upcard rank
function upcardMultiplier(card: Card): number {
  if (card.rank === 'A') return 11;
  if (['10','J','Q','K'].includes(card.rank)) return 3;
  if (card.rank === '9') return 7;
  if (card.rank === '8') return 5;
  if (card.rank === '7') return 4;
  return 2; // 2-6
}

// Buster: multiplier based on number of dealer cards when busting
function busterMultiplier(cardCount: number): number {
  if (cardCount <= 4) return 2;
  if (cardCount === 5) return 3;
  if (cardCount === 6) return 4;
  return 7; // 7+
}

function freshUpcardRound() {
  const card = randomCard();
  const multiplier = upcardMultiplier(card);
  const bets = [5, 10, 25, 50, 100];
  const bet = bets[Math.floor(Math.random() * bets.length)];
  const correct = bet * multiplier;
  const opts = new Set([correct]);
  const candidates = [bet * 2, bet * 3, bet * 4, bet * 5, bet * 7, bet * 11, correct + bet, correct - bet].filter(n => n > 0 && n !== correct);
  candidates.sort(() => Math.random() - 0.5);
  for (const n of candidates) { if (opts.size >= 4) break; opts.add(n); }
  return { card: card as Card | null, bustCards: 0, bet, multiplier, correct, options: [...opts].sort(() => Math.random() - 0.5) };
}

function freshBusterRound() {
  // Generate a dealer bust hand
  let hand: Card[] = [];
  do {
    hand = [];
    // Start with 2 cards, keep adding until bust
    for (let i = 0; i < 2; i++) hand.push(randomCard());
    while (bjTotal(hand) <= 21 && hand.length < 9) hand.push(randomCard());
  } while (bjTotal(hand) <= 21);
  const cardCount = hand.length;
  const multiplier = busterMultiplier(cardCount);
  const bets = [5, 10, 25, 50, 100];
  const bet = bets[Math.floor(Math.random() * bets.length)];
  const correct = bet * multiplier;
  const opts = new Set([correct]);
  const candidates = [bet * 2, bet * 3, bet * 4, bet * 7, correct + bet, correct - bet, bet * 5].filter(n => n > 0 && n !== correct);
  candidates.sort(() => Math.random() - 0.5);
  for (const n of candidates) { if (opts.size >= 4) break; opts.add(n); }
  return { hand, card: null as Card | null, bustCards: cardCount, bet, multiplier, correct, options: [...opts].sort(() => Math.random() - 0.5) };
}

export default function SideBetsDrill() {
  const [betType, setBetType] = useState<BetType>('upcard');
  const [round, setRound] = useState(() => freshUpcardRound());
  const [answer, setAnswer] = useState<AnswerState>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);

  function nextHand(type = betType) {
    setRound(type === 'upcard' ? freshUpcardRound() : freshBusterRound());
    setAnswer(null);
  }

  function handleTypeToggle(type: BetType) {
    setBetType(type);
    nextHand(type);
  }

  function handleAnswer(val: number) {
    if (answer) return;
    const isCorrect = val === round.correct;
    setAnswer({ selected: val, correct: isCorrect });
    setStats(s => {
      const newStreak = isCorrect ? s.streak + 1 : 0;
      return { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak) };
    });
    if (isCorrect) setTimeout(() => nextHand(), 380);
  }

  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #6d28d9' }}>
        <Link href="/practice/blackjack" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Blackjack</Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>🎰 Side Bets</div>
        <button onClick={() => setStats(emptyStats())} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Reset</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 16px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StatPill label="Answered" value={String(stats.total)} />
        <StatPill label="Accuracy" value={pct !== null ? `${pct}%` : '—'} color={pct === null ? undefined : pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171'} />
        <StatPill label="Streak" value={String(stats.streak)} color="#fbbf24" />
        <StatPill label="Best" value={String(stats.bestStreak)} color="#f59e0b" />
      </div>

      <div className="flex-1 felt flex flex-col items-center justify-center gap-6 px-6">
        {/* Toggle */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['upcard', 'buster'] as BetType[]).map(type => (
            <button key={type} onClick={() => handleTypeToggle(type)} style={{
              fontSize: 11, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '6px 16px', borderRadius: 8, cursor: 'pointer', touchAction: 'manipulation',
              background: betType === type ? 'rgba(109,40,217,0.3)' : 'rgba(255,255,255,0.06)',
              border: betType === type ? '2px solid #a78bfa' : '1px solid rgba(255,255,255,0.12)',
              color: betType === type ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
            }}>{type === 'upcard' ? 'Upcard' : 'Buster'}</button>
          ))}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          What does the side bet pay?
        </div>

        {/* Scenario */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {betType === 'upcard' && round.card && (
            <>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Dealer upcard</div>
              <CardView card={round.card} delay={0} />
            </>
          )}
          {betType === 'buster' && (round as any).hand && (
            <>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Dealer busts with {round.bustCards} cards</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                {((round as any).hand as Card[]).map((card: Card, i: number) => (
                  <CardView key={i} card={card} delay={i * 80} small />
                ))}
              </div>
            </>
          )}
          <div style={{ color: '#fbbf24', fontSize: 22, fontWeight: 900 }}>Bet: ${round.bet}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Pays {round.multiplier}:1</div>
        </div>

        {answer && (
          <div style={{ fontSize: 15, fontWeight: 900, color: answer.correct ? '#4ade80' : '#f87171', textAlign: 'center' }}>
            {answer.correct ? `✓ Pays $${round.correct}` : `✗ Pays $${round.correct}`}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 300 }}>
          {round.options.map(opt => {
            const isSelected = answer?.selected === opt;
            const isCorrectOpt = opt === round.correct;
            let bg = 'rgba(255,255,255,0.06)', border = 'rgba(255,255,255,0.15)', color = '#f5f0e8';
            if (answer) {
              if (isCorrectOpt) { bg = 'rgba(22,163,74,0.3)'; border = '#4ade80'; color = '#4ade80'; }
              else if (isSelected) { bg = 'rgba(220,38,38,0.3)'; border = '#f87171'; color = '#f87171'; }
              else { bg = 'rgba(255,255,255,0.03)'; border = 'rgba(255,255,255,0.06)'; color = 'rgba(255,255,255,0.25)'; }
            }
            return (
              <button key={opt} onClick={() => handleAnswer(opt)} style={{
                height: 64, fontSize: 22, fontWeight: 900, borderRadius: 12,
                cursor: answer ? 'default' : 'pointer', touchAction: 'manipulation',
                background: bg, border: `2px solid ${border}`, color,
                transition: 'all 0.15s', boxShadow: isCorrectOpt && answer ? '0 0 16px rgba(74,222,128,0.4)' : 'none',
              }}>${opt}</button>
            );
          })}
        </div>

        {answer && !answer.correct && (
          <button onClick={() => nextHand()} style={{
            padding: '10px 32px', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            borderRadius: 12, background: '#6d28d9', color: '#fff', border: '1px solid rgba(139,92,246,0.5)',
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
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add app/practice/blackjack/side-bets/page.tsx && git commit -m "feat: add BJ side bets drill (upcard + buster)"
```

---

## Final verification

After all tasks:

```bash
cd /Users/nelson/projects/baccarat-practice
npx tsc --noEmit
```

Then manually verify in browser:
- `/practice` → new Blackjack Drills card visible
- `/practice/blackjack` → hub with 8 drills
- Each drill page loads, shows cards, tracks stats, auto-advances on correct answer
- BJ anchor totals: anchor picker, extra cards picker, no face toggle all work
- Dealer action: H17/S17 toggle changes correct answer for soft 17 hands
- Side bets: Upcard tab shows one card; Buster tab shows full dealer bust hand with small cards
