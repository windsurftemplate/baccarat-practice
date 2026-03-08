# Baccarat Practice — Rules & Features Guide

---

## Baccarat Rules Reference

### Hand Totals
Cards are worth face value (2–9). 10, J, Q, K = 0. Ace = 1. All totals are mod 10 (e.g. 7+6 = 13 → 3).

### Naturals
If either Player or Banker holds a 2-card total of **8 or 9**, it is a Natural. No third cards are drawn. The higher total wins; equal totals are a Tie.

### Player Draw Rule
If no Natural:

| Player Total | Action |
|---|---|
| 0–5 | Draw a third card |
| 6–7 | Stand |

### Banker Draw Rule
**If Player stood** (no third card drawn):

| Banker Total | Action |
|---|---|
| 0–5 | Draw |
| 6–7 | Stand |

**If Player drew a third card**, Banker draws based on Player's third card value:

| Banker Total | Draw when Player's 3rd card is… |
|---|---|
| 0, 1, 2 | Always draw |
| 3 | 0–7, 9 (stand only on 8) |
| 4 | 2–7 |
| 5 | 4–7 |
| 6 | 6–7 |
| 7 | Never draw |

### Special Outcomes
| Name | Condition |
|---|---|
| Dragon 7 | Banker wins with a 3-card total of exactly 7 |
| Panda 8 | Player wins with a 3-card total of exactly 8 |
| Ruby | Banker wins with 3 cards (any total other than Dragon 7) |
| Tie | Both hands have the same total |

---

## Drills

---

### Third Card Rules

Practice Player and Banker draw decisions on every hand.

**Flow of each hand:**
1. Player decision — Hit or Stand?
2. Banker decision — Hit or Stand? (uses Player's 3rd card if drawn)
3. Result shown — correct/wrong feedback
4. Outcome identification — tap Dragon 7 / Panda 8 / Ruby / Tie / No Special Outcome
5. Next Hand unlocked after outcome is selected

**Corrections** are shown below the cards if a decision was wrong, with an explanation of the rule.

#### Modes

**Normal**
Standard untimed practice. Full feedback after each decision. Use for learning the rules at your own pace.

**Timed**
5-second countdown for every decision phase:
- Player Hit or Stand
- Banker Hit or Stand
- Outcome identification

The countdown bar drains at the top of the screen. Timeout auto-answers wrong. Each new decision resets the 5-second clock.

**Streak**
Same as Normal but tracks consecutive perfectly correct hands (both Player and Banker decisions correct). Milestone targets: 10, 25, 50. A single wrong answer resets the streak to 0.

**Hard**
Only deals the genuinely difficult hands — those where the Banker decision depends on the Player's third card value:
- Player total: 0–5 (so Player draws a third card)
- Banker total: 3–6 (conditional draw table applies)
- Naturals are never dealt in this mode (impossible by definition: Player 0–5 and Banker 3–6 cannot be naturals)

Use Hard mode to drill the banker conditional draw table specifically.

**Clock**
Timed deck run-through. Simulates dealing one full deck (52 cards, roughly 8–13 hands).

- Press START to begin — timer starts immediately
- Card counter (X / 52) displayed on the felt
- Progress bar in the header shows shoe consumption
- Clock keeps running regardless of wrong answers
- Clock stops automatically when 52 cards have been dealt
- After the deck is complete: final time and accuracy stats are shown
- Tap Try Again to restart with a fresh shoe

The outcome identification buttons must still be tapped before each Next Hand.

#### Stats Panel
- **Hands Played** — total hands completed
- **Perfect** — hands with both Player and Banker decisions correct, with accuracy %
- **Player Errors** — wrong Player decisions
- **Banker Errors** — wrong Banker decisions
- **Current Streak** — consecutive perfect hands
- **Best Streak** — session high

#### Weakness Heatmap
A grid of Banker total (3–6) × Player's 3rd card (0–9 + None). Each cell shows your accuracy % for that specific situation, colour-coded:
- Green — 100%
- Yellow — 50–99%
- Red — below 50%
- Grey — no data yet

---

### Chip Count

Practice counting a full bank using racks and stacks.

- **Rack** = 100 chips of one denomination
- **Stack** = 20 chips of one denomination
- Bank always includes $100 (purple) chips. May also include $20 (light blue), $5 (red), $1 (green).
- Total bank ranges from $10,000 to $40,000.

After answering, a breakdown panel shows each denomination's subtotal and how they add up.

Wrong answer options are offset by one rack or one stack of a present denomination, so distractors are plausible.

---

### Natural Recognition

Flash 2-card hands. Tap Natural (8 or 9 total) or Not Natural. Speed warm-up — trains your eye to spot naturals instantly before thinking about draw rules.

---

### Hand Totals

Show a 2 or 3-card hand. Tap the correct baccarat total (mod 10). Tests mod-10 arithmetic fluency. Hands include all combinations from 0 to 9.

---

### Payout Calculator

Given a bet amount and a result, calculate the net payout.

**Bonus zones and payouts:**
| Zone | Payout |
|---|---|
| Dragon 7 | 40:1 |
| Panda 8 | 25:1 |
| Small Ruby | 10:1 |
| Big Ruby | 75:1 |
| Tie | 9:1 |

Use the zone tabs at the top to filter to a specific bet type or leave on All for random. Four answer choices are shown. After answering, a chip denomination breakdown is revealed.

---

### Bonus Math Trainer

Build mental speed for bonus payouts using shortcuts, then verify with a step-by-step breakdown.

**Mental math shortcuts:**
| Zone | Shortcut |
|---|---|
| Dragon 7 (40:1) | × 4, then add a zero |
| Panda 8 (25:1) | × 100 ÷ 4 |
| Small Ruby (10:1) | Add a zero |
| Big Ruby (75:1) | × 100 − × 25 |
| Tie (9:1) | × 10 − bet |

The shortcut tip is shown before every question. After answering, a denomination-by-denomination breakdown is revealed showing exactly how the math works.

Per-zone accuracy is tracked and shown in each zone tab button.
