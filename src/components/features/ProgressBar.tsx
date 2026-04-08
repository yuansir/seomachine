import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;           // 0-100
  message?: string;        // Optional status message
  showPercentage?: boolean; // Default true
}

export function ProgressBar({ value, message, showPercentage = true }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Progress value={value} className="flex-1" />
        {showPercentage && <span className="text-sm font-medium w-12">{value}%</span>}
      </div>
      {message && <p className="text-sm text-muted-foreground text-center">{message}</p>}
    </div>
  );
}
