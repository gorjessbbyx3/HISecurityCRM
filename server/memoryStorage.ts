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
  guardCount?: number;
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
  transactionDate: string;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Evidence {
  id: string;
  entityType: string; // 'incident', 'patrol_report', 'property', etc.
  entityId?: string;
  fileName: string;
  originalFileName?: string;
  fileUrl: string;
  fileType: string; // 'image', 'video', 'document', 'audio'
  mimeType?: string;
  fileSize: number;
  description?: string;
  tags?: string[];
  uploadedBy: string;
  location?: string;
  coordinates?: string;
  capturedAt?: Date;
  status: string; // 'active', 'archived', 'deleted'
  accessLevel: string; // 'public', 'restricted', 'confidential'
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityResource {
  id: string;
  name: string;
  category: string; // 'emergency_services', 'healthcare', 'social_services', 'education', 'legal_aid', 'housing', 'transportation'
  subcategory?: string;
  description: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: string; // latitude,longitude
  operatingHours?: string;
  languages?: string[]; // languages spoken
  servicesOffered?: string[];
  eligibilityRequirements?: string;
  cost?: string; // 'free', 'sliding_scale', 'insurance_accepted', 'fee_for_service'
  accessibilityFeatures?: string[];
  transportationInfo?: string;
  specialNotes?: string;
  tags?: string[];
  priority: string; // 'critical', 'high', 'medium', 'low'
  status: string; // 'active', 'inactive', 'temporarily_closed', 'permanently_closed'
  verifiedAt?: Date;
  verifiedBy?: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LawReference {
  id: string;
  title: string;
  category: string; // 'hawaii_state', 'federal', 'city_county', 'administrative', 'case_law'
  subcategory?: string; // 'criminal_law', 'civil_law', 'traffic', 'property', 'business', 'labor', 'environmental'
  jurisdiction: string; // 'State of Hawaii', 'Federal', 'City & County of Honolulu', etc.
  lawType: string; // 'statute', 'regulation', 'ordinance', 'code', 'case', 'constitution'
  citation: string; // official legal citation
  chapter?: string;
  section?: string;
  subsection?: string;
  description: string;
  fullText?: string; // complete text of the law/statute
  summary: string; // brief summary for quick reference
  keyProvisions?: string[]; // key points or provisions
  applicableScenarios?: string[]; // when this law applies
  penalties?: string; // penalties or consequences
  relatedLaws?: string[]; // references to related law IDs
  precedingLaw?: string; // what law this supersedes or amends
  amendedBy?: string[]; // laws that have amended this one
  effectiveDate: Date;
  expirationDate?: Date; // for temporary laws
  lastAmended?: Date;
  keywords?: string[]; // searchable keywords
  tags?: string[];
  searchableText: string; // combined searchable content
  officialUrl?: string; // link to official source
  sourceDocument?: string; // official document reference
  interpretationNotes?: string; // guidance on interpretation
  commonMisunderstandings?: string; // clarifications
  practicalApplications?: string[]; // real-world applications
  priority: string; // 'critical', 'high', 'medium', 'low' - importance for security personnel
  relevanceToSecurity: string; // 'high', 'medium', 'low' - specific relevance to security work
  status: string; // 'active', 'superseded', 'repealed', 'pending'
  verified: boolean; // whether the reference has been verified for accuracy
  verifiedAt?: Date;
  verifiedBy?: string; // user ID who verified
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  staffId: string; // assigned staff member
  propertyId?: string; // assigned property/location
  shiftType: string; // 'day', 'evening', 'night', 'overnight', 'split'
  scheduleType: string; // 'regular', 'overtime', 'emergency', 'training', 'meeting', 'patrol'
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  status: string; // 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  priority: string; // 'critical', 'high', 'medium', 'low'
  recurring: boolean;
  recurrencePattern?: string; // 'daily', 'weekly', 'monthly', 'custom'
  recurrenceEndDate?: Date;
  parentScheduleId?: string; // for recurring schedules
  location?: string; // specific location details
  coordinates?: string;
  requiredSkills?: string[]; // required certifications/skills
  equipment?: string[]; // required equipment
  specialInstructions?: string;
  checkpoints?: string[]; // for patrol schedules
  estimatedMileage?: number; // for patrol/mobile schedules
  weatherConsiderations?: string;
  backupStaffId?: string; // backup staff member
  supervisorId?: string; // supervising officer
  clientNotificationRequired?: boolean;
  clientNotificationSent?: boolean;
  clientNotificationTime?: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  actualDuration?: number;
  completionNotes?: string;
  incidentsReported?: number;
  scheduledBy: string; // user ID who created the schedule
  modifiedBy?: string; // user ID who last modified
  confirmedBy?: string; // user ID who confirmed
  completedBy?: string; // user ID who marked complete
  tags?: string[];
  metadata?: any; // additional custom data
  createdAt: Date;
  updatedAt: Date;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  description?: string;
  shiftType: string; // 'day', 'evening', 'night', 'overnight'
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  duration: number; // in minutes
  daysOfWeek: number[]; // 0=Sunday, 1=Monday, etc.
  propertyId?: string;
  requiredSkills?: string[];
  equipment?: string[];
  checkpoints?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrimeIntelligence {
  id: string;
  incidentId?: string; // Link to related incident
  caseNumber: string; // Internal case tracking number
  title: string;
  analysisType: string; // 'threat_assessment', 'pattern_analysis', 'intelligence_report', 'investigation', 'surveillance'
  threatLevel: string; // 'low', 'medium', 'high', 'critical'
  priority: string; // 'low', 'medium', 'high', 'urgent'
  status: string; // 'active', 'monitoring', 'closed', 'archived', 'escalated'
  classification: string; // 'public', 'restricted', 'confidential', 'secret'
  source: string; // 'field_report', 'surveillance', 'informant', 'public_tip', 'law_enforcement', 'analysis'
  description: string;
  summary: string;
  keyFindings?: string[];
  evidenceIds?: string[]; // Links to evidence
  suspectInfo?: {
    name?: string;
    description?: string;
    lastKnownLocation?: string;
    vehicleInfo?: string;
    associates?: string[];
  };
  location?: string;
  coordinates?: string; // latitude,longitude
  timeframe?: {
    startDate?: Date;
    endDate?: Date;
    specificTime?: string;
  };
  involvedProperties?: string[]; // Property IDs
  relatedIncidents?: string[]; // Related incident IDs
  patterns?: {
    crimeType?: string;
    methodology?: string;
    timing?: string;
    targetProfile?: string;
    geographicArea?: string;
  };
  riskAssessment?: {
    probabilityOfReoccurrence?: string; // 'low', 'medium', 'high'
    potentialImpact?: string; // 'minor', 'moderate', 'significant', 'severe'
    recommendedActions?: string[];
    mitigation?: string[];
  };
  intelligence?: {
    sources?: string[];
    reliability?: string; // 'unknown', 'poor', 'fair', 'good', 'excellent'
    credibility?: string; // 'unconfirmed', 'possible', 'probable', 'confirmed'
    additionalInfo?: string;
  };
  actionsTaken?: string[];
  assignedAnalyst?: string; // User ID
  reviewedBy?: string; // User ID
  approvedBy?: string; // User ID
  tags?: string[];
  alerts?: {
    type: string;
    message: string;
    isActive: boolean;
    expiresAt?: Date;
  }[];
  followUpRequired: boolean;
  nextReviewDate?: Date;
  lastActivityDate: Date;
  externalReferences?: {
    policeReportNumber?: string;
    fbiCaseNumber?: string;
    courtCaseNumber?: string;
    insuranceClaimNumber?: string;
    mediaReferences?: string[];
  };
  confidentialNotes?: string; // Only visible to authorized personnel
  distributionList?: string[]; // User IDs who should have access
  metadata?: any; // Additional flexible data
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
  private evidence: Map<string, Evidence> = new Map();
  private communityResources: Map<string, CommunityResource> = new Map();
  private lawReferences: Map<string, LawReference> = new Map();
  private schedules: Map<string, Schedule> = new Map();
  private shiftTemplates: Map<string, ShiftTemplate> = new Map();
  private crimeIntelligence: Map<string, CrimeIntelligence> = new Map();

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

  async updateUserStatus(id: string, status: string): Promise<User> {
    return this.updateStaffStatus(id, status);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.upsertUser(userData);
  }

  async updateUserPermissions(id: string, permissions: string[]): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    user.permissions = permissions;
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
      guardCount: propertyData.guardCount || 1,
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

  async getPropertiesByClient(clientId: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(property => property.clientId === clientId);
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

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    const incident = this.incidents.get(id);
    if (!incident) {
      throw new Error(`Incident with id ${id} not found`);
    }
    const updatedIncident = { ...incident, ...updates, updatedAt: new Date() };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    const staffStats = await this.getStaffStats();
    const clientStats = await this.getClientStats();
    const propertyStats = await this.getPropertyStats();
    const incidentStats = await this.getIncidentStats();
    const patrolStats = await this.getPatrolStats();
    const financialStats = await this.getFinancialStats();
    const recentActivities = await this.getRecentActivities();

    return {
      totalClients: clientStats.total || 0,
      activeProperties: propertyStats.active || 0,
      totalStaff: staffStats.total || 0,
      onDutyStaff: staffStats.onDuty || 0,
      openIncidents: incidentStats.open || 0,
      resolvedIncidents24h: incidentStats.resolved24h || 0,
      activePatrols: patrolStats.active || 0,
      scheduledAppointments: patrolStats.scheduled || 0,
      monthlyRevenue: financialStats.monthlyRevenue || 0,
      expenses: financialStats.expenses || 0,
      recentActivities: recentActivities || [],
      systemStatus: {
        server: 'online',
        database: 'connected',
        communications: 'active',
        gps: 'operational',
        emergency: 'ready'
      },
      emergencyAlerts: [],
      performanceMetrics: {
        responseTime: 95,
        clientSatisfaction: 88,
        incidentResolution: 92,
        patrolEfficiency: 85,
        staffUtilization: 78
      }
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

  async getTodaysReports(): Promise<PatrolReport[]> {
    return this.getTodaysPatrolReports();
  }

  async getPatrolReportsByOfficer(officerId: string): Promise<PatrolReport[]> {
    return Array.from(this.patrolReports.values()).filter(report => report.officerId === officerId);
  }

  async updatePatrolReport(id: string, updates: Partial<PatrolReport>): Promise<PatrolReport> {
    const report = this.patrolReports.get(id);
    if (!report) {
      throw new Error(`Patrol report with id ${id} not found`);
    }
    const updatedReport = { ...report, ...updates, updatedAt: new Date() };
    this.patrolReports.set(id, updatedReport);
    return updatedReport;
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

  async getFinancialSummary(): Promise<any> {
    const records = Array.from(this.financialRecords.values());
    return {
      totalIncome: records.filter(r => r.recordType === 'payment').reduce((sum, r) => sum + r.amount, 0),
      totalExpenses: records.filter(r => r.recordType === 'expense').reduce((sum, r) => sum + r.amount, 0),
      pendingInvoices: records.filter(r => r.status === 'pending' && r.recordType === 'invoice').length,
      overduePayments: records.filter(r => r.status === 'overdue').length,
    };
  }

  // Evidence management
  async getEvidence(filter?: { entityType?: string; entityId?: string; status?: string; uploadedBy?: string }): Promise<Evidence[]> {
    let evidenceList = Array.from(this.evidence.values());

    if (filter) {
      if (filter.entityType) {
        evidenceList = evidenceList.filter(e => e.entityType === filter.entityType);
      }
      if (filter.entityId) {
        evidenceList = evidenceList.filter(e => e.entityId === filter.entityId);
      }
      if (filter.status) {
        evidenceList = evidenceList.filter(e => e.status === filter.status);
      }
      if (filter.uploadedBy) {
        evidenceList = evidenceList.filter(e => e.uploadedBy === filter.uploadedBy);
      }
    }

    return evidenceList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getEvidenceById(id: string): Promise<Evidence | null> {
    return this.evidence.get(id) || null;
  }

  async createEvidence(evidenceData: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evidence> {
    const id = uuidv4();
    const now = new Date();
    const evidence: Evidence = {
      id,
      ...evidenceData,
      status: evidenceData.status || 'active',
      accessLevel: evidenceData.accessLevel || 'public',
      createdAt: now,
      updatedAt: now,
    };
    this.evidence.set(id, evidence);

    // Log activity
    await this.createActivity({
      userId: evidenceData.uploadedBy,
      activityType: 'evidence_uploaded',
      entityType: evidenceData.entityType,
      entityId: evidenceData.entityId,
      description: `Uploaded evidence: ${evidenceData.fileName}`,
      metadata: { evidenceId: id, fileType: evidenceData.fileType }
    });

    return evidence;
  }

  async updateEvidence(id: string, updates: Partial<Evidence>): Promise<Evidence> {
    const evidence = this.evidence.get(id);
    if (!evidence) {
      throw new Error(`Evidence with id ${id} not found`);
    }
    const updatedEvidence = { ...evidence, ...updates, updatedAt: new Date() };
    this.evidence.set(id, updatedEvidence);

    // Log activity
    if (updates.status) {
      await this.createActivity({
        userId: evidence.uploadedBy,
        activityType: 'evidence_updated',
        entityType: evidence.entityType,
        entityId: evidence.entityId,
        description: `Updated evidence: ${evidence.fileName} (status: ${updates.status})`,
        metadata: { evidenceId: id, previousStatus: evidence.status, newStatus: updates.status }
      });
    }

    return updatedEvidence;
  }

  async deleteEvidence(id: string): Promise<boolean> {
    const evidence = this.evidence.get(id);
    if (!evidence) {
      return false;
    }

    // Soft delete by updating status
    await this.updateEvidence(id, { status: 'deleted' });

    // Log activity
    await this.createActivity({
      userId: evidence.uploadedBy,
      activityType: 'evidence_deleted',
      entityType: evidence.entityType,
      entityId: evidence.entityId,
      description: `Deleted evidence: ${evidence.fileName}`,
      metadata: { evidenceId: id }
    });

    return true;
  }

  async getEvidenceByEntity(entityType: string, entityId: string): Promise<Evidence[]> {
    return this.getEvidence({ entityType, entityId, status: 'active' });
  }

  async getEvidenceStats(): Promise<any> {
    const evidenceList = Array.from(this.evidence.values());
    const activeEvidence = evidenceList.filter(e => e.status === 'active');

    return {
      total: activeEvidence.length,
      byType: {
        image: activeEvidence.filter(e => e.fileType === 'image').length,
        video: activeEvidence.filter(e => e.fileType === 'video').length,
        document: activeEvidence.filter(e => e.fileType === 'document').length,
        audio: activeEvidence.filter(e => e.fileType === 'audio').length
      },
      byEntity: {
        incident: activeEvidence.filter(e => e.entityType === 'incident').length,
        patrol_report: activeEvidence.filter(e => e.entityType === 'patrol_report').length,
        property: activeEvidence.filter(e => e.entityType === 'property').length
      },
      recentUploads: activeEvidence.filter(e => {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return e.createdAt > oneDayAgo;
      }).length
    };
  }

  // Community Resources management
  async getCommunityResources(filter?: { 
    category?: string; 
    city?: string; 
    status?: string; 
    priority?: string;
    tags?: string[];
    searchTerm?: string;
  }): Promise<CommunityResource[]> {
    let resourcesList = Array.from(this.communityResources.values());

    if (filter) {
      if (filter.category) {
        resourcesList = resourcesList.filter(r => r.category === filter.category);
      }
      if (filter.city) {
        resourcesList = resourcesList.filter(r => r.city.toLowerCase().includes(filter.city!.toLowerCase()));
      }
      if (filter.status) {
        resourcesList = resourcesList.filter(r => r.status === filter.status);
      }
      if (filter.priority) {
        resourcesList = resourcesList.filter(r => r.priority === filter.priority);
      }
      if (filter.tags && filter.tags.length > 0) {
        resourcesList = resourcesList.filter(r => 
          filter.tags!.some(tag => r.tags?.includes(tag))
        );
      }
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        resourcesList = resourcesList.filter(r => 
          r.name.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          r.servicesOffered?.some(service => service.toLowerCase().includes(term))
        );
      }
    }

    return resourcesList.sort((a, b) => {
      // Sort by priority first (critical > high > medium > low)
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;

      // Then by name alphabetically
      return a.name.localeCompare(b.name);
    });
  }

  async getCommunityResourceById(id: string): Promise<CommunityResource | null> {
    return this.communityResources.get(id) || null;
  }

  async createCommunityResource(resourceData: Omit<CommunityResource, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated'>): Promise<CommunityResource> {
    const id = uuidv4();
    const now = new Date();
    const resource: CommunityResource = {
      id,
      ...resourceData,
      status: resourceData.status || 'active',
      priority: resourceData.priority || 'medium',
      lastUpdated: now,
      createdAt: now,
      updatedAt: now,
    };
    this.communityResources.set(id, resource);

    // Log activity
    await this.createActivity({
      userId: resourceData.verifiedBy || 'system',
      activityType: 'community_resource_created',
      entityType: 'community_resource',
      entityId: id,
      description: `Created community resource: ${resourceData.name} (${resourceData.category})`,
      metadata: { resourceId: id, category: resourceData.category, city: resourceData.city }
    });

    return resource;
  }

  async updateCommunityResource(id: string, updates: Partial<CommunityResource>): Promise<CommunityResource> {
    const resource = this.communityResources.get(id);
    if (!resource) {
      throw new Error(`Community resource with id ${id} not found`);
    }
    const now = new Date();
    const updatedResource = { 
      ...resource, 
      ...updates, 
      lastUpdated: now,
      updatedAt: now 
    };
    this.communityResources.set(id, updatedResource);

    // Log activity
    await this.createActivity({
      userId: updates.verifiedBy || resource.verifiedBy || 'system',
      activityType: 'community_resource_updated',
      entityType: 'community_resource',
      entityId: id,
      description: `Updated community resource: ${resource.name}`,
      metadata: { 
        resourceId: id, 
        updatedFields: Object.keys(updates),
        category: resource.category
      }
    });

    return updatedResource;
  }

  async deleteCommunityResource(id: string): Promise<boolean> {
    const resource = this.communityResources.get(id);
    if (!resource) {
      return false;
    }

    // Soft delete by updating status
    await this.updateCommunityResource(id, { status: 'permanently_closed' });

    // Log activity
    await this.createActivity({
      userId: resource.verifiedBy || 'system',
      activityType: 'community_resource_deleted',
      entityType: 'community_resource',
      entityId: id,
      description: `Deleted community resource: ${resource.name}`,
      metadata: { resourceId: id, category: resource.category }
    });

    return true;
  }

  async getCommunityResourcesByCategory(category: string): Promise<CommunityResource[]> {
    return this.getCommunityResources({ category, status: 'active' });
  }

  async getCommunityResourceStats(): Promise<any> {
    const resourcesList = Array.from(this.communityResources.values());
    const activeResources = resourcesList.filter(r => r.status === 'active');

    const categoryStats: { [key: string]: number } = {};
    const cityStats: { [key: string]: number } = {};
    const priorityStats: { [key: string]: number } = {};

    activeResources.forEach(resource => {
      categoryStats[resource.category] = (categoryStats[resource.category] || 0) + 1;
      cityStats[resource.city] = (cityStats[resource.city] || 0) + 1;
      priorityStats[resource.priority] = (priorityStats[resource.priority] || 0) + 1;
    });

    return {
      total: activeResources.length,
      byCategory: categoryStats,
      byCity: cityStats,
      byPriority: priorityStats,
      recentlyUpdated: resourcesList.filter(r => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return r.lastUpdated > oneWeekAgo;
      }).length,
      needingVerification: resourcesList.filter(r => {
        if (!r.verifiedAt) return true;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return r.verifiedAt < sixMonthsAgo;
      }).length
    };
  }

  async seedCommunityResourcesData(): Promise<void> {
    // Add sample community resources for Hawaii
    const sampleResources: Omit<CommunityResource, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated'>[] = [
      {
        name: 'Hawaii State Crisis Hotline',
        category: 'emergency_services',
        description: '24/7 crisis intervention and suicide prevention services',
        phone: '1-800-753-6879',
        address: 'Statewide Service',
        city: 'Honolulu',
        state: 'HI',
        zipCode: '96813',
        operatingHours: '24/7',
        languages: ['English', 'Hawaiian'],
        servicesOffered: ['Crisis Intervention', 'Suicide Prevention', 'Mental Health Support'],
        cost: 'free',
        priority: 'critical',
        status: 'active',
        tags: ['crisis', 'mental health', '24/7'],
        verifiedBy: 'admin-001'
      },
      {
        name: 'Queen\'s Medical Center',
        category: 'healthcare',
        description: 'Full-service hospital with emergency care',
        contactPerson: 'Emergency Department',
        phone: '808-538-9011',
        website: 'https://www.queensmedicalcenter.org',
        address: '1301 Punchbowl St',
        city: 'Honolulu',
        state: 'HI',
        zipCode: '96813',
        coordinates: '21.3099,-157.8581',
        operatingHours: '24/7 Emergency',
        languages: ['English', 'Hawaiian', 'Filipino'],
        servicesOffered: ['Emergency Care', 'Trauma Center', 'Intensive Care'],
        cost: 'insurance_accepted',
        priority: 'critical',
        status: 'active',
        accessibilityFeatures: ['Wheelchair accessible', 'Sign language interpreters'],
        tags: ['hospital', 'emergency', 'trauma'],
        verifiedBy: 'admin-001'
      }
    ];

    for (const resourceData of sampleResources) {
      await this.createCommunityResource(resourceData);
    }

    console.log('✅ Sample community resources data seeded');
  }

  // Law References management
  async getLawReferences(filter?: {
    category?: string;
    subcategory?: string;
    jurisdiction?: string;
    lawType?: string;
    status?: string;
    priority?: string;
    relevanceToSecurity?: string;
    searchTerm?: string;
    keywords?: string[];
    tags?: string[];
  }): Promise<LawReference[]> {
    let lawsList = Array.from(this.lawReferences.values());

    if (filter) {
      if (filter.category) {
        lawsList = lawsList.filter(l => l.category === filter.category);
      }
      if (filter.subcategory) {
        lawsList = lawsList.filter(l => l.subcategory === filter.subcategory);
      }
      if (filter.jurisdiction) {
        lawsList = lawsList.filter(l => l.jurisdiction.toLowerCase().includes(filter.jurisdiction!.toLowerCase()));
      }
      if (filter.lawType) {
        lawsList = lawsList.filter(l => l.lawType === filter.lawType);
      }
      if (filter.status) {
        lawsList = lawsList.filter(l => l.status === filter.status);
      }
      if (filter.priority) {
        lawsList = lawsList.filter(l => l.priority === filter.priority);
      }
      if (filter.relevanceToSecurity) {
        lawsList = lawsList.filter(l => l.relevanceToSecurity === filter.relevanceToSecurity);
      }
      if (filter.keywords && filter.keywords.length > 0) {
        lawsList = lawsList.filter(l => 
          filter.keywords!.some(keyword => 
            l.keywords?.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
          )
        );
      }
      if (filter.tags && filter.tags.length > 0) {
        lawsList = lawsList.filter(l => 
          filter.tags!.some(tag => l.tags?.includes(tag))
        );
      }
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        lawsList = lawsList.filter(l => 
          l.searchableText.toLowerCase().includes(term) ||
          l.title.toLowerCase().includes(term) ||
          l.citation.toLowerCase().includes(term) ||
          l.summary.toLowerCase().includes(term)
        );
      }
    }

    return lawsList.sort((a, b) => {
      // Sort by relevance to security first
      const relevanceOrder = { high: 3, medium: 2, low: 1 };
      const aRelevance = relevanceOrder[a.relevanceToSecurity as keyof typeof relevanceOrder] || 0;
      const bRelevance = relevanceOrder[b.relevanceToSecurity as keyof typeof relevanceOrder] || 0;
      if (aRelevance !== bRelevance) return bRelevance - aRelevance;

      // Then by priority
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;

      // Finally by title alphabetically
      return a.title.localeCompare(b.title);
    });
  }

  async getLawReferenceById(id: string): Promise<LawReference | null> {
    return this.lawReferences.get(id) || null;
  }

  async createLawReference(referenceData: Omit<LawReference, 'id' | 'createdAt' | 'updatedAt' | 'searchableText'>): Promise<LawReference> {
    const id = uuidv4();
    const now = new Date();

    // Build searchable text from all relevant fields
    const searchableText = [
      referenceData.title,
      referenceData.citation,
      referenceData.description,
      referenceData.summary,
      referenceData.fullText || '',
      referenceData.keyProvisions?.join(' ') || '',
      referenceData.applicableScenarios?.join(' ') || '',
      referenceData.keywords?.join(' ') || '',
      referenceData.tags?.join(' ') || '',
      referenceData.interpretationNotes || '',
      referenceData.practicalApplications?.join(' ') || ''
    ].join(' ').toLowerCase();

    const lawReference: LawReference = {
      id,
      ...referenceData,
      searchableText,
      status: referenceData.status || 'active',
      priority: referenceData.priority || 'medium',
      relevanceToSecurity: referenceData.relevanceToSecurity || 'medium',
      verified: referenceData.verified || false,
      createdAt: now,
      updatedAt: now,
    };
    this.lawReferences.set(id, lawReference);

    // Log activity
    await this.createActivity({
      userId: referenceData.verifiedBy || 'system',
      activityType: 'law_reference_created',
      entityType: 'law_reference',
      entityId: id,
      description: `Created law reference: ${referenceData.title} (${referenceData.citation})`,
      metadata: { 
        lawId: id, 
        category: referenceData.category,
        jurisdiction: referenceData.jurisdiction,
        citation: referenceData.citation 
      }
    });

    return lawReference;
  }

  async updateLawReference(id: string, updates: Partial<LawReference>): Promise<LawReference> {
    const lawReference = this.lawReferences.get(id);
    if (!lawReference) {
      throw new Error(`Law reference with id ${id} not found`);
    }

    const now = new Date();

    // Rebuild searchable text if content fields are updated
    let searchableText = lawReference.searchableText;
    if (updates.title || updates.description || updates.summary || updates.fullText || 
        updates.keyProvisions || updates.applicableScenarios || updates.keywords || 
        updates.tags || updates.interpretationNotes || updates.practicalApplications) {
      const updatedRef = { ...lawReference, ...updates };
      searchableText = [
        updatedRef.title,
        updatedRef.citation,
        updatedRef.description,
        updatedRef.summary,
        updatedRef.fullText || '',
        updatedRef.keyProvisions?.join(' ') || '',
        updatedRef.applicableScenarios?.join(' ') || '',
        updatedRef.keywords?.join(' ') || '',
        updatedRef.tags?.join(' ') || '',
        updatedRef.interpretationNotes || '',
        updatedRef.practicalApplications?.join(' ') || ''
      ].join(' ').toLowerCase();
    }

    const updatedLawReference = { 
      ...lawReference, 
      ...updates, 
      searchableText,
      updatedAt: now 
    };
    this.lawReferences.set(id, updatedLawReference);

    // Log activity
    await this.createActivity({
      userId: updates.verifiedBy || lawReference.verifiedBy || 'system',
      activityType: 'law_reference_updated',
      entityType: 'law_reference',
      entityId: id,
      description: `Updated law reference: ${lawReference.title}`,
      metadata: { 
        lawId: id, 
        updatedFields: Object.keys(updates),
        citation: lawReference.citation
      }
    });

    return updatedLawReference;
  }

  async deleteLawReference(id: string): Promise<boolean> {
    const lawReference = this.lawReferences.get(id);
    if (!lawReference) {
      return false;
    }

    // Soft delete by updating status
    await this.updateLawReference(id, { status: 'superseded' });

    // Log activity
    await this.createActivity({
      userId: lawReference.verifiedBy || 'system',
      activityType: 'law_reference_deleted',
      entityType: 'law_reference',
      entityId: id,
      description: `Deleted law reference: ${lawReference.title}`,
      metadata: { lawId: id, citation: lawReference.citation }
    });

    return true;
  }

  async searchLawReferences(query: string, options?: {
    category?: string;
    jurisdiction?: string;
    relevanceToSecurity?: string;
    limit?: number;
  }): Promise<LawReference[]> {
    const filter = {
      searchTerm: query,
      ...options
    };
    const results = await this.getLawReferences(filter);
    return options?.limit ? results.slice(0, options.limit) : results;
  }

  async getLawReferencesByCategory(category: string): Promise<LawReference[]> {
    return this.getLawReferences({ category, status: 'active' });
  }

  async getRelatedLawReferences(lawId: string): Promise<LawReference[]> {
    const lawReference = await this.getLawReferenceById(lawId);
    if (!lawReference || !lawReference.relatedLaws) {
      return [];
    }

    const relatedLaws: LawReference[] = [];
    for (const relatedId of lawReference.relatedLaws) {
      const related = await this.getLawReferenceById(relatedId);
      if (related) {
        relatedLaws.push(related);
      }
    }

    return relatedLaws;
  }

  async getLawReferenceStats(): Promise<any> {
    const lawsList = Array.from(this.lawReferences.values());
    const activeLaws = lawsList.filter(l => l.status === 'active');

    const categoryStats: { [key: string]: number } = {};
    const jurisdictionStats: { [key: string]: number } = {};
    const lawTypeStats: { [key: string]: number } = {};
    const relevanceStats: { [key: string]: number } = {};

    activeLaws.forEach(law => {
      categoryStats[law.category] = (categoryStats[law.category] || 0) + 1;
      jurisdictionStats[law.jurisdiction] = (jurisdictionStats[law.jurisdiction] || 0) + 1;
      lawTypeStats[law.lawType] = (lawTypeStats[law.lawType] || 0) + 1;
      relevanceStats[law.relevanceToSecurity] = (relevanceStats[law.relevanceToSecurity] || 0) + 1;
    });

    return {
      total: activeLaws.length,
      byCategory: categoryStats,
      byJurisdiction: jurisdictionStats,
      byLawType: lawTypeStats,
      byRelevanceToSecurity: relevanceStats,
      highSecurityRelevance: activeLaws.filter(l => l.relevanceToSecurity === 'high').length,
      criticalPriority: activeLaws.filter(l => l.priority === 'critical').length,
      needingVerification: lawsList.filter(l => !l.verified || (
        l.verifiedAt && 
        l.verifiedAt < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      )).length,
      recentlyUpdated: lawsList.filter(l => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return l.updatedAt > oneWeekAgo;
      }).length
    };
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

    // Sample properties
    const clients = await this.getClients();
    if (clients.length > 0) {
      await this.createProperty({
        clientId: clients[0].id,
        name: 'Honolulu Resort Main Building',
        address: '123 Waikiki Beach Drive, Honolulu, HI 96815',
        propertyType: 'resort',
        zone: 'Waikiki',
        securityLevel: 'high',
        coverageType: '24/7',
        status: 'active',
        guardCount: 3,
      });

      if (clients.length > 1) {
        await this.createProperty({
          clientId: clients[1].id,
          name: 'Downtown Plaza Office Building',
          address: '456 King Street, Honolulu, HI 96813',
          propertyType: 'commercial',
          zone: 'Downtown',
          securityLevel: 'standard',
          coverageType: 'patrol',
          status: 'active',
          guardCount: 2,
        });
      }
    }

    // Sample Crime Intelligence Data
    const incidents = await this.getIncidents();
    const properties = await this.getProperties();

    // High-priority threat assessment
    await this.createCrimeIntelligence({
      caseNumber: 'CI-2024-000001',
      title: 'Organized Theft Ring Operating in Waikiki Resort Area',
      analysisType: 'threat_assessment',
      threatLevel: 'high',
      priority: 'urgent',
      status: 'active',
      classification: 'confidential',
      source: 'surveillance',
      description: 'Intelligence indicates coordinated theft operations targeting high-end resort guests. Multiple properties affected with similar modus operandi.',
      summary: 'Organized crime group targeting resort guests using distraction techniques and inside information. Estimated 15+ incidents in past month.',
      keyFindings: [
        'Coordinated timing between multiple suspects',
        'Inside knowledge of guest schedules and room layouts',
        'Professional-grade surveillance equipment detected',
        'Targeting guests with expensive jewelry and electronics'
      ],
      location: 'Waikiki Beach Resort Area',
      coordinates: '21.2793,-157.8311',
      timeframe: {
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-28'),
        specificTime: 'Primarily evening hours (6-10 PM)'
      },
      involvedProperties: properties.length > 0 ? [properties[0].id] : [],
      relatedIncidents: incidents.length > 0 ? [incidents[0]?.id].filter(Boolean) : [],
      patterns: {
        crimeType: 'theft',
        methodology: 'Distraction techniques, inside information',
        timing: 'Evening hours during peak guest activity',
        targetProfile: 'High-value guests, jewelry and electronics',
        geographicArea: 'Waikiki resort corridor'
      },
      riskAssessment: {
        probabilityOfReoccurrence: 'high',
        potentialImpact: 'significant',
        recommendedActions: [
          'Increase surveillance in target areas',
          'Review staff background checks',
          'Implement guest awareness program',
          'Coordinate with other resort security'
        ],
        mitigation: [
          'Enhanced screening protocols',
          'Real-time intelligence sharing',
          'Undercover security deployment'
        ]
      },
      intelligence: {
        sources: ['surveillance footage', 'informant reports', 'police intelligence'],
        reliability: 'good',
        credibility: 'confirmed',
        additionalInfo: 'Group believed to have connections to mainland operations'
      },
      actionsTaken: [
        'Increased patrol frequency',
        'Staff security briefing conducted',
        'Guest advisory notices distributed'
      ],
      assignedAnalyst: 'admin-001',
      tags: ['organized_crime', 'theft', 'waikiki', 'resort_security'],
      alerts: [
        {
          type: 'active_threat',
          message: 'Ongoing organized theft operations - heightened vigilance required',
          isActive: true,
          expiresAt: new Date('2024-03-30')
        }
      ],
      followUpRequired: true,
      nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      externalReferences: {
        policeReportNumber: 'HPD-2024-001234',
        mediaReferences: ['Local news coverage of resort thefts']
      },
      confidentialNotes: 'Suspected inside accomplice - investigation ongoing',
      distributionList: ['admin-001']
    });

    // Pattern analysis for vehicle break-ins
    await this.createCrimeIntelligence({
      caseNumber: 'CI-2024-000002',
      title: 'Vehicle Break-in Pattern Analysis - Downtown Parking Areas',
      analysisType: 'pattern_analysis',
      threatLevel: 'medium',
      priority: 'high',
      status: 'monitoring',
      classification: 'restricted',
      source: 'field_report',
      description: 'Analysis of recent vehicle break-ins shows clear pattern in timing, location, and methodology targeting downtown business district.',
      summary: 'Systematic vehicle break-ins occurring during lunch hours (11AM-2PM) in downtown parking structures.',
      keyFindings: [
        'Consistent timing pattern during business lunch hours',
        'Targeting vehicles with visible electronics/bags',
        'Entry method: window smashing, quick grab technique',
        'Average incident duration under 2 minutes'
      ],
      location: 'Downtown Honolulu Business District',
      coordinates: '21.3099,-157.8581',
      timeframe: {
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-15'),
        specificTime: '11:00 AM - 2:00 PM weekdays'
      },
      involvedProperties: properties.length > 1 ? [properties[1].id] : [],
      patterns: {
        crimeType: 'vehicle_break_in',
        methodology: 'Window smashing, targeting visible valuables',
        timing: 'Weekday lunch hours when foot traffic is high',
        targetProfile: 'Vehicles with visible electronics, purses, laptops',
        geographicArea: 'Downtown parking structures and street parking'
      },
      riskAssessment: {
        probabilityOfReoccurrence: 'medium',
        potentialImpact: 'moderate',
        recommendedActions: [
          'Increase patrol presence during lunch hours',
          'Install additional surveillance cameras',
          'Public awareness campaign about securing valuables',
          'Coordinate with parking structure security'
        ],
        mitigation: [
          'Enhanced lighting in parking areas',
          'Security signage installation',
          'Regular patrol schedule adjustments'
        ]
      },
      intelligence: {
        sources: ['police reports', 'security footage', 'witness statements'],
        reliability: 'good',
        credibility: 'probable',
        additionalInfo: 'Suspect(s) appear to be working systematically through each level of parking structures'
      },
      actionsTaken: [
        'Coordinated with building security managers',
        'Distributed advisory to business tenants'
      ],
      assignedAnalyst: 'admin-001',
      tags: ['vehicle_crime', 'downtown', 'pattern_analysis', 'prevention'],
      followUpRequired: true,
      nextReviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    });

    // Surveillance intelligence report
    await this.createCrimeIntelligence({
      caseNumber: 'CI-2024-000003',
      title: 'Suspicious Activity Surveillance - Beach Park Drug Activity',
      analysisType: 'surveillance',
      threatLevel: 'medium',
      priority: 'medium',
      status: 'active',
      classification: 'restricted',
      source: 'surveillance',
      description: 'Ongoing surveillance of suspicious activities in Keeaumoku Beach Park indicating possible drug trafficking operations.',
      summary: 'Regular patterns of suspicious meetings and exchanges observed in beach park during specific timeframes.',
      keyFindings: [
        'Consistent daily meetings between 4-6 individuals',
        'Brief exchanges suggesting transaction activity',
        'Use of coded communication patterns',
        'Multiple lookouts positioned strategically'
      ],
      suspectInfo: {
        description: 'Group of 4-6 males, ages approximately 20-35',
        lastKnownLocation: 'Keeaumoku Beach Park pavilion area',
        vehicleInfo: 'Blue sedan, older model Honda Civic, partial plate: H7X-???',
        associates: ['Known to associate with individuals from Kalihi area']
      },
      location: 'Keeaumoku Beach Park',
      coordinates: '21.3089,-157.8583',
      timeframe: {
        startDate: new Date('2024-02-10'),
        specificTime: 'Daily 2:00-4:00 PM and 7:00-9:00 PM'
      },
      patterns: {
        crimeType: 'suspected_drug_activity',
        methodology: 'Brief meetups, quick exchanges, lookout system',
        timing: 'Consistent daily schedule in afternoon and evening',
        geographicArea: 'Beach park pavilion and surrounding areas'
      },
      riskAssessment: {
        probabilityOfReoccurrence: 'high',
        potentialImpact: 'moderate',
        recommendedActions: [
          'Continue surveillance operations',
          'Coordinate with narcotics division',
          'Document all activities and participants',
          'Consider undercover operation'
        ],
        mitigation: [
          'Increased uniformed presence in area',
          'Community outreach programs',
          'Youth intervention initiatives'
        ]
      },
      intelligence: {
        sources: ['direct surveillance', 'community reports'],
        reliability: 'fair',
        credibility: 'possible',
        additionalInfo: 'Activity appears to be expanding to nearby locations'
      },
      actionsTaken: [
        'Initiated daily surveillance logs',
        'Coordinated with local patrol units'
      ],
      assignedAnalyst: 'admin-001',
      tags: ['surveillance', 'drug_activity', 'beach_park', 'ongoing'],
      alerts: [
        {
          type: 'surveillance_active',
          message: 'Active surveillance operation - maintain operational security',
          isActive: true
        }
      ],
      followUpRequired: true,
      nextReviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    });

    // Investigation report
    await this.createCrimeIntelligence({
      caseNumber: 'CI-2024-000004',
      title: 'Internal Security Breach Investigation - Unauthorized Access',
      analysisType: 'investigation',
      threatLevel: 'critical',
      priority: 'urgent',
      status: 'escalated',
      classification: 'secret',
      source: 'analysis',
      description: 'Investigation into unauthorized access to secure areas revealing potential security protocol violations and insider threat.',
      summary: 'Evidence suggests unauthorized personnel gained access to restricted areas using compromised credentials.',
      keyFindings: [
        'Access logs show unusual after-hours entry patterns',
        'Security badge cloning suspected',
        'Multiple secure areas compromised',
        'No corresponding authorized personnel records'
      ],
      location: 'Multiple secure facilities - Downtown Complex',
      timeframe: {
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-02-05'),
        specificTime: 'Between 11:00 PM - 3:00 AM'
      },
      patterns: {
        crimeType: 'security_breach',
        methodology: 'Credential compromise, badge cloning',
        timing: 'Late night/early morning hours',
        targetProfile: 'High-security areas with sensitive information'
      },
      riskAssessment: {
        probabilityOfReoccurrence: 'high',
        potentialImpact: 'severe',
        recommendedActions: [
          'Immediate credential system audit',
          'Enhanced access monitoring protocols',
          'Full background re-verification of personnel',
          'Upgrade to biometric access systems'
        ],
        mitigation: [
          'Emergency credential reset for all personnel',
          'Temporary increased security presence',
          'Implementation of dual-factor authentication'
        ]
      },
      intelligence: {
        sources: ['access logs', 'surveillance footage', 'forensic analysis'],
        reliability: 'excellent',
        credibility: 'confirmed',
        additionalInfo: 'Investigation indicates sophisticated operation requiring inside knowledge'
      },
      actionsTaken: [
        'Immediately revoked all compromised credentials',
        'Initiated full forensic investigation',
        'Implemented emergency security protocols'
      ],
      assignedAnalyst: 'admin-001',
      tags: ['insider_threat', 'security_breach', 'investigation', 'critical'],
      alerts: [
        {
          type: 'security_alert',
          message: 'CRITICAL: Active security breach investigation - heightened protocols in effect',
          isActive: true,
          expiresAt: new Date('2024-04-01')
        }
      ],
      followUpRequired: true,
      nextReviewDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      externalReferences: {
        policeReportNumber: 'HPD-2024-009876',
        fbiCaseNumber: 'FBI-HN-2024-001'
      },
      confidentialNotes: 'Coordinating with federal authorities - maintain strict operational security',
      distributionList: ['admin-001']
    });

    // Intelligence report linking incidents
    await this.createCrimeIntelligence({
      caseNumber: 'CI-2024-000005',
      title: 'Cross-Reference Analysis - Multiple Property Incidents',
      analysisType: 'intelligence_report',
      threatLevel: 'medium',
      priority: 'medium',
      status: 'closed',
      classification: 'restricted',
      source: 'analysis',
      description: 'Comprehensive analysis of incidents across multiple properties revealing potential connections and shared threat indicators.',
      summary: 'Analysis of 12 incidents over 30 days shows possible coordinated activities affecting multiple client properties.',
      keyFindings: [
        'Timing correlations between incidents at different properties',
        'Similar entry methods across multiple locations',
        'Potential intelligence gathering phase identified',
        'Evidence of advance reconnaissance activities'
      ],
      location: 'Multiple properties - Honolulu Metropolitan Area',
      timeframe: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      },
      involvedProperties: properties.map(p => p.id),
      relatedIncidents: incidents.map(i => i.id),
      patterns: {
        crimeType: 'coordinated_activity',
        methodology: 'Reconnaissance followed by targeted actions',
        timing: 'Weekend evenings and holiday periods',
        geographicArea: 'Metropolitan Honolulu area'
      },
      riskAssessment: {
        probabilityOfReoccurrence: 'low',
        potentialImpact: 'moderate',
        recommendedActions: [
          'Enhanced information sharing between properties',
          'Standardized incident reporting protocols',
          'Regular threat briefings for security personnel'
        ]
      },
      intelligence: {
        sources: ['incident reports', 'pattern analysis', 'surveillance data'],
        reliability: 'good',
        credibility: 'probable'
      },
      actionsTaken: [
        'Distributed comprehensive threat briefing',
        'Enhanced coordination protocols established',
        'Updated security procedures across all properties'
      ],
      assignedAnalyst: 'admin-001',
      tags: ['analysis', 'multi_property', 'coordination', 'closed_case']
    });

    console.log('✅ Sample data seeded in memory storage including comprehensive crime intelligence');
  }

  async getStaff(): Promise<any[]> {
    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role,
      status: user.status,
      shift: user.shift || 'N/A',
      phone: user.phone || '(808) 555-0000'
    }));
  }

  async getStaffStats(): Promise<any> {
    const staff = await this.getStaff();

    // Calculate actual on-duty staff based on current schedules
    const staffDashboardStats = await this.getStaffDashboardStats();

    return {
      total: staff.length,
      active: staff.filter(s => s.status === "active").length,
      onDuty: staffDashboardStats.onDuty,
      supervisors: staff.filter(s => s.role.includes("supervisor") || s.role === "admin").length
    };
  }

  async getOnDutyStaff(): Promise<any[]> {
    const staff = await this.getStaff();
    const now = new Date();

    // Get current schedules to find who's actually on duty
    const currentSchedules = Array.from(this.schedules.values())
      .filter(schedule => {
        const startTime = new Date(schedule.startTime);
        const endTime = new Date(schedule.endTime);
        return startTime <= now && 
               endTime > now && 
               schedule.status !== 'cancelled';
      });

    // Get staff IDs who are currently on duty
    const onDutyStaffIds = new Set(currentSchedules.map(s => s.staffId));

    // Return staff members who are currently on duty
    return staff.filter(s => onDutyStaffIds.has(s.id));
  }

  async getTodaysSchedule(): Promise<Schedule[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.schedules.values())
      .filter(schedule => {
        const startTime = new Date(schedule.startTime);
        return startTime >= today && startTime < tomorrow && schedule.status !== 'cancelled';
      })
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async getStaffDashboardStats(): Promise<any> {
    const staff = await this.getStaff();
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's schedules
    const todaySchedules = Array.from(this.schedules.values())
      .filter(schedule => {
        const startTime = new Date(schedule.startTime);
        return startTime >= today && startTime < tomorrow && schedule.status !== 'cancelled';
      });

    // Calculate staff currently on duty
    const currentlyOnDuty = todaySchedules.filter(schedule => {
      const startTime = new Date(schedule.startTime);
      const endTime = new Date(schedule.endTime);
      return startTime <= now && endTime > now;
    }).length;

    // Calculate total staff scheduled today
    const scheduledToday = new Set(todaySchedules.map(s => s.staffId)).size;

    // Get availability data to calculate available staff
    const availabilityData = await this.getStaffAvailability();
    const available = availabilityData.filter(a => a.available).length;

    // Calculate off duty (active staff not on duty)
    const activeStaff = staff.filter(s => s.status === 'active').length;
    const offDuty = Math.max(0, activeStaff - currentlyOnDuty);

    return {
      onDuty: currentlyOnDuty,
      scheduledToday,
      available,
      offDuty
    };
  }

  async getStaffAvailability(): Promise<any[]> {
    const staff = await this.getStaff();
    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const availabilityData = await Promise.all(
      staff.map(async (s) => {
        // Check if staff member is active
        if (s.status !== 'active') {
          return {
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            role: s.role,
            status: s.status,
            available: false,
            reason: 'Staff member is not active',
            currentSchedule: null,
            nextSchedule: null
          };
        }

        // Get current schedule (if any)
        const currentSchedules = Array.from(this.schedules.values())
          .filter(schedule => 
            schedule.staffId === s.id &&
            schedule.status !== 'cancelled' &&
            new Date(schedule.startTime) <= now &&
            new Date(schedule.endTime) > now
          );

        // Get today's remaining schedules
        const todaySchedules = Array.from(this.schedules.values())
          .filter(schedule => 
            schedule.staffId === s.id &&
            schedule.status !== 'cancelled' &&
            new Date(schedule.startTime) > now &&
            new Date(schedule.startTime) <= endOfToday
          )
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        const currentSchedule = currentSchedules.length > 0 ? currentSchedules[0] : null;
        const nextSchedule = todaySchedules.length > 0 ? todaySchedules[0] : null;

        // Determine availability status
        let available = false;
        let availabilityStatus = 'off-duty';
        let reason = '';

        if (currentSchedule) {
          // Staff is currently on duty
          availabilityStatus = 'on-duty';
          available = false;
          reason = `Currently on duty at ${currentSchedule.location || 'assigned location'}`;
        } else {
          // Check for conflicts in the next few hours (default check for next 8 hours)
          const checkUntil = new Date(now.getTime() + 8 * 60 * 60 * 1000);
          const availability = await this.checkStaffAvailability(s.id, now, checkUntil);

          if (availability.available) {
            available = true;
            availabilityStatus = 'available';
            if (nextSchedule) {
              const nextStart = new Date(nextSchedule.startTime);
              const hoursUntilNext = Math.round((nextStart.getTime() - now.getTime()) / (1000 * 60 * 60) * 10) / 10;
              reason = `Available until next shift in ${hoursUntilNext} hours`;
            } else {
              reason = 'Available for assignment';
            }
          } else {
            available = false;
            availabilityStatus = 'unavailable';
            if (availability.conflicts.length > 0) {
              const nextConflict = availability.conflicts[0];
              const conflictStart = new Date(nextConflict.startTime);
              const hoursUntilConflict = Math.round((conflictStart.getTime() - now.getTime()) / (1000 * 60 * 60) * 10) / 10;
              reason = `Scheduled in ${hoursUntilConflict} hours`;
            } else {
              reason = availability.reason || 'Not available';
            }
          }
        }

        return {
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          role: s.role,
          status: s.status,
          available,
          availabilityStatus,
          reason,
          currentSchedule: currentSchedule ? {
            id: currentSchedule.id,
            title: currentSchedule.title,
            location: currentSchedule.location,
            startTime: currentSchedule.startTime,
            endTime: currentSchedule.endTime,
            shiftType: currentSchedule.shiftType
          } : null,
          nextSchedule: nextSchedule ? {
            id: nextSchedule.id,
            title: nextSchedule.title,
            location: nextSchedule.location,
            startTime: nextSchedule.startTime,
            endTime: nextSchedule.endTime,
            shiftType: nextSchedule.shiftType
          } : null
        };
      })
    );

    // Sort by availability status and name for better organization
    return availabilityData.sort((a, b) => {
      // First sort by availability (available first)
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;

      // Then by status (on-duty first, then available, then unavailable)
      const statusOrder = { 'on-duty': 0, 'available': 1, 'unavailable': 2, 'off-duty': 3 };
      const aOrder = statusOrder[a.availabilityStatus] || 4;
      const bOrder = statusOrder[b.availabilityStatus] || 4;
      if (aOrder !== bOrder) return aOrder - bOrder;

      // Finally by name
      return a.name.localeCompare(b.name);
    });
  }

  async getClientStats(): Promise<any> {
    const clients = await this.getClients();

    // Calculate clients created this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = clients.filter(c => 
      new Date(c.createdAt) >= startOfMonth
    ).length;

    return {
      total: clients.length,
      active: clients.filter(c => c.status === "active").length,
      pending: clients.filter(c => c.status === "pending").length,
      newThisMonth
    };
  }

  async getPropertyStats(): Promise<any> {
    const properties = await this.getProperties();
    return {
      total: properties.length,
      active: properties.filter(p => p.status === "active").length,
      totalGuards: properties.reduce((sum, p) => sum + (p.guardCount || 0), 0),
      underReview: properties.filter(p => p.status === "under_review").length
    };
  }

  // Crime Intelligence methods
  async getCrimeIntelligence(filter?: {
    status?: string;
    threatLevel?: string;
    priority?: string;
    analysisType?: string;
    classification?: string;
    assignedAnalyst?: string;
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    searchTerm?: string;
  }): Promise<CrimeIntelligence[]> {
    let intelligenceList = Array.from(this.crimeIntelligence.values());

    if (filter) {
      if (filter.status) {
        intelligenceList = intelligenceList.filter(ci => ci.status === filter.status);
      }
      if (filter.threatLevel) {
        intelligenceList = intelligenceList.filter(ci => ci.threatLevel === filter.threatLevel);
      }
      if (filter.priority) {
        intelligenceList = intelligenceList.filter(ci => ci.priority === filter.priority);
      }
      if (filter.analysisType) {
        intelligenceList = intelligenceList.filter(ci => ci.analysisType === filter.analysisType);
      }
      if (filter.classification) {
        intelligenceList = intelligenceList.filter(ci => ci.classification === filter.classification);
      }
      if (filter.assignedAnalyst) {
        intelligenceList = intelligenceList.filter(ci => ci.assignedAnalyst === filter.assignedAnalyst);
      }
      if (filter.tags && filter.tags.length > 0) {
        intelligenceList = intelligenceList.filter(ci => 
          filter.tags!.some(tag => ci.tags?.includes(tag))
        );
      }
      if (filter.dateFrom) {
        intelligenceList = intelligenceList.filter(ci => ci.createdAt >= filter.dateFrom!);
      }
      if (filter.dateTo) {
        intelligenceList = intelligenceList.filter(ci => ci.createdAt <= filter.dateTo!);
      }
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        intelligenceList = intelligenceList.filter(ci => 
          ci.title.toLowerCase().includes(term) ||
          ci.description.toLowerCase().includes(term) ||
          ci.summary.toLowerCase().includes(term) ||
          ci.caseNumber.toLowerCase().includes(term)
        );
      }
    }

    return intelligenceList.sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;

      // Then by threat level
      const threatOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aThreat = threatOrder[a.threatLevel as keyof typeof threatOrder] || 0;
      const bThreat = threatOrder[b.threatLevel as keyof typeof threatOrder] || 0;
      if (aThreat !== bThreat) return bThreat - aThreat;

      // Finally by last activity date
      return b.lastActivityDate.getTime() - a.lastActivityDate.getTime();
    });
  }

  async getCrimeStats(): Promise<any> {
    const intelligenceList = Array.from(this.crimeIntelligence.values());
    const activeIntelligence = intelligenceList.filter(ci => ci.status === 'active');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get recent incidents for comparison
    const recentIncidents = await this.getRecentIncidents();

    const threatLevelStats: { [key: string]: number } = {};
    const analysisTypeStats: { [key: string]: number } = {};
    const statusStats: { [key: string]: number } = {};

    intelligenceList.forEach(ci => {
      threatLevelStats[ci.threatLevel] = (threatLevelStats[ci.threatLevel] || 0) + 1;
      analysisTypeStats[ci.analysisType] = (analysisTypeStats[ci.analysisType] || 0) + 1;
      statusStats[ci.status] = (statusStats[ci.status] || 0) + 1;
    });

    return {
      total: intelligenceList.length,
      active: activeIntelligence.length,
      critical: intelligenceList.filter(ci => ci.threatLevel === 'critical').length,
      highPriority: intelligenceList.filter(ci => ci.priority === 'high' || ci.priority === 'urgent').length,
      monitoring: intelligenceList.filter(ci => ci.status === 'monitoring').length,
      escalated: intelligenceList.filter(ci => ci.status === 'escalated').length,
      requiresFollowUp: intelligenceList.filter(ci => ci.followUpRequired).length,
      overdueReview: intelligenceList.filter(ci => 
        ci.nextReviewDate && ci.nextReviewDate < new Date()
      ).length,
      createdToday: intelligenceList.filter(ci => 
        ci.createdAt >= today && ci.createdAt < tomorrow
      ).length,
      updatedToday: intelligenceList.filter(ci => 
        ci.updatedAt >= today && ci.updatedAt < tomorrow
      ).length,
      recentActivity: intelligenceList.filter(ci => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return ci.lastActivityDate >= sevenDaysAgo;
      }).length,
      linkedToIncidents: intelligenceList.filter(ci => ci.incidentId).length,
      withEvidence: intelligenceList.filter(ci => ci.evidenceIds && ci.evidenceIds.length > 0).length,
      byThreatLevel: threatLevelStats,
      byAnalysisType: analysisTypeStats,
      byStatus: statusStats,
      totalIncidents: recentIncidents.length,
      incidentTrends: {
        thisWeek: recentIncidents.length,
        critical: recentIncidents.filter(i => i.severity === 'critical').length,
        resolved: recentIncidents.filter(i => i.status === 'resolved').length
      }
    };
  }

  async getCrimeIntelligenceById(id: string): Promise<CrimeIntelligence | null> {
    return this.crimeIntelligence.get(id) || null;
  }

  async createCrimeIntelligence(data: Omit<CrimeIntelligence, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityDate'>): Promise<CrimeIntelligence> {
    const id = uuidv4();
    const now = new Date();

    // Generate case number if not provided
    const caseNumber = data.caseNumber || `CI-${new Date().getFullYear()}-${String(this.crimeIntelligence.size + 1).padStart(6, '0')}`;

    const crimeIntelligence: CrimeIntelligence = {
      id,
      ...data,
      caseNumber,
      status: data.status || 'active',
      priority: data.priority || 'medium',
      threatLevel: data.threatLevel || 'medium',
      classification: data.classification || 'restricted',
      followUpRequired: data.followUpRequired || false,
      lastActivityDate: now,
      createdAt: now,
      updatedAt: now,
    };

    this.crimeIntelligence.set(id, crimeIntelligence);

    // Log activity
    await this.createActivity({
      userId: data.assignedAnalyst || 'system',
      activityType: 'crime_intelligence_created',
      entityType: 'crime_intelligence',
      entityId: id,
      description: `Created crime intelligence report: ${data.title} (${caseNumber})`,
      metadata: { 
        crimeIntelligenceId: id, 
        caseNumber,
        threatLevel: data.threatLevel,
        analysisType: data.analysisType,
        incidentId: data.incidentId
      }
    });

    return crimeIntelligence;
  }

  async updateCrimeIntelligence(id: string, updates: Partial<CrimeIntelligence>): Promise<CrimeIntelligence> {
    const crimeIntelligence = this.crimeIntelligence.get(id);
    if (!crimeIntelligence) {
      throw new Error(`Crime intelligence with id ${id} not found`);
    }

    const now = new Date();
    const updatedCrimeIntelligence = { 
      ...crimeIntelligence, 
      ...updates, 
      lastActivityDate: now,
      updatedAt: now 
    };
    this.crimeIntelligence.set(id, updatedCrimeIntelligence);

    // Log activity
    await this.createActivity({
      userId: updates.assignedAnalyst || crimeIntelligence.assignedAnalyst || 'system',
      activityType: 'crime_intelligence_updated',
      entityType: 'crime_intelligence',
      entityId: id,
      description: `Updated crime intelligence: ${crimeIntelligence.title}`,
      metadata: { 
        crimeIntelligenceId: id,
        caseNumber: crimeIntelligence.caseNumber,
        updatedFields: Object.keys(updates),
        previousStatus: crimeIntelligence.status,
        newStatus: updates.status
      }
    });

    return updatedCrimeIntelligence;
  }

  async deleteCrimeIntelligence(id: string): Promise<boolean> {
    const crimeIntelligence = this.crimeIntelligence.get(id);
    if (!crimeIntelligence) {
      return false;
    }

    // Soft delete by archiving
    await this.updateCrimeIntelligence(id, { status: 'archived' });

    // Log activity
    await this.createActivity({
      userId: crimeIntelligence.assignedAnalyst || 'system',
      activityType: 'crime_intelligence_deleted',
      entityType: 'crime_intelligence',
      entityId: id,
      description: `Archived crime intelligence: ${crimeIntelligence.title}`,
      metadata: { 
        crimeIntelligenceId: id,
        caseNumber: crimeIntelligence.caseNumber
      }
    });

    return true;
  }

  async getCrimeIntelligenceByIncident(incidentId: string): Promise<CrimeIntelligence[]> {
    return Array.from(this.crimeIntelligence.values())
      .filter(ci => ci.incidentId === incidentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async searchCrimeIntelligence(query: string, options?: {
    analysisType?: string;
    threatLevel?: string;
    classification?: string;
    limit?: number;
  }): Promise<CrimeIntelligence[]> {
    const filter = {
      searchTerm: query,
      ...options
    };
    const results = await this.getCrimeIntelligence(filter);
    return options?.limit ? results.slice(0, options.limit) : results;
  }

  async getCrimeIntelligenceByThreatLevel(threatLevel: string): Promise<CrimeIntelligence[]> {
    return this.getCrimeIntelligence({ threatLevel, status: 'active' });
  }

  async getCrimeIntelligenceRequiringReview(): Promise<CrimeIntelligence[]> {
    const now = new Date();
    return Array.from(this.crimeIntelligence.values())
      .filter(ci => 
        ci.followUpRequired || 
        (ci.nextReviewDate && ci.nextReviewDate <= now) ||
        ci.status === 'monitoring'
      )
      .sort((a, b) => {
        // Prioritize by urgency
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
        return a.nextReviewDate && b.nextReviewDate 
          ? a.nextReviewDate.getTime() - b.nextReviewDate.getTime()
          : 0;
      });
  }

  // Pattern Analysis Methods
  async analyzeCrimePatterns(options?: {
    timeframe?: { start: Date; end: Date };
    location?: string;
    crimeType?: string;
  }): Promise<{
    patterns: any[];
    trends: any[];
    recommendations: string[];
    riskAreas: any[];
  }> {
    const incidents = await this.getIncidents();
    const intelligence = Array.from(this.crimeIntelligence.values());

    let filteredIncidents = incidents;
    let filteredIntelligence = intelligence;

    if (options?.timeframe) {
      filteredIncidents = incidents.filter(i => 
        i.occuredAt >= options.timeframe!.start && i.occuredAt <= options.timeframe!.end
      );
      filteredIntelligence = intelligence.filter(ci => 
        ci.createdAt >= options.timeframe!.start && ci.createdAt <= options.timeframe!.end
      );
    }

    if (options?.location) {
      const location = options.location.toLowerCase();
      filteredIncidents = filteredIncidents.filter(i => 
        i.location?.toLowerCase().includes(location)
      );
      filteredIntelligence = filteredIntelligence.filter(ci => 
        ci.location?.toLowerCase().includes(location)
      );
    }

    if (options?.crimeType) {
      filteredIncidents = filteredIncidents.filter(i => 
        i.incidentType === options.crimeType
      );
    }

    // Analyze patterns
    const patterns = this.identifyPatterns(filteredIncidents, filteredIntelligence);
    const trends = this.analyzeTrends(filteredIncidents);
    const recommendations = this.generateRecommendations(patterns, trends);
    const riskAreas = this.identifyRiskAreas(filteredIncidents, filteredIntelligence);

    return { patterns, trends, recommendations, riskAreas };
  }

  private identifyPatterns(incidents: Incident[], intelligence: CrimeIntelligence[]): any[] {
    const patterns: any[] = [];

    // Time-based patterns
    const timePatterns = this.analyzeTimePatterns(incidents);
    if (timePatterns.length > 0) {
      patterns.push({
        type: 'temporal',
        description: 'Time-based incident patterns detected',
        patterns: timePatterns,
        confidence: 'medium'
      });
    }

    // Location-based patterns
    const locationPatterns = this.analyzeLocationPatterns(incidents);
    if (locationPatterns.length > 0) {
      patterns.push({
        type: 'geographic',
        description: 'Geographic clustering of incidents',
        patterns: locationPatterns,
        confidence: 'high'
      });
    }

    // Method patterns from intelligence
    const methodPatterns = this.analyzeMethodPatterns(intelligence);
    if (methodPatterns.length > 0) {
      patterns.push({
        type: 'methodology',
        description: 'Similar methods or approaches detected',
        patterns: methodPatterns,
        confidence: 'medium'
      });
    }

    return patterns;
  }

  private analyzeTimePatterns(incidents: Incident[]): any[] {
    const hourCounts: { [hour: number]: number } = {};
    const dayOfWeekCounts: { [day: number]: number } = {};

    incidents.forEach(incident => {
      const date = new Date(incident.occuredAt);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();

      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1;
    });

    const patterns: any[] = [];

    // Find peak hours
    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    if (peakHours.length > 0 && peakHours[0].count > 1) {
      patterns.push({
        type: 'peak_hours',
        data: peakHours,
        description: `Most incidents occur between ${peakHours[0].hour}:00-${peakHours[0].hour + 1}:00`
      });
    }

    // Find peak days
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakDays = Object.entries(dayOfWeekCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([day, count]) => ({ day: dayNames[parseInt(day)], count }));

    if (peakDays.length > 0 && peakDays[0].count > 1) {
      patterns.push({
        type: 'peak_days',
        data: peakDays,
        description: `Most incidents occur on ${peakDays[0].day}`
      });
    }

    return patterns;
  }

  private analyzeLocationPatterns(incidents: Incident[]): any[] {
    const locationCounts: { [location: string]: number } = {};

    incidents.forEach(incident => {
      if (incident.location) {
        locationCounts[incident.location] = (locationCounts[incident.location] || 0) + 1;
      }
    });

    const hotspots = Object.entries(locationCounts)
      .filter(([, count]) => count > 1)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    return hotspots.length > 0 ? [{
      type: 'hotspots',
      data: hotspots,
      description: `Crime hotspots identified: ${hotspots.map(h => h.location).join(', ')}`
    }] : [];
  }

  private analyzeMethodPatterns(intelligence: CrimeIntelligence[]): any[] {
    const methodCounts: { [method: string]: number } = {};

    intelligence.forEach(ci => {
      if (ci.patterns?.methodology) {
        methodCounts[ci.patterns.methodology] = (methodCounts[ci.patterns.methodology] || 0) + 1;
      }
    });

    const commonMethods = Object.entries(methodCounts)
      .filter(([, count]) => count > 1)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([method, count]) => ({ method, count }));

    return commonMethods.length > 0 ? [{
      type: 'common_methods',
      data: commonMethods,
      description: `Common methodologies detected: ${commonMethods.map(m => m.method).join(', ')}`
    }] : [];
  }

  private analyzeTrends(incidents: Incident[]): any[] {
    const trends: any[] = [];

    // Analyze incident frequency over time
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recent7Days = incidents.filter(i => i.occuredAt >= last7Days).length;
    const recent30Days = incidents.filter(i => i.occuredAt >= last30Days).length;
    const previous7Days = incidents.filter(i => {
      const date = i.occuredAt;
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return date >= twoWeeksAgo && date < last7Days;
    }).length;

    const weeklyChange = previous7Days > 0 ? ((recent7Days - previous7Days) / previous7Days) * 100 : 0;

    if (Math.abs(weeklyChange) > 20) {
      trends.push({
        type: 'frequency_trend',
        direction: weeklyChange > 0 ? 'increasing' : 'decreasing',
        percentage: Math.abs(weeklyChange),
        description: `Incident frequency ${weeklyChange > 0 ? 'increased' : 'decreased'} by ${Math.round(Math.abs(weeklyChange))}% this week`
      });
    }

    // Analyze severity trends
    const recentSevere = incidents.filter(i => 
      i.occuredAt >= last7Days && (i.severity === 'high' || i.severity === 'critical')
    ).length;

    if (recentSevere > 0) {
      trends.push({
        type: 'severity_trend',
        count: recentSevere,
        description: `${recentSevere} high-severity incidents in the past week`
      });
    }

    return trends;
  }

  private generateRecommendations(patterns: any[], trends: any[]): string[] {
    const recommendations: string[] = [];

    patterns.forEach(pattern => {
      if (pattern.type === 'temporal' && pattern.patterns.length > 0) {
        const peakHour = pattern.patterns.find((p: any) => p.type === 'peak_hours');
        if (peakHour) {
          recommendations.push(`Increase patrol presence during peak hours (${peakHour.data[0]?.hour}:00-${peakHour.data[0]?.hour + 1}:00)`);
        }
      }

      if (pattern.type === 'geographic' && pattern.patterns.length > 0) {
        const hotspots = pattern.patterns.find((p: any) => p.type === 'hotspots');
        if (hotspots && hotspots.data.length > 0) {
          recommendations.push(`Deploy additional security resources to hotspot areas: ${hotspots.data[0]?.location}`);
        }
      }
    });

    trends.forEach(trend => {
      if (trend.type === 'frequency_trend' && trend.direction === 'increasing') {
        recommendations.push('Consider implementing additional preventive measures due to increasing incident frequency');
      }

      if (trend.type === 'severity_trend' && trend.count > 2) {
        recommendations.push('Review and strengthen security protocols due to recent high-severity incidents');
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Continue current security protocols and maintain regular monitoring');
    }

    return recommendations;
  }

  private identifyRiskAreas(incidents: Incident[], intelligence: CrimeIntelligence[]): any[] {
    const riskAreas: any[] = [];

    // Combine incident locations and intelligence locations
    const locationRisk: { [location: string]: { score: number; incidents: number; intelligence: number } } = {};

    incidents.forEach(incident => {
      if (incident.location) {
        if (!locationRisk[incident.location]) {
          locationRisk[incident.location] = { score: 0, incidents: 0, intelligence: 0 };
        }
        locationRisk[incident.location].incidents++;
        locationRisk[incident.location].score += incident.severity === 'critical' ? 3 : 
                                                    incident.severity === 'high' ? 2 : 1;
      }
    });

    intelligence.forEach(ci => {
      if (ci.location) {
        if (!locationRisk[ci.location]) {
          locationRisk[ci.location] = { score: 0, incidents: 0, intelligence: 0 };
        }
        locationRisk[ci.location].intelligence++;
        locationRisk[ci.location].score += ci.threatLevel === 'critical' ? 3 : 
                                             ci.threatLevel === 'high' ? 2 : 1;
      }
    });

    // Convert to risk areas array and sort by risk score
    const areas = Object.entries(locationRisk)
      .map(([location, data]) => ({
        location,
        riskScore: data.score,
        incidentCount: data.incidents,
        intelligenceCount: data.intelligence,
        riskLevel: data.score >= 6 ? 'high' : data.score >= 3 ? 'medium' : 'low'
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10); // Top 10 risk areas

    return areas;
  }

  // Threat Assessment Methods
  async assessThreat(params: {
    incidentId?: string;
    location?: string;
    timeframe?: { start: Date; end: Date };
    threatType?: string;
  }): Promise<{
    threatLevel: string;
    confidence: string;
    factors: string[];
    recommendations: string[];
    nextReviewDate: Date;
  }> {
    const factors: string[] = [];
    let threatScore = 0;

    // Analyze recent incidents in the area
    const incidents = await this.getIncidents();
    const recentIncidents = incidents.filter(i => {
      let matches = true;
      if (params.location) {
        matches = matches && i.location?.toLowerCase().includes(params.location.toLowerCase());
      }
      if (params.timeframe) {
        matches = matches && i.occuredAt >= params.timeframe.start && i.occuredAt <= params.timeframe.end;
      }
      return matches;
    });

    if (recentIncidents.length > 0) {
      threatScore += recentIncidents.length * 0.5;
      factors.push(`${recentIncidents.length} recent incidents in the area`);
    }

    // Analyze related intelligence
    const intelligence = Array.from(this.crimeIntelligence.values()).filter(ci => {
      let matches = true;
      if (params.location) {
        matches = matches && ci.location?.toLowerCase().includes(params.location.toLowerCase());
      }
      return matches && ci.status === 'active';
    });

    if (intelligence.length > 0) {
      const highThreatIntel = intelligence.filter(ci => ci.threatLevel === 'high' || ci.threatLevel === 'critical');
      threatScore += highThreatIntel.length * 2;
      if (highThreatIntel.length > 0) {
        factors.push(`${highThreatIntel.length} high-threat intelligence reports`);
      }
    }

    // Determine threat level
    let threatLevel = 'low';
    let confidence = 'medium';

    if (threatScore >= 8) {
      threatLevel = 'critical';
      confidence = 'high';
    } else if (threatScore >= 5) {
      threatLevel = 'high';
      confidence = 'high';
    } else if (threatScore >= 2) {
      threatLevel = 'medium';
      confidence = 'medium';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (threatLevel === 'critical') {
      recommendations.push('Immediate security response required');
      recommendations.push('Coordinate with law enforcement');
      recommendations.push('Implement emergency security protocols');
    } else if (threatLevel === 'high') {
      recommendations.push('Increase security presence in the area');
      recommendations.push('Enhanced monitoring and surveillance');
      recommendations.push('Brief security personnel on specific threats');
    } else if (threatLevel === 'medium') {
      recommendations.push('Maintain current security levels with increased vigilance');
      recommendations.push('Regular patrol schedule adjustments');
    } else {
      recommendations.push('Continue standard security protocols');
      recommendations.push('Regular monitoring and assessment');
    }

    // Set next review date based on threat level
    const nextReviewDate = new Date();
    switch (threatLevel) {
      case 'critical':
        nextReviewDate.setHours(nextReviewDate.getHours() + 4); // 4 hours
        break;
      case 'high':
        nextReviewDate.setDate(nextReviewDate.getDate() + 1); // 1 day
        break;
      case 'medium':
        nextReviewDate.setDate(nextReviewDate.getDate() + 3); // 3 days
        break;
      default:
        nextReviewDate.setDate(nextReviewDate.getDate() + 7); // 1 week
    }

    return {
      threatLevel,
      confidence,
      factors,
      recommendations,
      nextReviewDate
    };
  }

  async getSchedules(date?: string): Promise<Schedule[]> {
    let schedulesList = Array.from(this.schedules.values());

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      schedulesList = schedulesList.filter(schedule => {
        const startTime = new Date(schedule.startTime);
        return startTime >= targetDate && startTime < nextDay;
      });
    }

    return schedulesList
      .filter(schedule => schedule.status !== 'cancelled')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async getScheduleStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSchedules = await this.getTodaysSchedule();
    const allStaff = await this.getActiveStaff();
    const scheduledStaffIds = new Set(todaysSchedules.map(s => s.staffId));
    const availableStaff = allStaff.filter(staff => !scheduledStaffIds.has(staff.id));

    const openShifts = todaysSchedules.filter(s => s.status === 'scheduled' && !s.staffId).length;
    const totalRequiredShifts = todaysSchedules.length;
    const filledShifts = todaysSchedules.filter(s => s.staffId && s.status !== 'cancelled').length;
    const coveragePercentage = totalRequiredShifts > 0 ? Math.round((filledShifts / totalRequiredShifts) * 100) : 100;

    return {
      scheduledToday: todaysSchedules.length,
      availableStaff: availableStaff.length,
      openShifts,
      coveragePercentage,
      inProgress: todaysSchedules.filter(s => s.status === 'in_progress').length,
      completed: todaysSchedules.filter(s => s.status === 'completed').length,
      confirmed: todaysSchedules.filter(s => s.status === 'confirmed').length,
      totalStaff: allStaff.length,
      scheduledStaff: scheduledStaffIds.size
    };
  }

  // Core Schedule CRUD operations
  async getScheduleById(id: string): Promise<Schedule | null> {
    return this.schedules.get(id) || null;
  }

  async createSchedule(scheduleData: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
    const id = uuidv4();
    const now = new Date();

    // Validate required fields
    if (!scheduleData.staffId || !scheduleData.startTime || !scheduleData.endTime) {
      throw new Error('Missing required fields: staffId, startTime, and endTime are required');
    }

    // Check for schedule conflicts
    const conflicts = await this.checkScheduleConflicts(scheduleData.staffId, scheduleData.startTime, scheduleData.endTime);
    if (conflicts.length > 0) {
      throw new Error(`Schedule conflict detected with existing schedules: ${conflicts.map(c => c.id).join(', ')}`);
    }

    // Calculate duration if not provided
    const duration = scheduleData.duration || 
      Math.round((new Date(scheduleData.endTime).getTime() - new Date(scheduleData.startTime).getTime()) / (1000 * 60));

    const schedule: Schedule = {
      id,
      ...scheduleData,
      duration,
      status: scheduleData.status || 'scheduled',
      priority: scheduleData.priority || 'medium',
      recurring: scheduleData.recurring || false,
      clientNotificationRequired: scheduleData.clientNotificationRequired || false,
      clientNotificationSent: scheduleData.clientNotificationSent || false,
      createdAt: now,
      updatedAt: now,
    };

    this.schedules.set(id, schedule);

    // Log activity
    await this.createActivity({
      userId: scheduleData.scheduledBy,
      activityType: 'schedule_created',
      entityType: 'schedule',
      entityId: id,
      description: `Created schedule: ${scheduleData.title} for ${scheduleData.staffId}`,
      metadata: { 
        scheduleId: id, 
        staffId: scheduleData.staffId,
        propertyId: scheduleData.propertyId,
        shiftType: scheduleData.shiftType,
        scheduleType: scheduleData.scheduleType
      }
    });

    // Generate recurring schedules if needed
    if (schedule.recurring && schedule.recurrencePattern && schedule.recurrenceEndDate) {
      await this.generateRecurringSchedules(schedule);
    }

    return schedule;
  }

  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule> {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error(`Schedule with id ${id} not found`);
    }

    // Check for conflicts if time or staff changes
    if ((updates.staffId && updates.staffId !== schedule.staffId) || 
        updates.startTime || updates.endTime) {
      const staffId = updates.staffId || schedule.staffId;
      const startTime = updates.startTime || schedule.startTime;
      const endTime = updates.endTime || schedule.endTime;

      const conflicts = await this.checkScheduleConflicts(staffId, startTime, endTime, id);
      if (conflicts.length > 0) {
        throw new Error(`Schedule conflict detected with existing schedules: ${conflicts.map(c => c.id).join(', ')}`);
      }
    }

    // Recalculate duration if times change
    if (updates.startTime || updates.endTime) {
      const startTime = updates.startTime || schedule.startTime;
      const endTime = updates.endTime || schedule.endTime;
      updates.duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60));
    }

    const updatedSchedule = { 
      ...schedule, 
      ...updates, 
      modifiedBy: updates.modifiedBy || schedule.scheduledBy,
      updatedAt: new Date() 
    };
    this.schedules.set(id, updatedSchedule);

    // Log activity
    await this.createActivity({
      userId: updates.modifiedBy || schedule.scheduledBy,
      activityType: 'schedule_updated',
      entityType: 'schedule',
      entityId: id,
      description: `Updated schedule: ${schedule.title}`,
      metadata: { 
        scheduleId: id, 
        updatedFields: Object.keys(updates),
        previousStatus: schedule.status,
        newStatus: updates.status
      }
    });

    return updatedSchedule;
  }

  async deleteSchedule(id: string): Promise<boolean> {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      return false;
    }

    // Soft delete by marking as cancelled
    await this.updateSchedule(id, { status: 'cancelled' });

    // Log activity
    await this.createActivity({
      userId: schedule.scheduledBy,
      activityType: 'schedule_deleted',
      entityType: 'schedule',
      entityId: id,
      description: `Deleted schedule: ${schedule.title}`,
      metadata: { scheduleId: id }
    });

    return true;
  }

  // Schedule filtering methods
  async getSchedulesByStaff(staffId: string, startDate?: Date, endDate?: Date): Promise<Schedule[]> {
    let schedules = Array.from(this.schedules.values())
      .filter(schedule => schedule.staffId === staffId && schedule.status !== 'cancelled');

    if (startDate) {
      schedules = schedules.filter(schedule => new Date(schedule.startTime) >= startDate);
    }

    if (endDate) {
      schedules = schedules.filter(schedule => new Date(schedule.endTime) <= endDate);
    }

    return schedules.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async getSchedulesByProperty(propertyId: string, startDate?: Date, endDate?: Date): Promise<Schedule[]> {
    let schedules = Array.from(this.schedules.values())
      .filter(schedule => schedule.propertyId === propertyId && schedule.status !== 'cancelled');

    if (startDate) {
      schedules = schedules.filter(schedule => new Date(schedule.startTime) >= startDate);
    }

    if (endDate) {
      schedules = schedules.filter(schedule => new Date(schedule.endTime) <= endDate);
    }

    return schedules.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async getSchedulesByDateRange(startDate: Date, endDate: Date, filters?: {
    staffId?: string;
    propertyId?: string;
    status?: string;
    shiftType?: string;
    scheduleType?: string;
  }): Promise<Schedule[]> {
    let schedules = Array.from(this.schedules.values())
      .filter(schedule => {
        const scheduleStart = new Date(schedule.startTime);
        const scheduleEnd = new Date(schedule.endTime);
        return (scheduleStart >= startDate && scheduleStart <= endDate) ||
               (scheduleEnd >= startDate && scheduleEnd <= endDate) ||
               (scheduleStart <= startDate && scheduleEnd >= endDate);
      });

    if (filters) {
      if (filters.staffId) {
        schedules = schedules.filter(s => s.staffId === filters.staffId);
      }
      if (filters.propertyId) {
        schedules = schedules.filter(s => s.propertyId === filters.propertyId);
      }
      if (filters.status) {
        schedules = schedules.filter(s => s.status === filters.status);
      }
      if (filters.shiftType) {
        schedules = schedules.filter(s => s.shiftType === filters.shiftType);
      }
      if (filters.scheduleType) {
        schedules = schedules.filter(s => s.scheduleType === filters.scheduleType);
      }
    }

    return schedules.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  // Schedule conflict detection
  async checkScheduleConflicts(staffId: string, startTime: Date, endTime: Date, excludeScheduleId?: string): Promise<Schedule[]> {
    const start = new Date(startTime);
    const end = new Date(endTime);

    return Array.from(this.schedules.values())
      .filter(schedule => {
        if (schedule.id === excludeScheduleId) return false;
        if (schedule.staffId !== staffId) return false;
        if (schedule.status === 'cancelled') return false;

        const scheduleStart = new Date(schedule.startTime);
        const scheduleEnd = new Date(schedule.endTime);

        // Check for overlap
        return (start < scheduleEnd && end > scheduleStart);
      });
  }

  async checkStaffAvailability(staffId: string, startTime: Date, endTime: Date): Promise<{
    available: boolean;
    conflicts: Schedule[];
    reason?: string;
  }> {
    const staff = await this.getUser(staffId);
    if (!staff) {
      return { available: false, conflicts: [], reason: 'Staff member not found' };
    }

    if (staff.status !== 'active') {
      return { available: false, conflicts: [], reason: 'Staff member is not active' };
    }

    const conflicts = await this.checkScheduleConflicts(staffId, startTime, endTime);

    return {
      available: conflicts.length === 0,
      conflicts,
      reason: conflicts.length > 0 ? 'Schedule conflicts exist' : undefined
    };
  }

  // Backup staff assignment
  async assignBackupStaff(scheduleId: string, backupStaffId: string): Promise<Schedule> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule with id ${scheduleId} not found`);
    }

    const availability = await this.checkStaffAvailability(backupStaffId, schedule.startTime, schedule.endTime);
    if (!availability.available) {
      throw new Error(`Backup staff member is not available: ${availability.reason}`);
    }

    return await this.updateSchedule(scheduleId, { backupStaffId });
  }

  async findAvailableStaff(startTime: Date, endTime: Date, options?: {
    requiredSkills?: string[];
    propertyId?: string;
    excludeStaffIds?: string[];
  }): Promise<User[]> {
    const allStaff = await this.getActiveStaff();
    const availableStaff: User[] = [];

    for (const staff of allStaff) {
      if (options?.excludeStaffIds?.includes(staff.id)) continue;

      const availability = await this.checkStaffAvailability(staff.id, startTime, endTime);
      if (availability.available) {
        // Check required skills if specified
        if (options?.requiredSkills && options.requiredSkills.length > 0) {
          // For now, assume all staff have all skills - this could be enhanced
          // with a staff skills system
        }

        availableStaff.push(staff);
      }
    }

    return availableStaff;
  }

  // Recurring schedule generation
  async generateRecurringSchedules(parentSchedule: Schedule): Promise<Schedule[]> {
    if (!parentSchedule.recurring || !parentSchedule.recurrencePattern || !parentSchedule.recurrenceEndDate) {
      return [];
    }

    const generatedSchedules: Schedule[] = [];
    const startDate = new Date(parentSchedule.startTime);
    const endDate = new Date(parentSchedule.recurrenceEndDate);
    let currentDate = new Date(startDate);

    // Calculate increment based on pattern
    let incrementDays = 0;
    switch (parentSchedule.recurrencePattern) {
      case 'daily':
        incrementDays = 1;
        break;
      case 'weekly':
        incrementDays = 7;
        break;
      case 'monthly':
        // Handle monthly separately
        break;
      default:
        return [];
    }

    while (currentDate <= endDate) {
      if (parentSchedule.recurrencePattern === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + incrementDays);
      }

      if (currentDate > endDate) break;

      const scheduleStart = new Date(currentDate);
      const scheduleEnd = new Date(currentDate);
      scheduleEnd.setTime(scheduleEnd.getTime() + parentSchedule.duration * 60 * 1000);

      try {
        const newSchedule = await this.createSchedule({
          ...parentSchedule,
          startTime: scheduleStart,
          endTime: scheduleEnd,
          parentScheduleId: parentSchedule.id,
          recurring: false, // Child schedules are not recursive
          recurrencePattern: undefined,
          recurrenceEndDate: undefined
        });

        generatedSchedules.push(newSchedule);
      } catch (error) {
        // Log conflicts but continue generating other schedules
        console.warn(`Failed to create recurring schedule for ${scheduleStart}: ${error}`);
      }
    }

    return generatedSchedules;
  }

  async getRecurringSchedules(parentScheduleId: string): Promise<Schedule[]> {
    return Array.from(this.schedules.values())
      .filter(schedule => schedule.parentScheduleId === parentScheduleId)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  // Shift Template Management
  async createShiftTemplate(templateData: Omit<ShiftTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShiftTemplate> {
    const id = uuidv4();
    const now = new Date();

    const template: ShiftTemplate = {
      id,
      ...templateData,
      isActive: templateData.isActive !== undefined ? templateData.isActive : true,
      createdAt: now,
      updatedAt: now,
    };

    this.shiftTemplates.set(id, template);
    return template;
  }

  async getShiftTemplates(filters?: {
    isActive?: boolean;
    shiftType?: string;
    propertyId?: string;
  }): Promise<ShiftTemplate[]> {
    let templates = Array.from(this.shiftTemplates.values());

    if (filters) {
      if (filters.isActive !== undefined) {
        templates = templates.filter(t => t.isActive === filters.isActive);
      }
      if (filters.shiftType) {
        templates = templates.filter(t => t.shiftType === filters.shiftType);
      }
      if (filters.propertyId) {
        templates = templates.filter(t => t.propertyId === filters.propertyId);
      }
    }

    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getShiftTemplateById(id: string): Promise<ShiftTemplate | null> {
    return this.shiftTemplates.get(id) || null;
  }

  async updateShiftTemplate(id: string, updates: Partial<ShiftTemplate>): Promise<ShiftTemplate> {
    const template = this.shiftTemplates.get(id);
    if (!template) {
      throw new Error(`Shift template with id ${id} not found`);
    }

    const updatedTemplate = { ...template, ...updates, updatedAt: new Date() };
    this.shiftTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteShiftTemplate(id: string): Promise<boolean> {
    return this.shiftTemplates.delete(id);
  }

  async applyShiftTemplate(templateId: string, startDate: Date, endDate: Date, staffId: string): Promise<Schedule[]> {
    const template = await this.getShiftTemplateById(templateId);
    if (!template) {
      throw new Error(`Shift template with id ${templateId} not found`);
    }

    const generatedSchedules: Schedule[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      if (template.daysOfWeek.includes(dayOfWeek)) {
        const [startHour, startMinute] = template.startTime.split(':').map(Number);
        const [endHour, endMinute] = template.endTime.split(':').map(Number);

        const scheduleStart = new Date(currentDate);
        scheduleStart.setHours(startHour, startMinute, 0, 0);

        const scheduleEnd = new Date(currentDate);
        scheduleEnd.setHours(endHour, endMinute, 0, 0);

        // Handle overnight shifts
        if (scheduleEnd <= scheduleStart) {
          scheduleEnd.setDate(scheduleEnd.getDate() + 1);
        }

        try {
          const schedule = await this.createSchedule({
            title: `${template.name} - ${currentDate.toLocaleDateString()}`,
            description: template.description,
            staffId,
            propertyId: template.propertyId,
            shiftType: template.shiftType,
            scheduleType: 'regular',
            startTime: scheduleStart,
            endTime: scheduleEnd,
            duration: template.duration,
            status: 'scheduled',
            priority: 'medium',
            recurring: false,
            requiredSkills: template.requiredSkills,
            equipment: template.equipment,
            checkpoints: template.checkpoints,
            scheduledBy: 'system'
          });

          generatedSchedules.push(schedule);
        } catch (error) {
          console.warn(`Failed to apply template for ${currentDate}: ${error}`);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return generatedSchedules;
  }

  // Schedule optimization
  async optimizeSchedules(startDate: Date, endDate: Date, options?: {
    minimizeOvertime?: boolean;
    balanceWorkload?: boolean;
    respectPreferences?: boolean;
  }): Promise<{
    optimizedSchedules: Schedule[];
    recommendations: string[];
    conflicts: string[];
  }> {
    const schedules = await this.getSchedulesByDateRange(startDate, endDate);
    const allStaff = await this.getActiveStaff();

    const recommendations: string[] = [];
    const conflicts: string[] = [];

    // Basic optimization logic
    const staffWorkload = new Map<string, number>();

    schedules.forEach(schedule => {
      if (schedule.staffId) {
        const current = staffWorkload.get(schedule.staffId) || 0;
        staffWorkload.set(schedule.staffId, current + schedule.duration);
      }
    });

    // Check for workload imbalance
    if (options?.balanceWorkload) {
      const workloads = Array.from(staffWorkload.values());
      const avgWorkload = workloads.reduce((sum, w) => sum + w, 0) / workloads.length;
      const maxDeviation = avgWorkload * 0.2; // 20% deviation threshold

      workloads.forEach((workload, index) => {
        if (Math.abs(workload - avgWorkload) > maxDeviation) {
          const staffId = Array.from(staffWorkload.keys())[index];
          recommendations.push(`Consider rebalancing workload for staff ${staffId}`);
        }
      });
    }

    // Check for overtime
    if (options?.minimizeOvertime) {
      const weeklyHourLimit = 40 * 60; // 40 hours in minutes

      staffWorkload.forEach((workload, staffId) => {
        if (workload > weeklyHourLimit) {
          recommendations.push(`Staff ${staffId} is scheduled for ${Math.round(workload/60)} hours (overtime)`);
        }
      });
    }

    return {
      optimizedSchedules: schedules,
      recommendations,
      conflicts
    };
  }

  // Schedule analytics
  async getScheduleAnalytics(startDate: Date, endDate: Date): Promise<{
    totalScheduledHours: number;
    averageShiftLength: number;
    mostActiveStaff: string;
    peakHours: { hour: number; count: number; }[];
    shiftTypeDistribution: { [key: string]: number };
    propertyDistribution: { [key: string]: number };
    statusDistribution: { [key: string]: number };
    overtimeHours: number;
    noShowRate: number;
  }> {
    const schedules = await this.getSchedulesByDateRange(startDate, endDate);

    const totalScheduledHours = schedules.reduce((sum, s) => sum + (s.duration / 60), 0);
    const averageShiftLength = schedules.length > 0 ? totalScheduledHours / schedules.length : 0;

    // Staff activity
    const staffActivity = new Map<string, number>();
    schedules.forEach(s => {
      if (s.staffId) {
        staffActivity.set(s.staffId, (staffActivity.get(s.staffId) || 0) + 1);
      }
    });
    const mostActiveStaff = Array.from(staffActivity.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Peak hours analysis
    const hourCounts = new Map<number, number>();
    schedules.forEach(s => {
      const hour = new Date(s.startTime).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    const peakHours = Array.from(hourCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Distributions
    const shiftTypeDistribution: { [key: string]: number } = {};
    const propertyDistribution: { [key: string]: number } = {};
    const statusDistribution: { [key: string]: number } = {};

    schedules.forEach(s => {
      shiftTypeDistribution[s.shiftType] = (shiftTypeDistribution[s.shiftType] || 0) + 1;
      if (s.propertyId) {
        propertyDistribution[s.propertyId] = (propertyDistribution[s.propertyId] || 0) + 1;
      }
      statusDistribution[s.status] = (statusDistribution[s.status] || 0) + 1;
    });

    // Calculate overtime (assuming 8 hours is standard)
    const overtimeHours = schedules
      .filter(s => s.duration > 8 * 60)
      .reduce((sum, s) => sum + ((s.duration - 8 * 60) / 60), 0);

    // No-show rate
    const noShows = schedules.filter(s => s.status === 'no_show').length;
    const noShowRate = schedules.length > 0 ? (noShows / schedules.length) * 100 : 0;

    return {
      totalScheduledHours,
      averageShiftLength,
      mostActiveStaff,
      peakHours,
      shiftTypeDistribution,
      propertyDistribution,
      statusDistribution,
      overtimeHours,
      noShowRate
    };
  }

  // ===============================================
  // DATA INTEGRATION AND CORRELATION CAPABILITIES
  // ===============================================

  // External data integration for live Honolulu PD data correlation
  async correlateExternalCrimeData(options?: {
    timeframe?: { start: Date; end: Date };
    location?: string;
    radius?: number; // miles
    crimeTypes?: string[];
    autoCreateIntelligence?: boolean;
  }): Promise<{
    matches: any[];
    newCorrelations: any[];
    updateSuggestions: any[];
    riskAssessments: any[];
    integrationSummary: {
      totalExternalIncidents: number;
      matchedIncidents: number;
      newIntelligenceCreated: number;
      correlationAccuracy: number;
    };
  }> {
    // Mock external data source (in production, this would connect to real PD APIs)
    const externalIncidents = await this.generateMockHonoluluPDData(options);

    const matches: any[] = [];
    const newCorrelations: any[] = [];
    const updateSuggestions: any[] = [];
    const riskAssessments: any[] = [];

    // Get internal incidents and intelligence for correlation
    const internalIncidents = await this.getIncidents();
    const internalIntelligence = Array.from(this.crimeIntelligence.values());

    for (const externalIncident of externalIncidents) {
      // Geographic correlation (within specified radius)
      const geographicMatches = this.findGeographicMatches(
        externalIncident, 
        internalIncidents, 
        options?.radius || 0.5
      );

      // Temporal correlation (within 48 hours)
      const temporalMatches = this.findTemporalMatches(
        externalIncident, 
        internalIncidents, 
        48 // hours
      );

      // Pattern-based correlation
      const patternMatches = this.findPatternMatches(
        externalIncident, 
        internalIntelligence
      );

      if (geographicMatches.length > 0 || temporalMatches.length > 0 || patternMatches.length > 0) {
        const correlation = {
          externalIncident,
          internalMatches: {
            geographic: geographicMatches,
            temporal: temporalMatches,
            pattern: patternMatches
          },
          correlationScore: this.calculateCorrelationScore(geographicMatches, temporalMatches, patternMatches),
          confidence: this.calculateCorrelationConfidence(externalIncident, geographicMatches, temporalMatches),
          riskLevel: this.assessCorrelationRisk(externalIncident, geographicMatches, temporalMatches)
        };

        matches.push(correlation);

        // Auto-create intelligence if option enabled and confidence is high
        if (options?.autoCreateIntelligence && correlation.confidence >= 0.8) {
          const newIntelligence = await this.createIntelligenceFromCorrelation(correlation);
          newCorrelations.push(newIntelligence);
        }

        // Generate update suggestions for existing intelligence
        const suggestions = this.generateUpdateSuggestions(correlation);
        updateSuggestions.push(...suggestions);

        // Perform risk assessment
        const riskAssessment = await this.assessExternalIncidentRisk(externalIncident, correlation);
        riskAssessments.push(riskAssessment);
      }
    }

    const integrationSummary = {
      totalExternalIncidents: externalIncidents.length,
      matchedIncidents: matches.length,
      newIntelligenceCreated: newCorrelations.length,
      correlationAccuracy: matches.length > 0 ? matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length : 0
    };

    return {
      matches,
      newCorrelations,
      updateSuggestions,
      riskAssessments,
      integrationSummary
    };
  }

  // Generate mock Honolulu PD data for testing and demonstration
  private async generateMockHonoluluPDData(options?: any): Promise<any[]> {
    const incidents = [
      {
        pdIncidentId: 'HPD-2024-001234',
        type: 'theft',
        location: '123 Waikiki Beach Walk, Honolulu, HI',
        coordinates: '21.2793,-157.8293',
        dateTime: new Date('2024-01-15T14:30:00Z'),
        description: 'Vehicle break-in reported at beach parking area',
        severity: 'medium',
        status: 'investigating',
        officerBadge: 'HPD-5678',
        caseNumber: 'HPD-24-001234',
        witnesses: 2,
        evidence: ['surveillance_footage', 'fingerprints'],
        suspect: {
          description: 'Male, approximately 25-30 years, 5\'8" height',
          lastSeen: '2024-01-15T14:45:00Z',
          direction: 'heading towards Kalakaua Avenue'
        }
      },
      {
        pdIncidentId: 'HPD-2024-001235',
        type: 'vandalism',
        location: '456 Kapiolani Boulevard, Honolulu, HI',
        coordinates: '21.2956,-157.8459',
        dateTime: new Date('2024-01-15T22:15:00Z'),
        description: 'Graffiti and property damage at commercial building',
        severity: 'low',
        status: 'report_filed',
        officerBadge: 'HPD-9012',
        caseNumber: 'HPD-24-001235',
        damages: '$500 estimated',
        evidence: ['photos', 'paint_samples']
      },
      {
        pdIncidentId: 'HPD-2024-001236',
        type: 'assault',
        location: '789 Hotel Street, Honolulu, HI',
        coordinates: '21.3099,-157.8556',
        dateTime: new Date('2024-01-16T01:20:00Z'),
        description: 'Physical altercation between two individuals',
        severity: 'high',
        status: 'active_investigation',
        officerBadge: 'HPD-3456',
        caseNumber: 'HPD-24-001236',
        injuries: 'minor injuries reported',
        suspects: 2,
        witnesses: 4,
        evidence: ['medical_records', 'witness_statements']
      }
    ];

    // Filter based on options if provided
    let filteredIncidents = incidents;

    if (options?.timeframe) {
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.dateTime >= options.timeframe.start && incident.dateTime <= options.timeframe.end
      );
    }

    if (options?.location) {
      filteredIncidents = filteredIncidents.filter(incident =>
        incident.location.toLowerCase().includes(options.location.toLowerCase())
      );
    }

    if (options?.crimeTypes) {
      filteredIncidents = filteredIncidents.filter(incident =>
        options.crimeTypes.includes(incident.type)
      );
    }

    return filteredIncidents;
  }

  // Find geographic matches within specified radius
  private findGeographicMatches(externalIncident: any, internalIncidents: Incident[], radiusMiles: number): any[] {
    if (!externalIncident.coordinates) return [];

    const [extLat, extLon] = externalIncident.coordinates.split(',').map(Number);

    return internalIncidents.filter(incident => {
      if (!incident.coordinates) return false;

      const [intLat, intLon] = incident.coordinates.split(',').map(Number);
      const distance = this.calculateDistance(extLat, extLon, intLat, intLon);

      return distance <= radiusMiles;
    });
  }

  // Find temporal matches within specified hours
  private findTemporalMatches(externalIncident: any, internalIncidents: Incident[], hoursWindow: number): any[] {
    const extDateTime = new Date(externalIncident.dateTime);
    const windowMs = hoursWindow * 60 * 60 * 1000;

    return internalIncidents.filter(incident => {
      const timeDiff = Math.abs(incident.occuredAt.getTime() - extDateTime.getTime());
      return timeDiff <= windowMs;
    });
  }

  // Find pattern-based matches with intelligence reports
  private findPatternMatches(externalIncident: any, intelligence: CrimeIntelligence[]): any[] {
    return intelligence.filter(intel => {
      // Match by crime type patterns
      if (intel.patterns?.crimeType && 
          intel.patterns.crimeType.toLowerCase().includes(externalIncident.type.toLowerCase())) {
        return true;
      }

      // Match by methodology patterns
      if (intel.patterns?.methodology) {
        const description = externalIncident.description.toLowerCase();
        const methodology = intel.patterns.methodology.toLowerCase();
        if (description.includes(methodology) || methodology.includes(description)) {
          return true;
        }
      }

      // Match by geographic area patterns
      if (intel.patterns?.geographicArea && externalIncident.location) {
        return externalIncident.location.toLowerCase().includes(
          intel.patterns.geographicArea.toLowerCase()
        );
      }

      return false;
    });
  }

  // Calculate correlation score based on match types
  private calculateCorrelationScore(geoMatches: any[], tempMatches: any[], patternMatches: any[]): number {
    let score = 0;

    // Geographic matches are weighted highest
    score += geoMatches.length * 0.5;

    // Temporal matches are weighted medium
    score += tempMatches.length * 0.3;

    // Pattern matches are weighted lower but still significant
    score += patternMatches.length * 0.2;

    // Normalize to 0-1 scale
    return Math.min(score, 1.0);
  }

  // Calculate correlation confidence
  private calculateCorrelationConfidence(externalIncident: any, geoMatches: any[], tempMatches: any[]): number {
    let confidence = 0.1; // Base confidence

    // High confidence if both geographic and temporal matches
    if (geoMatches.length > 0 && tempMatches.length > 0) {
      confidence = 0.9;
    } else if (geoMatches.length > 0) {
      confidence = 0.7;
    } else if (tempMatches.length > 0) {
      confidence = 0.6;
    }

    // Adjust based on data quality
    if (externalIncident.evidence && externalIncident.evidence.length > 0) {
      confidence += 0.1;
    }

    if (externalIncident.witnesses > 0) {
      confidence += 0.05 * externalIncident.witnesses;
    }

    return Math.min(confidence, 1.0);
  }

  // Assess risk level of correlation
  private assessCorrelationRisk(externalIncident: any, geoMatches: any[], tempMatches: any[]): string {
    let riskScore = 0;

    // High risk for serious crimes
    if (['assault', 'robbery', 'burglary', 'weapons'].includes(externalIncident.type)) {
      riskScore += 3;
    }

    // Medium risk for property crimes
    if (['theft', 'vandalism', 'fraud'].includes(externalIncident.type)) {
      riskScore += 2;
    }

    // Risk increases with multiple matches (pattern indicating)
    riskScore += geoMatches.length + tempMatches.length;

    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Create new intelligence from strong correlations
  private async createIntelligenceFromCorrelation(correlation: any): Promise<CrimeIntelligence> {
    const ext = correlation.externalIncident;

    return await this.createCrimeIntelligence({
      title: `External Correlation: ${ext.type} - ${ext.location}`,
      analysisType: 'intelligence_report',
      threatLevel: correlation.riskLevel === 'high' ? 'high' : 'medium',
      priority: correlation.riskLevel === 'high' ? 'high' : 'medium',
      classification: 'restricted',
      source: 'law_enforcement',
      description: `Correlated external incident: ${ext.description}`,
      summary: `External PD incident ${ext.pdIncidentId} correlated with internal data`,
      location: ext.location,
      coordinates: ext.coordinates,
      externalReferences: {
        policeReportNumber: ext.caseNumber,
      },
      intelligence: {
        sources: ['honolulu_pd_integration'],
        reliability: 'good',
        credibility: 'confirmed',
        additionalInfo: `Correlation confidence: ${(correlation.confidence * 100).toFixed(1)}%`
      },
      tags: ['external_correlation', 'pd_integration', ext.type],
      assignedAnalyst: 'system'
    });
  }

  // Generate update suggestions for existing intelligence
  private generateUpdateSuggestions(correlation: any): any[] {
    const suggestions: any[] = [];
    const ext = correlation.externalIncident;

    correlation.internalMatches.pattern.forEach((intel: CrimeIntelligence) => {
      suggestions.push({
        intelligenceId: intel.id,
        type: 'external_correlation_update',
        suggestion: `Add external reference: PD case ${ext.caseNumber}`,
        confidence: correlation.confidence,
        data: {
          externalReferences: {
            policeReportNumber: ext.caseNumber,
          },
          lastActivityDate: new Date(),
          actionsTaken: [...(intel.actionsTaken || []), `Correlated with external PD incident ${ext.pdIncidentId}`]
        }
      });
    });

    return suggestions;
  }

  // Assess risk of external incident for security implications
  private async assessExternalIncidentRisk(externalIncident: any, correlation: any): Promise<any> {
    return {
      incidentId: externalIncident.pdIncidentId,
      securityImpact: correlation.riskLevel,
      recommendations: this.getSecurityRecommendations(externalIncident, correlation),
      affectedProperties: await this.findAffectedProperties(externalIncident),
      responseRequired: correlation.riskLevel === 'high',
      alertLevel: correlation.confidence > 0.8 ? 'immediate' : 'routine'
    };
  }

  // Get security recommendations based on external incident
  private getSecurityRecommendations(externalIncident: any, correlation: any): string[] {
    const recommendations: string[] = [];

    if (correlation.riskLevel === 'high') {
      recommendations.push('Increase security presence in affected area');
      recommendations.push('Alert on-duty personnel immediately');
      recommendations.push('Review and update property security protocols');
    }

    if (externalIncident.type === 'theft') {
      recommendations.push('Increase vehicle patrol frequency');
      recommendations.push('Review parking area security measures');
    }

    if (externalIncident.type === 'assault') {
      recommendations.push('Enhanced personal safety protocols');
      recommendations.push('Coordinate with local law enforcement');
    }

    recommendations.push(`Monitor for similar incidents in ${correlation.internalMatches.geographic.length} nearby properties`);

    return recommendations;
  }

  // Find properties that may be affected by external incident
  private async findAffectedProperties(externalIncident: any): Promise<string[]> {
    if (!externalIncident.coordinates) return [];

    const properties = await this.getProperties();
    const [extLat, extLon] = externalIncident.coordinates.split(',').map(Number);

    return properties
      .filter(property => {
        if (!property.coordinates) return false;
        const [propLat, propLon] = property.coordinates.split(',').map(Number);
        const distance = this.calculateDistance(extLat, extLon, propLat, propLon);
        return distance <= 1.0; // Within 1 mile
      })
      .map(property => property.id);
  }

  // Sync data with external sources (periodic update capability)
  async syncExternalData(options?: {
    sources?: string[];
    forceRefresh?: boolean;
    batchSize?: number;
  }): Promise<{
    processed: number;
    updated: number;
    created: number;
    errors: string[];
    lastSync: Date;
  }> {
    // This would implement periodic synchronization with external data sources
    // For now, returns a summary of what would be processed

    const result = {
      processed: 0,
      updated: 0,
      created: 0,
      errors: [] as string[],
      lastSync: new Date()
    };

    try {
      // Simulate processing external data updates
      const correlation = await this.correlateExternalCrimeData({
        timeframe: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          end: new Date()
        },
        autoCreateIntelligence: true
      });

      result.processed = correlation.integrationSummary.totalExternalIncidents;
      result.created = correlation.integrationSummary.newIntelligenceCreated;
      result.updated = correlation.updateSuggestions.length;

    } catch (error) {
      result.errors.push(`Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  // Add the new method to get insights charts data
  async getInsightsChartsData() {
    const incidents = Array.from(this.incidents.values());
    const patrolReports = Array.from(this.patrolReports.values());
    const properties = Array.from(this.properties.values());
    const users = Array.from(this.users.values());

    // Generate month-by-month trends
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        date: month
      });
    }

    const incidentTrends = months.map(m => {
      const monthStart = new Date(m.date.getFullYear(), m.date.getMonth(), 1);
      const monthEnd = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0);

      const monthIncidents = incidents.filter(i => {
        const incidentDate = new Date(i.createdAt);
        return incidentDate >= monthStart && incidentDate <= monthEnd;
      });

      return {
        month: m.month,
        incidents: monthIncidents.length,
        resolved: monthIncidents.filter(i => i.status === 'resolved').length
      };
    });

    // Incident types breakdown
    const incidentTypeMap = new Map<string, number>();
    incidents.forEach(incident => {
      const type = incident.incidentType || 'Other';
      incidentTypeMap.set(type, (incidentTypeMap.get(type) || 0) + 1);
    });

    const totalIncidents = incidents.length || 1;
    const incidentTypes = Array.from(incidentTypeMap.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalIncidents) * 100)
    }));

    // Response time metrics (mock data based on patrols)
    const responseTimeMetrics = [
      { week: 'Week 1', avgResponseTime: 8.5, target: 10 },
      { week: 'Week 2', avgResponseTime: 7.2, target: 10 },
      { week: 'Week 3', avgResponseTime: 9.1, target: 10 },
      { week: 'Week 4', avgResponseTime: 6.8, target: 10 }
    ];

    // Patrol efficiency based on completed reports
    const patrolEfficiency = users
      .filter(u => u.role === 'officer')
      .slice(0, 4)
      .map((officer, index) => {
        const officerReports = patrolReports.filter(r => r.officerId === officer.id);
        const completedReports = officerReports.filter(r => r.status === 'completed');
        const efficiency = completedReports.length > 0 ? 
          Math.min(95, 75 + (completedReports.length * 2)) : 80;

        return {
          officer: `Officer ${String.fromCharCode(65 + index)}`,
          efficiency: Math.round(efficiency),
          hours: 38 + Math.floor(Math.random() * 6)
        };
      });

    // Property risk levels
    const propertyRiskLevels = [
      { riskLevel: 'Low Risk', count: 45, color: '#10B981' },
      { riskLevel: 'Medium Risk', count: 28, color: '#F59E0B' },
      { riskLevel: 'High Risk', count: 12, color: '#EF4444' },
      { riskLevel: 'Critical', count: 3, color: '#991B1B' }
    ];

    // Monthly stats combining multiple metrics
    const monthlyStats = months.map(m => {
      const monthStart = new Date(m.date.getFullYear(), m.date.getMonth(), 1);
      const monthEnd = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0);

      const monthPatrols = patrolReports.filter(p => {
        const reportDate = new Date(p.startTime);
        return reportDate >= monthStart && reportDate <= monthEnd;
      }).length;

      const monthIncidents = incidents.filter(i => {
        const incidentDate = new Date(i.createdAt);
        return incidentDate >= monthStart && incidentDate <= monthEnd;
      }).length;

      return {
        month: m.month,
        patrols: monthPatrols || (150 + Math.floor(Math.random() * 30)),
        incidents: monthIncidents || (30 + Math.floor(Math.random() * 20)),
        revenue: 120000 + Math.floor(Math.random() * 30000)
      };
    });

    return {
      incidentTrends,
      incidentTypes,
      responseTimeMetrics,
      patrolEfficiency,
      propertyRiskLevels,
      monthlyStats
    };
  }

  // Utility methods
}

export const storage = new MemoryStorage();