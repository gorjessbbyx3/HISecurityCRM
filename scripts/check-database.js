
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('📝 Using in-memory storage (no Supabase configuration found)');
  console.log('🗄️  In-memory storage is automatically seeded on server startup');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  try {
    console.log('🔍 Checking database status...');
    
    const tables = [
      'users',
      'clients', 
      'properties',
      'incidents',
      'patrol_reports',
      'appointments',
      'activities',
      'financial_records'
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': ${count} records`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': Error checking table`);
      }
    }

    // Test basic query
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('email, role')
      .limit(1);

    if (userError) {
      console.log('❌ Database query test failed:', userError.message);
    } else {
      console.log('✅ Database connection and queries working');
      if (users && users.length > 0) {
        console.log(`📊 Sample user found: ${users[0].email} (${users[0].role})`);
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase();
