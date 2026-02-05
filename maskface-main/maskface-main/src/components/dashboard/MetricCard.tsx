import { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantStyles = {
  default: 'border-border',
  primary: 'border-primary/30 bg-primary/5',
  success: 'border-success/30 bg-success/5',
  warning: 'border-warning/30 bg-warning/5',
};

const trendColors = {
  up: 'text-success',
  down: 'text-destructive',
  neutral: 'text-muted-foreground',
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
  variant = 'default',
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "data-card p-5 rounded-xl border",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && (
          <div className="p-2 rounded-lg bg-muted/50">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="metric-value text-foreground">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {trend && (
          <div className={cn("flex items-center gap-1 text-sm font-medium", trendColors[trend.direction])}>
            {trend.direction === 'up' && <ArrowUp className="w-4 h-4" />}
            {trend.direction === 'down' && <ArrowDown className="w-4 h-4" />}
            {trend.direction === 'neutral' && <Minus className="w-4 h-4" />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  );
}