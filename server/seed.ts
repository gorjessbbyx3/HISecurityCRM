
import { storage } from "./storage";
import { db } from "./db";
import { sql } from "drizzle-orm";

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Test database connection first
    console.log('🔄 Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');
    
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
