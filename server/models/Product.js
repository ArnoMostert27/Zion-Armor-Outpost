import mongoose from 'mongoose';

export const ARMOR_SLOTS = ['helmet', 'breastplate', 'belt', 'shield', 'sword', 'boots'];

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'A title is required'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    author: { type: String, default: 'Various' },
    publisher: { type: String, default: 'David C Cook' },

    blurb: { type: String, required: true },
    description: { type: String, default: '' },
    verse: { type: String, default: '' },
    verseRef: { type: String, default: '' },

    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'ZAR' },

    category: {
      type: String,
      required: true,
      enum: ['action-bibles', 'kids-comics', 'study-editions', 'devotionals', 'boxed-sets', 'gear'],
    },
    armorSlot: { type: String, enum: ARMOR_SLOTS, required: true },
    tags: [{ type: String, trim: true, lowercase: true }],

    coverImage: { type: String, required: true },
    previewPages: [{ type: String }],

    pageCount: { type: Number, default: 0 },
    ageRange: { type: String, default: 'All ages' },
    format: { type: String, enum: ['hardcover', 'paperback', 'boxed', 'merch'], default: 'hardcover' },

    stock: { type: Number, required: true, default: 0, min: 0 },
    firstEdition: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },

    xpValue: { type: Number, default: 0 },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReports: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

productSchema.virtual('onSale').get(function () {
  return this.compareAtPrice > this.price;
});

// Text index powers the Scout (search) endpoint.
productSchema.index({ title: 'text', blurb: 'text', tags: 'text', author: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
