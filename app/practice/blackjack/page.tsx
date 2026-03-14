'use client';
import Link from 'next/link';

const DRILLS = [
  {
    href: '/practice/blackjack/hand-totals',
    title: 'Hand Totals',
    subtitle: 'What is the total?',
    description: 'Flash 2–5 cards and tap the correct blackjack total. Aces auto-select best value. Busted hands shown in red.',
    color: '#7c3aed',
    glow: 'rgba(139,92,246,0.5)',
    border: 'rgba(196,181,253,0.4)',
    icon: '🔢',
    tags: ['Arithmetic', 'Speed'],
  },
  {
    href: '/practice/blackjack/anchor-totals',
    title: 'Anchor Totals',
    subtitle: 'Count with a fixed card',
    description: 'Pick an anchor card (1–9), then count it with random extras. Great for drilling specific card values.',
    color: '#0f766e',
    glow: 'rgba(20,184,166,0.5)',
    border: 'rgba(94,234,212,0.4)',
    icon: '🎯',
    tags: ['Arithmetic', 'Focused'],
  },
  {
    href: '/practice/blackjack/bust-check',
    title: 'Bust or No Bust',
    subtitle: 'Is the hand over 21?',
    description: 'Flash a hand — instantly decide if it busts. Fast binary drill for warm-up.',
    color: '#b91c1c',
    glow: 'rgba(220,38,38,0.5)',
    border: 'rgba(248,113,113,0.4)',
    icon: '💥',
    tags: ['Speed', 'Warm-up'],
  },
  {
    href: '/practice/blackjack/soft-hard',
    title: 'Soft vs Hard',
    subtitle: 'Soft or Hard?',
    description: 'Identify soft and hard hands instantly. Essential for applying dealer rules correctly.',
    color: '#0369a1',
    glow: 'rgba(14,165,233,0.5)',
    border: 'rgba(125,211,252,0.4)',
    icon: '🂠',
    tags: ['Recognition', 'Rules'],
  },
  {
    href: '/practice/blackjack/dealer-action',
    title: 'Dealer Action',
    subtitle: 'Hit or Stand?',
    description: 'Given a dealer hand and house rule (H17/S17), decide the correct dealer action.',
    color: '#15803d',
    glow: 'rgba(34,197,94,0.5)',
    border: 'rgba(74,222,128,0.4)',
    icon: '🎴',
    tags: ['Rules', 'H17', 'S17'],
  },
  {
    href: '/practice/blackjack/basic-strategy',
    title: 'Basic Strategy',
    subtitle: 'Hit / Stand / Double / Split?',
    description: 'Player hand vs dealer upcard — tap the correct basic strategy play. Multi-deck Vegas chart.',
    color: '#7a1826',
    glow: 'rgba(220,38,38,0.5)',
    border: 'rgba(248,113,113,0.4)',
    icon: '📊',
    tags: ['Strategy', 'Core'],
  },
  {
    href: '/practice/blackjack/payouts',
    title: 'Payout Drill',
    subtitle: 'What is the payout?',
    description: 'Given a bet and result — Blackjack 3:2, even money, insurance 2:1, push — tap the correct net payout.',
    color: '#b45309',
    glow: 'rgba(245,158,11,0.5)',
    border: 'rgba(252,211,77,0.4)',
    icon: '💰',
    tags: ['Math', 'Money'],
  },
  {
    href: '/practice/blackjack/side-bets',
    title: 'Side Bet Payouts',
    subtitle: 'Upcard & Buster',
    description: 'Toggle between Upcard and Buster Blackjack side bets. Given the scenario, tap the correct payout multiplier.',
    color: '#6d28d9',
    glow: 'rgba(139,92,246,0.5)',
    border: 'rgba(196,181,253,0.4)',
    icon: '🎰',
    tags: ['Side Bets', 'Math'],
  },
];

export default function BlackjackHub() {
  return (
    <div className="flex flex-col" style={{ background: '#080c10', height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #1d4ed8' }}>
        <Link href="/practice" className="text-xs font-bold tracking-widest uppercase"
          style={{ color: 'rgba(232,200,106,0.6)' }}>← Practice</Link>
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#e8c86a', letterSpacing: '0.2em' }}>
          ♠ Blackjack Drills ♠
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DRILLS.map(drill => (
          <Link key={drill.href} href={drill.href} style={{
            textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'flex-start',
            background: `linear-gradient(135deg, ${drill.color}22 0%, rgba(0,0,0,0) 60%)`,
            border: `1.5px solid ${drill.border}`, borderRadius: 14, padding: '14px 16px',
            cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
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
                    background: `${drill.color}33`, color: 'rgba(255,255,255,0.55)',
                    border: `1px solid ${drill.border}`, borderRadius: 4,
                    padding: '2px 6px', textTransform: 'uppercase',
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
