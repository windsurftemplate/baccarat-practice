'use client';
import Link from 'next/link';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        color: '#e8c86a', fontSize: 13, fontWeight: 900, letterSpacing: '0.18em',
        textTransform: 'uppercase', borderBottom: '1px solid rgba(232,200,106,0.25)',
        paddingBottom: 6, marginBottom: 12,
      }}>{title}</div>
      {children}
    </div>
  );
}

function Rule({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: dim ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)', fontSize: 12 }}>{label}</span>
      <span style={{ color: '#f5f0e8', fontWeight: 900, fontSize: 13 }}>{value}</span>
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
      textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4,
      background: `${color}22`, border: `1px solid ${color}66`, color,
      marginLeft: 6,
    }}>{children}</span>
  );
}

const BANKER_TABLE = [
  { total: '0, 1, 2', draws: 'Always draw', highlight: false },
  { total: '3', draws: 'Draw on 0–7, 9  ·  Stand on 8', highlight: true },
  { total: '4', draws: 'Draw on 2–7  ·  Stand on 0, 1, 8, 9', highlight: true },
  { total: '5', draws: 'Draw on 4–7  ·  Stand on 0–3, 8, 9', highlight: true },
  { total: '6', draws: 'Draw on 6–7  ·  Stand on 0–5, 8, 9', highlight: true },
  { total: '7', draws: 'Always stand', highlight: false },
];

const PAYOUTS = [
  { bet: 'Player wins', payout: '1 : 1', note: '' },
  { bet: 'Banker wins', payout: '1 : 1', note: '5% commission deducted' },
  { bet: 'Tie', payout: '9 : 1', note: 'Player & Banker bets returned' },
  { bet: 'Dragon 7', payout: '40 : 1', note: 'Banker wins with 3-card 7' },
  { bet: 'Panda 8', payout: '25 : 1', note: 'Player wins with 3-card 8' },
  { bet: 'Small Ruby', payout: '10 : 1', note: 'Banker wins with 3 cards' },
  { bet: 'Big Ruby', payout: '75 : 1', note: 'Specific 3-card banker win' },
];

