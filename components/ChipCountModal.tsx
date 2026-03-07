'use client';
import { useState } from 'react';
import { CHIP_DEFS } from './ChipTray';
import { TablePlayer } from '../lib/types';

const RACK_SIZE  = 100; // 5 rows × 20 chips
const STACK_SIZE = 20;

interface Props {
  player: TablePlayer;
  onConfirm: (balance: number) => void;
  onClose: () => void;
}

type Counts = Record<number, { racks: number; stacks: number }>;

export default function ChipCountModal({ player, onConfirm, onClose }: Props) {
  const [counts, setCounts] = useState<Counts>(() =>
    Object.fromEntries(CHIP_DEFS.map(c => [c.value, { racks: 0, stacks: 0 }]))
  );

  function set(denom: number, field: 'racks' | 'stacks', raw: string) {
    const n = Math.max(0, parseInt(raw) || 0);
    setCounts(prev => ({ ...prev, [denom]: { ...prev[denom], [field]: n } }));
  }

  const rows = CHIP_DEFS.map(chip => {
    const { racks, stacks } = counts[chip.value];
    const chips = racks * RACK_SIZE + stacks * STACK_SIZE;
    const value = chips * chip.value;
    return { ...chip, racks, stacks, chips, value };
  });

  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#111720',
          border: '2px solid #7a1826',
          borderRadius: 16,
          padding: 20,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 0 60px rgba(0,0,0,0.9)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ color: '#e8c86a', fontSize: 15, fontWeight: 900, fontFamily: 'Georgia, serif' }}>
              Chip Count
            </div>
            <div style={{ color: player.color, fontSize: 11, fontWeight: 700, marginTop: 2 }}>
              {player.name}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Column labels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr 1fr 70px',
          gap: 6,
          marginBottom: 6,
          paddingBottom: 6,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={labelStyle}>Chip</div>
          <div style={{ ...labelStyle, textAlign: 'center' }}>Racks<br /><span style={{ fontWeight: 400, opacity: 0.6 }}>(×100)</span></div>
          <div style={{ ...labelStyle, textAlign: 'center' }}>Stacks<br /><span style={{ fontWeight: 400, opacity: 0.6 }}>(×20)</span></div>
          <div style={{ ...labelStyle, textAlign: 'right' }}>Value</div>
        </div>

        {/* Denomination rows */}
        {rows.map(chip => (
          <div
            key={chip.value}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 1fr 70px',
              gap: 6,
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            {/* Chip swatch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: `radial-gradient(circle at 35% 35%, ${chip.rim}, ${chip.color})`,
                border: `2px solid ${chip.rim}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: chip.text, fontSize: 8, fontWeight: 900 }}>${chip.label}</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>×{chip.chips || 0}</span>
            </div>

            {/* Racks input */}
            <input
              type="number"
              min={0}
              value={chip.racks || ''}
              placeholder="0"
              onChange={e => set(chip.value, 'racks', e.target.value)}
              style={inputStyle}
            />

            {/* Stacks input */}
            <input
              type="number"
              min={0}
              value={chip.stacks || ''}
              placeholder="0"
              onChange={e => set(chip.value, 'stacks', e.target.value)}
              style={inputStyle}
            />

            {/* Row value */}
            <div style={{
              textAlign: 'right',
              color: chip.value > 0 && chip.chips > 0 ? '#e8c86a' : 'rgba(255,255,255,0.2)',
              fontSize: 12, fontWeight: 700,
            }}>
              {chip.chips > 0 ? `$${chip.value.toLocaleString()}` : '—'}
            </div>
          </div>
        ))}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700 }}>TOTAL</span>
          <span style={{ color: '#e8c86a', fontSize: 22, fontWeight: 900, fontFamily: 'Georgia, serif' }}>
            ${total.toLocaleString()}
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(total); onClose(); }}
            disabled={total === 0}
            style={{
              flex: 2, padding: '10px 0', borderRadius: 8,
              background: total > 0 ? '#7a1826' : 'rgba(122,24,38,0.3)',
              border: '1px solid rgba(200,80,100,0.4)',
              color: total > 0 ? '#e8c86a' : 'rgba(232,200,106,0.3)',
              fontSize: 13, fontWeight: 900, cursor: total > 0 ? 'pointer' : 'default',
              fontFamily: 'Georgia, serif', letterSpacing: '0.05em',
              transition: 'all 0.15s',
            }}
          >
            Set Balance ${total.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.35)',
  fontSize: 9,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 6,
  color: '#fff',
  fontSize: 14,
  fontWeight: 700,
  padding: '6px 8px',
  width: '100%',
  textAlign: 'center',
  outline: 'none',
  boxSizing: 'border-box',
};
