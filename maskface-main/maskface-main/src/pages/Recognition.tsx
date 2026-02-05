import { useState } from 'react';
import { ArrowRight, Wand2, RotateCcw, Download, FileJson } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FaceUploadZone } from '@/components/dashboard/FaceUploadZone';
import { PipelineVisualization } from '@/components/dashboard/PipelineVisualization';
import { RecognitionResults } from '@/components/dashboard/RecognitionResults';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRecognitionLogs, RecognitionLog } from '@/hooks/useRecognitionLogs';
import { toast } from 'sonner';
import { downloadReport, downloadJSONReport } from '@/utils/reportGenerator';
 import { BatchProcessing } from '@/components/dashboard/BatchProcessing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Recognition() {
  const { logs, createLog, processRecognition } = useRecognitionLogs();
  const [uploadedImage, setUploadedImage] = useState<{ url: string; path: string } | null>(null);
  const [currentResult, setCurrentResult] = useState<RecognitionLog | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUploaded = (url: string, path: string) => {
    setUploadedImage({ url, path });
    setCurrentResult(null);
  };

  const startRecognition = async () => {
    if (!uploadedImage) return;

    // Create log entry
    const log = await createLog(uploadedImage.path);
    if (!log) return;

    setCurrentResult(log);
    setIsProcessing(true);

    // Process recognition
    const result = await processRecognition(uploadedImage.url, log.id);
    setIsProcessing(false);

    if (result?.success) {
      toast.success('Recognition complete!');
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setCurrentResult(null);
    setIsProcessing(false);
  };

  const handleDownloadText = () => {
    if (displayResult) {
      downloadReport(displayResult);
      toast.success('Text report downloaded');
    }
  };

  const handleDownloadJSON = () => {
    if (displayResult) {
      downloadJSONReport(displayResult);
      toast.success('JSON report downloaded');
    }
  };

  // Get updated result from logs
  const displayResult = currentResult 
    ? logs.find(l => l.id === currentResult.id) || currentResult
    : null;

  const pipelinePhase: 'idle' | 'processing' | 'done' = !uploadedImage
    ? 'idle'
    : (displayResult && displayResult.status !== 'pending' && displayResult.status !== 'processing')
      ? 'done'
      : (isProcessing || !!displayResult)
        ? 'processing'
        : 'idle';

  return (
    <DashboardLayout 
      title="Face Recognition" 
      subtitle="Upload and process masked face images"
    >
      <Tabs defaultValue="single" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="single">Single Image</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          {/* Pipeline Status */}
          <Card className="p-6 border-border bg-card">
            <PipelineVisualization phase={pipelinePhase} hasInput={!!uploadedImage} />
          </Card>

          {/* Main Processing Area */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Input */}
            <div className="lg:col-span-2">
              <Card className="p-6 border-border bg-card">
                <h3 className="font-semibold mb-4">Masked Face Input</h3>
                <FaceUploadZone 
                  onImageUploaded={handleImageUploaded} 
                  className="min-h-[350px]"
                />
              </Card>
            </div>

            {/* Arrow / Action */}
            <div className="flex flex-col items-center justify-center lg:col-span-1 py-8">
              <Button
                size="lg"
                onClick={startRecognition}
                disabled={!uploadedImage || isProcessing}
                className="w-full max-w-[160px] gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Recognize
                  </>
                )}
              </Button>
              
              {displayResult && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="mt-4 text-muted-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>

            {/* Output */}
            <div className="lg:col-span-2">
              <Card className="p-6 border-border bg-card">
                <h3 className="font-semibold mb-4">Recognition Output</h3>
                {displayResult ? (
                  <>
                    <RecognitionResults result={displayResult} isProcessing={isProcessing} />
                    {displayResult.status !== 'pending' && displayResult.status !== 'processing' && (
                      <div className="mt-4 flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="gap-2">
                              <Download className="w-4 h-4" />
                              Download Report
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleDownloadText}>
                              <Download className="w-4 h-4 mr-2" />
                              Text Report (.txt)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDownloadJSON}>
                              <FileJson className="w-4 h-4 mr-2" />
                              JSON Report (.json)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </>
                ) : isProcessing ? (
                  <RecognitionResults isProcessing />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[350px] text-center text-muted-foreground">
                    <ArrowRight className="w-12 h-12 mb-4 opacity-30" />
                    <p className="text-sm">Upload an image and click Recognize to start</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="batch">
           <BatchProcessing />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}