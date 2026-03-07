'use client';
import Link from 'next/link';

// ─── Playing card ─────────────────────────────────────────────────────────────

const SUITS: Record<string, { symbol: string; color: string }> = {
  spades:   { symbol: '♠', color: '#1a1a2e' },
  hearts:   { symbol: '♥', color: '#c0392b' },
  diamonds: { symbol: '♦', color: '#c0392b' },
  clubs:    { symbol: '♣', color: '#1a1a2e' },
};

function FloatingCard({
  rank, suit, className, style,
}: {
  rank: string; suit: keyof typeof SUITS; className: string; style?: React.CSSProperties;
}) {
  const s = SUITS[suit];
  return (
    <div className={className} style={{
      position: 'absolute',
      width: 58, height: 82,
      background: 'linear-gradient(160deg, #fff 0%, #f5f0e8 100%)',
      borderRadius: 8,
      boxShadow: '0 10px 40px rgba(0,0,0,0.85), 0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.6)',
      padding: '5px 6px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      border: '1px solid rgba(255,255,255,0.85)',
      ...style,
    }}>
      <div style={{ color: s.color, fontSize: 12, fontWeight: 900, lineHeight: 1, fontFamily: 'Georgia, serif' }}>
        {rank}<br /><span style={{ fontSize: 13 }}>{s.symbol}</span>
      </div>
      <div style={{ color: s.color, fontSize: 12, fontWeight: 900, lineHeight: 1, fontFamily: 'Georgia, serif', textAlign: 'right', transform: 'rotate(180deg)' }}>
        {rank}<br /><span style={{ fontSize: 13 }}>{s.symbol}</span>
      </div>
    </div>
  );
}

// ─── Casino chip ──────────────────────────────────────────────────────────────
// Colors match real baccarat table: $1=green  $5=red  $20=light-blue  $100=purple

const CHIP_CFG: Record<number, { face: string; highlight: string; shadow: string; rim: string }> = {
  1:   { face: '#166534', highlight: '#4ade80', shadow: '#052e16', rim: '#15803d' },
  5:   { face: '#991b1b', highlight: '#f87171', shadow: '#450a0a', rim: '#dc2626' },
  20:  { face: '#1e4d7b', highlight: '#93c5fd', shadow: '#0c2340', rim: '#3b82f6' },
  100: { face: '#5b21b6', highlight: '#c4b5fd', shadow: '#2e1065', rim: '#7c3aed' },
};

function Chip({ value, size = 52, style }: { value: number; size?: number; style?: React.CSSProperties }) {
  const c = CHIP_CFG[value] ?? CHIP_CFG[5];
  const bw = Math.max(3, Math.round(size * 0.075)); // border width
  const inset = Math.max(4, Math.round(size * 0.12));
  const dashW = Math.max(1.5, size * 0.03);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      // 3-tone radial: bright highlight top-left → mid face → dark bottom-right
      background: `radial-gradient(ellipse at 30% 25%, ${c.highlight} 0%, ${c.face} 42%, ${c.shadow} 100%)`,
      border: `${bw}px solid ${c.rim}`,
      boxShadow: [
        // bottom edge slabs — simulate physical thickness
        `0 ${Math.round(size * 0.06)}px 0 ${c.shadow}`,
        `0 ${Math.round(size * 0.1)}px 0 rgba(0,0,0,0.45)`,
        // ambient drop shadow
        `0 ${Math.round(size * 0.18)}px ${Math.round(size * 0.35)}px rgba(0,0,0,0.75)`,
        // inner top specular
        `inset 0 2px 5px rgba(255,255,255,0.45)`,
        // inner bottom shadow for depth
        `inset 0 -3px 5px rgba(0,0,0,0.45)`,
      ].join(', '),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', flexShrink: 0,
      ...style,
    }}>
      {/* Dashed inner ring */}
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

// Vertically stacked chip tower
function ChipTower({ values, style }: { values: number[]; style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', width: 52, height: values.length * 7 + 52, flexShrink: 0, ...style }}>
      {values.map((v, i) => (
        <Chip key={i} value={v} size={52} style={{ position: 'absolute', bottom: i * 7, left: 0, zIndex: i }} />
      ))}
    </div>
  );
}

