import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import {
  insertClientSchema,
  insertPropertySchema,
  insertIncidentSchema,
  insertPatrolReportSchema,
  insertAppointmentSchema,
  insertFinancialRecordSchema,
} from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Authentication status endpoint
  app.get('/api/auth/status', async (req: Request, res: Response) => {
    try {
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        return res.json({ authenticated: true, user: req.user });
      }
      res.json({ authenticated: false });
    } catch (error) {
      console.error('Auth status error:', error);
      res.json({ authenticated: false });
    }
  });

  // Authentication routes - Use passport for login
  app.post('/api/auth/login', (req: Request, res: Response, next) => {
    console.log('🔐 Login attempt for:', req.body.username);
    
    // Use passport.authenticate directly
    const authenticate = passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error('Authentication error:', err);
        return res.status(500).json({ success: false, error: 'Authentication failed' });
      }
      
      if (!user) {
        console.log('❌ Login failed for:', req.body.username);
        return res.status(401).json({ success: false, error: info?.message || 'Invalid credentials' });
      }
      
      // Log the user in
      req.logIn(user, (err) => {
        if (err) {
          console.error('Login session error:', err);
          return res.status(500).json({ success: false, error: 'Session error' });
        }
        
        console.log('✅ User logged in successfully:', user.username);
        res.json({ success: true, user });
      });
    });
    
    authenticate(req, res, next);
  });

  // Get current user route
  app.get('/api/auth/user', (req: Request, res: Response) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  // Database initialization route (should be removed in production)
  app.post('/api/admin/seed-database', isAuthenticated, async (req, res) => {
    try {
      if ((req.user as any).role !== 'admin') {
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
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Staff routes
  app.get('/api/staff', isAuthenticated, async (req, res) => {
    try {
      const staff = await storage.getStaffMembers();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get('/api/staff/active', isAuthenticated, async (req, res) => {
    try {
      const activeStaff = await storage.getActiveStaff();
      res.json(activeStaff);
    } catch (error) {
      console.error("Error fetching active staff:", error);
      res.status(500).json({ message: "Failed to fetch active staff" });
    }
  });

  app.patch('/api/staff/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateUserStatus(id, status);
      res.json({ message: "Staff status updated successfully" });
    } catch (error) {
      console.error("Error updating staff status:", error);
      res.status(500).json({ message: "Failed to update staff status" });
    }
  });

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);

      // Log activity
      await storage.createActivity({
        userId: (req.user as any).id,
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

  app.put('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, updates);

      await storage.createActivity({
        userId: (req.user as any).id,
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

  app.delete('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClient(id);

      await storage.createActivity({
        userId: (req.user as any).id,
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

  // Property routes
  app.get('/api/properties', isAuthenticated, async (req, res) => {
    try {
      const { clientId } = req.query;
      const properties = clientId 
        ? await storage.getPropertiesByClient(clientId as string)
        : await storage.getProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.post('/api/properties', isAuthenticated, async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(propertyData);

      await storage.createActivity({
        userId: (req.user as any).id,
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

  app.put('/api/properties/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(id, updates);

      await storage.createActivity({
        userId: (req.user as any).id,
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
  app.get('/api/incidents', isAuthenticated, async (req, res) => {
    try {
      const { recent } = req.query;
      const incidents = recent === 'true' 
        ? await storage.getRecentIncidents(24)
        : await storage.getIncidents();
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.post('/api/incidents', isAuthenticated, async (req, res) => {
    try {
      const incidentData = insertIncidentSchema.parse({
        ...req.body,
        reportedBy: (req.user as any).id,
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
          userId: (req.user as any).id,
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
        userId: (req.user as any).id,
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

  app.put('/api/incidents/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertIncidentSchema.partial().parse(req.body);
      const incident = await storage.updateIncident(id, updates);

      await storage.createActivity({
        userId: (req.user as any).id,
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
  app.get('/api/patrol-reports', isAuthenticated, async (req, res) => {
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

  app.post('/api/patrol-reports', isAuthenticated, async (req, res) => {
    try {
      const reportData = insertPatrolReportSchema.parse({
        ...req.body,
        officerId: (req.user as any).id,
        startTime: req.body.startTime || new Date(),
      });

      const report = await storage.createPatrolReport(reportData);

      await storage.createActivity({
        userId: (req.user as any).id,
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

  app.put('/api/patrol-reports/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertPatrolReportSchema.partial().parse(req.body);
      const report = await storage.updatePatrolReport(id, updates);

      await storage.createActivity({
        userId: (req.user as any).id,
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
  app.get('/api/appointments', isAuthenticated, async (req, res) => {
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

  app.post('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);

      await storage.createActivity({
        userId: (req.user as any).id,
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
  app.get('/api/financial/summary', isAuthenticated, async (req, res) => {
    try {
      const summary = await storage.getFinancialSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  app.get('/api/financial/records', isAuthenticated, async (req, res) => {
    try {
      const records = await storage.getFinancialRecords();
      res.json(records);
    } catch (error) {
      console.error("Error fetching financial records:", error);
      res.status(500).json({ message: "Failed to fetch financial records" });
    }
  });

  app.post('/api/financial/records', isAuthenticated, async (req, res) => {
    try {
      const recordData = insertFinancialRecordSchema.parse(req.body);
      const record = await storage.createFinancialRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating financial record:", error);
      res.status(500).json({ message: "Failed to create financial record" });
    }
  });

  // Evidence routes
  app.get('/api/evidence', isAuthenticated, async (req, res) => {
    try {
      const evidence = await storage.getEvidence();
      res.json(evidence);
    } catch (error) {
      console.error("Error fetching evidence:", error);
      res.status(500).json({ message: "Failed to fetch evidence" });
    }
  });

  app.post('/api/evidence', isAuthenticated, async (req, res) => {
    try {
      const evidenceData = {
        ...req.body,
        uploadedBy: (req.user as any).id,
      };
      const evidence = await storage.createEvidence(evidenceData);
      res.status(201).json(evidence);
    } catch (error) {
      console.error("Error creating evidence:", error);
      res.status(500).json({ message: "Failed to create evidence" });
    }
  });

  // AI-powered crime pattern analysis
  app.get('/api/crime-patterns', isAuthenticated, async (req, res) => {
    try {
      const recentIncidents = await storage.getRecentIncidents(168); // Last 7 days

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
  app.post('/api/upload', isAuthenticated, async (req, res) => {
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
        uploadedBy: (req.user as any).id,
      });

      res.status(201).json(fileUpload);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Community resources routes
  app.get('/api/community-resources', isAuthenticated, async (req, res) => {
    try {
      const resources = await storage.getCommunityResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching community resources:", error);
      res.status(500).json({ message: "Failed to fetch community resources" });
    }
  });

  app.post('/api/community-resources', isAuthenticated, async (req, res) => {
    try {
      const resource = await storage.createCommunityResource(req.body);
      res.status(201).json(resource);
    } catch (error) {
      console.error("Error creating community resource:", error);
      res.status(500).json({ message: "Failed to create community resource" });
    }
  });

  // Live crime data from Honolulu API
  app.get('/api/crime-data/live', isAuthenticated, async (req, res) => {
    try {
      const { limit = 50, since } = req.query;
      
      // Build the API URL with proper query parameters
      let apiUrl = `https://data.honolulu.gov/resource/vg88-5rn5.json?$limit=${limit}&$order=date DESC`;
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
  app.get('/api/crime-data/analytics', isAuthenticated, async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - parseInt(days as string));
      
      const apiUrl = `https://data.honolulu.gov/resource/vg88-5rn5.json?$limit=1000&$where=date > '${sinceDate.toISOString()}'&$order=date DESC`;
      
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
  app.get('/api/law-references', isAuthenticated, async (req, res) => {
    try {
      const { search, category } = req.query;
      const laws = await storage.getLawReferences({
        search: search as string,
        category: category as string,
      });
      res.json(laws);
    } catch (error) {
      console.error("Error fetching law references:", error);
      res.status(500).json({ message: "Failed to fetch law references" });
    }
  });

  app.post('/api/law-references', isAuthenticated, async (req, res) => {
    try {
      const lawRef = await storage.createLawReference(req.body);
      res.status(201).json(lawRef);
    } catch (error) {
      console.error("Error creating law reference:", error);
      res.status(500).json({ message: "Failed to create law reference" });
    }
  });

  // User management and permissions
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      if ((req.user as any).role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      const users = await storage.getStaffMembers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isAuthenticated, async (req, res) => {
    try {
      if ((req.user as any).role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const userData = {
        ...req.body,
        permissions: req.body.permissions || []
      };
      
      const user = await storage.createUser(userData);
      
      await storage.createActivity({
        userId: (req.user as any).id,
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

  app.put('/api/users/:id/permissions', isAuthenticated, async (req, res) => {
    try {
      if ((req.user as any).role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { id } = req.params;
      const { permissions } = req.body;
      
      await storage.updateUserPermissions(id, permissions);
      
      await storage.createActivity({
        userId: (req.user as any).id,
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
  app.get('/api/activities', isAuthenticated, async (req, res) => {
    try {
      const { limit } = req.query;
      const activities = await storage.getActivities(limit ? parseInt(limit as string) : 50);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Make broadcast available to routes
  app.locals.broadcast = broadcast;

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    clients.add(ws);

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);

        // Handle different message types
        if (data.type === 'subscribe') {
          ws.send(JSON.stringify({
            type: 'subscribed',
            channel: data.channel,
            timestamp: new Date().toISOString()
          }));
        } else if (data.type === 'ping') {
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send initial connection confirmation
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Hawaii Security CRM',
        timestamp: new Date().toISOString()
      }));
    }
  });

  return httpServer;
}