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

// Law Reference schemas
export const insertLawReferenceSchema = z.object({
  title: z.string().min(1),
  category: z.enum(['hawaii_state', 'federal', 'city_county', 'administrative', 'case_law']),
  subcategory: z.enum(['criminal_law', 'civil_law', 'traffic', 'property', 'business', 'labor', 'environmental']).optional(),
  jurisdiction: z.string().min(1), // 'State of Hawaii', 'Federal', 'City & County of Honolulu', etc.
  lawType: z.enum(['statute', 'regulation', 'ordinance', 'code', 'case', 'constitution']),
  citation: z.string().min(1), // official legal citation
  chapter: z.string().optional(),
  section: z.string().optional(),
  subsection: z.string().optional(),
  description: z.string().min(1),
  fullText: z.string().optional(), // complete text of the law/statute
  summary: z.string().min(1), // brief summary for quick reference
  keyProvisions: z.array(z.string()).optional(), // key points or provisions
  applicableScenarios: z.array(z.string()).optional(), // when this law applies
  penalties: z.string().optional(), // penalties or consequences
  relatedLaws: z.array(z.string()).optional(), // references to related law IDs
  precedingLaw: z.string().optional(), // what law this supersedes or amends
  amendedBy: z.array(z.string()).optional(), // laws that have amended this one
  effectiveDate: z.string().transform(str => new Date(str)),
  expirationDate: z.string().transform(str => new Date(str)).optional(), // for temporary laws
  lastAmended: z.string().transform(str => new Date(str)).optional(),
  keywords: z.array(z.string()).optional(), // searchable keywords
  tags: z.array(z.string()).optional(),
  searchableText: z.string().min(1), // combined searchable content
  officialUrl: z.string().url().optional(), // link to official source
  sourceDocument: z.string().optional(), // official document reference
  interpretationNotes: z.string().optional(), // guidance on interpretation
  commonMisunderstandings: z.string().optional(), // clarifications
  practicalApplications: z.array(z.string()).optional(), // real-world applications
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'), // importance for security personnel
  relevanceToSecurity: z.enum(['high', 'medium', 'low']).default('medium'), // specific relevance to security work
  status: z.enum(['active', 'superseded', 'repealed', 'pending']).default('active'),
  verified: z.boolean().default(false), // whether the reference has been verified for accuracy
  verifiedAt: z.string().transform(str => new Date(str)).optional(),
  verifiedBy: z.string().optional(), // user ID who verified
});

// Client-safe schema for law reference creation (excludes verification fields)
export const createLawReferenceInputSchema = insertLawReferenceSchema.omit({
  verifiedAt: true,
  verifiedBy: true,
  verified: true,
});

// Client-safe schema for law reference updates (excludes verification and system fields)
export const updateLawReferenceInputSchema = createLawReferenceInputSchema.partial();

// Full update schema for server operations (includes verification fields)
export const updateLawReferenceSchema = insertLawReferenceSchema.partial();

// Schedule Management schemas
export const insertScheduleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  staffId: z.string().min(1, "Staff member is required"),
  propertyId: z.string().optional(),
  shiftType: z.enum(['day', 'evening', 'night', 'overnight', 'split']),
  scheduleType: z.enum(['regular', 'overtime', 'emergency', 'training', 'meeting', 'patrol']),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)),
  duration: z.number().positive().optional(), // calculated if not provided
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).default('scheduled'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  recurring: z.boolean().default(false),
  recurrencePattern: z.enum(['daily', 'weekly', 'monthly', 'custom']).optional(),
  recurrenceEndDate: z.string().transform(str => new Date(str)).optional(),
  parentScheduleId: z.string().optional(), // for recurring schedules
  location: z.string().optional(),
  coordinates: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  specialInstructions: z.string().optional(),
  checkpoints: z.array(z.string()).optional(),
  estimatedMileage: z.number().min(0).optional(),
  weatherConsiderations: z.string().optional(),
  backupStaffId: z.string().optional(),
  supervisorId: z.string().optional(),
  clientNotificationRequired: z.boolean().default(false),
  clientNotificationSent: z.boolean().default(false),
  clientNotificationTime: z.string().transform(str => new Date(str)).optional(),
  actualStartTime: z.string().transform(str => new Date(str)).optional(),
  actualEndTime: z.string().transform(str => new Date(str)).optional(),
  actualDuration: z.number().positive().optional(),
  completionNotes: z.string().optional(),
  incidentsReported: z.number().min(0).optional(),
  scheduledBy: z.string(), // server-side from req.user.id
  modifiedBy: z.string().optional(),
  confirmedBy: z.string().optional(),
  completedBy: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.any().optional(),
});

