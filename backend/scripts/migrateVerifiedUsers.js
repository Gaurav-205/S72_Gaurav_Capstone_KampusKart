require('dotenv').config({ path: '../.env' }); // or whichever loads it properly depending on where it's run
const mongoose = require('mongoose');
const User = require('../models/User');

const migrate = async () => {
  try {
    // If running from backend folder, path should be .env
    require('dotenv').config();

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kampuskart', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected.');

    const result = await User.updateMany(
      { isEmailVerified: { $exists: false } },
      { $set: { isEmailVerified: true } }
    );
    
    // Also update any explicitly false if they were created before this feature, 
    // but typically they wouldn't have it at all.
    // Let's just update all where isEmailVerified is not true to true for existing ones.
    const result2 = await User.updateMany(
      { isEmailVerified: { $ne: true } },
      { $set: { isEmailVerified: true } }
    );

    console.log(`Updated ${result.modifiedCount + result2.modifiedCount} users to be email verified.`);
    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
