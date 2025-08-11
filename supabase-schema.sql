-- Hawaii Security CRM Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  "firstName" TEXT,
  "lastName" TEXT,
  "profileImageUrl" TEXT,
  role TEXT NOT NULL DEFAULT 'security_officer',
  badge TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  zone TEXT,
  shift TEXT,
  "hashedPassword" TEXT,
  permissions TEXT[],
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table  
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  "contactPerson" TEXT,
  "contractStart" TEXT,
  "contractEnd" TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "clientId" UUID REFERENCES clients(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  "propertyType" TEXT,
  zone TEXT,
  "securityLevel" TEXT NOT NULL DEFAULT 'standard',
  "accessCodes" TEXT,
  "specialInstructions" TEXT,
  coordinates TEXT,
  "coverageType" TEXT NOT NULL DEFAULT 'patrol',
  status TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "propertyId" UUID REFERENCES properties(id),
  "reportedBy" TEXT,
  "incidentType" TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  location TEXT,
  coordinates TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  "photoUrls" TEXT[],
  "policeReported" BOOLEAN DEFAULT FALSE,
  "policeReportNumber" TEXT,
  "occuredAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "resolvedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patrol reports table
CREATE TABLE IF NOT EXISTS patrol_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "officerId" UUID REFERENCES users(id),
  "propertyId" UUID REFERENCES properties(id),
  "shiftType" TEXT,
  "startTime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "endTime" TIMESTAMP WITH TIME ZONE,
  checkpoints TEXT[],
  "incidentsReported" INTEGER DEFAULT 0,
  summary TEXT NOT NULL,
  "photoUrls" TEXT[],
  "weatherConditions" TEXT,
  "vehicleUsed" TEXT,
  mileage INTEGER,
  status TEXT NOT NULL DEFAULT 'in_progress',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "clientId" UUID REFERENCES clients(id),
  "propertyId" UUID REFERENCES properties(id),
  "assignedOfficer" UUID REFERENCES users(id),
  "appointmentType" TEXT,
  title TEXT NOT NULL,
  description TEXT,
  "scheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled',
  location TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID REFERENCES users(id),
  "activityType" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  description TEXT NOT NULL,
  metadata JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial records table
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "clientId" UUID REFERENCES clients(id),
  "recordType" TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  "taxCategory" TEXT,
  "transactionDate" TEXT NOT NULL,
  "paymentMethod" TEXT,
  "referenceNumber" TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user
INSERT INTO users (
  id,
  email,
  "firstName", 
  "lastName",
  role,
  status,
  "hashedPassword",
  permissions
) VALUES (
  'admin-001',
  'admin@hawaiisecurity.com',
  'Admin',
  'User', 
  'admin',
  'active',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- Password3211 hashed
  ARRAY['all']
) ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_properties_client_id ON properties("clientId");
CREATE INDEX IF NOT EXISTS idx_incidents_property_id ON incidents("propertyId");
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents("createdAt");
CREATE INDEX IF NOT EXISTS idx_patrol_reports_officer_id ON patrol_reports("officerId");
CREATE INDEX IF NOT EXISTS idx_patrol_reports_start_time ON patrol_reports("startTime");
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date ON appointments("scheduledDate");
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities("createdAt");
CREATE INDEX IF NOT EXISTS idx_financial_records_transaction_date ON financial_records("transactionDate");

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrol_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all authenticated users access)
-- You can refine these later based on your security requirements

CREATE POLICY "Allow authenticated users to view users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update users" ON users FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert users" ON users FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to clients" ON clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to properties" ON properties FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to incidents" ON incidents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to patrol_reports" ON patrol_reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to appointments" ON appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to activities" ON activities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to financial_records" ON financial_records FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions to service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;