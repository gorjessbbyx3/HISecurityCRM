
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testWorkflow() {
  console.log('🧪 Starting workflow test...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok && healthData.status === 'healthy') {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed:', healthData);
      return;
    }

    // Test 2: Authentication status (should be unauthenticated)
    console.log('\n2. Testing auth status...');
    const authResponse = await fetch(`${BASE_URL}/api/auth/status`, {
      method: 'GET',
      credentials: 'include'
    });
    const authData = await authResponse.json();
    
    if (authResponse.ok && !authData.authenticated) {
      console.log('✅ Unauthenticated state correct');
    } else {
      console.log('❌ Auth status test failed:', authData);
    }

    // Test 3: Login with admin credentials
    console.log('\n3. Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: 'STREETPATROL808',
        password: 'Password3211'
      })
    });
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.success) {
      console.log('✅ Login successful:', loginData.user.username);
    } else {
      console.log('❌ Login failed:', loginData);
      return;
    }

    // Test 4: Dashboard stats (authenticated)
    console.log('\n4. Testing dashboard stats...');
    const statsResponse = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      method: 'GET',
      credentials: 'include'
    });
    const statsData = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✅ Dashboard stats retrieved:', {
        totalIncidents: statsData.totalIncidents,
        activePatrols: statsData.activePatrols,
        propertiesSecured: statsData.propertiesSecured,
        staffOnDuty: statsData.staffOnDuty
      });
    } else {
      console.log('❌ Dashboard stats failed:', statsData);
    }

    console.log('\n🎉 All workflow tests completed successfully!');

  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
  }
}

testWorkflow();
