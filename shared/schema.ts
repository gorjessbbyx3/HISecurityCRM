// In-memory storage types - no database schema needed
import { z } from "zod";

// Basic validation schemas for in-memory storage
export const insertClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contractStart: z.string().optional(),
  contractEnd: z.string().optional(),
  status: z.string().default('active'),
  notes: z.string().optional(),
});

export const insertPropertySchema = z.object({
  clientId: z.string().optional(),
  name: z.string().min(1),
  address: z.string().min(1),
  propertyType: z.string().optional(),
  zone: z.string().optional(),
  securityLevel: z.string().default('standard'),
  accessCodes: z.string().optional(),
  specialInstructions: z.string().optional(),
  coordinates: z.string().optional(),
  coverageType: z.string().default('patrol'),
  status: z.string().default('active'),
});

export const insertIncidentSchema = z.object({
  propertyId: z.string().optional(),
  reportedBy: z.string().optional(),
  incidentType: z.string().min(1),
  severity: z.string().default('medium'),
  description: z.string().min(1),
  location: z.string().optional(),
  coordinates: z.string().optional(),
  status: z.string().default('open'),
  photoUrls: z.array(z.string()).optional(),
  policeReported: z.boolean().default(false),
  policeReportNumber: z.string().optional(),
  occuredAt: z.string().transform(str => new Date(str)),
  resolvedAt: z.string().transform(str => new Date(str)).optional(),
});

export const insertPatrolReportSchema = z.object({
  officerId: z.string().optional(),
  propertyId: z.string().optional(),
  shiftType: z.string().optional(),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)).optional(),
  checkpoints: z.array(z.string()).optional(),
  incidentsReported: z.number().default(0),
  summary: z.string().min(1),
  photoUrls: z.array(z.string()).optional(),
  weatherConditions: z.string().optional(),
  vehicleUsed: z.string().optional(),
  mileage: z.number().optional(),
  status: z.string().default('in_progress'),
});

export const insertAppointmentSchema = z.object({
  clientId: z.string().optional(),
  propertyId: z.string().optional(),
  assignedOfficer: z.string().optional(),
  appointmentType: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  scheduledDate: z.string().transform(str => new Date(str)),
  duration: z.number().default(60),
  status: z.string().default('scheduled'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const insertFinancialRecordSchema = z.object({
  clientId: z.string().optional(),
  recordType: z.string().min(1),
  amount: z.number(),
  description: z.string().min(1),
  category: z.string().optional(),
  taxCategory: z.string().optional(),
  transactionDate: z.string(),
  paymentMethod: z.string().optional(),
  referenceNumber: z.string().optional(),
  status: z.string().default('pending'),
  notes: z.string().optional(),
});

// Export types
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type InsertPatrolReport = z.infer<typeof insertPatrolReportSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertFinancialRecord = z.infer<typeof insertFinancialRecordSchema>;

// Full entity types (with id and timestamps)
export type Client = InsertClient & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Property = InsertProperty & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Incident = InsertIncident & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PatrolReport = InsertPatrolReport & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Appointment = InsertAppointment & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FinancialRecord = InsertFinancialRecord & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};
