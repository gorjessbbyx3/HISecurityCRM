import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./memoryStorage";
import { setupMemoryAuth, authenticateToken, loginHandler } from "./memoryAuth";
import {
  insertClientSchema,
  insertPropertySchema,
  insertIncidentSchema,
  insertPatrolReportSchema,
  insertAppointmentSchema,
  insertFinancialRecordSchema,
  createEvidenceInputSchema,
  insertEvidenceSchema,
  updateEvidenceInputSchema,
  updateEvidenceSchema,
  createCommunityResourceInputSchema,
  insertCommunityResourceSchema,
  updateCommunityResourceInputSchema,
  updateCommunityResourceSchema,
  createLawReferenceInputSchema,
  insertLawReferenceSchema,
  updateLawReferenceInputSchema,
  updateLawReferenceSchema,
} from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";

// Role-based access control for evidence
function checkEvidencePermissions(user: any, evidence: any, action: 'read' | 'write' | 'delete'): boolean {
  if (!user) return false;
  
  // Admin and supervisor can do everything
  if (user.role === 'admin' || user.role === 'supervisor') {
    return true;
  }
  
  // Check access level permissions
  const userClearanceLevel = getUserClearanceLevel(user.role);
  const evidenceClearanceRequired = getRequiredClearanceLevel(evidence.accessLevel);
  
  if (userClearanceLevel < evidenceClearanceRequired) {
    return false;
  }
  
  // For write/delete operations, user must be owner or have elevated privileges
  if (action === 'write' || action === 'delete') {
    return evidence.uploadedBy === user.id || user.role === 'supervisor' || user.role === 'admin';
  }
  
  return true;
}

function getUserClearanceLevel(role: string): number {
  switch (role) {
    case 'admin': return 3;
    case 'supervisor': return 3;
    case 'security_officer': return 2;
    case 'guard': return 1;
    default: return 0;
  }
}

function getRequiredClearanceLevel(accessLevel: string): number {
  switch (accessLevel) {
    case 'public': return 1;
    case 'restricted': return 2;
    case 'confidential': return 3;
    default: return 2;
  }
}

