const mongoose = require('mongoose');
const User = require('../src/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imras';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Migrate roles from old format to new format
const migrateRoles = async () => {
  try {
    console.log('Starting role migration...\n');

    // Update Admin -> ADMIN
    const adminResult = await mongoose.connection.db.collection('users').updateMany(
      { role: 'Admin' },
      { $set: { role: 'ADMIN' } }
    );
    console.log(`✓ Updated ${adminResult.modifiedCount} Admin users to ADMIN`);

    // Update Manager -> INVENTORY_MANAGER
    const managerResult = await mongoose.connection.db.collection('users').updateMany(
      { role: 'Manager' },
      { $set: { role: 'INVENTORY_MANAGER' } }
    );
    console.log(`✓ Updated ${managerResult.modifiedCount} Manager users to INVENTORY_MANAGER`);

    // Update Staff -> WAREHOUSE_STAFF
    const staffResult = await mongoose.connection.db.collection('users').updateMany(
      { role: 'Staff' },
      { $set: { role: 'WAREHOUSE_STAFF' } }
    );
    console.log(`✓ Updated ${staffResult.modifiedCount} Staff users to WAREHOUSE_STAFF`);

    console.log('\n✓ Role migration completed successfully!');
    console.log(`Total users updated: ${adminResult.modifiedCount + managerResult.modifiedCount + staffResult.modifiedCount}`);

    // Show current role distribution
    const roleCounts = await mongoose.connection.db.collection('users').aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]).toArray();

    console.log('\nCurrent role distribution:');
    roleCounts.forEach(role => {
      console.log(`  ${role._id}: ${role.count} users`);
    });

  } catch (error) {
    console.error('✗ Migration error:', error);
  }
};

// Main execution
const run = async () => {
  await connectDB();
  await migrateRoles();
  await mongoose.connection.close();
  console.log('\n✓ Database connection closed');
  process.exit(0);
};

run();