export default function RulesPage() {
  return (
    <div className="flex flex-col" style={{ background: '#080c10', height: '100dvh', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(0,0,0,0.65)', borderBottom: '2px solid #7a1826', flexShrink: 0 }}>
        <Link href="/" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          ← Home
        </Link>
        <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          ♦ Baccarat Explained ♦
        </div>
        <Link href="/practice" style={{ color: 'rgba(232,200,106,0.6)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Drills →
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 16px' }}>

        {/* Objective */}
        <Section title="Objective">
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.7, margin: 0 }}>
            Baccarat is a comparing card game between two hands: <span style={{ color: '#93c5fd', fontWeight: 700 }}>Player</span> and <span style={{ color: '#fca5a5', fontWeight: 700 }}>Banker</span>. The goal is to predict which hand will have a total closest to <span style={{ color: '#e8c86a', fontWeight: 900 }}>9</span>. You bet on Player, Banker, or Tie — the dealer does all the drawing.
          </p>
        </Section>

        {/* Card Values */}
        <Section title="Card Values">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <Rule label="2 – 9" value="Face value" />
            <Rule label="10, J, Q, K" value="= 0" />
            <Rule label="Ace" value="= 1" />
            <Rule label="Total over 9" value="Drop the tens digit" />
          </div>
          <div style={{ marginTop: 10, background: 'rgba(232,200,106,0.07)', border: '1px solid rgba(232,200,106,0.2)', borderRadius: 8, padding: '8px 12px' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Example: </span>
            <span style={{ color: '#f5f0e8', fontSize: 12, fontWeight: 700 }}>7 + 6 = 13 → total is </span>
            <span style={{ color: '#e8c86a', fontSize: 14, fontWeight: 900 }}>3</span>
          </div>
        </Section>

        {/* The Deal */}
        <Section title="The Deal">
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.7, margin: '0 0 10px' }}>
            Two cards are dealt face-up to Player, two to Banker. A third card may be drawn for either side based on the rules below. Maximum 3 cards per hand.
          </p>
          <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
            <span style={{ color: '#93c5fd', fontWeight: 900, fontSize: 11 }}>Natural: </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>If either hand totals <strong style={{ color: '#f5f0e8' }}>8 or 9</strong> on the first two cards, it is a Natural. No more cards are drawn. The higher total wins.</span>
          </div>
        </Section>

        {/* Player Draw Rule */}
        <Section title="Player Draw Rule">
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 8 }}>If no Natural, Player acts first.</p>
          <Rule label="Player total 0 – 5" value="Draw a third card" />
          <Rule label="Player total 6 – 7" value="Stand" />
        </Section>

        {/* Banker Draw Rule */}
        <Section title="Banker Draw Rule">
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 8 }}>
            If Player stood (no third card): Banker draws on 0–5, stands on 6–7.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 10 }}>
            If Player drew a third card, Banker uses this table:
          </p>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', background: 'rgba(122,24,38,0.4)', padding: '6px 12px' }}>
              <span style={{ color: '#fca5a5', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Banker</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action (based on Player's 3rd card)</span>
            </div>
            {BANKER_TABLE.map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '80px 1fr',
                padding: '8px 12px',
                background: row.highlight ? 'rgba(122,24,38,0.12)' : 'rgba(0,0,0,0.2)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ color: '#fca5a5', fontSize: 13, fontWeight: 900 }}>{row.total}</span>
                <span style={{ color: row.highlight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)', fontSize: 11, lineHeight: 1.5 }}>{row.draws}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8, padding: '8px 12px' }}>
            <span style={{ color: '#c4b5fd', fontSize: 11 }}>
              The highlighted rows (Banker 3–6) are the ones that require knowing the Player's third card value. These are drilled in <strong>Hard mode</strong>.
            </span>
          </div>
        </Section>

        {/* Payouts */}
        <Section title="Payouts & Side Bets">
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            {PAYOUTS.map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr auto',
                padding: '8px 12px', alignItems: 'center',
                background: i % 2 === 0 ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.02)',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div>
                  <span style={{ color: '#f5f0e8', fontSize: 12, fontWeight: 700 }}>{row.bet}</span>
                  {row.note && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 1 }}>{row.note}</div>}
                </div>
                <span style={{ color: '#e8c86a', fontSize: 14, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{row.payout}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Special Outcomes */}
        <Section title="Special Outcomes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 13, marginBottom: 3 }}>🐉 Dragon 7 — 40:1</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>Banker wins with exactly 3 cards totalling 7.</div>
            </div>
            <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#4ade80', fontWeight: 900, fontSize: 13, marginBottom: 3 }}>🐼 Panda 8 — 25:1</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>Player wins with exactly 3 cards totalling 8.</div>
            </div>
            <div style={{ background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.3)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#f472b6', fontWeight: 900, fontSize: 13, marginBottom: 3 }}>💎 Ruby</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
                <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Small Ruby (10:1)</strong> — Banker wins with 3 cards (any total, not Dragon 7).<br />
                <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Big Ruby (75:1)</strong> — Specific qualifying 3-card Banker win.
              </div>
            </div>
            <div style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#a78bfa', fontWeight: 900, fontSize: 13, marginBottom: 3 }}>Tie — 9:1</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>Both hands have the same total. Player and Banker bets are returned (push).</div>
            </div>
          </div>
        </Section>

        {/* Mental shortcuts */}
        <Section title="Mental Math Shortcuts">
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 10 }}>Quick ways to calculate bonus payouts in your head:</p>
          <Rule label="Dragon 7 (×40)" value="×4, add a zero" />
          <Rule label="Panda 8 (×25)" value="×100 ÷ 4" />
          <Rule label="Small Ruby (×10)" value="Add a zero" />
          <Rule label="Big Ruby (×75)" value="×100 − ×25" />
          <Rule label="Tie (×9)" value="×10 − bet" />
        </Section>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <Link href="/practice/third-card" style={{
            flex: 1, textAlign: 'center', textDecoration: 'none',
            padding: '14px 0', borderRadius: 12, fontWeight: 900, fontSize: 13,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'linear-gradient(160deg, #7a1826, #9a1e30)',
            color: '#fff', border: '1px solid rgba(220,100,120,0.5)',
          }}>
            Practice Third Card →
          </Link>
          <Link href="/practice" style={{
            flex: 1, textAlign: 'center', textDecoration: 'none',
            padding: '14px 0', borderRadius: 12, fontWeight: 900, fontSize: 13,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'rgba(232,200,106,0.1)',
            color: '#e8c86a', border: '1px solid rgba(232,200,106,0.3)',
          }}>
            All Drills →
          </Link>
        </div>

      </div>
    </div>
  );
}
