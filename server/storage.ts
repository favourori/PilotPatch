import {
  type Vulnerability,
  type InsertVulnerability,
  type Asset,
  type InsertAsset,
  type Integration,
  type InsertIntegration,
  type DashboardStats,
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
}

export class MemStorage implements IStorage {
  private vulnerabilities: Map<string, Vulnerability>;
  private assets: Map<string, Asset>;
  private integrations: Map<string, Integration>;

  constructor() {
    this.vulnerabilities = new Map();
    this.assets = new Map();
    this.integrations = new Map();
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
        ipAddress: "10.0.1.50",
      },
      {
        name: "User Authentication Service",
        type: "APPLICATION",
        businessCriticality: "CRITICAL",
        environment: "PRODUCTION",
        owner: "Security Team",
      },
      {
        name: "Customer Database",
        type: "DATABASE",
        businessCriticality: "CRITICAL",
        environment: "PRODUCTION",
        owner: "Database Admin",
        ipAddress: "10.0.2.100",
      },
      {
        name: "Analytics Dashboard",
        type: "APPLICATION",
        businessCriticality: "HIGH",
        environment: "PRODUCTION",
        owner: "Analytics Team",
      },
      {
        name: "Development Test Server",
        type: "SERVER",
        businessCriticality: "LOW",
        environment: "DEVELOPMENT",
        owner: "Dev Team",
        ipAddress: "10.1.0.25",
      },
    ];

    assetData.forEach((asset) => {
      const id = randomUUID();
      this.assets.set(id, {
        ...asset,
        id,
        owner: asset.owner || null,
        ipAddress: asset.ipAddress || null,
        vulnerabilityCount: 0,
        criticalVulnCount: 0,
        highVulnCount: 0,
        createdAt: new Date(),
      });
    });

    // Seed integrations
    const integrationData: InsertIntegration[] = [
      {
        name: "Snyk",
        type: "CODE_SCANNER",
        status: "CONNECTED",
        apiUrl: "https://api.snyk.io",
        syncFrequency: "DAILY",
        enabled: true,
      },
      {
        name: "ServiceNow",
        type: "TICKETING",
        status: "CONNECTED",
        apiUrl: "https://dev.service-now.com",
        syncFrequency: "MANUAL",
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
        name: "Qualys",
        type: "VULN_SCANNER",
        status: "DISCONNECTED",
        apiUrl: "https://qualysapi.qualys.com",
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
        affectedPackage: "auth-module@2.1.0",
        remediationSteps: "Upgrade auth-module to version 2.1.5 or later\nImplement parameterized queries\nAdd input validation and sanitization\nConduct security audit of all database queries",
        applicationOwner: "Security Team",
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
        affectedPackage: "serialization-lib@1.3.2",
        remediationSteps: "Update serialization-lib to version 1.4.0\nImplement object validation before deserialization\nUse safe serialization formats like JSON",
        applicationOwner: "Platform Engineering",
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
        affectedPackage: "dashboard-ui@3.2.1",
        remediationSteps: "Sanitize all user inputs\nImplement Content Security Policy (CSP)\nEscape output data properly\nUpgrade to dashboard-ui@3.2.5",
        applicationOwner: "Analytics Team",
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
        sourceIntegration: "Gitleaks",
        affectedPackage: "api-gateway@4.1.0",
        remediationSteps: "Implement proper authorization checks\nValidate user permissions on all endpoints\nUse indirect references with access control\nUpdate api-gateway to 4.2.0",
        applicationOwner: "DevOps Team",
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
        sourceIntegration: "Gitleaks",
        remediationSteps: "Implement log sanitization\nRemove sensitive data from logs\nRestrict log file access\nUse secure logging libraries",
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
        affectedPackage: "crypto-utils@1.0.0",
        remediationSteps: "Migrate to bcrypt or Argon2\nRehash all existing passwords\nUpdate crypto-utils to 2.0.0",
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
        remediationSteps: "Configure web server to add security headers\nImplement HSTS with long max-age\nAdd X-Frame-Options: DENY\nEnable X-Content-Type-Options: nosniff",
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
        remediationSteps: "Validate all redirect URLs against whitelist\nAvoid using user input for redirects\nImplement redirect confirmation page",
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
}

export const storage = new MemStorage();
