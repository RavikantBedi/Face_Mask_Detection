import { CheckCircle, AlertTriangle, XCircle, Clock, Filter, Download, RefreshCw, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRecognitionLogs } from '@/hooks/useRecognitionLogs';
import { format } from 'date-fns';

const statusConfig = {
  pending: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Pending' },
  processing: { icon: Loader2, color: 'text-primary', bg: 'bg-primary/10', label: 'Processing' },
  success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Success' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', label: 'Low Confidence' },
  failed: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Failed' },
};

export default function Activity() {
  const { logs, loading, stats, refetch } = useRecognitionLogs();

  return (
    <DashboardLayout 
      title="Activity Log" 
      subtitle="Complete system activity and recognition history"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.successful}</p>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.warnings}</p>
              <p className="text-xs text-muted-foreground">Low Confidence</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {stats.avgProcessingTime > 0 ? `${Math.round(stats.avgProcessingTime)}ms` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Avg. Time</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-border bg-card mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Input 
            placeholder="Search by subject ID..." 
            className="max-w-xs bg-muted/50"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button variant="outline" size="sm">All Status</Button>
            <Button variant="outline" size="sm">Last 24h</Button>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2" onClick={refetch}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="secondary" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Activity Table */}
      <Card className="border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <p>No recognition history yet. Upload an image to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Timestamp</TableHead>
                <TableHead className="text-muted-foreground">Subject</TableHead>
                <TableHead className="text-muted-foreground">Confidence</TableHead>
                <TableHead className="text-muted-foreground">SSIM</TableHead>
                <TableHead className="text-muted-foreground">Time</TableHead>
                <TableHead className="text-muted-foreground">Database</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const status = statusConfig[log.status];
                const StatusIcon = status.icon;

                return (
                  <TableRow key={log.id} className="border-border hover:bg-muted/30">
                    <TableCell>
                      <div className={cn("p-1.5 rounded-md w-fit", status.bg)}>
                        <StatusIcon className={cn(
                          "w-4 h-4",
                          status.color,
                          log.status === 'processing' && "animate-spin"
                        )} />
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.subject_id || (log.status === 'processing' ? 'Processing...' : 'Unknown')}
                    </TableCell>
                    <TableCell>
                      {log.confidence ? (
                        <span className={cn(
                          "font-mono",
                          log.confidence >= 85 && "text-success",
                          log.confidence >= 70 && log.confidence < 85 && "text-warning",
                          log.confidence < 70 && "text-destructive"
                        )}>
                          {log.confidence.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ssim_score ? log.ssim_score.toFixed(3) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.processing_time_ms ? `${log.processing_time_ms}ms` : '—'}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{log.database_used}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </DashboardLayout>
  );
}