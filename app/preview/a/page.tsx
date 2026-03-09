'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

// ─── Drills ───────────────────────────────────────────────────────────────────

const DRILLS = [
  { href: '/practice/third-card', icon: '🃏', title: 'Third Card Rules',   sub: 'Draw decision drill' },
  { href: '/practice/naturals',   icon: '⚡', title: 'Natural Recognition', sub: 'Instant 8 & 9 ID' },
  { href: '/practice/totals',     icon: '🔢', title: 'Hand Totals',         sub: 'Score calculation' },
  { href: '/practice/chips',      icon: '🪙', title: 'Chip Count',          sub: 'Casino chip math' },
  { href: '/practice/payouts',    icon: '💰', title: 'Payout Calculator',   sub: 'Win amount math' },
  { href: '/practice/bonus-math', icon: '🧮', title: 'Bonus Math',          sub: 'Side bet shortcuts' },
];

// ─── Preview nav ──────────────────────────────────────────────────────────────

function PreviewNav() {
  return (
    <div style={{
      position: 'fixed', top: 14, right: 14, zIndex: 9000,
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(200,164,74,0.25)',
      borderRadius: 8, padding: '6px 10px',
      fontFamily: 'Georgia, serif',
    }}>
      {(['a', 'b', 'c'] as const).map((id, i) => (
        <span key={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>|</span>}
          <Link href={`/preview/${id}`} style={{
            color: id === 'a' ? '#c8a44a' : 'rgba(255,255,255,0.4)',
            fontSize: 11, fontWeight: id === 'a' ? 900 : 400,
            textDecoration: 'none', letterSpacing: '0.05em',
          }}>
            {id.toUpperCase()}
          </Link>
        </span>
      ))}
      <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />
      <Link href="/" style={{
        color: 'rgba(255,255,255,0.55)', fontSize: 10,
        textDecoration: 'none', whiteSpace: 'nowrap',
      }}>
        ← Use This
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PreviewA() {
  const router = useRouter();
  const [hoveredDrill, setHoveredDrill] = useState<string | null>(null);

  const handleDrillClick = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault();
    router.push(href);
  }, [router]);

  return (
    <div style={{
      background: '#050708',
      height: '100dvh',
      overflowY: 'auto',
      fontFamily: 'Georgia, serif',
      WebkitOverflowScrolling: 'touch',
    }}>
      <PreviewNav />

      {/* ══ HERO ══ */}
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px 48px',
      }}>
        <div style={{
          width: 'min(92vw, 320px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          {/* Top rule */}
          <div style={{
            width: 80, height: 1,
            background: '#c8a44a',
            marginBottom: 14,
          }} />

          {/* Sub-label */}
          <div style={{
            color: '#c8a44a',
            fontSize: 9,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            marginBottom: 14,
            fontFamily: 'Georgia, serif',
          }}>
            Baccarat Practice Trainer
          </div>

          {/* Bottom rule */}
          <div style={{
            width: 80, height: 1,
            background: '#c8a44a',
            marginBottom: 32,
          }} />

          {/* Main title */}
          <h1 style={{
            margin: 0,
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: '0.18em',
            color: '#f5f0e8',
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
          }}>
            BACCARAT
          </h1>

          {/* Tagline */}
          <p style={{
            margin: '4px 0 0',
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif',
          }}>
            Master the game
          </p>

          {/* CTA buttons */}
          <div style={{ width: '100%', marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/practice" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: 52,
              border: '1px solid #c8a44a',
              background: 'transparent',
              color: '#c8a44a',
              fontSize: 12,
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontFamily: 'Georgia, serif',
            }}>
              START TRAINING →
            </Link>
            <Link href="/rules" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: 40,
              border: 'none',
              background: 'transparent',
              color: 'rgba(255,255,255,0.15)',
              fontSize: 11,
              textDecoration: 'none',
              fontFamily: 'Georgia, serif',
            }}>
              How to Play
            </Link>
          </div>
        </div>
      </div>

      {/* ══ DRILLS ══ */}
      <div style={{
        padding: '0 24px 64px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ width: 'min(92vw, 320px)' }}>

          {/* Section label */}
          <div style={{
            color: '#c8a44a',
            fontSize: 8,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            marginBottom: 0,
            fontFamily: 'Georgia, serif',
          }}>
            DRILLS
          </div>

          {/* Drill list */}
          {DRILLS.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              onClick={e => handleDrillClick(e, d.href)}
              onMouseEnter={() => setHoveredDrill(d.href)}
              onMouseLeave={() => setHoveredDrill(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{d.icon}</span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: hoveredDrill === d.href ? '#c8a44a' : '#ffffff',
                  fontFamily: 'Georgia, serif',
                  transition: 'color 0.2s',
                }}>
                  {d.title}
                </span>
              </div>
              <span style={{ color: '#c8a44a', fontSize: 14, lineHeight: 1 }}>→</span>
            </Link>
          ))}

          {/* Footer */}
          <div style={{
            marginTop: 40,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.15)',
            fontSize: 8,
            letterSpacing: '0.2em',
            fontFamily: 'Georgia, serif',
          }}>
            ♦ For Training Purposes Only
          </div>
        </div>
      </div>
    </div>
  );
}
