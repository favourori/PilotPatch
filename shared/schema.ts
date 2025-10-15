import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Vulnerability Schema
export const vulnerabilities = pgTable("vulnerabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cveId: text("cve_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // "CRITICAL", "HIGH", "MEDIUM", "LOW"
  cvssScore: text("cvss_score").notNull(),
  riskScore: integer("risk_score").notNull(), // 0-100 custom risk score
  exploitability: text("exploitability").notNull(), // "ACTIVE", "POC", "THEORETICAL", "NONE"
  status: text("status").notNull(), // "OPEN", "IN_PROGRESS", "RESOLVED", "ACCEPTED"
  assetIds: text("asset_ids").array().notNull(),
  sourceIntegration: text("source_integration").notNull(), // "SNYK", "GITLEAKS", "SERVICENOW", etc
  affectedPackage: text("affected_package"),
  remediationSteps: text("remediation_steps"),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Asset Schema
export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "SERVER", "APPLICATION", "DATABASE", "ENDPOINT", "CLOUD"
  businessCriticality: text("business_criticality").notNull(), // "CRITICAL", "HIGH", "MEDIUM", "LOW"
  environment: text("environment").notNull(), // "PRODUCTION", "STAGING", "DEVELOPMENT"
  owner: text("owner"),
  ipAddress: text("ip_address"),
  vulnerabilityCount: integer("vulnerability_count").notNull().default(0),
  criticalVulnCount: integer("critical_vuln_count").notNull().default(0),
  highVulnCount: integer("high_vuln_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Integration Schema
export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // "Snyk", "ServiceNow", "Gitleaks", etc
  type: text("type").notNull(), // "VULN_SCANNER", "TICKETING", "CODE_SCANNER"
  status: text("status").notNull(), // "CONNECTED", "DISCONNECTED", "ERROR"
  apiKey: text("api_key"),
  apiUrl: text("api_url"),
  lastSyncAt: timestamp("last_sync_at"),
  syncFrequency: text("sync_frequency"), // "HOURLY", "DAILY", "WEEKLY", "MANUAL"
  config: jsonb("config"), // Additional configuration
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert Schemas
export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({
  id: true,
  detectedAt: true,
  updatedAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  vulnerabilityCount: true,
  criticalVulnCount: true,
  highVulnCount: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  lastSyncAt: true,
});

// Types
export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

// Dashboard Stats Type
export type DashboardStats = {
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  openCount: number;
  resolvedCount: number;
  totalAssets: number;
  highRiskAssets: number;
  activeIntegrations: number;
  trendData: {
    date: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }[];
};
