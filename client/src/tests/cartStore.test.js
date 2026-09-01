import { describe, it, expect, beforeEach } from 'vitest';
import useCart from '../store/cartStore.js';

const product = (id, price, armorSlot) => ({
  _id: id,
  slug: `slug-${id}`,
  title: `Title ${id}`,
  price,
  coverImage: `/covers/${id}.svg`,
  armorSlot,
});

describe('the Satchel', () => {
  beforeEach(() => {
    useCart.setState({ items: [], open: false, lastAdded: null });
  });

  it('starts empty', () => {
    expect(useCart.getState().items).toHaveLength(0);
    expect(useCart.getState().count()).toBe(0);
    expect(useCart.getState().subtotal()).toBe(0);
  });

  it('adds a product', () => {
    useCart.getState().add(product('a', 100, 'sword'));
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().count()).toBe(1);
  });

  it('increments quantity instead of duplicating a line', () => {
    useCart.getState().add(product('a', 100, 'sword'));
    useCart.getState().add(product('a', 100, 'sword'), 2);
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].qty).toBe(3);
    expect(useCart.getState().count()).toBe(3);
  });

  it('totals price times quantity across lines', () => {
    useCart.getState().add(product('a', 100, 'sword'), 2);
    useCart.getState().add(product('b', 50, 'shield'), 3);
    expect(useCart.getState().subtotal()).toBe(350);
  });

  it('removes a line when quantity drops to zero', () => {
    useCart.getState().add(product('a', 100, 'sword'));
    useCart.getState().setQty('a', 0);
    expect(useCart.getState().items).toHaveLength(0);
  });

  it('removes a line on a negative quantity too', () => {
    useCart.getState().add(product('a', 100, 'sword'));
    useCart.getState().setQty('a', -5);
    expect(useCart.getState().items).toHaveLength(0);
  });

  it('reports the armor slots it covers, without duplicates', () => {
    useCart.getState().add(product('a', 100, 'sword'));
    useCart.getState().add(product('b', 100, 'sword'));
    useCart.getState().add(product('c', 100, 'shield'));
    expect(useCart.getState().slotsCovered().sort()).toEqual(['shield', 'sword']);
  });

  it('builds an order payload of ids and quantities only', () => {
    useCart.getState().add(product('a', 100, 'sword'), 2);
    expect(useCart.getState().payload()).toEqual([{ product: 'a', qty: 2 }]);
  });

  it('never sends prices to the server - the server reprices', () => {
    useCart.getState().add(product('a', 100, 'sword'));
    const keys = Object.keys(useCart.getState().payload()[0]);
    expect(keys).not.toContain('price');
  });

  it('empties on clear', () => {
    useCart.getState().add(product('a', 100, 'sword'));
    useCart.getState().clear();
    expect(useCart.getState().items).toHaveLength(0);
  });

  it('adds a whole armor set in one call', () => {
    useCart
      .getState()
      .addMany([product('a', 100, 'helmet'), product('b', 100, 'sword')]);
    expect(useCart.getState().count()).toBe(2);
  });
});
