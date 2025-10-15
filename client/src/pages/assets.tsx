import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Server, Database, Cloud, Monitor } from "lucide-react";
import type { Asset } from "@shared/schema";

const assetIcons = {
  SERVER: Server,
  DATABASE: Database,
  CLOUD: Cloud,
  APPLICATION: Monitor,
  ENDPOINT: Monitor,
};

const criticalityColors = {
  CRITICAL: "bg-red-950/50 text-red-100 border-red-900/50",
  HIGH: "bg-orange-950/50 text-orange-100 border-orange-900/50",
  MEDIUM: "bg-yellow-950/50 text-yellow-100 border-yellow-900/50",
  LOW: "bg-blue-950/50 text-blue-100 border-blue-900/50",
};

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  const filteredAssets = assets?.filter((asset) => {
    const matchesSearch = asset.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || asset.type === typeFilter;

    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Asset Inventory</h1>
        <p className="text-muted-foreground">
          Monitor and track all assets across your infrastructure
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-assets"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="SERVER">Server</SelectItem>
            <SelectItem value="APPLICATION">Application</SelectItem>
            <SelectItem value="DATABASE">Database</SelectItem>
            <SelectItem value="CLOUD">Cloud</SelectItem>
            <SelectItem value="ENDPOINT">Endpoint</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-card-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Business Criticality</TableHead>
              <TableHead>Vulnerabilities</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets && filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => {
                const Icon =
                  assetIcons[asset.type as keyof typeof assetIcons] || Server;
                return (
                  <TableRow
                    key={asset.id}
                    className="hover-elevate"
                    data-testid={`row-asset-${asset.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{asset.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {asset.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground capitalize">
                        {asset.environment.toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          criticalityColors[
                            asset.businessCriticality as keyof typeof criticalityColors
                          ]
                        }
                      >
                        {asset.businessCriticality}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span
                            className="text-sm font-semibold"
                            data-testid={`text-vuln-count-${asset.id}`}
                          >
                            {asset.vulnerabilityCount} total
                          </span>
                          {asset.criticalVulnCount > 0 && (
                            <span className="text-xs text-red-500">
                              {asset.criticalVulnCount} critical
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {asset.owner || "Unassigned"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="text-muted-foreground">
                    No assets found. Try adjusting your filters.
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
