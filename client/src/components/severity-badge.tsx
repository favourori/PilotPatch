import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

const severityConfig: Record<
  SeverityLevel,
  { color: string; bgColor: string; borderColor: string }
> = {
  CRITICAL: {
    color: "text-red-100",
    bgColor: "bg-red-950/50",
    borderColor: "border-red-900/50",
  },
  HIGH: {
    color: "text-orange-100",
    bgColor: "bg-orange-950/50",
    borderColor: "border-orange-900/50",
  },
  MEDIUM: {
    color: "text-yellow-100",
    bgColor: "bg-yellow-950/50",
    borderColor: "border-yellow-900/50",
  },
  LOW: {
    color: "text-blue-100",
    bgColor: "bg-blue-950/50",
    borderColor: "border-blue-900/50",
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];

  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-medium",
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
      data-testid={`badge-severity-${severity.toLowerCase()}`}
    >
      {severity}
    </Badge>
  );
}
