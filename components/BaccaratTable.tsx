'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { GameState, Action, BetKey, TablePlayer } from '../lib/types';
import { totalBetAmount, handTotal, playerShouldDraw, bankerShouldDraw } from '../lib/baccarat';
import { CHIP_DEFS } from './ChipTray';
import CardHand from './CardHand';
import HitStandControls from './HitStandControls';
import ResultBanner from './ResultBanner';
import Scorecard from './Scorecard';
import StatsBar from './StatsBar';
import BettingZone from './BettingZone';
import ChipCountModal from './ChipCountModal';

interface Props {
  state: GameState;
  dispatch: (action: Action) => void;
}

const SIDE_ZONES: { zone: BetKey; label: string; payout: string; accent?: string }[] = [
  { zone: 'jade8', label: 'Panda 8', payout: '25:1', accent: '#10b981' },
  { zone: 'ruby',  label: 'Ruby',    payout: '10/75:1', accent: '#f43f5e' },
  { zone: 'gold7', label: 'Dragon 7', payout: '40:1', accent: '#a855f7' },
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

const SPOT_SIZE = 48;
const CHIP_STEP  = 6;

// Compact stacked card-back shoe
function ShoeVisual({ count }: { count: number }) {
  const visible = Math.min(4, Math.ceil(count / 52));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ position: 'relative', width: 28, height: 36 }}>
        {Array.from({ length: visible }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            bottom: i * 3,
            left: i * 0.5,
            width: 26,
            height: 34,
            borderRadius: 3,
            background: '#1a3a8c',
            border: '1px solid #c8a44a',
            backgroundImage: 'repeating-linear-gradient(45deg, #1e45a0 0, #1e45a0 1px, transparent 0, transparent 50%)',
            backgroundSize: '4px 4px',
            boxShadow: '1px 2px 4px rgba(0,0,0,0.6)',
          }} />
        ))}
      </div>
      <div style={{ color: 'rgba(232,200,106,0.55)', fontSize: 8, fontWeight: 700, letterSpacing: 0.5 }}>
        {count}
      </div>
    </div>
  );
}

/** Individual betting spot — one per seat × zone */
function BetSpot({
  player, zone, label, color, betAmount, isBetting, canAfford, dispatch,
}: {
  player: TablePlayer; zone: BetKey; label: string; color: string;
  betAmount: number; isBetting: boolean; canAfford: boolean;
  dispatch: (a: Action) => void;
}) {
  const prevRef  = useRef(betAmount);
  const [chipKey, setChipKey] = useState(0);

  useEffect(() => {
    if (betAmount > prevRef.current) setChipKey(k => k + 1);
    prevRef.current = betAmount;
  }, [betAmount]);

  const chips   = amountToChips(betAmount);
  const hasBet  = betAmount > 0;
  const disabled = !isBetting || !canAfford;
  const stackH  = hasBet ? SPOT_SIZE + (chips.length - 1) * CHIP_STEP : SPOT_SIZE;

  return (
    <div
      className="bet-spot"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-end',
        cursor: disabled ? (hasBet ? 'default' : 'not-allowed') : 'pointer',
        touchAction: 'manipulation',
        opacity: disabled && !hasBet ? 0.38 : 1,
        transition: 'opacity 0.15s, transform 0.12s',
        minWidth: SPOT_SIZE,
        userSelect: 'none',
        padding: '2px 0',
      }}
      onClick={() => isBetting && !disabled && dispatch({ type: 'PLACE_BET', zone, playerId: player.id })}
    >
      {/* Chip stack or empty circle */}
      <div style={{ position: 'relative', width: SPOT_SIZE, height: stackH }}>
        {hasBet ? chips.map((chip, i) => (
          <div
            key={i === chips.length - 1 ? `top-${chipKey}` : i}
            style={{
              position: 'absolute',
              bottom: i * CHIP_STEP,
              left: 0,
              width: SPOT_SIZE,
              height: SPOT_SIZE,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${chip.rim}, ${chip.color})`,
              border: `2px solid ${chip.rim}`,
              boxShadow: `0 ${i === 0 ? 4 : 1}px ${i === 0 ? 8 : 3}px rgba(0,0,0,0.65)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: i,
              animation: i === chips.length - 1
                ? 'chipLand 0.48s cubic-bezier(0.34, 1.56, 0.64, 1) both'
                : 'none',
            }}
          >
            <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.38)', pointerEvents: 'none' }} />
            {i === chips.length - 1 && (
              <span style={{ fontSize: 9, fontWeight: 900, color: chip.text, position: 'relative', zIndex: 1, textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
                ${chip.value}
              </span>
            )}
          </div>
        )) : (
          // Empty circle
          <div
            className="bet-spot-ring"
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `2px dashed ${color}44`,
              background: `${color}07`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, color: `${color}70`, letterSpacing: 0.5 }}>{label}</span>
          </div>
        )}
      </div>

      {/* Dollar total badge */}
      {hasBet && (
        <div style={{
          marginTop: 2,
          background: 'rgba(0,0,0,0.8)',
          color: '#e8c86a',
          borderRadius: 3,
          padding: '1px 5px',
          fontSize: 9, fontWeight: 900, letterSpacing: 0.3,
        }}>
          ${betAmount}
        </div>
      )}
    </div>
  );
}

