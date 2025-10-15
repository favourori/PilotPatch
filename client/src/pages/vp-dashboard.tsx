import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Server, Shield, Mail } from "lucide-react";
import { useState } from "react";
import type { VPDashboard } from "@shared/schema";
import { Link } from "wouter";
import { FindingTypeBadge } from "@/components/finding-type-badge";

export default function VPDashboardPage() {
  const [selectedVP, setSelectedVP] = useState<string>("");

  // Fetch VP list
  const { data: vpList, isLoading: vpListLoading } = useQuery<{ vpName: string; vpPoc: string }[]>({
    queryKey: ["/api/vp/list"],
  });

  // Fetch VP dashboard data
  const { data: dashboard, isLoading: dashboardLoading } = useQuery<VPDashboard>({
    queryKey: ["/api/vp/dashboard", selectedVP],
    enabled: !!selectedVP,
  });

  // Auto-select first VP when list loads
  if (vpList && vpList.length > 0 && !selectedVP) {
    setSelectedVP(vpList[0].vpName);
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-red-500";
      case "HIGH":
        return "text-orange-500";
      case "MEDIUM":
        return "text-yellow-500";
      case "LOW":
        return "text-blue-500";
      default:
        return "text-foreground";
    }
  };

  if (vpListLoading) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!vpList || vpList.length === 0) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No VP Data Available</h3>
                <p className="text-muted-foreground">
                  No VP ownership information found in the system.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with VP Selector */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
              VP Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              View vulnerabilities and applications by VP ownership
            </p>
          </div>
          <Select value={selectedVP} onValueChange={setSelectedVP}>
            <SelectTrigger className="w-80" data-testid="select-vp">
              <SelectValue placeholder="Select a VP" />
            </SelectTrigger>
            <SelectContent>
              {vpList.map((vp) => (
                <SelectItem key={vp.vpName} value={vp.vpName} data-testid={`select-vp-option-${vp.vpName}`}>
                  {vp.vpName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dashboard Content */}
        {dashboardLoading ? (
          <div className="grid gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : dashboard ? (
          <>
            {/* VP Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {dashboard.vpName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  VP Point of Contact: {dashboard.vpPoc}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Vulnerabilities</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-vulns">
                    {dashboard.totalVulnerabilities}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical</CardTitle>
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500" data-testid="text-critical-count">
                    {dashboard.criticalCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High</CardTitle>
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500" data-testid="text-high-count">
                    {dashboard.highCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Applications</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-assets-count">
                    {dashboard.totalAssets}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Applications Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Applications & Assets</CardTitle>
                <CardDescription>
                  Assets owned by {dashboard.vpName} with vulnerability counts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {dashboard.applications.map((app) => (
                    <Card key={app.id} className="hover-elevate" data-testid={`card-app-${app.id}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between gap-2">
                          <span className="truncate">{app.name}</span>
                          <Badge variant="outline" className="shrink-0">
                            {app.type}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Vulnerabilities</span>
                          <span className="font-semibold">{app.vulnerabilityCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Critical</span>
                          <span className="font-semibold text-red-500">{app.criticalVulnCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">High</span>
                          <span className="font-semibold text-orange-500">{app.highVulnCount}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Vulnerabilities */}
            <Card>
              <CardHeader>
                <CardTitle>Top Vulnerabilities by Risk Score</CardTitle>
                <CardDescription>
                  Highest priority vulnerabilities requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboard.topVulnerabilities.map((vuln) => (
                    <Link key={vuln.id} href={`/vulnerabilities/${vuln.id}`}>
                      <Card className="hover-elevate active-elevate-2" data-testid={`card-vuln-${vuln.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <code className="text-sm font-mono font-semibold">
                                  {vuln.cveId}
                                </code>
                                <FindingTypeBadge findingType={vuln.findingType} />
                                <Badge
                                  variant="outline"
                                  className={getSeverityColor(vuln.severity)}
                                >
                                  {vuln.severity}
                                </Badge>
                                <Badge variant="secondary">Risk: {vuln.riskScore}</Badge>
                              </div>
                              <p className="text-sm text-foreground mb-1 line-clamp-1">
                                {vuln.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {vuln.affectedAsset}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  {dashboard.topVulnerabilities.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No vulnerabilities found for this VP
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
