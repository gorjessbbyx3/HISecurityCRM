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

    console.log('✅ Sample data seeded in memory storage');
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
    return {
      total: staff.length,
      active: staff.filter(s => s.status === "active").length,
      onDuty: Math.floor(staff.length / 2), // Placeholder, actual on-duty logic would be more complex
      supervisors: staff.filter(s => s.role.includes("supervisor") || s.role === "admin").length
    };
  }

  async getOnDutyStaff(): Promise<any[]> {
    const staff = await this.getStaff();
    // Placeholder logic: assume half the staff are on duty
    return staff.slice(0, Math.ceil(staff.length / 2));
  }

  async getTodaysSchedule(): Promise<any[]> {
    // Placeholder for actual schedule data
    return [];
  }

  async getStaffDashboardStats(): Promise<any> {
    // Placeholder dashboard stats for staff
    return {
      onDuty: 3,
      scheduledToday: 8,
      available: 2,
      offDuty: 4
    };
  }

  async getStaffAvailability(): Promise<any[]> {
    const staff = await this.getStaff();
    // Placeholder logic for availability
    return staff.map((s, index) => ({
      name: `${s.firstName} ${s.lastName}`,
      role: s.role,
      available: index % 2 === 0 // Placeholder: alternates availability
    }));
  }

  async getClientStats(): Promise<any> {
    const clients = await this.getClients();
    return {
      total: clients.length,
      active: clients.filter(c => c.status === "active").length,
      pending: clients.filter(c => c.status === "pending").length,
      newThisMonth: 0 // Placeholder
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

  async getCrimeIntelligence(): Promise<any[]> {
    // Placeholder for crime intelligence data
    return [];
  }

  async getCrimeStats(): Promise<any> {
    // Placeholder for crime statistics
    return {
      total: 0,
      active: 0,
      resolvedToday: 0,
      highPriority: 0
    };
  }

  async getSchedules(date?: string): Promise<any[]> {
    // Placeholder for schedule data, potentially filtered by date
    return [];
  }

  async getScheduleStats(): Promise<any> {
    // Placeholder for schedule statistics
    return {
      scheduledToday: 0,
      availableStaff: 0,
      openShifts: 0,
      coveragePercentage: 0
    };
  }
}

export const storage = new MemoryStorage();