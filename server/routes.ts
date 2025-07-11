import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProjectSchema, insertConventionSchema, insertPartnerSchema, insertProjectPartnerSchema, insertConventionProjectSchema, insertFinancialAdvanceSchema, insertLocalUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Local Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.validateLocalUser(username, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session
      (req as any).session.localUser = user;
      
      res.json({ message: "Login successful", user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for local user session first
      if (req.session?.localUser) {
        return res.json(req.session.localUser);
      }
      
      // Check for Replit Auth
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }
      
      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Custom authentication middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    // Check for local user session
    if (req.session?.localUser) {
      return next();
    }
    
    // Check for Replit Auth
    if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
      return next();
    }
    
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Project routes
  app.get('/api/projects', requireAuth, async (req, res) => {
    try {
      const { search, sortBy, sortOrder } = req.query;
      const projects = await storage.getProjects(
        search as string,
        sortBy as string,
        sortOrder as "asc" | "desc"
      );
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', requireAuth, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, projectData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Convention routes
  app.get('/api/conventions', requireAuth, async (req, res) => {
    try {
      const conventions = await storage.getConventions();
      res.json(conventions);
    } catch (error) {
      console.error("Error fetching conventions:", error);
      res.status(500).json({ message: "Failed to fetch conventions" });
    }
  });

  app.get('/api/conventions/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const convention = await storage.getConvention(id);
      if (!convention) {
        return res.status(404).json({ message: "Convention not found" });
      }
      res.json(convention);
    } catch (error) {
      console.error("Error fetching convention:", error);
      res.status(500).json({ message: "Failed to fetch convention" });
    }
  });

  app.post('/api/conventions', requireAuth, async (req, res) => {
    try {
      const conventionData = insertConventionSchema.parse(req.body);
      const convention = await storage.createConvention(conventionData);
      res.status(201).json(convention);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid convention data", errors: error.errors });
      }
      console.error("Error creating convention:", error);
      res.status(500).json({ message: "Failed to create convention" });
    }
  });

  app.put('/api/conventions/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conventionData = insertConventionSchema.partial().parse(req.body);
      const convention = await storage.updateConvention(id, conventionData);
      res.json(convention);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid convention data", errors: error.errors });
      }
      console.error("Error updating convention:", error);
      res.status(500).json({ message: "Failed to update convention" });
    }
  });

  app.delete('/api/conventions/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteConvention(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting convention:", error);
      res.status(500).json({ message: "Failed to delete convention" });
    }
  });

  // Partner routes
  app.get('/api/partners', requireAuth, async (req, res) => {
    try {
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  app.post('/api/partners', requireAuth, async (req, res) => {
    try {
      const partnerData = insertPartnerSchema.parse(req.body);
      const partner = await storage.createPartner(partnerData);
      res.status(201).json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid partner data", errors: error.errors });
      }
      console.error("Error creating partner:", error);
      res.status(500).json({ message: "Failed to create partner" });
    }
  });

  // Project Partner routes
  app.get('/api/projects/:id/partners', requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const partners = await storage.getProjectPartners(projectId);
      res.json(partners);
    } catch (error) {
      console.error("Error fetching project partners:", error);
      res.status(500).json({ message: "Failed to fetch project partners" });
    }
  });

  app.post('/api/projects/:id/partners', requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const partnerData = insertProjectPartnerSchema.parse({ ...req.body, projectId });
      const projectPartner = await storage.createProjectPartner(partnerData);
      res.status(201).json(projectPartner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project partner data", errors: error.errors });
      }
      console.error("Error creating project partner:", error);
      res.status(500).json({ message: "Failed to create project partner" });
    }
  });

  // Convention Project routes
  app.get('/api/conventions/:id/projects', requireAuth, async (req, res) => {
    try {
      const conventionId = parseInt(req.params.id);
      const projects = await storage.getConventionProjects(conventionId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching convention projects:", error);
      res.status(500).json({ message: "Failed to fetch convention projects" });
    }
  });

  app.post('/api/conventions/:id/projects', requireAuth, async (req, res) => {
    try {
      const conventionId = parseInt(req.params.id);
      const projectData = insertConventionProjectSchema.parse({ ...req.body, conventionId });
      const conventionProject = await storage.createConventionProject(projectData);
      res.status(201).json(conventionProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid convention project data", errors: error.errors });
      }
      console.error("Error linking project to convention:", error);
      res.status(500).json({ message: "Failed to link project to convention" });
    }
  });

  // Financial Advance routes
  app.get('/api/projects/:id/financial-advances', requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const advances = await storage.getFinancialAdvances(projectId);
      res.json(advances);
    } catch (error) {
      console.error("Error fetching financial advances:", error);
      res.status(500).json({ message: "Failed to fetch financial advances" });
    }
  });

  app.post('/api/projects/:id/financial-advances', requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const advanceData = insertFinancialAdvanceSchema.parse({ ...req.body, projectId });
      const advance = await storage.createFinancialAdvance(advanceData);
      res.status(201).json(advance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid financial advance data", errors: error.errors });
      }
      console.error("Error creating financial advance:", error);
      res.status(500).json({ message: "Failed to create financial advance" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
