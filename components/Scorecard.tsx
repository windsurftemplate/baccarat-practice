'use client';
import { RoundResult } from '../lib/types';
import { buildBigRoad, buildBeadPlate } from '../lib/scorecard';

interface Props {
  history: RoundResult[];
}

const CIRCLE_SIZE = 18;
const GAP = 2;

const winnerColor = (w: string) =>
  w === 'banker' ? '#ef4444' : w === 'player' ? '#3b82f6' : '#22c55e';

export default function Scorecard({ history }: Props) {
  const bigRoad = buildBigRoad(history);
  const beadPlate = buildBeadPlate(history);

  // Show last 12 columns of each
  const brDisplay = bigRoad.slice(-12);
  const bpDisplay = beadPlate.slice(-12);

  return (
    <div
      className="flex gap-2 px-3 py-2 rounded-xl mx-2 mb-2"
      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(200,164,74,0.25)' }}
    >
      {/* Big Road */}
      <div className="flex-1">
        <div className="text-xs mb-1 tracking-widest uppercase" style={{ color: 'rgba(200,164,74,0.7)' }}>
          Big Road
        </div>
        <div className="flex gap-px overflow-hidden" style={{ height: (CIRCLE_SIZE + GAP) * 6 }}>
          {brDisplay.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-px">
              {col.map((cell, ri) => (
                <div key={ri} className="relative flex items-center justify-center"
                  style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
                  {/* Main circle */}
                  <div
                    className="rounded-full"
                    style={{
                      width: CIRCLE_SIZE - 2,
                      height: CIRCLE_SIZE - 2,
                      background: winnerColor(cell.winner),
                      opacity: 0.9,
                    }}
                  />
                  {/* Tie tick marks */}
                  {cell.ties > 0 && (
                    <div
                      className="absolute"
                      style={{
                        width: CIRCLE_SIZE - 2,
                        height: CIRCLE_SIZE - 2,
                        top: 1, left: 1,
                        borderTop: `2px solid #22c55e`,
                        borderLeft: `2px solid #22c55e`,
                        transform: 'rotate(45deg)',
                        borderRadius: 2,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
          {/* Empty columns placeholder */}
          {brDisplay.length === 0 && (
            <div className="text-xs italic" style={{ color: 'rgba(255,255,255,0.3)', paddingTop: 4 }}>
              No hands yet
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: 'rgba(200,164,74,0.2)', margin: '0 4px' }} />

      {/* Bead Plate */}
      <div className="flex-1">
        <div className="text-xs mb-1 tracking-widest uppercase" style={{ color: 'rgba(200,164,74,0.7)' }}>
          Bead Plate
        </div>
        <div className="flex gap-px overflow-hidden" style={{ height: (CIRCLE_SIZE + GAP) * 6 }}>
          {bpDisplay.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-px">
              {col.map((cell, ri) => (
                <div
                  key={ri}
                  className="rounded-full"
                  style={{
                    width: CIRCLE_SIZE - 2,
                    height: CIRCLE_SIZE - 2,
                    background: winnerColor(cell.winner),
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
          ))}
          {bpDisplay.length === 0 && (
            <div className="text-xs italic" style={{ color: 'rgba(255,255,255,0.3)', paddingTop: 4 }}>
              No hands yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
