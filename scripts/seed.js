
const { storage } = require('../server/storage');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    await storage.seedDatabase();
    console.log('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
