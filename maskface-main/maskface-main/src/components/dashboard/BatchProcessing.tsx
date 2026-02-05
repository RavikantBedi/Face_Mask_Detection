 import { useState } from 'react';
 import { Play, Download, FileJson, FileText, RotateCcw, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
 import { Card } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import { BatchUploadZone, BatchImage } from './BatchUploadZone';
 import { useRecognitionLogs, RecognitionLog } from '@/hooks/useRecognitionLogs';
 import { toast } from 'sonner';
 import { format } from 'date-fns';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { cn } from '@/lib/utils';
 import { BatchResultModal } from './BatchResultModal';
 
 interface BatchResult {
   imageId: string;
   imageName: string;
   log: RecognitionLog | null;
   status: 'pending' | 'processing' | 'success' | 'warning' | 'failed';
 }
 
 export function BatchProcessing() {
   const { createLog, processRecognition, logs } = useRecognitionLogs();
   const [images, setImages] = useState<BatchImage[]>([]);
   const [results, setResults] = useState<BatchResult[]>([]);
   const [isProcessing, setIsProcessing] = useState(false);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [selectedResult, setSelectedResult] = useState<BatchResult | null>(null);
 
   const readyImages = images.filter(i => i.status === 'uploaded');
   const canProcess = readyImages.length > 0 && !isProcessing;
   const hasResults = results.length > 0 && results.every(r => r.status !== 'pending' && r.status !== 'processing');
 
   const startBatchProcessing = async () => {
     if (!canProcess) return;
 
     setIsProcessing(true);
     setCurrentIndex(0);
 
     // Initialize results
     const initialResults: BatchResult[] = readyImages.map(img => ({
       imageId: img.id,
       imageName: img.file.name,
       log: null,
       status: 'pending',
     }));
     setResults(initialResults);
 
     // Process each image sequentially
     for (let i = 0; i < readyImages.length; i++) {
       const img = readyImages[i];
       setCurrentIndex(i);
 
       // Update status to processing
       setResults(prev => prev.map((r, idx) => 
         idx === i ? { ...r, status: 'processing' } : r
       ));
 
       try {
         // Create log entry
         const log = await createLog(img.uploadedPath!);
         if (!log) {
           setResults(prev => prev.map((r, idx) => 
             idx === i ? { ...r, status: 'failed' } : r
           ));
           continue;
         }
 
         // Process recognition
         const result = await processRecognition(img.uploadedUrl!, log.id);
         
         // Wait a moment for realtime update
         await new Promise(resolve => setTimeout(resolve, 500));
         
         // Get updated log from logs state
         const updatedLog = logs.find(l => l.id === log.id) || log;
         
         setResults(prev => prev.map((r, idx) => 
           idx === i ? { 
             ...r, 
             log: updatedLog,
             status: result?.success ? (result.status || 'success') : 'failed',
           } : r
         ));
       } catch (error) {
         console.error('Batch processing error:', error);
         setResults(prev => prev.map((r, idx) => 
           idx === i ? { ...r, status: 'failed' } : r
         ));
       }
     }
 
     setIsProcessing(false);
     toast.success(`Batch processing complete: ${readyImages.length} images processed`);
   };
 
   const reset = () => {
     setImages([]);
     setResults([]);
     setCurrentIndex(0);
     setIsProcessing(false);
   };
 
   const downloadCSV = () => {
     const headers = [
       'Image Name',
       'Status',
       'Subject ID',
       'Subject Name',
       'Confidence (%)',
       'SSIM Score',
       'Processing Time (ms)',
       'Database',
       'Timestamp',
       'Error Message',
     ].join(',');
 
     const rows = results.map(r => {
       const log = r.log;
       return [
         `"${r.imageName}"`,
         r.status,
         log?.subject_id || '',
         `"${log?.subject_name || ''}"`,
         log?.confidence?.toFixed(2) || '',
         log?.ssim_score?.toFixed(4) || '',
         log?.processing_time_ms || '',
         log?.database_used || 'LFW',
         log?.created_at ? format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss') : '',
         `"${log?.error_message || ''}"`,
       ].join(',');
     });
 
     const csv = [headers, ...rows].join('\n');
     downloadFile(csv, 'text/csv', `batch-recognition-${format(new Date(), 'yyyyMMdd-HHmmss')}.csv`);
     toast.success('CSV report downloaded');
   };
 
   const downloadJSON = () => {
     const report = {
       metadata: {
         generatedAt: new Date().toISOString(),
         totalImages: results.length,
         successful: results.filter(r => r.status === 'success').length,
         warnings: results.filter(r => r.status === 'warning').length,
         failed: results.filter(r => r.status === 'failed').length,
         pipelineVersion: 'MFR-Eval v2.1 (Batch)',
       },
       summary: {
         avgConfidence: calculateAvg(results.map(r => r.log?.confidence).filter(Boolean) as number[]),
         avgSSIM: calculateAvg(results.map(r => r.log?.ssim_score).filter(Boolean) as number[]),
         avgProcessingTime: calculateAvg(results.map(r => r.log?.processing_time_ms).filter(Boolean) as number[]),
       },
       results: results.map(r => ({
         imageName: r.imageName,
         status: r.status,
         recognition: r.log ? {
           subjectId: r.log.subject_id,
           subjectName: r.log.subject_name,
           confidence: r.log.confidence,
           ssimScore: r.log.ssim_score,
           processingTimeMs: r.log.processing_time_ms,
           databaseUsed: r.log.database_used,
           createdAt: r.log.created_at,
           errorMessage: r.log.error_message,
         } : null,
       })),
     };
 
     const json = JSON.stringify(report, null, 2);
     downloadFile(json, 'application/json', `batch-recognition-${format(new Date(), 'yyyyMMdd-HHmmss')}.json`);
     toast.success('JSON report downloaded');
   };
 
   const calculateAvg = (nums: number[]): number => {
     if (nums.length === 0) return 0;
     return nums.reduce((a, b) => a + b, 0) / nums.length;
   };
 
   const downloadFile = (content: string, type: string, filename: string) => {
     const blob = new Blob([content], { type });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = filename;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     URL.revokeObjectURL(url);
   };
 
   const progressPercent = isProcessing 
     ? Math.round(((currentIndex + 1) / readyImages.length) * 100)
     : hasResults ? 100 : 0;
 
   const successCount = results.filter(r => r.status === 'success').length;
   const warningCount = results.filter(r => r.status === 'warning').length;
   const failedCount = results.filter(r => r.status === 'failed').length;
 
   return (
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       {/* Upload Section */}
       <Card className="p-6 border-border bg-card">
         <h3 className="font-semibold mb-4">Upload Images</h3>
         <BatchUploadZone
           images={images}
           onImagesChange={setImages}
           disabled={isProcessing}
         />
         
         <div className="mt-6 flex gap-3">
           <Button
             onClick={startBatchProcessing}
             disabled={!canProcess}
             className="flex-1 gap-2"
           >
             {isProcessing ? (
               <>
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Processing {currentIndex + 1}/{readyImages.length}
               </>
             ) : (
               <>
                 <Play className="w-4 h-4" />
                 Process {readyImages.length} Images
               </>
             )}
           </Button>
           
           {(images.length > 0 || results.length > 0) && (
             <Button variant="outline" onClick={reset} disabled={isProcessing}>
               <RotateCcw className="w-4 h-4" />
             </Button>
           )}
         </div>
 
         {isProcessing && (
           <div className="mt-4">
             <Progress value={progressPercent} className="h-2" />
             <p className="text-xs text-muted-foreground mt-1 text-center">
               Processing image {currentIndex + 1} of {readyImages.length}
             </p>
           </div>
         )}
       </Card>
 
       {/* Results Section */}
       <Card className="p-6 border-border bg-card">
         <div className="flex items-center justify-between mb-4">
           <h3 className="font-semibold">Results</h3>
           {hasResults && (
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="secondary" size="sm" className="gap-2">
                   <Download className="w-4 h-4" />
                   Export
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent>
                 <DropdownMenuItem onClick={downloadCSV}>
                   <FileText className="w-4 h-4 mr-2" />
                   CSV Report (.csv)
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={downloadJSON}>
                   <FileJson className="w-4 h-4 mr-2" />
                   JSON Report (.json)
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           )}
         </div>
 
         {results.length > 0 ? (
           <>
             {/* Summary stats */}
             <div className="flex gap-4 mb-4 p-3 rounded-lg bg-muted/50">
               <div className="flex items-center gap-2 text-sm">
                 <CheckCircle2 className="w-4 h-4 text-success" />
                 <span>{successCount} success</span>
               </div>
               <div className="flex items-center gap-2 text-sm">
                 <AlertTriangle className="w-4 h-4 text-warning" />
                 <span>{warningCount} warning</span>
               </div>
               <div className="flex items-center gap-2 text-sm">
                 <XCircle className="w-4 h-4 text-destructive" />
                 <span>{failedCount} failed</span>
               </div>
             </div>
 
             {/* Results list */}
             <ScrollArea className="h-[300px]">
               <div className="space-y-2 pr-4">
                 {results.map((result, idx) => (
                   <div
                     key={result.imageId}
                     className={cn(
                       "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50",
                       result.status === 'success' && "bg-success/5 border-success/30",
                       result.status === 'warning' && "bg-warning/5 border-warning/30",
                       result.status === 'failed' && "bg-destructive/5 border-destructive/30",
                       result.status === 'processing' && "bg-primary/5 border-primary/30",
                       result.status === 'pending' && "bg-muted/50 border-border",
                     )}
                     onClick={() => result.status !== 'pending' && result.status !== 'processing' && setSelectedResult(result)}
                   >
                     <div className="flex items-center gap-3">
                       {result.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                       {result.status === 'success' && <CheckCircle2 className="w-4 h-4 text-success" />}
                       {result.status === 'warning' && <AlertTriangle className="w-4 h-4 text-warning" />}
                       {result.status === 'failed' && <XCircle className="w-4 h-4 text-destructive" />}
                       {result.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />}
                       
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium truncate">{result.imageName}</p>
                         {result.log && result.status !== 'processing' && (
                           <p className="text-xs text-muted-foreground">
                             {result.log.subject_name || 'No match'} • 
                             {result.log.confidence ? ` ${result.log.confidence.toFixed(1)}%` : ' N/A'} • 
                             {result.log.processing_time_ms ? ` ${result.log.processing_time_ms}ms` : ''}
                           </p>
                         )}
                         {result.status === 'processing' && (
                           <p className="text-xs text-muted-foreground">Processing...</p>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </ScrollArea>
           </>
         ) : (
           <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
             <FileJson className="w-12 h-12 mb-4 opacity-30" />
             <p className="text-sm">Upload images and click Process to start batch recognition</p>
             <p className="text-xs mt-1">Results will appear here with export options</p>
           </div>
         )}
       </Card>
       
       {/* Detail Modal */}
       <BatchResultModal
         open={!!selectedResult}
         onOpenChange={(open) => !open && setSelectedResult(null)}
         imageName={selectedResult?.imageName || ''}
         result={selectedResult?.log || null}
         status={selectedResult?.status || ''}
       />
     </div>
   );
 }