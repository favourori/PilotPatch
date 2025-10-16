# PatchPilot - Enterprise Vulnerability Intelligence & Prioritization Platform

## Overview
PatchPilot is a comprehensive, enterprise-grade security vulnerability management and prioritization platform. It aggregates vulnerability data from multiple security tools, provides AI-powered risk scoring, and enables efficient remediation workflows with advanced collaboration features. The platform aims to help security teams prioritize and manage vulnerabilities across their entire attack surface with sophisticated analytics, workflow automation, and team collaboration capabilities, drawing inspiration from Armis VIPR.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.

## System Architecture

### UI/UX Decisions
The application follows enterprise security platform design principles:
- **Dark mode first** for a professional, low-eye-strain interface.
- **Information density** to maximize actionable data visibility.
- **Hierarchical clarity** ensures critical alerts demand immediate attention.
- **Consistent spacing** with an 8px/16px/24px rhythm.
- **Security-focused colors** (red for critical, orange for high, yellow for medium, blue for low).
- **Monospace fonts** for technical data like CVE IDs.
- **Accessible interactions** with clear hover states and focus indicators.

### Technical Implementations
- **Frontend**: React with TypeScript, Wouter for routing, TanStack Query for data management, Shadcn UI components with Tailwind CSS, and Recharts for data visualization. Supports dark/light themes.
- **Backend**: Express.js server utilizing in-memory storage (MemStorage) for data persistence and Zod for schema validation, built as a RESTful API.
- **Risk Scoring**: Combines CVSS, exploitability, and business criticality for a comprehensive risk score.
- **Finding Types**: Supports Code Vulnerabilities, Secret Exposures, and Cloud Security findings.
- **Dashboard Features**: Includes executive and VP-specific dashboards with real-time metrics, trend charts, severity distribution, risk analytics, and custom views.
- **Vulnerability Management**: Provides comprehensive listing, filtering, search, and detailed views of vulnerabilities with risk-based prioritization.
- **Asset Inventory**: Tracks infrastructure assets, mapping them to vulnerabilities.
- **Workflow & Collaboration**: Features multi-step workflows (Triage → Assigned → In Progress → Verified → Closed), assignment, escalation, comments, and activity logs.
- **Advanced Analytics**: Offers trend analysis, risk heat maps, budget impact calculation, and SLA compliance tracking.
- **User Management & RBAC**: Granular permissions with roles like Admin, VP, Security Analyst, Engineer, Viewer, and VP portfolio filtering.
- **Notifications & Alerts**: Real-time notifications, email digests, and webhook support.
- **Saved Views & Customization**: Allows saving and sharing custom filter views.
- **Reporting & Export**: Capabilities for CSV export, PDF reports, and compliance reports.
- **Integration & Automation**: Features auto-ticketing, Slack/Teams webhooks, and email automation.
- **AI & Intelligence (Planned)**: Future enhancements include a deduplication engine, predictive risk scoring, smart search, and automated prioritization.

### Data Models
- **Vulnerabilities**: Tracks CVEs with severity, risk scores, status, finding types (CODE_VULNERABILITY, SECRET_EXPOSURE, CLOUD_SECURITY), remediation steps, and VP ownership (vpOwner, vpPoc).
- **Assets**: Inventory of infrastructure with business criticality and vulnerability counts, including VP ownership.
- **Integrations**: Manages connections to security tools.
- **Dashboard Stats**: Aggregated metrics and trend data.
- **VP Dashboard**: VP-specific vulnerability views with application grouping.

## External Dependencies
The platform integrates with and supports data from various security tools and services:
- **Snyk** (Code Scanner)
- **ServiceNow** (Ticketing)
- **Gitleaks** (Code Scanner)
- **Qualys** (Vulnerability Scanner)
- **Nessus** (Vulnerability Scanner)
- **SonarQube** (Code Quality)
- **Wiz** (Cloud Security)