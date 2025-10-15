import { Badge } from "@/components/ui/badge";
import { Code, Key, Cloud } from "lucide-react";

interface FindingTypeBadgeProps {
  findingType: "CODE_VULNERABILITY" | "SECRET_EXPOSURE" | "CLOUD_SECURITY";
  className?: string;
}

export function FindingTypeBadge({ findingType, className = "" }: FindingTypeBadgeProps) {
  const config = {
    CODE_VULNERABILITY: {
      label: "Code Vuln",
      icon: Code,
      className: "bg-blue-950/30 text-blue-100 border-blue-900/30",
    },
    SECRET_EXPOSURE: {
      label: "Secret",
      icon: Key,
      className: "bg-purple-950/30 text-purple-100 border-purple-900/30",
    },
    CLOUD_SECURITY: {
      label: "Cloud",
      icon: Cloud,
      className: "bg-cyan-950/30 text-cyan-100 border-cyan-900/30",
    },
  };

  const { label, icon: Icon, className: badgeClassName } = config[findingType];

  return (
    <Badge variant="outline" className={`${badgeClassName} ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