// Client-safe schema for schedule creation (excludes server-controlled fields)
export const createScheduleInputSchema = insertScheduleSchema.omit({
  scheduledBy: true,
  modifiedBy: true,
  confirmedBy: true,
  completedBy: true,
  actualStartTime: true,
  actualEndTime: true,
  actualDuration: true,
  clientNotificationSent: true,
  clientNotificationTime: true,
});

// Client-safe schema for schedule updates (excludes server-controlled and immutable fields)
export const updateScheduleInputSchema = createScheduleInputSchema.partial().omit({
  parentScheduleId: true, // immutable once set
});

// Full update schema for server operations (includes all updateable fields)
export const updateScheduleSchema = insertScheduleSchema.partial().omit({ scheduledBy: true });

// Shift Template schemas
export const insertShiftTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  shiftType: z.enum(['day', 'evening', 'night', 'overnight']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format"),
  duration: z.number().positive(), // in minutes
  daysOfWeek: z.array(z.number().min(0).max(6)).min(1, "At least one day must be selected"), // 0=Sunday, 1=Monday, etc.
  propertyId: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  checkpoints: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

// Client-safe schema for shift template creation (all fields are client-safe)
export const createShiftTemplateInputSchema = insertShiftTemplateSchema;

// Client-safe schema for shift template updates
export const updateShiftTemplateInputSchema = insertShiftTemplateSchema.partial();

// Schedule utility schemas
export const scheduleConflictCheckSchema = z.object({
  staffId: z.string().min(1),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)),
  excludeScheduleId: z.string().optional(), // to exclude current schedule during updates
});

export const staffAvailabilityCheckSchema = z.object({
  staffId: z.string().min(1),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)),
});

export const applyShiftTemplateSchema = z.object({
  templateId: z.string().min(1),
  staffId: z.string().min(1),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  propertyId: z.string().optional(),
});

export const generateRecurringScheduleSchema = z.object({
  scheduleId: z.string().min(1),
  recurrencePattern: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  recurrenceEndDate: z.string().transform(str => new Date(str)),
  customPattern: z.object({
    interval: z.number().positive(),
    frequency: z.enum(['days', 'weeks', 'months']),
    specificDays: z.array(z.number().min(0).max(6)).optional(),
  }).optional(),
});

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
export type CreateLawReferenceInput = z.infer<typeof createLawReferenceInputSchema>;
export type InsertLawReference = z.infer<typeof insertLawReferenceSchema>;
export type UpdateLawReferenceInput = z.infer<typeof updateLawReferenceInputSchema>;
export type UpdateLawReference = z.infer<typeof updateLawReferenceSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleInputSchema>;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleInputSchema>;
export type UpdateSchedule = z.infer<typeof updateScheduleSchema>;
export type CreateShiftTemplateInput = z.infer<typeof createShiftTemplateInputSchema>;
export type InsertShiftTemplate = z.infer<typeof insertShiftTemplateSchema>;
export type UpdateShiftTemplateInput = z.infer<typeof updateShiftTemplateInputSchema>;
export type ScheduleConflictCheck = z.infer<typeof scheduleConflictCheckSchema>;
export type StaffAvailabilityCheck = z.infer<typeof staffAvailabilityCheckSchema>;
export type ApplyShiftTemplate = z.infer<typeof applyShiftTemplateSchema>;
export type GenerateRecurringSchedule = z.infer<typeof generateRecurringScheduleSchema>;

