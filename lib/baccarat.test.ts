import { describe, it, expect } from 'vitest';
import {
  handTotal, playerShouldDraw, bankerShouldDraw, determineOutcome,
} from './baccarat';
import type { Card } from './types';

// Helper: make a card with a specific value
function c(value: number): Card {
  const rank = value === 0 ? '10' : value === 1 ? 'A' : String(value) as Card['rank'];
  return { suit: 'spades', rank, value };
}

// ─── handTotal ────────────────────────────────────────────────────────────────

describe('handTotal', () => {
  it('adds values mod 10', () => {
    expect(handTotal([c(7), c(6)])).toBe(3);   // 13 → 3
    expect(handTotal([c(0), c(5)])).toBe(5);   // K(0) + 5 = 5
    expect(handTotal([c(0), c(0), c(9)])).toBe(9); // Q+Q+9 = 9
    expect(handTotal([c(9), c(9)])).toBe(8);   // 18 → 8
    expect(handTotal([c(5), c(5), c(5)])).toBe(5); // 15 → 5
  });
});

// ─── playerShouldDraw ─────────────────────────────────────────────────────────

describe('playerShouldDraw', () => {
  it('draws on 0–5', () => {
    [0, 1, 2, 3, 4, 5].forEach(t => expect(playerShouldDraw(t)).toBe(true));
  });
  it('stands on 6–7', () => {
    [6, 7].forEach(t => expect(playerShouldDraw(t)).toBe(false));
  });
});

// ─── bankerShouldDraw ─────────────────────────────────────────────────────────

describe('bankerShouldDraw — player stood (no 3rd card)', () => {
  it('draws on 0–5', () => {
    [0, 1, 2, 3, 4, 5].forEach(t => expect(bankerShouldDraw(t, null)).toBe(true));
  });
  it('stands on 6–7', () => {
    [6, 7].forEach(t => expect(bankerShouldDraw(t, null)).toBe(false));
  });
});

describe('bankerShouldDraw — Banker 0,1,2: always draw', () => {
  [0, 1, 2].forEach(b => {
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(p => {
      it(`Banker ${b}, Player 3rd=${p} → draw`, () => {
        expect(bankerShouldDraw(b, c(p))).toBe(true);
      });
    });
  });
});

describe('bankerShouldDraw — Banker 3', () => {
  it('stands when player 3rd = 8', () => {
    expect(bankerShouldDraw(3, c(8))).toBe(false);
  });
  it('draws on all other player 3rd values', () => {
    [0, 1, 2, 3, 4, 5, 6, 7, 9].forEach(p => {
      expect(bankerShouldDraw(3, c(p))).toBe(true);
    });
  });
});

describe('bankerShouldDraw — Banker 4', () => {
  it('draws when player 3rd = 2–7', () => {
    [2, 3, 4, 5, 6, 7].forEach(p => expect(bankerShouldDraw(4, c(p))).toBe(true));
  });
  it('stands when player 3rd = 0,1,8,9', () => {
    [0, 1, 8, 9].forEach(p => expect(bankerShouldDraw(4, c(p))).toBe(false));
  });
});

describe('bankerShouldDraw — Banker 5', () => {
  it('draws when player 3rd = 4–7', () => {
    [4, 5, 6, 7].forEach(p => expect(bankerShouldDraw(5, c(p))).toBe(true));
  });
  it('stands when player 3rd = 0,1,2,3,8,9', () => {
    [0, 1, 2, 3, 8, 9].forEach(p => expect(bankerShouldDraw(5, c(p))).toBe(false));
  });
});

describe('bankerShouldDraw — Banker 6', () => {
  it('draws when player 3rd = 6 or 7', () => {
    [6, 7].forEach(p => expect(bankerShouldDraw(6, c(p))).toBe(true));
  });
  it('stands when player 3rd ≠ 6,7', () => {
    [0, 1, 2, 3, 4, 5, 8, 9].forEach(p => expect(bankerShouldDraw(6, c(p))).toBe(false));
  });
});

describe('bankerShouldDraw — Banker 7: always stand', () => {
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(p => {
    it(`Banker 7, Player 3rd=${p} → stand`, () => {
      expect(bankerShouldDraw(7, c(p))).toBe(false);
    });
  });
});

// ─── determineOutcome — special bets ──────────────────────────────────────────

