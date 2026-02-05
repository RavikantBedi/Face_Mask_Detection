import { ScanFace, Users, BarChart3, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PipelineVisualization } from '@/components/dashboard/PipelineVisualization';
import { FaceUploadZone } from '@/components/dashboard/FaceUploadZone';
import { RecognitionResults } from '@/components/dashboard/RecognitionResults';
import { RecentRecognitions } from '@/components/dashboard/RecentRecognitions';
import { SystemStatusCard } from '@/components/dashboard/SystemStatusCard';
import { DatabaseStats } from '@/components/dashboard/DatabaseStats';
import { Card } from '@/components/ui/card';
import { useRecognitionLogs, RecognitionLog } from '@/hooks/useRecognitionLogs';
import { useState } from 'react';
import { toast } from 'sonner';

const Index = () => {
  const { logs, loading, stats, createLog, processRecognition } = useRecognitionLogs();
  const [currentResult, setCurrentResult] = useState<RecognitionLog | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUploaded = async (url: string, path: string) => {
    // Create a recognition log entry
    const log = await createLog(path);
    if (!log) return;

    setCurrentResult(log);
    setIsProcessing(true);

    // Process the recognition
    const result = await processRecognition(url, log.id);
    setIsProcessing(false);

    if (result?.success) {
      toast.success('Recognition complete!');
      // The log will be updated via realtime subscription
      const updatedLog = logs.find(l => l.id === log.id);
      if (updatedLog) {
        setCurrentResult(updatedLog);
      }
    }
  };

  // Get the latest result from logs if we have one processing
  const displayResult = currentResult 
    ? logs.find(l => l.id === currentResult.id) || currentResult
    : null;

  const hasInput = !!currentResult;
  const pipelinePhase: 'idle' | 'processing' | 'done' = !hasInput
    ? 'idle'
    : (displayResult && displayResult.status !== 'pending' && displayResult.status !== 'processing')
      ? 'done'
      : 'processing';

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Masked Face Recognition System Overview"
    >
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Recognitions"
          value={stats.total.toLocaleString()}
          subtitle="Your history"
          trend={stats.total > 0 ? { value: 12.5, direction: 'up' } : undefined}
          icon={<ScanFace className="w-4 h-4 text-primary" />}
          variant="primary"
        />
        <MetricCard
          title="Successful"
          value={stats.successful.toLocaleString()}
          subtitle="High confidence matches"
          icon={<Users className="w-4 h-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Avg. SSIM Score"
          value={stats.avgSsim > 0 ? stats.avgSsim.toFixed(3) : '—'}
          subtitle="Structural similarity"
          trend={stats.avgSsim > 0 ? { value: 2.3, direction: 'up' } : undefined}
          icon={<BarChart3 className="w-4 h-4 text-success" />}
          variant="success"
        />
        <MetricCard
          title="Avg. Processing"
          value={stats.avgProcessingTime > 0 ? `${Math.round(stats.avgProcessingTime)}ms` : '—'}
          subtitle="Response time"
          icon={<Clock className="w-4 h-4 text-muted-foreground" />}
        />
      </div>

      {/* Pipeline Visualization */}
      <Card className="p-6 mb-6 border-border bg-card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Recognition Pipeline</h2>
          <p className="text-sm text-muted-foreground">Real-time processing stages visualization</p>
        </div>
        <PipelineVisualization phase={pipelinePhase} hasInput={hasInput} />
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & Recognition */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Input Image</h3>
              <FaceUploadZone 
                onImageUploaded={handleImageUploaded}
                className="h-full min-h-[320px]" 
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Recognition Results</h3>
              <RecognitionResults result={displayResult} isProcessing={isProcessing} />
            </div>
          </div>

          {/* Recent Activity */}
          <RecentRecognitions logs={logs} loading={loading} />
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          <SystemStatusCard />
          <DatabaseStats />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;