// ─── Drills ───────────────────────────────────────────────────────────────────

const DRILLS = [
  { href: '/practice/third-card', icon: '🃏', title: 'Third Card Rules',   color: '#7a1826', border: 'rgba(248,113,113,0.35)' },
  { href: '/practice/naturals',   icon: '⚡', title: 'Natural Recognition', color: '#1d4ed8', border: 'rgba(147,197,253,0.35)' },
  { href: '/practice/totals',     icon: '🔢', title: 'Hand Totals',         color: '#7c3aed', border: 'rgba(196,181,253,0.35)' },
  { href: '/practice/chips',      icon: '🪙', title: 'Chip Count',          color: '#15803d', border: 'rgba(74,222,128,0.35)' },
  { href: '/practice/payouts',    icon: '💰', title: 'Payout Calculator',   color: '#b45309', border: 'rgba(252,211,77,0.35)' },
  { href: '/practice/bonus-math', icon: '🧮', title: 'Bonus Math',          color: '#7c3aed', border: 'rgba(196,181,253,0.35)' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{
      background: '#060a0e',
      height: '100dvh',
      overflowY: 'auto',
      fontFamily: 'Georgia, serif',
      WebkitOverflowScrolling: 'touch',
    }}>

      {/* ══ HERO ══ */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '62dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '52px 24px 44px',
        background: `
          radial-gradient(ellipse at 50% 0%,   rgba(122,24,38,0.55) 0%, transparent 55%),
          radial-gradient(ellipse at 0%  100%,  rgba(10,60,28,0.7)  0%, transparent 55%),
          radial-gradient(ellipse at 100% 100%, rgba(10,60,28,0.5)  0%, transparent 55%),
          linear-gradient(180deg, #0c1008 0%, #060a0e 100%)
        `,
      }}>

        {/* Felt weave texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.007) 3px, rgba(255,255,255,0.007) 6px)',
        }} />

        {/* Bottom gold rail */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(200,164,74,0.3) 20%, rgba(200,164,74,0.7) 50%, rgba(200,164,74,0.3) 80%, transparent 100%)',
        }} />

        {/* Dragon (left) and Panda (right) — full-height background mascots */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          display: 'flex', alignItems: 'center',
          fontSize: 'min(55vw, 340px)', lineHeight: 1,
          opacity: 0.12, pointerEvents: 'none', userSelect: 'none',
          filter: 'drop-shadow(0 0 32px rgba(34,197,94,0.35))',
          transform: 'scaleX(-1) translateX(12%)',
        }}>🐉</div>
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          display: 'flex', alignItems: 'center',
          fontSize: 'min(48vw, 300px)', lineHeight: 1,
          opacity: 0.11, pointerEvents: 'none', userSelect: 'none',
          filter: 'drop-shadow(0 0 28px rgba(255,255,255,0.25))',
          transform: 'translateX(14%)',
        }}>🐼</div>

        {/* Large faded suit symbols in corners */}
        {[
          { s: '♠', c: 'rgba(255,255,255,0.035)', sz: 130, t: '2%',  l: '-3%', rot: '-12deg' },
          { s: '♥', c: 'rgba(192,57,43,0.055)',   sz: 110, t: '3%',  r: '-2%', rot:  '10deg' },
          { s: '♦', c: 'rgba(192,57,43,0.045)',   sz:  90, b: '18%', l:  '3%', rot:  '-6deg' },
          { s: '♣', c: 'rgba(255,255,255,0.035)', sz: 100, b: '12%', r:  '2%', rot:  '14deg' },
        ].map(({ s, c, sz, t, b, l, r, rot }, i) => (
          <div key={i} style={{
            position: 'absolute', pointerEvents: 'none', userSelect: 'none',
            color: c, fontSize: sz, fontFamily: 'Georgia, serif',
            top: t, bottom: b, left: l, right: r, transform: `rotate(${rot})`,
          }}>{s}</div>
        ))}

        {/* Spinning roulette rings (centered via flex wrapper) */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          {/* Outer ring */}
          <div className="spin-ring-ccw" style={{
            position: 'absolute',
            width: 320, height: 320, borderRadius: '50%',
            border: '1px solid rgba(200,164,74,0.07)',
          }} />
          {/* Middle ring with tick marks */}
          <div className="spin-ring-cw" style={{
            position: 'absolute',
            width: 250, height: 250, borderRadius: '50%',
            border: '1px solid rgba(200,164,74,0.11)',
          }}>
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} style={{
                position: 'absolute', width: 2, height: 8,
                background: 'rgba(200,164,74,0.25)',
                left: '50%', top: 3,
                transformOrigin: '50% 122px',
                transform: `translateX(-50%) rotate(${i * 22.5}deg)`,
              }} />
            ))}
          </div>
          {/* Inner dotted ring */}
          <div style={{
            position: 'absolute',
            width: 190, height: 190, borderRadius: '50%',
            border: '1px dashed rgba(200,164,74,0.08)',
          }} />
        </div>

        {/* Floating cards */}
        <FloatingCard rank="A" suit="spades"   className="landing-card-a" style={{ top: '7%',   left: '4%',   opacity: 0.85, zIndex: 0 }} />
        <FloatingCard rank="K" suit="hearts"   className="landing-card-b" style={{ top: '5%',   right: '4%',  opacity: 0.8,  zIndex: 0 }} />
        <FloatingCard rank="9" suit="diamonds" className="landing-card-c" style={{ bottom: '16%', left: '5%',  opacity: 0.65, zIndex: 0 }} />
        <FloatingCard rank="8" suit="clubs"    className="landing-card-d" style={{ bottom: '18%', right: '5%', opacity: 0.7,  zIndex: 0 }} />
        <FloatingCard rank="Q" suit="hearts"   className="landing-card-e" style={{ top: '30%',  right: '0%',  opacity: 0.4,  zIndex: 0 }} />
        <FloatingCard rank="J" suit="spades"   className="landing-card-f" style={{ top: '25%',  left: '0%',   opacity: 0.4,  zIndex: 0 }} />
        <FloatingCard rank="7" suit="diamonds" className="landing-card-g" style={{ bottom: '30%', right: '2%', opacity: 0.3,  zIndex: 0 }} />

        {/* Left chip tower */}
        <ChipTower values={[5, 1, 5, 20, 5, 1, 20]} style={{ position: 'absolute', left: '3%', bottom: '20%', opacity: 0.65, zIndex: 0 }} />
        {/* Right chip tower */}
        <ChipTower values={[100, 20, 100, 20, 5, 100]} style={{ position: 'absolute', right: '3%', bottom: '22%', opacity: 0.6, zIndex: 0 }} />

        {/* ── Central content ── */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: 'min(92vw, 340px)' }}>

          {/* Top ribbon */}
          <div style={{ animation: 'fadeInDown 0.5s ease both' }}>
            <div style={{ color: 'rgba(200,164,74,0.55)', fontSize: 9, letterSpacing: '0.45em', textTransform: 'uppercase', marginBottom: 8 }}>
              ✦ Casino Royale ✦
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, justifyContent: 'center' }}>
              <div style={{ height: 1, width: 30, background: 'linear-gradient(90deg, transparent, rgba(200,164,74,0.45))' }} />
              <span style={{ color: 'rgba(200,164,74,0.45)', fontSize: 14 }}>♦</span>
              <div style={{ height: 1, width: 50, background: 'rgba(200,164,74,0.45)' }} />
              <span style={{ color: 'rgba(200,164,74,0.45)', fontSize: 14 }}>♦</span>
              <div style={{ height: 1, width: 30, background: 'linear-gradient(90deg, rgba(200,164,74,0.45), transparent)' }} />
            </div>
          </div>

          {/* Title plate with ornate corners */}
          <div style={{
            position: 'relative',
            border: '1px solid rgba(200,164,74,0.22)',
            borderRadius: 4,
            padding: '20px 16px 16px',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)',
            animation: 'fadeInUp 0.5s ease 0.1s both',
          }}>
            {/* Corner brackets */}
            {[
              { top: -1, left: -1,  borderTop: '2px solid rgba(200,164,74,0.65)', borderLeft:  '2px solid rgba(200,164,74,0.65)' },
              { top: -1, right: -1, borderTop: '2px solid rgba(200,164,74,0.65)', borderRight: '2px solid rgba(200,164,74,0.65)' },
              { bottom: -1, left: -1,  borderBottom: '2px solid rgba(200,164,74,0.65)', borderLeft:  '2px solid rgba(200,164,74,0.65)' },
              { bottom: -1, right: -1, borderBottom: '2px solid rgba(200,164,74,0.65)', borderRight: '2px solid rgba(200,164,74,0.65)' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 14, height: 14, ...s }} />
            ))}

            <h1 style={{ margin: 0, lineHeight: 1, overflow: 'visible' }}>
              <span className="shimmer-gold" style={{ fontSize: 'min(13vw, 46px)', fontWeight: 900, letterSpacing: '0.05em', display: 'block', whiteSpace: 'nowrap' }}>
                BACCARAT
              </span>
            </h1>
          </div>

          {/* Tagline */}
          <p style={{
            color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 14, lineHeight: 1.8,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            animation: 'fadeInUp 0.5s ease 0.2s both',
          }}>
            Train like a dealer<br />Think like a pro
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center', animation: 'fadeInUp 0.5s ease 0.3s both' }}>
            <Link href="/practice" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              flex: 1, maxWidth: 148, height: 50, borderRadius: 10,
              background: 'linear-gradient(160deg, #6b1520, #9a1e30)',
              color: '#fff', fontSize: 13, fontWeight: 900, letterSpacing: '0.08em',
              textDecoration: 'none', textTransform: 'uppercase',
              border: '1px solid rgba(220,100,120,0.4)',
            }} className="glow-btn-red">
              📚 Drills
            </Link>
            <Link href="/table" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              flex: 1, maxWidth: 148, height: 50, borderRadius: 10,
              background: 'linear-gradient(160deg, #6b4d18, #8a6222)',
              color: '#fef3c7', fontSize: 13, fontWeight: 900, letterSpacing: '0.08em',
              textDecoration: 'none', textTransform: 'uppercase',
              border: '1px solid rgba(200,164,74,0.4)',
            }} className="glow-btn-gold">
              🃏 Table
            </Link>
          </div>
        </div>
      </div>

      {/* ══ DRILLS SECTION ══ */}
      <div style={{ padding: '20px 14px 36px', animation: 'fadeInUp 0.6s ease 0.4s both' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,164,74,0.25))' }} />
          <span style={{ color: 'rgba(200,164,74,0.6)', fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            ♠ Training Suite ♠
          </span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(200,164,74,0.25), transparent)' }} />
        </div>

        {/* Drill grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {DRILLS.map(d => (
            <Link key={d.href} href={d.href} style={{
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 10,
              background: `linear-gradient(135deg, ${d.color}25 0%, ${d.color}08 100%)`,
              border: `1px solid ${d.border}`,
              borderRadius: 10, padding: '11px 12px',
              cursor: 'pointer', touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Subtle right edge fade */}
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 28, background: `linear-gradient(90deg, transparent, ${d.color}18)` }} />
              <span style={{ fontSize: 22, flexShrink: 0 }}>{d.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: 11, fontWeight: 700, lineHeight: 1.3, position: 'relative', zIndex: 1 }}>
                {d.title}
              </span>
            </Link>
          ))}
        </div>

        {/* Chip row decoration */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: -6, marginTop: 22, opacity: 0.4 }}>
          {[1, 5, 20, 100, 5, 1].map((v, i) => (
            <Chip key={i} value={v} size={36} style={{ marginLeft: i === 0 ? 0 : -10, transform: `rotate(${(i - 2.5) * 5}deg)` }} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 18, textAlign: 'center', borderTop: '1px solid rgba(200,164,74,0.08)', paddingTop: 14 }}>
          <div style={{ color: 'rgba(200,164,74,0.3)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            ♦ Baccarat Practice ♦
          </div>
          <div style={{ color: 'rgba(255,255,255,0.1)', fontSize: 8, letterSpacing: '0.1em', marginTop: 4 }}>
            Est. 2024 · For Training Purposes Only
          </div>
        </div>
      </div>
    </div>
  );
}