// Crime Intelligence schemas
export const insertCrimeIntelligenceSchema = z.object({
  incidentId: z.string().optional(), // Link to related incident
  caseNumber: z.string().min(1, "Case number is required"),
  title: z.string().min(1, "Title is required"),
  analysisType: z.enum(['threat_assessment', 'pattern_analysis', 'intelligence_report', 'investigation', 'surveillance']),
  threatLevel: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['active', 'monitoring', 'closed', 'archived', 'escalated']).default('active'),
  classification: z.enum(['public', 'restricted', 'confidential', 'secret']).default('restricted'),
  source: z.enum(['field_report', 'surveillance', 'informant', 'public_tip', 'law_enforcement', 'analysis']),
  description: z.string().min(1, "Description is required"),
  summary: z.string().min(1, "Summary is required"),
  keyFindings: z.array(z.string()).optional(),
  evidenceIds: z.array(z.string()).optional(), // Links to evidence
  suspectInfo: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    lastKnownLocation: z.string().optional(),
    vehicleInfo: z.string().optional(),
    associates: z.array(z.string()).optional(),
  }).optional(),
  location: z.string().optional(),
  coordinates: z.string().optional(), // latitude,longitude
  timeframe: z.object({
    startDate: z.string().transform(str => new Date(str)).optional(),
    endDate: z.string().transform(str => new Date(str)).optional(),
    specificTime: z.string().optional(),
  }).optional(),
  involvedProperties: z.array(z.string()).optional(), // Property IDs
  relatedIncidents: z.array(z.string()).optional(), // Related incident IDs
  patterns: z.object({
    crimeType: z.string().optional(),
    methodology: z.string().optional(),
    timing: z.string().optional(),
    targetProfile: z.string().optional(),
    geographicArea: z.string().optional(),
  }).optional(),
  riskAssessment: z.object({
    probabilityOfReoccurrence: z.enum(['low', 'medium', 'high']).optional(),
    potentialImpact: z.enum(['minor', 'moderate', 'significant', 'severe']).optional(),
    recommendedActions: z.array(z.string()).optional(),
    mitigation: z.array(z.string()).optional(),
  }).optional(),
  intelligence: z.object({
    sources: z.array(z.string()).optional(),
    reliability: z.enum(['unknown', 'poor', 'fair', 'good', 'excellent']).optional(),
    credibility: z.enum(['unconfirmed', 'possible', 'probable', 'confirmed']).optional(),
    additionalInfo: z.string().optional(),
  }).optional(),
  actionsTaken: z.array(z.string()).optional(),
  assignedAnalyst: z.string().optional(), // User ID - can be set by client if authorized
  reviewedBy: z.string().optional(), // User ID - server controlled
  approvedBy: z.string().optional(), // User ID - server controlled
  tags: z.array(z.string()).optional(),
  alerts: z.array(z.object({
    type: z.string(),
    message: z.string(),
    isActive: z.boolean(),
    expiresAt: z.string().transform(str => new Date(str)).optional(),
  })).optional(),
  followUpRequired: z.boolean().default(false),
  nextReviewDate: z.string().transform(str => new Date(str)).optional(),
  lastActivityDate: z.string().transform(str => new Date(str)).optional(), // server controlled
  externalReferences: z.object({
    policeReportNumber: z.string().optional(),
    fbiCaseNumber: z.string().optional(),
    courtCaseNumber: z.string().optional(),
    insuranceClaimNumber: z.string().optional(),
    mediaReferences: z.array(z.string()).optional(),
  }).optional(),
  confidentialNotes: z.string().optional(), // Only visible to authorized personnel
  distributionList: z.array(z.string()).optional(), // User IDs who should have access
  metadata: z.any().optional(), // Additional flexible data
});

// Client-safe schema for crime intelligence creation (excludes server-controlled fields)
export const createCrimeIntelligenceInputSchema = insertCrimeIntelligenceSchema.omit({
  reviewedBy: true,
  approvedBy: true,
  lastActivityDate: true,
});

// Client-safe schema for crime intelligence updates (excludes server-controlled and immutable fields)
export const updateCrimeIntelligenceInputSchema = createCrimeIntelligenceInputSchema.partial().omit({
  caseNumber: true, // immutable once set
});

// Full update schema for server operations (includes all fields)
export const updateCrimeIntelligenceSchema = insertCrimeIntelligenceSchema.partial();

// Search and filter schemas
export const crimeIntelligenceFilterSchema = z.object({
  status: z.enum(['active', 'monitoring', 'closed', 'archived', 'escalated']).optional(),
  threatLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  analysisType: z.enum(['threat_assessment', 'pattern_analysis', 'intelligence_report', 'investigation', 'surveillance']).optional(),
  classification: z.enum(['public', 'restricted', 'confidential', 'secret']).optional(),
  assignedAnalyst: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  searchTerm: z.string().optional(),
  limit: z.number().positive().max(100).optional(),
});

export const patternAnalysisRequestSchema = z.object({
  timeframe: z.object({
    start: z.string().transform(str => new Date(str)),
    end: z.string().transform(str => new Date(str)),
  }).optional(),
  location: z.string().optional(),
  crimeType: z.string().optional(),
});

export const threatAssessmentRequestSchema = z.object({
  incidentId: z.string().optional(),
  location: z.string().optional(),
  timeframe: z.object({
    start: z.string().transform(str => new Date(str)),
    end: z.string().transform(str => new Date(str)),
  }).optional(),
  threatType: z.string().optional(),
});

// Type exports for crime intelligence
export type CrimeIntelligenceInput = z.infer<typeof createCrimeIntelligenceInputSchema>;
export type UpdateCrimeIntelligenceInput = z.infer<typeof updateCrimeIntelligenceInputSchema>;
export type CrimeIntelligenceFilter = z.infer<typeof crimeIntelligenceFilterSchema>;
export type PatternAnalysisRequest = z.infer<typeof patternAnalysisRequestSchema>;
export type ThreatAssessmentRequest = z.infer<typeof threatAssessmentRequestSchema>;