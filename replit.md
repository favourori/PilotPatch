# VIPR - Vulnerability Intelligence & Prioritization Platform

## Overview
VIPR is a comprehensive security vulnerability management and prioritization platform that aggregates vulnerability data from multiple security tools, provides risk-based scoring, and enables efficient remediation workflows. Built as a clone of Armis VIPR, this application helps security teams prioritize and manage vulnerabilities across their entire attack surface.

## Current State
The application is fully functional with:
- **Executive Dashboard** - Real-time metrics, trend charts, and severity distribution
- **Vulnerability Management** - Comprehensive list with filtering, search, and detailed views
- **Asset Inventory** - Track all infrastructure assets with vulnerability mapping
- **Integration Hub** - Connect and manage security tool integrations
- **Risk Scoring Engine** - Custom risk scores based on CVSS, exploitability, and business context
- **Dark/Light Theme** - Full theme support with persistent preferences

## Project Architecture

### Frontend Stack
- **React** with TypeScript
- **Wouter** for routing
- **TanStack Query** for data fetching and state management
- **Shadcn UI** components with Tailwind CSS
- **Recharts** for data visualization
- **Dark/Light theme** support

### Backend Stack
- **Express.js** server
- **In-memory storage** (MemStorage) for data persistence
- **Zod** for schema validation
- **RESTful API** architecture

### Data Models
1. **Vulnerabilities** - CVE tracking with severity, risk scores, status, and remediation steps
2. **Assets** - Infrastructure inventory with business criticality and vulnerability counts
3. **Integrations** - Security tool connections (Snyk, ServiceNow, Gitleaks, etc.)
4. **Dashboard Stats** - Aggregated metrics and trend data

## Key Features

### 1. Dashboard
- Total vulnerability count with severity breakdown
- Critical findings highlight
- Asset inventory overview
- Active integrations status
- 7-day vulnerability trends chart
- Severity distribution pie chart
- Risk overview with high-risk asset tracking

### 2. Vulnerability Management
- Risk-based prioritization (0-100 score)
- Multi-criteria filtering (severity, status, source)
- Real-time search across CVE IDs and titles
- Detailed vulnerability views with:
  - CVSS scores and exploitability data
  - Affected assets mapping
  - Step-by-step remediation guidance
  - Source integration tracking

### 3. Asset Inventory
- Comprehensive asset tracking across environments
- Business criticality classification
- Vulnerability count aggregation
- Asset type filtering (Server, Database, Cloud, Application, Endpoint)
- Owner assignment

### 4. Integration Management
- Support for multiple security tools:
  - **Snyk** (Code Scanner)
  - **ServiceNow** (Ticketing)
  - **Gitleaks** (Code Scanner)
  - **Qualys** (Vulnerability Scanner)
  - **Nessus** (Vulnerability Scanner)
  - **SonarQube** (Code Quality)
- Connection status monitoring
- Sync frequency configuration
- API key management
- Manual sync triggering

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Aggregate statistics and trend data

### Vulnerabilities
- `GET /api/vulnerabilities` - List all vulnerabilities (sorted by risk score)
- `GET /api/vulnerabilities/:id` - Get vulnerability details
- `POST /api/vulnerabilities` - Create new vulnerability
- `PATCH /api/vulnerabilities/:id` - Update vulnerability status

### Assets
- `GET /api/assets` - List all assets
- `GET /api/assets/:id` - Get asset details
- `POST /api/assets` - Register new asset

### Integrations
- `GET /api/integrations` - List all integrations
- `GET /api/integrations/:id` - Get integration details
- `POST /api/integrations` - Add new integration
- `POST /api/integrations/:id/sync` - Trigger manual sync

## Sample Data
The application is pre-seeded with realistic security data:
- **8 Vulnerabilities** across all severity levels with real CVE scenarios
- **5 Assets** including production servers, databases, and applications
- **4 Integrations** (3 connected, 1 disconnected)
- **Trend data** showing vulnerability progression over 7 days

## Design Guidelines
The application follows enterprise security platform design principles:
- **Dark mode first** - Professional, low-eye-strain interface
- **Information density** - Maximum actionable data visibility
- **Hierarchical clarity** - Critical alerts demand immediate attention
- **Consistent spacing** - 8px/16px/24px rhythm
- **Security-focused colors** - Red for critical, orange for high, yellow for medium, blue for low
- **Monospace fonts** - For CVE IDs and technical data
- **Accessible interactions** - Clear hover states and focus indicators

## User Workflows

### Vulnerability Triage
1. View dashboard for overview of critical findings
2. Navigate to vulnerabilities page
3. Filter by severity or status
4. Search for specific CVE or affected system
5. Click vulnerability for detailed analysis
6. Review remediation steps and affected assets
7. Update status as remediation progresses

### Asset Risk Assessment
1. Navigate to assets page
2. Sort by vulnerability count or criticality
3. Identify high-risk assets (critical business + critical vulnerabilities)
4. Review associated vulnerabilities
5. Assign ownership for remediation

### Integration Setup
1. Navigate to integrations page
2. Click "Add Integration"
3. Select security tool (Snyk, ServiceNow, etc.)
4. Configure API credentials
5. Test connection
6. Set sync frequency
7. Monitor sync status and last sync time

## Running the Application
```bash
npm run dev
```
The application runs on port 5000 with:
- Frontend: Vite dev server
- Backend: Express API server
- Hot reload enabled for development

## Technology Decisions
- **In-memory storage** chosen for MVP speed and simplicity
- **Dark theme default** aligns with security tool conventions
- **Recharts** selected for rich, customizable data visualization
- **Shadcn UI** provides accessible, customizable components
- **Risk scoring** combines CVSS, exploitability, and business criticality

## Future Enhancements
- Real API integrations with Snyk, ServiceNow, Gitleaks
- AI-powered vulnerability deduplication
- Automated ticket creation workflows
- Custom risk scoring rules engine
- Remediation SLA tracking
- Compliance reporting (PDF/CSV export)
- PostgreSQL persistence for production use
- Multi-user role-based access control

## Recent Changes
- October 15, 2024: Initial implementation with full CRUD operations
- Complete frontend with dashboard, vulnerabilities, assets, and integrations
- Backend API with seeded realistic security data
- Theme support with dark/light mode
- Comprehensive testing coverage

## Notes
- Application uses test IDs throughout for automation testing
- All forms use Zod validation for type safety
- Loading states implemented for all async operations
- Error handling with toast notifications
- Responsive design for desktop and tablet
