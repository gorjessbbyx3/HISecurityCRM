import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase environment variables...');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is required. Please add it to your Replit Secrets.');
}

if (!supabaseServiceKey && !supabaseAnonKey) {
  throw new Error('Either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable is required. Please add one to your Replit Secrets.');
}

// Prefer service role key for backend operations, fallback to anon key
const apiKey = supabaseServiceKey || supabaseAnonKey;

export const supabase = createClient(supabaseUrl!, apiKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Types
export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: string;
  badge?: string;
  phone?: string;
  status: string;
  zone?: string;
  shift?: string;
  hashedPassword?: string;
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  contactPerson?: string;
  contractStart?: string;
  contractEnd?: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  clientId?: string;
  name: string;
  address: string;
  propertyType?: string;
  zone?: string;
  securityLevel: string;
  accessCodes?: string;
  specialInstructions?: string;
  coordinates?: string;
  coverageType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Incident {
  id: string;
  propertyId?: string;
  reportedBy?: string;
  incidentType: string;
  severity: string;
  description: string;
  location?: string;
  coordinates?: string;
  status: string;
  photoUrls?: string[];
  policeReported: boolean;
  policeReportNumber?: string;
  occuredAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatrolReport {
  id: string;
  officerId?: string;
  propertyId?: string;
  shiftType?: string;
  startTime: Date;
  endTime?: Date;
  checkpoints?: string[];
  incidentsReported: number;
  summary: string;
  photoUrls?: string[];
  weatherConditions?: string;
  vehicleUsed?: string;
  mileage?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  clientId?: string;
  propertyId?: string;
  assignedOfficer?: string;
  appointmentType?: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  duration: number;
  status: string;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  userId?: string;
  activityType: string;
  entityType?: string;
  entityId?: string;
  description: string;
  metadata?: any;
  createdAt: Date;
}

export interface FinancialRecord {
  id: string;
  clientId?: string;
  recordType: string;
  amount: number;
  description: string;
  category?: string;
  taxCategory?: string;
  transactionDate: string;
  paymentMethod?: string;
  referenceNumber?: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Evidence {
  id: string;
  incidentId?: string;
  type: string;
  description: string;
  fileUrl?: string;
  collectedAt: Date;
  collectedBy?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityResource {
  id: string;
  name: string;
  type: string;
  description: string;
  contactInfo?: string;
  address?: string;
  website?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LawReference {
  id: string;
  title: string;
  section: string;
  description: string;
  category: string;
  jurisdiction: string;
  effectiveDate?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supabase storage class
class SupabaseStorage {
  constructor() {
    console.log('✅ Supabase storage initialized');
  }

  // User methods
  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by email:', error);
      return null;
    }
    return data;
  }

  async upsertUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert user: ${error.message}`);
    }
    return data;
  }

  async getStaffMembers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch staff: ${error.message}`);
    }
    return data || [];
  }

  async getActiveStaff(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'active')
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active staff: ${error.message}`);
    }
    return data || [];
  }

  async updateStaffStatus(id: string, status: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ status, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update staff status: ${error.message}`);
    }
    return data;
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }
    return data || [];
  }

  async getClient(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching client:', error);
      return null;
    }
    return data;
  }

  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...clientData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create client: ${error.message}`);
    }
    return data;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update client: ${error.message}`);
    }
    return data;
  }

  async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  }

  // Property methods
  async getProperties(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }
    return data || [];
  }

  async getProperty(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching property:', error);
      return null;
    }
    return data;
  }

  async createProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .insert({
        ...propertyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }
    return data;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update({ ...updates, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }
    return data;
  }

  async deleteProperty(id: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  // Incident methods
  async getIncidents(): Promise<Incident[]> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch incidents: ${error.message}`);
    }
    return data || [];
  }

  async getRecentIncidents(hours = 168): Promise<Incident[]> {
    const sinceDate = new Date();
    sinceDate.setHours(sinceDate.getHours() - hours);

    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .gte('createdAt', sinceDate.toISOString())
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recent incidents: ${error.message}`);
    }
    return data || [];
  }

  async createIncident(incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        ...incidentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create incident: ${error.message}`);
    }
    return data;
  }

  // Dashboard stats
  async getDashboardStats() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const [clientsCount, propertiesCount, incidentsCount, staffCount, criticalIncidentsCount, activePatrolsCount, propertiesSecuredCount, staffOnDutyCount, yesterdayIncidentsCount, yesterdayStaffCount] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('incidents').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('severity', 'critical'),
      supabase.from('patrol_reports').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('shift', 'day'), // Assuming 'day' shift is on duty
      supabase.from('incidents').select('*', { count: 'exact', head: true }).gte('createdAt', yesterday.toISOString()),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('updatedAt', yesterday.toISOString()),
    ]);

    const totalIncidents = incidentsCount.count || 0;
    const yesterdayIncidents = yesterdayIncidentsCount.count || 0;
    const incidentsChange = yesterdayIncidents > 0 ? ((totalIncidents - yesterdayIncidents) / yesterdayIncidents) * 100 : 0;

    const activeStaff = staffCount.count || 0;
    const yesterdayStaff = yesterdayStaffCount.count || 0;
    const staffChange = yesterdayStaff > 0 ? ((activeStaff - yesterdayStaff) / yesterdayStaff) * 100 : 0;

    return {
      totalClients: clientsCount.count || 0,
      totalProperties: propertiesCount.count || 0,
      activeIncidents: incidentsCount.count || 0,
      activeStaff: activeStaff,
      totalIncidents: totalIncidents,
      criticalIncidents: criticalIncidentsCount.count || 0,
      activePatrols: activePatrolsCount.count || 0,
      propertiesSecured: propertiesSecuredCount.count || 0,
      staffOnDuty: staffOnDutyCount.count || 0,
      incidentsChange: Math.round(incidentsChange * 100) / 100,
      staffChange: Math.round(staffChange * 100) / 100,
    };
  }

  // Activities
  async createActivity(activityData: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        ...activityData,
        createdAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create activity: ${error.message}`);
    }
    return data;
  }

  async getActivities(limit = 50): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }
    return data || [];
  }

  // Patrol reports
  async getPatrolReports(): Promise<PatrolReport[]> {
    const { data, error } = await supabase
      .from('patrol_reports')
      .select('*')
      .order('startTime', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch patrol reports: ${error.message}`);
    }
    return data || [];
  }

  async getTodaysPatrolReports(): Promise<PatrolReport[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('patrol_reports')
      .select('*')
      .gte('startTime', today.toISOString())
      .lt('startTime', tomorrow.toISOString())
      .order('startTime', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch today's patrol reports: ${error.message}`);
    }
    return data || [];
  }

  async createPatrolReport(reportData: Omit<PatrolReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatrolReport> {
    const { data, error } = await supabase
      .from('patrol_reports')
      .insert({
        ...reportData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create patrol report: ${error.message}`);
    }
    return data;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('scheduledDate', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }
    return data || [];
  }

  async getTodaysAppointments(): Promise<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('scheduledDate', today.toISOString())
      .lt('scheduledDate', tomorrow.toISOString())
      .order('scheduledDate', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch today's appointments: ${error.message}`);
    }
    return data || [];
  }

  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        ...appointmentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create appointment: ${error.message}`);
    }
    return data;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update appointment: ${error.message}`);
    }
    return data;
  }

  // Financial records
  async getFinancialRecords(): Promise<FinancialRecord[]> {
    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .order('transactionDate', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch financial records: ${error.message}`);
    }
    return data || [];
  }

  async createFinancialRecord(recordData: Omit<FinancialRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialRecord> {
    const { data, error } = await supabase
      .from('financial_records')
      .insert({
        ...recordData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create financial record: ${error.message}`);
    }
    return data;
  }

  async getPropertiesByClient(clientId: string): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('clientId', clientId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch properties by client: ${error.message}`);
    }
    return data || [];
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .update({ ...updates, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update incident: ${error.message}`);
    }
    return data;
  }

  async getPatrolReportsByOfficer(officerId: string): Promise<PatrolReport[]> {
    const { data, error } = await supabase
      .from('patrol_reports')
      .select('*')
      .eq('officerId', officerId)
      .order('startTime', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch patrol reports by officer: ${error.message}`);
    }
    return data || [];
  }

  async updatePatrolReport(id: string, updates: Partial<PatrolReport>): Promise<PatrolReport> {
    const { data, error } = await supabase
      .from('patrol_reports')
      .update({ ...updates, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update patrol report: ${error.message}`);
    }
    return data;
  }

  async getFinancialSummary() {
    const { data, error } = await supabase
      .from('financial_records')
      .select('recordType, amount');

    if (error) {
      throw new Error(`Failed to fetch financial summary: ${error.message}`);
    }

    const summary = (data || []).reduce((acc, record) => {
      if (!acc[record.recordType]) {
        acc[record.recordType] = 0;
      }
      acc[record.recordType] += record.amount;
      return acc;
    }, {} as Record<string, number>);

    return summary;
  }

  async getEvidence(): Promise<Evidence[]> {
    const { data, error } = await supabase
      .from('evidence')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch evidence: ${error.message}`);
    }
    return data || [];
  }

  async createEvidence(evidenceData: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evidence> {
    const { data, error } = await supabase
      .from('evidence')
      .insert({
        ...evidenceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create evidence: ${error.message}`);
    }
    return data;
  }

  async getCommunityResources(): Promise<CommunityResource[]> {
    const { data, error } = await supabase
      .from('community_resources')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch community resources: ${error.message}`);
    }
    return data || [];
  }

  async createCommunityResource(resourceData: Omit<CommunityResource, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommunityResource> {
    const { data, error } = await supabase
      .from('community_resources')
      .insert({
        ...resourceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create community resource: ${error.message}`);
    }
    return data;
  }

  async createLawReference(referenceData: Omit<LawReference, 'id' | 'createdAt' | 'updatedAt'>): Promise<LawReference> {
    const { data, error } = await supabase
      .from('law_references')
      .insert({
        ...referenceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create law reference: ${error.message}`);
    }
    return data;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
    return data;
  }

  async updateUserPermissions(id: string, permissions: string[]): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ permissions, updatedAt: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user permissions: ${error.message}`);
    }
    return data;
  }

  async updateUserStatus(id: string, status: string): Promise<User> {
    return this.updateStaffStatus(id, status);
  }

  async getTodaysReports(): Promise<PatrolReport[]> {
    return this.getTodaysPatrolReports();
  }

  async getLawReferences(options?: { search?: string; category?: string }): Promise<LawReference[]> {
    let query = supabase
      .from('law_references')
      .select('*')
      .order('createdAt', { ascending: false });

    if (options?.search) {
      query = query.ilike('title', `%${options.search}%`);
    }

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch law references: ${error.message}`);
    }
    return data || [];
  }

  // Initialize database with default data
  async seedDatabase(): Promise<void> {
    console.log('🌱 Seeding Supabase database...');

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
      }
    ];

    for (const client of clients) {
      try {
        await this.createClient(client);
      } catch (error) {
        console.log(`Client already exists or error creating: ${client.name}`);
      }
    }

    console.log('✅ Supabase database seeded successfully');
  }
}

export const storage = new SupabaseStorage();