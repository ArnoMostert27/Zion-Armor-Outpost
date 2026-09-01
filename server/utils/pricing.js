/**
 * Order pricing maths, kept free of database access so it can be unit tested.
 * The controller is responsible for loading products and checking stock; this
 * module only decides what the numbers are.
 */

import { ARMOR_SLOTS } from '../models/Product.js';
import { discountForXp } from './ranks.js';

export const SHIPPING_FLAT = 75;
export const FREE_SHIPPING_THRESHOLD = 500;
export const ARMOR_SET_DISCOUNT_RATE = 0.15;

/**
 * Works out every money figure for an order.
 *
 * @param {Array<{price:number, qty:number, armorSlot:string}>} items priced from live products
 * @param {number} userXp the buyer's XP, which sets their rank discount
 * @returns {{itemsTotal:number, armorSetDiscount:number, rankDiscount:number,
 *            shippingTotal:number, grandTotal:number, isFullArmorSet:boolean}}
 */
export const calculateTotals = (items = [], userXp = 0) => {
  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const slotsCovered = new Set(items.map((item) => item.armorSlot));
  const isFullArmorSet = ARMOR_SLOTS.every((slot) => slotsCovered.has(slot));

  const armorSetDiscount = isFullArmorSet ? Math.round(itemsTotal * ARMOR_SET_DISCOUNT_RATE) : 0;

  const rate = discountForXp(userXp);
  const rankDiscount = Math.round((itemsTotal - armorSetDiscount) * rate);

  const subtotalAfterDiscounts = itemsTotal - armorSetDiscount - rankDiscount;
  const shippingTotal = subtotalAfterDiscounts >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;

  return {
    itemsTotal,
    armorSetDiscount,
    rankDiscount,
    shippingTotal,
    grandTotal: subtotalAfterDiscounts + shippingTotal,
    isFullArmorSet,
  };
};

export default calculateTotals;
