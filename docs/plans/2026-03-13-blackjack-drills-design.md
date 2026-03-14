# Blackjack Drills Design

Date: 2026-03-13

## Overview

Add a blackjack dealer practice section to the existing baccarat practice app. Blackjack drills live under a separate hub page linked from the main practice hub.

## Navigation Structure

- `/practice` — existing baccarat hub, gains one new "Blackjack Drills" card linking to `/practice/blackjack`
- `/practice/blackjack` — blackjack hub page, same layout/style as baccarat hub, `← Practice` back link
- `/practice/blackjack/[drill]` — individual drill pages

## Drills

### 1. Hand Totals (`/practice/blackjack/hand-totals`)
Show 2–5 cards. Tap the correct blackjack total. Aces auto-select best value (11 unless it would bust, then 1). Busted hands shown in red. 4-button answer grid.

### 2. Anchor Totals (`/practice/blackjack/anchor-totals`)
Blackjack-specific variant of the baccarat anchor totals drill. Fixed anchor card (1–9, default 8) + N random extra cards. Tap the correct blackjack total (not mod-10 — real count up to 21+). Aces auto-best. "No 10s/Face" toggle for random cards. Card picker (1–9) and extra card count picker (1–9) at top.

### 3. Bust or No Bust (`/practice/blackjack/bust-check`)
Flash a 2–5 card hand. Tap Yes (bust) or No (not bust). Two large buttons instead of 4-grid. Instant binary drill for speed.

### 4. Soft vs Hard (`/practice/blackjack/soft-hard`)
Flash a hand. Tap Soft or Hard. Two large buttons. Wrong answer shows brief explanation (e.g. "Soft — the ace counts as 11 without busting"). Good warm-up drill.

### 5. Dealer Action (`/practice/blackjack/dealer-action`)
Show a dealer hand + house rule toggle (H17 = hit soft 17 / S17 = stand soft 17). Tap Hit or Stand. Correct answer follows the selected house rule. Two large buttons.

### 6. Basic Strategy (`/practice/blackjack/basic-strategy`)
Show player hand total + dealer upcard. Tap the correct play: Hit / Stand / Double / Split. Uses standard Vegas multi-deck basic strategy chart. Includes hard totals, soft totals, and pairs. 4-button grid.

### 7. Payout Drill (`/practice/blackjack/payouts`)
Given a bet amount + result type (Blackjack 3:2, Even Money, Insurance 2:1, Push), tap the correct net payout. Bet amounts are round numbers. 4-button answer grid.

### 8. Side Bet Payouts (`/practice/blackjack/side-bets`)
Toggle between two side bets:
- **Upcard** — dealer upcard-based side bet payouts
- **Buster Blackjack** — player wins when dealer busts; payout varies by number of dealer bust cards

Given the scenario, tap the correct payout multiplier. 4-button answer grid.

## Shared UI Pattern

All drills follow the existing baccarat drill structure:
- Header: `← Blackjack` | drill title | Reset button
- Stats bar: Answered / Accuracy / Streak / Best
- Dark felt background (`#0d0d16`), existing CardView component
- 4-button 2×2 answer grid (or 2 large buttons for binary drills)
- Auto-advance 380ms after correct answer; "Next →" button after wrong answer
- Green/red feedback on answer reveal

## Files to Create

- `app/practice/blackjack/page.tsx` — hub page
- `app/practice/blackjack/hand-totals/page.tsx`
- `app/practice/blackjack/anchor-totals/page.tsx`
- `app/practice/blackjack/bust-check/page.tsx`
- `app/practice/blackjack/soft-hard/page.tsx`
- `app/practice/blackjack/dealer-action/page.tsx`
- `app/practice/blackjack/basic-strategy/page.tsx`
- `app/practice/blackjack/payouts/page.tsx`
- `app/practice/blackjack/side-bets/page.tsx`

## Files to Modify

- `app/practice/page.tsx` — add "Blackjack Drills" card to `DRILLS` array
