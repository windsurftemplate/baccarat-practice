'use client';
import Link from 'next/link';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        color: '#e8c86a', fontSize: 13, fontWeight: 900, letterSpacing: '0.18em',
        textTransform: 'uppercase', borderBottom: '1px solid rgba(232,200,106,0.25)',
        paddingBottom: 6, marginBottom: 12,
      }}>{title}</div>
      {children}
    </div>
  );
}

function Rule({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{label}</span>
      <span style={{ color: '#f5f0e8', fontWeight: 900, fontSize: 13 }}>{value}</span>
    </div>
  );
}

function Note({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: `${color}12`, border: `1px solid ${color}40`, borderRadius: 8, padding: '8px 12px', marginTop: 8 }}>
      <span style={{ color, fontSize: 11, lineHeight: 1.6 }}>{children}</span>
    </div>
  );
}

function Example({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
      <div style={{ color: '#e8c86a', fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const BANKER_TABLE = [
  { total: '0, 1, 2', draws: 'Always draw — no matter what Player drew', hard: false },
  { total: '3', draws: 'Draw unless Player\'s 3rd card was 8', hard: true },
  { total: '4', draws: 'Draw if Player\'s 3rd card was 2, 3, 4, 5, 6, or 7', hard: true },
  { total: '5', draws: 'Draw if Player\'s 3rd card was 4, 5, 6, or 7', hard: true },
  { total: '6', draws: 'Draw if Player\'s 3rd card was 6 or 7', hard: true },
  { total: '7', draws: 'Always stand — no matter what Player drew', hard: false },
];

const PAYOUTS = [
  { bet: 'Player wins', payout: '1:1', note: 'No commission' },
  { bet: 'Banker wins', payout: '1:1', note: '5% commission deducted from winnings' },
  { bet: 'Tie', payout: '9:1', note: 'Player & Banker bets returned (push)' },
  { bet: 'Dragon 7', payout: '40:1', note: 'Banker 3-card 7 — independent of main bet result' },
  { bet: 'Panda 8', payout: '25:1', note: 'Player 3-card 8 — independent of main bet result' },
  { bet: 'Small Ruby', payout: '10:1', note: 'Either side has a 3-card total of 9' },
  { bet: 'Big Ruby', payout: '75:1', note: 'Both sides have a 3-card total of 9' },
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
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.8, margin: 0 }}>
            Baccarat is a comparing card game between two hands: <span style={{ color: '#93c5fd', fontWeight: 700 }}>Player</span> and{' '}
            <span style={{ color: '#fca5a5', fontWeight: 700 }}>Banker</span>. The hand closest to{' '}
            <span style={{ color: '#e8c86a', fontWeight: 900 }}>9</span> wins. Players bet on which hand wins, or on a Tie — the dealer handles all the drawing automatically according to fixed rules.
          </p>
        </Section>

        {/* Card Values */}
        <Section title="Card Values">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <Rule label="Ace" value="= 1" />
            <Rule label="2 – 9" value="Face value" />
            <Rule label="10, J, Q, K" value="= 0" />
            <Rule label="Total over 9" value="Drop the tens digit" />
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ background: 'rgba(232,200,106,0.07)', border: '1px solid rgba(232,200,106,0.2)', borderRadius: 8, padding: '8px 12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Example: </span>
              <span style={{ color: '#f5f0e8', fontSize: 12, fontWeight: 700 }}>7 + 6 = 13 → drop the 1 → total is </span>
              <span style={{ color: '#e8c86a', fontSize: 14, fontWeight: 900 }}>3</span>
            </div>
            <div style={{ background: 'rgba(232,200,106,0.07)', border: '1px solid rgba(232,200,106,0.2)', borderRadius: 8, padding: '8px 12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Example: </span>
              <span style={{ color: '#f5f0e8', fontSize: 12, fontWeight: 700 }}>K + 5 = 5 (K = 0) → total is </span>
              <span style={{ color: '#e8c86a', fontSize: 14, fontWeight: 900 }}>5</span>
            </div>
            <div style={{ background: 'rgba(232,200,106,0.07)', border: '1px solid rgba(232,200,106,0.2)', borderRadius: 8, padding: '8px 12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Example: </span>
              <span style={{ color: '#f5f0e8', fontSize: 12, fontWeight: 700 }}>Q + Q + 9 = 9 (Q+Q = 0) → total is </span>
              <span style={{ color: '#e8c86a', fontSize: 14, fontWeight: 900 }}>9</span>
            </div>
          </div>
        </Section>

        {/* Dealing Sequence */}
        <Section title="Dealing Sequence">
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 10 }}>
            Cards are dealt one at a time in this order:
          </p>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { card: '1st card', to: 'Player', color: '#93c5fd' },
              { card: '2nd card', to: 'Banker', color: '#fca5a5' },
              { card: '3rd card', to: 'Player', color: '#93c5fd' },
              { card: '4th card', to: 'Banker', color: '#fca5a5' },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '80px 1fr',
                padding: '8px 12px',
                background: i % 2 === 0 ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.02)',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{row.card}</span>
                <span style={{ color: row.color, fontWeight: 900, fontSize: 13 }}>{row.to}</span>
              </div>
            ))}
            <div style={{
              padding: '8px 12px', background: 'rgba(232,200,106,0.06)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.4)', fontSize: 11,
            }}>
              5th & 6th cards dealt only if third card rules require a draw.
            </div>
          </div>
        </Section>

        {/* Naturals */}
        <Section title="Naturals">
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.7, marginBottom: 10 }}>
            After the first four cards are dealt, check both totals. If either hand has <strong style={{ color: '#f5f0e8' }}>8 or 9</strong>, it is a <strong style={{ color: '#e8c86a' }}>Natural</strong> — no more cards are drawn.
          </p>
          <Rule label="Natural 9 vs Natural 8" value="9 wins" />
          <Rule label="Natural 9 vs Natural 9" value="Tie" />
          <Rule label="Natural 8 vs Natural 8" value="Tie" />
          <Rule label="Natural vs non-natural" value="Natural wins" />
          <Note color="#93c5fd">
            Naturals are the highest possible outcome. Even a standing Player 7 loses to a Natural 8.
          </Note>
        </Section>

        {/* Player Draw Rule */}
        <Section title="Player Draw Rule">
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 8 }}>If no Natural, Player acts first. This rule is unconditional — no exceptions.</p>
          <Rule label="Player total 0 – 5" value="Must draw" />
          <Rule label="Player total 6 – 7" value="Must stand" />
          <Note color="#93c5fd">
            Player never looks at Banker's cards. The draw decision is based solely on the Player's own 2-card total.
          </Note>
        </Section>

        {/* Banker Draw Rule */}
        <Section title="Banker Draw Rule">
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 8 }}>
            <strong style={{ color: 'rgba(255,255,255,0.7)' }}>If Player stood</strong> (total was 6 or 7): Banker draws on 0–5, stands on 6–7. Simple.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 10 }}>
            <strong style={{ color: 'rgba(255,255,255,0.7)' }}>If Player drew a third card</strong>: Banker's decision depends on the Player's third card value:
          </p>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', background: 'rgba(122,24,38,0.4)', padding: '6px 12px' }}>
              <span style={{ color: '#fca5a5', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Banker</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rule</span>
            </div>
            {BANKER_TABLE.map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '60px 1fr',
                padding: '9px 12px',
                background: row.hard ? 'rgba(122,24,38,0.12)' : 'rgba(0,0,0,0.2)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ color: '#fca5a5', fontSize: 14, fontWeight: 900 }}>{row.total}</span>
                <span style={{ color: row.hard ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 1.5 }}>{row.draws}</span>
              </div>
            ))}
          </div>
          <Note color="#c4b5fd">
            The shaded rows (Banker 3–6) are the conditional ones — these require knowing what card the Player drew. Drill these in <strong>Hard mode</strong>.
          </Note>
        </Section>

        {/* Worked Examples */}
        <Section title="Worked Examples">
          <Example label="Example 1 — Player draws, Banker stands">
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 1.8 }}>
              Player: 3 + 2 = <strong style={{ color: '#93c5fd' }}>5</strong> → draws → gets a 4 → total <strong style={{ color: '#93c5fd' }}>9</strong><br />
              Banker: 6 + 1 = <strong style={{ color: '#fca5a5' }}>7</strong> → stands (Player drew, but Banker 7 always stands)<br />
              <strong style={{ color: '#4ade80' }}>Player wins 9 vs 7.</strong>{' '}
              <span style={{ color: '#f472b6' }}>Player drew a 4, total is 9 → Small Ruby 💎</span>
            </div>
          </Example>
          <Example label="Example 2 — Banker conditional draw">
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 1.8 }}>
              Player: 2 + 3 = <strong style={{ color: '#93c5fd' }}>5</strong> → draws → gets a 6 → total <strong style={{ color: '#93c5fd' }}>1</strong><br />
              Banker: 1 + 3 = <strong style={{ color: '#fca5a5' }}>4</strong> → Player drew a 6 (in range 2–7) → Banker draws → gets a 5 → total <strong style={{ color: '#fca5a5' }}>9</strong><br />
              <strong style={{ color: '#4ade80' }}>Banker wins 9 vs 1.</strong>{' '}
              <span style={{ color: '#f472b6' }}>Banker drew a 5, 3-card total 9 → Small Ruby 💎</span>
            </div>
          </Example>
          <Example label="Example 3 — Dragon 7">
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 1.8 }}>
              Player: 5 + 1 = <strong style={{ color: '#93c5fd' }}>6</strong> → stands<br />
              Banker: 3 + 2 = <strong style={{ color: '#fca5a5' }}>5</strong> → Player stood, so Banker draws on 0–5 → gets a 2 → total <strong style={{ color: '#fca5a5' }}>7</strong><br />
              <strong style={{ color: '#4ade80' }}>Banker wins 7 vs 6.</strong>{' '}
              <span style={{ color: '#fbbf24' }}>Banker 3-card 7 → Dragon 7 🐉 (40:1)</span>
            </div>
          </Example>
          <Example label="Example 4 — Natural, no draw">
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 1.8 }}>
              Player: K + 9 = <strong style={{ color: '#93c5fd' }}>9</strong> → Natural!<br />
              Banker: 4 + 3 = <strong style={{ color: '#fca5a5' }}>7</strong><br />
              No more cards drawn. <strong style={{ color: '#4ade80' }}>Player wins 9 vs 7.</strong>{' '}
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>No special outcome.</span>
            </div>
          </Example>
        </Section>


        {/* Payouts */}
        <Section title="All Payouts">
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
                  {row.note && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 2 }}>{row.note}</div>}
                </div>
                <span style={{ color: '#e8c86a', fontSize: 14, fontWeight: 900, fontVariantNumeric: 'tabular-nums', marginLeft: 12 }}>{row.payout}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Special Outcomes */}
        <Section title="Special Outcomes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 13, marginBottom: 4 }}>🐉 Dragon 7 — 40:1</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 1.6 }}>
                Banker wins with exactly 3 cards totalling 7.<br />
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>Mental shortcut: multiply bet × 4, then add a zero.</span>
              </div>
            </div>
            <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#4ade80', fontWeight: 900, fontSize: 13, marginBottom: 4 }}>🐼 Panda 8 — 25:1</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 1.6 }}>
                Player wins with exactly 3 cards totalling 8.<br />
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>Mental shortcut: multiply bet × 100, then divide by 4.</span>
              </div>
            </div>
            <div style={{ background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.3)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#f472b6', fontWeight: 900, fontSize: 13, marginBottom: 4 }}>💎 Small Ruby — 10:1</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 1.6 }}>
                Either side (Player or Banker) has a 3-card total of 9. Pays regardless of who won the main bet.<br />
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>Mental shortcut: add a zero to the bet.</span>
              </div>
            </div>
            <div style={{ background: 'rgba(244,114,182,0.12)', border: '1px solid rgba(244,114,182,0.5)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#f472b6', fontWeight: 900, fontSize: 13, marginBottom: 4 }}>💎💎 Big Ruby — 75:1</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 1.6 }}>
                Both Player and Banker have a 3-card total of 9. Extremely rare.<br />
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>Mental shortcut: multiply bet × 100, then subtract × 25.</span>
              </div>
            </div>
            <div style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#a78bfa', fontWeight: 900, fontSize: 13, marginBottom: 4 }}>Tie — 9:1</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 1.6 }}>
                Both hands have the same final total. Player and Banker bets are returned (push — no win, no loss). Only the Tie bet wins.<br />
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>Mental shortcut: multiply bet × 10, then subtract the bet.</span>
              </div>
            </div>
          </div>
          <Note color="#f472b6">
            Ruby side bets are independent — they pay based on whether a 3-card 9 occurred, not on who won the main bet. A player can win the Ruby bet even if their main Banker or Player bet lost.
          </Note>
        </Section>

        {/* Bonus Bets Explained */}
        <Section title="How Bonus Bets Work">
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.8, marginBottom: 12 }}>
            Bonus bets (Dragon 7, Panda 8, Ruby) are <strong style={{ color: '#e8c86a' }}>side bets</strong> placed separately from the main Player/Banker/Tie bet. They are resolved independently — a player can win a bonus bet even if their main bet lost.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#f5f0e8', fontWeight: 900, fontSize: 12, marginBottom: 4 }}>When are bonus bets paid?</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 1.7 }}>
                After the hand is complete (all cards drawn), check for bonus conditions before paying main bets. Dragon 7 and Panda 8 are checked by result. Ruby is checked by looking at whether either side has a 3-card total of 9.
              </div>
            </div>
            <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 12, marginBottom: 4 }}>🐉 Dragon 7 — when does it pay?</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 1.7 }}>
                Banker must win AND must have exactly 3 cards AND those 3 cards must total 7. All three conditions required. If Banker wins with 2-card 7, Dragon 7 does NOT pay.
              </div>
            </div>
            <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#4ade80', fontWeight: 900, fontSize: 12, marginBottom: 4 }}>🐼 Panda 8 — when does it pay?</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 1.7 }}>
                Player must win AND must have exactly 3 cards AND those 3 cards must total 8. If Player wins with 2-card 8 (Natural), Panda 8 does NOT pay.
              </div>
            </div>
            <div style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ color: '#f472b6', fontWeight: 900, fontSize: 12, marginBottom: 4 }}>💎 Ruby — when does it pay?</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 1.7 }}>
                <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Small Ruby (10:1):</strong> Either Player or Banker (or both) ends with a 3-card total of 9. It does NOT matter who won the hand — Ruby pays based on the 3-card 9 alone.<br /><br />
                <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Big Ruby (75:1):</strong> Both Player AND Banker each end with a 3-card total of 9. Rare. When Big Ruby hits, Small Ruby also pays (two separate payouts).
              </div>
            </div>
          </div>
          <Note color="#f472b6">
            Example: Player has 3 cards totalling 9, Banker has 2 cards totalling 7 (Banker wins). Main bet: Banker bettors win. Ruby: pays 10:1 to anyone who had the Ruby side bet, regardless of who they bet on for the main.
          </Note>
        </Section>

        {/* Mental shortcuts */}
        <Section title="Mental Math Shortcuts">
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 10 }}>Quick ways to calculate side bet payouts in your head. Practice these in the Bonus Math Trainer drill.</p>
          <Rule label="Dragon 7 (×40)" value="×4, then add a zero" />
          <Rule label="Panda 8 (×25)" value="×100 ÷ 4" />
          <Rule label="Small Ruby (×10)" value="Add a zero" />
          <Rule label="Big Ruby (×75)" value="×100 − ×25" />
          <Rule label="Tie (×9)" value="×10 − bet" />
          <div style={{ marginTop: 10, background: 'rgba(232,200,106,0.07)', border: '1px solid rgba(232,200,106,0.2)', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ color: '#e8c86a', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Dragon 7 Example</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 1.7 }}>
              Bet: $35<br />
              $35 × 4 = $140 → add a zero → <strong style={{ color: '#f5f0e8' }}>$1,400 payout</strong>
            </div>
          </div>
          <div style={{ marginTop: 8, background: 'rgba(244,114,182,0.07)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ color: '#f472b6', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Big Ruby Example</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 1.7 }}>
              Bet: $20<br />
              $20 × 100 = $2,000 — $20 × 25 = $500 → $2,000 − $500 = <strong style={{ color: '#f5f0e8' }}>$1,500 payout</strong>
            </div>
          </div>
        </Section>

        {/* Quick Reference */}
        <Section title="Quick Reference — What to Check Each Hand">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { step: '1', text: 'Check for Naturals (8 or 9 on initial 2 cards). If yes, no more draws.', color: '#e8c86a' },
              { step: '2', text: 'Player total 0–5 → draw. Player 6–7 → stand.', color: '#93c5fd' },
              { step: '3', text: 'If Player stood → Banker draws 0–5, stands 6–7.', color: '#fca5a5' },
              { step: '4', text: 'If Player drew → use the Banker conditional table (Banker 3–6 depends on Player\'s 3rd card).', color: '#fca5a5' },
              { step: '5', text: 'Determine winner. Check for Dragon 7, Panda 8, or Ruby (3-card 9 on either side).', color: '#f472b6' },
              { step: '6', text: 'Pay main bets. Pay any side bets. Deduct 5% on Banker wins.', color: '#4ade80' },
            ].map(row => (
              <div key={row.step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${row.color}22`, border: `1px solid ${row.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <span style={{ color: row.color, fontSize: 10, fontWeight: 900 }}>{row.step}</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.6 }}>{row.text}</span>
              </div>
            ))}
          </div>
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
