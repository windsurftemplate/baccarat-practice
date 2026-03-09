'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

// ─── Casino chip (for chip-fall transition) ───────────────────────────────────

const CHIP_CFG: Record<number, { face: string; highlight: string; shadow: string; rim: string }> = {
  1:   { face: '#166534', highlight: '#4ade80', shadow: '#052e16', rim: '#15803d' },
  5:   { face: '#991b1b', highlight: '#f87171', shadow: '#450a0a', rim: '#dc2626' },
  20:  { face: '#1e4d7b', highlight: '#93c5fd', shadow: '#0c2340', rim: '#3b82f6' },
  100: { face: '#5b21b6', highlight: '#c4b5fd', shadow: '#2e1065', rim: '#7c3aed' },
};

function Chip({ value, size = 52, style }: { value: number; size?: number; style?: React.CSSProperties }) {
  const c = CHIP_CFG[value] ?? CHIP_CFG[5];
  const bw = Math.max(3, Math.round(size * 0.075));
  const inset = Math.max(4, Math.round(size * 0.12));
  const dashW = Math.max(1.5, size * 0.03);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(ellipse at 30% 25%, ${c.highlight} 0%, ${c.face} 42%, ${c.shadow} 100%)`,
      border: `${bw}px solid ${c.rim}`,
      boxShadow: [
        `0 ${Math.round(size * 0.06)}px 0 ${c.shadow}`,
        `0 ${Math.round(size * 0.1)}px 0 rgba(0,0,0,0.45)`,
        `0 ${Math.round(size * 0.18)}px ${Math.round(size * 0.35)}px rgba(0,0,0,0.75)`,
        `inset 0 2px 5px rgba(255,255,255,0.45)`,
        `inset 0 -3px 5px rgba(0,0,0,0.45)`,
      ].join(', '),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', flexShrink: 0,
      ...style,
    }}>
      <div style={{ position: 'absolute', inset, borderRadius: '50%', border: `${dashW}px dashed rgba(255,255,255,0.38)` }} />
      <span style={{
        color: '#fff', fontSize: size > 44 ? 11 : size > 30 ? 9 : 8,
        fontWeight: 900, fontFamily: 'Georgia, serif',
        position: 'relative', zIndex: 1,
        textShadow: '0 1px 3px rgba(0,0,0,0.7)',
      }}>
        ${value}
      </span>
    </div>
  );
}

// ─── Chip-fall transition ─────────────────────────────────────────────────────

const FALL_CHIPS: Array<{ value: number; left: string; delay: string; dur: string }> = [
  { value: 100, left: '-3%',  delay:   '0ms', dur: '700ms' },
  { value:   5, left:  '9%',  delay:  '30ms', dur: '720ms' },
  { value:  20, left: '21%',  delay:  '10ms', dur: '690ms' },
  { value:   1, left: '33%',  delay:  '50ms', dur: '740ms' },
  { value:   5, left: '46%',  delay:   '5ms', dur: '710ms' },
  { value: 100, left: '58%',  delay:  '40ms', dur: '730ms' },
  { value:  20, left: '70%',  delay:  '20ms', dur: '700ms' },
  { value:   1, left: '82%',  delay:  '60ms', dur: '720ms' },
  { value:   5, left:  '3%',  delay: '100ms', dur: '710ms' },
  { value: 100, left: '15%',  delay: '120ms', dur: '690ms' },
  { value:   1, left: '27%',  delay:  '90ms', dur: '730ms' },
  { value:  20, left: '39%',  delay: '135ms', dur: '705ms' },
  { value:   5, left: '52%',  delay:  '80ms', dur: '720ms' },
  { value: 100, left: '64%',  delay: '115ms', dur: '695ms' },
  { value:   1, left: '76%',  delay: '145ms', dur: '715ms' },
  { value:  20, left: '88%',  delay: '105ms', dur: '700ms' },
  { value:  20, left:  '6%',  delay: '180ms', dur: '725ms' },
  { value:   1, left: '18%',  delay: '200ms', dur: '700ms' },
  { value: 100, left: '30%',  delay: '170ms', dur: '715ms' },
  { value:   5, left: '42%',  delay: '215ms', dur: '690ms' },
  { value:  20, left: '55%',  delay: '160ms', dur: '730ms' },
  { value:   1, left: '67%',  delay: '195ms', dur: '705ms' },
  { value:   5, left: '79%',  delay: '185ms', dur: '720ms' },
  { value: 100, left: '91%',  delay: '205ms', dur: '695ms' },
];

// ─── Drills ───────────────────────────────────────────────────────────────────

const DRILLS = [
  { href: '/practice/third-card', icon: '🃏', title: 'Third Card Rules',   sub: 'Draw decision drill', accent: '#f87171' },
  { href: '/practice/naturals',   icon: '⚡', title: 'Natural Recognition', sub: 'Instant 8 & 9 ID',   accent: '#60a5fa' },
  { href: '/practice/totals',     icon: '🔢', title: 'Hand Totals',         sub: 'Score calculation',  accent: '#a78bfa' },
  { href: '/practice/chips',      icon: '🪙', title: 'Chip Count',          sub: 'Casino chip math',   accent: '#34d399' },
  { href: '/practice/payouts',    icon: '💰', title: 'Payout Calculator',   sub: 'Win amount math',    accent: '#fbbf24' },
  { href: '/practice/bonus-math', icon: '🧮', title: 'Bonus Math',          sub: 'Side bet shortcuts', accent: '#a78bfa' },
];

// ─── Preview nav ──────────────────────────────────────────────────────────────

function PreviewNav() {
  return (
    <div style={{
      position: 'fixed', top: 14, right: 14, zIndex: 9000,
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(8,9,31,0.7)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 8, padding: '6px 10px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {(['a', 'b', 'c'] as const).map((id, i) => (
        <span key={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>|</span>}
          <Link href={`/preview/${id}`} style={{
            color: id === 'c' ? '#93c5fd' : 'rgba(255,255,255,0.4)',
            fontSize: 11, fontWeight: id === 'c' ? 700 : 400,
            textDecoration: 'none', letterSpacing: '0.05em',
          }}>
            {id.toUpperCase()}
          </Link>
        </span>
      ))}
      <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />
      <Link href="/" style={{
        color: 'rgba(255,255,255,0.5)', fontSize: 10,
        textDecoration: 'none', whiteSpace: 'nowrap',
      }}>
        ← Use This
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PreviewC() {
  const router = useRouter();
  const [falling, setFalling] = useState(false);

  const handleDrillClick = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (falling) return;
    setFalling(true);
    setTimeout(() => router.push(href), 780);
  }, [falling, router]);

  return (
    <div style={{
      background: 'linear-gradient(160deg, #08091f 0%, #050510 100%)',
      height: '100dvh',
      overflowY: 'auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      WebkitOverflowScrolling: 'touch',
    }}>
      <PreviewNav />

      {/* ══ HERO ══ */}
      <div style={{
        position: 'relative',
        minHeight: '58dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px 44px',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 20% 60%, rgba(220,38,38,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 60%, rgba(74,222,128,0.05) 0%, transparent 50%)
        `,
      }}>
        {/* Abstract orbs */}
        <div style={{
          position: 'absolute', left: '8%', top: '20%',
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(59,130,246,0.12)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: '6%', top: '15%',
          width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(139,92,246,0.1)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '30%', bottom: '5%',
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(16,185,129,0.08)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }} />

        {/* ── Central content ── */}
        <div style={{
          position: 'relative', zIndex: 1,
          textAlign: 'center',
          width: 'min(92vw, 360px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 20,
            padding: '4px 12px',
            backdropFilter: 'blur(8px)',
            marginBottom: 18,
          }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em' }}>
              🃏 BACCARAT TRAINER
            </span>
          </div>

          {/* Main title */}
          <h1 style={{
            margin: 0,
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: '0.04em',
            lineHeight: 1,
            background: 'linear-gradient(90deg, #93c5fd 0%, #c4b5fd 40%, #e8c86a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            BACCARAT
          </h1>

          {/* Sub-title */}
          <p style={{
            margin: '6px 0 0',
            fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
            fontStyle: 'italic',
          }}>
            Practice Trainer
          </p>

          {/* Stats row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 0, marginTop: 20,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            overflow: 'hidden',
            width: '100%',
          }}>
            {[
              { value: '45.8%', label: 'Banker', color: '#f87171' },
              { value: '44.6%', label: 'Player', color: '#60a5fa' },
              { value: '9.6%',  label: 'Tie',    color: '#34d399' },
            ].map((stat, i) => (
              <div key={i} style={{
                flex: 1,
                padding: '10px 0',
                textAlign: 'center',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 18, width: '100%' }}>
            <Link href="/practice" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flex: 1, height: 52, borderRadius: 12,
              background: 'rgba(59,130,246,0.25)',
              border: '1px solid rgba(147,197,253,0.4)',
              color: '#93c5fd',
              fontSize: 14, fontWeight: 600,
              textDecoration: 'none',
            }}>
              Start Training
            </Link>
            <Link href="/rules" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flex: 1, height: 52, borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14, fontWeight: 500,
              textDecoration: 'none',
            }}>
              How to Play
            </Link>
          </div>
        </div>
      </div>

      {/* ══ DRILLS SECTION ══ */}
      <div style={{ padding: '16px 14px 48px' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Training Drills</span>
          <div style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '2px 8px',
          }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>6 modules</span>
          </div>
        </div>

        {/* Drill grid 2×3 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {DRILLS.map(d => (
            <Link
              key={d.href}
              href={d.href}
              onClick={e => handleDrillClick(e, d.href)}
              style={{
                textDecoration: 'none',
                display: 'flex', flexDirection: 'column',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: 16,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Top-right colored dot */}
              <div style={{
                position: 'absolute', top: 10, right: 10,
                width: 6, height: 6, borderRadius: '50%',
                background: d.accent,
              }} />

              <span style={{ fontSize: 22 }}>{d.icon}</span>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 8, lineHeight: 1.3 }}>
                {d.title}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                {d.sub}
              </div>

              {/* Bottom accent line */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: 2,
                background: d.accent,
                opacity: 0.5,
              }} />
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 9, letterSpacing: '0.08em' }}>
            Baccarat Practice · For Training Purposes Only
          </div>
        </div>
      </div>

      {/* Chip-fall transition overlay */}
      {falling && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden', background: 'rgba(4,6,10,0.88)', pointerEvents: 'all' }}>
          {FALL_CHIPS.map((fc, i) => (
            <div key={i} style={{
              position: 'absolute', left: fc.left, top: '-200px',
              animation: `chipFall ${fc.dur} ${fc.delay} ease-in forwards`,
            }}>
              <Chip value={fc.value} size={184} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
