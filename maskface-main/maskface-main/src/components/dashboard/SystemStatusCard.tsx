import { Activity, Database, Cpu, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface SystemMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'normal' | 'warning' | 'critical';
}

const metrics: SystemMetric[] = [
  { label: 'GPU Utilization', value: 67, max: 100, unit: '%', icon: Activity, status: 'normal' },
  { label: 'Database Connections', value: 24, max: 50, unit: '/50', icon: Database, status: 'normal' },
  { label: 'CPU Load', value: 42, max: 100, unit: '%', icon: Cpu, status: 'normal' },
  { label: 'Storage Used', value: 284, max: 500, unit: 'GB', icon: HardDrive, status: 'warning' },
];

const statusColors = {
  normal: 'text-success',
  warning: 'text-warning',
  critical: 'text-destructive',
};

export function SystemStatusCard() {
  return (
    <div className="data-card rounded-xl border border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold">System Status</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time infrastructure metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-success font-medium">Operational</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const percentage = (metric.value / metric.max) * 100;

          return (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{metric.label}</span>
                </div>
                <span className={cn("text-sm font-mono font-medium", statusColors[metric.status])}>
                  {metric.value}{metric.unit}
                </span>
              </div>
              <Progress 
                value={percentage} 
                className={cn(
                  "h-1.5 bg-muted",
                  metric.status === 'warning' && "[&>div]:bg-warning",
                  metric.status === 'critical' && "[&>div]:bg-destructive"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}