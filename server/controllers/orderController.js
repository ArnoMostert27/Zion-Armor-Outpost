import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { xpFromOrderTotal, XP_RULES, rankForXp } from '../utils/ranks.js';
import { calculateTotals } from '../utils/pricing.js';

const makeReference = () =>
  `ZAO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/**
 * Recalculates every money figure on the server from live product prices.
 * Client-supplied prices are never trusted.
 */
const priceOrder = async (rawItems, user) => {
  const ids = rawItems.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids } });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const items = rawItems.map((raw) => {
    const product = byId.get(String(raw.product));
    if (!product) {
      const err = new Error('An item in your satchel no longer exists');
      err.statusCode = 400;
      throw err;
    }
    const qty = Math.max(1, Number(raw.qty) || 1);
    if (product.stock < qty) {
      const err = new Error(`Rack empty: only ${product.stock} left of ${product.title}`);
      err.statusCode = 400;
      throw err;
    }
    return {
      product: product._id,
      title: product.title,
      slug: product.slug,
      coverImage: product.coverImage,
      armorSlot: product.armorSlot,
      price: product.price,
      qty,
    };
  });

  return { items, ...calculateTotals(items, user.xp) };
};

// @desc    Price a satchel without placing an order (live checkout summary)
// @route   POST /api/orders/quote
// @access  Private
export const quoteOrder = asyncHandler(async (req, res) => {
  const { items = [] } = req.body;
  if (!items.length) {
    res.status(400);
    throw new Error('Your satchel is light. Dangerously light.');
  }

  try {
    const quote = await priceOrder(items, req.user);
    res.json({ ...quote, rank: rankForXp(req.user.xp), xpPreview: xpFromOrderTotal(quote.grandTotal) });
  } catch (error) {
    res.status(error.statusCode || 400);
    throw error;
  }
});

// @desc    Place an order (a Supply Run)
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { items = [], dispatch, paymentMethod = 'demo' } = req.body;

  if (!items.length) {
    res.status(400);
    throw new Error('Your satchel is light. Dangerously light.');
  }
  if (!dispatch?.fullName || !dispatch?.line1 || !dispatch?.city || !dispatch?.postalCode) {
    res.status(400);
    throw new Error('Dispatch details are incomplete');
  }

  let priced;
  try {
    priced = await priceOrder(items, req.user);
  } catch (error) {
    res.status(error.statusCode || 400);
    throw error;
  }

  const xpAwarded =
    xpFromOrderTotal(priced.grandTotal) + (priced.isFullArmorSet ? XP_RULES.FULL_ARMOR_SET : 0);

  const order = await Order.create({
    user: req.user._id,
    reference: makeReference(),
    items: priced.items,
    dispatch,
    paymentMethod,
    itemsTotal: priced.itemsTotal,
    shippingTotal: priced.shippingTotal,
    rankDiscount: priced.rankDiscount,
    armorSetDiscount: priced.armorSetDiscount,
    grandTotal: priced.grandTotal,
    isFullArmorSet: priced.isFullArmorSet,
    xpAwarded,
    isPaid: paymentMethod === 'demo',
    paidAt: paymentMethod === 'demo' ? new Date() : undefined,
  });

  // Decrement stock
  await Promise.all(
    priced.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: -i.qty } }))
  );

  // Award XP and badges
  const user = await User.findById(req.user._id);
  user.awardXp(xpAwarded);

  const newBadges = [];
  const orderCount = await Order.countDocuments({ user: user._id });
  if (orderCount === 1 && user.awardBadge('first-blood', 'First Blood')) newBadges.push('first-blood');
  if (priced.grandTotal > 1000 && user.awardBadge('goliath-slayer', 'Goliath Slayer'))
    newBadges.push('goliath-slayer');
  if (priced.isFullArmorSet && user.awardBadge('full-plate', 'Full Plate')) newBadges.push('full-plate');

  const owned = await Order.distinct('items.product', { user: user._id });
  if (owned.length >= 5 && user.awardBadge('collector', 'Collector')) newBadges.push('collector');

  await user.save();

  res.status(201).json({
    order,
    xpAwarded,
    newBadges,
    rank: rankForXp(user.xp),
    xp: user.xp,
  });
});

// @desc    Current user's supply runs
// @route   GET /api/orders/mine
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json(orders);
});

// @desc    One order
// @route   GET /api/orders/:id
// @access  Private (owner or keeper)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('No such supply run');
  }
  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'keeper') {
    res.status(403);
    throw new Error('That run is not yours to read');
  }
  res.json(order);
});

// @desc    All orders
// @route   GET /api/orders
// @access  Keeper
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort('-createdAt');
  res.json(orders);
});

// @desc    Advance an order's status
// @route   PUT /api/orders/:id/status
// @access  Keeper
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('No such supply run');
  }
  order.status = status;
  if (status === 'delivered') order.deliveredAt = new Date();
  await order.save();
  res.json(order);
});

// @desc    Sales figures for the Keeper's Ledger dashboard
// @route   GET /api/orders/stats
// @access  Keeper
export const getOrderStats = asyncHandler(async (req, res) => {
  const [totals] = await Order.aggregate([
    {
      $group: {
        _id: null,
        revenue: { $sum: '$grandTotal' },
        orders: { $sum: 1 },
        units: { $sum: { $sum: '$items.qty' } },
      },
    },
  ]);

  const daily = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$grandTotal' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  const topSellers = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.title',
        units: { $sum: '$items.qty' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
      },
    },
    { $sort: { units: -1 } },
    { $limit: 5 },
  ]);

  const lowStock = await Product.find({ stock: { $lte: 5 } }).select('title stock slug').limit(10);

  res.json({
    revenue: totals?.revenue || 0,
    orders: totals?.orders || 0,
    units: totals?.units || 0,
    daily,
    topSellers,
    lowStock,
  });
});
