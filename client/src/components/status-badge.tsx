import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ACCEPTED";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  OPEN: {
    label: "Open",
    color: "text-red-100",
    bgColor: "bg-red-950/30",
    borderColor: "border-red-900/30",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-blue-100",
    bgColor: "bg-blue-950/30",
    borderColor: "border-blue-900/30",
  },
  RESOLVED: {
    label: "Resolved",
    color: "text-green-100",
    bgColor: "bg-green-950/30",
    borderColor: "border-green-900/30",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "text-gray-100",
    bgColor: "bg-gray-950/30",
    borderColor: "border-gray-900/30",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

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
      data-testid={`badge-status-${status.toLowerCase()}`}
    >
      {config.label}
    </Badge>
  );
}
