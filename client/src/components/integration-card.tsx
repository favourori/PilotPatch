import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Integration } from "@shared/schema";

interface IntegrationCardProps {
  integration: Integration;
  onConfigure: (id: string) => void;
  onSync: (id: string) => void;
}

const integrationIcons: Record<string, string> = {
  Snyk: "🔐",
  ServiceNow: "🎫",
  Gitleaks: "🔍",
  Qualys: "🛡️",
  Nessus: "🔒",
  SonarQube: "📊",
};

export function IntegrationCard({
  integration,
  onConfigure,
  onSync,
}: IntegrationCardProps) {
  const isConnected = integration.status === "CONNECTED";
  const hasError = integration.status === "ERROR";

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-2xl">
            {integrationIcons[integration.name] || "🔌"}
          </div>
          <div>
            <CardTitle className="text-base">{integration.name}</CardTitle>
            <p className="text-xs text-muted-foreground capitalize">
              {integration.type.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isConnected && "bg-green-500",
              hasError && "bg-red-500",
              !isConnected && !hasError && "bg-gray-500"
            )}
            data-testid={`status-indicator-${integration.id}`}
          />
          <span className="text-sm font-medium">
            {isConnected && "Connected"}
            {hasError && "Error"}
            {!isConnected && !hasError && "Disconnected"}
          </span>
        </div>
        {integration.lastSyncAt && (
          <p className="text-xs text-muted-foreground">
            Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
          </p>
        )}
        {integration.syncFrequency && (
          <Badge variant="secondary" className="text-xs">
            {integration.syncFrequency.toLowerCase()}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onConfigure(integration.id)}
          data-testid={`button-configure-${integration.id}`}
        >
          <Settings className="h-4 w-4 mr-1" />
          Configure
        </Button>
        {isConnected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSync(integration.id)}
            data-testid={`button-sync-${integration.id}`}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Sync
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