function getPlayerWrongReason(total: number, hit: boolean): string {
  if (hit && !playerShouldDraw(total)) return `Wrong: Player ${total} — stand on 6 or 7.`;
  if (!hit && playerShouldDraw(total))  return `Wrong: Player ${total} — draw on 0–5.`;
  return '';
}

function getBankerWrongReason(bTotal: number, p3: import('../lib/types').Card | null, hit: boolean): string {
  const should = bankerShouldDraw(bTotal, p3);
  if (hit === should) return '';
  if (!p3) {
    return hit
      ? `Wrong: Banker ${bTotal} — no player 3rd card, stand on 6–7.`
      : `Wrong: Banker ${bTotal} — no player 3rd card, draw on 0–5.`;
  }
  const v = p3.value;
  const rules: Record<number, string> = {
    0: 'Banker draws on 0–2.',      1: 'Banker draws on 0–2.',
    2: 'Banker draws on 0–2.',      3: `Draw unless player 3rd=8 (was ${v}).`,
    4: `Draw on 4 when player 3rd=2–7 (was ${v}).`,
    5: `Draw on 5 when player 3rd=4–7 (was ${v}).`,
    6: `Draw on 6 when player 3rd=6–7 (was ${v}).`,
    7: 'Banker stands on 7.',
  };
  return hit
    ? `Wrong: Banker should stand. ${rules[bTotal] ?? ''}`
    : `Wrong: Banker should draw. ${rules[bTotal] ?? ''}`;
}

