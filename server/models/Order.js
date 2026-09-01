import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    coverImage: { type: String, required: true },
    armorSlot: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reference: { type: String, required: true, unique: true },

    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'An order needs at least one item'],
    },

    dispatch: {
      fullName: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String, default: '' },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'South Africa' },
      phone: { type: String, default: '' },
    },

    // This is a portfolio demo - no payment processor is integrated, and the
    // only method a customer can choose is the clearly-labelled demo one.
    paymentMethod: { type: String, enum: ['demo'], default: 'demo' },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
    },

    itemsTotal: { type: Number, required: true, default: 0 },
    shippingTotal: { type: Number, required: true, default: 0 },
    rankDiscount: { type: Number, required: true, default: 0 },
    armorSetDiscount: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },

    xpAwarded: { type: Number, default: 0 },
    isFullArmorSet: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['placed', 'packing', 'dispatched', 'delivered', 'cancelled'],
      default: 'placed',
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
