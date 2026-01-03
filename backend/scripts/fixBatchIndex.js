const mongoose = require('mongoose');
require('dotenv').config();

const fixBatchIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/imras', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Get the Batch collection
    const db = mongoose.connection.db;
    const batchCollection = db.collection('batches');

    // Drop the old unique index on batchNumber
    try {
      await batchCollection.dropIndex('batchNumber_1');
      console.log('✓ Dropped old unique index on batchNumber');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ Index batchNumber_1 does not exist (already dropped)');
      } else {
        console.log('Error dropping index:', error.message);
      }
    }

    // Create new compound unique index
    try {
      await batchCollection.createIndex(
        { batchNumber: 1, warehouse: 1 }, 
        { unique: true, name: 'batchNumber_warehouse_unique' }
      );
      console.log('✓ Created new compound unique index on (batchNumber, warehouse)');
    } catch (error) {
      console.log('Error creating index:', error.message);
    }

    // List all indexes
    const indexes = await batchCollection.indexes();
    console.log('\nCurrent indexes on batches collection:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

fixBatchIndex();
