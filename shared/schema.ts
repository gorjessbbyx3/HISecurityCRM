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
  guardCount: z.number().optional().default(1),
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

// Client-safe schema for evidence creation (excludes server-controlled fields)
export const createEvidenceInputSchema = z.object({
  entityType: z.enum(['incident', 'patrol_report', 'property', 'client', 'user', 'general']),
  entityId: z.string().optional(),
  fileName: z.string().min(1),
  originalFileName: z.string().optional(),
  fileUrl: z.string().url(),
  fileType: z.enum(['image', 'video', 'document', 'audio']),
  mimeType: z.string().optional(),
  fileSize: z.number().positive(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  // Note: uploadedBy, status, accessLevel excluded for security
  location: z.string().optional(),
  coordinates: z.string().optional(),
  capturedAt: z.string().transform(str => new Date(str)).optional(),
  notes: z.string().optional(),
});

// Server-only schema for evidence creation (includes all fields)
export const insertEvidenceSchema = createEvidenceInputSchema.extend({
  uploadedBy: z.string(), // Set server-side from req.user.id
  status: z.enum(['active', 'archived', 'deleted']).default('active'),
  accessLevel: z.enum(['public', 'restricted', 'confidential']).default('restricted'),
});

// Restrictive client-safe schema for evidence updates (only safe fields)
export const updateEvidenceInputSchema = z.object({
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  // Note: fileName, fileUrl, accessLevel, status excluded for security
});

// Full update schema for server operations (includes all updateable fields)
export const updateEvidenceSchema = insertEvidenceSchema.partial().omit({ uploadedBy: true });

// Community Resource schemas
export const insertCommunityResourceSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['emergency_services', 'healthcare', 'social_services', 'education', 'legal_aid', 'housing', 'transportation']),
  subcategory: z.string().optional(),
  description: z.string().min(1),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  coordinates: z.string().optional(), // latitude,longitude
  operatingHours: z.string().optional(),
  languages: z.array(z.string()).optional(),
  servicesOffered: z.array(z.string()).optional(),
  eligibilityRequirements: z.string().optional(),
  cost: z.enum(['free', 'sliding_scale', 'insurance_accepted', 'fee_for_service']).optional(),
  accessibilityFeatures: z.array(z.string()).optional(),
  transportationInfo: z.string().optional(),
  specialNotes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  status: z.enum(['active', 'inactive', 'temporarily_closed', 'permanently_closed']).default('active'),
  verifiedAt: z.string().transform(str => new Date(str)).optional(),
  verifiedBy: z.string().optional(),
});

// Client-safe schema for community resource creation (excludes verification fields)
export const createCommunityResourceInputSchema = insertCommunityResourceSchema.omit({
  verifiedAt: true,
  verifiedBy: true,
});

// Client-safe schema for community resource updates (excludes verification and system fields)
export const updateCommunityResourceInputSchema = createCommunityResourceInputSchema.partial();

// Full update schema for server operations (includes verification fields)
export const updateCommunityResourceSchema = insertCommunityResourceSchema.partial();

// Export types
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type InsertPatrolReport = z.infer<typeof insertPatrolReportSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertFinancialRecord = z.infer<typeof insertFinancialRecordSchema>;
export type CreateEvidenceInput = z.infer<typeof createEvidenceInputSchema>;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type UpdateEvidenceInput = z.infer<typeof updateEvidenceInputSchema>;
export type UpdateEvidence = z.infer<typeof updateEvidenceSchema>;
export type CreateCommunityResourceInput = z.infer<typeof createCommunityResourceInputSchema>;
export type InsertCommunityResource = z.infer<typeof insertCommunityResourceSchema>;
export type UpdateCommunityResourceInput = z.infer<typeof updateCommunityResourceInputSchema>;
export type UpdateCommunityResource = z.infer<typeof updateCommunityResourceSchema>;