import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeverityBadge } from "@/components/severity-badge";
import { StatusBadge } from "@/components/status-badge";
import { FindingTypeBadge } from "@/components/finding-type-badge";
import { Search, ArrowUpDown } from "lucide-react";
import type { Vulnerability } from "@shared/schema";

export default function Vulnerabilities() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [findingTypeFilter, setFindingTypeFilter] = useState<string>("ALL");

  const { data: vulnerabilities, isLoading } = useQuery<Vulnerability[]>({
    queryKey: ["/api/vulnerabilities"],
  });

  const filteredVulnerabilities = vulnerabilities?.filter((vuln) => {
    const matchesSearch =
      vuln.cveId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      severityFilter === "ALL" || vuln.severity === severityFilter;
    const matchesStatus = statusFilter === "ALL" || vuln.status === statusFilter;
    const matchesFindingType =
      findingTypeFilter === "ALL" || vuln.findingType === findingTypeFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesFindingType;
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading vulnerabilities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vulnerabilities</h1>
        <p className="text-muted-foreground">
          Manage and prioritize security vulnerabilities across your infrastructure
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by CVE ID or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-vulnerabilities"
          />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-severity-filter">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Severities</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={findingTypeFilter} onValueChange={setFindingTypeFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-finding-type-filter">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="CODE_VULNERABILITY">Code Vulnerabilities</SelectItem>
            <SelectItem value="SECRET_EXPOSURE">Secret Exposures</SelectItem>
            <SelectItem value="CLOUD_SECURITY">Cloud Security</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-card-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  Risk Score
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>CVE ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>CVSS</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Assets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVulnerabilities && filteredVulnerabilities.length > 0 ? (
              filteredVulnerabilities.map((vuln) => (
                <TableRow
                  key={vuln.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => setLocation(`/vulnerabilities/${vuln.id}`)}
                  data-testid={`row-vulnerability-${vuln.id}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="text-lg font-bold"
                        data-testid={`text-risk-score-${vuln.id}`}
                      >
                        {vuln.riskScore}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                      {vuln.cveId}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-md truncate font-medium">
                    {vuln.title}
                  </TableCell>
                  <TableCell>
                    <FindingTypeBadge
                      findingType={vuln.findingType as "CODE_VULNERABILITY" | "SECRET_EXPOSURE" | "CLOUD_SECURITY"}
                    />
                  </TableCell>
                  <TableCell>
                    <SeverityBadge
                      severity={vuln.severity as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {vuln.cvssScore}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={
                        vuln.status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ACCEPTED"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {vuln.sourceIntegration}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{vuln.assetIds.length} assets</span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="text-muted-foreground">
                    No vulnerabilities found. Try adjusting your filters.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
