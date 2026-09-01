import { describe, it, expect } from 'vitest';
import {
  calculateTotals,
  SHIPPING_FLAT,
  FREE_SHIPPING_THRESHOLD,
  ARMOR_SET_DISCOUNT_RATE,
} from '../utils/pricing.js';

const item = (price, armorSlot, qty = 1) => ({ price, armorSlot, qty });

/** A satchel covering all six armor slots. */
const fullSet = (price = 100) => [
  item(price, 'helmet'),
  item(price, 'breastplate'),
  item(price, 'belt'),
  item(price, 'shield'),
  item(price, 'sword'),
  item(price, 'boots'),
];

describe('calculateTotals - basics', () => {
  it('sums price times quantity', () => {
    const result = calculateTotals([item(100, 'sword', 2), item(50, 'shield', 3)], 0);
    expect(result.itemsTotal).toBe(350);
  });

  it('returns zeroes for an empty satchel', () => {
    const result = calculateTotals([], 0);
    expect(result.itemsTotal).toBe(0);
    expect(result.grandTotal).toBe(SHIPPING_FLAT);
    expect(result.isFullArmorSet).toBe(false);
  });
});

describe('calculateTotals - shipping', () => {
  it('charges flat shipping below the free threshold', () => {
    const result = calculateTotals([item(FREE_SHIPPING_THRESHOLD - 1, 'sword')], 0);
    expect(result.shippingTotal).toBe(SHIPPING_FLAT);
  });

  it('is free exactly on the threshold', () => {
    const result = calculateTotals([item(FREE_SHIPPING_THRESHOLD, 'sword')], 0);
    expect(result.shippingTotal).toBe(0);
  });

  it('decides shipping on the discounted subtotal, not the raw one', () => {
    // R520 raw, but a 10% Champion discount drops it to R468 - under the threshold.
    const result = calculateTotals([item(520, 'sword')], 1500);
    expect(result.rankDiscount).toBe(52);
    expect(result.shippingTotal).toBe(SHIPPING_FLAT);
  });
});

describe('calculateTotals - armor set', () => {
  it('does not flag a set when a slot is missing', () => {
    const result = calculateTotals(fullSet().slice(0, 5), 0);
    expect(result.isFullArmorSet).toBe(false);
    expect(result.armorSetDiscount).toBe(0);
  });

  it('flags a complete set and applies the set discount', () => {
    const result = calculateTotals(fullSet(100), 0);
    expect(result.isFullArmorSet).toBe(true);
    expect(result.itemsTotal).toBe(600);
    expect(result.armorSetDiscount).toBe(Math.round(600 * ARMOR_SET_DISCOUNT_RATE));
  });

  it('still counts as a set when a slot is duplicated', () => {
    const result = calculateTotals([...fullSet(100), item(100, 'sword')], 0);
    expect(result.isFullArmorSet).toBe(true);
  });
});

describe('calculateTotals - stacking discounts', () => {
  it('applies the rank discount after the set discount, not on top of the raw total', () => {
    const result = calculateTotals(fullSet(100), 1500); // Champion, 10%
    expect(result.itemsTotal).toBe(600);
    expect(result.armorSetDiscount).toBe(90); // 15% of 600
    expect(result.rankDiscount).toBe(51); // 10% of 510, not of 600
  });

  it('can discount an order back under the free-shipping threshold', () => {
    // R600 of goods qualifies for free shipping, but 15% + 10% off drops the
    // subtotal to R459, which is below R500 - so shipping is charged again.
    const result = calculateTotals(fullSet(100), 1500);
    const subtotal = result.itemsTotal - result.armorSetDiscount - result.rankDiscount;
    expect(subtotal).toBe(459);
    expect(subtotal).toBeLessThan(FREE_SHIPPING_THRESHOLD);
    expect(result.shippingTotal).toBe(SHIPPING_FLAT);
    expect(result.grandTotal).toBe(459 + SHIPPING_FLAT);
  });

  it('never produces a negative total', () => {
    const result = calculateTotals([item(1, 'sword')], 1500);
    expect(result.grandTotal).toBeGreaterThan(0);
  });

  it('returns whole rands so the stored order matches what was displayed', () => {
    const result = calculateTotals([item(333, 'sword'), item(167, 'shield')], 300);
    expect(Number.isInteger(result.rankDiscount)).toBe(true);
    expect(Number.isInteger(result.grandTotal)).toBe(true);
  });
});
