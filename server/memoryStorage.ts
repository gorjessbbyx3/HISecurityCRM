// In-memory storage implementation
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

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

// In-memory storage
class MemoryStorage {
  private users: Map<string, User> = new Map();
  private clients: Map<string, Client> = new Map();
  private properties: Map<string, Property> = new Map();
  private incidents: Map<string, Incident> = new Map();
  private patrolReports: Map<string, PatrolReport> = new Map();
  private appointments: Map<string, Appointment> = new Map();
  private activities: Map<string, Activity> = new Map();
  private financialRecords: Map<string, FinancialRecord> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default admin user
    const hashedPassword = await bcrypt.hash('Password3211', 10);
    const adminUser: User = {
      id: 'admin-001',
      email: 'admin@hawaiisecurity.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      hashedPassword,
      permissions: ['all'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);
    console.log('✅ Default admin user created in memory');
  }

  // User methods
  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async upsertUser(userData: Partial<User>): Promise<User> {
    const id = userData.id || uuidv4();
    const now = new Date();
    
    const existingUser = this.users.get(id);
    const user: User = {
      id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      role: userData.role || 'security_officer',
      badge: userData.badge,
      phone: userData.phone,
      status: userData.status || 'active',
      zone: userData.zone,
      shift: userData.shift,
      hashedPassword: userData.hashedPassword,
      permissions: userData.permissions,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
    };

    this.users.set(id, user);
    return user;
  }

  async getStaffMembers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getActiveStaff(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.status === 'active');
  }

  async updateStaffStatus(id: string, status: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    user.status = status;
    user.updatedAt = new Date();
    this.users.set(id, user);
    return user;
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: string): Promise<Client | null> {
    return this.clients.get(id) || null;
  }

  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const id = uuidv4();
    const now = new Date();
    const client: Client = {
      id,
      ...clientData,
      status: clientData.status || 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const client = this.clients.get(id);
    if (!client) {
      throw new Error(`Client with id ${id} not found`);
    }
    const updatedClient = { ...client, ...updates, updatedAt: new Date() };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: string): Promise<void> {
    this.clients.delete(id);
  }

  // Property methods
  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(id: string): Promise<Property | null> {
    return this.properties.get(id) || null;
  }

  async createProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    const id = uuidv4();
    const now = new Date();
    const property: Property = {
      id,
      ...propertyData,
      securityLevel: propertyData.securityLevel || 'standard',
      coverageType: propertyData.coverageType || 'patrol',
      status: propertyData.status || 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const property = this.properties.get(id);
    if (!property) {
      throw new Error(`Property with id ${id} not found`);
    }
    const updatedProperty = { ...property, ...updates, updatedAt: new Date() };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: string): Promise<void> {
    this.properties.delete(id);
  }

  // Incident methods
  async getIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values());
  }

  async getRecentIncidents(): Promise<Incident[]> {
    const recent = new Date();
    recent.setDate(recent.getDate() - 7);
    return Array.from(this.incidents.values())
      .filter(incident => incident.createdAt >= recent)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createIncident(incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    const id = uuidv4();
    const now = new Date();
    const incident: Incident = {
      id,
      ...incidentData,
      severity: incidentData.severity || 'medium',
      status: incidentData.status || 'open',
      policeReported: incidentData.policeReported || false,
      createdAt: now,
      updatedAt: now,
    };
    this.incidents.set(id, incident);
    return incident;
  }

  // Dashboard stats
  async getDashboardStats() {
    return {
      totalClients: this.clients.size,
      totalProperties: this.properties.size,
      activeIncidents: Array.from(this.incidents.values()).filter(i => i.status === 'open').length,
      activeStaff: Array.from(this.users.values()).filter(u => u.status === 'active').length,
      totalIncidents: this.incidents.size,
      criticalIncidents: Array.from(this.incidents.values()).filter(i => i.severity === 'critical').length,
    };
  }

  // Activities
  async createActivity(activityData: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const id = uuidv4();
    const activity: Activity = {
      id,
      ...activityData,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getActivities(limit = 50): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Patrol reports
  async getPatrolReports(): Promise<PatrolReport[]> {
    return Array.from(this.patrolReports.values());
  }

  async getTodaysPatrolReports(): Promise<PatrolReport[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.patrolReports.values()).filter(report => 
      report.startTime >= today && report.startTime < tomorrow
    );
  }

  async createPatrolReport(reportData: Omit<PatrolReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatrolReport> {
    const id = uuidv4();
    const now = new Date();
    const report: PatrolReport = {
      id,
      ...reportData,
      incidentsReported: reportData.incidentsReported || 0,
      status: reportData.status || 'in_progress',
      createdAt: now,
      updatedAt: now,
    };
    this.patrolReports.set(id, report);
    return report;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }

  async getTodaysAppointments(): Promise<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.appointments.values()).filter(appointment => 
      appointment.scheduledDate >= today && appointment.scheduledDate < tomorrow
    );
  }

  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const id = uuidv4();
    const now = new Date();
    const appointment: Appointment = {
      id,
      ...appointmentData,
      duration: appointmentData.duration || 60,
      status: appointmentData.status || 'scheduled',
      createdAt: now,
      updatedAt: now,
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) {
      throw new Error(`Appointment with id ${id} not found`);
    }
    const updatedAppointment = { ...appointment, ...updates, updatedAt: new Date() };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Financial records
  async getFinancialRecords(): Promise<FinancialRecord[]> {
    return Array.from(this.financialRecords.values());
  }

  async createFinancialRecord(recordData: Omit<FinancialRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialRecord> {
    const id = uuidv4();
    const now = new Date();
    const record: FinancialRecord = {
      id,
      ...recordData,
      status: recordData.status || 'pending',
      createdAt: now,
      updatedAt: now,
    };
    this.financialRecords.set(id, record);
    return record;
  }

  // Seed database with sample data
  async seedDatabase(): Promise<void> {
    // Sample clients
    await this.createClient({
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
    });

    await this.createClient({
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
    });

    console.log('✅ Sample data seeded in memory storage');
  }
}

export const storage = new MemoryStorage();