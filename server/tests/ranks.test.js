import { describe, it, expect } from 'vitest';
import {
  RANKS,
  XP_RULES,
  rankForXp,
  nextRankForXp,
  rankProgress,
  xpFromOrderTotal,
  discountForXp,
} from '../utils/ranks.js';

describe('rankForXp', () => {
  it('starts everyone at Recruit', () => {
    expect(rankForXp(0).key).toBe('recruit');
  });

  it('promotes exactly on the threshold, not one short of it', () => {
    expect(rankForXp(99).key).toBe('recruit');
    expect(rankForXp(100).key).toBe('squire');
    expect(rankForXp(299).key).toBe('squire');
    expect(rankForXp(300).key).toBe('shieldbearer');
  });

  it('caps at Champion of Zion however much XP is thrown at it', () => {
    expect(rankForXp(1500).key).toBe('champion');
    expect(rankForXp(999999).key).toBe('champion');
  });

  it('treats a missing XP value as zero', () => {
    expect(rankForXp().key).toBe('recruit');
  });
});

describe('nextRankForXp', () => {
  it('points at the rank above the current one', () => {
    expect(nextRankForXp(0).key).toBe('squire');
    expect(nextRankForXp(700).key).toBe('champion');
  });

  it('returns null at the top rank', () => {
    expect(nextRankForXp(1500)).toBeNull();
  });
});

describe('rankProgress', () => {
  it('is 0 on the threshold of a rank', () => {
    expect(rankProgress(300)).toBe(0);
  });

  it('is halfway between two thresholds', () => {
    // Shield Bearer 300 -> Watchman 700, midpoint 500
    expect(rankProgress(500)).toBeCloseTo(0.5);
  });

  it('is 1 at max rank', () => {
    expect(rankProgress(1500)).toBe(1);
    expect(rankProgress(50000)).toBe(1);
  });
});

describe('xpFromOrderTotal', () => {
  it('gives one XP per ten rand, rounded down', () => {
    expect(xpFromOrderTotal(0)).toBe(0);
    expect(xpFromOrderTotal(9)).toBe(0);
    expect(xpFromOrderTotal(10)).toBe(1);
    expect(xpFromOrderTotal(1799)).toBe(179);
  });

  it('uses the documented rule constant', () => {
    expect(xpFromOrderTotal(XP_RULES.RAND_PER_XP)).toBe(1);
  });
});

describe('discountForXp', () => {
  it('gives no discount below Shield Bearer', () => {
    expect(discountForXp(0)).toBe(0);
    expect(discountForXp(299)).toBe(0);
  });

  it('gives 5% from Shield Bearer and 10% at Champion', () => {
    expect(discountForXp(300)).toBe(0.05);
    expect(discountForXp(700)).toBe(0.05);
    expect(discountForXp(1500)).toBe(0.1);
  });
});

describe('the rank table itself', () => {
  it('is ordered by ascending XP so rankForXp can scan it', () => {
    const thresholds = RANKS.map((r) => r.xp);
    expect([...thresholds].sort((a, b) => a - b)).toEqual(thresholds);
  });

  it('never lowers the discount as rank climbs', () => {
    RANKS.forEach((rank, index) => {
      if (index === 0) return;
      expect(rank.discount).toBeGreaterThanOrEqual(RANKS[index - 1].discount);
    });
  });
});
