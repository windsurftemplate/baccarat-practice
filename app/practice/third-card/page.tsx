'use client';
import { useReducer, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '../../../lib/types';
import { createShoe, drawCard, handTotal, playerShouldDraw, bankerShouldDraw, determineOutcome } from '../../../lib/baccarat';
import CardView from '../../../components/Card';

// ─── Types ────────────────────────────────────────────────────────────────────

type DrillMode = 'normal' | 'timed' | 'streak' | 'hard';
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
  const base = shoe.length < 52 ? createShoe() : [...shoe];
  for (let attempts = 0; attempts < 300; attempts++) {
    // Reset shoe each attempt so we never deplete it
    let s = [...base];
    const take = (): Card => { const r = drawCard(s); s = r.remainingShoe; return r.card; };
    const playerHand = [take(), take()];
    const bankerHand = [take(), take()];
    const pT = handTotal(playerHand);
    const bT = handTotal(bankerHand);
    if (pT >= 8 || bT >= 8) continue; // skip naturals
    if (hardOnly && !isHardHand(playerHand, bankerHand)) continue;
    return { playerHand, bankerHand, shoe: s };
  }
  // fallback: deal without hard filter
  return dealFresh(shoe, false);
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

  const { playerHand, bankerHand, phase, playerResult, bankerResult, stats } = state;

  const outcome = phase === 'result' ? determineOutcome(playerHand, bankerHand) : null;
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
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
        {(['normal', 'timed', 'streak', 'hard'] as DrillMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: '7px 4px', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
            textTransform: 'uppercase', cursor: 'pointer', touchAction: 'manipulation', border: 'none',
            background: mode === m ? 'rgba(122,24,38,0.5)' : 'transparent',
            color: mode === m ? '#f5f0e8' : 'rgba(255,255,255,0.3)',
            borderBottom: mode === m ? '2px solid #f87171' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            {m === 'normal' ? 'Normal' : m === 'timed' ? '⏱ Timed' : m === 'streak' ? '🔥 Streak' : '💀 Hard'}
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
      <div className="flex-1 felt flex flex-col items-center gap-3 py-3 px-4 overflow-hidden min-h-0">

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
        <div className="flex justify-around items-start w-full rounded-2xl py-3 px-3"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,0,0,0.5)', flex: '0 0 auto' }}>
          <div className="flex flex-col items-center gap-2">
            <div style={{ color: '#fca5a5', fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 5, padding: '2px 10px', textTransform: 'uppercase' }}>Banker</div>
            <div style={{ display: 'flex', gap: 2 }}>
              {bankerHand.map((card, i) => <CardView key={i} card={card} delay={i * 120} />)}
            </div>
          </div>
          <div style={{ paddingTop: 55, color: 'rgba(255,255,255,0.18)', fontSize: 18 }}>VS</div>
          <div className="flex flex-col items-center gap-2">
            <div style={{ color: '#93c5fd', fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 5, padding: '2px 10px', textTransform: 'uppercase' }}>Player</div>
            <div style={{ display: 'flex', gap: 2 }}>
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
          {isResult && (
            <button style={{ width: '100%', height: 64, fontSize: 17, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 16, background: '#7a1826', color: '#fff', border: '1px solid rgba(200,80,100,0.5)', boxShadow: '0 0 20px rgba(122,24,38,0.5)', cursor: 'pointer', touchAction: 'manipulation' }}
              onClick={() => dispatch({ type: 'NEXT_HAND' })}>
              Next Hand →
            </button>
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
