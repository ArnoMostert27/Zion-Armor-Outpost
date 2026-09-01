import asyncHandler from 'express-async-handler';
import Product, { ARMOR_SLOTS } from '../models/Product.js';

/** Canonical armor slot metadata - the spine of the whole site. */
export const ARMOR_META = [
  {
    key: 'helmet',
    name: 'Helmet of Salvation',
    verseRef: 'Ephesians 6:17',
    verse: 'Take the helmet of salvation.',
    category: 'kids-comics',
    blurb: 'Guard the mind. Where the story starts for the youngest readers.',
  },
  {
    key: 'breastplate',
    name: 'Breastplate of Righteousness',
    verseRef: 'Ephesians 6:14',
    verse: 'With the breastplate of righteousness in place.',
    category: 'action-bibles',
    blurb: 'The core of the kit. The full Action Bible line.',
  },
  {
    key: 'belt',
    name: 'Belt of Truth',
    verseRef: 'Ephesians 6:14',
    verse: 'With the belt of truth buckled around your waist.',
    category: 'study-editions',
    blurb: 'Study editions and handbooks that hold everything together.',
  },
  {
    key: 'shield',
    name: 'Shield of Faith',
    verseRef: 'Ephesians 6:16',
    verse: 'Take up the shield of faith.',
    category: 'devotionals',
    blurb: 'Devotionals and daily readings for when the arrows come.',
  },
  {
    key: 'sword',
    name: 'Sword of the Spirit',
    verseRef: 'Ephesians 6:17',
    verse: 'The sword of the Spirit, which is the word of God.',
    category: 'boxed-sets',
    blurb: 'Boxed sets and collections. The whole armoury in one crate.',
  },
  {
    key: 'boots',
    name: 'Boots of the Gospel',
    verseRef: 'Ephesians 6:15',
    verse: 'With your feet fitted with readiness.',
    category: 'gear',
    blurb: 'Gear, posters and everything you carry out the door.',
  },
];

export const ARMOR_SET_DISCOUNT_RATE = 0.15;

// @desc    Armor slot metadata for the Build Your Armor experience
// @route   GET /api/bundle/slots
// @access  Public
export const getArmorSlots = asyncHandler(async (req, res) => {
  res.json({ slots: ARMOR_META, discountRate: ARMOR_SET_DISCOUNT_RATE });
});

// @desc    Validate a six-slot selection and return the saving
// @route   POST /api/bundle/validate
// @access  Public
export const validateBundle = asyncHandler(async (req, res) => {
  const { selection = {} } = req.body;

  const ids = ARMOR_SLOTS.map((slot) => selection[slot]).filter(Boolean);
  const products = await Product.find({ _id: { $in: ids } });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const filled = [];
  const missing = [];
  let subtotal = 0;

  for (const slot of ARMOR_SLOTS) {
    const id = selection[slot];
    const product = id ? byId.get(String(id)) : null;
    if (!product) {
      missing.push(slot);
      continue;
    }
    if (product.armorSlot !== slot) {
      res.status(400);
      throw new Error(`${product.title} does not belong in the ${slot} slot`);
    }
    subtotal += product.price;
    filled.push({
      slot,
      _id: product._id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      coverImage: product.coverImage,
    });
  }

  const complete = missing.length === 0;
  const discount = complete ? Math.round(subtotal * ARMOR_SET_DISCOUNT_RATE) : 0;

  res.json({
    complete,
    filled,
    missing,
    subtotal,
    discount,
    total: subtotal - discount,
    discountRate: ARMOR_SET_DISCOUNT_RATE,
  });
});
