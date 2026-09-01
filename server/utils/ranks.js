/**
 * The Armor Rank progression engine.
 * Pure functions only - no database access - so it can be unit tested easily.
 */

export const RANKS = [
  { key: 'recruit', name: 'Recruit', xp: 0, discount: 0, perk: 'Welcome to the Outpost.' },
  { key: 'squire', name: 'Squire', xp: 100, discount: 0, perk: 'Free shipping over R500.' },
  { key: 'shieldbearer', name: 'Shield Bearer', xp: 300, discount: 0.05, perk: '5% off every requisition.' },
  { key: 'watchman', name: 'Watchman', xp: 700, discount: 0.05, perk: 'Early access to new arrivals.' },
  { key: 'champion', name: 'Champion of Zion', xp: 1500, discount: 0.1, perk: '10% off and the Champion sigil.' },
];

export const XP_RULES = {
  RAND_PER_XP: 10, // 1 XP per R10 spent
  REVIEW: 25,
  READING_PLAN: 100,
  FULL_ARMOR_SET: 150,
  DAILY_VISIT: 5,
};

export const BADGES = [
  { key: 'first-blood', name: 'First Blood', description: 'Completed your first supply run.' },
  { key: 'goliath-slayer', name: 'Goliath Slayer', description: 'A single requisition over R1000.' },
  { key: 'full-plate', name: 'Full Plate', description: 'Completed a six-piece armor set.' },
  { key: 'scribe', name: 'Scribe', description: 'Filed ten field reports.' },
  { key: 'faithful-watch', name: 'Faithful Watch', description: 'Thirty day visit streak.' },
  { key: 'collector', name: 'Collector', description: 'Own five or more titles.' },
];

/** Returns the rank object for a given XP total. */
export const rankForXp = (xp = 0) => {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.xp) current = rank;
  }
  return current;
};

/** Returns the next rank, or null if already at the top. */
export const nextRankForXp = (xp = 0) => {
  return RANKS.find((rank) => rank.xp > xp) || null;
};

/** Progress (0-1) toward the next rank. Returns 1 at max rank. */
export const rankProgress = (xp = 0) => {
  const current = rankForXp(xp);
  const next = nextRankForXp(xp);
  if (!next) return 1;
  const span = next.xp - current.xp;
  return span <= 0 ? 1 : (xp - current.xp) / span;
};

/** XP earned from an order total in Rand. */
export const xpFromOrderTotal = (total = 0) => Math.floor(total / XP_RULES.RAND_PER_XP);

/** The member discount rate for a given XP total. */
export const discountForXp = (xp = 0) => rankForXp(xp).discount;

export default {
  RANKS,
  BADGES,
  XP_RULES,
  rankForXp,
  nextRankForXp,
  rankProgress,
  xpFromOrderTotal,
  discountForXp,
};
