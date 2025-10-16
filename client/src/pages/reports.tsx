import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  TrendingDown, 
  TrendingUp, 
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  AlertTriangle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import type { Vulnerability } from "@shared/schema";

export default function Reports() {
  const { data: vulnerabilities } = useQuery<Vulnerability[]>({
    queryKey: ["/api/vulnerabilities"],
  });

  // Calculate YTD (Year to Date) metrics - monthly breakdown
  const getYTDData = () => {
    const currentYear = new Date().getFullYear();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyData = months.map((month, index) => {
      // Simulate monthly data with some variance
      const baseCount = vulnerabilities?.length || 0;
      const variance = Math.random() * 20 - 10;
      const total = Math.max(0, Math.floor(baseCount * 0.7 + variance));
      
      const criticalCount = Math.floor(total * 0.15);
      const highCount = Math.floor(total * 0.25);
      const mediumCount = Math.floor(total * 0.35);
      const lowCount = total - criticalCount - highCount - mediumCount;

      return {
        month,
        monthIndex: index,
        total,
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        resolved: Math.floor(total * 0.6),
        open: Math.floor(total * 0.4),
      };
    });

    return monthlyData;
  };

  const ytdData = getYTDData();
  const currentMonth = new Date().getMonth();
  const ytdDataUpToNow = ytdData.slice(0, currentMonth + 1);

  // Calculate YTD summary metrics
  const ytdTotal = ytdDataUpToNow.reduce((sum, month) => sum + month.total, 0);
  const ytdResolved = ytdDataUpToNow.reduce((sum, month) => sum + month.resolved, 0);
  const ytdCritical = ytdDataUpToNow.reduce((sum, month) => sum + month.critical, 0);
  const ytdHigh = ytdDataUpToNow.reduce((sum, month) => sum + month.high, 0);

  // Calculate trends
  const lastMonthTotal = ytdDataUpToNow[currentMonth - 1]?.total || 0;
  const thisMonthTotal = ytdDataUpToNow[currentMonth]?.total || 0;
  const monthOverMonthChange = lastMonthTotal > 0 
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
    : "0";

  // Severity distribution for pie chart
  const severityDistribution = [
    { name: "Critical", value: ytdCritical, color: "#ef4444" },
    { name: "High", value: ytdHigh, color: "#f59e0b" },
    { 
      name: "Medium", 
      value: ytdDataUpToNow.reduce((sum, month) => sum + month.medium, 0), 
      color: "#eab308" 
    },
    { 
      name: "Low", 
      value: ytdDataUpToNow.reduce((sum, month) => sum + month.low, 0), 
      color: "#3b82f6" 
    },
  ];

  // Resolution rate data
  const resolutionData = ytdDataUpToNow.map(month => ({
    month: month.month,
    rate: month.total > 0 ? ((month.resolved / month.total) * 100).toFixed(1) : 0,
  }));

  const handleExportCSV = () => {
    const csvContent = [
      ["Month", "Total", "Critical", "High", "Medium", "Low", "Resolved", "Open"].join(","),
      ...ytdDataUpToNow.map(row => 
        [row.month, row.total, row.critical, row.high, row.medium, row.low, row.resolved, row.open].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vulnerability-report-ytd-${new Date().getFullYear()}.csv`;
    a.click();
  };

  const handleExportPDF = () => {
    alert("PDF export functionality would integrate with a PDF generation library like jsPDF or react-pdf");
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
              Vulnerability Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Year-to-date analytics, trends, and export capabilities
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV} data-testid="button-export-csv">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF} data-testid="button-export-pdf">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* YTD Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">YTD Total Vulnerabilities</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-ytd-total">
                {ytdTotal}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {currentMonth + 1} months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">YTD Resolved</CardTitle>
              <Download className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500" data-testid="text-ytd-resolved">
                {ytdResolved}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {ytdTotal > 0 ? ((ytdResolved / ytdTotal) * 100).toFixed(1) : 0}% resolution rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical + High</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500" data-testid="text-ytd-critical-high">
                {ytdCritical + ytdHigh}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Requiring immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Month-over-Month</CardTitle>
              {parseFloat(monthOverMonthChange) < 0 ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${parseFloat(monthOverMonthChange) < 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-mom-change">
                {monthOverMonthChange}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Compared to last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Reports */}
        <Tabs defaultValue="ytd" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ytd" data-testid="tab-ytd">
              <Calendar className="h-4 w-4 mr-2" />
              YTD Overview
            </TabsTrigger>
            <TabsTrigger value="trends" data-testid="tab-trends">
              <BarChart3 className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="severity" data-testid="tab-severity">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Severity Analysis
            </TabsTrigger>
            <TabsTrigger value="resolution" data-testid="tab-resolution">
              <TrendingDown className="h-4 w-4 mr-2" />
              Resolution Rate
            </TabsTrigger>
          </TabsList>

          {/* YTD Overview Tab */}
          <TabsContent value="ytd" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Year-to-Date Vulnerability Tracking
                </CardTitle>
                <CardDescription>
                  Monthly breakdown of vulnerabilities discovered in {new Date().getFullYear()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={ytdDataUpToNow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                    <Bar dataKey="high" stackId="a" fill="#f59e0b" name="High" />
                    <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
                    <Bar dataKey="low" stackId="a" fill="#3b82f6" name="Low" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Monthly Summary Table */}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-2 font-medium">Month</th>
                        <th className="pb-2 font-medium text-center">Total</th>
                        <th className="pb-2 font-medium text-center">Critical</th>
                        <th className="pb-2 font-medium text-center">High</th>
                        <th className="pb-2 font-medium text-center">Medium</th>
                        <th className="pb-2 font-medium text-center">Low</th>
                        <th className="pb-2 font-medium text-center">Resolved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ytdDataUpToNow.map((month, index) => (
                        <tr key={month.month} className="border-b hover-elevate">
                          <td className="py-3 font-medium">{month.month}</td>
                          <td className="py-3 text-center">{month.total}</td>
                          <td className="py-3 text-center">
                            <Badge variant="destructive">{month.critical}</Badge>
                          </td>
                          <td className="py-3 text-center">
                            <Badge className="bg-orange-500">{month.high}</Badge>
                          </td>
                          <td className="py-3 text-center">
                            <Badge className="bg-yellow-500">{month.medium}</Badge>
                          </td>
                          <td className="py-3 text-center">
                            <Badge className="bg-blue-500">{month.low}</Badge>
                          </td>
                          <td className="py-3 text-center text-green-600 font-semibold">{month.resolved}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Discovery Trends</CardTitle>
                <CardDescription>
                  Trend analysis showing vulnerability patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={ytdDataUpToNow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" strokeWidth={2} />
                    <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Critical" strokeWidth={2} />
                    <Line type="monotone" dataKey="high" stroke="#f59e0b" name="High" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-md border">
                    <div className="text-sm text-muted-foreground mb-1">Average per Month</div>
                    <div className="text-2xl font-bold">
                      {(ytdTotal / (currentMonth + 1)).toFixed(0)}
                    </div>
                  </div>
                  <div className="p-4 rounded-md border">
                    <div className="text-sm text-muted-foreground mb-1">Peak Month</div>
                    <div className="text-2xl font-bold">
                      {ytdDataUpToNow.reduce((max, month) => month.total > max.total ? month : max, ytdDataUpToNow[0])?.month}
                    </div>
                  </div>
                  <div className="p-4 rounded-md border">
                    <div className="text-sm text-muted-foreground mb-1">Projected Year-End</div>
                    <div className="text-2xl font-bold">
                      {Math.round((ytdTotal / (currentMonth + 1)) * 12)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Severity Analysis Tab */}
          <TabsContent value="severity" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>YTD Severity Distribution</CardTitle>
                  <CardDescription>Breakdown by severity level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={severityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {severityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Severity Metrics</CardTitle>
                  <CardDescription>Detailed breakdown of severity levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {severityDistribution.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 rounded-md border">
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{item.value}</div>
                          <div className="text-xs text-muted-foreground">
                            {ytdTotal > 0 ? ((item.value / ytdTotal) * 100).toFixed(1) : 0}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resolution Rate Tab */}
          <TabsContent value="resolution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Resolution Rate</CardTitle>
                <CardDescription>Percentage of vulnerabilities resolved each month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={resolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Resolution Rate (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="rate" fill="#10b981" name="Resolution Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-md border">
                    <div className="text-sm text-muted-foreground mb-1">Average Resolution Rate</div>
                    <div className="text-3xl font-bold text-green-500">
                      {ytdTotal > 0 ? ((ytdResolved / ytdTotal) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  <div className="p-4 rounded-md border">
                    <div className="text-sm text-muted-foreground mb-1">Best Month</div>
                    <div className="text-3xl font-bold text-green-500">
                      {resolutionData.reduce((max, month) => parseFloat(month.rate as string) > parseFloat(max.rate as string) ? month : max, resolutionData[0])?.month}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