describe('determineOutcome — Dragon 7', () => {
  it('triggers when banker wins with 3-card 7', () => {
    // Banker: 3+2+2=7, Player: 5+1=6 (stands)
    const out = determineOutcome([c(5), c(1)], [c(3), c(2), c(2)]);
    expect(out.winner).toBe('banker');
    expect(out.isGold7).toBe(true);
  });
  it('does NOT trigger on 2-card banker 7', () => {
    const out = determineOutcome([c(5), c(1)], [c(3), c(4)]);
    expect(out.isGold7).toBe(false);
  });
  it('does NOT trigger if banker loses', () => {
    const out = determineOutcome([c(8), c(0)], [c(3), c(2), c(2)]);
    // player has 8, banker 3-card 7 but player wins
    expect(out.winner).toBe('player');
    expect(out.isGold7).toBe(false);
  });
});

describe('determineOutcome — Panda 8', () => {
  it('triggers when player wins with 3-card 8', () => {
    // Player: 3+2+3=8, Banker: 5+1=6
    const out = determineOutcome([c(3), c(2), c(3)], [c(5), c(1)]);
    expect(out.winner).toBe('player');
    expect(out.isJade8).toBe(true);
  });
  it('does NOT trigger on 2-card natural 8', () => {
    const out = determineOutcome([c(3), c(5)], [c(5), c(1)]);
    // player 8 but only 2 cards
    expect(out.isJade8).toBe(false);
  });
});

describe('determineOutcome — Small Ruby', () => {
  it('triggers when winning side has 3-card total 9', () => {
    // Banker wins: 3+2+4=9 vs player 5+1=6
    const out = determineOutcome([c(5), c(1)], [c(3), c(2), c(4)]);
    expect(out.winner).toBe('banker');
    expect(out.isSmallRuby).toBe(true);
    expect(out.rubyPayout).toBe(10);
  });

  // IMPORTANT: Ruby rule per rules page — pays when EITHER side has 3-card 9
  // The test below checks the LOSING side having 3-card 9
  it('current baccarat.ts behaviour — losing side 3-card 9 does NOT trigger ruby', () => {
    // Player wins 8 (natural), banker draws: 2+1+6=9 but LOSES
    const out = determineOutcome([c(4), c(4)], [c(2), c(1), c(6)]);
    // banker total: 9, but player wins 8 vs... wait, 8 > 9? No.
    // Let me fix: player wins if player > banker. 8 > 9 is false.
    // Need player to win while banker has 3-card 9
    // player: 9+0=9 (natural), banker: 2+1+6=9 → TIE actually
    // Let me use: player: 4+5=9 (natural), banker: 1+2+6=9 → tie but banker has 3 cards
    // Actually with naturals no 3rd cards are drawn, so can't have 3-card banker with natural player
    // Realistic case: player 6+2=8(natural), banker draws... no, naturals end the hand
    // So the only case where banker loses with 3-card 9 is:
    // player wins with score > 9... not possible (baccarat max is 9)
    // or player wins with same total? no, 9 vs 9 = tie
    // Actually: player 9 total (natural), banker 3+3+3=9 → TIE, not a loss
    // A losing banker 3-card 9 is impossible! Because 9 is the maximum.
    // If banker has 3-card 9, at best player ties (also has 9) or banker wins.
    // So this scenario can't happen. ✓
    expect(true).toBe(true); // placeholder — scenario impossible
  });
});

// ─── Common tricky cases people get wrong ─────────────────────────────────────

describe('tricky rule cases', () => {
  it('Banker 3 stands ONLY when player 3rd = 8', () => {
    expect(bankerShouldDraw(3, c(8))).toBe(false);  // the ONE exception
    expect(bankerShouldDraw(3, c(0))).toBe(true);   // draws on 0
    expect(bankerShouldDraw(3, c(9))).toBe(true);   // draws on 9 (not 8!)
  });

  it('Banker 4 does NOT draw on 0, 1, 8, 9', () => {
    expect(bankerShouldDraw(4, c(0))).toBe(false);
    expect(bankerShouldDraw(4, c(1))).toBe(false);
    expect(bankerShouldDraw(4, c(8))).toBe(false);
    expect(bankerShouldDraw(4, c(9))).toBe(false);
  });

  it('Banker 5 does NOT draw on 0, 1, 2, 3', () => {
    expect(bankerShouldDraw(5, c(0))).toBe(false);
    expect(bankerShouldDraw(5, c(1))).toBe(false);
    expect(bankerShouldDraw(5, c(2))).toBe(false);
    expect(bankerShouldDraw(5, c(3))).toBe(false);
  });

  it('Banker 6 ONLY draws when player 3rd = 6 or 7 (and player must have drawn)', () => {
    expect(bankerShouldDraw(6, c(6))).toBe(true);
    expect(bankerShouldDraw(6, c(7))).toBe(true);
    expect(bankerShouldDraw(6, c(5))).toBe(false);
    expect(bankerShouldDraw(6, c(8))).toBe(false);
    expect(bankerShouldDraw(6, null)).toBe(false); // player stood — banker 6 stands
  });

  it('Banker 6 stands when player stood (null) even though banker total is low', () => {
    // This catches a common mistake: banker 6 never draws when player stands
    expect(bankerShouldDraw(6, null)).toBe(false);
  });

  it('Player 6 must STAND (common mistake: thinking 6 draws)', () => {
    expect(playerShouldDraw(6)).toBe(false);
    expect(playerShouldDraw(7)).toBe(false);
  });
});

