import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

// @desc    List products with search, filter, sort and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    armorSlot,
    tag,
    minPrice,
    maxPrice,
    inStock,
    firstEdition,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = req.query;

  const filter = {};
  if (q) filter.$text = { $search: q };
  if (category) filter.category = { $in: category.split(',') };
  if (armorSlot) filter.armorSlot = { $in: armorSlot.split(',') };
  if (tag) filter.tags = { $in: tag.split(',') };
  if (inStock === 'true') filter.stock = { $gt: 0 };
  if (firstEdition === 'true') filter.firstEdition = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    newest: '-createdAt',
    oldest: 'createdAt',
    'price-asc': 'price',
    'price-desc': '-price',
    rating: '-rating',
    title: 'title',
  };

  const pageNum = Math.max(1, Number(page));
  const perPage = Math.min(48, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort] || '-createdAt')
      .skip((pageNum - 1) * perPage)
      .limit(perPage),
    Product.countDocuments(filter),
  ]);

  res.json({
    items,
    page: pageNum,
    pages: Math.ceil(total / perPage) || 1,
    total,
  });
});

// @desc    Featured rail for the home page
// @route   GET /api/products/featured
// @access  Public
export const getFeatured = asyncHandler(async (req, res) => {
  const items = await Product.find({ featured: true }).limit(8);
  res.json(items);
});

// @desc    One product per armor slot, for the Build Your Armor drawer
// @route   GET /api/products/by-slot
// @access  Public
export const getProductsBySlot = asyncHandler(async (req, res) => {
  const grouped = await Product.aggregate([
    { $match: { stock: { $gt: 0 } } },
    { $sort: { rating: -1 } },
    {
      $group: {
        _id: '$armorSlot',
        products: {
          $push: {
            _id: '$_id',
            title: '$title',
            slug: '$slug',
            price: '$price',
            coverImage: '$coverImage',
            rating: '$rating',
            verse: '$verse',
            verseRef: '$verseRef',
          },
        },
      },
    },
  ]);

  const map = {};
  grouped.forEach((g) => {
    map[g._id] = g.products.slice(0, 8);
  });
  res.json(map);
});

// @desc    Single product by slug, with its field reports
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug.toLowerCase() });
  if (!product) {
    res.status(404);
    throw new Error('That rack is empty');
  }

  const reports = await Review.find({ product: product._id }).sort('-createdAt').limit(20);
  const related = await Product.find({
    _id: { $ne: product._id },
    $or: [{ category: product.category }, { armorSlot: product.armorSlot }],
  }).limit(4);

  res.json({ product, reports, related });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Keeper
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Keeper
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    res.status(404);
    throw new Error('No such product');
  }
  res.json(product);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Keeper
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('No such product');
  }
  await Review.deleteMany({ product: product._id });
  await product.deleteOne();
  res.json({ message: 'Product struck from the ledger' });
});
