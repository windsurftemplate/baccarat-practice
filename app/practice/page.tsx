'use client';
import Link from 'next/link';

const DRILLS = [
  {
    href: '/practice/chips',
    title: 'Chip Count',
    subtitle: 'What is the total?',
    description: 'Count full racks (100 chips) and stacks (20 chips) across denominations. Bank totals range from $10k–$40k.',
    color: '#15803d',
    glow: 'rgba(34,197,94,0.5)',
    border: 'rgba(74,222,128,0.4)',
    icon: '🪙',
    tags: ['Visual', 'Speed', 'Counting'],
  },
  {
    href: '/practice/third-card',
    title: 'Third Card Rules',
    subtitle: 'Hit or Stand?',
    description: 'Practice Player & Banker draw decisions. Includes Timed, Streak, Hard Hands, and Weakness Heatmap modes.',
    color: '#7a1826',
    glow: 'rgba(220,38,38,0.5)',
    border: 'rgba(248,113,113,0.4)',
    icon: '🃏',
    tags: ['Core', 'Timed', 'Streak', 'Heatmap'],
  },
  {
    href: '/practice/naturals',
    title: 'Natural Recognition',
    subtitle: 'Natural or No?',
    description: 'Flash 2-card hands — instantly identify 8s and 9s before thinking about draw rules.',
    color: '#1d4ed8',
    glow: 'rgba(59,130,246,0.5)',
    border: 'rgba(147,197,253,0.4)',
    icon: '⚡',
    tags: ['Speed', 'Warm-up'],
  },
  {
    href: '/practice/totals',
    title: 'Hand Totals',
    subtitle: 'What is the total?',
    description: 'Show a 2 or 3-card hand — tap the baccarat total. Tests mod-10 arithmetic fluency.',
    color: '#7c3aed',
    glow: 'rgba(139,92,246,0.5)',
    border: 'rgba(196,181,253,0.4)',
    icon: '🔢',
    tags: ['Arithmetic', 'Speed'],
  },
  {
    href: '/practice/payouts',
    title: 'Payout Calculator',
    subtitle: 'What is the payout?',
    description: 'Given a bet and result, calculate the net payout. Covers commission, Tie, Dragon 7, Panda 8.',
    color: '#b45309',
    glow: 'rgba(245,158,11,0.5)',
    border: 'rgba(252,211,77,0.4)',
    icon: '💰',
    tags: ['Math', 'Side Bets'],
  },
  {
    href: '/practice/bonus-math',
    title: 'Bonus Math Trainer',
    subtitle: 'Learn the system',
    description: 'Build mental speed for bonus payouts. Each round shows the shortcut (e.g. ×40 = ×4 add a zero) then reveals the step-by-step breakdown.',
    color: '#7c3aed',
    glow: 'rgba(139,92,246,0.5)',
    border: 'rgba(196,181,253,0.4)',
    icon: '🧮',
    tags: ['Speed', 'Bonus', 'System'],
  },
];

export default function PracticeHub() {
  return (
    <div className="flex flex-col" style={{ background: '#080c10', height: '100dvh', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #7a1826' }}>
        <Link href="/" className="text-xs font-bold tracking-widest uppercase"
          style={{ color: 'rgba(232,200,106,0.6)' }}>← Home</Link>
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#e8c86a', letterSpacing: '0.2em' }}>
          ♦ Practice Drills ♦
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* Drill grid */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DRILLS.map(drill => (
          <Link key={drill.href} href={drill.href} style={{
            textDecoration: 'none',
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
            background: `linear-gradient(135deg, ${drill.color}22 0%, rgba(0,0,0,0) 60%)`,
            border: `1.5px solid ${drill.border}`,
            borderRadius: 14,
            padding: '14px 16px',
            cursor: 'pointer',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}>
              <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{drill.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ color: '#f5f0e8', fontSize: 16, fontWeight: 900 }}>{drill.title}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{drill.subtitle}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: '4px 0 8px', lineHeight: 1.5 }}>
                  {drill.description}
                </p>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {drill.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
                      background: `${drill.color}33`,
                      color: `rgba(255,255,255,0.55)`,
                      border: `1px solid ${drill.border}`,
                      borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20, flexShrink: 0, alignSelf: 'center' }}>›</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