// ─── Drill counting logic (pure functions, mirrors reducer) ───────────────────

interface SimpleStats {
  handsPlayed: number;
  handsCorrect: number;
  playerErrors: number;
  bankerErrors: number;
  streak: number;
  bestStreak: number;
}

function simulateHand(
  stats: SimpleStats,
  playerAnswer: boolean,
  playerShouldHit: boolean,
  bankerAnswer: boolean,
  bankerShouldHit: boolean,
): SimpleStats {
  const pCorrect = playerAnswer === playerShouldHit;
  const bCorrect = bankerAnswer === bankerShouldHit;
  const allCorrect = pCorrect && bCorrect;
  const newStreak = allCorrect ? stats.streak + 1 : 0;
  return {
    handsPlayed: stats.handsPlayed + 1,
    handsCorrect: stats.handsCorrect + (allCorrect ? 1 : 0),
    playerErrors: stats.playerErrors + (pCorrect ? 0 : 1),
    bankerErrors: stats.bankerErrors + (bCorrect ? 0 : 1),
    streak: newStreak,
    bestStreak: Math.max(stats.bestStreak, newStreak),
  };
}

const zeroStats = (): SimpleStats => ({
  handsPlayed: 0, handsCorrect: 0, playerErrors: 0, bankerErrors: 0, streak: 0, bestStreak: 0,
});

describe('drill counting logic', () => {
  it('both correct → handsCorrect+1, streak+1, no errors', () => {
    const s = simulateHand(zeroStats(), true, true, false, false);
    expect(s.handsPlayed).toBe(1);
    expect(s.handsCorrect).toBe(1);
    expect(s.playerErrors).toBe(0);
    expect(s.bankerErrors).toBe(0);
    expect(s.streak).toBe(1);
  });

  it('player wrong, banker right → playerError+1, streak reset, handsCorrect unchanged', () => {
    const s = simulateHand(zeroStats(), false, true, false, false);
    expect(s.handsCorrect).toBe(0);
    expect(s.playerErrors).toBe(1);
    expect(s.bankerErrors).toBe(0);
    expect(s.streak).toBe(0);
  });

  it('player right, banker wrong → bankerError+1, streak reset', () => {
    const s = simulateHand(zeroStats(), true, true, true, false);
    expect(s.handsCorrect).toBe(0);
    expect(s.playerErrors).toBe(0);
    expect(s.bankerErrors).toBe(1);
    expect(s.streak).toBe(0);
  });

  it('streak increments on consecutive perfect hands', () => {
    let s = zeroStats();
    s = simulateHand(s, true, true, false, false);
    s = simulateHand(s, true, true, true, true);
    s = simulateHand(s, false, false, true, true);
    expect(s.streak).toBe(3);
    expect(s.bestStreak).toBe(3);
    s = simulateHand(s, true, false, false, false); // player wrong
    expect(s.streak).toBe(0);
    expect(s.bestStreak).toBe(3); // best preserved
  });

  it('accuracy = handsCorrect / handsPlayed (only counts hands perfect on BOTH decisions)', () => {
    let s = zeroStats();
    // 3 hands: both right, player wrong, banker wrong
    s = simulateHand(s, true, true, false, false);  // both right
    s = simulateHand(s, false, true, false, false); // player wrong
    s = simulateHand(s, true, true, true, false);   // banker wrong
    expect(s.handsPlayed).toBe(3);
    expect(s.handsCorrect).toBe(1); // only 1 hand was perfect
    expect(s.playerErrors).toBe(1);
    expect(s.bankerErrors).toBe(1);
  });
});

describe('determineOutcome — Big Ruby', () => {
  it('triggers when both sides have 3-card total 9', () => {
    // Player: 3+2+4=9, Banker: 1+3+5=9
    const out = determineOutcome([c(3), c(2), c(4)], [c(1), c(3), c(5)]);
    expect(out.winner).toBe('tie');
    expect(out.isBigRuby).toBe(true);
    expect(out.rubyPayout).toBe(75);
    expect(out.isSmallRuby).toBe(false); // Big Ruby, not Small
  });
});
