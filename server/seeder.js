import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Review from './models/Review.js';
import ReadingPlan from './models/ReadingPlan.js';

import users from './data/users.js';
import products from './data/products.js';
import plans from './data/plans.js';

dotenv.config();
await connectDB();

const wipe = async () => {
  await Promise.all([
    Order.deleteMany(),
    Review.deleteMany(),
    Product.deleteMany(),
    User.deleteMany(),
    ReadingPlan.deleteMany(),
  ]);
};

const importData = async () => {
  try {
    await wipe();

    // create() runs the pre-save hook so passwords get hashed
    const createdUsers = await User.create(users);
    const createdProducts = await Product.insertMany(products);

    const bySlug = new Map(createdProducts.map((p) => [p.slug, p]));
    const planDocs = plans.map((plan) => ({
      ...plan,
      product:
        plan.slug === 'shepherd-and-the-giant'
          ? bySlug.get('little-shield-david')?._id
          : plan.slug === 'night-watch-plan'
          ? bySlug.get('night-watch-30-readings')?._id
          : bySlug.get('armor-notes-ephesians-six')?._id,
    }));
    await ReadingPlan.insertMany(planDocs);

    console.log('\x1b[32m[seeder] Outpost stocked.\x1b[0m');
    console.log(`  users:    ${createdUsers.length}`);
    console.log(`  products: ${createdProducts.length}`);
    console.log(`  plans:    ${planDocs.length}`);
    console.log('\n  Keeper login: keeper@zionarmor.dev / keeper123');
    process.exit();
  } catch (error) {
    console.error(`\x1b[31m[seeder] ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await wipe();
    console.log('\x1b[33m[seeder] Outpost cleared.\x1b[0m');
    process.exit();
  } catch (error) {
    console.error(`\x1b[31m[seeder] ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') destroyData();
else importData();
