import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
        userId: (req.user as any).claims.sub,
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
        userId: (req.user as any).claims.sub,
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
        userId: (req.user as any).claims.sub,
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
        userId: (req.user as any).claims.sub,
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
        userId: (req.user as any).claims.sub,
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
        reportedBy: (req.user as any).claims.sub,
        occuredAt: req.body.occuredAt || new Date(),
      });
      
      const incident = await storage.createIncident(incidentData);
      
      await storage.createActivity({
        userId: (req.user as any).claims.sub,
        activityType: "incident",
        entityType: "incident",
        entityId: incident.id,
        description: `Reported new incident: ${incident.incidentType}`,
      });

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
        userId: (req.user as any).claims.sub,
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
        officerId: (req.user as any).claims.sub,
        startTime: req.body.startTime || new Date(),
      });
      
      const report = await storage.createPatrolReport(reportData);
      
      await storage.createActivity({
        userId: (req.user as any).claims.sub,
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
        userId: (req.user as any).claims.sub,
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
        userId: (req.user as any).claims.sub,
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

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('Received WebSocket message:', data);
        
        // Handle different message types
        if (data.type === 'subscribe') {
          // Subscribe to specific data feeds
          ws.send(JSON.stringify({
            type: 'subscribed',
            channel: data.channel
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    // Send initial connection confirmation
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Hawaii Security CRM'
      }));
    }
  });

  return httpServer;
}
