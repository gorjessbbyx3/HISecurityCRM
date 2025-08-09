import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("security_officer"), // admin, supervisor, security_officer
  badge: varchar("badge"),
  phone: varchar("phone"),
  status: varchar("status").default("active"), // active, inactive, on_leave
  zone: varchar("zone"),
  shift: varchar("shift"), // day, night, swing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  company: varchar("company"),
  address: text("address"),
  contactPerson: varchar("contact_person"),
  contractStart: date("contract_start"),
  contractEnd: date("contract_end"),
  status: varchar("status").default("active"), // active, inactive, pending
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  propertyType: varchar("property_type"), // residential, commercial, industrial
  zone: varchar("zone"),
  securityLevel: varchar("security_level").default("standard"), // low, standard, high, maximum
  accessCodes: text("access_codes"),
  specialInstructions: text("special_instructions"),
  coordinates: varchar("coordinates"), // lat,lng
  coverageType: varchar("coverage_type").default("patrol"), // patrol, stationed, mobile
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Crime incidents table
export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id),
  reportedBy: varchar("reported_by").references(() => users.id),
  incidentType: varchar("incident_type").notNull(), // trespassing, vandalism, theft, suspicious_activity
  severity: varchar("severity").default("medium"), // low, medium, high, critical
  description: text("description").notNull(),
  location: varchar("location"),
  coordinates: varchar("coordinates"),
  status: varchar("status").default("open"), // open, investigating, resolved, closed
  photoUrls: text("photo_urls").array(),
  policeReported: boolean("police_reported").default(false),
  policeReportNumber: varchar("police_report_number"),
  occuredAt: timestamp("occured_at").notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patrol reports table
export const patrolReports = pgTable("patrol_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  officerId: varchar("officer_id").references(() => users.id),
  propertyId: varchar("property_id").references(() => properties.id),
  shiftType: varchar("shift_type"), // day, night, swing
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  checkpoints: text("checkpoints").array(),
  incidentsReported: integer("incidents_reported").default(0),
  summary: text("summary").notNull(),
  photoUrls: text("photo_urls").array(),
  weatherConditions: varchar("weather_conditions"),
  vehicleUsed: varchar("vehicle_used"),
  mileage: decimal("mileage", { precision: 8, scale: 2 }),
  status: varchar("status").default("in_progress"), // in_progress, completed, reviewed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointments/Scheduling table
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id),
  propertyId: varchar("property_id").references(() => properties.id),
  assignedOfficer: varchar("assigned_officer").references(() => users.id),
  appointmentType: varchar("appointment_type"), // consultation, inspection, patrol, maintenance
  title: varchar("title").notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").default(60), // minutes
  status: varchar("status").default("scheduled"), // scheduled, in_progress, completed, cancelled
  location: varchar("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity tracking table
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  activityType: varchar("activity_type").notNull(), // patrol, incident, report, client_contact
  entityType: varchar("entity_type"), // client, property, incident, report
  entityId: varchar("entity_id"),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Accounting/Financial records table
export const financialRecords = pgTable("financial_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id),
  recordType: varchar("record_type").notNull(), // invoice, payment, expense
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category"), // patrol_services, consultation, equipment, travel
  taxCategory: varchar("tax_category"), // deductible, non_deductible, exempt
  transactionDate: date("transaction_date").notNull(),
  paymentMethod: varchar("payment_method"), // cash, check, credit_card, bank_transfer
  referenceNumber: varchar("reference_number"),
  status: varchar("status").default("pending"), // pending, paid, overdue, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// File uploads table
export const fileUploads = pgTable("file_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type").notNull(), // incident, patrol_report, property
  entityId: varchar("entity_id").notNull(),
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileType: varchar("file_type"), // image, document, video
  fileSize: integer("file_size"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community resources table
export const communityResources = pgTable("community_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // shelter, medical, food, legal, mental_health, education, employment
  description: text("description").notNull(),
  address: text("address").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  website: varchar("website"),
  hours: varchar("hours").notNull(),
  services: text("services").array(),
  status: varchar("status").default("active"), // active, limited, closed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Law references table
export const lawReferences = pgTable("law_references", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  category: varchar("category").notNull(), // criminal, traffic, property, public_safety, business, environmental, civil_rights, administrative
  code: varchar("code").notNull(), // e.g., HRS §711-1101
  description: text("description").notNull(),
  fullText: text("full_text").notNull(),
  penalties: text("penalties"),
  relatedCodes: text("related_codes").array(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  patrolReports: many(patrolReports),
  incidents: many(incidents),
  appointments: many(appointments),
  activities: many(activities),
  fileUploads: many(fileUploads),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  properties: many(properties),
  appointments: many(appointments),
  financialRecords: many(financialRecords),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  client: one(clients, {
    fields: [properties.clientId],
    references: [clients.id],
  }),
  incidents: many(incidents),
  patrolReports: many(patrolReports),
  appointments: many(appointments),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
  property: one(properties, {
    fields: [incidents.propertyId],
    references: [properties.id],
  }),
  reportedByUser: one(users, {
    fields: [incidents.reportedBy],
    references: [users.id],
  }),
}));

export const patrolReportsRelations = relations(patrolReports, ({ one }) => ({
  officer: one(users, {
    fields: [patrolReports.officerId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [patrolReports.propertyId],
    references: [properties.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
  property: one(properties, {
    fields: [appointments.propertyId],
    references: [properties.id],
  }),
  assignedOfficerUser: one(users, {
    fields: [appointments.assignedOfficer],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const financialRecordsRelations = relations(financialRecords, ({ one }) => ({
  client: one(clients, {
    fields: [financialRecords.clientId],
    references: [clients.id],
  }),
}));

export const fileUploadsRelations = relations(fileUploads, ({ one }) => ({
  uploadedByUser: one(users, {
    fields: [fileUploads.uploadedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPatrolReportSchema = createInsertSchema(patrolReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertFinancialRecordSchema = createInsertSchema(financialRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileUploadSchema = createInsertSchema(fileUploads).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityResourceSchema = createInsertSchema(communityResources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLawReferenceSchema = createInsertSchema(lawReferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;

export type PatrolReport = typeof patrolReports.$inferSelect;
export type InsertPatrolReport = z.infer<typeof insertPatrolReportSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = z.infer<typeof insertFinancialRecordSchema>;

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = z.infer<typeof insertFileUploadSchema>;

export type CommunityResource = typeof communityResources.$inferSelect;
export type InsertCommunityResource = z.infer<typeof insertCommunityResourceSchema>;

export type LawReference = typeof lawReferences.$inferSelect;
export type InsertLawReference = z.infer<typeof insertLawReferenceSchema>;
