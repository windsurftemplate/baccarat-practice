'use client';
import { useReducer, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '../../../lib/types';
import { createShoe, drawCard, handTotal, playerShouldDraw, bankerShouldDraw, determineOutcome } from '../../../lib/baccarat';
import CardView from '../../../components/Card';

// ─── Types ────────────────────────────────────────────────────────────────────

type DrillMode = 'normal' | 'timed' | 'streak' | 'hard' | 'clock';
type DrillPhase = 'player-decision' | 'banker-decision' | 'result';

interface DecisionResult { correct: boolean; message: string; }

interface DrillStats {
  handsPlayed: number;
  handsCorrect: number;
  playerErrors: number;
  bankerErrors: number;
  streak: number;
  bestStreak: number;
  // heatmap: bankerTotal (0-7) × playerThirdValue (0-9) → { correct, total }
  heatmap: Record<string, { correct: number; total: number }>;
}

interface DrillState {
  shoe: Card[];
  playerHand: Card[];
  bankerHand: Card[];
  phase: DrillPhase;
  playerResult: DecisionResult | null;
  bankerResult: DecisionResult | null;
  stats: DrillStats;
}

type DrillAction =
  | { type: 'ANSWER'; hit: boolean }
  | { type: 'NEXT_HAND' }
  | { type: 'RESET_STATS' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isHardHand(playerHand: Card[], bankerHand: Card[]): boolean {
  const pTotal = handTotal(playerHand);
  const bTotal = handTotal(bankerHand);
  // "Hard" = banker has 3-6 AND player will draw (so player third card matters)
  return pTotal <= 5 && bTotal >= 3 && bTotal <= 6;
}

function dealFresh(shoe: Card[], hardOnly: boolean): { playerHand: Card[]; bankerHand: Card[]; shoe: Card[] } {
  // Advance through the shoe linearly so we see different cards on each attempt.
  // (The old code did `let s = [...base]` inside the loop, which always reset to
  // the same 4 cards — causing infinite recursion whenever those cards were a natural.)
  let s = shoe.length < 4 ? createShoe() : [...shoe];
  for (let attempts = 0; attempts < 500; attempts++) {
    if (s.length < 4) s = createShoe();
    const playerHand = [s[0], s[1]];
    const bankerHand = [s[2], s[3]];
    s = s.slice(4);
    const pT = handTotal(playerHand);
    const bT = handTotal(bankerHand);
    if (pT >= 8 || bT >= 8) continue; // skip naturals
    if (hardOnly && !isHardHand(playerHand, bankerHand)) continue;
    return { playerHand, bankerHand, shoe: s };
  }
  // hardOnly exhausted — retry without hard filter
  if (hardOnly) return dealFresh(s, false);
  // Statistically impossible to reach here; guarantee a result with a fresh shoe
  const fresh = createShoe();
  return { playerHand: [fresh[0], fresh[1]], bankerHand: [fresh[2], fresh[3]], shoe: fresh.slice(4) };
}

function playerExplanation(pTotal: number, shouldDraw: boolean): string {
  return shouldDraw ? `Player ${pTotal} (0–5) → must draw.` : `Player ${pTotal} (6–7) → must stand.`;
}

function bankerExplanation(bTotal: number, playerThird: Card | null, shouldDraw: boolean): string {
  if (!playerThird) {
    return shouldDraw ? `Banker ${bTotal} (0–5), no player 3rd → draw.` : `Banker ${bTotal} (6–7), no player 3rd → stand.`;
  }
  const v = playerThird.value;
  const pc = `Player drew ${playerThird.rank} (${v}).`;
  switch (bTotal) {
    case 0: case 1: case 2: return `Banker ${bTotal} → always draw. ${pc}`;
    case 3: return `Banker 3: ${shouldDraw ? 'draw' : 'stand when player drew 8'}. ${pc}`;
    case 4: return `Banker 4: draw on 2–7 (was ${v}). ${pc} → ${shouldDraw ? 'draw' : 'stand'}.`;
    case 5: return `Banker 5: draw on 4–7 (was ${v}). ${pc} → ${shouldDraw ? 'draw' : 'stand'}.`;
    case 6: return `Banker 6: draw on 6–7 (was ${v}). ${pc} → ${shouldDraw ? 'draw' : 'stand'}.`;
    case 7: return `Banker 7 → always stand.`;
    default: return `Should ${shouldDraw ? 'draw' : 'stand'}.`;
  }
}

const emptyStats = (): DrillStats => ({
  handsPlayed: 0, handsCorrect: 0, playerErrors: 0, bankerErrors: 0,
  streak: 0, bestStreak: 0, heatmap: {},
});

function heatmapKey(bTotal: number, pThirdValue: number | null): string {
  return `${bTotal}:${pThirdValue ?? 'none'}`;
}

function initState(hardOnly: boolean): DrillState {
  const dealt = dealFresh(createShoe(), hardOnly);
  return { ...dealt, phase: 'player-decision', playerResult: null, bankerResult: null, stats: emptyStats() };
}

function reducer(state: DrillState, action: DrillAction, hardOnly: boolean): DrillState {
  switch (action.type) {
    case 'ANSWER': {
      const { phase, playerHand, bankerHand, shoe, stats, playerResult } = state;

      if (phase === 'player-decision') {
        const pTotal = handTotal(playerHand);
        const shouldDraw = playerShouldDraw(pTotal);
        const correct = action.hit === shouldDraw;
        let newPlayerHand = playerHand;
        let newShoe = shoe;
        if (action.hit) { const r = drawCard(shoe); newPlayerHand = [...playerHand, r.card]; newShoe = r.remainingShoe; }
        return {
          ...state, playerHand: newPlayerHand, shoe: newShoe, phase: 'banker-decision',
          playerResult: { correct, message: playerExplanation(pTotal, shouldDraw) }, bankerResult: null,
        };
      }

      if (phase === 'banker-decision') {
        const bTotal = handTotal(bankerHand);
        const playerThird = playerHand.length === 3 ? playerHand[2] : null;
        const shouldDraw = bankerShouldDraw(bTotal, playerThird);
        const correct = action.hit === shouldDraw;
        let newBankerHand = bankerHand;
        let newShoe = shoe;
        if (action.hit) { const r = drawCard(shoe); newBankerHand = [...bankerHand, r.card]; newShoe = r.remainingShoe; }

        const pCorrect = playerResult?.correct !== false;
        const allCorrect = pCorrect && correct;
        const newStreak = allCorrect ? stats.streak + 1 : 0;

        // Update heatmap for this banker decision
        const hk = heatmapKey(bTotal, playerThird?.value ?? null);
        const prev = stats.heatmap[hk] ?? { correct: 0, total: 0 };
        const newHeatmap = { ...stats.heatmap, [hk]: { correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 } };

        return {
          ...state, bankerHand: newBankerHand, shoe: newShoe, phase: 'result',
          bankerResult: { correct, message: bankerExplanation(bTotal, playerThird, shouldDraw) },
          stats: {
            handsPlayed: stats.handsPlayed + 1,
            handsCorrect: stats.handsCorrect + (allCorrect ? 1 : 0),
            playerErrors: stats.playerErrors + (pCorrect ? 0 : 1),
            bankerErrors: stats.bankerErrors + (correct ? 0 : 1),
            streak: newStreak,
            bestStreak: Math.max(stats.bestStreak, newStreak),
            heatmap: newHeatmap,
          },
        };
      }
      return state;
    }

    case 'NEXT_HAND': {
      const dealt = dealFresh(state.shoe, hardOnly);
      return { ...dealt, phase: 'player-decision', playerResult: null, bankerResult: null, stats: state.stats };
    }

    case 'RESET_STATS':
      return { ...state, stats: emptyStats() };

    default:
      return state;
  }
}

// ─── Heatmap Component ────────────────────────────────────────────────────────

const BANKER_TOTALS = [3, 4, 5, 6];
const PLAYER_THIRDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function HeatmapView({ heatmap }: { heatmap: DrillStats['heatmap'] }) {
  return (
    <div style={{ padding: '12px 4px', overflowX: 'auto' }}>
      <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
        Banker Draw Accuracy — Banker total × Player 3rd card
      </div>
      <table style={{ borderCollapse: 'collapse', fontSize: 10, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ color: 'rgba(255,255,255,0.4)', padding: '3px 5px', textAlign: 'left', fontWeight: 700 }}>B\P3</th>
            {PLAYER_THIRDS.map(v => (
              <th key={v} style={{ color: 'rgba(248,113,113,0.7)', padding: '3px 4px', fontWeight: 800, textAlign: 'center' }}>{v}</th>
            ))}
            <th style={{ color: 'rgba(255,255,255,0.4)', padding: '3px 5px', fontWeight: 700, textAlign: 'center' }}>None</th>
          </tr>
        </thead>
        <tbody>
          {BANKER_TOTALS.map(bT => (
            <tr key={bT}>
              <td style={{ color: 'rgba(248,113,113,0.7)', padding: '3px 5px', fontWeight: 900 }}>{bT}</td>
              {PLAYER_THIRDS.map(pV => {
                const cell = heatmap[heatmapKey(bT, pV)];
                const pct = cell ? Math.round((cell.correct / cell.total) * 100) : null;
                const bg = pct === null ? 'rgba(255,255,255,0.04)' : pct === 100 ? 'rgba(22,163,74,0.55)' : pct >= 50 ? 'rgba(202,138,4,0.5)' : 'rgba(220,38,38,0.55)';
                return (
                  <td key={pV} style={{ padding: '3px 2px', textAlign: 'center' }}>
                    <div style={{ width: 26, height: 22, borderRadius: 4, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: pct === null ? 'rgba(255,255,255,0.18)' : '#fff', fontWeight: 800, fontSize: 9 }}>
                      {pct === null ? '·' : `${pct}%`}
                    </div>
                  </td>
                );
              })}
              {/* "None" column — player didn't draw */}
              {(() => {
                const cell = heatmap[heatmapKey(bT, null)];
                const pct = cell ? Math.round((cell.correct / cell.total) * 100) : null;
                const bg = pct === null ? 'rgba(255,255,255,0.04)' : pct === 100 ? 'rgba(22,163,74,0.55)' : pct >= 50 ? 'rgba(202,138,4,0.5)' : 'rgba(220,38,38,0.55)';
                return (
                  <td style={{ padding: '3px 2px', textAlign: 'center' }}>
                    <div style={{ width: 26, height: 22, borderRadius: 4, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: pct === null ? 'rgba(255,255,255,0.18)' : '#fff', fontWeight: 800, fontSize: 9 }}>
                      {pct === null ? '·' : `${pct}%`}
                    </div>
                  </td>
                );
              })()}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(22,163,74,0.55)', marginRight: 3 }} />100%</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(202,138,4,0.5)', marginRight: 3 }} />50–99%</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(220,38,38,0.55)', marginRight: 3 }} />{'<50%'}</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.04)', marginRight: 3 }} />No data</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TIMER_SECONDS = 5;
const STREAK_TIERS = [10, 25, 50];

const OUTCOME_BTNS = [
  { key: 'dragon7', label: '🐉 Dragon 7', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.45)' },
  { key: 'panda8',  label: '🐼 Panda 8',  color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.45)' },
  { key: 'ruby',    label: '💎 Ruby',      color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.45)' },
  { key: 'tie',     label: 'Tie',          color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.45)' },
];

export default function ThirdCardDrill() {
  const [mode, setMode] = useState<DrillMode>('normal');
  const [showStats, setShowStats] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const hardOnly = mode === 'hard';

  const [state, rawDispatch] = useReducer(
    (s: DrillState, a: DrillAction) => reducer(s, a, hardOnly),
    undefined,
    () => initState(false),
  );

  const dispatch = rawDispatch;

  // Timed mode countdown
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Deck clock state
  const [clockStarted, setClockStarted] = useState(false);
  const [clockFinished, setClockFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [shoeStartSize, setShoeStartSize] = useState(0);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DECK_CARDS = 52;
  const [outcomeSelected, setOutcomeSelected] = useState<string | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    clearTimer();
    if (mode !== 'timed' || state.phase === 'result') { setTimeLeft(TIMER_SECONDS); return; }
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearTimer();
          // Time out = wrong answer (stand when should have answered)
          dispatch({ type: 'ANSWER', hit: false });
          return TIMER_SECONDS;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  }, [mode, state.phase, state.playerHand, state.bankerHand, clearTimer, dispatch]);

  // Reset outcome selection on new hand
  useEffect(() => { if (phase === 'player-decision') setOutcomeSelected(null); }, [phase]);

  // Clock: reset when leaving clock mode
  useEffect(() => {
    if (mode !== 'clock') {
      if (clockRef.current) { clearInterval(clockRef.current); clockRef.current = null; }
      setClockStarted(false);
      setClockFinished(false);
      setElapsed(0);
    }
  }, [mode]);

  // Clock: stop when one deck consumed
  const cardsConsumed = clockStarted && shoeStartSize > 0 ? shoeStartSize - state.shoe.length : 0;
  useEffect(() => {
    if (mode !== 'clock' || !clockStarted || clockFinished) return;
    if (cardsConsumed >= DECK_CARDS) {
      if (clockRef.current) { clearInterval(clockRef.current); clockRef.current = null; }
      setClockFinished(true);
    }
  }, [cardsConsumed, mode, clockStarted, clockFinished]);

  function startClock() {
    dispatch({ type: 'RESET_STATS' });
    dispatch({ type: 'NEXT_HAND' });
    setElapsed(0);
    setClockFinished(false);
    setShoeStartSize(state.shoe.length);
    setClockStarted(true);
    if (clockRef.current) clearInterval(clockRef.current);
    clockRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  }

  function formatElapsed(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const { playerHand, bankerHand, phase, playerResult, bankerResult, stats } = state;

  const outcome = phase === 'result' ? determineOutcome(playerHand, bankerHand) : null;
  const correctOutcome = (() => {
    if (!outcome) return 'none';
    if (outcome.winner === 'tie') return 'tie';
    if (outcome.winner === 'banker' && bankerHand.length === 3 && handTotal(bankerHand) === 7) return 'dragon7';
    if (outcome.winner === 'player' && playerHand.length === 3 && handTotal(playerHand) === 8) return 'panda8';
    if (outcome.winner === 'banker' && bankerHand.length === 3) return 'ruby';
    return 'none';
  })();
  const isPlayerTurn = phase === 'player-decision';
  const isBankerTurn = phase === 'banker-decision';
  const isResult = phase === 'result';

  const allCorrect = playerResult?.correct !== false && bankerResult?.correct !== false;
  const pct = stats.handsPlayed > 0 ? Math.round((stats.handsCorrect / stats.handsPlayed) * 100) : null;

  const winnerLabel = outcome?.winner === 'player' ? 'Player Wins' : outcome?.winner === 'banker' ? 'Banker Wins' : 'Tie';

  const bannerColor = isPlayerTurn ? '#93c5fd' : isBankerTurn ? '#fca5a5' : allCorrect ? '#4ade80' : '#f87171';
  const bannerBg = isPlayerTurn ? 'rgba(59,130,246,0.15)' : isBankerTurn ? 'rgba(220,38,38,0.15)' : allCorrect ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)';
  const bannerBorder = isPlayerTurn ? 'rgba(59,130,246,0.5)' : isBankerTurn ? 'rgba(220,38,38,0.5)' : allCorrect ? 'rgba(74,222,128,0.55)' : 'rgba(248,113,113,0.55)';

  const nextTier = STREAK_TIERS.find(t => stats.streak < t);

  return (
    <div className="flex flex-col" style={{ background: '#0d0d16', height: '100dvh', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #7a1826' }}>
        <Link href="/practice" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          ← Drills
        </Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          ♦ Third Card Rules ♦
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button style={{ fontSize: 10, background: 'rgba(232,200,106,0.12)', color: '#e8c86a', border: '1px solid rgba(232,200,106,0.3)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', touchAction: 'manipulation' }}
            onClick={() => { setShowStats(s => !s); setShowHeatmap(false); }}>Stats</button>
          <button style={{ fontSize: 10, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', touchAction: 'manipulation' }}
            onClick={() => dispatch({ type: 'NEXT_HAND' })}>New</button>
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', overflowX: 'auto' }}>
        {(['normal', 'timed', 'streak', 'hard', 'clock'] as DrillMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flexShrink: 0, flex: 1, padding: '7px 4px', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
            textTransform: 'uppercase', cursor: 'pointer', touchAction: 'manipulation', border: 'none',
            background: mode === m ? 'rgba(122,24,38,0.5)' : 'transparent',
            color: mode === m ? '#f5f0e8' : 'rgba(255,255,255,0.3)',
            borderBottom: mode === m ? '2px solid #f87171' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            {m === 'normal' ? 'Normal' : m === 'timed' ? '⏱ Timed' : m === 'streak' ? '🔥 Streak' : m === 'hard' ? '💀 Hard' : '🕐 Clock'}
          </button>
        ))}
      </div>

      {/* Stats panel */}
      {showStats && !showHeatmap && (
        <div style={{ background: 'rgba(10,10,20,0.97)', borderBottom: '2px solid #7a1826', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#e8c86a', fontWeight: 900, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Session Stats</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setShowHeatmap(true)}
                style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.3)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.4)', cursor: 'pointer' }}>
                Heatmap
              </button>
              <button onClick={() => dispatch({ type: 'RESET_STATS' })}
                style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(122,24,38,0.4)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.35)', cursor: 'pointer' }}>
                Reset
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
            <StatRow label="Hands Played" value={String(stats.handsPlayed)} />
            <StatRow label="Perfect" value={stats.handsPlayed > 0 ? `${stats.handsCorrect} (${pct}%)` : '—'} color="#4ade80" />
            <StatRow label="Player Errors" value={String(stats.playerErrors)} color="#93c5fd" />
            <StatRow label="Banker Errors" value={String(stats.bankerErrors)} color="#fca5a5" />
            <StatRow label="Current Streak" value={String(stats.streak)} color="#fbbf24" />
            <StatRow label="Best Streak" value={String(stats.bestStreak)} color="#f59e0b" />
          </div>
        </div>
      )}

      {showStats && showHeatmap && (
        <div style={{ background: 'rgba(10,10,20,0.97)', borderBottom: '2px solid #7a1826', padding: '4px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <button onClick={() => setShowHeatmap(false)} style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>← Stats</button>
            <span style={{ color: '#c4b5fd', fontSize: 10, fontWeight: 900 }}>WEAKNESS HEATMAP</span>
            <div style={{ width: 40 }} />
          </div>
          <HeatmapView heatmap={stats.heatmap} />
        </div>
      )}

      {/* Streak indicator */}
      {mode === 'streak' && stats.streak > 0 && (
        <div style={{ textAlign: 'center', padding: '4px', background: 'rgba(251,191,36,0.08)', borderBottom: '1px solid rgba(251,191,36,0.2)' }}>
          <span style={{ color: '#fbbf24', fontSize: 13, fontWeight: 900 }}>
            🔥 {stats.streak} {nextTier ? `→ ${nextTier}` : 'UNSTOPPABLE'}
          </span>
        </div>
      )}

      {/* Deck clock bar */}
      {mode === 'clock' && clockStarted && !clockFinished && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 16px', background: 'rgba(0,0,0,0.55)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ color: '#fbbf24', fontSize: 22, fontWeight: 900, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em' }}>
              {formatElapsed(elapsed)}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>elapsed</span>
          </div>
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, margin: '0 14px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${Math.min(100, (cardsConsumed / DECK_CARDS) * 100)}%`,
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 900 }}>{cardsConsumed}<span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>/{DECK_CARDS}</span></div>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, textTransform: 'uppercase' }}>cards</div>
          </div>
        </div>
      )}

      {/* Timer bar */}
      {mode === 'timed' && !isResult && (
        <div style={{ height: 5, background: 'rgba(0,0,0,0.4)' }}>
          <div style={{
            height: '100%',
            width: `${(timeLeft / TIMER_SECONDS) * 100}%`,
            background: timeLeft <= 2 ? '#ef4444' : timeLeft <= 3 ? '#f59e0b' : '#4ade80',
            transition: 'width 0.9s linear, background 0.3s',
          }} />
        </div>
      )}

      {/* Felt */}
      <div className="flex-1 felt flex flex-col items-center gap-3 py-3 px-4 overflow-hidden min-h-0" style={{ position: 'relative' }}>

        {/* Clock: START screen */}
        {mode === 'clock' && !clockStarted && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(8,10,14,0.92)', gap: 20,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#e8c86a', fontSize: 13, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>🕐 Deck Clock</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, lineHeight: 1.7 }}>
                Timer starts when you press START.<br />
                Play through <span style={{ color: '#fbbf24', fontWeight: 900 }}>52 cards</span> (~8–13 hands).<br />
                Clock stops automatically when done.
              </div>
            </div>
            <button onClick={startClock} style={{
              padding: '18px 52px', fontSize: 20, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
              borderRadius: 16, background: 'linear-gradient(160deg, #7a1826, #9a1e30)',
              color: '#fff', border: '2px solid rgba(220,100,120,0.6)',
              boxShadow: '0 0 30px rgba(122,24,38,0.6)', cursor: 'pointer', touchAction: 'manipulation',
            }}>
              START
            </button>
          </div>
        )}

        {/* Clock: FINISHED screen */}
        {mode === 'clock' && clockFinished && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(8,10,14,0.93)', gap: 16,
          }}>
            <div style={{ color: '#e8c86a', fontSize: 13, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Deck Complete!</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#fbbf24', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.06em' }}>
              {formatElapsed(elapsed)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: '14px 24px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <StatRow label="Hands" value={String(stats.handsPlayed)} />
              <StatRow label="Accuracy" value={stats.handsPlayed > 0 ? `${Math.round((stats.handsCorrect / stats.handsPlayed) * 100)}%` : '—'} color="#4ade80" />
              <StatRow label="Player Errors" value={String(stats.playerErrors)} color="#93c5fd" />
              <StatRow label="Banker Errors" value={String(stats.bankerErrors)} color="#fca5a5" />
            </div>
            <button onClick={startClock} style={{
              padding: '14px 40px', fontSize: 15, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
              borderRadius: 14, background: '#7a1826', color: '#fff', border: '2px solid rgba(220,100,120,0.5)',
              boxShadow: '0 0 20px rgba(122,24,38,0.5)', cursor: 'pointer', touchAction: 'manipulation',
            }}>
              Try Again
            </button>
          </div>
        )}

        {/* Phase banner */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', padding: '7px 20px', borderRadius: 10, fontWeight: 900,
            fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
            background: bannerBg, border: `2px solid ${bannerBorder}`, color: bannerColor,
          }}>
            {isPlayerTurn && (mode === 'timed' ? `⏱ ${timeLeft}s — Player: Hit or Stand?` : 'Player — Hit or Stand?')}
            {isBankerTurn && (mode === 'timed' ? `⏱ ${timeLeft}s — Banker: Hit or Stand?` : 'Banker — Hit or Stand?')}
            {isResult && (allCorrect ? `✓ Correct — ${winnerLabel}` : `✗ Wrong — ${winnerLabel}`)}
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 16, width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,0,0,0.5)', borderRadius: 16, padding: '12px 12px', flex: '0 0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ color: '#fca5a5', fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 5, padding: '2px 10px', textTransform: 'uppercase' }}>Banker</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {bankerHand.map((card, i) => <CardView key={i} card={card} delay={i * 120} />)}
            </div>
          </div>
          <div style={{ paddingTop: 50, color: 'rgba(255,255,255,0.18)', fontSize: 16, flexShrink: 0 }}>VS</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ color: '#93c5fd', fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 5, padding: '2px 10px', textTransform: 'uppercase' }}>Player</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {playerHand.map((card, i) => <CardView key={i} card={card} delay={i * 120} />)}
            </div>
          </div>
        </div>

        {/* Corrections */}
        {isResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
            {playerResult && !playerResult.correct && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 8, padding: '5px 12px' }}>
                <span style={{ color: '#93c5fd', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Player  </span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{playerResult.message}</span>
              </div>
            )}
            {bankerResult && !bankerResult.correct && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 8, padding: '5px 12px' }}>
                <span style={{ color: '#fca5a5', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Banker  </span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{bankerResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(isPlayerTurn || isBankerTurn) && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, height: 76, fontSize: 22, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 16, background: 'linear-gradient(160deg, #1a7a38, #15803d)', color: '#fff', border: '2px solid #4ade80', boxShadow: '0 4px 20px rgba(22,163,74,0.55)', cursor: 'pointer', touchAction: 'manipulation' }}
                onClick={() => dispatch({ type: 'ANSWER', hit: true })}>HIT</button>
              <button style={{ flex: 1, height: 76, fontSize: 22, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 16, background: 'linear-gradient(160deg, #991b1b, #b91c1c)', color: '#fff', border: '2px solid #f87171', boxShadow: '0 4px 20px rgba(220,38,38,0.55)', cursor: 'pointer', touchAction: 'manipulation' }}
                onClick={() => dispatch({ type: 'ANSWER', hit: false })}>STAND</button>
            </div>
          )}
          {isResult && !outcomeSelected && (
            <>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textAlign: 'center', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Identify the outcome</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {OUTCOME_BTNS.map(btn => (
                  <button key={btn.key} onClick={() => setOutcomeSelected(btn.key)} style={{
                    height: 54, fontSize: 13, fontWeight: 900, borderRadius: 12,
                    background: btn.bg, color: btn.color, border: `1.5px solid ${btn.border}`,
                    cursor: 'pointer', touchAction: 'manipulation',
                  }}>{btn.label}</button>
                ))}
              </div>
              <button onClick={() => setOutcomeSelected('none')} style={{
                width: '100%', height: 42, fontSize: 12, fontWeight: 700, borderRadius: 12,
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', touchAction: 'manipulation',
              }}>No Special Outcome</button>
            </>
          )}
          {isResult && outcomeSelected && (
            <>
              <div style={{
                textAlign: 'center', padding: '8px 12px', borderRadius: 10,
                background: outcomeSelected === correctOutcome ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
                border: `1px solid ${outcomeSelected === correctOutcome ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}`,
              }}>
                <span style={{ color: outcomeSelected === correctOutcome ? '#4ade80' : '#f87171', fontSize: 12, fontWeight: 900 }}>
                  {outcomeSelected === correctOutcome
                    ? '✓ Correct!'
                    : `✗ Was: ${OUTCOME_BTNS.find(b => b.key === correctOutcome)?.label ?? 'No Special Outcome'}`}
                </span>
              </div>
              <button style={{ width: '100%', height: 64, fontSize: 17, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 16, background: '#7a1826', color: '#fff', border: '1px solid rgba(200,80,100,0.5)', boxShadow: '0 0 20px rgba(122,24,38,0.5)', cursor: 'pointer', touchAction: 'manipulation' }}
                onClick={() => dispatch({ type: 'NEXT_HAND' })}>
                Next Hand →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>{label}</span>
      <span style={{ color: color ?? '#fff', fontWeight: 900, fontSize: 14 }}>{value}</span>
    </div>
  );
}
