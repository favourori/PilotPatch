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
  findingType: text("finding_type").notNull(), // "CODE_VULNERABILITY", "SECRET_EXPOSURE", "CLOUD_SECURITY"
  affectedPackage: text("affected_package"),
  remediationSteps: text("remediation_steps"),
  
  // Enrichment fields
  applicationOwner: text("application_owner"),
  vpOwner: text("vp_owner"), // VP who owns the application
  vpPoc: text("vp_poc"), // VP Point of Contact for remediation
  githubUrl: text("github_url"),
  ticketUrl: text("ticket_url"),
  attackVector: text("attack_vector"), // "NETWORK", "ADJACENT", "LOCAL", "PHYSICAL"
  attackComplexity: text("attack_complexity"), // "LOW", "HIGH"
  privilegesRequired: text("privileges_required"), // "NONE", "LOW", "HIGH"
  userInteraction: text("user_interaction"), // "NONE", "REQUIRED"
  confidentialityImpact: text("confidentiality_impact"), // "NONE", "LOW", "HIGH"
  integrityImpact: text("integrity_impact"), // "NONE", "LOW", "HIGH"
  availabilityImpact: text("availability_impact"), // "NONE", "LOW", "HIGH"
  epssScore: text("epss_score"), // Exploit Prediction Scoring System
  knownExploits: text("known_exploits").array(),
  relatedCves: text("related_cves").array(),
  references: text("references").array(),
  complianceImpact: text("compliance_impact").array(), // ["PCI-DSS", "HIPAA", "SOC2"]
  patchAvailable: boolean("patch_available"),
  patchVersion: text("patch_version"),
  discoveryDate: timestamp("discovery_date"),
  publicationDate: timestamp("publication_date"),
  
  // Workflow & Assignment
  workflowStatus: text("workflow_status"), // "TRIAGE", "ASSIGNED", "IN_PROGRESS", "VERIFIED", "CLOSED"
  assignedTo: text("assigned_to"), // User email/ID
  assignedTeam: text("assigned_team"),
  
  // SLA Tracking
  slaDueDate: timestamp("sla_due_date"),
  slaStatus: text("sla_status"), // "ON_TRACK", "AT_RISK", "BREACHED"
  
  // Budget & Cost
  estimatedCost: integer("estimated_cost"), // in dollars
  estimatedHours: integer("estimated_hours"),
  
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
  vpOwner: text("vp_owner"), // VP who owns the asset/application
  vpPoc: text("vp_poc"), // VP Point of Contact for remediation
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

// Comments Schema - for threaded discussions on vulnerabilities
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vulnerabilityId: text("vulnerability_id").notNull(),
  author: text("author").notNull(), // User name or email
  content: text("content").notNull(),
  parentCommentId: text("parent_comment_id"), // For threaded replies
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Saved Views Schema - for custom filter combinations
export const savedViews = pgTable("saved_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  vpOwner: text("vp_owner").notNull(), // Which VP this view belongs to
  filters: jsonb("filters").notNull(), // Saved filter state
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// VP Trend History Schema - for tracking trends over time
export const vpTrendHistory = pgTable("vp_trend_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vpOwner: text("vp_owner").notNull(),
  date: timestamp("date").notNull(),
  totalVulnerabilities: integer("total_vulnerabilities").notNull(),
  criticalCount: integer("critical_count").notNull(),
  highCount: integer("high_count").notNull(),
  mediumCount: integer("medium_count").notNull(),
  lowCount: integer("low_count").notNull(),
  openCount: integer("open_count").notNull(),
  resolvedCount: integer("resolved_count").notNull(),
});

