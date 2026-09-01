import { describe, it, expect } from 'vitest';
import { rands, starString, titleCase } from '../lib/format.js';
import { ARMOR, ARMOR_BY_KEY, verseOfTheDay } from '../data/armor.js';

describe('rands', () => {
  it('formats as South African currency with no cents', () => {
    const output = rands(549);
    expect(output).toContain('549');
    expect(output).not.toContain('.00');
  });

  it('handles zero and a missing value', () => {
    expect(rands(0)).toContain('0');
    expect(rands()).toContain('0');
  });
});

describe('starString', () => {
  it('renders five glyphs whatever the rating', () => {
    [0, 1, 2.4, 3.5, 5].forEach((rating) => {
      expect(starString(rating)).toHaveLength(5);
    });
  });

  it('rounds to the nearest whole star', () => {
    expect(starString(4.6)).toBe('★★★★★');
    expect(starString(4.4)).toBe('★★★★☆');
  });
});

describe('titleCase', () => {
  it('turns a slug into readable words', () => {
    expect(titleCase('action-bibles')).toBe('Action Bibles');
    expect(titleCase('boxed_sets')).toBe('Boxed Sets');
  });
});

describe('the armor data', () => {
  it('has exactly six pieces', () => {
    expect(ARMOR).toHaveLength(6);
  });

  it('gives every piece a unique key, category and verse reference', () => {
    expect(new Set(ARMOR.map((a) => a.key)).size).toBe(6);
    expect(new Set(ARMOR.map((a) => a.category)).size).toBe(6);
    ARMOR.forEach((piece) => {
      expect(piece.verseRef).toMatch(/Ephesians 6/);
    });
  });

  it('indexes correctly by key', () => {
    expect(ARMOR_BY_KEY.sword.rack).toBe('Boxed Sets');
  });
});

describe('verseOfTheDay', () => {
  it('always returns a verse with text and a reference', () => {
    const verse = verseOfTheDay();
    expect(verse.text.length).toBeGreaterThan(0);
    expect(verse.ref.length).toBeGreaterThan(0);
  });

  it('is stable within the same day', () => {
    expect(verseOfTheDay()).toEqual(verseOfTheDay());
  });
});
