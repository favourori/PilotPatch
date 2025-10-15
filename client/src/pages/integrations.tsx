import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { IntegrationCard } from "@/components/integration-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Integration, InsertIntegration } from "@shared/schema";

export default function Integrations() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading integrations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect security tools to aggregate vulnerability data
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-integration">
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations && integrations.length > 0 ? (
          integrations.map((integration) => (
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
              <p className="text-muted-foreground">No integrations configured</p>
              <Button
                variant="ghost"
                onClick={() => setIsAddDialogOpen(true)}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add your first integration
              </Button>
            </div>
          </div>
        )}
      </div>

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
                  <SelectItem value="ServiceNow">ServiceNow</SelectItem>
                  <SelectItem value="Gitleaks">Gitleaks</SelectItem>
                  <SelectItem value="Qualys">Qualys</SelectItem>
                  <SelectItem value="Nessus">Nessus</SelectItem>
                  <SelectItem value="SonarQube">SonarQube</SelectItem>
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
                  <SelectItem value="VULN_SCANNER">Vulnerability Scanner</SelectItem>
                  <SelectItem value="CODE_SCANNER">Code Scanner</SelectItem>
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
              <div className="text-sm text-muted-foreground">
                {selectedIntegration?.status}
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
