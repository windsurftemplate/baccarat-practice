'use client';

interface Props {
  which: 'player' | 'banker';
  total: number;
  onHit: () => void;
  onStand: () => void;
}

export default function HitStandControls({ which, total, onHit, onStand }: Props) {
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-xl px-4 py-3"
      style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(200,164,74,0.4)' }}
    >
      <div className="text-xs uppercase tracking-widest font-bold" style={{ color: '#c8a44a' }}>
        {which === 'player' ? 'Player Hand' : 'Banker Hand'} — Total: {total}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onHit}
          className="px-5 py-2 rounded-lg font-black text-sm uppercase tracking-wider transition-transform active:scale-95"
          style={{
            background: '#16a34a',
            color: '#fff',
            boxShadow: '0 0 10px rgba(22,163,74,0.5)',
            border: '1px solid #4ade80',
            touchAction: 'manipulation',
            minWidth: 80,
          }}
        >
          HIT
        </button>
        <button
          onClick={onStand}
          className="px-5 py-2 rounded-lg font-black text-sm uppercase tracking-wider transition-transform active:scale-95"
          style={{
            background: '#dc2626',
            color: '#fff',
            boxShadow: '0 0 10px rgba(220,38,38,0.5)',
            border: '1px solid #f87171',
            touchAction: 'manipulation',
            minWidth: 80,
          }}
        >
          STAND
        </button>
      </div>
    </div>
  );
}
