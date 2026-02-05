import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type StepStatus = 'pending' | 'active' | 'completed';
type PipelinePhase = 'idle' | 'processing' | 'done';

interface PipelineStep {
  id: number;
  name: string;
  description: string;
  status: StepStatus;
}

const stepTemplate: Omit<PipelineStep, 'status'>[] = [
  { id: 1, name: 'Upload', description: 'Masked face input' },
  { id: 2, name: 'Extract', description: 'Upper-face / periocular' },
  { id: 3, name: 'Match', description: 'Candidate search' },
  { id: 4, name: 'Transform', description: 'Pose alignment' },
  { id: 5, name: 'Reconstruct', description: 'Occlusion-aware (N/A)' },
  { id: 6, name: 'Recognize', description: 'Embedding similarity' },
];

interface PipelineVisualizationProps {
  phase?: PipelinePhase;
  hasInput?: boolean;
}

function buildSteps(phase: PipelinePhase, hasInput: boolean): PipelineStep[] {
  // Note: This UI is a didactic stepper. The backend is recognition-only.
  // “Reconstruct” is intentionally marked N/A in the description.
  if (!hasInput) {
    return stepTemplate.map((s) => ({ ...s, status: 'pending' as const }));
  }

  if (phase === 'idle') {
    return stepTemplate.map((s, idx) => ({
      ...s,
      status: idx === 0 ? ('completed' as const) : ('pending' as const),
    }));
  }

  if (phase === 'done') {
    return stepTemplate.map((s) => ({ ...s, status: 'completed' as const }));
  }

  // processing
  return stepTemplate.map((s, idx) => ({
    ...s,
    status: idx === 1 ? ('active' as const) : idx === 0 ? ('completed' as const) : ('pending' as const),
  }));
}

export function PipelineVisualization({ phase = 'idle', hasInput = false }: PipelineVisualizationProps) {
  const intervalRef = useRef<number | null>(null);
  const baseSteps = useMemo(() => buildSteps(phase, hasInput), [phase, hasInput]);
  const [steps, setSteps] = useState<PipelineStep[]>(baseSteps);

  // Keep steps in sync when phase changes (e.g., processing → done).
  useEffect(() => {
    setSteps(baseSteps);
  }, [baseSteps]);

  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (phase !== 'processing' || !hasInput) return;

    intervalRef.current = window.setInterval(() => {
      setSteps(currentSteps => {
        const activeIndex = currentSteps.findIndex(s => s.status === 'active');
        if (activeIndex === -1) return currentSteps;

        // If the last step is active, keep it active until phase flips to "done".
        if (activeIndex >= currentSteps.length - 1) {
          return currentSteps;
        }

        return currentSteps.map((step, idx) => {
          if (idx === activeIndex) return { ...step, status: 'completed' as StepStatus };
          if (idx === activeIndex + 1) return { ...step, status: 'active' as StepStatus };
          return step;
        });
      });
    }, 800);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, hasInput]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "pipeline-step",
                  step.status === 'active' && "active",
                  step.status === 'completed' && "completed",
                  step.status === 'pending' && "border-muted text-muted-foreground"
                )}
              >
                {step.status === 'completed' && <Check className="w-5 h-5" />}
                {step.status === 'active' && <Loader2 className="w-5 h-5 animate-spin" />}
                {step.status === 'pending' && <span className="text-sm font-medium">{step.id}</span>}
              </div>
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-xs font-medium",
                  step.status === 'active' && "text-primary",
                  step.status === 'completed' && "text-success",
                  step.status === 'pending' && "text-muted-foreground"
                )}>
                  {step.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{step.description}</p>
              </div>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div className="flex-1 flex items-center justify-center px-2 -mt-6">
                <div className={cn(
                  "h-0.5 flex-1 transition-colors duration-500",
                  step.status === 'completed' ? "bg-success" : "bg-muted"
                )} />
                <ArrowRight className={cn(
                  "w-4 h-4 mx-1 transition-colors duration-500",
                  step.status === 'completed' ? "text-success" : "text-muted"
                )} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}