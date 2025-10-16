import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { IntegrationCard } from "@/components/integration-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Shield, Code, Cloud, Ticket, CheckCircle, XCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Integration, InsertIntegration } from "@shared/schema";

export default function Integrations() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [formData, setFormData] = useState<Partial<InsertIntegration>>({
    name: "",
    type: "VULN_SCANNER",
    status: "DISCONNECTED",
    enabled: true,
  });

  const { toast } = useToast();

  const { data: integrations, isLoading } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
  });

  const addMutation = useMutation({
    mutationFn: (data: InsertIntegration) =>
      apiRequest("POST", "/api/integrations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        type: "VULN_SCANNER",
        status: "DISCONNECTED",
        enabled: true,
      });
      toast({
        title: "Integration added",
        description: "The integration has been successfully added.",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/integrations/${id}/sync`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Sync initiated",
        description: "The integration is now syncing vulnerabilities.",
      });
    },
  });

  const handleConfigure = (id: string) => {
    const integration = integrations?.find((i) => i.id === id);
    if (integration) {
      setSelectedIntegration(integration);
      setIsConfigureDialogOpen(true);
    }
  };

  const handleSync = (id: string) => {
    syncMutation.mutate(id);
  };

  const handleAddIntegration = () => {
    addMutation.mutate(formData as InsertIntegration);
  };

  // Filter integrations by search query and category
  const filteredIntegrations = integrations?.filter((integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || integration.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const connectedCount = integrations?.filter(i => i.status === "CONNECTED").length || 0;
  const totalCount = integrations?.length || 0;
  const codeScanners = integrations?.filter(i => i.type === "CODE_SCANNER").length || 0;
  const vulnScanners = integrations?.filter(i => i.type === "VULN_SCANNER").length || 0;
  const cloudSecurity = integrations?.filter(i => i.type === "CLOUD_SECURITY").length || 0;
  const ticketing = integrations?.filter(i => i.type === "TICKETING").length || 0;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading integrations...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
              Security Integrations
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect and manage security tools across your infrastructure
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-integration">
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {connectedCount} connected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Code Scanners</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{codeScanners}</div>
              <p className="text-xs text-muted-foreground mt-1">
                SAST, SCA, Secrets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vuln Scanners</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vulnScanners}</div>
              <p className="text-xs text-muted-foreground mt-1">
                DAST, Network, API
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cloud Security</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cloudSecurity}</div>
              <p className="text-xs text-muted-foreground mt-1">
                CSPM, CWPP, SIEM
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-integrations"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]" data-testid="select-category-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="CODE_SCANNER">Code Scanners</SelectItem>
              <SelectItem value="VULN_SCANNER">Vuln Scanners</SelectItem>
              <SelectItem value="CLOUD_SECURITY">Cloud Security</SelectItem>
              <SelectItem value="TICKETING">Ticketing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categorized Integrations */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" data-testid="tab-all">
              All ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="code" data-testid="tab-code">
              <Code className="h-4 w-4 mr-2" />
              Code ({codeScanners})
            </TabsTrigger>
            <TabsTrigger value="vuln" data-testid="tab-vuln">
              <Shield className="h-4 w-4 mr-2" />
              Vuln ({vulnScanners})
            </TabsTrigger>
            <TabsTrigger value="cloud" data-testid="tab-cloud">
              <Cloud className="h-4 w-4 mr-2" />
              Cloud ({cloudSecurity})
            </TabsTrigger>
            <TabsTrigger value="ticketing" data-testid="tab-ticketing">
              <Ticket className="h-4 w-4 mr-2" />
              Ticketing ({ticketing})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations && filteredIntegrations.length > 0 ? (
                filteredIntegrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConfigure={handleConfigure}
                    onSync={handleSync}
                  />
                ))
              ) : (
                <div className="col-span-full flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
                  <div className="text-center">
                    <p className="text-muted-foreground">No integrations found</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {integrations?.filter(i => i.type === "CODE_SCANNER").map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConfigure={handleConfigure}
                  onSync={handleSync}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vuln" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {integrations?.filter(i => i.type === "VULN_SCANNER").map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConfigure={handleConfigure}
                  onSync={handleSync}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cloud" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {integrations?.filter(i => i.type === "CLOUD_SECURITY").map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConfigure={handleConfigure}
                  onSync={handleSync}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ticketing" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {integrations?.filter(i => i.type === "TICKETING").map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConfigure={handleConfigure}
                  onSync={handleSync}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Integration Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent data-testid="dialog-add-integration">
          <DialogHeader>
            <DialogTitle>Add Integration</DialogTitle>
            <DialogDescription>
              Configure a new security tool integration to aggregate vulnerabilities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Integration Name</Label>
              <Select
                value={formData.name}
                onValueChange={(value) =>
                  setFormData({ ...formData, name: value })
                }
              >
                <SelectTrigger data-testid="select-integration-name">
                  <SelectValue placeholder="Select a tool" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Snyk">Snyk</SelectItem>
                  <SelectItem value="Checkmarx">Checkmarx</SelectItem>
                  <SelectItem value="Veracode">Veracode</SelectItem>
                  <SelectItem value="SonarQube">SonarQube</SelectItem>
                  <SelectItem value="Gitleaks">Gitleaks</SelectItem>
                  <SelectItem value="GitGuardian">GitGuardian</SelectItem>
                  <SelectItem value="Qualys">Qualys</SelectItem>
                  <SelectItem value="Nessus">Nessus</SelectItem>
                  <SelectItem value="Rapid7 InsightVM">Rapid7 InsightVM</SelectItem>
                  <SelectItem value="Wiz">Wiz</SelectItem>
                  <SelectItem value="Prisma Cloud">Prisma Cloud</SelectItem>
                  <SelectItem value="Aqua Security">Aqua Security</SelectItem>
                  <SelectItem value="ServiceNow">ServiceNow</SelectItem>
                  <SelectItem value="Jira">Jira</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Integration Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger data-testid="select-integration-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CODE_SCANNER">Code Scanner</SelectItem>
                  <SelectItem value="VULN_SCANNER">Vulnerability Scanner</SelectItem>
                  <SelectItem value="CLOUD_SECURITY">Cloud Security</SelectItem>
                  <SelectItem value="TICKETING">Ticketing System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API URL</Label>
              <Input
                id="apiUrl"
                placeholder="https://api.example.com"
                value={formData.apiUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, apiUrl: e.target.value })
                }
                data-testid="input-api-url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter API key"
                value={formData.apiKey || ""}
                onChange={(e) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                data-testid="input-api-key"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              data-testid="button-cancel-add"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddIntegration}
              disabled={!formData.name || addMutation.isPending}
              data-testid="button-save-integration"
            >
              {addMutation.isPending ? "Adding..." : "Add Integration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Integration Dialog */}
      <Dialog open={isConfigureDialogOpen} onOpenChange={setIsConfigureDialogOpen}>
        <DialogContent data-testid="dialog-configure-integration">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Update integration settings and connection details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                {selectedIntegration?.status === "CONNECTED" ? (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Disconnected
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>API URL</Label>
              <Input
                value={selectedIntegration?.apiUrl || ""}
                placeholder="https://api.example.com"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>Last Sync</Label>
              <div className="text-sm text-muted-foreground">
                {selectedIntegration?.lastSyncAt
                  ? new Date(selectedIntegration.lastSyncAt).toLocaleString()
                  : "Never"}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sync Frequency</Label>
              <div className="text-sm text-muted-foreground">
                {selectedIntegration?.syncFrequency || "Manual"}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfigureDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
