'use client';
import { useState } from 'react';
import Link from 'next/link';
import { GameState, Action, BetKey } from '../lib/types';
import { totalBetAmount, handTotal, playerShouldDraw, bankerShouldDraw } from '../lib/baccarat';
import { CHIP_DEFS } from './ChipTray';
import CardHand from './CardHand';
import HitStandControls from './HitStandControls';
import PlayerPanel from './PlayerPanel';
import ResultBanner from './ResultBanner';
import Scorecard from './Scorecard';
import StatsBar from './StatsBar';
import BettingZone from './BettingZone';

interface Props {
  state: GameState;
  dispatch: (action: Action) => void;
}

const SIDE_ZONES: { zone: BetKey; label: string; payout: string; accent?: string }[] = [
  { zone: 'jade8', label: 'Panda 8 🐼', payout: '25:1', accent: '#10b981' },
  { zone: 'ruby',  label: 'Ruby 💎',    payout: 'Small 10:1 / Big 75:1', accent: '#f43f5e' },
  { zone: 'gold7', label: 'Dragon 7 🐉', payout: '40:1', accent: '#a855f7' },
];

function amountToChips(amount: number) {
  const chips: typeof CHIP_DEFS = [];
  let remaining = amount;
  for (const def of [...CHIP_DEFS].reverse()) {
    while (remaining >= def.value && chips.length < 8) {
      chips.push(def);
      remaining -= def.value;
    }
  }
  return chips;
}

function ChipStack({ amount }: { amount: number }) {
  if (amount <= 0) return null;
  const chips = amountToChips(amount);
  const CHIP_SIZE = 28;
  const CHIP_STEP = 5;
  const stackH = CHIP_SIZE + (chips.length - 1) * CHIP_STEP;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ position: 'relative', width: CHIP_SIZE, height: stackH }}>
        {chips.map((chip, i) => (
          <div key={i} style={{
            position: 'absolute',
            bottom: i * CHIP_STEP,
            width: CHIP_SIZE, height: CHIP_SIZE,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${chip.rim}, ${chip.color})`,
            border: `2px solid ${chip.rim}`,
            boxShadow: `0 ${i === 0 ? 2 : 1}px ${i === 0 ? 5 : 2}px rgba(0,0,0,0.5)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: i,
          }}>
            <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.4)' }} />
            {i === chips.length - 1 && (
              <span style={{ color: chip.text, fontSize: 7, fontWeight: 900, position: 'relative', zIndex: 1 }}>
                ${chip.value}
              </span>
            )}
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(0,0,0,0.6)', color: '#e8c86a', borderRadius: 3, padding: '1px 5px', fontSize: 10, fontWeight: 800 }}>
        ${amount}
      </div>
    </div>
  );
}

function getPlayerWrongReason(total: number, dealerHit: boolean): string {
  if (dealerHit && !playerShouldDraw(total))
    return `Wrong: Player total is ${total} — rules say stand on 6 or 7.`;
  if (!dealerHit && playerShouldDraw(total))
    return `Wrong: Player total is ${total} — rules say draw on 0–5.`;
  return '';
}

function getBankerWrongReason(bankerTotal: number, playerThird: import('../lib/types').Card | null, dealerHit: boolean): string {
  const shouldDraw = bankerShouldDraw(bankerTotal, playerThird);
  if (dealerHit === shouldDraw) return '';
  if (!playerThird) {
    if (dealerHit) return `Wrong: Banker total is ${bankerTotal} — with no player 3rd card, banker stands on 6 or 7.`;
    return `Wrong: Banker total is ${bankerTotal} — with no player 3rd card, banker draws on 0–5.`;
  }
  const v = playerThird.value;
  const rules: Record<number, string> = {
    0: 'Banker always draws on 0–2.',
    1: 'Banker always draws on 0–2.',
    2: 'Banker always draws on 0–2.',
    3: `Banker draws on 3 unless player's 3rd card is 8 (it was ${v}).`,
    4: `Banker draws on 4 when player's 3rd card is 2–7 (it was ${v}).`,
    5: `Banker draws on 5 when player's 3rd card is 4–7 (it was ${v}).`,
    6: `Banker draws on 6 when player's 3rd card is 6–7 (it was ${v}).`,
    7: 'Banker always stands on 7.',
  };
  const reason = rules[bankerTotal] ?? '';
  return dealerHit ? `Wrong: Banker should stand. ${reason}` : `Wrong: Banker should draw. ${reason}`;
}