export default function BaccaratTable({ state, dispatch }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [chipCountPlayer, setChipCountPlayer] = useState<TablePlayer | null>(null);

  const { phase, selectedChip, players, playerHand, bankerHand, result, history, shoe } = state;

  const isBetting = phase === 'betting';
  const totalBets = players.reduce((s, p) => s + totalBetAmount(p.bets), 0);
  const canDeal   = isBetting && totalBets > 0;

  const combinedBets = players.reduce((acc, p) => {
    (Object.keys(p.bets) as BetKey[]).forEach(k => { acc[k] = (acc[k] ?? 0) + p.bets[k]; });
    return acc;
  }, {} as Record<BetKey, number>);

  const pTotal = playerHand.length > 0 ? handTotal(playerHand) : 0;
  const bTotal = bankerHand.length > 0 ? handTotal(bankerHand) : 0;
  const playerThird = playerHand.length === 3 ? playerHand[2] : null;

  const playerWon = result?.outcome.winner === 'player';
  const bankerWon = result?.outcome.winner === 'banker';
  const tieWon    = result?.outcome.winner === 'tie';
  const hasResult = phase === 'result';

  const colBorder = '1px solid rgba(255,255,255,0.12)';

  return (
    <div className="flex flex-col" style={{ background: '#080c10', height: '100dvh', minHeight: '100dvh' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.7)', borderBottom: '2px solid #7a1826' }}>
        <div style={{ width: 80 }} />
        <div className="text-xs font-bold tracking-widest uppercase"
          style={{ color: '#e8c86a', letterSpacing: '0.2em' }}>
          ♦ Baccarat Practice ♦
        </div>
        <Link href="/practice" className="font-bold uppercase tracking-wider rounded"
          style={{ color: '#e8c86a', border: '2px solid rgba(200,80,100,0.6)', background: 'rgba(122,24,38,0.4)', width: 90, textAlign: 'center', display: 'block', fontSize: 15, padding: '7px 0' }}>
          Practice
        </Link>
      </div>

      {/* ── Felt table ── */}
      <div className="flex-1 flex flex-col felt px-2 pt-1.5 pb-1.5 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden min-h-0 relative"
          style={{ border: '3px solid #5a1020', boxShadow: '0 0 0 1px rgba(255,200,100,0.08), 0 0 60px rgba(0,0,0,0.5) inset' }}>

          {/* SVG table background */}
          <img src="/baccarat-table-layout.svg" alt="" aria-hidden="true"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center 60%',
              opacity: 0.12, pointerEvents: 'none', userSelect: 'none',
            }}
          />

          {/* Shoe — absolute top-right corner */}
          <div style={{ position: 'absolute', top: 10, right: 12, zIndex: 20 }}>
            <ShoeVisual count={shoe.length} />
          </div>

          {/* Scorecard */}
          <Scorecard history={history} />

          {/* Side bets */}
          <div className="grid grid-cols-3 gap-1 px-2 pb-1" style={{ position: 'relative', zIndex: 1 }}>
            {SIDE_ZONES.map(z => (
              <BettingZone
                key={z.zone} zone={z.zone} label={z.label} payout={z.payout} accent={z.accent}
                betAmount={combinedBets[z.zone] ?? 0}
                disabled={!isBetting || players.every(p => p.balance - totalBetAmount(p.bets) < selectedChip)}
                onClick={zone => {
                  const target = players.find(p => totalBetAmount(p.bets) > 0) ?? players[0];
                  if (target) dispatch({ type: 'PLACE_BET', zone, playerId: target.id });
                }}
              />
            ))}
          </div>

          {/* Gold divider */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #7a1826 20%, #7a1826 80%, transparent)', position: 'relative', zIndex: 1 }} />

          {/* ── Column headers: PLAYER | TIE | BANKER ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 58px 1fr',
            position: 'relative', zIndex: 1,
            borderBottom: colBorder,
          }}>

            {/* PLAYER header */}
            <div
              className={hasResult && playerWon ? 'winner-glow' : ''}
              style={{
                '--glow': 'rgba(59,130,246,0.7)',
                padding: '8px 8px 6px',
                borderRight: colBorder,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                transition: 'background 0.4s',
                background: hasResult && playerWon ? 'rgba(37,99,235,0.12)' : 'transparent',
                borderRadius: '12px 0 0 0',
              } as React.CSSProperties}
            >
              <div style={{
                color: '#5b9bf8', fontSize: 'clamp(12px, 2.5vw, 17px)', fontWeight: 900,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                textShadow: hasResult && playerWon
                  ? '0 0 20px rgba(59,130,246,0.9), 0 2px 8px rgba(59,130,246,0.5)'
                  : '0 1px 6px rgba(59,130,246,0.3)',
                fontFamily: 'Georgia, serif',
                animation: isBetting ? 'tableBreath 3s ease-in-out infinite' : 'none',
              }}>PLAYER</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, letterSpacing: 1 }}>Pays 1:1</div>
              {playerHand.length > 0 && (
                <CardHand label="PLAYER" hand={playerHand} total={pTotal} winner={playerWon} startDelay={0} />
              )}
            </div>

            {/* TIE header */}
            <div
              className={hasResult && tieWon ? 'winner-glow' : ''}
              style={{
                '--glow': 'rgba(74,222,128,0.7)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center',
                borderLeft: colBorder, borderRight: colBorder,
                padding: '6px 4px',
                background: hasResult && tieWon ? 'rgba(22,163,74,0.12)' : 'transparent',
                gap: 6,
              } as React.CSSProperties}
            >
              <div style={{
                color: '#4ade80', fontSize: 10, fontWeight: 900, letterSpacing: 2,
                textTransform: 'uppercase', writingMode: 'vertical-rl',
                textShadow: hasResult && tieWon ? '0 0 16px rgba(74,222,128,0.9)' : '0 0 8px rgba(74,222,128,0.3)',
              }}>TIE</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'center' }}>9:1</div>
              {/* Shoe visual in TIE header */}
              {playerHand.length === 0 && <ShoeVisual count={shoe.length} />}
              {hasResult && tieWon && (
                <div style={{ color: '#4ade80', fontSize: 9, fontWeight: 900, border: '1px solid #4ade80', borderRadius: 3, padding: '1px 4px' }}>WIN</div>
              )}
            </div>

            {/* BANKER header */}
            <div
              className={hasResult && bankerWon ? 'winner-glow' : ''}
              style={{
                '--glow': 'rgba(239,68,68,0.7)',
                padding: '8px 8px 6px',
                borderLeft: colBorder,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                transition: 'background 0.4s',
                background: hasResult && bankerWon ? 'rgba(220,38,38,0.12)' : 'transparent',
                borderRadius: '0 12px 0 0',
              } as React.CSSProperties}
            >
              <div style={{
                color: '#f87171', fontSize: 'clamp(12px, 2.5vw, 17px)', fontWeight: 900,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                textShadow: hasResult && bankerWon
                  ? '0 0 20px rgba(239,68,68,0.9), 0 2px 8px rgba(239,68,68,0.5)'
                  : '0 1px 6px rgba(239,68,68,0.3)',
                fontFamily: 'Georgia, serif',
                animation: isBetting ? 'tableBreath 3s ease-in-out infinite 1.5s' : 'none',
              }}>BANKER</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, letterSpacing: 1 }}>Pays 1:1</div>
              {bankerHand.length > 0 && (
                <CardHand label="BANKER" hand={bankerHand} total={bTotal} winner={bankerWon} startDelay={200} />
              )}
            </div>
          </div>

          {/* ── SEAT ROWS ── */}
          <div className="flex-1 overflow-y-auto min-h-0" style={{ position: 'relative', zIndex: 1 }}>
            {players.map((player, i) => {
              const canAfford = player.balance - totalBetAmount(player.bets) >= selectedChip;
              const hasBets   = totalBetAmount(player.bets) > 0;
              const isWinner  = hasResult && result?.playerResults.some(r => r.playerId === player.id && r.netChange > 0);
              const isLoser   = hasResult && result?.playerResults.some(r => r.playerId === player.id && r.netChange < 0);

              return (
                <div
                  key={player.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 58px 1fr',
                    borderBottom: i < players.length - 1 ? colBorder : 'none',
                    transition: 'background 0.3s',
                    background: isWinner
                      ? `${player.color}12`
                      : isLoser
                      ? 'rgba(200,30,30,0.07)'
                      : hasBets
                      ? `${player.color}07`
                      : 'transparent',
                  }}
                >
                  {/* PLAYER bet column */}
                  <div style={{
                    borderRight: colBorder,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    gap: 6,
                  }}>
                    {/* Seat info */}
                    <SeatInfo
                      player={player} position={i + 1}
                      isBetting={isBetting} hasBets={hasBets} isWinner={isWinner} isLoser={isLoser}
                      dispatch={dispatch} showRemove={players.length > 1}
                      onChipCount={() => setChipCountPlayer(player)}
                    />
                    {/* Player bet circle */}
                    <BetSpot player={player} zone="player" label="P" color="#5b9bf8"
                      betAmount={player.bets.player} isBetting={isBetting}
                      canAfford={canAfford} dispatch={dispatch} />
                  </div>

                  {/* TIE bet column */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderLeft: colBorder, borderRight: colBorder,
                    padding: '8px 4px',
                  }}>
                    <BetSpot player={player} zone="tie" label="T" color="#4ade80"
                      betAmount={player.bets.tie} isBetting={isBetting}
                      canAfford={canAfford} dispatch={dispatch} />
                  </div>

                  {/* BANKER bet column */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    gap: 6,
                  }}>
                    {/* Banker bet circle */}
                    <BetSpot player={player} zone="banker" label="B" color="#f87171"
                      betAmount={player.bets.banker} isBetting={isBetting}
                      canAfford={canAfford} dispatch={dispatch} />
                    {/* Seat number mirror on right */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `radial-gradient(circle at 40% 35%, ${player.color}cc, ${player.color}55)`,
                      border: `1.5px solid ${player.color}88`,
                      boxShadow: isWinner ? `0 0 10px ${player.color}` : `0 2px 4px rgba(0,0,0,0.5)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 900, color: '#000', flexShrink: 0,
                      transition: 'box-shadow 0.3s',
                    }}>{i + 1}</div>
                  </div>
                </div>
              );
            })}

            {/* Add seat button */}
            {isBetting && players.length < 6 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
                <button
                  style={{
                    background: 'transparent',
                    border: '2px dashed rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    color: 'rgba(255,255,255,0.28)',
                    fontSize: 12, padding: '5px 18px',
                    cursor: 'pointer', touchAction: 'manipulation',
                    display: 'flex', alignItems: 'center', gap: 5,
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onClick={() => dispatch({ type: 'ADD_PLAYER' })}
                >
                  <span style={{ fontSize: 16 }}>+</span> Add Seat
                </button>
              </div>
            )}
          </div>

          {/* ── Dealer action bar ── */}
          <div
            className="flex flex-col items-center gap-1.5 py-1.5 px-4"
            style={{ minHeight: 48, position: 'relative', zIndex: 1, borderTop: '1px solid rgba(0,0,0,0.4)' }}
          >
            {feedback && (
              <div style={{
                background: 'rgba(180,30,30,0.22)', border: '1px solid rgba(248,113,113,0.45)',
                borderRadius: 6, padding: '4px 12px', color: '#fca5a5', fontSize: 11, fontWeight: 700, textAlign: 'center',
              }}>
                {feedback}
              </div>
            )}

            {phase === 'player-turn' && (
              <HitStandControls which="player" total={pTotal}
                onHit={()   => { setFeedback(getPlayerWrongReason(pTotal, true)  || null); dispatch({ type: 'PLAYER_HIT' }); }}
                onStand={()  => { setFeedback(getPlayerWrongReason(pTotal, false) || null); dispatch({ type: 'PLAYER_STAND' }); }}
              />
            )}
            {phase === 'banker-turn' && (
              <HitStandControls which="banker" total={bTotal}
                onHit={()   => { setFeedback(getBankerWrongReason(bTotal, playerThird, true)  || null); dispatch({ type: 'BANKER_HIT' }); }}
                onStand={()  => { setFeedback(getBankerWrongReason(bTotal, playerThird, false) || null); dispatch({ type: 'BANKER_STAND' }); }}
              />
            )}

            {result && phase === 'result' && (
              <ResultBanner
                result={result}
                onNext={()  => { setFeedback(null); dispatch({ type: 'NEXT_ROUND' }); }}
                onRebet={() => { setFeedback(null); dispatch({ type: 'NEXT_ROUND' }); dispatch({ type: 'REBET' }); }}
              />
            )}
          </div>

        </div>
      </div>

      {/* Chip count modal */}
      {chipCountPlayer && (
        <ChipCountModal
          player={chipCountPlayer}
          onConfirm={balance => dispatch({ type: 'SET_BALANCE', id: chipCountPlayer.id, balance })}
          onClose={() => setChipCountPlayer(null)}
        />
      )}

      {/* Chip tray + deal */}
      <StatsBar
        phase={phase} totalBets={totalBets} shoeCount={shoe.length}
        canDeal={canDeal} selectedChip={selectedChip}
        onSelectChip={chip => dispatch({ type: 'SELECT_CHIP', chip })}
        onDeal={() => dispatch({ type: 'DEAL' })}
      />
    </div>
  );
}

/** Seat label — left side of each row */
function SeatInfo({
  player, position, isBetting, hasBets, isWinner, isLoser, dispatch, showRemove, onChipCount,
}: {
  player: TablePlayer; position: number; isBetting: boolean;
  hasBets: boolean; isWinner: boolean | undefined; isLoser: boolean | undefined;
  dispatch: (a: Action) => void; showRemove: boolean;
  onChipCount: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, gap: 2 }}>
      {/* Seat circle */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: `radial-gradient(circle at 38% 33%, ${player.color}cc, ${player.color}55)`,
        border: `1.5px solid ${player.color}88`,
        boxShadow: isWinner ? `0 0 12px ${player.color}` : `0 2px 6px rgba(0,0,0,0.6)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 900, color: '#000', flexShrink: 0,
        transition: 'box-shadow 0.3s',
      }}>
        {position}
      </div>

      <div style={{ fontSize: 9, color: player.color, fontWeight: 700, maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {player.name}
      </div>

      <div
        onClick={e => { e.stopPropagation(); onChipCount(); }}
        title="Set balance by chip count"
        style={{
          fontSize: 8,
          color: isWinner ? '#4ade80' : isLoser ? '#f87171' : 'rgba(232,200,106,0.65)',
          fontWeight: 700,
          transition: 'color 0.3s',
          cursor: 'pointer',
          textDecoration: 'underline dotted',
          textUnderlineOffset: 2,
        }}
      >
        ${player.balance.toLocaleString()}
      </div>

      {isBetting && (
        <div style={{ display: 'flex', gap: 3, marginTop: 1 }}>
          <button
            style={{ fontSize: 8, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 3, padding: '2px 5px', cursor: 'pointer', touchAction: 'manipulation' }}
            onClick={e => { e.stopPropagation(); dispatch({ type: 'AUTOBET', id: player.id }); }}
          >Auto</button>
          {hasBets && (
            <button
              style={{ fontSize: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', border: 'none', borderRadius: 3, padding: '2px 5px', cursor: 'pointer', touchAction: 'manipulation' }}
              onClick={e => { e.stopPropagation(); dispatch({ type: 'CLEAR_PLAYER_BETS', id: player.id }); }}
            >Clear</button>
          )}
          {showRemove && (
            <button
              style={{ fontSize: 8, background: 'rgba(239,68,68,0.12)', color: 'rgba(239,68,68,0.6)', border: 'none', borderRadius: 3, padding: '2px 4px', cursor: 'pointer', touchAction: 'manipulation' }}
              onClick={e => { e.stopPropagation(); dispatch({ type: 'REMOVE_PLAYER', id: player.id }); }}
            >✕</button>
          )}
        </div>
      )}
    </div>
  );
}
