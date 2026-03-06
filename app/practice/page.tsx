'use client';
import { useReducer, useState } from 'react';
import Link from 'next/link';
import { Card } from '../../lib/types';
import { createShoe, drawCard, handTotal, playerShouldDraw, bankerShouldDraw, determineOutcome } from '../../lib/baccarat';
import CardView from '../../components/Card';

type DrillPhase = 'player-decision' | 'banker-decision' | 'result';

interface DecisionResult { correct: boolean; message: string; }

interface DrillStats {
  handsPlayed: number;
  handsCorrect: number;   // both decisions correct
  playerErrors: number;   // times player decision was wrong
  bankerErrors: number;   // times banker decision was wrong
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

function dealFresh(shoe: Card[]): { playerHand: Card[]; bankerHand: Card[]; shoe: Card[] } {
  let s = shoe.length < 52 ? createShoe() : [...shoe];
  const take = (): Card => { const r = drawCard(s); s = r.remainingShoe; return r.card; };
  const playerHand = [take(), take()];
  const bankerHand = [take(), take()];
  if (handTotal(playerHand) >= 8 || handTotal(bankerHand) >= 8) return dealFresh(s);
  return { playerHand, bankerHand, shoe: s };
}

function playerExplanation(pTotal: number, shouldDraw: boolean): string {
  return shouldDraw
    ? `Player ${pTotal} (0–5) → must draw.`
    : `Player ${pTotal} (6–7) → must stand.`;
}

function bankerExplanation(bTotal: number, playerThird: Card | null, shouldDraw: boolean): string {
  if (!playerThird) {
    return shouldDraw
      ? `Banker ${bTotal} (0–5), no player 3rd card → draw.`
      : `Banker ${bTotal} (6–7), no player 3rd card → stand.`;
  }
  const v = playerThird.value;
  const pc = `Player drew ${playerThird.rank} (val ${v}).`;
  switch (bTotal) {
    case 0: case 1: case 2: return `Banker ${bTotal} → always draw. ${pc}`;
    case 3: return shouldDraw
      ? `Banker 3: draw unless player drew 8. ${pc} → draw.`
      : `Banker 3: stand when player drew 8. ${pc} → stand.`;
    case 4: return shouldDraw
      ? `Banker 4: draw when player drew 2–7. ${pc} → draw.`
      : `Banker 4: stand when player drew 0,1,8,9. ${pc} → stand.`;
    case 5: return shouldDraw
      ? `Banker 5: draw when player drew 4–7. ${pc} → draw.`
      : `Banker 5: stand when player drew 0–3,8,9. ${pc} → stand.`;
    case 6: return shouldDraw
      ? `Banker 6: draw when player drew 6 or 7. ${pc} → draw.`
      : `Banker 6: stand when player drew 0–5,8,9. ${pc} → stand.`;
    case 7: return `Banker 7 → always stand.`;
    default: return `Banker should ${shouldDraw ? 'draw' : 'stand'}.`;
  }
}

const emptyStats = (): DrillStats => ({ handsPlayed: 0, handsCorrect: 0, playerErrors: 0, bankerErrors: 0 });

function initState(): DrillState {
  const dealt = dealFresh(createShoe());
  return { ...dealt, phase: 'player-decision', playerResult: null, bankerResult: null, stats: emptyStats() };
}

function reducer(state: DrillState, action: DrillAction): DrillState {
  switch (action.type) {

    case 'ANSWER': {
      const { phase, playerHand, bankerHand, shoe, stats, playerResult } = state;

      if (phase === 'player-decision') {
        const pTotal = handTotal(playerHand);
        const shouldDraw = playerShouldDraw(pTotal);
        const correct = action.hit === shouldDraw;
        let newPlayerHand = playerHand;
        let newShoe = shoe;
        if (action.hit) {
          const r = drawCard(shoe);
          newPlayerHand = [...playerHand, r.card];
          newShoe = r.remainingShoe;
        }
        return {
          ...state,
          playerHand: newPlayerHand,
          shoe: newShoe,
          phase: 'banker-decision',
          playerResult: { correct, message: playerExplanation(pTotal, shouldDraw) },
          bankerResult: null,
        };
      }

      if (phase === 'banker-decision') {
        const bTotal = handTotal(bankerHand);
        const playerThird = playerHand.length === 3 ? playerHand[2] : null;
        const shouldDraw = bankerShouldDraw(bTotal, playerThird);
        const correct = action.hit === shouldDraw;
        let newBankerHand = bankerHand;
        let newShoe = shoe;
        if (action.hit) {
          const r = drawCard(shoe);
          newBankerHand = [...bankerHand, r.card];
          newShoe = r.remainingShoe;
        }
        const pCorrect = playerResult?.correct !== false;
        const allCorrect = pCorrect && correct;
        return {
          ...state,
          bankerHand: newBankerHand,
          shoe: newShoe,
          phase: 'result',
          bankerResult: { correct, message: bankerExplanation(bTotal, playerThird, shouldDraw) },
          stats: {
            handsPlayed: stats.handsPlayed + 1,
            handsCorrect: stats.handsCorrect + (allCorrect ? 1 : 0),
            playerErrors: stats.playerErrors + (pCorrect ? 0 : 1),
            bankerErrors: stats.bankerErrors + (correct ? 0 : 1),
          },
        };
      }

      return state;
    }

    case 'NEXT_HAND': {
      const dealt = dealFresh(state.shoe);
      return { ...dealt, phase: 'player-decision', playerResult: null, bankerResult: null, stats: state.stats };
    }

    case 'RESET_STATS':
      return { ...state, stats: emptyStats() };

    default:
      return state;
  }
}

export default function PracticePage() {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const [showStats, setShowStats] = useState(false);
  const { playerHand, bankerHand, phase, playerResult, bankerResult, stats } = state;

  const outcome = phase === 'result' ? determineOutcome(playerHand, bankerHand) : null;

  const isPlayerTurn = phase === 'player-decision';
  const isBankerTurn = phase === 'banker-decision';
  const isResult     = phase === 'result';

  const allCorrect = playerResult?.correct !== false && bankerResult?.correct !== false;
  const anyWrong   = !allCorrect;

  const bannerColor  = isPlayerTurn ? '#93c5fd' : isBankerTurn ? '#fca5a5'
    : anyWrong ? '#f87171' : '#4ade80';
  const bannerBg     = isPlayerTurn ? 'rgba(59,130,246,0.15)' : isBankerTurn ? 'rgba(220,38,38,0.15)'
    : anyWrong ? 'rgba(220,38,38,0.15)' : 'rgba(22,163,74,0.15)';
  const bannerBorder = isPlayerTurn ? 'rgba(59,130,246,0.5)' : isBankerTurn ? 'rgba(220,38,38,0.5)'
    : anyWrong ? 'rgba(248,113,113,0.55)' : 'rgba(74,222,128,0.55)';

  const winnerLabel = outcome?.winner === 'player' ? 'Player Wins'
    : outcome?.winner === 'banker' ? 'Banker Wins' : 'Tie';

  const pct = stats.handsPlayed > 0
    ? Math.round((stats.handsCorrect / stats.handsPlayed) * 100)
    : null;

  return (
    <div className="flex flex-col h-screen" style={{ background: '#0d0d16', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #7a1826' }}>
        <Link href="/" className="text-xs font-bold tracking-widest uppercase"
          style={{ color: 'rgba(232,200,106,0.6)' }}>← Table</Link>
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#e8c86a', letterSpacing: '0.2em' }}>
          ♦ Dealer Drill ♦
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="text-xs px-2 py-0.5 rounded"
            style={{ background: 'rgba(232,200,106,0.12)', color: '#e8c86a', border: '1px solid rgba(232,200,106,0.3)' }}
            onClick={() => setShowStats(s => !s)}>
            Stats
          </button>
          <button className="text-xs px-2 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
            onClick={() => dispatch({ type: 'NEXT_HAND' })}>
            New Hand
          </button>
        </div>
      </div>

      {/* Stats panel */}
      {showStats && (
        <div style={{
          background: 'rgba(10,10,20,0.97)',
          borderBottom: '2px solid #7a1826',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#e8c86a', fontWeight: 900, fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Session Stats
            </span>
            <button
              style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                background: 'rgba(122,24,38,0.4)', color: '#fca5a5',
                border: '1px solid rgba(248,113,113,0.35)',
              }}
              onClick={() => dispatch({ type: 'RESET_STATS' })}>
              Reset
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
            <StatRow label="Hands Played" value={String(stats.handsPlayed)} />
            <StatRow label="Perfect Hands"
              value={stats.handsPlayed > 0 ? `${stats.handsCorrect}  (${pct}%)` : '—'}
              color="#4ade80" />
            <StatRow label="Hands w/ Mistake"
              value={stats.handsPlayed > 0 ? `${stats.handsPlayed - stats.handsCorrect}  (${100 - (pct ?? 0)}%)` : '—'}
              color="#f87171" />
            <StatRow label="Player Errors" value={String(stats.playerErrors)} color="#93c5fd" />
            <StatRow label="Banker Errors" value={String(stats.bankerErrors)} color="#fca5a5" />
          </div>
        </div>
      )}

      {/* Felt */}
      <div className="flex-1 felt flex flex-col items-center gap-4 py-4 px-4 overflow-hidden min-h-0">

        {/* Phase / result banner */}
        <div className="w-full text-center">
          <div className="inline-block px-6 py-2 rounded-xl font-black uppercase tracking-widest text-sm"
            style={{ background: bannerBg, border: `2px solid ${bannerBorder}`, color: bannerColor }}>
            {isPlayerTurn && 'Player — Hit or Stand?'}
            {isBankerTurn && 'Banker — Hit or Stand?'}
            {isResult && (allCorrect ? `✓ Correct — ${winnerLabel}` : `✗ Wrong — ${winnerLabel}`)}
          </div>
        </div>

        {/* Cards */}
        <div className="flex justify-around items-start w-full rounded-2xl py-4 px-3"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,0,0,0.5)', flex: '0 0 auto' }}>

          {/* Player */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-black uppercase tracking-widest px-3 py-0.5 rounded"
              style={{ color: '#93c5fd', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)' }}>
              Player
            </div>
            <div style={{ display: 'flex', gap: 1 }}>
              {playerHand.map((card, i) => <CardView key={i} card={card} delay={i * 120} />)}
            </div>
          </div>

          <div className="flex items-center" style={{ paddingTop: 60 }}>
            <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 20 }}>VS</span>
          </div>

          {/* Banker */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-black uppercase tracking-widest px-3 py-0.5 rounded"
              style={{ color: '#fca5a5', background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)' }}>
              Banker
            </div>
            <div style={{ display: 'flex', gap: 1 }}>
              {bankerHand.map((card, i) => <CardView key={i} card={card} delay={i * 120} />)}
            </div>
          </div>
        </div>

        {/* Corrections (only wrong decisions) */}
        {isResult && (
          <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {playerResult && !playerResult.correct && (
              <div style={{
                background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)',
                borderRadius: 8, padding: '6px 14px',
              }}>
                <span style={{ color: '#93c5fd', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Player  </span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{playerResult.message}</span>
              </div>
            )}
            {bankerResult && !bankerResult.correct && (
              <div style={{
                background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)',
                borderRadius: 8, padding: '6px 14px',
              }}>
                <span style={{ color: '#fca5a5', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Banker  </span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{bankerResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3" style={{ maxWidth: 340 }}>
          {(isPlayerTurn || isBankerTurn) && (
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-2xl font-black uppercase transition-transform active:scale-95"
                style={{
                  height: 80, fontSize: 24, letterSpacing: '0.15em',
                  background: 'linear-gradient(160deg, #1a7a38, #15803d)',
                  color: '#fff', border: '2px solid #4ade80',
                  boxShadow: '0 4px 24px rgba(22,163,74,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
                onClick={() => dispatch({ type: 'ANSWER', hit: true })}>
                HIT
              </button>
              <button
                className="flex-1 rounded-2xl font-black uppercase transition-transform active:scale-95"
                style={{
                  height: 80, fontSize: 24, letterSpacing: '0.15em',
                  background: 'linear-gradient(160deg, #991b1b, #b91c1c)',
                  color: '#fff', border: '2px solid #f87171',
                  boxShadow: '0 4px 24px rgba(220,38,38,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
                onClick={() => dispatch({ type: 'ANSWER', hit: false })}>
                STAND
              </button>
            </div>
          )}

          {isResult && (
            <button
              className="w-full rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95"
              style={{
                height: 68, fontSize: 18,
                background: '#7a1826', color: '#fff',
                border: '1px solid rgba(200,80,100,0.5)',
                boxShadow: '0 0 22px rgba(122,24,38,0.55)',
              }}
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
      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>{label}</span>
      <span style={{ color: color ?? '#fff', fontWeight: 900, fontSize: 15 }}>{value}</span>
    </div>
  );
}
