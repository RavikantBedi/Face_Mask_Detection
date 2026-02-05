import { CheckCircle, AlertCircle, XCircle, User, Database, Clock, Target, Scan, Shield, Fingerprint, Activity, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { RecognitionLog } from '@/hooks/useRecognitionLogs';

interface RecognitionResultsProps {
  result?: RecognitionLog | null;
  isProcessing?: boolean;
}

// Academic-compliant similarity levels (NOT identity certainty)
function getSimilarityLevel(confidence: number | null): { label: string; color: string; description: string } {
  if (!confidence) return { label: 'N/A', color: 'text-muted-foreground', description: 'No similarity computed' };
  if (confidence >= 65) return { label: 'HIGH SIMILARITY', color: 'text-success', description: 'High embedding similarity - verification recommended' };
  if (confidence >= 40) return { label: 'MODERATE', color: 'text-warning', description: 'Moderate similarity - extended verification required' };
  return { label: 'LOW', color: 'text-destructive', description: 'Below recognition threshold' };
}

// SSIM assessment following academic standards (0.45-0.60 for masked faces)
function getSSIMQuality(ssim: number | null): { label: string; color: string; description: string } {
  if (!ssim) return { label: 'N/A', color: 'text-muted-foreground', description: 'SSIM not applicable for recognition-only pipeline' };
  // Academic standard: masked face SSIM typically 0.45-0.60
  if (ssim >= 0.55) return { label: 'UPPER RANGE', color: 'text-success', description: 'Upper range for masked periocular comparison' };
  if (ssim >= 0.45) return { label: 'EXPECTED', color: 'text-primary', description: 'Within expected range (0.45-0.60) for masked faces' };
  if (ssim >= 0.35) return { label: 'LOWER RANGE', color: 'text-warning', description: 'Below typical range - possible quality issues' };
  return { label: 'LOW', color: 'text-destructive', description: 'Below expected range for periocular comparison' };
}

export function RecognitionResults({ result, isProcessing = false }: RecognitionResultsProps) {
  const getMatchBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success/20 text-success border-success/30">High Similarity Match</Badge>;
      case 'warning':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Moderate Similarity</Badge>;
      case 'failed':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">No Match</Badge>;
      case 'processing':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Processing</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Pending</Badge>;
    }
  };

  if (isProcessing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20 animate-pulse">
          <div className="p-3 rounded-full bg-primary/10">
            <Activity className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-primary">Processing Recognition</p>
            <p className="text-sm text-muted-foreground">Extracting periocular features and computing embedding similarity...</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted/50 rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-muted/50 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
        <User className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">Upload an image to see recognition results</p>
      </div>
    );
  }

  const similarityLevel = getSimilarityLevel(result.confidence);
  const ssimQuality = getSSIMQuality(result.ssim_score);

  if (result.status === 'failed') {
    return (
      <div className="space-y-5">
        {/* Status Header */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="p-3 rounded-full bg-destructive/10">
            <XCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-destructive">No Matching Embedding Found</p>
              {result.processing_time_ms && (
                <Badge variant="outline" className="text-xs">
                  {result.processing_time_ms}ms
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Below recognition threshold (40% cosine similarity)</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-medium mb-2">Possible causes (Academic Assessment):</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Subject not enrolled in reference database</li>
            <li>Excessive facial occlusion beyond periocular region</li>
            <li>Insufficient image quality or resolution</li>
            <li>Significant pose variation from gallery images</li>
            <li>Lighting conditions outside training distribution</li>
          </ul>
        </div>

        {/* Database Info */}
        <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/30">
          <Database className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <span className="text-xs text-muted-foreground">Reference Database: </span>
            <span className="text-sm font-medium">{result.database_used || 'LFW'} (Internal Index)</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* Status Header */}
        <div className={cn(
          "flex items-center gap-4 p-4 rounded-lg border",
          result.status === 'success' 
            ? "bg-success/10 border-success/20" 
            : "bg-warning/10 border-warning/20"
        )}>
          <div className={cn(
            "p-3 rounded-full",
            result.status === 'success' ? "bg-success/10" : "bg-warning/10"
          )}>
            {result.status === 'success' ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <AlertCircle className="w-6 h-6 text-warning" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className={cn("font-semibold", result.status === 'success' ? "text-success" : "text-warning")}>
                {result.status === 'success' ? 'High Similarity Match' : 'Moderate Similarity Match'}
              </p>
              {result.processing_time_ms && (
                <Badge variant="outline" className="text-xs">
                  {result.processing_time_ms}ms
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {result.status === 'success' 
                ? 'High embedding similarity detected - manual verification recommended' 
                : 'Moderate similarity - extended verification required'}
            </p>
          </div>
        </div>

        {/* Academic Disclaimer */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">Academic Notice:</span> This represents embedding similarity, 
              NOT identity verification. Subject indices are internal database references only.
            </p>
          </div>
        </div>

        {/* Subject Information */}
        {result.subject_id && (
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Fingerprint className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Best Matching Index</p>
                <p className="text-lg font-semibold">{result.subject_name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground font-mono">{result.subject_id}</p>
                <p className="text-xs text-muted-foreground mt-1 italic">Internal dataset index - not a real identity claim</p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Embedding Similarity Score */}
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Embedding Similarity</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                  >
                    <Info className="w-3 h-3 text-muted-foreground" />
                    <span className="sr-only">About embedding similarity</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">Cosine similarity between query and gallery embeddings. 
                  This represents feature similarity, NOT identity certainty.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  {result.confidence ? `${result.confidence.toFixed(1)}%` : 'N/A'}
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className={cn("text-xs", similarityLevel.color)}>
                      {similarityLevel.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{similarityLevel.description}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {result.confidence && (
                <Progress 
                  value={result.confidence} 
                  className="h-2"
                />
              )}
              <p className="text-xs text-muted-foreground">Threshold: 40% | High: ≥65%</p>
            </div>
          </div>

          {/* SSIM Score */}
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <Scan className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">SSIM Score</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                  >
                    <Info className="w-3 h-3 text-muted-foreground" />
                    <span className="sr-only">About SSIM</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">Periocular region structural similarity. 
                  Academic standard for masked faces: 0.45-0.60. Values above 0.70 are 
                  NOT valid for masked-to-unmasked comparison.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  {result.ssim_score ? result.ssim_score.toFixed(4) : 'N/A'}
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className={cn("text-xs", ssimQuality.color)}>
                      {ssimQuality.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{ssimQuality.description}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {result.ssim_score && (
                <Progress 
                  value={result.ssim_score * 100} 
                  className="h-2"
                />
              )}
              <p className="text-xs text-muted-foreground">Expected range: 0.45-0.60</p>
            </div>
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="p-3 rounded-lg border border-border bg-card/30">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Method: </span>
              <span className="font-medium">ArcFace (128-dim)</span>
            </div>
            <div>
              <span className="text-muted-foreground">Metric: </span>
              <span className="font-medium">Cosine Similarity</span>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/30">
          <Database className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <span className="text-xs text-muted-foreground">Reference Database: </span>
            <span className="text-sm font-medium">{result.database_used || 'LFW'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Research Use</span>
          </div>
        </div>

        {/* Error Message */}
        {result.error_message && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{result.error_message}</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
