import { Flame, Snowflake, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { heatClass, type HeatInfo } from "@/lib/utils/heat";

const ICONS = {
  hot: Flame,
  fast: TrendingUp,
  warm: Clock,
  cold: Snowflake,
  neutral: AlertCircle,
} as const;

export function HeatBadge({
  heat,
  size = "sm",
  showIcon = true,
  className,
}: {
  heat: HeatInfo;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}) {
  const Icon = ICONS[heat.level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        heatClass(heat.level),
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className,
      )}
      title={heat.description}
    >
      {showIcon && <Icon className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />}
      {heat.label}
    </span>
  );
}
