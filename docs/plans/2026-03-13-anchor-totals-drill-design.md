# Anchor Totals Drill — Design

**Date:** 2026-03-13
**Status:** Approved

## Summary

Add a new drill called "Anchor Totals" to the baccarat practice app. The drill fixes one card value per session and deals two random cards alongside it. The user taps the baccarat total. Designed to build speed with specific card values (e.g. 8s) that the user finds difficult.

## Problem

The existing Hand Totals drill uses fully random 3-card hands. Users who struggle with a particular card value (e.g. 8) have no way to isolate and drill that specific scenario.

## Design

### Route

`/practice/anchor-totals` — new standalone page, same structure as the existing Hand Totals drill.

### Layout

1. **Header:** `← Drills` | `🎯 Anchor Totals` | `Reset` button
2. **Stats bar:** Answered / Accuracy / Streak / Best (same as Hand Totals)
3. **Card picker row:** buttons `1 2 3 4 5 6 7 8 9` — active button highlighted in gold. Default: **8**
4. **Felt area:**
   - Prompt: "What is the baccarat total?"
   - Three cards: anchor card (subtle gold border) + 2 random cards
   - Feedback below cards (green correct / red wrong, shows breakdown on wrong)
5. **4-button 2×2 answer grid** (0–9, same `makeOptions` logic as Hand Totals)
6. Auto-advances on correct; shows "Next →" button on wrong

### Behavior

- Anchor card: value fixed to selected number, suit is random each round
- Switching anchor starts a new round immediately, stats are preserved
- Card picker stays visible so switching requires no navigation
- Stats track across anchor changes within a session

### Practice Hub Entry

Added to `DRILLS` array in `app/practice/page.tsx`:

```
href: '/practice/anchor-totals'
title: 'Anchor Totals'
subtitle: 'Count with a fixed card'
description: 'Pick a card value (1–9) to anchor every hand. Two random cards are added — tap the total. Great for drilling 8s and 9s.'
icon: '🎯'
color: teal (#0f766e)
```

## Files Changed

| File | Change |
|------|--------|
| `app/practice/anchor-totals/page.tsx` | New — drill component |
| `app/practice/page.tsx` | Add entry to DRILLS array |
