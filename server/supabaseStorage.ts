import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

  async getRecentIncidents(): Promise<Incident[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .gte('createdAt', sevenDaysAgo.toISOString())
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
    const [clientsCount, propertiesCount, incidentsCount, staffCount, criticalIncidentsCount] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('incidents').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('severity', 'critical'),
    ]);

    return {
      totalClients: clientsCount.count || 0,
      totalProperties: propertiesCount.count || 0,
      activeIncidents: incidentsCount.count || 0,
      activeStaff: staffCount.count || 0,
      totalIncidents: incidentsCount.count || 0,
      criticalIncidents: criticalIncidentsCount.count || 0,
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