export default function BaccaratTable({ state, dispatch }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const { phase, selectedChip, players, activePlayerId,
          playerHand, bankerHand, result, history, shoe } = state as GameState & { stagedBets: never };

  const activePlayer = players.find(p => p.id === activePlayerId);
  const isBetting = phase === 'betting';
  const canBet    = isBetting && !!activePlayer && activePlayer.balance > 0;
  const totalBets = players.reduce((s, p) => s + totalBetAmount(p.bets), 0);
  const canDeal   = isBetting && totalBets > 0;

  const combinedBets = players.reduce((acc, p) => {
    (Object.keys(p.bets) as BetKey[]).forEach(k => { acc[k] = (acc[k] ?? 0) + p.bets[k]; });
    return acc;
  }, {} as Record<BetKey, number>);

  const betDisabled = !canBet || (activePlayer ? activePlayer.balance - totalBetAmount(activePlayer.bets) < selectedChip : true);

  const pTotal = playerHand.length > 0 ? handTotal(playerHand) : 0;
  const bTotal = bankerHand.length > 0 ? handTotal(bankerHand) : 0;
  const playerThirdCard = playerHand.length === 3 ? playerHand[2] : null;
  const playerWon = result?.outcome.winner === 'player';
  const bankerWon = result?.outcome.winner === 'banker';

  const zoneBorder = '1px solid rgba(255,255,255,0.2)';

  return (
    <div className="flex flex-col h-screen" style={{ background: '#0d0d16' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '2px solid #7a1826' }}>
        <div style={{ width: 80 }} />
        <div className="text-xs font-bold tracking-widest uppercase"
          style={{ color: '#e8c86a', letterSpacing: '0.2em' }}>
          ♦ Baccarat Practice — Corporation Banker ♦
        </div>
        <Link href="/practice" className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
          style={{ color: 'rgba(232,200,106,0.7)', border: '1px solid rgba(122,24,38,0.6)', background: 'rgba(122,24,38,0.2)', width: 80, textAlign: 'center', display: 'block' }}>
          Practice
        </Link>
      </div>

      {/* Player seats — far end of table */}
      <div style={{ borderBottom: '3px solid #7a1826', background: 'rgba(0,0,0,0.45)' }}>
        <div className="px-2 pt-1 pb-0">
          <div className="text-xs uppercase tracking-widest text-center"
            style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.3em', fontSize: 9, paddingBottom: 3 }}>
            — Players —
          </div>
        </div>
        <PlayerPanel players={players} activePlayerId={activePlayerId} phase={phase} dispatch={dispatch} />
      </div>

      {/* Felt table */}
      <div className="flex-1 flex flex-col felt px-2 pt-1.5 pb-1.5 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden min-h-0"
          style={{ border: '3px solid #7a1826', boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 0 40px rgba(0,0,0,0.4) inset' }}>

          {/* Scorecard */}
          <Scorecard history={history} />

          {/* Side bets */}
          <div className="grid grid-cols-3 gap-1.5 px-2 pb-1">
            {SIDE_ZONES.map(z => (
              <BettingZone key={z.zone} zone={z.zone} label={z.label} payout={z.payout} accent={z.accent}
                betAmount={combinedBets[z.zone] ?? 0} disabled={betDisabled}
                onClick={zone => dispatch({ type: 'PLACE_BET', zone })} />
            ))}
          </div>

          {/* Burgundy divider */}
          <div style={{ height: 2, background: '#7a1826', margin: '0 0' }} />

          {/* ── MAIN TABLE LAYOUT: PLAYER | TIE | BANKER ── */}
          <div className="flex-1 flex min-h-0" style={{ minHeight: 0 }}>

            {/* PLAYER zone — left half */}
            <div className="main-zone flex flex-col items-center justify-between py-2 px-2 flex-1"
              style={{
                borderRight: zoneBorder,
                cursor: betDisabled ? 'not-allowed' : 'pointer',
                opacity: betDisabled && !playerHand.length ? 0.6 : 1,
              }}
              onClick={() => !betDisabled && dispatch({ type: 'PLACE_BET', zone: 'player' })}>

              {/* Zone label — big, like casino table paint */}
              <div style={{
                color: '#5b9bf8',
                fontSize: 'clamp(18px, 3.5vw, 28px)',
                fontWeight: 900,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textShadow: '0 2px 8px rgba(59,130,246,0.4)',
                fontFamily: 'Georgia, serif',
              }}>PLAYER</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, letterSpacing: 1, marginTop: -4 }}>Pays 1 to 1</div>

              {/* Bet chips */}
              <ChipStack amount={combinedBets.player ?? 0} />

              {/* Card hand */}
              <CardHand label="PLAYER" hand={playerHand}
                total={playerHand.length > 0 ? pTotal : null} winner={playerWon} />
            </div>

            {/* TIE zone — narrow center strip */}
            <div className="main-zone flex flex-col items-center justify-center gap-1 py-2"
              style={{
                width: 56,
                flexShrink: 0,
                borderLeft: zoneBorder,
                borderRight: zoneBorder,
                cursor: betDisabled ? 'not-allowed' : 'pointer',
              }}
              onClick={() => !betDisabled && dispatch({ type: 'PLACE_BET', zone: 'tie' })}>

              <div style={{
                color: '#4ade80',
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: 2,
                textTransform: 'uppercase',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                textShadow: '0 0 8px rgba(74,222,128,0.4)',
              }}>TIE</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, textAlign: 'center', lineHeight: 1.3 }}>9:1</div>
              <ChipStack amount={combinedBets.tie ?? 0} />

              {result?.outcome.winner === 'tie' && (
                <div style={{ color: '#4ade80', fontSize: 10, fontWeight: 900, border: '1px solid #4ade80', borderRadius: 4, padding: '2px 4px' }}>
                  WIN
                </div>
              )}
            </div>

            {/* BANKER zone — right half */}
            <div className="main-zone flex flex-col items-center justify-between py-2 px-2 flex-1"
              style={{
                borderLeft: zoneBorder,
                cursor: betDisabled ? 'not-allowed' : 'pointer',
                opacity: betDisabled && !bankerHand.length ? 0.6 : 1,
              }}
              onClick={() => !betDisabled && dispatch({ type: 'PLACE_BET', zone: 'banker' })}>

              <div style={{
                color: '#f87171',
                fontSize: 'clamp(18px, 3.5vw, 28px)',
                fontWeight: 900,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textShadow: '0 2px 8px rgba(239,68,68,0.4)',
                fontFamily: 'Georgia, serif',
              }}>BANKER</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, letterSpacing: 1, marginTop: -4 }}>Pays 1 to 1</div>

              <ChipStack amount={combinedBets.banker ?? 0} />

              <CardHand label="BANKER" hand={bankerHand}
                total={bankerHand.length > 0 ? bTotal : null} winner={bankerWon} />
            </div>
          </div>

          {/* Divider before dealer controls */}
          <div style={{ height: 1, background: 'rgba(0,0,0,0.3)' }} />

          {/* Dealer action bar — hit/stand + feedback */}
          <div className="flex flex-col items-center gap-1.5 py-1.5 px-4" style={{ minHeight: 52 }}>
            {feedback && (
              <div style={{
                background: 'rgba(180,30,30,0.25)',
                border: '1px solid rgba(248,113,113,0.5)',
                borderRadius: 6,
                padding: '4px 12px',
                color: '#fca5a5',
                fontSize: 11,
                fontWeight: 700,
                textAlign: 'center',
              }}>
                {feedback}
              </div>
            )}

            {phase === 'player-turn' && (
              <HitStandControls which="player" total={pTotal}
                onHit={() => { setFeedback(getPlayerWrongReason(pTotal, true) || null); dispatch({ type: 'PLAYER_HIT' }); }}
                onStand={() => { setFeedback(getPlayerWrongReason(pTotal, false) || null); dispatch({ type: 'PLAYER_STAND' }); }}
              />
            )}
            {phase === 'banker-turn' && (
              <HitStandControls which="banker" total={bTotal}
                onHit={() => { setFeedback(getBankerWrongReason(bTotal, playerThirdCard, true) || null); dispatch({ type: 'BANKER_HIT' }); }}
                onStand={() => { setFeedback(getBankerWrongReason(bTotal, playerThirdCard, false) || null); dispatch({ type: 'BANKER_STAND' }); }}
              />
            )}

            {result && phase === 'result' && (
              <ResultBanner
                result={result}
                onNext={() => { setFeedback(null); dispatch({ type: 'NEXT_ROUND' }); }}
                onRebet={() => { setFeedback(null); dispatch({ type: 'NEXT_ROUND' }); dispatch({ type: 'REBET' }); }}
              />
            )}
          </div>

        </div>
      </div>

      {/* Dealer chip tray */}
      <StatsBar phase={phase} totalBets={totalBets} shoeCount={shoe.length} canDeal={canDeal}
        selectedChip={selectedChip}
        onSelectChip={chip => dispatch({ type: 'SELECT_CHIP', chip })}
        onDeal={() => dispatch({ type: 'DEAL' })} />
    </div>
  );
}
