'use client';
import { BetKey } from '../lib/types';
import { CHIP_DEFS } from './ChipTray';

/** Break a dollar amount into the largest chip denominations, max 10 chips shown */
function amountToChips(amount: number): { value: number; color: string; rim: string; text: string }[] {
  const chips: typeof CHIP_DEFS = [];
  let remaining = amount;
  for (const def of [...CHIP_DEFS].reverse()) { // 500 down to 5
    while (remaining >= def.value && chips.length < 10) {
      chips.push(def);
      remaining -= def.value;
    }
  }
  return chips;
}

const CHIP_SIZE  = 34;  // px diameter
const CHIP_STEP  = 7;   // px vertical offset per chip in stack

interface Props {
  zone: BetKey;
  label: string;
  payout: string;
  betAmount: number;
  disabled: boolean;
  accent?: string;
  onClick: (zone: BetKey) => void;
}

export default function BettingZone({ zone, label, payout, betAmount, disabled, accent, onClick }: Props) {
  const chips = amountToChips(betAmount);
  const stackH = chips.length > 0 ? CHIP_SIZE + (chips.length - 1) * CHIP_STEP : 0;

  return (
    <div
      className="bet-zone relative flex flex-col items-center rounded-lg border select-none"
      style={{
        borderColor: 'rgba(255,255,255,0.18)',
        minHeight: 'clamp(70px, 12vw, 100px)',
        padding: '6px 6px 7px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        justifyContent: 'flex-end',
        touchAction: 'manipulation',
      }}
      onClick={() => !disabled && onClick(zone)}
    >
      {/* Chip stack — grows upward from centre of zone */}
      {chips.length > 0 && (
        <div style={{ position: 'relative', width: CHIP_SIZE, height: stackH, marginBottom: 4, flexShrink: 0 }}>
          {chips.map((chip, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                bottom: i * CHIP_STEP,
                left: 0,
                width: CHIP_SIZE,
                height: CHIP_SIZE,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${chip.rim}, ${chip.color})`,
                border: `2px solid ${chip.rim}`,
                boxShadow: `0 ${i === 0 ? 3 : 1}px ${i === 0 ? 6 : 2}px rgba(0,0,0,0.55)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: i,
              }}
            >
              {/* Dashed inner ring */}
              <div style={{
                position: 'absolute',
                inset: 3,
                borderRadius: '50%',
                border: '1px dashed rgba(255,255,255,0.4)',
                pointerEvents: 'none',
              }} />
              {/* Value — only show on top chip */}
              {i === chips.length - 1 && (
                <span style={{
                  color: chip.text,
                  fontSize: chip.value >= 100 ? 7 : 8,
                  fontWeight: 900,
                  fontFamily: 'Georgia, serif',
                  position: 'relative',
                  zIndex: 1,
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                }}>
                  ${chip.value}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Total badge */}
      {betAmount > 0 && (
        <div style={{
          background: 'rgba(0,0,0,0.75)',
          color: '#e8c86a',
          borderRadius: 4,
          padding: '1px 5px',
          fontSize: 10,
          fontWeight: 800,
          marginBottom: 3,
          letterSpacing: 0.3,
        }}>
          ${betAmount}
        </div>
      )}

      {/* Zone label */}
      <div style={{
        color: accent ?? '#f5f0e8',
        fontSize: 11,
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        textAlign: 'center',
        lineHeight: 1.2,
        textShadow: `0 0 10px ${accent ?? 'rgba(255,255,255,0.3)'}55`,
      }}>
        {label}
      </div>

      {/* Payout */}
      <div style={{
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        marginTop: 2,
        letterSpacing: 0.5,
        fontFamily: 'Georgia, serif',
      }}>
        {payout}
      </div>
    </div>
  );
}
