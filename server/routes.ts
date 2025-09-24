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
  createScheduleInputSchema,
  insertScheduleSchema,
  updateScheduleInputSchema,
  scheduleConflictCheckSchema,
  staffAvailabilityCheckSchema,
  applyShiftTemplateSchema,
  generateRecurringScheduleSchema,
  createCrimeIntelligenceInputSchema,
  updateCrimeIntelligenceInputSchema,
  patternAnalysisRequestSchema,
  threatAssessmentRequestSchema,
} from "@shared/schema";
import { z } from "zod";
import { WebSocketServer, WebSocket } from "ws";
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

// Mock JWT_SECRET for example purposes. In a real app, this would come from environment variables.
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';


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

// Role-based access control for crime intelligence
function checkCrimeIntelligencePermissions(user: any, crimeIntelligence: any, action: 'read' | 'write' | 'delete'): boolean {
  if (!user) return false;

  // Admin and supervisor can do everything
  if (user.role === 'admin' || user.role === 'supervisor') {
    return true;
  }

  // Check classification level permissions
  const userClearanceLevel = getUserClearanceLevel(user.role);
  const requiredClearanceLevel = getCrimeIntelligenceRequiredClearanceLevel(crimeIntelligence.classification);

  if (userClearanceLevel < requiredClearanceLevel) {
    return false;
  }

  // For write/delete operations, user must be assigned analyst or have elevated privileges
  if (action === 'write' || action === 'delete') {
    return crimeIntelligence.assignedAnalyst === user.id || 
           user.role === 'supervisor' || 
           user.role === 'admin';
  }

  // For read access, check distribution list if specified
  if (crimeIntelligence.distributionList && crimeIntelligence.distributionList.length > 0) {
    return crimeIntelligence.distributionList.includes(user.id) || 
           user.role === 'supervisor' || 
           user.role === 'admin';
  }

  return true;
}

function getCrimeIntelligenceRequiredClearanceLevel(classification: string): number {
  switch (classification) {
    case 'public': return 1;
    case 'restricted': return 2;
    case 'confidential': return 3;
    case 'secret': return 3; // Highest clearance required for secret intelligence
    default: return 2; // Default to restricted level
  }
}

function filterCrimeIntelligenceByPermissions(intelligenceList: any[], user: any): any[] {
  return intelligenceList.filter(intelligence => checkCrimeIntelligencePermissions(user, intelligence, 'read'));
}

