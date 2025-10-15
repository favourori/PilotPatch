import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Shield, Server, Activity } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { VulnerabilityTrendChart } from "@/components/vulnerability-trend-chart";
import { SeverityDistributionChart } from "@/components/severity-distribution-chart";
import type { DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive vulnerability intelligence and risk prioritization
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Vulnerabilities"
          value={stats.totalVulnerabilities}
          icon={AlertTriangle}
          valueTestId="metric-total-vulnerabilities"
        />
        <MetricCard
          title="Critical Findings"
          value={stats.criticalCount}
          icon={Shield}
          className="border-red-900/30"
          valueTestId="metric-critical-count"
        />
        <MetricCard
          title="Total Assets"
          value={stats.totalAssets}
          icon={Server}
          valueTestId="metric-total-assets"
        />
        <MetricCard
          title="Active Integrations"
          value={stats.activeIntegrations}
          icon={Activity}
          valueTestId="metric-active-integrations"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <VulnerabilityTrendChart data={stats.trendData} />
        <SeverityDistributionChart
          criticalCount={stats.criticalCount}
          highCount={stats.highCount}
          mediumCount={stats.mediumCount}
          lowCount={stats.lowCount}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-card-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Vulnerability Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Open</span>
              <span className="text-lg font-semibold" data-testid="text-open-count">
                {stats.openCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Resolved</span>
              <span className="text-lg font-semibold text-green-500" data-testid="text-resolved-count">
                {stats.resolvedCount}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-card-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Risk Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">High Risk Assets</span>
              <span className="text-lg font-semibold text-red-500" data-testid="text-high-risk-assets">
                {stats.highRiskAssets}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Coverage</span>
              <span className="text-lg font-semibold">
                {stats.totalAssets > 0
                  ? Math.round((stats.activeIntegrations / stats.totalAssets) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
