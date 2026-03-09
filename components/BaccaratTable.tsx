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
import ChipCountModal from './ChipCountModal';

interface Props {
  state: GameState;
  dispatch: (action: Action) => void;
}

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

const SPOT_SIZE = 40;
const CHIP_STEP = 5;

function ShoeVisual({ count }: { count: number }) {
  const visible = Math.min(4, Math.ceil(count / 52));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ position: 'relative', width: 28, height: 36 }}>
        {Array.from({ length: visible }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', bottom: i * 3, left: i * 0.5,
            width: 26, height: 34, borderRadius: 3,
            background: '#1a3a8c', border: '1px solid #c8a44a',
            backgroundImage: 'repeating-linear-gradient(45deg, #1e45a0 0, #1e45a0 1px, transparent 0, transparent 50%)',
            backgroundSize: '4px 4px', boxShadow: '1px 2px 4px rgba(0,0,0,0.6)',
          }} />
        ))}
      </div>
      <div style={{ color: 'rgba(232,200,106,0.55)', fontSize: 8, fontWeight: 700, letterSpacing: 0.5 }}>
        {count}
      </div>
    </div>
  );
}

/** Circular chip drop zone positioned absolutely over the SVG table image */
function TableSpot({
  player, zone, label, payout, color, betAmount, isBetting, canAfford, dispatch, left, top,
}: {
  player: TablePlayer; zone: BetKey; label: string; payout: string; color: string;
  betAmount: number; isBetting: boolean; canAfford: boolean;
  dispatch: (a: Action) => void;
  left: string; top: string;
}) {
  const prevRef = useRef(betAmount);
  const [chipKey, setChipKey] = useState(0);

  useEffect(() => {
    if (betAmount > prevRef.current) setChipKey(k => k + 1);
    prevRef.current = betAmount;
  }, [betAmount]);

  const chips = amountToChips(betAmount);
  const hasBet = betAmount > 0;
  const disabled = !isBetting || !canAfford;
  const stackH = SPOT_SIZE + (chips.length - 1) * CHIP_STEP;
  const CIRCLE_SIZE = 76;

  return (
    <div
      style={{
        position: 'absolute', left, top,
        transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        zIndex: 10,
      }}
    >
      <div
        onClick={() => !disabled && dispatch({ type: 'PLACE_BET', zone, playerId: player.id })}
        style={{
          width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: '50%',
          border: `2px solid ${hasBet ? color + 'cc' : color + '55'}`,
          background: hasBet ? `${color}1c` : 'rgba(0,0,0,0.38)',
          backdropFilter: 'blur(3px)',
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: disabled ? (hasBet ? 'default' : 'not-allowed') : 'pointer',
          opacity: disabled && !hasBet ? 0.4 : 1,
          transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
          userSelect: 'none', touchAction: 'manipulation',
          boxShadow: hasBet ? `0 0 18px ${color}44, inset 0 0 10px rgba(0,0,0,0.3)` : 'inset 0 0 10px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ position: 'relative', width: SPOT_SIZE, height: hasBet ? stackH : SPOT_SIZE }}>
          {hasBet ? chips.map((chip, i) => (
            <div
              key={i === chips.length - 1 ? `top-${chipKey}` : i}
              style={{
                position: 'absolute', bottom: i * CHIP_STEP, left: 0,
                width: SPOT_SIZE, height: SPOT_SIZE, borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${chip.rim}, ${chip.color})`,
                border: `2px solid ${chip.rim}`,
                boxShadow: `0 ${i === 0 ? 4 : 1}px ${i === 0 ? 8 : 3}px rgba(0,0,0,0.65)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: i,
                animation: i === chips.length - 1
                  ? 'chipLand 0.48s cubic-bezier(0.34, 1.56, 0.64, 1) both' : 'none',
              }}
            >
              <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.38)', pointerEvents: 'none' }} />
              {i === chips.length - 1 && (
                <span style={{ fontSize: 8, fontWeight: 900, color: chip.text, position: 'relative', zIndex: 1, textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
                  ${chip.value}
                </span>
              )}
            </div>
          )) : (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `1.5px dashed ${color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 20, color: `${color}70`, fontWeight: 300, lineHeight: 1 }}>+</span>
            </div>
          )}
        </div>
        {hasBet && (
          <div style={{
            position: 'absolute', bottom: 5,
            background: 'rgba(0,0,0,0.8)', color: '#e8c86a',
            borderRadius: 3, padding: '1px 4px', fontSize: 8, fontWeight: 900,
          }}>${betAmount}</div>
        )}
      </div>
      <div style={{
        marginTop: 4, fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: hasBet ? color : `${color}90`,
        textShadow: '0 1px 4px rgba(0,0,0,0.9)',
      }}>{label}</div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5 }}>{payout}</div>
    </div>
  );
}

/** Rectangular felt-zone for bonus bets in seat rows */
function FeltZone({
  player, zone, label, color, betAmount, isBetting, canAfford, dispatch,
}: {
  player: TablePlayer; zone: BetKey; label: string; color: string;
  betAmount: number; isBetting: boolean; canAfford: boolean;
  dispatch: (a: Action) => void;
}) {
  const prevRef = useRef(betAmount);
  const [chipKey, setChipKey] = useState(0);

  useEffect(() => {
    if (betAmount > prevRef.current) setChipKey(k => k + 1);
    prevRef.current = betAmount;
  }, [betAmount]);

  const chips = amountToChips(betAmount);
  const hasBet = betAmount > 0;
  const disabled = !isBetting || !canAfford;
  const stackH = SPOT_SIZE + (chips.length - 1) * CHIP_STEP;

  return (
    <div
      onClick={() => !disabled && dispatch({ type: 'PLACE_BET', zone, playerId: player.id })}
      style={{
        flex: 1, height: 72, borderRadius: 6,
        border: `2px solid ${hasBet ? color + 'bb' : color + '30'}`,
        background: hasBet ? `${color}1a` : 'rgba(0,0,0,0.28)',
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? (hasBet ? 'default' : 'not-allowed') : 'pointer',
        opacity: disabled && !hasBet ? 0.35 : 1,
        transition: 'border-color 0.15s, background 0.15s',
        userSelect: 'none', touchAction: 'manipulation', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 4, left: 0, right: 0, textAlign: 'center',
        fontSize: 9, fontWeight: 800, letterSpacing: 0.8,
        color: hasBet ? color : `${color}66`,
        textTransform: 'uppercase', transition: 'color 0.15s',
      }}>{label}</div>
      <div style={{ position: 'relative', width: SPOT_SIZE, height: hasBet ? stackH : SPOT_SIZE, marginTop: 8 }}>
        {hasBet ? chips.map((chip, i) => (
          <div
            key={i === chips.length - 1 ? `top-${chipKey}` : i}
            style={{
              position: 'absolute', bottom: i * CHIP_STEP, left: 0,
              width: SPOT_SIZE, height: SPOT_SIZE, borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${chip.rim}, ${chip.color})`,
              border: `2px solid ${chip.rim}`,
              boxShadow: `0 ${i === 0 ? 4 : 1}px ${i === 0 ? 8 : 3}px rgba(0,0,0,0.65)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: i,
              animation: i === chips.length - 1
                ? 'chipLand 0.48s cubic-bezier(0.34, 1.56, 0.64, 1) both' : 'none',
            }}
          >
            <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.38)', pointerEvents: 'none' }} />
            {i === chips.length - 1 && (
              <span style={{ fontSize: 8, fontWeight: 900, color: chip.text, position: 'relative', zIndex: 1, textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
                ${chip.value}
              </span>
            )}
          </div>
        )) : (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `1.5px dashed ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 14, color: `${color}50`, fontWeight: 300, lineHeight: 1 }}>+</span>
          </div>
        )}
      </div>
      {hasBet && (
        <div style={{
          position: 'absolute', bottom: 3,
          background: 'rgba(0,0,0,0.78)', color: '#e8c86a',
          borderRadius: 3, padding: '1px 5px', fontSize: 10, fontWeight: 900,
        }}>${betAmount}</div>
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

  const { phase, selectedChip, players, activePlayerId, playerHand, bankerHand, result, history, shoe } = state;

  const activePlayer = players.find(p => p.id === activePlayerId) ?? players[0];

  const isBetting = phase === 'betting';
  const totalBets = players.reduce((s, p) => s + totalBetAmount(p.bets), 0);
  const canDeal   = isBetting && totalBets > 0;

  const pTotal = playerHand.length > 0 ? handTotal(playerHand) : 0;
  const bTotal = bankerHand.length > 0 ? handTotal(bankerHand) : 0;
  const playerThird = playerHand.length === 3 ? playerHand[2] : null;

  const playerWon = result?.outcome.winner === 'player';
  const bankerWon = result?.outcome.winner === 'banker';
  const tieWon    = result?.outcome.winner === 'tie';
  const hasResult = phase === 'result';

  const canAfford = activePlayer
    ? activePlayer.balance - totalBetAmount(activePlayer.bets) >= selectedChip
    : false;

  const colBorder = '1px solid rgba(255,255,255,0.12)';

  const cardsDealt = playerHand.length > 0;

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
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden min-h-0"
          style={{ border: '3px solid #5a1020', boxShadow: '0 0 0 1px rgba(255,200,100,0.08), 0 0 60px rgba(0,0,0,0.5) inset' }}>

          {/* Scorecard */}
          <Scorecard history={history} />

          {/* Gold divider */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #7a1826 20%, #7a1826 80%, transparent)', flexShrink: 0 }} />

          {/* ── Table image with chip spots overlay ── */}
          <div
            style={{
              position: 'relative',
              height: 'clamp(170px, 26vh, 240px)',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {/* SVG table background */}
            <img
              src="/baccarat-table-layout.svg"
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center 42%',
                opacity: 0.38, pointerEvents: 'none', userSelect: 'none',
                transform: 'scaleY(-1)',
              }}
            />

            {/* Dark gradient at top and bottom edges to blend */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(to bottom, rgba(8,12,16,0.5) 0%, transparent 25%, transparent 75%, rgba(8,12,16,0.5) 100%)',
            }} />

            {/* Shoe — top-right */}
            <div style={{ position: 'absolute', top: 8, right: 10, zIndex: 20 }}>
              <ShoeVisual count={shoe.length} />
            </div>

            {/* Winner glow overlay */}
            {hasResult && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
                background: playerWon
                  ? 'radial-gradient(ellipse at 43% 58%, rgba(59,130,246,0.18) 0%, transparent 60%)'
                  : bankerWon
                  ? 'radial-gradient(ellipse at 57% 58%, rgba(239,68,68,0.18) 0%, transparent 60%)'
                  : tieWon
                  ? 'radial-gradient(ellipse at 50% 58%, rgba(74,222,128,0.18) 0%, transparent 60%)'
                  : 'none',
              }} />
            )}

            {/* ── Chip drop zones on the table ── */}
            {activePlayer && (
              <>
                {/* PLAYER spot — SVG coord ~43.9% left, 57.8% top (after scaleY flip) */}
                <TableSpot
                  player={activePlayer} zone="player"
                  label="Player" payout="1:1" color="#5b9bf8"
                  betAmount={activePlayer.bets.player}
                  isBetting={isBetting} canAfford={canAfford}
                  dispatch={dispatch}
                  left="43.9%" top="57.8%"
                />
                {/* TIE spot */}
                <TableSpot
                  player={activePlayer} zone="tie"
                  label="Tie" payout="9:1" color="#4ade80"
                  betAmount={activePlayer.bets.tie}
                  isBetting={isBetting} canAfford={canAfford}
                  dispatch={dispatch}
                  left="49.5%" top="57.8%"
                />
                {/* BANKER spot — SVG coord ~56.8% left */}
                <TableSpot
                  player={activePlayer} zone="banker"
                  label="Banker" payout="1:1" color="#f87171"
                  betAmount={activePlayer.bets.banker}
                  isBetting={isBetting} canAfford={canAfford}
                  dispatch={dispatch}
                  left="56.8%" top="57.8%"
                />
              </>
            )}
          </div>

          {/* ── Card hands strip ── */}
          {cardsDealt && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 12,
              padding: '8px 12px 6px',
              background: 'rgba(0,0,0,0.3)',
              borderTop: colBorder,
              borderBottom: colBorder,
              flexShrink: 0,
            }}>
              <div
                className={hasResult && playerWon ? 'winner-glow' : ''}
                style={{ '--glow': 'rgba(59,130,246,0.7)' } as React.CSSProperties}
              >
                <CardHand label="PLAYER" hand={playerHand} total={pTotal} winner={playerWon} startDelay={0} small />
              </div>
              <div
                className={hasResult && bankerWon ? 'winner-glow' : ''}
                style={{ '--glow': 'rgba(239,68,68,0.7)' } as React.CSSProperties}
              >
                <CardHand label="BANKER" hand={bankerHand} total={bTotal} winner={bankerWon} startDelay={200} small />
              </div>
            </div>
          )}

          {/* ── SEAT ROWS ── */}
          <div className="flex-1 overflow-y-auto min-h-0" style={{ position: 'relative', zIndex: 1 }}>
            {players.map((player, i) => {
              const hasBets   = totalBetAmount(player.bets) > 0;
              const isWinner  = hasResult && result?.playerResults.some(r => r.playerId === player.id && r.netChange > 0);
              const isLoser   = hasResult && result?.playerResults.some(r => r.playerId === player.id && r.netChange < 0);
              const isActive  = player.id === activePlayerId;

              return (
                <div
                  key={player.id}
                  onClick={() => dispatch({ type: 'SELECT_PLAYER', id: player.id })}
                  style={{
                    borderBottom: i < players.length - 1 ? colBorder : 'none',
                    padding: '7px 8px',
                    display: 'flex', flexDirection: 'column', gap: 5,
                    transition: 'background 0.3s',
                    animation: `seatIn 0.3s ease both`,
                    animationDelay: `${i * 60}ms`,
                    background: isWinner
                      ? `${player.color}12`
                      : isLoser ? 'rgba(200,30,30,0.07)'
                      : isActive ? 'rgba(255,255,255,0.04)'
                      : 'transparent',
                    outline: isActive ? `1px solid ${player.color}40` : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {/* ── Seat header ── */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: `radial-gradient(circle at 38% 33%, ${player.color}cc, ${player.color}55)`,
                      border: `2px solid ${player.color}88`,
                      boxShadow: isWinner ? `0 0 12px ${player.color}` : `0 1px 4px rgba(0,0,0,0.6)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 900, color: '#000', transition: 'box-shadow 0.3s',
                    }}>{i + 1}</div>

                    <div style={{ fontSize: 12, color: player.color, fontWeight: 700, maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {player.name}
                    </div>

                    <div
                      onClick={e => { e.stopPropagation(); setChipCountPlayer(player); }}
                      style={{
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        textDecoration: 'underline dotted', textUnderlineOffset: 2,
                        color: isWinner ? '#4ade80' : isLoser ? '#f87171' : 'rgba(232,200,106,0.65)',
                        transition: 'color 0.3s',
                      }}
                    >${player.balance.toLocaleString()}</div>

                    {isBetting && (
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                        <button
                          style={{ fontSize: 10, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 7px', cursor: 'pointer', touchAction: 'manipulation' }}
                          onClick={e => { e.stopPropagation(); dispatch({ type: 'AUTOBET', id: player.id }); }}
                        >Auto</button>
                        {hasBets && (
                          <button
                            style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: 4, padding: '3px 7px', cursor: 'pointer', touchAction: 'manipulation' }}
                            onClick={e => { e.stopPropagation(); dispatch({ type: 'CLEAR_PLAYER_BETS', id: player.id }); }}
                          >Clear</button>
                        )}
                        {players.length > 1 && (
                          <button
                            style={{ fontSize: 10, background: 'rgba(239,68,68,0.12)', color: 'rgba(239,68,68,0.65)', border: 'none', borderRadius: 4, padding: '3px 6px', cursor: 'pointer', touchAction: 'manipulation' }}
                            onClick={e => { e.stopPropagation(); dispatch({ type: 'REMOVE_PLAYER', id: player.id }); }}
                          >✕</button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Bonus bet zones ── */}
                  {isActive && (
                    <div className="zone-in" style={{ display: 'flex', gap: 4 }}>
                      <FeltZone player={player} zone="jade8" label="Panda 8  25:1" color="#10b981"
                        betAmount={player.bets.jade8} isBetting={isBetting} canAfford={canAfford} dispatch={dispatch} />
                      <FeltZone player={player} zone="ruby" label="Ruby  10/75:1" color="#f43f5e"
                        betAmount={player.bets.ruby} isBetting={isBetting} canAfford={canAfford} dispatch={dispatch} />
                      <FeltZone player={player} zone="gold7" label="Dragon 7  40:1" color="#a855f7"
                        betAmount={player.bets.gold7} isBetting={isBetting} canAfford={canAfford} dispatch={dispatch} />
                    </div>
                  )}
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
