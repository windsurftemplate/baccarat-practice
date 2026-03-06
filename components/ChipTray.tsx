'use client';

/** Shared chip definitions — used by both the tray and the betting-zone stack */
export const CHIP_DEFS = [
  { value: 5,   color: '#c0392b', rim: '#e74c3c',  label: '5',   text: '#fff'    },
  { value: 10,  color: '#1a5fa8', rim: '#2980b9',  label: '10',  text: '#fff'    },
  { value: 25,  color: '#1a7a3a', rim: '#27ae60',  label: '25',  text: '#fff'    },
  { value: 50,  color: '#6b21a8', rim: '#9333ea',  label: '50',  text: '#fff'    },
  { value: 100, color: '#1f2937', rim: '#4b5563',  label: '100', text: '#e8c86a' },
  { value: 500, color: '#92400e', rim: '#b8860b',  label: '500', text: '#fde68a' },
];

interface Props {
  selected: number;
  onSelect: (value: number) => void;
}

export default function ChipTray({ selected, onSelect }: Props) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      gap: 'clamp(4px, 1.5vw, 10px)',
      padding: '6px clamp(4px, 2vw, 12px) 10px',
    }}>
      {CHIP_DEFS.map(chip => {
        const active = selected === chip.value;
        const size = 'clamp(42px, 8vw, 54px)';
        return (
          <button
            key={chip.value}
            onClick={() => onSelect(chip.value)}
            title={`$${chip.value}`}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${chip.rim}, ${chip.color})`,
              border: active ? '3px solid #e8c86a' : `3px solid ${chip.rim}`,
              boxShadow: active
                ? `0 0 0 2px #e8c86a, 0 0 18px rgba(232,200,106,0.75), 0 5px 10px rgba(0,0,0,0.7)`
                : `0 4px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)`,
              cursor: 'pointer',
              transform: active ? 'translateY(-7px) scale(1.15)' : 'scale(1)',
              transition: 'all 0.15s ease',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              touchAction: 'manipulation',
            }}
          >
            {/* Dashed inner ring */}
            <div style={{
              position: 'absolute',
              inset: 5,
              borderRadius: '50%',
              border: '1.5px dashed rgba(255,255,255,0.4)',
              pointerEvents: 'none',
            }} />
            {/* Value label */}
            <span style={{
              color: chip.text,
              fontSize: chip.value >= 100 ? 'clamp(9px, 1.5vw, 11px)' : 'clamp(10px, 1.8vw, 13px)',
              fontWeight: 900,
              fontFamily: 'Georgia, serif',
              letterSpacing: -0.5,
              position: 'relative',
              zIndex: 1,
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            }}>
              ${chip.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
