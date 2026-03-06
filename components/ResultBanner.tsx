'use client';
import { RoundResult } from '../lib/types';

interface Props {
  result: RoundResult;
  onNext: () => void;
  onRebet: () => void;
}

const WINNER_STYLE = {
  banker: { label: 'BANKER WINS', color: '#ef4444', glow: 'rgba(239,68,68,0.5)' },
  player: { label: 'PLAYER WINS', color: '#3b82f6', glow: 'rgba(59,130,246,0.5)' },
  tie:    { label: 'TIE',         color: '#22c55e', glow: 'rgba(34,197,94,0.5)'  },
};

export default function ResultBanner({ result, onNext, onRebet }: Props) {
  const { outcome, playerResults } = result;
  const ws = WINNER_STYLE[outcome.winner];

  const badges: { label: string; color: string }[] = [];
  if (outcome.isGold7)     badges.push({ label: 'GOLD 7 🐉 ×40',      color: '#a855f7' });
  if (outcome.isJade8)     badges.push({ label: 'JADE 8 🐼 ×25',      color: '#10b981' });
  if (outcome.isSmallRuby) badges.push({ label: 'SMALL RUBY 💎 ×10',  color: '#f43f5e' });
  if (outcome.isBigRuby)   badges.push({ label: 'BIG RUBY 💎💎 ×75',  color: '#f97316' });

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-20 rounded-xl overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(3px)' }}
    >
      <div
        className="banner-animate flex flex-col items-center gap-3 px-5 py-4 rounded-2xl w-full max-w-md mx-4"
        style={{
          background: 'rgba(6,30,16,0.97)',
          border: `2px solid ${ws.color}`,
          boxShadow: `0 0 40px ${ws.glow}`,
        }}
      >
        {/* Winner */}
        <div className="text-2xl font-black tracking-widest uppercase"
          style={{ color: ws.color, textShadow: `0 0 20px ${ws.glow}` }}>
          {ws.label}
        </div>

        {/* Scores */}
        <div className="flex gap-6 text-sm" style={{ color: '#d1d5db' }}>
          <span><span style={{ color: '#93c5fd' }}>Player</span> {outcome.playerTotal}</span>
          <span><span style={{ color: '#fca5a5' }}>Banker</span> {outcome.bankerTotal}</span>
        </div>

        {/* Side-bet badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {badges.map(b => (
              <span key={b.label} className="px-2 py-0.5 rounded text-xs font-bold"
                style={{ background: b.color + '33', color: b.color, border: `1px solid ${b.color}` }}>
                {b.label}
              </span>
            ))}
          </div>
        )}

        {/* Per-player results */}
        {playerResults.length > 0 && (
          <div className="w-full rounded-lg overflow-hidden" style={{ border: '1px solid rgba(200,164,74,0.2)' }}>
            <div className="grid grid-cols-3 px-3 py-1 text-xs font-bold uppercase tracking-wider"
              style={{ background: 'rgba(200,164,74,0.15)', color: 'rgba(200,164,74,0.8)' }}>
              <span>Player</span>
              <span className="text-center">Bets</span>
              <span className="text-right">Result</span>
            </div>
            {playerResults.map(pr => {
              const net = pr.netChange;
              return (
                <div key={pr.playerId} className="grid grid-cols-3 items-center px-3 py-1.5 text-xs"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="font-semibold truncate" style={{ color: '#f5f0e8' }}>{pr.playerName}</span>
                  <span className="text-center" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    ${Object.values(pr.betsPlaced).reduce((s, v) => s + v, 0)}
                  </span>
                  <span className="text-right font-bold"
                    style={{ color: net > 0 ? '#4ade80' : net < 0 ? '#f87171' : '#fbbf24' }}>
                    {net > 0 ? `+$${net}` : net < 0 ? `-$${Math.abs(net)}` : 'PUSH'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <button onClick={onRebet}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'rgba(200,164,74,0.2)', color: '#e8c86a', border: '1px solid rgba(200,164,74,0.5)', touchAction: 'manipulation', minHeight: 44 }}>
            Rebet
          </button>
          <button onClick={onNext}
            className="px-5 py-2 rounded-lg text-sm font-bold"
            style={{ background: '#c8a44a', color: '#082a18', touchAction: 'manipulation', minHeight: 44 }}>
            Next Hand →
          </button>
        </div>
      </div>
    </div>
  );
}
