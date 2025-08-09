import {
  users,
  clients,
  properties,
  incidents,
  patrolReports,
  appointments,
  activities,
  financialRecords,
  fileUploads,
  communityResources,
  lawReferences,
  type User,
  type UpsertUser,
  type Client,
  type InsertClient,
  type Property,
  type InsertProperty,
  type Incident,
  type InsertIncident,
  type PatrolReport,
  type InsertPatrolReport,
  type Appointment,
  type InsertAppointment,
  type Activity,
  type InsertActivity,
  type FinancialRecord,
  type InsertFinancialRecord,
  type FileUpload,
  type InsertFileUpload,
  type CommunityResource,
  type InsertCommunityResource,
  type LawReference,
  type InsertLawReference,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql, or, ilike, lte, lt, like } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from 'bcrypt';

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserById(id: number): Promise<any | null>; // Added for consistency with new login logic

  // Staff management
  getStaffMembers(): Promise<User[]>;
  getActiveStaff(): Promise<User[]>;
  updateUserStatus(id: string, status: string): Promise<void>;

  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;

  // Property operations
  getProperties(): Promise<Property[]>;
  getPropertiesByClient(clientId: string): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: string): Promise<void>;

  // Incident operations
  getIncidents(): Promise<Incident[]>;
  getRecentIncidents(hours?: number): Promise<Incident[]>;
  getIncident(id: string): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: string, updates: Partial<InsertIncident>): Promise<Incident>;

  // Patrol report operations
  getPatrolReports(): Promise<PatrolReport[]>;
  getPatrolReportsByOfficer(officerId: string): Promise<PatrolReport[]>;
  getTodaysReports(): Promise<PatrolReport[]>;
  createPatrolReport(report: InsertPatrolReport): Promise<PatrolReport>;
  updatePatrolReport(id: string, updates: Partial<InsertPatrolReport>): Promise<PatrolReport>;

  // Appointment operations
  getAppointments(): Promise<Appointment[]>;
  getTodaysAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment>;

  // Activity tracking
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivities(limit?: number): Promise<Activity[]>;

  // Financial operations
  getFinancialRecords(): Promise<FinancialRecord[]>;
  getFinancialSummary(): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  }>;
  createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord>;

  // File operations
  createFileUpload(file: InsertFileUpload): Promise<FileUpload>;
  getFilesByEntity(entityType: string, entityId: string): Promise<FileUpload[]>;

  // Evidence storage
  getEvidence(): Promise<any[]>;
  createEvidence(data: any): Promise<any>;

  // Community resources
  getCommunityResources(): Promise<any[]>;
  createCommunityResource(data: any): Promise<any>;

  // Law references
  getLawReferences(filters?: { search?: string; category?: string }): Promise<any[]>;
  createLawReference(data: any): Promise<any>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalIncidents: number;
    activePatrols: number;
    propertiesSecured: number;
    staffOnDuty: number;
  }>;

  // Database seeding
  seedDatabase(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values({...userData, createdAt: new Date(), updatedAt: new Date()})
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error; // Re-throw to indicate failure
    }
  }

  // Added new method to fetch user by ID, assuming the ID is numeric for the database
  async getUserById(id: number): Promise<any | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id as any, id)); // Cast might be needed depending on drizzle-orm setup
      if (!user) {
        return null;
      }
      const { hashedPassword, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error(`Error fetching user by ID ${id}:`, error);
      return null;
    }
  }

  // Existing login method
  async login(username: string, password: string) {
    try {
      const user = await db.query.usersTable.findFirst({
        where: eq(users.username, username),
      });

      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      const { hashedPassword, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  // Staff management
  async getStaffMembers(): Promise<User[]> {
    try {
      return await db.select().from(users).orderBy(users.firstName);
    } catch (error) {
      console.error('Error fetching staff members:', error);
      return [];
    }
  }

  async getActiveStaff(): Promise<User[]> {
    try {
      return await db
        .select()
        .from(users)
        .where(eq(users.status, "active"))
        .orderBy(users.firstName);
    } catch (error) {
      console.error('Error fetching active staff:', error);
      return [];
    }
  }

  async updateUserStatus(id: string, status: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({ status, updatedAt: new Date() })
        .where(eq(users.id, id));
    } catch (error) {
      console.error(`Error updating user status for user ${id}:`, error);
      // Depending on requirements, you might want to throw or handle this differently
    }
  }

  // Client operations
  async getClients(): Promise<Client[]> {
    try {
      return await db.select().from(clients).orderBy(clients.name);
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  async getClient(id: string): Promise<Client | undefined> {
    try {
      const [client] = await db.select().from(clients).where(eq(clients.id, id));
      return client;
    } catch (error) {
      console.error(`Error fetching client with id ${id}:`, error);
      return undefined;
    }
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    try {
      const [client] = await db.insert(clients).values({
        id: crypto.randomUUID(),
        ...clientData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client> {
    try {
      const [client] = await db
        .update(clients)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(clients.id, id))
        .returning();
      if (!client) {
        throw new Error(`Client with id ${id} not found for update.`);
      }
      return client;
    } catch (error) {
      console.error(`Error updating client with id ${id}:`, error);
      throw error;
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      await db.delete(clients).where(eq(clients.id, id));
    } catch (error) {
      console.error(`Error deleting client with id ${id}:`, error);
      throw error;
    }
  }

  // Property operations
  async getProperties(): Promise<Property[]> {
    try {
      return await db.select().from(properties).orderBy(properties.name);
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  async getPropertiesByClient(clientId: string): Promise<Property[]> {
    try {
      return await db
        .select()
        .from(properties)
        .where(eq(properties.clientId, clientId))
        .orderBy(properties.name);
    } catch (error) {
      console.error(`Error fetching properties for client ${clientId}:`, error);
      return [];
    }
  }

  async getProperty(id: string): Promise<Property | undefined> {
    try {
      const [property] = await db.select().from(properties).where(eq(properties.id, id));
      return property;
    } catch (error) {
      console.error(`Error fetching property with id ${id}:`, error);
      return undefined;
    }
  }

  async createProperty(propertyData: InsertProperty): Promise<Property> {
    try {
      const [property] = await db.insert(properties).values({
        id: crypto.randomUUID(),
        ...propertyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return property;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property> {
    try {
      const [property] = await db
        .update(properties)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(properties.id, id))
        .returning();
      if (!property) {
        throw new Error(`Property with id ${id} not found for update.`);
      }
      return property;
    } catch (error) {
      console.error(`Error updating property with id ${id}:`, error);
      throw error;
    }
  }

  async deleteProperty(id: string): Promise<void> {
    try {
      await db.delete(properties).where(eq(properties.id, id));
    } catch (error) {
      console.error(`Error deleting property with id ${id}:`, error);
      throw error;
    }
  }

  // Incident operations
  async getIncidents(): Promise<Incident[]> {
    try {
      return await db.select().from(incidents).orderBy(desc(incidents.occuredAt));
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return [];
    }
  }

  async getRecentIncidents(hours: number = 24): Promise<Incident[]> {
    try {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
      return await db.select().from(incidents)
        .where(gte(incidents.occuredAt, cutoff))
        .orderBy(desc(incidents.occuredAt));
    } catch (error) {
      console.error(`Error fetching recent incidents (last ${hours} hours):`, error);
      return [];
    }
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    try {
      const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
      return incident;
    } catch (error) {
      console.error(`Error fetching incident with id ${id}:`, error);
      return undefined;
    }
  }

  async createIncident(incidentData: InsertIncident): Promise<Incident> {
    try {
      const [incident] = await db.insert(incidents).values({
        id: crypto.randomUUID(),
        ...incidentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return incident;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  }

  async updateIncident(id: string, updates: Partial<InsertIncident>): Promise<Incident> {
    try {
      const [incident] = await db
        .update(incidents)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(incidents.id, id))
        .returning();
      if (!incident) {
        throw new Error(`Incident with id ${id} not found for update.`);
      }
      return incident;
    } catch (error) {
      console.error(`Error updating incident with id ${id}:`, error);
      throw error;
    }
  }

  // Patrol report operations
  async getPatrolReports(): Promise<PatrolReport[]> {
    try {
      return await db.select().from(patrolReports).orderBy(desc(patrolReports.startTime));
    } catch (error) {
      console.error('Error fetching patrol reports:', error);
      return [];
    }
  }

  async getPatrolReportsByOfficer(officerId: string): Promise<PatrolReport[]> {
    try {
      return await db
        .select()
        .from(patrolReports)
        .where(eq(patrolReports.officerId, officerId))
        .orderBy(desc(patrolReports.startTime));
    } catch (error) {
      console.error(`Error fetching patrol reports for officer ${officerId}:`, error);
      return [];
    }
  }

  async getTodaysReports(): Promise<PatrolReport[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return await db.select().from(patrolReports)
        .where(gte(patrolReports.startTime, today))
        .orderBy(desc(patrolReports.startTime));
    } catch (error) {
      console.error('Error fetching today\'s patrol reports:', error);
      return [];
    }
  }

  async createPatrolReport(reportData: InsertPatrolReport): Promise<PatrolReport> {
    try {
      const [report] = await db.insert(patrolReports).values({
        id: crypto.randomUUID(),
        ...reportData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return report;
    } catch (error) {
      console.error('Error creating patrol report:', error);
      throw error;
    }
  }

  async updatePatrolReport(id: string, updates: Partial<InsertPatrolReport>): Promise<PatrolReport> {
    try {
      const [report] = await db
        .update(patrolReports)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(patrolReports.id, id))
        .returning();
      if (!report) {
        throw new Error(`Patrol report with id ${id} not found for update.`);
      }
      return report;
    } catch (error) {
      console.error(`Error updating patrol report with id ${id}:`, error);
      throw error;
    }
  }

  // Appointment operations
  async getAppointments(): Promise<Appointment[]> {
    try {
      return await db.select().from(appointments).orderBy(appointments.scheduledAt);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  async getTodaysAppointments(): Promise<Appointment[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return await db.select().from(appointments)
        .where(and(
          gte(appointments.scheduledAt, today),
          lt(appointments.scheduledAt, tomorrow)
        ))
        .orderBy(appointments.scheduledAt);
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
      return [];
    }
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    try {
      const [appointment] = await db.insert(appointments).values({
        id: crypto.randomUUID(),
        ...appointmentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return appointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment> {
    try {
      const [appointment] = await db
        .update(appointments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(appointments.id, id))
        .returning();
      if (!appointment) {
        throw new Error(`Appointment with id ${id} not found for update.`);
      }
      return appointment;
    } catch (error) {
      console.error(`Error updating appointment with id ${id}:`, error);
      throw error;
    }
  }

  // Activity tracking
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    try {
      const [activity] = await db.insert(activities).values({
        id: crypto.randomUUID(),
        ...activityData,
        createdAt: new Date(),
      }).returning();
      return activity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  async getActivities(limit: number = 50): Promise<Activity[]> {
    try {
      return await db.select().from(activities)
        .orderBy(desc(activities.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  // Financial operations
  async getFinancialRecords(): Promise<FinancialRecord[]> {
    try {
      return await db.select().from(financialRecords).orderBy(desc(financialRecords.date));
    } catch (error) {
      console.error('Error fetching financial records:', error);
      return [];
    }
  }

  async getFinancialSummary(): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  }> {
    try {
      const records = await db.select().from(financialRecords);
      const totalRevenue = records
        .filter(r => r.type === 'payment')
        .reduce((sum, r) => sum + Number(r.amount), 0);
      const totalExpenses = records
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + Number(r.amount), 0);

      return {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
      };
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      return { totalRevenue: 0, totalExpenses: 0, netProfit: 0 };
    }
  }

  async createFinancialRecord(recordData: InsertFinancialRecord): Promise<FinancialRecord> {
    try {
      const [record] = await db.insert(financialRecords).values({
        id: crypto.randomUUID(),
        ...recordData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return record;
    } catch (error) {
      console.error('Error creating financial record:', error);
      throw error;
    }
  }

  // File operations
  async createFileUpload(fileData: InsertFileUpload): Promise<FileUpload> {
    try {
      const [file] = await db.insert(fileUploads).values({
        id: crypto.randomUUID(),
        ...fileData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return file;
    } catch (error) {
      console.error('Error creating file upload:', error);
      throw error;
    }
  }

  async getFilesByEntity(entityType: string, entityId: string): Promise<FileUpload[]> {
    try {
      return await db
        .select()
        .from(fileUploads)
        .where(
          and(
            eq(fileUploads.entityType, entityType),
            eq(fileUploads.entityId, entityId)
          )
        )
        .orderBy(desc(fileUploads.createdAt));
    } catch (error) {
      console.error(`Error fetching files for entity ${entityType}/${entityId}:`, error);
      return [];
    }
  }

  // Evidence storage
  async getEvidence(): Promise<any[]> {
    try {
      return await db.select().from(fileUploads).orderBy(desc(fileUploads.createdAt));
    } catch (error) {
      console.error('Error fetching evidence:', error);
      return [];
    }
  }

  async createEvidence(evidenceData: any): Promise<any> {
    try {
      const [evidence] = await db.insert(fileUploads).values({
        id: crypto.randomUUID(),
        ...evidenceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return evidence;
    } catch (error) {
      console.error('Error creating evidence:', error);
      throw error;
    }
  }

  // Community resources
  async getCommunityResources(): Promise<any[]> {
    try {
      return await db.select().from(communityResources).orderBy(communityResources.name);
    } catch (error) {
      console.error('Error fetching community resources:', error);
      return [];
    }
  }

  async createCommunityResource(resourceData: any): Promise<any> {
    try {
      const [resource] = await db.insert(communityResources).values({
        id: crypto.randomUUID(),
        ...resourceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return resource;
    } catch (error) {
      console.error('Error creating community resource:', error);
      throw error;
    }
  }

  // Law references
  async getLawReferences(filters?: { search?: string; category?: string }): Promise<any[]> {
    try {
      let query = db.select().from(lawReferences);

      if (filters?.search) {
        query = query.where(
          or(
            like(lawReferences.title, `%${filters.search}%`),
            like(lawReferences.content, `%${filters.search}%`)
          )
        );
      }

      if (filters?.category) {
        query = query.where(eq(lawReferences.category, filters.category));
      }

      return await query.orderBy(lawReferences.title);
    } catch (error) {
      console.error('Error fetching law references:', error);
      return [];
    }
  }

  async createLawReference(lawData: any): Promise<any> {
    try {
      const [law] = await db.insert(lawReferences).values({
        id: crypto.randomUUID(),
        ...lawData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return law;
    } catch (error) {
      console.error('Error creating law reference:', error);
      throw error;
    }
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalIncidents: number;
    activePatrols: number;
    propertiesSecured: number;
    staffOnDuty: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalIncidentsResult] = await db.select({ count: sql`count(*)` }).from(incidents);
      const totalIncidents = Number(totalIncidentsResult?.count || 0);

      const [activePatrolsResult] = await db.select({ count: sql`count(*)` }).from(patrolReports)
        .where(
          and(
            eq(patrolReports.status, 'in_progress'),
            gte(patrolReports.startTime, today)
          )
        );
      const activePatrols = Number(activePatrolsResult?.count || 0);

      const [propertiesSecuredResult] = await db.select({ count: sql`count(*)` }).from(properties)
        .where(eq(properties.status, 'active'));
      const propertiesSecured = Number(propertiesSecuredResult?.count || 0);

      const [staffOnDutyResult] = await db.select({ count: sql`count(*)` }).from(users)
        .where(eq(users.status, 'active'));
      const staffOnDuty = Number(staffOnDutyResult?.count || 0);

      return {
        totalIncidents,
        activePatrols,
        propertiesSecured,
        staffOnDuty,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { totalIncidents: 0, activePatrols: 0, propertiesSecured: 0, staffOnDuty: 0 };
    }
  }

  // Seed database with sample data
  async seedDatabase() {
    try {
      console.log('🌱 Starting database seeding...');

      // Create sample clients
      const sampleClients = [
        {
          id: crypto.randomUUID(),
          name: "Aloha Resort & Spa",
          contactName: "Maria Santos",
          email: "maria@aloharesort.com",
          phone: "(808) 555-0101",
          address: "123 Kaanapali Beach Dr, Lahaina, HI 96761",
          contractStartDate: new Date('2024-01-01'),
          contractEndDate: new Date('2024-12-31'),
          monthlyRate: "15000.00",
          notes: "Luxury resort requiring 24/7 security coverage",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          name: "Pacific Business Center",
          contactName: "James Chen",
          email: "security@pbcenter.com",
          phone: "(808) 555-0102",
          address: "456 Ward Ave, Honolulu, HI 96814",
          contractStartDate: new Date('2024-02-01'),
          contractEndDate: new Date('2025-01-31'),
          monthlyRate: "8500.00",
          notes: "Commercial office building with parking garage",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      for (const client of sampleClients) {
        await db.insert(clients).values(client).onConflictDoNothing();
      }

      // Create sample properties
      const sampleProperties = [
        {
          id: crypto.randomUUID(),
          clientId: sampleClients[0].id,
          name: "Aloha Resort Main Building",
          address: "123 Kaanapali Beach Dr, Lahaina, HI 96761",
          propertyType: "resort",
          coordinates: "20.9292,-156.6960",
          accessInstructions: "Main entrance keycard access, security office on ground floor",
          emergencyContact: "Front Desk: (808) 555-0101",
          specialInstructions: "Monitor pool area after 10 PM, check beach access points hourly",
          riskLevel: "medium",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          clientId: sampleClients[1].id,
          name: "Pacific Business Center",
          address: "456 Ward Ave, Honolulu, HI 96814",
          propertyType: "commercial",
          coordinates: "21.2969,-157.8482",
          accessInstructions: "Badge access to all floors, security desk in lobby",
          emergencyContact: "Building Manager: (808) 555-0102",
          specialInstructions: "Lock down all floors after business hours, patrol parking garage every 2 hours",
          riskLevel: "low",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      for (const property of sampleProperties) {
        await db.insert(properties).values(property).onConflictDoNothing();
      }

      // Create sample staff
      const sampleStaff = [
        {
          id: crypto.randomUUID(),
          email: "officer.kane@hawaiisecurity.com",
          firstName: "Keoni",
          lastName: "Kane",
          role: "officer",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          email: "officer.patel@hawaiisecurity.com",
          firstName: "Leilani",
          lastName: "Patel",
          role: "officer",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      for (const staff of sampleStaff) {
        await db.insert(users).values(staff).onConflictDoNothing();
      }

      // Create sample incidents
      const sampleIncidents = [
        {
          id: crypto.randomUUID(),
          propertyId: sampleProperties[0].id,
          reportedBy: sampleStaff[0].id,
          incidentType: "trespassing",
          severity: "medium",
          description: "Unauthorized individual found on private beach area after hours. Individual was escorted off property without incident.",
          location: "Private beach access - North end",
          coordinates: "20.9295,-156.6965",
          occuredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          status: "resolved",
          policeReported: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          propertyId: sampleProperties[1].id,
          reportedBy: sampleStaff[1].id,
          incidentType: "vandalism",
          severity: "low",
          description: "Graffiti discovered on exterior wall of building. Maintenance notified for cleanup.",
          location: "South exterior wall - parking garage level",
          coordinates: "21.2965,-157.8485",
          occuredAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          status: "open",
          policeReported: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      for (const incident of sampleIncidents) {
        await db.insert(incidents).values(incident).onConflictDoNothing();
      }

      // Create sample patrol reports
      const sampleReports = [
        {
          id: crypto.randomUUID(),
          officerId: sampleStaff[0].id,
          propertyId: sampleProperties[0].id,
          shiftType: "day",
          startTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          endTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          status: "completed",
          summary: "Routine patrol completed. All areas secured. Pool area monitored, beach access checked hourly as requested.",
          incidentsReported: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          officerId: sampleStaff[1].id,
          propertyId: sampleProperties[1].id,
          shiftType: "night",
          startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          endTime: null,
          status: "in_progress",
          summary: "Night shift in progress. Building lockdown completed. Parking garage patrol scheduled for next hour.",
          incidentsReported: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      for (const report of sampleReports) {
        await db.insert(patrolReports).values(report).onConflictDoNothing();
      }

      // Create sample law references
      const sampleLaws = [
        {
          id: crypto.randomUUID(),
          title: "Hawaii Revised Statutes §708-813 - Criminal Trespass in the First Degree",
          category: "trespassing",
          content: "A person commits criminal trespass in the first degree if the person knowingly enters or remains unlawfully in a building.",
          source: "Hawaii Revised Statutes",
          effectiveDate: new Date('2023-01-01'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          title: "Hawaii Revised Statutes §708-821 - Criminal Property Damage in the Fourth Degree",
          category: "vandalism",
          content: "A person commits criminal property damage in the fourth degree if the person intentionally damages property of another without the other's consent.",
          source: "Hawaii Revised Statutes",
          effectiveDate: new Date('2023-01-01'),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      for (const law of sampleLaws) {
        await db.insert(lawReferences).values(law).onConflictDoNothing();
      }

      // Create sample community resources
      const sampleResources = [
        {
          id: crypto.randomUUID(),
          name: "Honolulu Police Department",
          category: "emergency",
          description: "Primary law enforcement agency for Honolulu County",
          contactInfo: "Emergency: 911, Non-emergency: (808) 529-3111",
          address: "801 S Beretania St, Honolulu, HI 96813",
          website: "https://www.honolulupd.org",
          availability: "24/7",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          name: "Institute for Human Services",
          category: "social_services",
          description: "Homeless services and emergency shelter",
          contactInfo: "(808) 447-2800",
          address: "350 Sumner St, Honolulu, HI 96817",
          website: "https://www.ihshawaii.org",
          availability: "Monday-Friday 8AM-5PM",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      for (const resource of sampleResources) {
        await db.insert(communityResources).values(resource).onConflictDoNothing();
      }

      // Create sample activities
      const sampleActivities = [
        {
          id: crypto.randomUUID(),
          userId: sampleStaff[0].id,
          activityType: "incident",
          entityType: "incident",
          entityId: sampleIncidents[0].id,
          description: "Reported trespassing incident at Aloha Resort",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: crypto.randomUUID(),
          userId: sampleStaff[1].id,
          activityType: "patrol",
          entityType: "patrol_report",
          entityId: sampleReports[1].id,
          description: "Started night shift patrol at Pacific Business Center",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        }
      ];

      for (const activity of sampleActivities) {
        await db.insert(activities).values(activity).onConflictDoNothing();
      }

      // Check if admin user already exists
      const existingAdmin = await db.query.users.findFirst({
        where: eq(users.username, 'STREETPATROL808'),
      });

      if (!existingAdmin) {
        console.log('Creating admin user...');
        const hashedPassword = await bcrypt.hash('Password3211', 10);

        await db.insert(users).values({
          id: crypto.randomUUID(), // Ensure ID is generated if not provided by schema
          username: 'STREETPATROL808',
          email: 'admin@hawaiisecurity.com',
          hashedPassword,
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          phone: '808-555-0001',
          badge: 'ADMIN001',
          department: 'Administration',
          shift: 'Day',
          status: 'active', // Use 'active' to match other status fields
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log('✅ Admin user created successfully');
      } else {
        console.log('✅ Admin user already exists');
      }

      console.log('✅ Database seeding completed');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();