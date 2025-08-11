
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your secrets.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('Password3211', 10);
    
    const adminUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@streetpatrol808.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      badge: 'ADMIN001',
      phone: '(808) 555-0001',
      status: 'active',
      zone: 'central',
      shift: 'day',
      hashedPassword: hashedPassword,
      permissions: ['all'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert admin user
    const { error: userError } = await supabase
      .from('users')
      .upsert(adminUser);

    if (userError) {
      console.log('Admin user already exists or error:', userError.message);
    } else {
      console.log('✅ Admin user created successfully');
    }

    // Sample clients
    const clients = [
      {
        name: 'Honolulu Resort Complex',
        email: 'security@honoluluresort.com',
        phone: '(808) 555-0123',
        company: 'Honolulu Resort Ltd.',
        address: '123 Waikiki Beach Drive, Honolulu, HI 96815',
        contactPerson: 'Maria Santos',
        contractStart: '2024-01-01',
        contractEnd: '2024-12-31',
        status: 'active',
        notes: 'High-profile resort requiring 24/7 security coverage',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Downtown Business Plaza',
        email: 'facilities@downtownplaza.com',
        phone: '(808) 555-0456',
        company: 'Plaza Management Inc.',
        address: '456 King Street, Honolulu, HI 96813',
        contactPerson: 'James Wong',
        contractStart: '2024-03-15',
        contractEnd: '2025-03-14',
        status: 'active',
        notes: 'Commercial building with evening security needs',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for (const client of clients) {
      try {
        const { error } = await supabase
          .from('clients')
          .upsert(client);
        
        if (error) {
          console.log(`Client already exists: ${client.name}`);
        } else {
          console.log(`✅ Created client: ${client.name}`);
        }
      } catch (error) {
        console.log(`Error creating client ${client.name}:`, error.message);
      }
    }

    console.log('✅ Database seeding completed successfully');
    console.log('🔑 Admin credentials:');
    console.log('   Username: STREETPATROL808');
    console.log('   Password: Password3211');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