// Filter confidential notes based on clearance level
function sanitizeCrimeIntelligenceForUser(intelligence: any, user: any): any {
  const sanitized = { ...intelligence };

  // Remove confidential notes if user doesn't have sufficient clearance
  if (intelligence.confidentialNotes && 
      getCrimeIntelligenceRequiredClearanceLevel('confidential') > getUserClearanceLevel(user.role)) {
    delete sanitized.confidentialNotes;
  }

  // Remove distribution list for non-privileged users
  if (intelligence.distributionList && 
      user.role !== 'admin' && user.role !== 'supervisor') {
    delete sanitized.distributionList;
  }

  return sanitized;
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
      res.status(500).json({
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
      // Ensure we always send JSON response
      res.setHeader('Content-Type', 'application/json');
      
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.json({ authenticated: false });
      }

      // Verify token and return user info if valid
      const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || process.env.SESSION_SECRET || 'your-super-secret-key';
      
      const jwt = await import('jsonwebtoken');
      const user = jwt.default.verify(token, jwtSecret);
      res.json({ authenticated: true, user });
    } catch (error) {
      console.error('❌ Auth status error:', error);
      res.setHeader('Content-Type', 'application/json');
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

  // Auth check endpoint with improved error handling
  app.get('/api/auth/check', async (req, res) => {
    try {
      // Ensure we always send JSON response
      res.setHeader('Content-Type', 'application/json');

      const token = req.cookies.auth_token;

      if (!token) {
        return res.status(401).json({ authenticated: false, message: 'No token provided' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await storage.getUserById(decoded.userId);

      if (!user) {
        return res.status(401).json({ authenticated: false, message: 'User not found' });
      }

      res.json({ 
        authenticated: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          role: user.role 
        } 
      });
    } catch (error) {
      console.error('Auth check error:', error);
      res.setHeader('Content-Type', 'application/json');
      res.status(401).json({ authenticated: false, message: 'Invalid token' });
    }
  });


  // Advanced Analytics endpoints
  app.get('/api/analytics/heatmap', authenticateToken, async (req, res) => {
    try {
      const { days = 30 } = req.query;

      // Mock heat map data
      const heatMapData = [
        { location: "Waikiki Beach", incidents: 45, patrolCoverage: 85, riskScore: 7.2, coordinates: { lat: 21.2793, lng: -157.8311 } },
        { location: "Downtown Honolulu", incidents: 32, patrolCoverage: 92, riskScore: 6.1, coordinates: { lat: 21.3099, lng: -157.8581 } },
        { location: "Ala Moana", incidents: 28, patrolCoverage: 78, riskScore: 5.8, coordinates: { lat: 21.2911, lng: -157.8420 } },
        { location: "Pearl Harbor", incidents: 15, patrolCoverage: 95, riskScore: 3.2, coordinates: { lat: 21.3731, lng: -157.9519 } },
        { location: "Diamond Head", incidents: 22, patrolCoverage: 70, riskScore: 4.9, coordinates: { lat: 21.2620, lng: -157.8055 } },
      ];

      res.json(heatMapData);
    } catch (error) {
      console.error("Error fetching heat map data:", error);
      res.status(500).json({ message: "Failed to fetch heat map data" });
    }
  });

  app.get('/api/analytics/performance', authenticateToken, async (req, res) => {
    try {
      const { days = 30 } = req.query;

      // Mock performance metrics
      const performanceData = [
        { officerId: "OFF001", name: "John Smith", responseTime: 7.2, incidentsHandled: 28, patrolEfficiency: 94, clientSatisfaction: 96, hoursWorked: 168, overtimeHours: 8, kpiScore: 92 },
        { officerId: "OFF002", name: "Sarah Johnson", responseTime: 8.1, incidentsHandled: 24, patrolEfficiency: 89, clientSatisfaction: 94, hoursWorked: 160, overtimeHours: 4, kpiScore: 88 },
        { officerId: "OFF003", name: "Mike Wilson", responseTime: 6.8, incidentsHandled: 31, patrolEfficiency: 96, clientSatisfaction: 98, hoursWorked: 172, overtimeHours: 12, kpiScore: 95 },
        { officerId: "OFF004", name: "Lisa Chen", responseTime: 9.2, incidentsHandled: 19, patrolEfficiency: 85, clientSatisfaction: 91, hoursWorked: 156, overtimeHours: 2, kpiScore: 84 },
      ];

      res.json(performanceData);
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });

  app.get('/api/analytics/trends', authenticateToken, async (req, res) => {
    try {
      // Mock trend analysis data
      const trendData = [
        { month: "Jan", year: 2024, incidents: 145, crimeTypes: { theft: 45, vandalism: 32, trespassing: 28, assault: 15, other: 25 }, seasonalIndex: 0.8, weatherFactor: 0.9 },
        { month: "Feb", year: 2024, incidents: 132, crimeTypes: { theft: 42, vandalism: 28, trespassing: 25, assault: 12, other: 25 }, seasonalIndex: 0.8, weatherFactor: 0.85 },
        { month: "Mar", year: 2024, incidents: 158, crimeTypes: { theft: 52, vandalism: 35, trespassing: 31, assault: 18, other: 22 }, seasonalIndex: 1.0, weatherFactor: 0.95 },
        { month: "Apr", year: 2024, incidents: 142, crimeTypes: { theft: 48, vandalism: 30, trespassing: 28, assault: 16, other: 20 }, seasonalIndex: 1.1, weatherFactor: 1.0 },
        { month: "May", year: 2024, incidents: 136, crimeTypes: { theft: 45, vandalism: 28, trespassing: 26, assault: 14, other: 23 }, seasonalIndex: 1.2, weatherFactor: 1.1 },
        { month: "Jun", year: 2024, incidents: 165, crimeTypes: { theft: 58, vandalism: 38, trespassing: 32, assault: 20, other: 17 }, seasonalIndex: 1.3, weatherFactor: 1.2 },
      ];

      res.json(trendData);
    } catch (error) {
      console.error("Error fetching trend data:", error);
      res.status(500).json({ message: "Failed to fetch trend data" });
    }
  });

  app.get('/api/analytics/cost-analysis', authenticateToken, async (req, res) => {
    try {
      // Mock cost analysis data
      const costData = [
        { category: "Patrol Operations", investment: 450000, roi: 2.3, costPerIncident: 285, savings: 125000, efficiency: 87 },
        { category: "Technology Systems", investment: 180000, roi: 3.1, costPerIncident: 115, savings: 95000, efficiency: 92 },
        { category: "Training Programs", investment: 75000, roi: 4.2, costPerIncident: 48, savings: 65000, efficiency: 95 },
        { category: "Equipment & Vehicles", investment: 320000, roi: 1.8, costPerIncident: 205, savings: 85000, efficiency: 82 },
        { category: "Personnel", investment: 1200000, roi: 2.7, costPerIncident: 765, savings: 280000, efficiency: 89 },
      ];

      res.json(costData);
    } catch (error) {
      console.error("Error fetching cost analysis:", error);
      res.status(500).json({ message: "Failed to fetch cost analysis" });
    }
  });

  // Security & Compliance endpoints
  app.get('/api/security/audit-logs', authenticateToken, async (req, res) => {
    try {
      if (!req.user || !['admin', 'supervisor'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Admin or supervisor access required' });
      }

      const { days = 7, action, search } = req.query;

      // Mock audit log data
      const auditLogs = [
        {
          id: "1",
          timestamp: new Date(),
          userId: "admin-001",
          userName: "Admin User",
          action: "LOGIN",
          resource: "Authentication System",
          details: "Successful admin login",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0...",
          riskLevel: "low",
          status: "success"
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 300000),
          userId: "off-002",
          userName: "John Smith",
          action: "EVIDENCE_ACCESS",
          resource: "Evidence ID: EV-2024-001",
          details: "Accessed confidential evidence file",
          ipAddress: "192.168.1.105",
          userAgent: "Mozilla/5.0...",
          riskLevel: "medium",
          status: "success"
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 600000),
          userId: "unknown",
          userName: "Unknown User",
          action: "LOGIN_ATTEMPT",
          resource: "Authentication System",
          details: "Failed login attempt - invalid credentials",
          ipAddress: "203.45.67.89",
          userAgent: "Bot/1.0",
          riskLevel: "high",
          status: "blocked"
        }
      ];

      // Apply filters
      let filteredLogs = auditLogs;
      if (action && action !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.action === action);
      }
      if (search) {
        filteredLogs = filteredLogs.filter(log => 
          log.details.toLowerCase().includes(search.toString().toLowerCase()) ||
          log.userName.toLowerCase().includes(search.toString().toLowerCase())
        );
      }

      res.json(filteredLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.get('/api/security/compliance-reports', authenticateToken, async (req, res) => {
    try {
      if (!req.user || !['admin', 'supervisor'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Admin or supervisor access required' });
      }

      // Mock compliance reports
      const reports = [
        {
          id: "1",
          type: "SOX Compliance",
          period: "Q4 2024",
          status: "completed",
          lastGenerated: new Date(Date.now() - 86400000),
          nextDue: new Date(Date.now() + 86400000 * 90),
          complianceScore: 94,
          findings: ["Minor documentation gaps", "All critical controls functioning"]
        },
        {
          id: "2",
          type: "GDPR Privacy Audit",
          period: "December 2024",
          status: "pending",
          lastGenerated: new Date(Date.now() - 86400000 * 30),
          nextDue: new Date(Date.now() + 86400000 * 7),
          complianceScore: 87,
          findings: ["Data retention policy needs review", "Consent management operational"]
        }
      ];

      res.json(reports);
    } catch (error) {
      console.error("Error fetching compliance reports:", error);
      res.status(500).json({ message: "Failed to fetch compliance reports" });
    }
  });

  app.get('/api/security/policies', authenticateToken, async (req, res) => {
    try {
      if (!req.user || !['admin', 'supervisor'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Admin or supervisor access required' });
      }

      // Mock security policies
      const policies = [
        {
          id: "1",
          name: "Access Control Policy",
          category: "Authentication",
          status: "active",
          lastReviewed: new Date(Date.now() - 86400000 * 30),
          nextReview: new Date(Date.now() + 86400000 * 335),
          riskLevel: "High",
          description: "Defines user access levels and authentication requirements"
        },
        {
          id: "2",
          name: "Data Encryption Standard",
          category: "Data Protection",
          status: "active",
          lastReviewed: new Date(Date.now() - 86400000 * 15),
          nextReview: new Date(Date.now() + 86400000 * 350),
          riskLevel: "Critical",
          description: "Encryption requirements for data at rest and in transit"
        }
      ];

      res.json(policies);
    } catch (error) {
      console.error("Error fetching security policies:", error);
      res.status(500).json({ message: "Failed to fetch security policies" });
    }
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
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();

      // Ensure all required fields are present with defaults
      const dashboardStats = {
        totalClients: stats.totalClients || 0,
        activeProperties: stats.activeProperties || 0,
        totalStaff: stats.totalStaff || 0,
        onDutyStaff: stats.onDutyStaff || 0,
        openIncidents: stats.openIncidents || 0,
        resolvedIncidents24h: stats.resolvedIncidents24h || 0,
        activePatrols: stats.activePatrols || 0,
        scheduledAppointments: stats.scheduledAppointments || 0,
        monthlyRevenue: stats.monthlyRevenue || 0,
        expenses: stats.expenses || 0,
        recentActivities: stats.recentActivities || [],
        systemStatus: stats.systemStatus || {
          server: 'online',
          database: 'connected',
          communications: 'active',
          gps: 'operational',
          emergency: 'ready'
        },
        emergencyAlerts: stats.emergencyAlerts || [],
        performanceMetrics: stats.performanceMetrics || {
          responseTime: 95,
          clientSatisfaction: 88,
          incidentResolution: 92,
          patrolEfficiency: 85,
          staffUtilization: 78
        }
      };

      res.json(dashboardStats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ 
        error: "Failed to fetch dashboard stats",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Insights charts data
  app.get('/api/insights/charts', authenticateToken, async (req, res) => {
    try {
      const insights = await storage.getInsightsChartsData();
      res.json(insights);
    } catch (error) {
      console.error('Failed to get insights charts data:', error);
      res.status(500).json({ error: 'Failed to get insights charts data' });
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

      const lawReferences = await storage.getLawReferencesByCategory(category);
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
        status: 'active',
        accessLevel: 'restricted',
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
      const filter = {
        status: req.query.status as string,
        threatLevel: req.query.threatLevel as string,
        priority: req.query.priority as string,
        analysisType: req.query.analysisType as string,
        classification: req.query.classification as string,
        assignedAnalyst: req.query.assignedAnalyst as string,
        searchTerm: req.query.search as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      };

      // Filter out undefined values
      const cleanFilter = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== undefined)
      );

      const allCrimeIntelligence = await storage.getCrimeIntelligence(cleanFilter);

      // Apply RBAC filtering based on user clearance and permissions
      const authorizedCrimeIntelligence = filterCrimeIntelligenceByPermissions(allCrimeIntelligence, req.user);

      // Sanitize data based on user clearance level
      const sanitizedCrimeIntelligence = authorizedCrimeIntelligence.map(intelligence => 
        sanitizeCrimeIntelligenceForUser(intelligence, req.user)
      );

      res.json(sanitizedCrimeIntelligence);
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

  app.get("/api/crime-intelligence/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const crimeIntelligence = await storage.getCrimeIntelligenceById(id);
      if (!crimeIntelligence) {
        return res.status(404).json({ message: "Crime intelligence not found" });
      }

      // Check if user has permission to read this intelligence
      if (!checkCrimeIntelligencePermissions(req.user, crimeIntelligence, 'read')) {
        return res.status(403).json({ message: "Insufficient clearance to access this intelligence" });
      }

      // Sanitize data based on user clearance level
      const sanitizedCrimeIntelligence = sanitizeCrimeIntelligenceForUser(crimeIntelligence, req.user);

      res.json(sanitizedCrimeIntelligence);
    } catch (error) {
      console.error("Error fetching crime intelligence:", error);
      res.status(500).json({ message: "Failed to fetch crime intelligence" });
    }
  });

  app.post("/api/crime-intelligence", authenticateToken, async (req, res) => {
    try {
      const validatedData = createCrimeIntelligenceInputSchema.parse(req.body);

      // Validate user can create intelligence with the specified classification level
      const userClearanceLevel = getUserClearanceLevel(req.user?.role);
      const requiredClearanceLevel = getCrimeIntelligenceRequiredClearanceLevel(validatedData.classification || 'restricted');

      if (userClearanceLevel < requiredClearanceLevel) {
        return res.status(403).json({ 
          message: `Insufficient clearance to create ${validatedData.classification || 'restricted'} intelligence` 
        });
      }

      // Set server-controlled fields
      const dataWithServerFields = {
        ...validatedData,
        assignedAnalyst: validatedData.assignedAnalyst || req.user?.id,
        classification: validatedData.classification || 'restricted', // Ensure classification is set
      };

      const crimeIntelligence = await storage.createCrimeIntelligence(dataWithServerFields);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "crime_intelligence_created",
        entityType: "crime_intelligence",
        entityId: crimeIntelligence.id,
        description: `Created crime intelligence: ${crimeIntelligence.title}`,
        metadata: { 
          caseNumber: crimeIntelligence.caseNumber,
          threatLevel: crimeIntelligence.threatLevel,
          classification: crimeIntelligence.classification
        }
      });

      // Sanitize response based on user clearance
      const sanitizedResponse = sanitizeCrimeIntelligenceForUser(crimeIntelligence, req.user);

      res.status(201).json(sanitizedResponse);
    } catch (error) {
      console.error("Error creating crime intelligence:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create crime intelligence" });
    }
  });

  app.put("/api/crime-intelligence/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = updateCrimeIntelligenceInputSchema.parse(req.body);

      // Check if user has permission to update
      const existing = await storage.getCrimeIntelligenceById(id);
      if (!existing) {
        return res.status(404).json({ message: "Crime intelligence not found" });
      }

      // Use RBAC permission system
      if (!checkCrimeIntelligencePermissions(req.user, existing, 'write')) {
        return res.status(403).json({ message: "Insufficient permissions to update this intelligence" });
      }

      // If classification is being updated, validate user has clearance for new classification
      if (updates.classification) {
        const userClearanceLevel = getUserClearanceLevel(req.user?.role);
        const requiredClearanceLevel = getCrimeIntelligenceRequiredClearanceLevel(updates.classification);

        if (userClearanceLevel < requiredClearanceLevel) {
          return res.status(403).json({ 
            message: `Insufficient clearance to set classification to ${updates.classification}` 
          });
        }
      }

      const updatedCrimeIntelligence = await storage.updateCrimeIntelligence(id, updates);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "crime_intelligence_updated",
        entityType: "crime_intelligence",
        entityId: id,
        description: `Updated crime intelligence: ${existing.title}`,
        metadata: { 
          caseNumber: existing.caseNumber,
          updatedFields: Object.keys(updates),
          classification: updatedCrimeIntelligence.classification
        }
      });

      // Sanitize response based on user clearance
      const sanitizedResponse = sanitizeCrimeIntelligenceForUser(updatedCrimeIntelligence, req.user);

      res.json(sanitizedResponse);
    } catch (error) {
      console.error("Error updating crime intelligence:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update crime intelligence" });
    }
  });

  app.delete("/api/crime-intelligence/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user has permission to delete
      const existing = await storage.getCrimeIntelligenceById(id);
      if (!existing) {
        return res.status(404).json({ message: "Crime intelligence not found" });
      }

      // Use RBAC permission system
      if (!checkCrimeIntelligencePermissions(req.user, existing, 'delete')) {
        return res.status(403).json({ message: "Insufficient permissions to delete crime intelligence" });
      }

      const success = await storage.deleteCrimeIntelligence(id);
      if (!success) {
        return res.status(404).json({ message: "Crime intelligence not found" });
      }

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "crime_intelligence_deleted",
        entityType: "crime_intelligence",
        entityId: id,
        description: `Archived crime intelligence: ${existing.title}`,
        metadata: { 
          caseNumber: existing.caseNumber,
          classification: existing.classification
        }
      });

      res.json({ message: "Crime intelligence archived successfully" });
    } catch (error) {
      console.error("Error deleting crime intelligence:", error);
      res.status(500).json({ message: "Failed to delete crime intelligence" });
    }
  });

  // Search crime intelligence
  app.get("/api/crime-intelligence/search/:query", authenticateToken, async (req, res) => {
    try {
      const { query } = req.params;
      const options = {
        analysisType: req.query.analysisType as string,
        threatLevel: req.query.threatLevel as string,
        classification: req.query.classification as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const allResults = await storage.searchCrimeIntelligence(query, options);

      // Apply RBAC filtering
      const authorizedResults = filterCrimeIntelligenceByPermissions(allResults, req.user);
      const sanitizedResults = authorizedResults.map(intelligence => 
        sanitizeCrimeIntelligenceForUser(intelligence, req.user)
      );

      res.json(sanitizedResults);
    } catch (error) {
      console.error("Error searching crime intelligence:", error);
      res.status(500).json({ message: "Failed to search crime intelligence" });
    }
  });

  // Get crime intelligence by incident
  app.get("/api/crime-intelligence/incident/:incidentId", authenticateToken, async (req, res) => {
    try {
      const { incidentId } = req.params;
      const allCrimeIntelligence = await storage.getCrimeIntelligenceByIncident(incidentId);

      // Apply RBAC filtering
      const authorizedIntelligence = filterCrimeIntelligenceByPermissions(allCrimeIntelligence, req.user);
      const sanitizedIntelligence = authorizedIntelligence.map(intelligence => 
        sanitizeCrimeIntelligenceForUser(intelligence, req.user)
      );

      res.json(sanitizedIntelligence);
    } catch (error) {
      console.error("Error fetching crime intelligence by incident:", error);
      res.status(500).json({ message: "Failed to fetch crime intelligence for incident" });
    }
  });

  // Get crime intelligence by threat level
  app.get("/api/crime-intelligence/threat/:threatLevel", authenticateToken, async (req, res) => {
    try {
      const { threatLevel } = req.params;
      const allCrimeIntelligence = await storage.getCrimeIntelligenceByThreatLevel(threatLevel);

      // Apply RBAC filtering
      const authorizedIntelligence = filterCrimeIntelligenceByPermissions(allCrimeIntelligence, req.user);
      const sanitizedIntelligence = authorizedIntelligence.map(intelligence => 
        sanitizeCrimeIntelligenceForUser(intelligence, req.user)
      );

      res.json(sanitizedIntelligence);
    } catch (error) {
      console.error("Error fetching crime intelligence by threat level:", error);
      res.status(500).json({ message: "Failed to fetch crime intelligence by threat level" });
    }
  });

  // Get crime intelligence requiring review
  app.get("/api/crime-intelligence/review/required", authenticateToken, async (req, res) => {
    try {
      const allCrimeIntelligence = await storage.getCrimeIntelligenceRequiringReview();

      // Apply RBAC filtering
      const authorizedIntelligence = filterCrimeIntelligenceByPermissions(allCrimeIntelligence, req.user);
      const sanitizedIntelligence = authorizedIntelligence.map(intelligence => 
        sanitizeCrimeIntelligenceForUser(intelligence, req.user)
      );

      res.json(sanitizedIntelligence);
    } catch (error) {
      console.error("Error fetching crime intelligence requiring review:", error);
      res.status(500).json({ message: "Failed to fetch crime intelligence requiring review" });
    }
  });

  // Pattern analysis endpoint
  app.post("/api/crime-intelligence/analyze/patterns", authenticateToken, async (req, res) => {
    try {
      const options = patternAnalysisRequestSchema.parse(req.body);
      const analysis = await storage.analyzeCrimePatterns(options);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "pattern_analysis_performed",
        entityType: "crime_intelligence",
        description: "Performed crime pattern analysis",
        metadata: { analysisOptions: options, resultCount: analysis.patterns.length }
      });

      res.json(analysis);
    } catch (error) {
      console.error("Error performing pattern analysis:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to perform pattern analysis" });
    }
  });

  // Threat assessment endpoint
  app.post("/api/crime-intelligence/assess/threat", authenticateToken, async (req, res) => {
    try {
      const params = threatAssessmentRequestSchema.parse(req.body);
      const assessment = await storage.assessThreat(params);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "threat_assessment_performed",
        entityType: "crime_intelligence",
        description: `Performed threat assessment: ${assessment.threatLevel} threat level`,
        metadata: { 
          assessmentParams: params, 
          threatLevel: assessment.threatLevel,
          confidence: assessment.confidence
        }
      });

      res.json(assessment);
    } catch (error) {
      console.error("Error performing threat assessment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to perform threat assessment" });
    }
  });

  // ===============================================
  // DATA INTEGRATION AND CORRELATION ENDPOINTS
  // ===============================================

  // External data correlation endpoint
  app.post("/api/crime-intelligence/correlate/external", authenticateToken, async (req, res) => {
    try {
      // Require supervisor+ clearance for external data integration
      const userClearanceLevel = getUserClearanceLevel(req.user?.role);
      if (userClearanceLevel < 3) {
        return res.status(403).json({ 
          message: "Insufficient clearance for external data integration operations" 
        });
      }

      const options = req.body;
      const correlation = await storage.correlateExternalCrimeData(options);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "external_data_correlation",
        entityType: "crime_intelligence",
        description: `Performed external data correlation with ${correlation.integrationSummary.totalExternalIncidents} incidents`,
        metadata: { 
          correlationSummary: correlation.integrationSummary,
          options: options
        }
      });

      res.json(correlation);
    } catch (error) {
      console.error("Error performing external data correlation:", error);
      res.status(500).json({ message: "Failed to perform external data correlation" });
    }
  });

  // Sync external data endpoint
  app.post("/api/crime-intelligence/sync/external", authenticateToken, async (req, res) => {
    try {
      // Require supervisor+ clearance for data synchronization
      const userClearanceLevel = getUserClearanceLevel(req.user?.role);
      if (userClearanceLevel < 3) {
        return res.status(403).json({ 
          message: "Insufficient clearance for external data synchronization" 
        });
      }

      const options = req.body;
      const syncResult = await storage.syncExternalData(options);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "external_data_sync",
        entityType: "crime_intelligence",
        description: `Synchronized external data: ${syncResult.processed} processed, ${syncResult.created} created`,
        metadata: { 
          syncResult: syncResult,
          options: options
        }
      });

      res.json(syncResult);
    } catch (error) {
      console.error("Error syncing external data:", error);
      res.status(500).json({ message: "Failed to sync external data" });
    }
  });

  // Get integration status endpoint
  app.get("/api/crime-intelligence/integration/status", authenticateToken, async (req, res) => {
    try {
      // Require security officer+ clearance to view integration status
      const userClearanceLevel = getUserClearanceLevel(req.user?.role);
      if (userClearanceLevel < 2) {
        return res.status(403).json({ 
          message: "Insufficient clearance to view integration status" 
        });
      }

      // Mock integration status (in production, this would show real connection status)
      const status = {
        lastSync: new Date(),
        connectionStatus: 'connected',
        dataSources: [
          {
            name: 'Honolulu Police Department',
            status: 'active',
            lastUpdate: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            recordsProcessed: 247,
            accuracy: 0.92
          }
        ],
        syncSchedule: 'Every 4 hours',
        nextScheduledSync: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        errorCount: 0,
        totalCorrelations: 89,
        highConfidenceMatches: 34
      };

      res.json(status);
    } catch (error) {
      console.error("Error fetching integration status:", error);
      res.status(500).json({ message: "Failed to fetch integration status" });
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

  app.get("/api/schedules/today", authenticateToken, async (req, res) => {
    try {
      const schedules = await storage.getTodaysSchedule();
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching today's schedules:", error);
      res.status(500).json({ message: "Failed to fetch today's schedules" });
    }
  });

  app.get('/api/schedules/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const schedule = await storage.getScheduleById(id);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });

  app.post('/api/schedules', authenticateToken, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Parse and validate request body
      const clientData = createScheduleInputSchema.parse(req.body);

      // Add server-controlled fields
      const fullScheduleData = {
        ...clientData,
        scheduledBy: req.user.id,
      };

      // Validate with full schema and ensure duration is calculated
      const validatedData = insertScheduleSchema.parse(fullScheduleData);

      // Ensure duration is calculated if not provided
      const finalScheduleData = {
        ...validatedData,
        duration: validatedData.duration || 
          Math.round((new Date(validatedData.endTime).getTime() - new Date(validatedData.startTime).getTime()) / (1000 * 60)),
        scheduledBy: req.user.id, // Ensure scheduledBy is included
      };

      const schedule = await storage.createSchedule(finalScheduleData);

      // Log activity
      await storage.createActivity({
        userId: req.user.id,
        activityType: "schedule_created",
        entityType: "schedule",
        entityId: schedule.id,
        description: `Created schedule: ${schedule.title} for ${schedule.staffId}`,
        metadata: { 
          scheduleId: schedule.id, 
          staffId: schedule.staffId,
          propertyId: schedule.propertyId,
          shiftType: schedule.shiftType,
          scheduleType: schedule.scheduleType
        }
      });

      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating schedule:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: (error as any).errors 
        });
      }
      if (error instanceof Error && error.message?.includes('conflict')) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create schedule" });
    }
  });

  app.put('/api/schedules/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      if (!req.user?.id) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Parse and validate request body
      const updates = updateScheduleInputSchema.parse(req.body);

      // Add server-controlled fields
      const fullUpdates = {
        ...updates,
        modifiedBy: req.user.id,
      };

      const schedule = await storage.updateSchedule(id, fullUpdates);

      await storage.createActivity({
        userId: req.user.id,
        activityType: "schedule_updated",
        entityType: "schedule",
        entityId: id,
        description: `Updated schedule: ${schedule.title}`,
        metadata: { 
          scheduleId: id, 
          updatedFields: Object.keys(updates)
        }
      });

      res.json(schedule);
    } catch (error) {
      console.error("Error updating schedule:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: (error as any).errors 
        });
      }
      if (error instanceof Error && error.message?.includes('not found')) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      if (error instanceof Error && error.message?.includes('conflict')) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update schedule" });
    }
  });

  app.delete('/api/schedules/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSchedule(id);

      if (!success) {
        return res.status(404).json({ message: "Schedule not found" });
      }

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "schedule_deleted",
        entityType: "schedule",
        entityId: id,
        description: "Deleted schedule",
      });

      res.json({ message: "Schedule deleted successfully" });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      res.status(500).json({ message: "Failed to delete schedule" });
    }
  });

  // Schedule utility endpoints
  app.post('/api/schedules/check-conflicts', authenticateToken, async (req, res) => {
    try {
      const conflictData = scheduleConflictCheckSchema.parse(req.body);
      const conflicts = await storage.checkScheduleConflicts(
        conflictData.staffId,
        conflictData.startTime,
        conflictData.endTime,
        conflictData.excludeScheduleId
      );
      res.json({ conflicts: conflicts.length > 0, scheduleConflicts: conflicts });
    } catch (error) {
      console.error("Error checking schedule conflicts:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: (error as any).errors 
        });
      }
      res.status(500).json({ message: "Failed to check schedule conflicts" });
    }
  });

  app.post('/api/schedules/check-staff-availability', authenticateToken, async (req, res) => {
    try {
      const availabilityData = staffAvailabilityCheckSchema.parse(req.body);
      const isAvailable = await storage.checkStaffAvailability(
        availabilityData.staffId,
        availabilityData.startTime,
        availabilityData.endTime
      );
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking staff availability:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: (error as any).errors 
        });
      }
      res.status(500).json({ message: "Failed to check staff availability" });
    }
  });

  app.get('/api/schedules/staff/:staffId', authenticateToken, async (req, res) => {
    try {
      const { staffId } = req.params;
      const { startDate, endDate } = req.query;
      const schedules = await storage.getSchedulesByStaff(
        staffId, 
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching staff schedules:", error);
      res.status(500).json({ message: "Failed to fetch staff schedules" });
    }
  });

  app.get('/api/schedules/property/:propertyId', authenticateToken, async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { startDate, endDate } = req.query;
      const schedules = await storage.getSchedulesByProperty(
        propertyId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching property schedules:", error);
      res.status(500).json({ message: "Failed to fetch property schedules" });
    }
  });

  app.get('/api/schedules/analytics', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await storage.getScheduleAnalytics(
        startDate ? new Date(startDate as string) : new Date(),
        endDate ? new Date(endDate as string) : new Date()
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching schedule analytics:", error);
      res.status(500).json({ message: "Failed to fetch schedule analytics" });
    }
  });

  // Shift Template CRUD endpoints
  app.get("/api/shift-templates", authenticateToken, async (req, res) => {
    try {
      const templates = await storage.getShiftTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching shift templates:", error);
      res.status(500).json({ message: "Failed to fetch shift templates" });
    }
  });

  app.get('/api/shift-templates/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getShiftTemplateById(id);
      if (!template) {
        return res.status(404).json({ message: "Shift template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching shift template:", error);
      res.status(500).json({ message: "Failed to fetch shift template" });
    }
  });

  app.post('/api/shift-templates', authenticateToken, async (req, res) => {
    try {
      const templateData = createShiftTemplateInputSchema.parse(req.body);
      const template = await storage.createShiftTemplate(templateData);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "template_created",
        entityType: "shift_template",
        entityId: template.id,
        description: `Created shift template: ${template.name}`,
      });

      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating shift template:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: (error as any).errors 
        });
      }
      res.status(500).json({ message: "Failed to create shift template" });
    }
  });

  app.put('/api/shift-templates/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = updateShiftTemplateInputSchema.parse(req.body);
      const template = await storage.updateShiftTemplate(id, updates);

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "template_updated",
        entityType: "shift_template",
        entityId: id,
        description: `Updated shift template: ${template.name}`,
      });

      res.json(template);
    } catch (error) {
      console.error("Error updating shift template:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: (error as any).errors 
        });
      }
      if (error instanceof Error && error.message?.includes('not found')) {
        return res.status(404).json({ message: "Shift template not found" });
      }
      res.status(500).json({ message: "Failed to update shift template" });
    }
  });

  app.delete('/api/shift-templates/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteShiftTemplate(id);

      if (!success) {
        return res.status(404).json({ message: "Shift template not found" });
      }

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "template_deleted",
        entityType: "shift_template",
        entityId: id,
        description: "Deleted shift template",
      });

      res.json({ message: "Shift template deleted successfully" });
    } catch (error) {
      console.error("Error deleting shift template:", error);
      res.status(500).json({ message: "Failed to delete shift template" });
    }
  });

  // Apply shift template to create schedules
  app.post('/api/shift-templates/:id/apply', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const applicationData = applyShiftTemplateSchema.parse({
        ...req.body,
        templateId: id
      });

      const schedules = await storage.applyShiftTemplate(
        applicationData.templateId,
        applicationData.startDate,
        applicationData.endDate,
        applicationData.staffId
      );

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "template_applied",
        entityType: "shift_template",
        entityId: id,
        description: `Applied shift template to create ${schedules.length} schedules`,
        metadata: {
          templateId: id,
          staffId: applicationData.staffId,
          schedulesCreated: schedules.length
        }
      });

      res.json({ 
        message: `Successfully created ${schedules.length} schedules from template`,
        schedules 
      });
    } catch (error) {
      console.error("Error applying shift template:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: (error as any).errors 
        });
      }
      if (error instanceof Error && error.message?.includes('not found')) {
        return res.status(404).json({ message: "Shift template not found" });
      }
      res.status(500).json({ message: "Failed to apply shift template" });
    }
  });


  // Real-time operations endpoints
  app.get('/api/incidents/live', authenticateToken, async (req, res) => {
    try {
      // Mock live incidents data
      const liveIncidents = [
        {
          id: "live-001",
          type: "Theft",
          description: "Reported vehicle break-in at parking structure level 3",
          location: "Ala Moana Center Parking",
          coordinates: { lat: 21.2911, lng: -157.8420 },
          severity: "medium",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          reportedBy: "Security Camera AI",
          status: "active",
          assignedOfficer: "Officer Johnson",
          estimatedResponseTime: 8
        },
        {
          id: "live-002",
          type: "Trespassing",
          description: "Unauthorized person detected on property after hours",
          location: "Diamond Head Property",
          coordinates: { lat: 21.2620, lng: -157.8055 },
          severity: "high",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          reportedBy: "Motion Sensor",
          status: "investigating",
          assignedOfficer: "Officer Chen",
          estimatedResponseTime: 5
        }
      ];
      res.json(liveIncidents);
    } catch (error) {
      console.error("Error fetching live incidents:", error);
      res.status(500).json({ message: "Failed to fetch live incidents" });
    }
  });

  app.get('/api/officers/locations', authenticateToken, async (req, res) => {
    try {
      // Mock officer location data
      const officerLocations = [
        {
          id: "off-001",
          name: "Officer Smith",
          coordinates: { lat: 21.3099, lng: -157.8581 },
          status: "on_patrol",
          lastUpdate: new Date(Date.now() - 60000).toISOString(),
          currentProperty: "Downtown Business District",
          speed: 25,
          heading: 45,
          batteryLevel: 87,
          signalStrength: 4
        },
        {
          id: "off-002",
          name: "Officer Johnson",
          coordinates: { lat: 21.2911, lng: -157.8420 },
          status: "responding",
          lastUpdate: new Date(Date.now() - 30000).toISOString(),
          currentProperty: "Ala Moana Center",
          speed: 0,
          heading: 180,
          batteryLevel: 92,
          signalStrength: 5
        }
      ];
      res.json(officerLocations);
    } catch (error) {
      console.error("Error fetching officer locations:", error);
      res.status(500).json({ message: "Failed to fetch officer locations" });
    }
  });

  app.get('/api/voice-reports', authenticateToken, async (req, res) => {
    try {
      // Mock voice reports data
      const voiceReports = [
        {
          id: "voice-001",
          audioUrl: "/audio/report-001.wav",
          transcript: "Patrol report for Waikiki Beach area. Everything appears normal. No incidents to report. Continuing routine patrol.",
          confidence: 0.94,
          duration: 15,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          officerId: "off-001",
          status: "completed"
        },
        {
          id: "voice-002",
          audioUrl: "/audio/report-002.wav",
          transcript: "Investigating suspicious activity near parking structure. Individual appears to be checking car door handles. Requesting backup.",
          confidence: 0.87,
          duration: 23,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          officerId: "off-002",
          incidentId: "live-001",
          status: "completed"
        }
      ];
      res.json(voiceReports);
    } catch (error) {
      console.error("Error fetching voice reports:", error);
      res.status(500).json({ message: "Failed to fetch voice reports" });
    }
  });

  app.post('/api/voice-reports', authenticateToken, async (req, res) => {
    try {
      // In production, this would process the audio file and transcribe it
      const { timestamp } = req.body;
      const voiceReport = {
        id: `voice-${Date.now()}`,
        timestamp,
        officerId: req.user?.id,
        status: "transcribing"
      };
      res.status(201).json(voiceReport);
    } catch (error) {
      console.error("Error creating voice report:", error);
      res.status(500).json({ message: "Failed to create voice report" });
    }
  });

  app.get('/api/photo-evidence', authenticateToken, async (req, res) => {
    try {
      // Mock photo evidence data
      const photoEvidence = [
        {
          id: "photo-001",
          imageUrl: "/evidence/photo-001.jpg",
          thumbnail: "/evidence/thumb-001.jpg",
          coordinates: { lat: 21.2911, lng: -157.8420 },
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          officerId: "off-001",
          incidentId: "live-001",
          description: "Vehicle with broken window - evidence of break-in",
          uploadStatus: "completed"
        },
        {
          id: "photo-002",
          imageUrl: "/evidence/photo-002.jpg",
          thumbnail: "/evidence/thumb-002.jpg",
          coordinates: { lat: 21.2620, lng: -157.8055 },
          timestamp: new Date(Date.now() - 600000).toISOString(),
          officerId: "off-002",
          description: "Suspicious individual near property entrance",
          uploadStatus: "completed"
        }
      ];
      res.json(photoEvidence);
    } catch (error) {
      console.error("Error fetching photo evidence:", error);
      res.status(500).json({ message: "Failed to fetch photo evidence" });
    }
  });

  app.post('/api/photo-evidence', authenticateToken, async (req, res) => {
    try {
      // In production, this would save the photo and extract GPS data
      const { coordinates, timestamp } = req.body;
      const photoEvidence = {
        id: `photo-${Date.now()}`,
        coordinates: JSON.parse(coordinates),
        timestamp,
        officerId: req.user?.id,
        uploadStatus: "uploading"
      };
      res.status(201).json(photoEvidence);
    } catch (error) {
      console.error("Error creating photo evidence:", error);
      res.status(500).json({ message: "Failed to create photo evidence" });
    }
  });

  // AI automation endpoints
  app.get('/api/ai/predictive-analytics', authenticateToken, async (req, res) => {
    try {
      const { days = 7 } = req.query;
      // Mock predictive analytics data
      const analytics = [
        {
          id: "pred-001",
          type: "crime_pattern",
          title: "Vehicle Break-in Pattern Detected",
          confidence: 87,
          impact: "high",
          timeframe: "Next 48 hours",
          location: "Downtown Parking District",
          findings: [
            "Increased incidents during lunch hours (11AM-2PM)",
            "Targeting vehicles with visible electronics",
            "Pattern consistent with previous holiday periods"
          ],
          recommendations: [
            "Increase patrol frequency in identified hotspots",
            "Deploy undercover units during peak times",
            "Issue public awareness alerts about vehicle security"
          ],
          generatedAt: new Date().toISOString(),
          status: "monitoring"
        }
      ];
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching predictive analytics:", error);
      res.status(500).json({ message: "Failed to fetch predictive analytics" });
    }
  });

  app.get('/api/ai/smart-alerts', authenticateToken, async (req, res) => {
    try {
      // Mock smart alerts data
      const alerts = [
        {
          id: "alert-001",
          type: "anomaly_detected",
          title: "Unusual Activity Pattern",
          description: "AI detected 40% increase in trespassing incidents at Waikiki Beach area compared to historical average",
          severity: "warning",
          confidence: 82,
          location: "Waikiki Beach",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          aiModel: "Pattern Recognition v2.1",
          actionRequired: true,
          relatedIncidents: ["INC-2024-0891", "INC-2024-0892"]
        }
      ];
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching smart alerts:", error);
      res.status(500).json({ message: "Failed to fetch smart alerts" });
    }
  });

  app.get('/api/ai/automated-schedules', authenticateToken, async (req, res) => {
    try {
      // Mock automated schedules data
      const schedules = [
        {
          id: "sched-001",
          title: "Optimized Weekend Patrol Schedule",
          type: "patrol_optimization",
          scheduleDate: "2024-02-03",
          optimizationScore: 94,
          staffEfficiency: 87,
          coverageImprovement: 23,
          costSavings: 1250,
          generatedBy: "ai_scheduler",
          status: "proposed",
          affectedStaff: 12,
          affectedProperties: 8
        }
      ];
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching automated schedules:", error);
      res.status(500).json({ message: "Failed to fetch automated schedules" });
    }
  });

  app.get('/api/ai/risk-assessments', authenticateToken, async (req, res) => {
    try {
      // Mock risk assessments data
      const assessments = [
        {
          propertyId: "prop-001",
          propertyName: "Waikiki Beach Resort",
          currentRiskScore: 7.2,
          previousRiskScore: 6.8,
          riskTrend: "increasing",
          riskFactors: [
            { factor: "High foot traffic", impact: 0.8, confidence: 92 },
            { factor: "Recent incidents", impact: 0.6, confidence: 87 },
            { factor: "Limited lighting", impact: 0.4, confidence: 78 }
          ],
          lastUpdated: new Date(Date.now() - 7200000).toISOString(),
          nextAssessment: new Date(Date.now() + 86400000).toISOString(),
          recommendedActions: [
            "Increase evening patrol frequency",
            "Install additional lighting",
            "Review security camera coverage"
          ]
        }
      ];
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching risk assessments:", error);
      res.status(500).json({ message: "Failed to fetch risk assessments" });
    }
  });

  // Generate recurring schedules endpoint
  app.post('/api/shift-templates/:id/apply', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const applicationData = applyShiftTemplateSchema.parse({
        ...req.body,
        templateId: id
      });

      const schedules = await storage.applyShiftTemplate(
        applicationData.templateId,
        applicationData.startDate,
        applicationData.endDate,
        applicationData.staffId
      );

      await storage.createActivity({
        userId: req.user?.id,
        activityType: "template_applied",
        entityType: "shift_template",
        entityId: id,
        description: `Applied shift template to create ${schedules.length} schedules`,
        metadata: {
          templateId: id,
          staffId: applicationData.staffId,
          schedulesCreated: schedules.length
        }
      });

      res.json({ 
        message: `Successfully created ${schedules.length} schedules from template`,
        schedules 
      });
    } catch (error) {
      console.error("Error applying shift template:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: (error as any).errors 
        });
      }
      if (error instanceof Error && error.message?.includes('not found')) {
        return res.status(404).json({ message: "Shift template not found" });
      }
      res.status(500).json({ message: "Failed to apply shift template" });
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