import { CheckCircle, AlertTriangle, XCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { RecognitionLog } from '@/hooks/useRecognitionLogs';
import { formatDistanceToNow } from 'date-fns';

interface RecentRecognitionsProps {
  logs: RecognitionLog[];
  loading?: boolean;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
  processing: { icon: Loader2, color: 'text-primary', bg: 'bg-primary/10' },
  success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  failed: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export function RecentRecognitions({ logs, loading }: RecentRecognitionsProps) {
  if (loading) {
    return (
      <div className="data-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Recent Recognitions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Loading...</p>
        </div>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="data-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Recent Recognitions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">No recognitions yet</p>
        </div>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p className="text-sm">Upload an image to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-card rounded-xl border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Recent Recognitions</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Last {logs.length} processing results • Live updates enabled
        </p>
      </div>

      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {logs.slice(0, 10).map((log) => {
          const config = statusConfig[log.status];
          const StatusIcon = config.icon;

          return (
            <div 
              key={log.id} 
              className={cn(
                "flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors",
                log.status === 'processing' && "animate-pulse"
              )}
            >
              <div className={cn("p-2 rounded-lg", config.bg)}>
                <StatusIcon className={cn(
                  "w-4 h-4",
                  config.color,
                  log.status === 'processing' && "animate-spin"
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {log.subject_id || (log.status === 'processing' ? 'Processing...' : 'Unknown')}
                  </span>
                  {log.confidence && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {log.confidence.toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  {log.processing_time_ms && (
                    <>
                      <span>•</span>
                      <span>{log.processing_time_ms}ms</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}