function filterEvidenceByPermissions(evidenceList: any[], user: any): any[] {
  return evidenceList.filter(evidence => checkEvidencePermissions(user, evidence, 'read'));
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (before auth middleware)
  app.get('/api/health', async (req, res) => {
    try {
      // Test database connection
      const testQuery = await storage.getDashboardStats();

      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          auth: 'configured',
          server: 'running'
        },
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      };

      res.json(healthStatus);
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Memory Auth setup
  // Always use memory auth for now since we're having database issues
  console.log('🔧 Setting up memory-based authentication...');
  await setupMemoryAuth(app);

  // Authentication status endpoint (handled by memoryAuth)
  app.get('/api/auth/status', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.json({ authenticated: false });
      }

      // Verify token and return user info if valid
      const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || process.env.SESSION_SECRET;
      if (!jwtSecret) {
        return res.json({ authenticated: false });
      }

      const jwt = await import('jsonwebtoken');
      const user = jwt.default.verify(token, jwtSecret);
      res.json({ authenticated: true, user });
    } catch (error) {
      console.error('❌ Auth status error:', error);
      res.json({ authenticated: false });
    }
  });

  // JWT-based login route
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      console.log('🔐 Login attempt for:', username);

      const result = await loginHandler({ username, password }, storage);

      if (result.success) {
        console.log('✅ User logged in successfully:', username);
        res.json(result);
      } else {
        console.log('❌ Login failed for:', username);
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  });



  // Logout route (JWT tokens are stateless, so this just confirms logout)
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.json({ success: true });
  });

  // Database initialization route (should be removed in production)
  app.post('/api/admin/seed-database', authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      await storage.seedDatabase();
      res.json({ message: 'Database seeded successfully' });
    } catch (error) {
      console.error('Error seeding database:', error);
      res.status(500).json({ message: 'Failed to seed database' });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Staff endpoints
  app.get("/api/staff", authenticateToken, async (req, res) => {
    try {
      const staff = await storage.getStaffMembers();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getStaffStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching staff stats:", error);
      res.status(500).json({ message: "Failed to fetch staff stats" });
    }
  });

  app.get("/api/staff/on-duty", authenticateToken, async (req, res) => {
    try {
      const staff = await storage.getOnDutyStaff();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching on-duty staff:", error);
      res.status(500).json({ message: "Failed to fetch on-duty staff" });
    }
  });

  app.get("/api/staff/schedule/today", authenticateToken, async (req, res) => {
    try {
      const schedule = await storage.getTodaysSchedule();
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching today's schedule:", error);
      res.status(500).json({ message: "Failed to fetch today's schedule" });
    }
  });

  app.get("/api/staff/dashboard-stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getStaffDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching staff dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch staff dashboard stats" });
    }
  });

  app.get("/api/staff/availability", authenticateToken, async (req, res) => {
    try {
      const availability = await storage.getStaffAvailability();
      res.json(availability);
    } catch (error) {
      console.error("Error fetching staff availability:", error);
      res.status(500).json({ message: "Failed to fetch staff availability" });
    }
  });

  // Clients endpoints
  app.get("/api/clients", authenticateToken, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getClientStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching client stats:", error);
      res.status(500).json({ message: "Failed to fetch client stats" });
    }
  });

  app.get('/api/clients/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post('/api/clients', authenticateToken, async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);

      // Log activity
      await storage.createActivity({
        userId: req.user?.id,
        activityType: "client_contact",
        entityType: "client",
        entityId: client.id,
        description: `Created new client: ${client.name}`,
      });

      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put('/api/clients/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, updates);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "client_contact",
        entityType: "client",
        entityId: id,
        description: `Updated client: ${client.name}`,
      });

      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClient(id);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "client_contact",
        entityType: "client",
        entityId: id,
        description: "Deleted client",
      });

      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Properties endpoints
  app.get("/api/properties", authenticateToken, async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getPropertyStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching property stats:", error);
      res.status(500).json({ message: "Failed to fetch property stats" });
    }
  });

  app.post('/api/properties', authenticateToken, async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(propertyData);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "patrol",
        entityType: "property",
        entityId: property.id,
        description: `Added new property: ${property.name}`,
      });

      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put('/api/properties/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(id, updates);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "patrol",
        entityType: "property",
        entityId: id,
        description: `Updated property: ${property.name}`,
      });

      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  // Incident routes
  app.get('/api/incidents', authenticateToken, async (req, res) => {
    try {
      const { recent } = req.query;
      const incidents = recent === 'true'
        ? await storage.getRecentIncidents()
        : await storage.getIncidents();
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.post('/api/incidents', authenticateToken, async (req, res) => {
    try {
      const incidentData = insertIncidentSchema.parse({
        ...req.body,
        reportedBy: req.user?.id,
        occuredAt: req.body.occuredAt || new Date(),
      });

      const incident = await storage.createIncident(incidentData);

      // Generate AI analysis if enabled
      try {
        const { aiService } = await import('./ai');
        const analysis = await aiService.analyzeIncident({
          incidentType: incident.incidentType,
          description: incident.description,
          location: incident.location || 'Unknown',
          severity: incident.severity || 'medium',
        });

        await storage.createActivity({
          userId: req.user?.id,
          activityType: "incident",
          entityType: "incident",
          entityId: incident.id,
          description: `AI Analysis: ${analysis.riskAssessment}`,
          metadata: analysis,
        });
      } catch (aiError) {
        console.warn('AI analysis failed, continuing without it:', aiError);
      }

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "incident",
        entityType: "incident",
        entityId: incident.id,
        description: `Reported new incident: ${incident.incidentType}`,
      });

      // Broadcast new incident to connected clients
      if (app.locals.broadcast) {
        app.locals.broadcast({
          type: 'incident_created',
          data: incident,
          timestamp: new Date().toISOString()
        });
      }

      res.status(201).json(incident);
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(500).json({ message: "Failed to create incident" });
    }
  });

  app.put('/api/incidents/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertIncidentSchema.partial().parse(req.body);
      const incident = await storage.updateIncident(id, updates);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "incident",
        entityType: "incident",
        entityId: id,
        description: `Updated incident: ${incident.incidentType}`,
      });

      res.json(incident);
    } catch (error) {
      console.error("Error updating incident:", error);
      res.status(500).json({ message: "Failed to update incident" });
    }
  });

  // Patrol report routes
  app.get('/api/patrol-reports', authenticateToken, async (req, res) => {
    try {
      const { today, officerId } = req.query;
      let reports;

      if (today === 'true') {
        reports = await storage.getTodaysReports();
      } else if (officerId) {
        reports = await storage.getPatrolReportsByOfficer(officerId as string);
      } else {
        reports = await storage.getPatrolReports();
      }

      res.json(reports);
    } catch (error) {
      console.error("Error fetching patrol reports:", error);
      res.status(500).json({ message: "Failed to fetch patrol reports" });
    }
  });

  app.post('/api/patrol-reports', authenticateToken, async (req, res) => {
    try {
      const reportData = insertPatrolReportSchema.parse({
        ...req.body,
        officerId: req.user?.id,
        startTime: req.body.startTime || new Date(),
      });

      const report = await storage.createPatrolReport(reportData);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "report",
        entityType: "patrol_report",
        entityId: report.id,
        description: "Created new patrol report",
      });

      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating patrol report:", error);
      res.status(500).json({ message: "Failed to create patrol report" });
    }
  });

  app.put('/api/patrol-reports/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertPatrolReportSchema.partial().parse(req.body);
      const report = await storage.updatePatrolReport(id, updates);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "report",
        entityType: "patrol_report",
        entityId: id,
        description: "Updated patrol report",
      });

      res.json(report);
    } catch (error) {
      console.error("Error updating patrol report:", error);
      res.status(500).json({ message: "Failed to update patrol report" });
    }
  });

  // Appointment routes
  app.get('/api/appointments', authenticateToken, async (req, res) => {
    try {
      const { today } = req.query;
      const appointments = today === 'true'
        ? await storage.getTodaysAppointments()
        : await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post('/api/appointments', authenticateToken, async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "client_contact",
        entityType: "appointment",
        entityId: appointment.id,
        description: `Scheduled appointment: ${appointment.title}`,
      });

      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Financial routes
  app.get('/api/financial/summary', authenticateToken, async (req, res) => {
    try {
      const summary = await storage.getFinancialSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  app.get('/api/financial/records', authenticateToken, async (req, res) => {
    try {
      const records = await storage.getFinancialRecords();
      res.json(records);
    } catch (error) {
      console.error("Error fetching financial records:", error);
      res.status(500).json({ message: "Failed to fetch financial records" });
    }
  });

  app.post('/api/financial/records', authenticateToken, async (req, res) => {
    try {
      const recordData = insertFinancialRecordSchema.parse(req.body);
      const record = await storage.createFinancialRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating financial record:", error);
      res.status(500).json({ message: "Failed to create financial record" });
    }
  });

  // Evidence routes with enhanced security
  app.get('/api/evidence', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      const { entityType, entityId, status, uploadedBy } = req.query;
      const filter = {
        ...(entityType && { entityType: entityType as string }),
        ...(entityId && { entityId: entityId as string }),
        ...(status && { status: status as string }),
        ...(uploadedBy && { uploadedBy: uploadedBy as string })
      };
      
      const evidence = await storage.getEvidence(Object.keys(filter).length > 0 ? filter : undefined);
      const filteredEvidence = filterEvidenceByPermissions(evidence, req.user);
      
      res.json(filteredEvidence);
    } catch (error) {
      console.error("Error fetching evidence:", error);
      res.status(500).json({ message: "Failed to fetch evidence" });
    }
  });

  app.get('/api/evidence/stats', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Only supervisors and admins can view evidence stats
      if (!['admin', 'supervisor'].includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions to view evidence statistics" });
      }

      const stats = await storage.getEvidenceStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching evidence stats:", error);
      res.status(500).json({ message: "Failed to fetch evidence stats" });
    }
  });

  app.get('/api/evidence/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      const evidence = await storage.getEvidenceById(req.params.id);
      if (!evidence) {
        return res.status(404).json({ message: "Evidence not found" });
      }

      // Check if user has permission to view this evidence
      if (!checkEvidencePermissions(req.user, evidence, 'read')) {
        return res.status(403).json({ message: "Insufficient permissions to access this evidence" });
      }

      res.json(evidence);
    } catch (error) {
      console.error("Error fetching evidence:", error);
      res.status(500).json({ message: "Failed to fetch evidence" });
    }
  });

  app.get('/api/evidence/entity/:entityType/:entityId', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      const { entityType, entityId } = req.params;
      const evidence = await storage.getEvidenceByEntity(entityType, entityId);
      const filteredEvidence = filterEvidenceByPermissions(evidence, req.user);
      
      res.json(filteredEvidence);
    } catch (error) {
      console.error("Error fetching evidence by entity:", error);
      res.status(500).json({ message: "Failed to fetch evidence by entity" });
    }
  });

  app.post('/api/evidence', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Validate client input with secure schema (excludes uploadedBy, status, accessLevel)
      const clientInput = createEvidenceInputSchema.parse(req.body);

      // Determine access level based on user clearance (server-side controlled)
      const userClearanceLevel = getUserClearanceLevel(req.user.role);
      let accessLevel: 'public' | 'restricted' | 'confidential';
      
      // Set access level based on user role - guards can only create public evidence
      if (userClearanceLevel >= 3) {
        accessLevel = 'confidential'; // Admin/supervisor default to confidential
      } else if (userClearanceLevel >= 2) {
        accessLevel = 'restricted'; // Security officers default to restricted
      } else {
        accessLevel = 'public'; // Guards can only create public evidence
      }

      // Create server-side validated data
      const serverData = {
        ...clientInput,
        uploadedBy: req.user.id as string, // Server-controlled
        status: 'active' as const, // Server-controlled
        accessLevel, // Server-controlled based on user clearance
      };

      const evidence = await storage.createEvidence(serverData);
      
      await storage.createActivity({
        userId: req.user.id,
        activityType: "evidence_uploaded",
        entityType: "evidence",
        entityId: evidence.id,
        description: `Uploaded evidence: ${evidence.fileName}`,
      });
      
      res.status(201).json(evidence);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid evidence data", errors: error.message });
      }
      console.error("Error creating evidence:", error);
      res.status(500).json({ message: "Failed to create evidence" });
    }
  });

  app.put('/api/evidence/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Get existing evidence first
      const existingEvidence = await storage.getEvidenceById(req.params.id);
      if (!existingEvidence) {
        return res.status(404).json({ message: "Evidence not found" });
      }

      // Check if user has permission to update this evidence
      if (!checkEvidencePermissions(req.user, existingEvidence, 'write')) {
        return res.status(403).json({ message: "Insufficient permissions to update this evidence" });
      }

      // Validate client input with restrictive schema (only safe fields: description, tags, notes)
      const clientUpdates = updateEvidenceInputSchema.parse(req.body);

      // For access level changes, require admin/supervisor and use separate route
      // This ensures access level changes are intentional and logged separately
      if (req.body.accessLevel || req.body.status) {
        return res.status(400).json({ 
          message: "Access level and status changes must be done through admin endpoints" 
        });
      }

      const evidence = await storage.updateEvidence(req.params.id, clientUpdates);
      
      await storage.createActivity({
        userId: req.user.id,
        activityType: "evidence_updated",
        entityType: "evidence",
        entityId: req.params.id,
        description: `Updated evidence metadata: ${evidence.fileName}`,
      });
      
      res.json(evidence);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid evidence data", errors: error.message });
      }
      console.error("Error updating evidence:", error);
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update evidence" });
    }
  });

  // Admin-only route for sensitive evidence operations (access level and status changes)
  app.put('/api/evidence/:id/admin', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Only admin and supervisor can perform sensitive operations
      if (!['admin', 'supervisor'].includes(req.user.role)) {
        return res.status(403).json({ message: "Admin or supervisor access required for sensitive evidence operations" });
      }

      // Get existing evidence first
      const existingEvidence = await storage.getEvidenceById(req.params.id);
      if (!existingEvidence) {
        return res.status(404).json({ message: "Evidence not found" });
      }

      const { accessLevel, status } = req.body;
      const updates: any = {};

      // Handle access level changes with transition rules
      if (accessLevel && accessLevel !== existingEvidence.accessLevel) {
        const userClearanceLevel = getUserClearanceLevel(req.user.role);
        const newClearanceRequired = getRequiredClearanceLevel(accessLevel);
        const currentClearanceRequired = getRequiredClearanceLevel(existingEvidence.accessLevel);
        
        // Check if user has clearance for new level
        if (userClearanceLevel < newClearanceRequired) {
          return res.status(403).json({ 
            message: `Insufficient clearance level to set ${accessLevel} access level` 
          });
        }

        // Prevent non-admin downgrades (confidential → restricted/public, restricted → public)
        if (req.user.role !== 'admin' && newClearanceRequired < currentClearanceRequired) {
          return res.status(403).json({ 
            message: "Only admins can downgrade evidence confidentiality levels" 
          });
        }

        updates.accessLevel = accessLevel;
      }

      // Handle status changes
      if (status && status !== existingEvidence.status) {
        updates.status = status;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid updates provided" });
      }

      const evidence = await storage.updateEvidence(req.params.id, updates);
      
      await storage.createActivity({
        userId: req.user.id,
        activityType: "evidence_admin_update",
        entityType: "evidence",
        entityId: req.params.id,
        description: `Admin updated evidence security settings: ${evidence.fileName}`,
        metadata: { changes: updates, previousAccessLevel: existingEvidence.accessLevel, previousStatus: existingEvidence.status },
      });
      
      res.json(evidence);
    } catch (error) {
      console.error("Error in admin evidence update:", error);
      res.status(500).json({ message: "Failed to perform admin evidence update" });
    }
  });

  app.delete('/api/evidence/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Get existing evidence first
      const existingEvidence = await storage.getEvidenceById(req.params.id);
      if (!existingEvidence) {
        return res.status(404).json({ message: "Evidence not found" });
      }

      // Check if user has permission to delete this evidence
      if (!checkEvidencePermissions(req.user, existingEvidence, 'delete')) {
        return res.status(403).json({ message: "Insufficient permissions to delete this evidence" });
      }

      const deleted = await storage.deleteEvidence(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Evidence not found" });
      }
      
      await storage.createActivity({
        userId: req.user.id,
        activityType: "evidence_deleted",
        entityType: "evidence",
        entityId: req.params.id,
        description: `Deleted evidence: ${existingEvidence.fileName}`,
      });
      
      res.json({ message: "Evidence deleted successfully" });
    } catch (error) {
      console.error("Error deleting evidence:", error);
      res.status(500).json({ message: "Failed to delete evidence" });
    }
  });

  // Community Resources routes
  app.get('/api/community-resources', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      const { category, city, status, priority, tags, searchTerm } = req.query;
      const filter: any = {};
      
      if (category) filter.category = category as string;
      if (city) filter.city = city as string;
      if (status) filter.status = status as string;
      if (priority) filter.priority = priority as string;
      if (tags) filter.tags = Array.isArray(tags) ? tags as string[] : [tags as string];
      if (searchTerm) filter.searchTerm = searchTerm as string;

      const resources = await storage.getCommunityResources(Object.keys(filter).length > 0 ? filter : undefined);
      res.json(resources);
    } catch (error) {
      console.error("Error fetching community resources:", error);
      res.status(500).json({ message: "Failed to fetch community resources" });
    }
  });

  app.get('/api/community-resources/stats', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      const stats = await storage.getCommunityResourceStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching community resource stats:", error);
      res.status(500).json({ message: "Failed to fetch community resource stats" });
    }
  });

  app.get('/api/community-resources/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      const { id } = req.params;
      const resource = await storage.getCommunityResourceById(id);
      
      if (!resource) {
        return res.status(404).json({ message: "Community resource not found" });
      }

      res.json(resource);
    } catch (error) {
      console.error("Error fetching community resource:", error);
      res.status(500).json({ message: "Failed to fetch community resource" });
    }
  });

  app.get('/api/community-resources/category/:category', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      const { category } = req.params;
      const resources = await storage.getCommunityResourcesByCategory(category);
      res.json(resources);
    } catch (error) {
      console.error("Error fetching community resources by category:", error);
      res.status(500).json({ message: "Failed to fetch community resources by category" });
    }
  });

  app.post('/api/community-resources', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Only admin and supervisor can create community resources
      if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
        return res.status(403).json({ message: "Insufficient permissions to create community resources" });
      }

      // Validate request body using client-safe schema
      const resourceData = createCommunityResourceInputSchema.parse(req.body);
      
      // Create resource using server schema (adds verification info if admin)
      const serverData = insertCommunityResourceSchema.parse({
        ...resourceData,
        verifiedBy: req.user.role === 'admin' ? req.user.id : undefined,
        verifiedAt: req.user.role === 'admin' ? new Date().toISOString() : undefined,
      });

      const resource = await storage.createCommunityResource(serverData);

      await storage.createActivity({
        userId: req.user.id,
        activityType: "community_resource_created",
        entityType: "community_resource",
        entityId: resource.id,
        description: `Created community resource: ${resource.name}`,
      });

      res.status(201).json(resource);
    } catch (error) {
      console.error("Error creating community resource:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", details: error.message });
      }
      res.status(500).json({ message: "Failed to create community resource" });
    }
  });

  app.put('/api/community-resources/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Only admin and supervisor can update community resources
      if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
        return res.status(403).json({ message: "Insufficient permissions to update community resources" });
      }

      const { id } = req.params;
      
      // Get existing resource
      const existingResource = await storage.getCommunityResourceById(id);
      if (!existingResource) {
        return res.status(404).json({ message: "Community resource not found" });
      }

      // Validate request body using client-safe schema
      const updates = updateCommunityResourceInputSchema.parse(req.body);
      
      // Prepare server updates (add verification info if admin)
      const serverUpdates = updateCommunityResourceSchema.parse({
        ...updates,
        verifiedBy: req.user.role === 'admin' ? req.user.id : existingResource.verifiedBy,
        verifiedAt: req.user.role === 'admin' && updates ? new Date().toISOString() : existingResource.verifiedAt,
      });

      const resource = await storage.updateCommunityResource(id, serverUpdates);

      await storage.createActivity({
        userId: req.user.id,
        activityType: "community_resource_updated",
        entityType: "community_resource", 
        entityId: id,
        description: `Updated community resource: ${resource.name}`,
        metadata: { changes: updates },
      });

      res.json(resource);
    } catch (error) {
      console.error("Error updating community resource:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", details: error.message });
      }
      res.status(500).json({ message: "Failed to update community resource" });
    }
  });

  app.delete('/api/community-resources/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Only admin can delete community resources
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin permissions required to delete community resources" });
      }

      const { id } = req.params;
      
      // Get existing resource for logging
      const existingResource = await storage.getCommunityResourceById(id);
      if (!existingResource) {
        return res.status(404).json({ message: "Community resource not found" });
      }

      const deleted = await storage.deleteCommunityResource(id);
      if (!deleted) {
        return res.status(404).json({ message: "Community resource not found" });
      }

      await storage.createActivity({
        userId: req.user.id,
        activityType: "community_resource_deleted",
        entityType: "community_resource",
        entityId: id,
        description: `Deleted community resource: ${existingResource.name}`,
      });

      res.json({ message: "Community resource deleted successfully" });
    } catch (error) {
      console.error("Error deleting community resource:", error);
      res.status(500).json({ message: "Failed to delete community resource" });
    }
  });

  // Law References endpoints
  app.get('/api/law-references', authenticateToken, async (req, res) => {
    try {
      const { 
        category, 
        subcategory, 
        jurisdiction, 
        lawType, 
        status, 
        priority, 
        relevanceToSecurity,
        searchTerm,
        keywords,
        tags,
        verified
      } = req.query;

      const filters = {
        category: category as string,
        subcategory: subcategory as string,
        jurisdiction: jurisdiction as string,
        lawType: lawType as string,
        status: status as string,
        priority: priority as string,
        relevanceToSecurity: relevanceToSecurity as string,
        searchTerm: searchTerm as string,
        keywords: keywords ? (keywords as string).split(',') : undefined,
        tags: tags ? (tags as string).split(',') : undefined,
        verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
      };

      const lawReferences = await storage.getLawReferences(filters);
      res.json(lawReferences);
    } catch (error) {
      console.error("Error fetching law references:", error);
      res.status(500).json({ message: "Failed to fetch law references" });
    }
  });

  app.get('/api/law-references/search', authenticateToken, async (req, res) => {
    try {
      const { q: query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const results = await storage.searchLawReferences(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching law references:", error);
      res.status(500).json({ message: "Failed to search law references" });
    }
  });

  app.get('/api/law-references/stats', authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getLawReferenceStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching law reference stats:", error);
      res.status(500).json({ message: "Failed to fetch law reference stats" });
    }
  });

  app.get('/api/law-references/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const lawReference = await storage.getLawReferenceById(id);
      
      if (!lawReference) {
        return res.status(404).json({ message: "Law reference not found" });
      }

      res.json(lawReference);
    } catch (error) {
      console.error("Error fetching law reference:", error);
      res.status(500).json({ message: "Failed to fetch law reference" });
    }
  });

  app.get('/api/law-references/category/:category', authenticateToken, async (req, res) => {
    try {
      const { category } = req.params;
      const { subcategory, priority, relevanceToSecurity } = req.query;
      
      const filters = {
        category,
        subcategory: subcategory as string,
        priority: priority as string,
        relevanceToSecurity: relevanceToSecurity as string,
      };

      const lawReferences = await storage.getLawReferencesByCategory(category, filters);
      res.json(lawReferences);
    } catch (error) {
      console.error("Error fetching law references by category:", error);
      res.status(500).json({ message: "Failed to fetch law references by category" });
    }
  });

  app.get('/api/law-references/:id/related', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const relatedLaws = await storage.getRelatedLawReferences(id);
      res.json(relatedLaws);
    } catch (error) {
      console.error("Error fetching related law references:", error);
      res.status(500).json({ message: "Failed to fetch related law references" });
    }
  });

  app.post('/api/law-references', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Only admin and supervisor can create law references
      if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
        return res.status(403).json({ message: "Admin or supervisor permissions required" });
      }

      const lawReferenceData = createLawReferenceInputSchema.parse(req.body);

      // Server-controlled fields
      const serverData = insertLawReferenceSchema.parse({
        ...lawReferenceData,
        verified: req.user.role === 'admin', // Only admin can create pre-verified entries
        verifiedBy: req.user.role === 'admin' ? req.user.id : undefined,
        verifiedAt: req.user.role === 'admin' ? new Date().toISOString() : undefined,
      });

      const lawReference = await storage.createLawReference(serverData);

      await storage.createActivity({
        userId: req.user.id,
        activityType: "law_reference_created",
        entityType: "law_reference",
        entityId: lawReference.id,
        description: `Created law reference: ${lawReference.title}`,
        metadata: { citation: lawReference.citation },
      });

      res.status(201).json(lawReference);
    } catch (error) {
      console.error("Error creating law reference:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", details: error.message });
      }
      res.status(500).json({ message: "Failed to create law reference" });
    }
  });

  app.put('/api/law-references/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Only admin and supervisor can update law references
      if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
        return res.status(403).json({ message: "Admin or supervisor permissions required" });
      }

      const { id } = req.params;
      
      // Get existing law reference for comparison
      const existingLawRef = await storage.getLawReferenceById(id);
      if (!existingLawRef) {
        return res.status(404).json({ message: "Law reference not found" });
      }

      const updates = updateLawReferenceInputSchema.parse(req.body);

      // Server-controlled fields - only admin can verify/unverify
      const serverUpdates = updateLawReferenceSchema.parse({
        ...updates,
        verified: req.user.role === 'admin' && updates ? true : existingLawRef.verified,
        verifiedBy: req.user.role === 'admin' ? req.user.id : existingLawRef.verifiedBy,
        verifiedAt: req.user.role === 'admin' && updates ? new Date().toISOString() : existingLawRef.verifiedAt,
      });

      const lawReference = await storage.updateLawReference(id, serverUpdates);

      await storage.createActivity({
        userId: req.user.id,
        activityType: "law_reference_updated",
        entityType: "law_reference",
        entityId: id,
        description: `Updated law reference: ${lawReference.title}`,
        metadata: { changes: updates },
      });

      res.json(lawReference);
    } catch (error) {
      console.error("Error updating law reference:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", details: error.message });
      }
      res.status(500).json({ message: "Failed to update law reference" });
    }
  });

  app.delete('/api/law-references/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Only admin can delete law references
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin permissions required to delete law references" });
      }

      const { id } = req.params;
      
      // Get existing law reference for logging
      const existingLawRef = await storage.getLawReferenceById(id);
      if (!existingLawRef) {
        return res.status(404).json({ message: "Law reference not found" });
      }

      const deleted = await storage.deleteLawReference(id);
      if (!deleted) {
        return res.status(404).json({ message: "Law reference not found" });
      }

      await storage.createActivity({
        userId: req.user.id,
        activityType: "law_reference_deleted",
        entityType: "law_reference",
        entityId: id,
        description: `Deleted law reference: ${existingLawRef.title}`,
      });

      res.json({ message: "Law reference deleted successfully" });
    } catch (error) {
      console.error("Error deleting law reference:", error);
      res.status(500).json({ message: "Failed to delete law reference" });
    }
  });

  // AI-powered crime pattern analysis
  app.get('/api/crime-patterns', authenticateToken, async (req, res) => {
    try {
      const recentIncidents = await storage.getRecentIncidents(); // Last 7 days

      if (recentIncidents.length === 0) {
        return res.json({
          patterns: [],
          hotspots: [],
          recommendations: ['Insufficient data for pattern analysis']
        });
      }

      try {
        const { aiService } = await import('./ai');
        const analysis = await aiService.analyzeCrimePatterns(
          recentIncidents.map(incident => ({
            incidentType: incident.incidentType,
            location: incident.location || 'Unknown',
            time: incident.occuredAt?.toISOString() || new Date().toISOString(),
            severity: incident.severity || 'medium'
          }))
        );

        res.json(analysis);
      } catch (aiError) {
        console.warn('AI pattern analysis failed:', aiError);
        res.json({
          patterns: ['Pattern analysis unavailable'],
          hotspots: Array.from(new Set(recentIncidents.map(i => i.location).filter(Boolean))),
          recommendations: ['Manual pattern analysis recommended']
        });
      }
    } catch (error) {
      console.error("Error analyzing crime patterns:", error);
      res.status(500).json({ message: "Failed to analyze crime patterns" });
    }
  });

  // File upload endpoint
  app.post('/api/upload', authenticateToken, async (req, res) => {
    try {
      // In a production environment, you would integrate with a file storage service
      // like AWS S3, Google Cloud Storage, or similar
      const { fileName, fileData, fileType, entityType, entityId } = req.body;

      // For now, we'll create a mock file URL
      // In production, this would upload to your storage service
      const fileUrl = `/uploads/${Date.now()}-${fileName}`;

      const fileUpload = await storage.createEvidence({
        entityType,
        entityId,
        fileName,
        fileUrl,
        fileType,
        fileSize: fileData ? fileData.length : 0,
        uploadedBy: req.user?.id as string,
      });

      res.status(201).json(fileUpload);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Community resources routes
  app.get('/api/community-resources', authenticateToken, async (req, res) => {
    try {
      const resources = await storage.getCommunityResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching community resources:", error);
      res.status(500).json({ message: "Failed to fetch community resources" });
    }
  });

  app.post('/api/community-resources', authenticateToken, async (req, res) => {
    try {
      const resource = await storage.createCommunityResource(req.body);
      res.status(201).json(resource);
    } catch (error) {
      console.error("Error creating community resource:", error);
      res.status(500).json({ message: "Failed to create community resource" });
    }
  });

  // Live crime data from Honolulu API
  app.get('/api/crime-data/live', authenticateToken, async (req, res) => {
    try {
      const { limit = 50, since } = req.query;

      // Build the API URL with proper query parameters
      const baseApiUrl = process.env.CRIME_DATA_API_URL || 'https://data.honolulu.gov/resource/vg88-5rn5.json';
      let apiUrl = `${baseApiUrl}?$limit=${limit}&$order=date DESC`;
      if (since) {
        apiUrl += `&$where=date > '${since}'`;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Honolulu API responded with ${response.status}`);
      }

      const crimeData = await response.json();

      // Transform the data to match our format
      const transformedData = crimeData.map((crime: any) => ({
        id: crime.objectid,
        incidentNumber: crime.incidentnum,
        location: crime.blockaddress,
        type: crime.type,
        date: crime.date,
        agency: crime.cmagency,
        coordinates: crime.coordinates ? {
          lat: parseFloat(crime.coordinates.latitude),
          lng: parseFloat(crime.coordinates.longitude)
        } : null
      }));

      res.json(transformedData);
    } catch (error) {
      console.error('Error fetching live crime data:', error);
      res.status(500).json({
        message: 'Failed to fetch live crime data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Crime data analytics endpoint
  app.get('/api/crime-data/analytics', authenticateToken, async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - parseInt(days as string));

      const baseApiUrl = process.env.CRIME_DATA_API_URL || 'https://data.honolulu.gov/resource/vg88-5rn5.json';
      const apiUrl = `${baseApiUrl}?$limit=1000&$where=date > '${sinceDate.toISOString()}'&$order=date DESC`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Honolulu API responded with ${response.status}`);
      }

      const crimeData = await response.json();

      // Analyze the data
      const typeCount: Record<string, number> = {};
      const locationCount: Record<string, number> = {};
      const hourCount: Record<number, number> = {};

      crimeData.forEach((crime: any) => {
        // Count by type
        typeCount[crime.type] = (typeCount[crime.type] || 0) + 1;

        // Count by general location (first part of address)
        const location = crime.blockaddress?.split(' ')[0] || 'Unknown';
        locationCount[location] = (locationCount[location] || 0) + 1;

        // Count by hour of day
        if (crime.date) {
          const hour = new Date(crime.date).getHours();
          hourCount[hour] = (hourCount[hour] || 0) + 1;
        }
      });

      res.json({
        totalIncidents: crimeData.length,
        topCrimeTypes: Object.entries(typeCount)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([type, count]) => ({ type, count })),
        topLocations: Object.entries(locationCount)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([location, count]) => ({ location, count })),
        hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          count: hourCount[hour] || 0
        }))
      });
    } catch (error) {
      console.error('Error analyzing crime data:', error);
      res.status(500).json({
        message: 'Failed to analyze crime data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Law references routes with guard card requirements
  app.get('/api/law-references', authenticateToken, async (req, res) => {
    try {
      const { search, category } = req.query;
      const laws = await storage.getLawReferences();
      res.json(laws);
    } catch (error) {
      console.error("Error fetching law references:", error);
      res.status(500).json({ message: "Failed to fetch law references" });
    }
  });

  app.post('/api/law-references', authenticateToken, async (req, res) => {
    try {
      const lawRef = await storage.createLawReference(req.body);
      res.status(201).json(lawRef);
    } catch (error) {
      console.error("Error creating law reference:", error);
      res.status(500).json({ message: "Failed to create law reference" });
    }
  });

  // User management and permissions
  app.get('/api/users', authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      const users = await storage.getStaffMembers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const userData = {
        ...req.body,
        permissions: req.body.permissions || []
      };

      const user = await storage.createUser(userData);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "admin",
        entityType: "user",
        entityId: user.id,
        description: `Created new user: ${user.email}`,
      });

      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/users/:id/permissions', authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { id } = req.params;
      const { permissions } = req.body;

      await storage.updateUserPermissions(id, permissions);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "admin",
        entityType: "user",
        entityId: id,
        description: `Updated user permissions`,
      });

      res.json({ message: 'Permissions updated successfully' });
    } catch (error) {
      console.error("Error updating user permissions:", error);
      res.status(500).json({ message: "Failed to update permissions" });
    }
  });

  // Activity feed
  app.get('/api/activities', authenticateToken, async (req, res) => {
    try {
      const { limit } = req.query;
      const activities = await storage.getActivities(limit ? parseInt(limit as string) : 50);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Crime Intelligence endpoints
  app.get("/api/crime-intelligence", authenticateToken, async (req, res) => {
    try {
      const crimeData = await storage.getCrimeIntelligence();
      res.json(crimeData);
    } catch (error) {
      console.error("Error fetching crime intelligence:", error);
      res.status(500).json({ message: "Failed to fetch crime intelligence" });
    }
  });

  app.get("/api/crime-intelligence/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getCrimeStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching crime stats:", error);
      res.status(500).json({ message: "Failed to fetch crime stats" });
    }
  });

  // Scheduling endpoints
  app.get("/api/schedules", authenticateToken, async (req, res) => {
    try {
      const { date } = req.query;
      const schedules = await storage.getSchedules(date as string);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.get("/api/schedules/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getScheduleStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching schedule stats:", error);
      res.status(500).json({ message: "Failed to fetch schedule stats" });
    }
  });


  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    clients.forEach(client => {
      try {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        } else {
          // Remove stale connections
          clients.delete(client);
        }
      } catch (error) {
        console.error('Error broadcasting to WebSocket client:', error);
        clients.delete(client);
      }
    });
  };

  // Make broadcast available to routes
  app.locals.broadcast = broadcast;

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    clients.add(ws);

    // Send initial connection confirmation
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'connected',
          message: process.env.WS_WELCOME_MESSAGE || 'Connected to Security CRM',
          timestamp: new Date().toISOString(),
          serverId: process.env.SERVER_ID || 'security-crm-1'
        }));
      }
    } catch (error) {
      console.error('Error sending initial WebSocket message:', error);
      clients.delete(ws);
    }

    ws.on('message', (message: Buffer) => {
      try {
        const messageStr = message.toString();
        const data = JSON.parse(messageStr);

        // Handle different message types
        if (data.type === 'subscribe') {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'subscribed',
              channel: data.channel,
              timestamp: new Date().toISOString()
            }));
          }
        } else if (data.type === 'ping') {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Invalid message format',
              timestamp: new Date().toISOString()
            }));
          }
        } catch (sendError) {
          console.error('Error sending error message:', sendError);
          clients.delete(ws);
        }
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`WebSocket client disconnected - Code: ${code}, Reason: ${reason}`);
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket connection error:', error);
      clients.delete(ws);
    });
  });

  return httpServer;
}