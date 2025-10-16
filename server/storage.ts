import {
  type Vulnerability,
  type InsertVulnerability,
  type Asset,
  type InsertAsset,
  type Integration,
  type InsertIntegration,
  type DashboardStats,
  type VPDashboard,
  type Comment,
  type InsertComment,
  type ActivityLog,
  type InsertActivityLog,
  type User,
  type InsertUser,
  type Notification,
  type InsertNotification,
  type WorkflowHistory,
  type InsertWorkflowHistory,
  type SavedView,
  type InsertSavedView,
  type ExportJob,
  type InsertExportJob,
  type WebhookConfig,
  type InsertWebhookConfig,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Vulnerabilities
  getVulnerabilities(): Promise<Vulnerability[]>;
  getVulnerability(id: string): Promise<Vulnerability | undefined>;
  createVulnerability(vuln: InsertVulnerability): Promise<Vulnerability>;
  updateVulnerability(id: string, vuln: Partial<Vulnerability>): Promise<Vulnerability | undefined>;
  
  // Assets
  getAssets(): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAssetVulnCounts(assetId: string, critical: number, high: number, total: number): Promise<void>;
  
  // Integrations
  getIntegrations(): Promise<Integration[]>;
  getIntegration(id: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegrationSync(id: string): Promise<void>;
  
  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
  
  // VP Dashboard
  getVPList(): Promise<{ vpName: string; vpPoc: string }[]>;
  getVPDashboard(vpOwner: string): Promise<VPDashboard | undefined>;
  
  // Comments
  getComments(vulnerabilityId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Activity Logs
  getActivityLogs(entityType: string, entityId: string): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  
  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  
  // Workflow History
  getWorkflowHistory(vulnerabilityId: string): Promise<WorkflowHistory[]>;
  createWorkflowHistory(history: InsertWorkflowHistory): Promise<WorkflowHistory>;
  
  // Saved Views
  getSavedViews(vpOwner: string): Promise<SavedView[]>;
  getSavedView(id: string): Promise<SavedView | undefined>;
  createSavedView(view: InsertSavedView): Promise<SavedView>;
  updateSavedView(id: string, view: Partial<SavedView>): Promise<SavedView | undefined>;
  deleteSavedView(id: string): Promise<void>;
  
  // Export Jobs
  getExportJobs(userId: string): Promise<ExportJob[]>;
  createExportJob(job: InsertExportJob): Promise<ExportJob>;
  updateExportJob(id: string, job: Partial<ExportJob>): Promise<ExportJob | undefined>;
  
  // Webhooks
  getWebhooks(): Promise<WebhookConfig[]>;
  createWebhook(webhook: InsertWebhookConfig): Promise<WebhookConfig>;
  updateWebhook(id: string, webhook: Partial<WebhookConfig>): Promise<WebhookConfig | undefined>;
}

export class MemStorage implements IStorage {
  private vulnerabilities: Map<string, Vulnerability>;
  private assets: Map<string, Asset>;
  private integrations: Map<string, Integration>;
  private comments: Map<string, Comment>;
  private activityLogs: Map<string, ActivityLog>;
  private users: Map<string, User>;
  private notifications: Map<string, Notification>;
  private workflowHistory: Map<string, WorkflowHistory>;
  private savedViews: Map<string, SavedView>;
  private exportJobs: Map<string, ExportJob>;
  private webhooks: Map<string, WebhookConfig>;

  constructor() {
    this.vulnerabilities = new Map();
    this.assets = new Map();
    this.integrations = new Map();
    this.comments = new Map();
    this.activityLogs = new Map();
    this.users = new Map();
    this.notifications = new Map();
    this.workflowHistory = new Map();
    this.savedViews = new Map();
    this.exportJobs = new Map();
    this.webhooks = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed assets
    const assetData: InsertAsset[] = [
      {
        name: "Production API Server",
        type: "SERVER",
        businessCriticality: "CRITICAL",
        environment: "PRODUCTION",
        owner: "DevOps Team",
        vpOwner: "Sarah Chen, VP Engineering",
        vpPoc: "sarah.chen@company.com",
        ipAddress: "10.0.1.50",
      },
      {
        name: "User Authentication Service",
        type: "APPLICATION",
        businessCriticality: "CRITICAL",
        environment: "PRODUCTION",
        owner: "Security Team",
        vpOwner: "Michael Rodriguez, VP Security",
        vpPoc: "michael.rodriguez@company.com",
      },
      {
        name: "Customer Database",
        type: "DATABASE",
        businessCriticality: "CRITICAL",
        environment: "PRODUCTION",
        owner: "Database Admin",
        vpOwner: "Sarah Chen, VP Engineering",
        vpPoc: "sarah.chen@company.com",
        ipAddress: "10.0.2.100",
      },
      {
        name: "Analytics Dashboard",
        type: "APPLICATION",
        businessCriticality: "HIGH",
        environment: "PRODUCTION",
        owner: "Analytics Team",
        vpOwner: "David Park, VP Product",
        vpPoc: "david.park@company.com",
      },
      {
        name: "Development Test Server",
        type: "SERVER",
        businessCriticality: "LOW",
        environment: "DEVELOPMENT",
        owner: "Dev Team",
        vpOwner: "Sarah Chen, VP Engineering",
        vpPoc: "sarah.chen@company.com",
        ipAddress: "10.1.0.25",
      },
    ];

    assetData.forEach((asset) => {
      const id = randomUUID();
      this.assets.set(id, {
        ...asset,
        id,
        owner: asset.owner || null,
        vpOwner: asset.vpOwner || null,
        vpPoc: asset.vpPoc || null,
        ipAddress: asset.ipAddress || null,
        vulnerabilityCount: 0,
        criticalVulnCount: 0,
        highVulnCount: 0,
        createdAt: new Date(),
      });
    });

    // Seed integrations
    const integrationData: InsertIntegration[] = [
      // Code Analysis & SAST Tools
      {
        name: "Snyk",
        type: "CODE_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://api.snyk.io",
        syncFrequency: "DAILY",
        enabled: true,
      },
      {
        name: "Gitleaks",
        type: "CODE_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://github.com",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      {
        name: "SonarQube",
        type: "CODE_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://sonarcloud.io",
        syncFrequency: "DAILY",
        enabled: true,
      },
      {
        name: "Checkmarx",
        type: "CODE_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://api.checkmarx.com",
        syncFrequency: "DAILY",
        enabled: true,
      },
      {
        name: "Veracode",
        type: "CODE_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://api.veracode.com",
        syncFrequency: "WEEKLY",
        enabled: true,
      },
      {
        name: "Fortify",
        type: "CODE_SCANNER",
        status: "DISCONNECTED",
        apiUrl: "https://fortify.microfocus.com",
        enabled: false,
      },
      
      // Vulnerability Scanners
      {
        name: "Qualys",
        type: "VULN_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://qualysapi.qualys.com",
        syncFrequency: "DAILY",
        enabled: true,
      },
      {
        name: "Nessus",
        type: "VULN_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://cloud.tenable.com",
        syncFrequency: "DAILY",
        enabled: true,
      },
      {
        name: "Rapid7 InsightVM",
        type: "VULN_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://us.api.insight.rapid7.com",
        syncFrequency: "DAILY",
        enabled: true,
      },
      {
        name: "OpenVAS",
        type: "VULN_SCANNER",
        status: "DISCONNECTED",
        apiUrl: "https://openvas.org",
        enabled: false,
      },
      
      // Cloud Security Platforms
      {
        name: "Wiz",
        type: "CLOUD_SECURITY",
        status: "CONNECTED",
        apiUrl: "https://api.wiz.io",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      {
        name: "Prisma Cloud",
        type: "CLOUD_SECURITY",
        status: "CONNECTED",
        apiUrl: "https://api.prismacloud.io",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      {
        name: "Aqua Security",
        type: "CLOUD_SECURITY",
        status: "CONNECTED",
        apiUrl: "https://api.aquasec.com",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      {
        name: "Lacework",
        type: "CLOUD_SECURITY",
        status: "CONNECTED",
        apiUrl: "https://api.lacework.net",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      {
        name: "Orca Security",
        type: "CLOUD_SECURITY",
        status: "DISCONNECTED",
        apiUrl: "https://api.orca.security",
        enabled: false,
      },
      
      // Secret Scanning
      {
        name: "GitGuardian",
        type: "CODE_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://api.gitguardian.com",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      {
        name: "TruffleHog",
        type: "CODE_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://github.com",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      
      // DAST & API Security
      {
        name: "OWASP ZAP",
        type: "VULN_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://www.zaproxy.org",
        syncFrequency: "WEEKLY",
        enabled: true,
      },
      {
        name: "Burp Suite Enterprise",
        type: "VULN_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://enterprise.portswigger.net",
        syncFrequency: "WEEKLY",
        enabled: true,
      },
      {
        name: "Acunetix",
        type: "VULN_SCANNER",
        status: "DISCONNECTED",
        apiUrl: "https://acunetix.com",
        enabled: false,
      },
      {
        name: "Salt Security",
        type: "VULN_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://api.salt.security",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      {
        name: "42Crunch",
        type: "CODE_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://api.42crunch.com",
        syncFrequency: "DAILY",
        enabled: true,
      },
      
      // Container & Kubernetes Security
      {
        name: "Trivy",
        type: "CLOUD_SECURITY",
        status: "CONNECTED",
        apiUrl: "https://github.com/aquasecurity/trivy",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      {
        name: "Falco",
        type: "CLOUD_SECURITY",
        status: "CONNECTED",
        apiUrl: "https://falco.org",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      {
        name: "Sysdig",
        type: "CLOUD_SECURITY",
        status: "DISCONNECTED",
        apiUrl: "https://api.sysdigcloud.com",
        enabled: false,
      },
      
      // SIEM & Threat Detection
      {
        name: "Splunk",
        type: "CLOUD_SECURITY",
        status: "CONNECTED",
        apiUrl: "https://api.splunk.com",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      {
        name: "CrowdStrike",
        type: "CLOUD_SECURITY",
        status: "CONNECTED",
        apiUrl: "https://api.crowdstrike.com",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      {
        name: "Datadog Security",
        type: "CLOUD_SECURITY",
        status: "CONNECTED",
        apiUrl: "https://api.datadoghq.com",
        syncFrequency: "HOURLY",
        enabled: true,
      },
      
      // Compliance & GRC
      {
        name: "Vanta",
        type: "CLOUD_SECURITY",
        status: "CONNECTED",
        apiUrl: "https://api.vanta.com",
        syncFrequency: "DAILY",
        enabled: true,
      },
      {
        name: "Drata",
        type: "CLOUD_SECURITY",
        status: "CONNECTED",
        apiUrl: "https://api.drata.com",
        syncFrequency: "DAILY",
        enabled: true,
      },
      {
        name: "Secureframe",
        type: "CLOUD_SECURITY",
        status: "DISCONNECTED",
        apiUrl: "https://api.secureframe.com",
        enabled: false,
      },
      
      // Dependency Scanning
      {
        name: "Dependabot",
        type: "CODE_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://github.com",
        syncFrequency: "DAILY",
        enabled: true,
      },
      {
        name: "WhiteSource (Mend)",
        type: "CODE_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://api.mend.io",
        syncFrequency: "DAILY",
        enabled: true,
      },
      {
        name: "JFrog Xray",
        type: "CODE_SCANNER",
        status: "DISCONNECTED",
        apiUrl: "https://xray.jfrog.io",
        enabled: false,
      },
      
      // Ticketing & Workflow
      {
        name: "ServiceNow",
        type: "TICKETING",
        status: "CONNECTED",
        apiUrl: "https://dev.service-now.com",
        syncFrequency: "MANUAL",
        enabled: true,
      },
      {
        name: "Jira",
        type: "TICKETING",
        status: "CONNECTED",
        apiUrl: "https://api.atlassian.com",
        syncFrequency: "MANUAL",
        enabled: true,
      },
      {
        name: "PagerDuty",
        type: "TICKETING",
        status: "CONNECTED",
        apiUrl: "https://api.pagerduty.com",
        syncFrequency: "MANUAL",
        enabled: true,
      },
      
      // Penetration Testing
      {
        name: "Metasploit",
        type: "VULN_SCANNER",
        status: "DISCONNECTED",
        apiUrl: "https://www.metasploit.com",
        enabled: false,
      },
      {
        name: "Cobalt Strike",
        type: "VULN_SCANNER",
        status: "DISCONNECTED",
        apiUrl: "https://www.cobaltstrike.com",
        enabled: false,
      },
    ];

    integrationData.forEach((integration) => {
      const id = randomUUID();
      const lastSyncAt = integration.status === "CONNECTED" ? new Date(Date.now() - Math.random() * 3600000) : null;
      this.integrations.set(id, {
        ...integration,
        id,
        apiKey: integration.apiKey || null,
        apiUrl: integration.apiUrl || null,
        syncFrequency: integration.syncFrequency || null,
        config: integration.config || null,
        enabled: integration.enabled ?? true,
        lastSyncAt,
        createdAt: new Date(),
      });
    });

    // Seed vulnerabilities
    const assetIds = Array.from(this.assets.keys());
    const vulnerabilityData: InsertVulnerability[] = [
      {
        cveId: "CVE-2024-12345",
        title: "Critical SQL Injection in Authentication Module",
        description: "A critical SQL injection vulnerability has been discovered in the authentication module that allows attackers to bypass login mechanisms and gain unauthorized access to sensitive data.",
        severity: "CRITICAL",
        cvssScore: "9.8",
        riskScore: 95,
        exploitability: "ACTIVE",
        status: "OPEN",
        assetIds: [assetIds[0], assetIds[1]],
        sourceIntegration: "Snyk",
        findingType: "CODE_VULNERABILITY",
        affectedPackage: "auth-module@2.1.0",
        remediationSteps: "Upgrade auth-module to version 2.1.5 or later\nImplement parameterized queries\nAdd input validation and sanitization\nConduct security audit of all database queries",
        applicationOwner: "Security Team",
        vpOwner: "Sarah Chen, VP Engineering",
        vpPoc: "sarah.chen@company.com",
        githubUrl: "https://github.com/company/auth-service/issues/432",
        ticketUrl: "https://jira.company.com/browse/SEC-1234",
        attackVector: "NETWORK",
        attackComplexity: "LOW",
        privilegesRequired: "NONE",
        userInteraction: "NONE",
        confidentialityImpact: "HIGH",
        integrityImpact: "HIGH",
        availabilityImpact: "HIGH",
        epssScore: "92.3%",
        knownExploits: ["Metasploit module available", "Active exploitation in the wild"],
        relatedCves: ["CVE-2023-98765", "CVE-2024-11111"],
        references: [
          "https://nvd.nist.gov/vuln/detail/CVE-2024-12345",
          "https://owasp.org/www-community/attacks/SQL_Injection",
          "https://snyk.io/vuln/SNYK-JS-AUTHMODULE-2024123"
        ],
        complianceImpact: ["PCI-DSS 6.5.1", "HIPAA", "SOC2"],
        patchAvailable: true,
        patchVersion: "auth-module@2.1.5",
        discoveryDate: new Date("2024-01-15"),
        publicationDate: new Date("2024-02-01"),
      },
      {
        cveId: "CVE-2024-23456",
        title: "Remote Code Execution via Deserialization",
        description: "An unsafe deserialization vulnerability allows remote attackers to execute arbitrary code on the server by sending specially crafted serialized objects.",
        severity: "CRITICAL",
        cvssScore: "9.1",
        riskScore: 92,
        exploitability: "POC",
        status: "IN_PROGRESS",
        assetIds: [assetIds[0]],
        sourceIntegration: "Snyk",
        findingType: "CODE_VULNERABILITY",
        affectedPackage: "serialization-lib@1.3.2",
        remediationSteps: "Update serialization-lib to version 1.4.0\nImplement object validation before deserialization\nUse safe serialization formats like JSON",
        applicationOwner: "Platform Engineering",
        vpOwner: "Sarah Chen, VP Engineering",
        vpPoc: "sarah.chen@company.com",
        githubUrl: "https://github.com/company/api-platform/pull/887",
        ticketUrl: "https://jira.company.com/browse/SEC-1256",
        attackVector: "NETWORK",
        attackComplexity: "LOW",
        privilegesRequired: "LOW",
        userInteraction: "NONE",
        confidentialityImpact: "HIGH",
        integrityImpact: "HIGH",
        availabilityImpact: "HIGH",
        epssScore: "78.5%",
        knownExploits: ["PoC published on GitHub"],
        relatedCves: ["CVE-2024-23457"],
        references: [
          "https://nvd.nist.gov/vuln/detail/CVE-2024-23456",
          "https://owasp.org/www-community/vulnerabilities/Deserialization_of_untrusted_data",
          "https://github.com/security-research/deserialization-poc"
        ],
        complianceImpact: ["PCI-DSS", "SOC2", "ISO 27001"],
        patchAvailable: true,
        patchVersion: "serialization-lib@1.4.0",
        discoveryDate: new Date("2024-02-10"),
        publicationDate: new Date("2024-02-20"),
      },
      {
        cveId: "CVE-2024-34567",
        title: "Cross-Site Scripting (XSS) in Dashboard",
        description: "Stored XSS vulnerability in the analytics dashboard allows attackers to inject malicious JavaScript that executes in the context of other users' sessions.",
        severity: "HIGH",
        cvssScore: "7.2",
        riskScore: 78,
        exploitability: "ACTIVE",
        status: "OPEN",
        assetIds: [assetIds[3]],
        sourceIntegration: "SonarQube",
        findingType: "CODE_VULNERABILITY",
        affectedPackage: "dashboard-ui@3.2.1",
        remediationSteps: "Sanitize all user inputs\nImplement Content Security Policy (CSP)\nEscape output data properly\nUpgrade to dashboard-ui@3.2.5",
        applicationOwner: "Analytics Team",
        vpOwner: "David Park, VP Product",
        vpPoc: "david.park@company.com",
        githubUrl: "https://github.com/company/analytics-dashboard/issues/203",
        ticketUrl: "https://jira.company.com/browse/SEC-1278",
        attackVector: "NETWORK",
        attackComplexity: "LOW",
        privilegesRequired: "LOW",
        userInteraction: "REQUIRED",
        confidentialityImpact: "LOW",
        integrityImpact: "LOW",
        availabilityImpact: "NONE",
        epssScore: "65.2%",
        knownExploits: ["XSS scanner detected", "Active exploitation reported"],
        relatedCves: ["CVE-2024-34568"],
        references: [
          "https://nvd.nist.gov/vuln/detail/CVE-2024-34567",
          "https://owasp.org/www-community/attacks/xss/",
          "https://portswigger.net/web-security/cross-site-scripting/stored"
        ],
        complianceImpact: ["PCI-DSS 6.5.7", "GDPR"],
        patchAvailable: true,
        patchVersion: "dashboard-ui@3.2.5",
        discoveryDate: new Date("2024-03-05"),
        publicationDate: new Date("2024-03-15"),
      },
      {
        cveId: "CVE-2024-45678",
        title: "Insecure Direct Object Reference in API",
        description: "The API endpoint does not properly validate user permissions, allowing authenticated users to access resources belonging to other users.",
        severity: "HIGH",
        cvssScore: "8.1",
        riskScore: 82,
        exploitability: "THEORETICAL",
        status: "OPEN",
        assetIds: [assetIds[0]],
        sourceIntegration: "GitHub Security",
        findingType: "CODE_VULNERABILITY",
        affectedPackage: "api-gateway@4.1.0",
        remediationSteps: "Implement proper authorization checks\nValidate user permissions on all endpoints\nUse indirect references with access control\nUpdate api-gateway to 4.2.0",
        applicationOwner: "DevOps Team",
        vpOwner: "Sarah Chen, VP Engineering",
        vpPoc: "sarah.chen@company.com",
        githubUrl: "https://github.com/company/api-gateway/security/advisories/GHSA-xxxx-yyyy",
        ticketUrl: "https://jira.company.com/browse/SEC-1289",
        attackVector: "NETWORK",
        attackComplexity: "LOW",
        privilegesRequired: "LOW",
        userInteraction: "NONE",
        confidentialityImpact: "HIGH",
        integrityImpact: "LOW",
        availabilityImpact: "NONE",
        epssScore: "45.8%",
        knownExploits: [],
        relatedCves: ["CVE-2023-45679"],
        references: [
          "https://nvd.nist.gov/vuln/detail/CVE-2024-45678",
          "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References",
          "https://cwe.mitre.org/data/definitions/639.html"
        ],
        complianceImpact: ["PCI-DSS 7.1", "HIPAA", "GDPR Article 32"],
        patchAvailable: true,
        patchVersion: "api-gateway@4.2.0",
        discoveryDate: new Date("2024-04-01"),
        publicationDate: new Date("2024-04-12"),
      },
      {
        cveId: "CVE-2024-56789",
        title: "Sensitive Data Exposure in Logs",
        description: "Application logs contain sensitive information including API keys, passwords, and personal data that could be accessed by unauthorized users.",
        severity: "MEDIUM",
        cvssScore: "5.3",
        riskScore: 65,
        exploitability: "NONE",
        status: "ACCEPTED",
        assetIds: [assetIds[0], assetIds[1], assetIds[3]],
        sourceIntegration: "SonarQube",
        findingType: "CODE_VULNERABILITY",
        remediationSteps: "Implement log sanitization\nRemove sensitive data from logs\nRestrict log file access\nUse secure logging libraries",
        applicationOwner: "DevOps Team",
        vpOwner: "Sarah Chen, VP Engineering",
        vpPoc: "sarah.chen@company.com",
      },
      {
        cveId: "CVE-2024-67890",
        title: "Outdated Cryptographic Algorithm",
        description: "The application uses SHA-1 for password hashing, which is considered cryptographically weak and vulnerable to collision attacks.",
        severity: "MEDIUM",
        cvssScore: "6.5",
        riskScore: 58,
        exploitability: "THEORETICAL",
        status: "RESOLVED",
        assetIds: [assetIds[1]],
        sourceIntegration: "Snyk",
        findingType: "CODE_VULNERABILITY",
        affectedPackage: "crypto-utils@1.0.0",
        remediationSteps: "Migrate to bcrypt or Argon2\nRehash all existing passwords\nUpdate crypto-utils to 2.0.0",
        applicationOwner: "Security Team",
        vpOwner: "Michael Rodriguez, VP Security",
        vpPoc: "michael.rodriguez@company.com",
      },
      {
        cveId: "CVE-2024-78901",
        title: "Missing Security Headers",
        description: "The web application does not implement critical security headers such as X-Frame-Options, X-Content-Type-Options, and Strict-Transport-Security.",
        severity: "LOW",
        cvssScore: "3.7",
        riskScore: 42,
        exploitability: "NONE",
        status: "OPEN",
        assetIds: [assetIds[3]],
        sourceIntegration: "Qualys",
        findingType: "CODE_VULNERABILITY",
        remediationSteps: "Configure web server to add security headers\nImplement HSTS with long max-age\nAdd X-Frame-Options: DENY\nEnable X-Content-Type-Options: nosniff",
        applicationOwner: "Analytics Team",
        vpOwner: "David Park, VP Product",
        vpPoc: "david.park@company.com",
      },
      {
        cveId: "CVE-2024-89012",
        title: "Unvalidated Redirects and Forwards",
        description: "The application accepts user-controlled input for URL redirects without proper validation, which could be used for phishing attacks.",
        severity: "LOW",
        cvssScore: "4.3",
        riskScore: 38,
        exploitability: "POC",
        status: "OPEN",
        assetIds: [assetIds[3]],
        sourceIntegration: "SonarQube",
        findingType: "CODE_VULNERABILITY",
        remediationSteps: "Validate all redirect URLs against whitelist\nAvoid using user input for redirects\nImplement redirect confirmation page",
        applicationOwner: "Analytics Team",
        vpOwner: "David Park, VP Product",
        vpPoc: "david.park@company.com",
      },
      // SECRET EXPOSURE FINDINGS (from Gitleaks)
      {
        cveId: "GITLEAKS-2024-001",
        title: "AWS Access Key Exposed in Public Repository",
        description: "An AWS access key was discovered hardcoded in a configuration file committed to a public GitHub repository. This credential provides full access to AWS resources and has been actively used.",
        severity: "CRITICAL",
        cvssScore: "9.8",
        riskScore: 98,
        exploitability: "ACTIVE",
        status: "OPEN",
        assetIds: [assetIds[0], assetIds[2]],
        sourceIntegration: "Gitleaks",
        findingType: "SECRET_EXPOSURE",
        affectedPackage: "config/aws-credentials.json",
        remediationSteps: "Immediately revoke the exposed AWS access key\nRotate all AWS credentials\nRemove secrets from git history using BFG Repo-Cleaner\nImplement AWS Secrets Manager for credential storage\nEnable AWS CloudTrail to monitor for unauthorized access",
        applicationOwner: "DevOps Team",
        vpOwner: "Sarah Chen, VP Engineering",
        vpPoc: "sarah.chen@company.com",
        githubUrl: "https://github.com/company/infra-config/commit/a3f2c1d",
        ticketUrl: "https://jira.company.com/browse/SEC-1301",
        attackVector: "NETWORK",
        attackComplexity: "LOW",
        privilegesRequired: "NONE",
        userInteraction: "NONE",
        confidentialityImpact: "HIGH",
        integrityImpact: "HIGH",
        availabilityImpact: "HIGH",
        epssScore: "95.7%",
        knownExploits: ["Publicly accessible on GitHub"],
        relatedCves: [],
        references: [
          "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository",
          "https://aws.amazon.com/blogs/security/how-to-delete-your-data-in-aws-secret-manager/",
          "https://github.com/gitleaks/gitleaks"
        ],
        complianceImpact: ["PCI-DSS 3.4", "SOC2", "ISO 27001"],
        patchAvailable: false,
        discoveryDate: new Date("2024-05-10"),
        publicationDate: new Date("2024-05-10"),
      },
      {
        cveId: "GITLEAKS-2024-002",
        title: "Database Password in Environment Variables File",
        description: "Production database credentials were found in a .env file that was accidentally committed to the repository. The password is in plaintext and provides administrative access to the production database.",
        severity: "CRITICAL",
        cvssScore: "9.1",
        riskScore: 94,
        exploitability: "ACTIVE",
        status: "IN_PROGRESS",
        assetIds: [assetIds[1]],
        sourceIntegration: "Gitleaks",
        findingType: "SECRET_EXPOSURE",
        affectedPackage: ".env",
        remediationSteps: "Rotate database password immediately\nRemove .env from git history\nAdd .env to .gitignore\nUse environment-specific secret management\nImplement database access auditing",
        applicationOwner: "Backend Team",
        vpOwner: "Michael Rodriguez, VP Security",
        vpPoc: "michael.rodriguez@company.com",
        githubUrl: "https://github.com/company/backend-api/commit/b7e9d2a",
        ticketUrl: "https://jira.company.com/browse/SEC-1305",
        attackVector: "NETWORK",
        attackComplexity: "LOW",
        privilegesRequired: "NONE",
        userInteraction: "NONE",
        confidentialityImpact: "HIGH",
        integrityImpact: "HIGH",
        availabilityImpact: "HIGH",
        epssScore: "88.4%",
        knownExploits: ["Exposed in git repository"],
        relatedCves: [],
        references: [
          "https://12factor.net/config",
          "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
        ],
        complianceImpact: ["PCI-DSS 8.2", "HIPAA", "GDPR"],
        patchAvailable: false,
        discoveryDate: new Date("2024-06-01"),
        publicationDate: new Date("2024-06-01"),
      },
      {
        cveId: "GITLEAKS-2024-003",
        title: "Slack Webhook Token Leaked in Source Code",
        description: "A Slack webhook URL containing authentication token was hardcoded in application source code, allowing unauthorized message posting to internal Slack channels.",
        severity: "HIGH",
        cvssScore: "7.5",
        riskScore: 76,
        exploitability: "THEORETICAL",
        status: "OPEN",
        assetIds: [assetIds[3]],
        sourceIntegration: "Gitleaks",
        findingType: "SECRET_EXPOSURE",
        affectedPackage: "src/notifications/slack.ts",
        remediationSteps: "Revoke and regenerate Slack webhook URL\nMove webhook URL to environment variables\nImplement secret scanning in CI/CD pipeline\nReview all recent Slack messages for suspicious activity",
        applicationOwner: "Product Team",
        vpOwner: "David Park, VP Product",
        vpPoc: "david.park@company.com",
        githubUrl: "https://github.com/company/notifications-service/blob/main/src/notifications/slack.ts",
        ticketUrl: "https://jira.company.com/browse/SEC-1310",
        attackVector: "NETWORK",
        attackComplexity: "LOW",
        privilegesRequired: "NONE",
        userInteraction: "NONE",
        confidentialityImpact: "LOW",
        integrityImpact: "LOW",
        availabilityImpact: "NONE",
        epssScore: "42.3%",
        knownExploits: [],
        relatedCves: [],
        references: [
          "https://api.slack.com/messaging/webhooks",
          "https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning"
        ],
        complianceImpact: ["SOC2"],
        patchAvailable: false,
        discoveryDate: new Date("2024-07-15"),
        publicationDate: new Date("2024-07-15"),
      },
      // CLOUD SECURITY FINDINGS (from Wiz)
      {
        cveId: "WIZ-2024-001",
        title: "S3 Bucket Publicly Accessible with Sensitive Data",
        description: "An AWS S3 bucket containing customer PII and financial records is publicly accessible due to misconfigured bucket policies. The bucket has over 50,000 files that are readable by anyone on the internet.",
        severity: "CRITICAL",
        cvssScore: "9.6",
        riskScore: 99,
        exploitability: "ACTIVE",
        status: "OPEN",
        assetIds: [assetIds[2]],
        sourceIntegration: "Wiz",
        findingType: "CLOUD_SECURITY",
        affectedPackage: "s3://company-customer-data-prod",
        remediationSteps: "Immediately set bucket policy to private\nEnable S3 Block Public Access settings\nAudit all bucket access logs for unauthorized downloads\nImplement S3 bucket encryption\nEnable CloudTrail logging for all S3 operations\nReview and remediate IAM policies",
        applicationOwner: "Cloud Infrastructure Team",
        vpOwner: "Sarah Chen, VP Engineering",
        vpPoc: "sarah.chen@company.com",
        githubUrl: "https://github.com/company/terraform-aws/issues/567",
        ticketUrl: "https://jira.company.com/browse/SEC-1320",
        attackVector: "NETWORK",
        attackComplexity: "LOW",
        privilegesRequired: "NONE",
        userInteraction: "NONE",
        confidentialityImpact: "HIGH",
        integrityImpact: "NONE",
        availabilityImpact: "NONE",
        epssScore: "91.2%",
        knownExploits: ["Publicly indexed by search engines"],
        relatedCves: [],
        references: [
          "https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html",
          "https://owasp.org/www-community/vulnerabilities/Insecure_Storage",
          "https://www.wiz.io/blog/black-hat-2024-33-million-impacted-by-cloud-bucket-leaks"
        ],
        complianceImpact: ["PCI-DSS 3.2", "HIPAA", "GDPR Article 32", "SOC2"],
        patchAvailable: false,
        discoveryDate: new Date("2024-08-01"),
        publicationDate: new Date("2024-08-01"),
      },
      {
        cveId: "WIZ-2024-002",
        title: "EC2 Instance with Overly Permissive IAM Role",
        description: "A production EC2 instance is running with an IAM role that has AdministratorAccess policy attached, violating the principle of least privilege. This provides unnecessary elevated permissions that could be exploited.",
        severity: "HIGH",
        cvssScore: "8.0",
        riskScore: 85,
        exploitability: "THEORETICAL",
        status: "OPEN",
        assetIds: [assetIds[0]],
        sourceIntegration: "Wiz",
        findingType: "CLOUD_SECURITY",
        affectedPackage: "i-0abcd1234efgh5678",
        remediationSteps: "Create least-privilege IAM role with only required permissions\nAttach new IAM role to EC2 instance\nRemove AdministratorAccess policy\nEnable AWS Config rules to detect overly permissive roles\nImplement IAM Access Analyzer",
        applicationOwner: "DevOps Team",
        vpOwner: "Sarah Chen, VP Engineering",
        vpPoc: "sarah.chen@company.com",
        githubUrl: "https://github.com/company/terraform-aws/pull/590",
        ticketUrl: "https://jira.company.com/browse/SEC-1325",
        attackVector: "LOCAL",
        attackComplexity: "LOW",
        privilegesRequired: "LOW",
        userInteraction: "NONE",
        confidentialityImpact: "HIGH",
        integrityImpact: "HIGH",
        availabilityImpact: "HIGH",
        epssScore: "35.6%",
        knownExploits: [],
        relatedCves: [],
        references: [
          "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#grant-least-privilege",
          "https://aws.amazon.com/blogs/security/techniques-for-writing-least-privilege-iam-policies/",
          "https://www.wiz.io/academy/aws-iam-privilege-escalation"
        ],
        complianceImpact: ["PCI-DSS 7.1", "SOC2", "ISO 27001"],
        patchAvailable: false,
        discoveryDate: new Date("2024-08-20"),
        publicationDate: new Date("2024-08-20"),
      },
      {
        cveId: "WIZ-2024-003",
        title: "RDS Database Snapshot Publicly Shared",
        description: "An Amazon RDS database snapshot containing production data has been shared publicly. This snapshot includes customer data, user credentials, and application secrets.",
        severity: "CRITICAL",
        cvssScore: "9.3",
        riskScore: 96,
        exploitability: "ACTIVE",
        status: "IN_PROGRESS",
        assetIds: [assetIds[1]],
        sourceIntegration: "Wiz",
        findingType: "CLOUD_SECURITY",
        affectedPackage: "rds:snapshot/prod-db-backup-2024",
        remediationSteps: "Immediately remove public access from RDS snapshot\nDelete the publicly shared snapshot\nCreate new snapshot with restricted access\nRotate all database credentials\nAudit snapshot restore logs\nImplement automated scanning for public snapshots",
        applicationOwner: "Database Team",
        vpOwner: "Michael Rodriguez, VP Security",
        vpPoc: "michael.rodriguez@company.com",
        githubUrl: "https://github.com/company/database-ops/issues/234",
        ticketUrl: "https://jira.company.com/browse/SEC-1330",
        attackVector: "NETWORK",
        attackComplexity: "LOW",
        privilegesRequired: "NONE",
        userInteraction: "NONE",
        confidentialityImpact: "HIGH",
        integrityImpact: "NONE",
        availabilityImpact: "NONE",
        epssScore: "87.9%",
        knownExploits: ["Publicly accessible"],
        relatedCves: [],
        references: [
          "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ShareSnapshot.html",
          "https://aws.amazon.com/blogs/security/how-to-create-a-custom-rule-in-aws-config-to-detect-amazon-rds-database-snapshots-that-are-public/",
          "https://www.upguard.com/blog/biggest-data-breaches-us"
        ],
        complianceImpact: ["PCI-DSS", "HIPAA", "GDPR", "SOC2"],
        patchAvailable: false,
        discoveryDate: new Date("2024-09-05"),
        publicationDate: new Date("2024-09-05"),
      },
    ];

    vulnerabilityData.forEach((vuln) => {
      const id = randomUUID();
      this.vulnerabilities.set(id, {
        ...vuln,
        id,
        affectedPackage: vuln.affectedPackage || null,
        remediationSteps: vuln.remediationSteps || null,
        applicationOwner: vuln.applicationOwner || null,
        vpOwner: vuln.vpOwner || null,
        vpPoc: vuln.vpPoc || null,
        githubUrl: vuln.githubUrl || null,
        ticketUrl: vuln.ticketUrl || null,
        attackVector: vuln.attackVector || null,
        attackComplexity: vuln.attackComplexity || null,
        privilegesRequired: vuln.privilegesRequired || null,
        userInteraction: vuln.userInteraction || null,
        confidentialityImpact: vuln.confidentialityImpact || null,
        integrityImpact: vuln.integrityImpact || null,
        availabilityImpact: vuln.availabilityImpact || null,
        epssScore: vuln.epssScore || null,
        knownExploits: vuln.knownExploits || [],
        relatedCves: vuln.relatedCves || [],
        references: vuln.references || [],
        complianceImpact: vuln.complianceImpact || [],
        patchAvailable: vuln.patchAvailable ?? false,
        patchVersion: vuln.patchVersion || null,
        discoveryDate: vuln.discoveryDate || null,
        publicationDate: vuln.publicationDate || null,
        workflowStatus: null,
        assignedTo: null,
        assignedTeam: null,
        slaDueDate: null,
        slaStatus: null,
        estimatedCost: null,
        estimatedHours: null,
        detectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 3600000),
        updatedAt: new Date(),
      });
    });

    // Update asset vulnerability counts
    this.updateAllAssetCounts();
  }

  private updateAllAssetCounts() {
    const assets = Array.from(this.assets.values());
    const vulns = Array.from(this.vulnerabilities.values());

    assets.forEach((asset) => {
      const assetVulns = vulns.filter((v) => v.assetIds.includes(asset.id));
      const criticalCount = assetVulns.filter((v) => v.severity === "CRITICAL").length;
      const highCount = assetVulns.filter((v) => v.severity === "HIGH").length;

      asset.vulnerabilityCount = assetVulns.length;
      asset.criticalVulnCount = criticalCount;
      asset.highVulnCount = highCount;
    });
  }

  // Vulnerabilities
  async getVulnerabilities(): Promise<Vulnerability[]> {
    return Array.from(this.vulnerabilities.values()).sort(
      (a, b) => b.riskScore - a.riskScore
    );
  }

  async getVulnerability(id: string): Promise<Vulnerability | undefined> {
    return this.vulnerabilities.get(id);
  }

  async createVulnerability(vuln: InsertVulnerability): Promise<Vulnerability> {
    const id = randomUUID();
    const vulnerability: Vulnerability = {
      ...vuln,
      id,
      affectedPackage: vuln.affectedPackage || null,
      remediationSteps: vuln.remediationSteps || null,
      applicationOwner: vuln.applicationOwner || null,
      vpOwner: vuln.vpOwner || null,
      vpPoc: vuln.vpPoc || null,
      githubUrl: vuln.githubUrl || null,
      ticketUrl: vuln.ticketUrl || null,
      attackVector: vuln.attackVector || null,
      attackComplexity: vuln.attackComplexity || null,
      privilegesRequired: vuln.privilegesRequired || null,
      userInteraction: vuln.userInteraction || null,
      confidentialityImpact: vuln.confidentialityImpact || null,
      integrityImpact: vuln.integrityImpact || null,
      availabilityImpact: vuln.availabilityImpact || null,
      epssScore: vuln.epssScore || null,
      knownExploits: vuln.knownExploits || [],
      relatedCves: vuln.relatedCves || [],
      references: vuln.references || [],
      complianceImpact: vuln.complianceImpact || [],
      patchAvailable: vuln.patchAvailable ?? false,
      patchVersion: vuln.patchVersion || null,
      discoveryDate: vuln.discoveryDate || null,
      publicationDate: vuln.publicationDate || null,
      workflowStatus: vuln.workflowStatus || null,
      assignedTo: vuln.assignedTo || null,
      assignedTeam: vuln.assignedTeam || null,
      slaDueDate: vuln.slaDueDate || null,
      slaStatus: vuln.slaStatus || null,
      estimatedCost: vuln.estimatedCost || null,
      estimatedHours: vuln.estimatedHours || null,
      detectedAt: new Date(),
      updatedAt: new Date(),
    };
    this.vulnerabilities.set(id, vulnerability);
    this.updateAllAssetCounts();
    return vulnerability;
  }

  async updateVulnerability(id: string, vuln: Partial<Vulnerability>): Promise<Vulnerability | undefined> {
    const existing = this.vulnerabilities.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...vuln, updatedAt: new Date() };
    this.vulnerabilities.set(id, updated);
    return updated;
  }

  // Assets
  async getAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values()).sort(
      (a, b) => b.criticalVulnCount - a.criticalVulnCount
    );
  }

  async getAsset(id: string): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const id = randomUUID();
    const newAsset: Asset = {
      ...asset,
      id,
      owner: asset.owner || null,
      vpOwner: asset.vpOwner || null,
      vpPoc: asset.vpPoc || null,
      ipAddress: asset.ipAddress || null,
      vulnerabilityCount: 0,
      criticalVulnCount: 0,
      highVulnCount: 0,
      createdAt: new Date(),
    };
    this.assets.set(id, newAsset);
    return newAsset;
  }

  async updateAssetVulnCounts(assetId: string, critical: number, high: number, total: number): Promise<void> {
    const asset = this.assets.get(assetId);
    if (asset) {
      asset.criticalVulnCount = critical;
      asset.highVulnCount = high;
      asset.vulnerabilityCount = total;
    }
  }

  // Integrations
  async getIntegrations(): Promise<Integration[]> {
    return Array.from(this.integrations.values());
  }

  async getIntegration(id: string): Promise<Integration | undefined> {
    return this.integrations.get(id);
  }

  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const id = randomUUID();
    const newIntegration: Integration = {
      ...integration,
      id,
      apiKey: integration.apiKey || null,
      apiUrl: integration.apiUrl || null,
      syncFrequency: integration.syncFrequency || null,
      config: integration.config || null,
      enabled: integration.enabled ?? true,
      lastSyncAt: null,
      createdAt: new Date(),
    };
    this.integrations.set(id, newIntegration);
    return newIntegration;
  }

  async updateIntegrationSync(id: string): Promise<void> {
    const integration = this.integrations.get(id);
    if (integration) {
      integration.lastSyncAt = new Date();
    }
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const vulns = await this.getVulnerabilities();
    const assets = await this.getAssets();
    const integrations = await this.getIntegrations();

    const criticalCount = vulns.filter((v) => v.severity === "CRITICAL").length;
    const highCount = vulns.filter((v) => v.severity === "HIGH").length;
    const mediumCount = vulns.filter((v) => v.severity === "MEDIUM").length;
    const lowCount = vulns.filter((v) => v.severity === "LOW").length;

    const openCount = vulns.filter((v) => v.status === "OPEN").length;
    const resolvedCount = vulns.filter((v) => v.status === "RESOLVED").length;

    const highRiskAssets = assets.filter(
      (a) => a.businessCriticality === "CRITICAL" && a.criticalVulnCount > 0
    ).length;

    const activeIntegrations = integrations.filter(
      (i) => i.status === "CONNECTED"
    ).length;

    // Generate trend data for the last 7 days
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trendData.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        critical: Math.max(0, criticalCount - Math.floor(Math.random() * 3)),
        high: Math.max(0, highCount - Math.floor(Math.random() * 2)),
        medium: Math.max(0, mediumCount - Math.floor(Math.random() * 4)),
        low: Math.max(0, lowCount - Math.floor(Math.random() * 5)),
      });
    }

    return {
      totalVulnerabilities: vulns.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      openCount,
      resolvedCount,
      totalAssets: assets.length,
      highRiskAssets,
      activeIntegrations,
      trendData,
    };
  }

  // VP Dashboard
  async getVPList(): Promise<{ vpName: string; vpPoc: string }[]> {
    const assets = await this.getAssets();
    const vpMap = new Map<string, string>();
    
    assets.forEach((asset) => {
      if (asset.vpOwner && asset.vpPoc) {
        vpMap.set(asset.vpOwner, asset.vpPoc);
      }
    });

    return Array.from(vpMap.entries()).map(([vpName, vpPoc]) => ({
      vpName,
      vpPoc,
    }));
  }

  async getVPDashboard(vpOwner: string): Promise<VPDashboard | undefined> {
    const allAssets = await this.getAssets();
    const allVulns = await this.getVulnerabilities();

    // Filter assets owned by this VP
    const vpAssets = allAssets.filter((a) => a.vpOwner === vpOwner);
    
    if (vpAssets.length === 0) {
      return undefined;
    }

    const vpPoc = vpAssets[0]?.vpPoc || "";
    const assetIds = vpAssets.map((a) => a.id);

    // Filter vulnerabilities for VP's assets
    const vpVulns = allVulns.filter((v) => v.assetIds.some(aid => assetIds.includes(aid)));

    const criticalCount = vpVulns.filter((v) => v.severity === "CRITICAL").length;
    const highCount = vpVulns.filter((v) => v.severity === "HIGH").length;
    const mediumCount = vpVulns.filter((v) => v.severity === "MEDIUM").length;
    const lowCount = vpVulns.filter((v) => v.severity === "LOW").length;

    // Get top 10 highest risk vulnerabilities
    const topVulnerabilities = vpVulns
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    return {
      vpName: vpOwner,
      vpPoc,
      totalVulnerabilities: vpVulns.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      totalAssets: vpAssets.length,
      applications: vpAssets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        vulnerabilityCount: asset.vulnerabilityCount,
        criticalVulnCount: asset.criticalVulnCount,
        highVulnCount: asset.highVulnCount,
      })),
      topVulnerabilities,
    };
  }

  // Comments
  async getComments(vulnerabilityId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((c) => c.vulnerabilityId === vulnerabilityId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const newComment: Comment = {
      ...comment,
      id,
      parentCommentId: comment.parentCommentId || null,
      createdAt: new Date(),
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  // Activity Logs
  async getActivityLogs(entityType: string, entityId: string): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter((log) => log.entityType === entityType && log.entityId === entityId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const newLog: ActivityLog = {
      ...log,
      id,
      changes: log.changes || null,
      metadata: log.metadata || null,
      createdAt: new Date(),
    };
    this.activityLogs.set(id, newLog);
    return newLog;
  }

  // Users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = {
      ...user,
      id,
      vpOwner: user.vpOwner || null,
      team: user.team || null,
      avatarUrl: user.avatarUrl || null,
      isActive: user.isActive ?? true,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...user };
    this.users.set(id, updated);
    return updated;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      vulnerabilityId: notification.vulnerabilityId || null,
      isRead: notification.isRead ?? false,
      createdAt: new Date(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
    }
  }

  // Workflow History
  async getWorkflowHistory(vulnerabilityId: string): Promise<WorkflowHistory[]> {
    return Array.from(this.workflowHistory.values())
      .filter((h) => h.vulnerabilityId === vulnerabilityId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createWorkflowHistory(history: InsertWorkflowHistory): Promise<WorkflowHistory> {
    const id = randomUUID();
    const newHistory: WorkflowHistory = {
      ...history,
      id,
      fromStatus: history.fromStatus || null,
      comment: history.comment || null,
      createdAt: new Date(),
    };
    this.workflowHistory.set(id, newHistory);
    return newHistory;
  }

  // Saved Views
  async getSavedViews(vpOwner: string): Promise<SavedView[]> {
    return Array.from(this.savedViews.values())
      .filter((v) => v.vpOwner === vpOwner)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSavedView(id: string): Promise<SavedView | undefined> {
    return this.savedViews.get(id);
  }

  async createSavedView(view: InsertSavedView): Promise<SavedView> {
    const id = randomUUID();
    const newView: SavedView = {
      ...view,
      id,
      isDefault: view.isDefault ?? false,
      createdAt: new Date(),
    };
    this.savedViews.set(id, newView);
    return newView;
  }

  async updateSavedView(id: string, view: Partial<SavedView>): Promise<SavedView | undefined> {
    const existing = this.savedViews.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...view };
    this.savedViews.set(id, updated);
    return updated;
  }

  async deleteSavedView(id: string): Promise<void> {
    this.savedViews.delete(id);
  }

  // Export Jobs
  async getExportJobs(userId: string): Promise<ExportJob[]> {
    return Array.from(this.exportJobs.values())
      .filter((j) => j.requestedBy === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createExportJob(job: InsertExportJob): Promise<ExportJob> {
    const id = randomUUID();
    const newJob: ExportJob = {
      ...job,
      id,
      filters: job.filters || null,
      fileUrl: job.fileUrl || null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.exportJobs.set(id, newJob);
    return newJob;
  }

  async updateExportJob(id: string, job: Partial<ExportJob>): Promise<ExportJob | undefined> {
    const existing = this.exportJobs.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...job };
    this.exportJobs.set(id, updated);
    return updated;
  }

  // Webhooks
  async getWebhooks(): Promise<WebhookConfig[]> {
    return Array.from(this.webhooks.values());
  }

  async createWebhook(webhook: InsertWebhookConfig): Promise<WebhookConfig> {
    const id = randomUUID();
    const newWebhook: WebhookConfig = {
      ...webhook,
      id,
      secret: webhook.secret || null,
      isActive: webhook.isActive ?? true,
      createdAt: new Date(),
    };
    this.webhooks.set(id, newWebhook);
    return newWebhook;
  }

  async updateWebhook(id: string, webhook: Partial<WebhookConfig>): Promise<WebhookConfig | undefined> {
    const existing = this.webhooks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...webhook };
    this.webhooks.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
