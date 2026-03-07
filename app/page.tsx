'use client';
import Link from 'next/link';

// ─── Floating card component ──────────────────────────────────────────────────

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
      width: 62, height: 86,
      background: 'linear-gradient(160deg, #fff 0%, #f0ece4 100%)',
      borderRadius: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
      padding: '5px 6px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      border: '1px solid rgba(255,255,255,0.9)',
      ...style,
    }}>
      <div style={{ color: s.color, fontSize: 13, fontWeight: 900, lineHeight: 1, fontFamily: 'Georgia, serif' }}>
        {rank}<br />
        <span style={{ fontSize: 14 }}>{s.symbol}</span>
      </div>
      <div style={{ color: s.color, fontSize: 13, fontWeight: 900, lineHeight: 1, fontFamily: 'Georgia, serif', textAlign: 'right', transform: 'rotate(180deg)' }}>
        {rank}<br />
        <span style={{ fontSize: 14 }}>{s.symbol}</span>
      </div>
    </div>
  );
}

// ─── Decorative chip ─────────────────────────────────────────────────────────

function DecorativeChip({ value, color, rim, style }: { value: number; color: string; rim: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      background: `radial-gradient(circle at 35% 35%, ${rim}, ${color})`,
      border: `4px solid ${rim}`,
      boxShadow: `0 6px 20px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.3)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', flexShrink: 0,
      ...style,
    }}>
      <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.4)' }} />
      <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, fontFamily: 'Georgia, serif', position: 'relative', zIndex: 1 }}>${value}</span>
    </div>
  );
}

// ─── Drill cards ─────────────────────────────────────────────────────────────

const DRILLS = [
  { href: '/practice/third-card', icon: '🃏', title: 'Third Card Rules',   color: '#7a1826', border: 'rgba(248,113,113,0.35)' },
  { href: '/practice/naturals',   icon: '⚡', title: 'Natural Recognition', color: '#1d4ed8', border: 'rgba(147,197,253,0.35)' },
  { href: '/practice/totals',     icon: '🔢', title: 'Hand Totals',         color: '#7c3aed', border: 'rgba(196,181,253,0.35)' },
  { href: '/practice/chips',      icon: '🪙', title: 'Chip Count',          color: '#15803d', border: 'rgba(74,222,128,0.35)' },
  { href: '/practice/payouts',    icon: '💰', title: 'Payout Calculator',   color: '#b45309', border: 'rgba(252,211,77,0.35)' },
  { href: '/practice/bonus-math', icon: '🧮', title: 'Bonus Math',          color: '#7c3aed', border: 'rgba(196,181,253,0.35)' },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{
      background: '#080c10',
      height: '100dvh',
      overflowY: 'auto',
      fontFamily: 'Georgia, serif',
      WebkitOverflowScrolling: 'touch',
    }}>

      {/* ── Hero ── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '56dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px 36px',
        background: `
          radial-gradient(ellipse at 50% 0%,   rgba(122,24,38,0.4) 0%, transparent 60%),
          radial-gradient(ellipse at 20% 80%,  rgba(122,24,38,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%,  rgba(29,78,216,0.1) 0%, transparent 50%),
          linear-gradient(180deg, #0d0d18 0%, #080c10 100%)
        `,
      }}>
        {/* Subtle felt texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)',
        }} />

        {/* Floating cards — background decoration */}
        <FloatingCard rank="A" suit="spades"   className="landing-card-a" style={{ top: '8%',  left: '4%',  opacity: 0.75, zIndex: 0 }} />
        <FloatingCard rank="K" suit="hearts"   className="landing-card-b" style={{ top: '5%',  right: '6%', opacity: 0.7,  zIndex: 0 }} />
        <FloatingCard rank="7" suit="diamonds" className="landing-card-c" style={{ bottom: '10%', left: '8%',  opacity: 0.6,  zIndex: 0 }} />
        <FloatingCard rank="8" suit="clubs"    className="landing-card-d" style={{ bottom: '12%', right: '5%', opacity: 0.65, zIndex: 0 }} />
        <FloatingCard rank="Q" suit="hearts"   className="landing-card-e" style={{ top: '30%', right: '1%', opacity: 0.4,  zIndex: 0 }} />

        {/* Decorative chips */}
        <div style={{ position: 'absolute', bottom: '8%', left: '2%', display: 'flex', gap: -8, opacity: 0.55 }}>
          <DecorativeChip value={25} color="#1a7a3a" rim="#27ae60" style={{ transform: 'rotate(-8deg)' }} />
          <DecorativeChip value={100} color="#1f2937" rim="#4b5563" style={{ marginLeft: -12, transform: 'rotate(4deg)' }} />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
          {/* Gold diamond decorators */}
          <div style={{ color: 'rgba(200,164,74,0.5)', fontSize: 13, letterSpacing: '0.3em', marginBottom: 12, animation: 'fadeInDown 0.6s ease both' }}>
            ♦ ♦ ♦
          </div>

          <h1 style={{ margin: 0, lineHeight: 1.1, animation: 'fadeInUp 0.5s ease 0.1s both' }}>
            <span className="shimmer-gold" style={{ fontSize: 42, fontWeight: 900, letterSpacing: '0.08em', display: 'block' }}>
              BACCARAT
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.55)', display: 'block', marginTop: 4 }}>
              PRACTICE
            </span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 14, lineHeight: 1.6,
            letterSpacing: '0.04em', animation: 'fadeInUp 0.5s ease 0.2s both',
          }}>
            Train like a dealer.<br />Think like a pro.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'center', animation: 'fadeInUp 0.5s ease 0.3s both' }}>
            <Link href="/practice" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              flex: 1, maxWidth: 160, height: 52, borderRadius: 14,
              background: 'linear-gradient(160deg, #7a1826, #a52035)',
              color: '#fff', fontSize: 14, fontWeight: 900, letterSpacing: '0.06em',
              textDecoration: 'none', textTransform: 'uppercase',
              border: '1px solid rgba(200,80,100,0.5)',
            }} className="glow-btn-red">
              📚 Drills
            </Link>
            <Link href="/table" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              flex: 1, maxWidth: 160, height: 52, borderRadius: 14,
              background: 'linear-gradient(160deg, #7a5820, #9a7030)',
              color: '#fef3c7', fontSize: 14, fontWeight: 900, letterSpacing: '0.06em',
              textDecoration: 'none', textTransform: 'uppercase',
              border: '1px solid rgba(200,164,74,0.5)',
            }} className="glow-btn-gold">
              🃏 Table
            </Link>
          </div>
        </div>
      </div>

      {/* ── Drills grid ── */}
      <div style={{ padding: '24px 16px 40px', animation: 'fadeInUp 0.6s ease 0.4s both' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(200,164,74,0.2)' }} />
          <span style={{ color: 'rgba(200,164,74,0.7)', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Practice Drills
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(200,164,74,0.2)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {DRILLS.map(d => (
            <Link key={d.href} href={d.href} style={{
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 10,
              background: `linear-gradient(135deg, ${d.color}1a 0%, rgba(0,0,0,0) 70%)`,
              border: `1px solid ${d.border}`,
              borderRadius: 12, padding: '12px 12px',
              cursor: 'pointer', touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              transition: 'opacity 0.15s',
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{d.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>{d.title}</span>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 28, textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 10, letterSpacing: '0.08em' }}>
          ♦ PUNTO BANCO · BACCARAT PRACTICE ♦
        </div>
      </div>
    </div>
  );
}
