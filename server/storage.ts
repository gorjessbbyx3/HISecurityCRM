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
import { eq, desc, and, gte, sql, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

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
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Staff management
  async getStaffMembers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getActiveStaff(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.status, "active"))
      .orderBy(users.firstName);
  }

  async updateUserStatus(id: string, status: string): Promise<void> {
    await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // Client operations
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(clientData).returning();
    return client;
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Property operations
  async getProperties(): Promise<Property[]> {
    return await db.select().from(properties).orderBy(desc(properties.createdAt));
  }

  async getPropertiesByClient(clientId: string): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(eq(properties.clientId, clientId))
      .orderBy(properties.name);
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(propertyData: InsertProperty): Promise<Property> {
    const [property] = await db.insert(properties).values(propertyData).returning();
    return property;
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property> {
    const [property] = await db
      .update(properties)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return property;
  }

  async deleteProperty(id: string): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  // Incident operations
  async getIncidents(): Promise<Incident[]> {
    return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
  }

  async getRecentIncidents(hours: number = 24): Promise<Incident[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db
      .select()
      .from(incidents)
      .where(gte(incidents.createdAt, since))
      .orderBy(desc(incidents.createdAt));
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async createIncident(incidentData: InsertIncident): Promise<Incident> {
    const [incident] = await db.insert(incidents).values(incidentData).returning();
    return incident;
  }

  async updateIncident(id: string, updates: Partial<InsertIncident>): Promise<Incident> {
    const [incident] = await db
      .update(incidents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return incident;
  }

  // Patrol report operations
  async getPatrolReports(): Promise<PatrolReport[]> {
    return await db.select().from(patrolReports).orderBy(desc(patrolReports.createdAt));
  }

  async getPatrolReportsByOfficer(officerId: string): Promise<PatrolReport[]> {
    return await db
      .select()
      .from(patrolReports)
      .where(eq(patrolReports.officerId, officerId))
      .orderBy(desc(patrolReports.createdAt));
  }

  async getTodaysReports(): Promise<PatrolReport[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db
      .select()
      .from(patrolReports)
      .where(
        and(
          gte(patrolReports.createdAt, today),
          lte(patrolReports.createdAt, tomorrow)
        )
      )
      .orderBy(desc(patrolReports.createdAt));
  }

  async createPatrolReport(reportData: InsertPatrolReport): Promise<PatrolReport> {
    const [report] = await db.insert(patrolReports).values(reportData).returning();
    return report;
  }

  async updatePatrolReport(id: string, updates: Partial<InsertPatrolReport>): Promise<PatrolReport> {
    const [report] = await db
      .update(patrolReports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(patrolReports.id, id))
      .returning();
    return report;
  }

  // Appointment operations
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(appointments.scheduledDate);
  }

  async getTodaysAppointments(): Promise<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.scheduledDate, today),
          lte(appointments.scheduledDate, tomorrow)
        )
      )
      .orderBy(appointments.scheduledDate);
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(appointmentData).returning();
    return appointment;
  }

  async updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  // Activity tracking
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(activityData).returning();
    return activity;
  }

  async getActivities(limit: number = 50): Promise<Activity[]> {
    return await db.select().from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  // Financial operations
  async getFinancialRecords(): Promise<FinancialRecord[]> {
    return await db.select().from(financialRecords).orderBy(desc(financialRecords.createdAt));
  }

  async getFinancialSummary(): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  }> {
    const [revenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(${financialRecords.amount}), 0)` })
      .from(financialRecords)
      .where(eq(financialRecords.recordType, "payment"));

    const [expenses] = await db
      .select({ total: sql<number>`COALESCE(SUM(${financialRecords.amount}), 0)` })
      .from(financialRecords)
      .where(eq(financialRecords.recordType, "expense"));

    const totalRevenue = Number(revenue.total) || 0;
    const totalExpenses = Number(expenses.total) || 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
    };
  }

  async createFinancialRecord(recordData: InsertFinancialRecord): Promise<FinancialRecord> {
    const [record] = await db.insert(financialRecords).values(recordData).returning();
    return record;
  }

  // File operations
  async createFileUpload(fileData: InsertFileUpload): Promise<FileUpload> {
    const [file] = await db.insert(fileUploads).values(fileData).returning();
    return file;
  }

  async getFilesByEntity(entityType: string, entityId: string): Promise<FileUpload[]> {
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
  }

  // Evidence storage
  async getEvidence(): Promise<any[]> {
    return await db.select({
      id: fileUploads.id,
      incidentId: fileUploads.entityId,
      fileName: fileUploads.fileName,
      fileUrl: fileUploads.fileUrl,
      fileType: fileUploads.fileType,
      uploadedBy: fileUploads.uploadedBy,
      uploadedByName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      createdAt: fileUploads.createdAt,
      incident: {
        incidentType: incidents.incidentType,
        location: incidents.location,
        description: incidents.description,
      }
    })
    .from(fileUploads)
    .leftJoin(users, eq(fileUploads.uploadedBy, users.id))
    .leftJoin(incidents, eq(fileUploads.entityId, incidents.id))
    .where(eq(fileUploads.entityType, 'incident'))
    .orderBy(desc(fileUploads.createdAt));
  }

  async createEvidence(data: any): Promise<any> {
    const [evidence] = await db.insert(fileUploads).values({
      entityType: data.entityType,
      entityId: data.entityId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSize: data.fileSize,
      uploadedBy: data.uploadedBy,
    }).returning();

    return evidence;
  }

  // Community resources
  async getCommunityResources(): Promise<any[]> {
    return await db.select().from(communityResources)
      .orderBy(desc(communityResources.createdAt));
  }

  async createCommunityResource(data: any): Promise<any> {
    const [resource] = await db.insert(communityResources).values({
      name: data.name,
      type: data.type,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website,
      hours: data.hours,
      services: data.services,
      status: data.status || 'active',
    }).returning();

    return resource;
  }

  // Law references
  async getLawReferences(filters?: { search?: string; category?: string }): Promise<any[]> {
    let query = this.db.select().from(lawReferences);

    if (filters?.search) {
      const search = `%${filters.search}%`;
      query = query.where(
        or(
          ilike(lawReferences.title, search),
          ilike(lawReferences.code, search),
          ilike(lawReferences.description, search)
        )
      );
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.where(eq(lawReferences.category, filters.category));
    }

    return await query.orderBy(desc(lawReferences.lastUpdated));
  }

  async createLawReference(data: any): Promise<any> {
    const [lawRef] = await this.db.insert(lawReferences).values({
      title: data.title,
      category: data.category,
      code: data.code,
      description: data.description,
      fullText: data.fullText,
      penalties: data.penalties,
      relatedCodes: data.relatedCodes,
      lastUpdated: new Date(),
    }).returning();

    return lawRef;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalIncidents: number;
    activePatrols: number;
    propertiesSecured: number;
    staffOnDuty: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalIncidents] = await this.db.select({ 
      count: sql<number>`count(*)` 
    }).from(incidents);

    const [activePatrols] = await this.db.select({ 
      count: sql<number>`count(*)` 
    }).from(patrolReports)
    .where(
      and(
        eq(patrolReports.status, 'in_progress'),
        gte(patrolReports.startTime, today)
      )
    );

    const [propertiesSecured] = await this.db.select({ 
      count: sql<number>`count(*)` 
    }).from(properties)
    .where(eq(properties.status, 'active'));

    const [staffOnDuty] = await this.db.select({ 
      count: sql<number>`count(*)` 
    }).from(users)
    .where(eq(users.status, 'active'));

    return {
      totalIncidents: totalIncidents?.count || 0,
      activePatrols: activePatrols?.count || 0,
      propertiesSecured: propertiesSecured?.count || 0,
      staffOnDuty: staffOnDuty?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();