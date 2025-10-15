# VIPR Security Dashboard - Design Guidelines

## Design Approach: Enterprise Security Platform

**Selected Framework**: Carbon Design System (IBM) adapted for security context  
**Rationale**: Data-dense enterprise application requiring clarity, hierarchy, and professional credibility. Security tools prioritize functionality, readability, and efficient data processing over aesthetic experimentation.

**Key References**: Linear (clean modern UI), Datadog (monitoring dashboards), GitHub Security (vulnerability management), Sentry (error tracking)

**Design Principles**:
- Clarity over decoration: Every pixel serves a functional purpose
- Information density: Maximize actionable data visibility without clutter
- Hierarchical precision: Critical alerts and metrics demand immediate attention
- Professional trust: Enterprise-grade visual language inspires confidence

---

## Core Design Elements

### A. Color Palette

**Dark Mode Foundation** (Primary):
- Background Base: 220 15% 8%
- Surface Elevated: 220 15% 12%
- Surface Interactive: 220 15% 16%
- Border Subtle: 220 10% 20%

**Semantic Colors**:
- Critical/High: 0 85% 60% (red for high-severity vulnerabilities)
- Warning/Medium: 35 95% 55% (orange for medium-severity)
- Info/Low: 210 85% 60% (blue for informational)
- Success/Resolved: 145 65% 50% (green for fixed issues)
- Primary Action: 210 100% 60% (blue for CTAs and active states)

**Text Hierarchy**:
- Primary Text: 220 15% 95%
- Secondary Text: 220 10% 70%
- Tertiary/Disabled: 220 8% 45%

### B. Typography

**Font Stack**: Inter (primary), SF Pro (fallback), system-ui  
**CDN**: Google Fonts - Inter (weights: 400, 500, 600, 700)

**Scale**:
- Page Titles: 32px/40px, font-weight 700
- Section Headers: 24px/32px, font-weight 600
- Card Titles: 18px/24px, font-weight 600
- Body Text: 14px/20px, font-weight 400
- Small Text/Labels: 12px/16px, font-weight 500
- Monospace (CVE IDs, codes): Fira Code, 13px/18px

**Key Styles**:
- Uppercase labels for categories (tracking: 0.05em)
- Tabular numbers for metrics and scores
- Medium weight (500) for emphasis within body text

### C. Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16  
**Rationale**: 2-4 for tight spacing (badges, inline elements), 6-8 for component padding, 12-16 for section spacing

**Grid Structure**:
- Dashboard: 12-column responsive grid
- Sidebar: Fixed 256px (desktop), collapsible (mobile)
- Content Area: max-w-7xl with px-6 padding
- Card Spacing: gap-6 for grids

**Containers**:
- Full-width dashboard: w-full
- Constrained content: max-w-7xl mx-auto
- Tables: w-full with horizontal scroll on mobile

### D. Component Library

**Navigation**:
- Sidebar: Fixed left navigation (dark background 220 15% 10%)
- Top Bar: Breadcrumbs, search, user profile, notification bell
- Tab Navigation: Underline style for section switching

**Data Display**:
- Metric Cards: Elevated surface with large numbers, trend indicators, sparkline charts
- Tables: Striped rows, sortable columns, sticky headers, row hover states
- Risk Score Badges: Pill-shaped, color-coded by severity (Critical/High/Medium/Low)
- Status Indicators: Colored dots (8px) with labels
- CVE Tags: Monospace font, dark background with subtle border

**Forms & Controls**:
- Input Fields: Dark background with lighter border, focus ring in primary blue
- Dropdowns/Selects: Custom styled with chevron icons
- Filter Panel: Collapsible sidebar with checkbox groups and range sliders
- Search Bar: Prominent with icon, auto-suggest dropdown

**Data Visualization**:
- Line Charts: Trend analysis with gradient fills (Chart.js or Recharts)
- Donut Charts: Vulnerability distribution by severity
- Bar Charts: Horizontal bars for tool comparison metrics
- Heatmaps: Asset risk matrix (criticality vs. vulnerability count)

**Integration Components**:
- Integration Cards: Logo, connection status (connected/disconnected dot), last sync timestamp, configure button
- API Key Input: Masked text field with reveal toggle, test connection button
- Sync Status: Loading spinner, success/error states with timestamps

**Overlays**:
- Modals: Centered, max-w-2xl, overlay backdrop (black 50% opacity)
- Slide-out Panels: Right-side detail panels (500px) for vulnerability deep-dives
- Toasts: Top-right notifications for sync status, errors, success messages

### E. Animations

**Minimal, Purposeful Only**:
- Loading States: Subtle pulse on skeleton loaders
- Data Refresh: Brief flash on updated metrics (400ms fade)
- Table Row Expand: Smooth height transition (200ms ease-out)
- Chart Animations: None after initial load - data clarity over motion

**Prohibited**: Page transitions, decorative animations, parallax effects

---

## Page-Specific Layouts

**Executive Dashboard**:
- 4-column metric grid (Critical/High/Medium/Low vulnerability counts)
- 2-column charts (trend over time, severity distribution)
- Recent activity feed (narrow right column)

**Vulnerability List**:
- Full-width data table with filters in left sidebar
- Columns: Risk Score, CVE ID, Asset, Severity, Status, Source Tool, Age
- Bulk action toolbar when rows selected

**Integration Management**:
- Grid of integration cards (3 columns on desktop)
- Each card: Tool logo (64px), status badge, last sync time, configure button
- "Add Integration" card with plus icon

**Vulnerability Detail Panel**:
- Slide-out from right (500px width)
- Sections: Overview, Affected Assets, Remediation Steps, Timeline
- Sticky header with close button

---

## Accessibility & Polish

- Consistent dark mode across all inputs and surfaces
- ARIA labels for all interactive elements
- Keyboard navigation for tables and forms
- Color-blind safe palette (severity colors distinguishable by text labels)
- Loading states for all async operations
- Empty states with actionable guidance ("No vulnerabilities found. Connect your first integration.")

---

## Images

**No Hero Images Required** - This is a utility dashboard, not a marketing site.

**Icon Usage**:
- Heroicons (outline style) for UI controls via CDN
- Tool logos: Official brand logos for Snyk, ServiceNow, Gitleaks etc. (64x64px)
- Severity icons: Shield with exclamation marks (use Heroicons ShieldExclamation)