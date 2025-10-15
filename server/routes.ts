import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVulnerabilitySchema, insertAssetSchema, insertIntegrationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Vulnerabilities
  app.get("/api/vulnerabilities", async (_req, res) => {
    try {
      const vulnerabilities = await storage.getVulnerabilities();
      res.json(vulnerabilities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vulnerabilities" });
    }
  });

  app.get("/api/vulnerabilities/:id", async (req, res) => {
    try {
      const vulnerability = await storage.getVulnerability(req.params.id);
      if (!vulnerability) {
        return res.status(404).json({ error: "Vulnerability not found" });
      }
      res.json(vulnerability);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vulnerability" });
    }
  });

  app.post("/api/vulnerabilities", async (req, res) => {
    try {
      const validatedData = insertVulnerabilitySchema.parse(req.body);
      const vulnerability = await storage.createVulnerability(validatedData);
      res.status(201).json(vulnerability);
    } catch (error) {
      res.status(400).json({ error: "Invalid vulnerability data" });
    }
  });

  app.patch("/api/vulnerabilities/:id", async (req, res) => {
    try {
      const vulnerability = await storage.updateVulnerability(req.params.id, req.body);
      if (!vulnerability) {
        return res.status(404).json({ error: "Vulnerability not found" });
      }
      res.json(vulnerability);
    } catch (error) {
      res.status(500).json({ error: "Failed to update vulnerability" });
    }
  });

  // Assets
  app.get("/api/assets", async (_req, res) => {
    try {
      const assets = await storage.getAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  app.get("/api/assets/:id", async (req, res) => {
    try {
      const asset = await storage.getAsset(req.params.id);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch asset" });
    }
  });

  app.post("/api/assets", async (req, res) => {
    try {
      const validatedData = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      res.status(400).json({ error: "Invalid asset data" });
    }
  });

  // Integrations
  app.get("/api/integrations", async (_req, res) => {
    try {
      const integrations = await storage.getIntegrations();
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.get("/api/integrations/:id", async (req, res) => {
    try {
      const integration = await storage.getIntegration(req.params.id);
      if (!integration) {
        return res.status(404).json({ error: "Integration not found" });
      }
      res.json(integration);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch integration" });
    }
  });

  app.post("/api/integrations", async (req, res) => {
    try {
      const validatedData = insertIntegrationSchema.parse(req.body);
      const integration = await storage.createIntegration(validatedData);
      res.status(201).json(integration);
    } catch (error) {
      res.status(400).json({ error: "Invalid integration data" });
    }
  });

  app.post("/api/integrations/:id/sync", async (req, res) => {
    try {
      await storage.updateIntegrationSync(req.params.id);
      res.json({ message: "Sync initiated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to sync integration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
