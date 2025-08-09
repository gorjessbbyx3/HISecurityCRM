
import { storage } from "./storage";

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // This will create the admin user and basic data
    await storage.seedDatabase();
    
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };
