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

  // Database seeding
  seedDatabase(): Promise<void>;
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
    return await db.select().from(users).orderBy(users.firstName);
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
    return await db.select().from(clients).orderBy(clients.name);
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values({
      id: crypto.randomUUID(),
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
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
    return await db.select().from(properties).orderBy(properties.name);
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
    const [property] = await db.insert(properties).values({
      id: crypto.randomUUID(),
      ...propertyData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
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
    return await db.select().from(incidents).orderBy(desc(incidents.occuredAt));
  }

  async getRecentIncidents(hours: number = 24): Promise<Incident[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db.select().from(incidents)
      .where(gte(incidents.occuredAt, cutoff))
      .orderBy(desc(incidents.occuredAt));
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async createIncident(incidentData: InsertIncident): Promise<Incident> {
    const [incident] = await db.insert(incidents).values({
      id: crypto.randomUUID(),
      ...incidentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
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
    return await db.select().from(patrolReports).orderBy(desc(patrolReports.startTime));
  }

  async getPatrolReportsByOfficer(officerId: string): Promise<PatrolReport[]> {
    return await db
      .select()
      .from(patrolReports)
      .where(eq(patrolReports.officerId, officerId))
      .orderBy(desc(patrolReports.startTime));
  }

  async getTodaysReports(): Promise<PatrolReport[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await db.select().from(patrolReports)
      .where(gte(patrolReports.startTime, today))
      .orderBy(desc(patrolReports.startTime));
  }

  async createPatrolReport(reportData: InsertPatrolReport): Promise<PatrolReport> {
    const [report] = await db.insert(patrolReports).values({
      id: crypto.randomUUID(),
      ...reportData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
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
    return await db.select().from(appointments).orderBy(appointments.scheduledAt);
  }

  async getTodaysAppointments(): Promise<Appointment[]> {
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
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values({
      id: crypto.randomUUID(),
      ...appointmentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return appointment;
  }

  // Activity tracking
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values({
      id: crypto.randomUUID(),
      ...activityData,
      createdAt: new Date(),
    }).returning();
    return activity;
  }

  async getActivities(limit: number = 50): Promise<Activity[]> {
    return await db.select().from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  // Financial operations
  async getFinancialRecords(): Promise<FinancialRecord[]> {
    return await db.select().from(financialRecords).orderBy(desc(financialRecords.date));
  }

  async getFinancialSummary(): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  }> {
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
  }

  async createFinancialRecord(recordData: InsertFinancialRecord): Promise<FinancialRecord> {
    const [record] = await db.insert(financialRecords).values({
      id: crypto.randomUUID(),
      ...recordData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return record;
  }

  // File operations
  async createFileUpload(fileData: InsertFileUpload): Promise<FileUpload> {
    const [file] = await db.insert(fileUploads).values({
      id: crypto.randomUUID(),
      ...fileData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
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
    return await db.select().from(fileUploads).orderBy(desc(fileUploads.createdAt));
  }

  async createEvidence(evidenceData: any): Promise<any> {
    const [evidence] = await db.insert(fileUploads).values({
      id: crypto.randomUUID(),
      ...evidenceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return evidence;
  }

  // Community resources
  async getCommunityResources(): Promise<any[]> {
    return await db.select().from(communityResources).orderBy(communityResources.name);
  }

  async createCommunityResource(resourceData: any): Promise<any> {
    const [resource] = await db.insert(communityResources).values({
      id: crypto.randomUUID(),
      ...resourceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return resource;
  }

  // Law references
  async getLawReferences(filters?: { search?: string; category?: string }): Promise<any[]> {
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
  }

  async createLawReference(lawData: any): Promise<any> {
    const [law] = await db.insert(lawReferences).values({
      id: crypto.randomUUID(),
      ...lawData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return law;
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

    const [totalIncidents] = await db.select({ count: sql`count(*)` }).from(incidents);

    const [activePatrols] = await db.select({ count: sql`count(*)` }).from(patrolReports)
      .where(
        and(
          eq(patrolReports.status, 'in_progress'),
          gte(patrolReports.startTime, today)
        )
      );

    const [propertiesSecured] = await db.select({ count: sql`count(*)` }).from(properties)
      .where(eq(properties.status, 'active'));

    const [staffOnDuty] = await db.select({ count: sql`count(*)` }).from(users)
      .where(eq(users.status, 'active'));

    return {
      totalIncidents: Number(totalIncidents?.[0]?.count || 0),
      activePatrols: Number(activePatrols?.[0]?.count || 0),
      propertiesSecured: Number(propertiesSecured?.[0]?.count || 0),
      staffOnDuty: Number(staffOnDuty?.[0]?.count || 0),
    };
  }

  // Seed database with sample data
  async seedDatabase() {
    console.log('Seeding database with sample data...');

    try {
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

      console.log('Database seeded successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();