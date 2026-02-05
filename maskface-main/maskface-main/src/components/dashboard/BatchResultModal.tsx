 import { format } from 'date-fns';
 import { X, CheckCircle2, AlertTriangle, XCircle, Clock, Database, Percent, Activity } from 'lucide-react';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { Badge } from '@/components/ui/badge';
 import { Separator } from '@/components/ui/separator';
 import { cn } from '@/lib/utils';
 import type { RecognitionLog } from '@/hooks/useRecognitionLogs';
 
 interface BatchResultModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   imageName: string;
   result: RecognitionLog | null;
   status: string;
 }
 
 export function BatchResultModal({ open, onOpenChange, imageName, result, status }: BatchResultModalProps) {
   const getStatusBadge = () => {
     switch (status) {
       case 'success':
         return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="w-3 h-3 mr-1" />Success</Badge>;
       case 'warning':
         return <Badge className="bg-warning/20 text-warning border-warning/30"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
       case 'failed':
         return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
       default:
         return <Badge variant="secondary">{status}</Badge>;
     }
   };
 
   const getConfidenceColor = (confidence: number | null) => {
     if (!confidence) return 'text-muted-foreground';
     if (confidence >= 65) return 'text-success';
     if (confidence >= 40) return 'text-warning';
     return 'text-destructive';
   };
 
   const getSSIMInterpretation = (ssim: number | null) => {
     if (!ssim) return 'Not computed';
     if (ssim >= 0.55) return 'Upper range for masked comparison';
     if (ssim >= 0.45) return 'Within expected range (0.45-0.60)';
     return 'Below typical range';
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-lg">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-3">
             <span className="truncate">{imageName}</span>
             {getStatusBadge()}
           </DialogTitle>
         </DialogHeader>
 
         {result ? (
           <div className="space-y-6">
             {/* Match Result */}
             <div className="p-4 rounded-lg bg-muted/50 border border-border">
               <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                 <Database className="w-4 h-4" />
                 Match Result
               </h4>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-xs text-muted-foreground">Subject ID</p>
                   <p className="font-mono text-sm">{result.subject_id || 'No match'}</p>
                 </div>
                 <div>
                   <p className="text-xs text-muted-foreground">Subject Name</p>
                   <p className="text-sm">{result.subject_name || 'N/A'}</p>
                 </div>
                 <div>
                   <p className="text-xs text-muted-foreground">Database</p>
                   <p className="text-sm">{result.database_used || 'LFW'}</p>
                 </div>
                 <div>
                   <p className="text-xs text-muted-foreground">Processing Time</p>
                   <p className="text-sm">{result.processing_time_ms ? `${result.processing_time_ms}ms` : 'N/A'}</p>
                 </div>
               </div>
             </div>
 
             {/* Similarity Metrics */}
             <div className="p-4 rounded-lg bg-muted/50 border border-border">
               <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                 <Percent className="w-4 h-4" />
                 Similarity Metrics
               </h4>
               
               <div className="space-y-4">
                 {/* Confidence */}
                 <div>
                   <div className="flex items-center justify-between mb-1">
                     <p className="text-xs text-muted-foreground">Embedding Similarity (Cosine)</p>
                     <p className={cn("font-mono text-lg font-bold", getConfidenceColor(result.confidence))}>
                       {result.confidence ? `${result.confidence.toFixed(2)}%` : 'N/A'}
                     </p>
                   </div>
                   <div className="h-2 bg-secondary rounded-full overflow-hidden">
                     <div 
                       className={cn(
                         "h-full transition-all",
                         result.confidence && result.confidence >= 65 ? "bg-success" :
                         result.confidence && result.confidence >= 40 ? "bg-warning" : "bg-destructive"
                       )}
                       style={{ width: `${Math.min(result.confidence || 0, 100)}%` }}
                     />
                   </div>
                   <p className="text-xs text-muted-foreground mt-1">
                     {result.confidence && result.confidence >= 65 ? 'High similarity (≥65%)' :
                      result.confidence && result.confidence >= 40 ? 'Moderate similarity (40-65%)' :
                      'Low similarity (<40%)'}
                   </p>
                 </div>
 
                 <Separator />
 
                 {/* SSIM */}
                 <div>
                   <div className="flex items-center justify-between mb-1">
                     <p className="text-xs text-muted-foreground">SSIM Score</p>
                     <p className="font-mono text-lg font-bold">
                       {result.ssim_score ? result.ssim_score.toFixed(4) : 'N/A'}
                     </p>
                   </div>
                   <p className="text-xs text-muted-foreground">
                     {getSSIMInterpretation(result.ssim_score)}
                   </p>
                 </div>
               </div>
             </div>
 
             {/* Timestamps */}
             <div className="p-4 rounded-lg bg-muted/50 border border-border">
               <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                 <Clock className="w-4 h-4" />
                 Timestamps
               </h4>
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <p className="text-xs text-muted-foreground">Created</p>
                   <p>{format(new Date(result.created_at), 'yyyy-MM-dd HH:mm:ss')}</p>
                 </div>
                 <div>
                   <p className="text-xs text-muted-foreground">Updated</p>
                   <p>{format(new Date(result.updated_at), 'yyyy-MM-dd HH:mm:ss')}</p>
                 </div>
               </div>
             </div>
 
             {/* Error Message */}
             {result.error_message && (
               <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                 <h4 className="text-sm font-medium mb-2 text-destructive">Error Details</h4>
                 <p className="text-sm text-destructive/80">{result.error_message}</p>
               </div>
             )}
 
             {/* Academic Note */}
             <p className="text-xs text-muted-foreground italic">
               Note: Subject identifiers are internal dataset indices for research purposes only. 
               This system does NOT claim to identify real individuals.
             </p>
           </div>
         ) : (
           <div className="py-8 text-center text-muted-foreground">
             <p>No recognition data available</p>
           </div>
         )}
       </DialogContent>
     </Dialog>
   );
 }