import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Server, Shield, Mail, TrendingUp, DollarSign, Clock, Target, BarChart3, Activity } from "lucide-react";
import { useState } from "react";
import type { VPDashboard } from "@shared/schema";
import { Link } from "wouter";
import { FindingTypeBadge } from "@/components/finding-type-badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

  // Mock trend data (30/60/90 days)
  const trendData = [
    { period: "90 Days Ago", critical: 12, high: 25, medium: 40, low: 15 },
    { period: "60 Days Ago", critical: 10, high: 22, medium: 38, low: 18 },
    { period: "30 Days Ago", critical: 8, high: 20, medium: 35, low: 20 },
    { period: "Today", critical: dashboard?.criticalCount || 0, high: dashboard?.highCount || 0, medium: dashboard?.mediumCount || 0, low: dashboard?.lowCount || 0 },
  ];

  // Mock budget data
  const budgetData = [
    { name: "Critical", cost: dashboard?.criticalCount ? dashboard.criticalCount * 25000 : 0, hours: dashboard?.criticalCount ? dashboard.criticalCount * 160 : 0 },
    { name: "High", cost: dashboard?.highCount ? dashboard.highCount * 10000 : 0, hours: dashboard?.highCount ? dashboard.highCount * 80 : 0 },
    { name: "Medium", cost: dashboard?.mediumCount ? dashboard.mediumCount * 3000 : 0, hours: dashboard?.mediumCount ? dashboard.mediumCount * 24 : 0 },
    { name: "Low", cost: dashboard?.lowCount ? dashboard.lowCount * 500 : 0, hours: dashboard?.lowCount ? dashboard.lowCount * 4 : 0 },
  ];

  const totalCost = budgetData.reduce((sum, item) => sum + item.cost, 0);
  const totalHours = budgetData.reduce((sum, item) => sum + item.hours, 0);

  // Mock SLA data
  const slaData = {
    onTime: dashboard ? Math.floor(dashboard.totalVulnerabilities * 0.65) : 0,
    approaching: dashboard ? Math.floor(dashboard.totalVulnerabilities * 0.25) : 0,
    breached: dashboard ? Math.floor(dashboard.totalVulnerabilities * 0.10) : 0,
  };

  const slaChartData = [
    { name: "On Time", value: slaData.onTime, color: "#10b981" },
    { name: "Approaching", value: slaData.approaching, color: "#f59e0b" },
    { name: "Breached", value: slaData.breached, color: "#ef4444" },
  ];

  // Mock risk heat map data
  const riskHeatData = [
    { app: "API Server", critical: 3, high: 5, medium: 8, low: 2 },
    { app: "Database", critical: 2, high: 4, medium: 6, low: 3 },
    { app: "Dev Server", critical: 1, high: 2, medium: 4, low: 5 },
  ];

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
              Advanced analytics and risk management by VP ownership
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

            {/* Tabbed Interface for Advanced Features */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" data-testid="tab-overview">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="trends" data-testid="tab-trends">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="budget" data-testid="tab-budget">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Budget Impact
                </TabsTrigger>
                <TabsTrigger value="sla" data-testid="tab-sla">
                  <Clock className="h-4 w-4 mr-2" />
                  SLA Tracking
                </TabsTrigger>
                <TabsTrigger value="risk" data-testid="tab-risk">
                  <Target className="h-4 w-4 mr-2" />
                  Risk Heat Map
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Vulnerabilities</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-total-vulns">
                        {dashboard.totalVulnerabilities}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Across {dashboard.totalAssets} applications</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Critical</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500" data-testid="text-critical-count">
                        {dashboard.criticalCount}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Immediate action required</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">High</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-500" data-testid="text-high-count">
                        {dashboard.highCount}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Priority remediation</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Medium + Low</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-medium-low-count">
                        {dashboard.mediumCount + dashboard.lowCount}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Scheduled remediation</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Applications Grid */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      Applications Under {dashboard.vpName}
                    </CardTitle>
                    <CardDescription>
                      Assets and applications owned by this VP
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {dashboard.applications.map((app) => (
                        <Link key={app.id} href={`/assets/${app.id}`}>
                          <div className="p-4 rounded-md border hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-application-${app.id}`}>
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-sm">{app.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {app.type}
                              </Badge>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <span className={`font-semibold ${getSeverityColor("CRITICAL")}`}>
                                C: {app.criticalVulnCount}
                              </span>
                              <span className={`font-semibold ${getSeverityColor("HIGH")}`}>
                                H: {app.highVulnCount}
                              </span>
                              <span className="font-semibold text-muted-foreground">
                                Total: {app.vulnerabilityCount}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Vulnerabilities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Vulnerabilities by Risk Score</CardTitle>
                    <CardDescription>Highest priority vulnerabilities affecting your portfolio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboard.topVulnerabilities.map((vuln) => (
                        <Link key={vuln.id} href={`/vulnerabilities/${vuln.id}`}>
                          <div className="flex items-center justify-between p-3 rounded-md border hover-elevate active-elevate-2 cursor-pointer" data-testid={`vuln-${vuln.id}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-xs font-mono">{vuln.cveId}</code>
                                <FindingTypeBadge findingType={vuln.findingType} />
                              </div>
                              <p className="text-sm font-medium truncate">{vuln.title}</p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <Badge variant={vuln.severity === "CRITICAL" ? "destructive" : "default"} data-testid={`badge-severity-${vuln.id}`}>
                                {vuln.severity}
                              </Badge>
                              <div className="text-right">
                                <div className="text-sm font-bold">{vuln.riskScore}</div>
                                <div className="text-xs text-muted-foreground">Risk</div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Vulnerability Trend Analysis (30/60/90 Days)
                    </CardTitle>
                    <CardDescription>
                      Historical vulnerability counts by severity over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="critical" fill="#ef4444" name="Critical" />
                        <Bar dataKey="high" fill="#f59e0b" name="High" />
                        <Bar dataKey="medium" fill="#eab308" name="Medium" />
                        <Bar dataKey="low" fill="#3b82f6" name="Low" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-md border">
                        <div className="text-sm text-muted-foreground mb-1">90-Day Reduction</div>
                        <div className="text-2xl font-bold text-green-500">-28%</div>
                        <div className="text-xs text-muted-foreground mt-1">Positive trend</div>
                      </div>
                      <div className="p-4 rounded-md border">
                        <div className="text-sm text-muted-foreground mb-1">Critical Vulns Trend</div>
                        <div className="text-2xl font-bold text-green-500">↓ 33%</div>
                        <div className="text-xs text-muted-foreground mt-1">Great progress</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Budget Impact Tab */}
              <TabsContent value="budget" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Estimated Remediation Cost
                      </CardTitle>
                      <CardDescription>
                        Total budget impact across all vulnerabilities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-foreground mb-2">
                        ${totalCost.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">
                        Approximately {totalHours.toLocaleString()} engineering hours
                      </p>
                      <div className="space-y-3">
                        {budgetData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between p-3 rounded-md border">
                            <div>
                              <div className="font-medium text-sm">{item.name} Severity</div>
                              <div className="text-xs text-muted-foreground">{item.hours} hours</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">${item.cost.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Budget Breakdown by Severity</CardTitle>
                      <CardDescription>Cost distribution across vulnerability types</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={budgetData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: $${entry.cost.toLocaleString()}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="cost"
                          >
                            {budgetData.map((_, index) => {
                              const colors = ["#ef4444", "#f59e0b", "#eab308", "#3b82f6"];
                              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                            })}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* SLA Tracking Tab */}
              <TabsContent value="sla" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">On Time</CardTitle>
                      <Clock className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500" data-testid="text-sla-ontime">
                        {slaData.onTime}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Within SLA window</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Approaching</CardTitle>
                      <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-500" data-testid="text-sla-approaching">
                        {slaData.approaching}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Due within 48 hours</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Breached</CardTitle>
                      <Clock className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500" data-testid="text-sla-breached">
                        {slaData.breached}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Past due date</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>SLA Compliance Distribution</CardTitle>
                    <CardDescription>Overall SLA performance across all vulnerabilities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={slaChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {slaChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center">
                      <div className="text-sm text-muted-foreground">SLA Compliance Rate</div>
                      <div className="text-3xl font-bold text-green-500">
                        {dashboard.totalVulnerabilities ? Math.round((slaData.onTime / dashboard.totalVulnerabilities) * 100) : 0}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Risk Heat Map Tab */}
              <TabsContent value="risk" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Risk Heat Map: Applications vs Severity
                    </CardTitle>
                    <CardDescription>
                      Visual representation of vulnerability distribution across applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={riskHeatData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="app" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                        <Bar dataKey="high" stackId="a" fill="#f59e0b" name="High" />
                        <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
                        <Bar dataKey="low" stackId="a" fill="#3b82f6" name="Low" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      {riskHeatData.map((app) => {
                        const totalRisk = app.critical * 10 + app.high * 5 + app.medium * 2 + app.low;
                        return (
                          <div key={app.app} className="p-4 rounded-md border">
                            <div className="font-medium text-sm mb-2">{app.app}</div>
                            <div className="text-2xl font-bold">{totalRisk}</div>
                            <div className="text-xs text-muted-foreground mt-1">Weighted Risk Score</div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Dashboard Data</h3>
                <p className="text-muted-foreground">
                  No vulnerability data found for the selected VP.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
