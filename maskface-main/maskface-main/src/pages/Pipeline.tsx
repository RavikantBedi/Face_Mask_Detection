import { ArrowDown, Upload, Scan, Search, RotateCw, Layers, UserCheck, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PipelineStepProps {
  step: number;
  title: string;
  description: string;
  details: string[];
  icon: React.ComponentType<{ className?: string }>;
  database?: string;
  isLast?: boolean;
}

const pipelineSteps: Omit<PipelineStepProps, 'step' | 'isLast'>[] = [
  {
    title: 'Input Masked Face',
    description: 'Upload or capture masked face image for recognition',
    details: ['Face detection', 'Alignment to frontal pose', 'Quality validation'],
    icon: Upload,
  },
  {
    title: 'Extract Upper Face Region',
    description: 'Separate visible upper face using threshold line',
    details: ['Apply threshold curve', 'Skin area extraction', 'Create DB-1 query'],
    icon: Scan,
    database: 'DB-1',
  },
  {
    title: 'Candidate Selection (CNN-2)',
    description: 'Find most similar upper face in database',
    details: ['Generate embedding vector', 'Cosine similarity search', 'Return top candidate'],
    icon: Search,
    database: 'DB-1 → DB-2',
  },
  {
    title: 'Rotation Estimation (SURF)',
    description: 'Calculate geometric transformation between faces',
    details: ['SURF keypoint detection', 'Feature matching', 'RANSAC transformation'],
    icon: RotateCw,
    database: 'DB-2',
  },
  {
    title: 'Face Reconstruction',
    description: 'Merge upper query with transformed lower face',
    details: ['Apply transformation to lower face', 'Boundary blending', 'Color correction'],
    icon: Layers,
    database: 'DB-3',
  },
  {
    title: 'Final Recognition (CNN-1)',
    description: 'Identify subject from reconstructed complete face',
    details: ['FaceNet embedding', 'Database comparison', 'Confidence scoring'],
    icon: UserCheck,
  },
];

function PipelineStep({ step, title, description, details, icon: Icon, database, isLast }: PipelineStepProps) {
  return (
    <div className="relative">
      <Card className="p-6 border-border bg-card hover:border-primary/30 transition-colors">
        <div className="flex items-start gap-4">
          {/* Step Number & Icon */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-primary flex items-center justify-center text-sm font-bold text-primary">
              {step}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{title}</h3>
              {database && (
                <span className="px-2 py-1 rounded-md bg-accent/20 text-accent text-xs font-mono">
                  {database}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
            
            <div className="space-y-2">
              {details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Connector Arrow */}
      {!isLast && (
        <div className="flex justify-center py-4">
          <ArrowDown className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export default function Pipeline() {
  return (
    <DashboardLayout 
      title="Recognition Pipeline" 
      subtitle="Complete face recognition workflow architecture"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Pipeline */}
        <div className="lg:col-span-2 space-y-0">
          {pipelineSteps.map((step, idx) => (
            <PipelineStep
              key={step.title}
              step={idx + 1}
              {...step}
              isLast={idx === pipelineSteps.length - 1}
            />
          ))}
        </div>

        {/* Side Info */}
        <div className="space-y-6">
          {/* Database Legend */}
          <Card className="p-6 border-border bg-card">
            <h3 className="font-semibold mb-4">Database Architecture</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">DB-1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Upper Face (Skin)</p>
                  <p className="text-xs text-muted-foreground">Candidate matching with skin area extraction</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-accent">DB-2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Upper Face (Raw)</p>
                  <p className="text-xs text-muted-foreground">SURF feature matching for rotation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-success">DB-3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Lower Face</p>
                  <p className="text-xs text-muted-foreground">Retrieval for face reconstruction</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Key Models */}
          <Card className="p-6 border-border bg-card">
            <h3 className="font-semibold mb-4">Core Models</h3>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm font-medium mb-1">CNN-1 (Final Recognition)</p>
                <p className="text-xs text-muted-foreground">VGG16 / FaceNet for identity classification</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm font-medium mb-1">CNN-2 (Candidate Selection)</p>
                <p className="text-xs text-muted-foreground">Custom CNN for upper face embedding</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm font-medium mb-1">SURF Detector</p>
                <p className="text-xs text-muted-foreground">Speeded-Up Robust Features for matching</p>
              </div>
            </div>
          </Card>

          {/* Performance Stats */}
          <Card className="p-6 border-border bg-card">
            <h3 className="font-semibold mb-4">Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-mono font-bold text-primary">142ms</p>
                <p className="text-xs text-muted-foreground">Avg. Time</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-mono font-bold text-success">94.7%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-mono font-bold text-accent">0.891</p>
                <p className="text-xs text-muted-foreground">SSIM Score</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-mono font-bold text-foreground">1.2K</p>
                <p className="text-xs text-muted-foreground">Subjects</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}