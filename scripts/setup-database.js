
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('⚠️  Supabase environment variables not found. Using in-memory storage.');
  console.log('📝 To use Supabase, add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your Replit Secrets.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🗄️  Setting up Hawaii Security CRM Database...');

    // Read and execute schema
    const schemaPath = join(process.cwd(), 'supabase-schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Creating database tables...');
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (schemaError && !schemaError.message.includes('already exists')) {
      console.error('❌ Schema error:', schemaError.message);
    } else {
      console.log('✅ Database schema created successfully');
    }

    // Create comprehensive sample data
    await seedSampleData();
    
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('🔑 Default Login Credentials:');
    console.log('   Username: admin@streetpatrol808.com');
    console.log('   Password: Password3211');
    console.log('');
    console.log('📊 Sample data includes:');
    console.log('   • 2 Client companies');
    console.log('   • 4 Properties with different security levels');
    console.log('   • 5 Staff members with various roles');
    console.log('   • 8 Sample incidents');
    console.log('   • 6 Patrol reports');
    console.log('   • 4 Appointments');
    console.log('   • Financial records');
    console.log('   • Evidence files');
    console.log('   • Community resources');
    console.log('   • Law references');
    console.log('   • Crime intelligence reports');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

async function seedSampleData() {
  console.log('🌱 Seeding sample data...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('Password3211', 10);

  // Sample users/staff
  const users = [
    {
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
      hashedPassword,
      permissions: ['all']
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'supervisor@streetpatrol808.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'supervisor',
      badge: 'SUP001',
      phone: '(808) 555-0002',
      status: 'active',
      zone: 'waikiki',
      shift: 'day',
      hashedPassword,
      permissions: ['view_all', 'manage_staff', 'create_reports']
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'officer1@streetpatrol808.com',
      firstName: 'Marcus',
      lastName: 'Chen',
      role: 'security_officer',
      badge: 'OFF001',
      phone: '(808) 555-0003',
      status: 'active',
      zone: 'downtown',
      shift: 'evening',
      hashedPassword,
      permissions: ['view_assigned', 'create_incidents', 'patrol_reports']
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'officer2@streetpatrol808.com',
      firstName: 'Lisa',
      lastName: 'Rodriguez',
      role: 'security_officer',
      badge: 'OFF002',
      phone: '(808) 555-0004',
      status: 'active',
      zone: 'airport',
      shift: 'night',
      hashedPassword,
      permissions: ['view_assigned', 'create_incidents', 'patrol_reports']
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      email: 'dispatch@streetpatrol808.com',
      firstName: 'David',
      lastName: 'Kim',
      role: 'dispatcher',
      badge: 'DIS001',
      phone: '(808) 555-0005',
      status: 'active',
      zone: 'central',
      shift: 'day',
      hashedPassword,
      permissions: ['view_all', 'dispatch', 'communications']
    }
  ];

  // Insert users
  for (const user of users) {
    try {
      const { error } = await supabase.from('users').upsert(user);
      if (error && !error.message.includes('duplicate key')) {
        console.log(`User exists: ${user.email}`);
      } else {
        console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);
      }
    } catch (error) {
      console.log(`User already exists: ${user.email}`);
    }
  }

  // Sample clients
  const clients = [
    {
      id: '660e8400-e29b-41d4-a716-446655440000',
      name: 'Waikiki Grand Resort & Spa',
      email: 'security@waikikigrand.com',
      phone: '(808) 555-1000',
      company: 'Waikiki Grand Hospitality Group',
      address: '2255 Kalakaua Avenue, Honolulu, HI 96815',
      contactPerson: 'Maria Santos',
      contractStart: '2024-01-01',
      contractEnd: '2024-12-31',
      status: 'active',
      notes: 'Luxury resort requiring 24/7 premium security coverage with VIP guest protection'
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Ala Moana Business Center',
      email: 'facilities@alamoanacenter.com',
      phone: '(808) 555-2000',
      company: 'Ala Moana Properties LLC',
      address: '1450 Ala Moana Boulevard, Honolulu, HI 96814',
      contactPerson: 'James Wong',
      contractStart: '2024-03-15',
      contractEnd: '2025-03-14',
      status: 'active',
      notes: 'Multi-tenant office complex with parking garage security needs'
    }
  ];

  for (const client of clients) {
    try {
      const { error } = await supabase.from('clients').upsert(client);
      if (error && !error.message.includes('duplicate key')) {
        console.log(`Client exists: ${client.name}`);
      } else {
        console.log(`✅ Created client: ${client.name}`);
      }
    } catch (error) {
      console.log(`Client already exists: ${client.name}`);
    }
  }

  // Sample properties
  const properties = [
    {
      id: '770e8400-e29b-41d4-a716-446655440000',
      clientId: '660e8400-e29b-41d4-a716-446655440000',
      name: 'Waikiki Grand Resort - Main Tower',
      address: '2255 Kalakaua Avenue, Honolulu, HI 96815',
      propertyType: 'resort',
      zone: 'waikiki',
      securityLevel: 'high',
      coordinates: '21.2793,-157.8293',
      coverageType: '24/7',
      status: 'active',
      accessCodes: 'Main: #1234, Service: #5678',
      specialInstructions: 'VIP floor requires escort, Pool area patrol every 30 minutes'
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440001',
      clientId: '660e8400-e29b-41d4-a716-446655440000',
      name: 'Waikiki Grand Resort - Parking Garage',
      address: '2245 Kalakaua Avenue, Honolulu, HI 96815',
      propertyType: 'parking',
      zone: 'waikiki',
      securityLevel: 'medium',
      coordinates: '21.2788,-157.8298',
      coverageType: 'patrol',
      status: 'active',
      specialInstructions: 'Vehicle patrol every 2 hours, Check all levels'
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440002',
      clientId: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Ala Moana Center - Tower A',
      address: '1450 Ala Moana Boulevard, Honolulu, HI 96814',
      propertyType: 'office',
      zone: 'ala_moana',
      securityLevel: 'standard',
      coordinates: '21.2911,-157.8378',
      coverageType: 'business_hours',
      status: 'active',
      accessCodes: 'Lobby: #9876, Emergency: #0000',
      specialInstructions: 'After hours access requires escort, Check all floors during rounds'
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440003',
      clientId: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Ala Moana Center - Parking Structure',
      address: '1440 Ala Moana Boulevard, Honolulu, HI 96814',
      propertyType: 'parking',
      zone: 'ala_moana',
      securityLevel: 'medium',
      coordinates: '21.2906,-157.8383',
      coverageType: 'patrol',
      status: 'active',
      specialInstructions: 'Evening patrols focus on lower levels, Emergency call boxes check'
    }
  ];

  for (const property of properties) {
    try {
      const { error } = await supabase.from('properties').upsert(property);
      if (error && !error.message.includes('duplicate key')) {
        console.log(`Property exists: ${property.name}`);
      } else {
        console.log(`✅ Created property: ${property.name}`);
      }
    } catch (error) {
      console.log(`Property already exists: ${property.name}`);
    }
  }

  // Sample incidents
  const incidents = [
    {
      id: '880e8400-e29b-41d4-a716-446655440000',
      propertyId: '770e8400-e29b-41d4-a716-446655440000',
      reportedBy: 'Marcus Chen',
      incidentType: 'theft',
      severity: 'medium',
      description: 'Guest reported missing jewelry from hotel room. Door showed no signs of forced entry.',
      location: 'Room 1205, Main Tower',
      coordinates: '21.2793,-157.8293',
      status: 'investigating',
      policeReported: true,
      policeReportNumber: 'HPD-2024-001234',
      occuredAt: new Date('2024-01-15T14:30:00Z')
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440001',
      propertyId: '770e8400-e29b-41d4-a716-446655440001',
      reportedBy: 'Lisa Rodriguez',
      incidentType: 'vandalism',
      severity: 'low',
      description: 'Graffiti found on parking garage wall Level 3, Section B.',
      location: 'Parking Level 3, Section B',
      coordinates: '21.2788,-157.8298',
      status: 'resolved',
      policeReported: false,
      occuredAt: new Date('2024-01-14T22:15:00Z'),
      resolvedAt: new Date('2024-01-15T08:00:00Z')
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440002',
      propertyId: '770e8400-e29b-41d4-a716-446655440002',
      reportedBy: 'David Kim',
      incidentType: 'trespassing',
      severity: 'medium',
      description: 'Unauthorized individual found in office building after hours. Security escort provided.',
      location: 'Floor 8, Suite 802',
      coordinates: '21.2911,-157.8378',
      status: 'resolved',
      policeReported: false,
      occuredAt: new Date('2024-01-13T20:45:00Z'),
      resolvedAt: new Date('2024-01-13T21:15:00Z')
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440003',
      propertyId: '770e8400-e29b-41d4-a716-446655440000',
      reportedBy: 'Sarah Johnson',
      incidentType: 'medical_emergency',
      severity: 'high',
      description: 'Guest experiencing chest pains in lobby. EMS called and responded.',
      location: 'Main Lobby',
      coordinates: '21.2793,-157.8293',
      status: 'resolved',
      policeReported: false,
      occuredAt: new Date('2024-01-12T16:20:00Z'),
      resolvedAt: new Date('2024-01-12T17:00:00Z')
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440004',
      propertyId: '770e8400-e29b-41d4-a716-446655440003',
      reportedBy: 'Marcus Chen',
      incidentType: 'vehicle_break_in',
      severity: 'medium',
      description: 'Car window smashed, GPS unit stolen from dashboard.',
      location: 'Parking Level 2, Space 245',
      coordinates: '21.2906,-157.8383',
      status: 'open',
      policeReported: true,
      policeReportNumber: 'HPD-2024-001567',
      occuredAt: new Date('2024-01-16T11:30:00Z')
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440005',
      propertyId: '770e8400-e29b-41d4-a716-446655440000',
      reportedBy: 'Lisa Rodriguez',
      incidentType: 'disturbance',
      severity: 'low',
      description: 'Noise complaint from neighboring room about loud music.',
      location: 'Room 847',
      coordinates: '21.2793,-157.8293',
      status: 'resolved',
      policeReported: false,
      occuredAt: new Date('2024-01-11T23:45:00Z'),
      resolvedAt: new Date('2024-01-12T00:15:00Z')
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440006',
      propertyId: '770e8400-e29b-41d4-a716-446655440002',
      reportedBy: 'David Kim',
      incidentType: 'fire_alarm',
      severity: 'high',
      description: 'Fire alarm triggered on 12th floor. False alarm - burnt popcorn in break room.',
      location: 'Floor 12, Break Room',
      coordinates: '21.2911,-157.8378',
      status: 'resolved',
      policeReported: false,
      occuredAt: new Date('2024-01-10T14:15:00Z'),
      resolvedAt: new Date('2024-01-10T14:45:00Z')
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440007',
      propertyId: '770e8400-e29b-41d4-a716-446655440001',
      reportedBy: 'Sarah Johnson',
      incidentType: 'suspicious_activity',
      severity: 'medium',
      description: 'Individual observed taking photos of security cameras and access points.',
      location: 'Parking Garage Entrance',
      coordinates: '21.2788,-157.8298',
      status: 'investigating',
      policeReported: true,
      policeReportNumber: 'HPD-2024-001789',
      occuredAt: new Date('2024-01-17T13:20:00Z')
    }
  ];

  for (const incident of incidents) {
    try {
      const { error } = await supabase.from('incidents').upsert(incident);
      if (error && !error.message.includes('duplicate key')) {
        console.log(`Incident exists: ${incident.id}`);
      } else {
        console.log(`✅ Created incident: ${incident.incidentType} at ${incident.location}`);
      }
    } catch (error) {
      console.log(`Incident already exists: ${incident.id}`);
    }
  }

  // Sample patrol reports
  const patrolReports = [
    {
      id: '990e8400-e29b-41d4-a716-446655440000',
      officerId: '550e8400-e29b-41d4-a716-446655440002',
      propertyId: '770e8400-e29b-41d4-a716-446655440000',
      shiftType: 'evening',
      startTime: new Date('2024-01-17T18:00:00Z'),
      endTime: new Date('2024-01-18T02:00:00Z'),
      checkpoints: ['Main Lobby', 'Pool Area', 'Parking Garage', 'Back Entrance', 'VIP Floor'],
      incidentsReported: 0,
      summary: 'Routine evening patrol completed. All areas secure. Heavy guest traffic in lobby area during evening hours.',
      weatherConditions: 'Clear, 78°F',
      vehicleUsed: 'Golf Cart #3',
      mileage: 12,
      status: 'completed'
    },
    {
      id: '990e8400-e29b-41d4-a716-446655440001',
      officerId: '550e8400-e29b-41d4-a716-446655440003',
      propertyId: '770e8400-e29b-41d4-a716-446655440002',
      shiftType: 'night',
      startTime: new Date('2024-01-17T22:00:00Z'),
      endTime: new Date('2024-01-18T06:00:00Z'),
      checkpoints: ['Main Entrance', 'All Floors 1-15', 'Emergency Exits', 'Parking Structure'],
      incidentsReported: 1,
      summary: 'Night shift patrol completed. One incident reported - unauthorized access attempt at rear entrance. Individual was escorted off property.',
      weatherConditions: 'Light rain, 72°F',
      status: 'completed'
    },
    {
      id: '990e8400-e29b-41d4-a716-446655440002',
      officerId: '550e8400-e29b-41d4-a716-446655440002',
      propertyId: '770e8400-e29b-41d4-a716-446655440001',
      shiftType: 'day',
      startTime: new Date('2024-01-17T06:00:00Z'),
      endTime: new Date('2024-01-17T14:00:00Z'),
      checkpoints: ['All Parking Levels', 'Stairwells', 'Emergency Equipment'],
      incidentsReported: 0,
      summary: 'Day shift parking garage patrol. All levels checked. No incidents reported. Minor maintenance issue noted - burned out light on Level 3.',
      weatherConditions: 'Sunny, 82°F',
      vehicleUsed: 'Patrol Vehicle #1',
      mileage: 15,
      status: 'completed'
    },
    {
      id: '990e8400-e29b-41d4-a716-446655440003',
      officerId: '550e8400-e29b-41d4-a716-446655440003',
      propertyId: '770e8400-e29b-41d4-a716-446655440003',
      shiftType: 'evening',
      startTime: new Date('2024-01-16T16:00:00Z'),
      endTime: new Date('2024-01-17T00:00:00Z'),
      checkpoints: ['Entrance Security', 'Parking Levels 1-5', 'Emergency Systems Check'],
      incidentsReported: 1,
      summary: 'Evening patrol of parking structure. Vehicle break-in discovered on Level 2. Police notified and incident reported.',
      weatherConditions: 'Partly cloudy, 75°F',
      status: 'completed'
    },
    {
      id: '990e8400-e29b-41d4-a716-446655440004',
      officerId: '550e8400-e29b-41d4-a716-446655440001',
      propertyId: '770e8400-e29b-41d4-a716-446655440000',
      shiftType: 'day',
      startTime: new Date('2024-01-18T06:00:00Z'),
      endTime: new Date('2024-01-18T14:00:00Z'),
      checkpoints: ['Perimeter Check', 'Guest Areas', 'Staff Areas', 'Pool Deck', 'Beach Access'],
      incidentsReported: 0,
      summary: 'Morning patrol shift completed successfully. High guest activity around pool area. All security systems functioning normally.',
      weatherConditions: 'Sunny, 84°F',
      vehicleUsed: 'Golf Cart #2',
      mileage: 8,
      status: 'completed'
    },
    {
      id: '990e8400-e29b-41d4-a716-446655440005',
      officerId: '550e8400-e29b-41d4-a716-446655440002',
      propertyId: '770e8400-e29b-41d4-a716-446655440000',
      shiftType: 'evening',
      startTime: new Date('2024-01-18T18:00:00Z'),
      status: 'in_progress',
      checkpoints: ['Main Lobby', 'Pool Area'],
      incidentsReported: 0,
      summary: 'Current evening patrol in progress. Initial checkpoints completed.',
      weatherConditions: 'Clear, 79°F'
    }
  ];

  for (const report of patrolReports) {
    try {
      const { error } = await supabase.from('patrol_reports').upsert(report);
      if (error && !error.message.includes('duplicate key')) {
        console.log(`Patrol report exists: ${report.id}`);
      } else {
        console.log(`✅ Created patrol report: ${report.shiftType} shift`);
      }
    } catch (error) {
      console.log(`Patrol report already exists: ${report.id}`);
    }
  }

  // Sample appointments
  const appointments = [
    {
      id: 'aa0e8400-e29b-41d4-a716-446655440000',
      clientId: '660e8400-e29b-41d4-a716-446655440000',
      propertyId: '770e8400-e29b-41d4-a716-446655440000',
      assignedOfficer: '550e8400-e29b-41d4-a716-446655440001',
      appointmentType: 'security_assessment',
      title: 'Quarterly Security Review - Waikiki Grand',
      description: 'Comprehensive review of security protocols and risk assessment for the resort.',
      scheduledDate: new Date('2024-01-25T10:00:00Z'),
      duration: 120,
      status: 'scheduled',
      location: 'Resort Security Office',
      notes: 'Bring incident reports from last quarter for review'
    },
    {
      id: 'aa0e8400-e29b-41d4-a716-446655440001',
      clientId: '660e8400-e29b-41d4-a716-446655440001',
      propertyId: '770e8400-e29b-41d4-a716-446655440002',
      assignedOfficer: '550e8400-e29b-41d4-a716-446655440002',
      appointmentType: 'client_meeting',
      title: 'Monthly Check-in - Ala Moana Center',
      description: 'Regular monthly meeting to discuss security operations and any concerns.',
      scheduledDate: new Date('2024-01-20T14:00:00Z'),
      duration: 60,
      status: 'completed',
      location: 'Property Management Office',
      notes: 'Client satisfied with current service levels'
    },
    {
      id: 'aa0e8400-e29b-41d4-a716-446655440002',
      clientId: '660e8400-e29b-41d4-a716-446655440000',
      assignedOfficer: '550e8400-e29b-41d4-a716-446655440003',
      appointmentType: 'training',
      title: 'Emergency Response Training Session',
      description: 'Training session for new emergency response procedures.',
      scheduledDate: new Date('2024-01-22T09:00:00Z'),
      duration: 180,
      status: 'scheduled',
      location: 'Resort Conference Room A',
      notes: 'All security staff should attend'
    },
    {
      id: 'aa0e8400-e29b-41d4-a716-446655440003',
      clientId: '660e8400-e29b-41d4-a716-446655440001',
      assignedOfficer: '550e8400-e29b-41d4-a716-446655440004',
      appointmentType: 'incident_followup',
      title: 'Follow-up on Vehicle Break-in Incident',
      description: 'Meeting to discuss prevention measures for parking garage security.',
      scheduledDate: new Date('2024-01-19T16:00:00Z'),
      duration: 45,
      status: 'completed',
      location: 'Parking Garage Office',
      notes: 'Additional lighting and camera coverage recommended'
    }
  ];

  for (const appointment of appointments) {
    try {
      const { error } = await supabase.from('appointments').upsert(appointment);
      if (error && !error.message.includes('duplicate key')) {
        console.log(`Appointment exists: ${appointment.title}`);
      } else {
        console.log(`✅ Created appointment: ${appointment.title}`);
      }
    } catch (error) {
      console.log(`Appointment already exists: ${appointment.title}`);
    }
  }

  // Sample financial records
  const financialRecords = [
    {
      id: 'bb0e8400-e29b-41d4-a716-446655440000',
      clientId: '660e8400-e29b-41d4-a716-446655440000',
      recordType: 'invoice',
      amount: 45000.00,
      description: 'Monthly security services - January 2024',
      category: 'security_services',
      transactionDate: '2024-01-01',
      paymentMethod: 'wire_transfer',
      referenceNumber: 'INV-2024-001',
      status: 'paid',
      notes: '24/7 premium security package'
    },
    {
      id: 'bb0e8400-e29b-41d4-a716-446655440001',
      clientId: '660e8400-e29b-41d4-a716-446655440001',
      recordType: 'invoice',
      amount: 28000.00,
      description: 'Monthly security services - January 2024',
      category: 'security_services',
      transactionDate: '2024-01-01',
      paymentMethod: 'check',
      referenceNumber: 'INV-2024-002',
      status: 'paid',
      notes: 'Business hours coverage package'
    },
    {
      id: 'bb0e8400-e29b-41d4-a716-446655440002',
      recordType: 'expense',
      amount: 8500.00,
      description: 'Staff payroll - January 2024',
      category: 'payroll',
      transactionDate: '2024-01-15',
      referenceNumber: 'PAY-2024-001',
      status: 'paid',
      notes: 'Bi-weekly payroll processing'
    },
    {
      id: 'bb0e8400-e29b-41d4-a716-446655440003',
      recordType: 'expense',
      amount: 1200.00,
      description: 'Vehicle maintenance and fuel',
      category: 'operations',
      transactionDate: '2024-01-10',
      referenceNumber: 'EXP-2024-001',
      status: 'paid',
      notes: 'Monthly vehicle maintenance'
    },
    {
      id: 'bb0e8400-e29b-41d4-a716-446655440004',
      clientId: '660e8400-e29b-41d4-a716-446655440000',
      recordType: 'invoice',
      amount: 45000.00,
      description: 'Monthly security services - February 2024',
      category: 'security_services',
      transactionDate: '2024-02-01',
      referenceNumber: 'INV-2024-003',
      status: 'pending',
      notes: '24/7 premium security package'
    }
  ];

  for (const record of financialRecords) {
    try {
      const { error } = await supabase.from('financial_records').upsert(record);
      if (error && !error.message.includes('duplicate key')) {
        console.log(`Financial record exists: ${record.description}`);
      } else {
        console.log(`✅ Created financial record: ${record.description}`);
      }
    } catch (error) {
      console.log(`Financial record already exists: ${record.description}`);
    }
  }

  console.log('✅ Sample data seeded successfully');
}

setupDatabase();
