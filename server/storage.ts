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
  getUserById(id: string): Promise<User | null>; // Fixed type consistency
  
  // Authentication operations
  login(username: string, password: string): Promise<{ success: boolean; user?: any; error?: string }>;
  createUser(userData: any): Promise<User>;
  updateUserPermissions(userId: string, permissions: string[]): Promise<void>;

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

  // Fixed method to fetch user by string ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || null;
    } catch (error) {
      console.error(`Error fetching user by ID ${id}:`, error);
      return null;
    }
  }

  // Create a new user
  async createUser(userData: any): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [user] = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          ...userData,
          hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user permissions (role-based access control)
  async updateUserPermissions(userId: string, permissions: string[]): Promise<void> {
    try {
      await db
        .update(users)
        .set({ 
          permissions: permissions,
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error(`Error updating permissions for user ${userId}:`, error);
      throw error;
    }
  }

  // Login method - for database users only, passport handles default admin
  async login(username: string, password: string) {
    try {
      // Look up user by email (since username might be email)
      const [user] = await db.select().from(users).where(eq(users.email, username));

      if (!user || !user.hashedPassword) {
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
            like(lawReferences.description, `%${filters.search}%`)
          )
        );
      }

      if (filters?.category) {
        query = query.where(eq(lawReferences.category, filters.category)) as any;
      }

      return await query.orderBy(lawReferences.title).execute();
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

  // Dashboard stats with trend calculations
  async getDashboardStats(): Promise<{
    totalIncidents: number;
    activePatrols: number;
    propertiesSecured: number;
    staffOnDuty: number;
    activePatrolsChange?: string;
    activePatrolsChangeType?: string;
    incidentsChange?: string;
    incidentsChangeType?: string;
    propertiesChange?: string;
    propertiesChangeType?: string;
    staffChange?: string;
    staffChangeType?: string;
  }> {
    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Current stats
      const [totalIncidentsResult] = await db.select({ count: sql`count(*)` }).from(incidents);
      const totalIncidents = Number(totalIncidentsResult?.count || 0);

      const [activePatrolsResult] = await db.select({ count: sql`count(*)` }).from(patrolReports)
        .where(eq(patrolReports.status, 'in_progress'));
      const activePatrols = Number(activePatrolsResult?.count || 0);

      const [propertiesSecuredResult] = await db.select({ count: sql`count(*)` }).from(properties)
        .where(eq(properties.status, 'active'));
      const propertiesSecured = Number(propertiesSecuredResult?.count || 0);

      const [staffOnDutyResult] = await db.select({ count: sql`count(*)` }).from(users)
        .where(eq(users.status, 'active'));
      const staffOnDuty = Number(staffOnDutyResult?.count || 0);

      // Yesterday's stats for comparison
      const [yesterdayIncidentsResult] = await db.select({ count: sql`count(*)` }).from(incidents)
        .where(and(
          gte(incidents.createdAt, yesterday),
          lte(incidents.createdAt, today)
        ));
      const yesterdayIncidents = Number(yesterdayIncidentsResult?.count || 0);

      const [yesterdayPatrolsResult] = await db.select({ count: sql`count(*)` }).from(patrolReports)
        .where(and(
          gte(patrolReports.startTime, yesterday),
          lte(patrolReports.startTime, today)
        ));
      const yesterdayPatrols = Number(yesterdayPatrolsResult?.count || 0);

      // Calculate trends
      const incidentsDiff = totalIncidents - yesterdayIncidents;
      const patrolsDiff = activePatrols - yesterdayPatrols;

      return {
        totalIncidents,
        activePatrols,
        propertiesSecured,
        staffOnDuty,
        activePatrolsChange: patrolsDiff > 0 ? `+${patrolsDiff} from yesterday` : 
                           patrolsDiff < 0 ? `${patrolsDiff} from yesterday` : 'No change',
        activePatrolsChangeType: patrolsDiff > 0 ? 'positive' : patrolsDiff < 0 ? 'negative' : 'neutral',
        incidentsChange: incidentsDiff > 0 ? `+${incidentsDiff} from yesterday` : 
                        incidentsDiff < 0 ? `${incidentsDiff} from yesterday` : 'No change',
        incidentsChangeType: incidentsDiff < 0 ? 'positive' : incidentsDiff > 0 ? 'negative' : 'neutral',
        propertiesChange: `${propertiesSecured} active`,
        propertiesChangeType: 'neutral',
        staffChange: `${staffOnDuty} available`,
        staffChangeType: 'neutral'
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { 
        totalIncidents: 0, 
        activePatrols: 0, 
        propertiesSecured: 0, 
        staffOnDuty: 0,
        activePatrolsChange: 'No data',
        activePatrolsChangeType: 'neutral',
        incidentsChange: 'No data',
        incidentsChangeType: 'neutral',
        propertiesChange: 'No data',
        propertiesChangeType: 'neutral',
        staffChange: 'No data',
        staffChangeType: 'neutral'
      };
    }
  }

  // Initialize database with essential admin user only
  async seedDatabase() {
    try {
      console.log('🌱 Starting database initialization...');

      // Check if admin user already exists
      const existingAdmin = await db.query.users.findFirst({
        where: eq(users.username, 'STREETPATROL808'),
      });

      if (!existingAdmin) {
        console.log('Creating admin user...');
        const hashedPassword = await bcrypt.hash('Password3211', 10);

        await db.insert(users).values({
          id: crypto.randomUUID(),
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
          status: 'active',
          permissions: ['admin', 'create_users', 'manage_clients', 'view_reports'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log('✅ Admin user created successfully');
      } else {
        console.log('✅ Admin user already exists');
      }

      console.log('✅ Database initialization completed');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();