const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Property = require('../models/Property');

async function backfillSlugs() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sortify_stays';
    console.log('Connecting to MongoDB...', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const properties = await Property.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
    console.log(`Found ${properties.length} properties without slugs.`);

    let count = 0;
    for (const p of properties) {
      await p.save(); // This will trigger the pre-save hook which generates the slug
      count++;
    }

    console.log(`Successfully generated slugs for ${count} properties.`);
  } catch (error) {
    console.error('Error backfilling slugs:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

backfillSlugs();