// Custom Dashboard Config Schema - for widget layouts
export const dashboardConfigs = pgTable("dashboard_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vpOwner: text("vp_owner").notNull(),
  layout: jsonb("layout").notNull(), // Widget positions and configurations
  widgets: jsonb("widgets").notNull(), // Active widgets
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertSavedViewSchema = createInsertSchema(savedViews).omit({
  id: true,
  createdAt: true,
});

export const insertVpTrendHistorySchema = createInsertSchema(vpTrendHistory).omit({
  id: true,
});

export const insertDashboardConfigSchema = createInsertSchema(dashboardConfigs).omit({
  id: true,
  updatedAt: true,
});

// Activity Log Schema - for audit trail
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // "VULNERABILITY", "ASSET", "INTEGRATION"
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(), // "CREATED", "UPDATED", "DELETED", "VIEWED", "ASSIGNED", "COMMENTED"
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  changes: jsonb("changes"), // What changed (before/after)
  metadata: jsonb("metadata"), // Additional context
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Users Schema - for team member management and RBAC
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // "ADMIN", "VP", "SECURITY_ANALYST", "ENGINEER", "VIEWER"
  vpOwner: text("vp_owner"), // If role is VP, which VP are they
  team: text("team"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notifications Schema - for alerts and digests
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // "SLA_BREACH", "NEW_CRITICAL", "ASSIGNMENT", "COMMENT_MENTION", "DIGEST"
  title: text("title").notNull(),
  message: text("message").notNull(),
  vulnerabilityId: text("vulnerability_id"), // Reference to related vulnerability
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Workflow History Schema - track status changes
export const workflowHistory = pgTable("workflow_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vulnerabilityId: text("vulnerability_id").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  changedBy: text("changed_by").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Export Jobs Schema - track report generation
export const exportJobs = pgTable("export_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "CSV", "PDF", "COMPLIANCE_REPORT"
  status: text("status").notNull(), // "PENDING", "PROCESSING", "COMPLETED", "FAILED"
  filters: jsonb("filters"),
  fileUrl: text("file_url"),
  requestedBy: text("requested_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Webhook Configs Schema - for custom integrations
export const webhookConfigs = pgTable("webhook_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: text("events").array().notNull(), // ["CRITICAL_VULN_DETECTED", "SLA_BREACH", "WORKFLOW_COMPLETE"]
  secret: text("secret"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert Schemas for new tables
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertWorkflowHistorySchema = createInsertSchema(workflowHistory).omit({
  id: true,
  createdAt: true,
});

export const insertExportJobSchema = createInsertSchema(exportJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertWebhookConfigSchema = createInsertSchema(webhookConfigs).omit({
  id: true,
  createdAt: true,
});

// Types
export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type SavedView = typeof savedViews.$inferSelect;
export type InsertSavedView = z.infer<typeof insertSavedViewSchema>;

export type VpTrendHistory = typeof vpTrendHistory.$inferSelect;
export type InsertVpTrendHistory = z.infer<typeof insertVpTrendHistorySchema>;

export type DashboardConfig = typeof dashboardConfigs.$inferSelect;
export type InsertDashboardConfig = z.infer<typeof insertDashboardConfigSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type WorkflowHistory = typeof workflowHistory.$inferSelect;
export type InsertWorkflowHistory = z.infer<typeof insertWorkflowHistorySchema>;

export type ExportJob = typeof exportJobs.$inferSelect;
export type InsertExportJob = z.infer<typeof insertExportJobSchema>;

export type WebhookConfig = typeof webhookConfigs.$inferSelect;
export type InsertWebhookConfig = z.infer<typeof insertWebhookConfigSchema>;

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

// VP Dashboard Types
export type VPDashboard = {
  vpName: string;
  vpPoc: string;
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalAssets: number;
  applications: {
    id: string;
    name: string;
    type: string;
    vulnerabilityCount: number;
    criticalVulnCount: number;
    highVulnCount: number;
  }[];
  topVulnerabilities: Vulnerability[];
  
  // Advanced Analytics
  trendData30Days?: { date: string; total: number; critical: number; high: number }[];
  trendData60Days?: { date: string; total: number; critical: number; high: number }[];
  trendData90Days?: { date: string; total: number; critical: number; high: number }[];
  
  // SLA Tracking
  slaMetrics?: {
    onTrack: number;
    atRisk: number;
    breached: number;
    overdueCount: number;
  };
  
  // Budget Impact
  budgetMetrics?: {
    totalEstimatedCost: number;
    totalEstimatedHours: number;
    averageCostPerVuln: number;
  };
  
  // Workflow Status
  workflowMetrics?: {
    triage: number;
    assigned: number;
    inProgress: number;
    verified: number;
    closed: number;
  };
  
  // Risk Heat Map Data
  riskHeatMap?: {
    assetType: string;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  }[];
  
  // Cross-VP Dependencies
  crossVpDependencies?: {
    vulnerabilityId: string;
    affectedVPs: string[];
  }[];
};
