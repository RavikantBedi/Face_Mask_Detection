import { forwardRef } from 'react';
import { Database, Users, Image, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatabaseInfo {
  name: string;
  description: string;
  subjects: number;
  images: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const databases: DatabaseInfo[] = [
  { name: 'DB-1', description: 'Upper face with skin', subjects: 150, images: 3956, icon: Layers, color: 'text-primary' },
  { name: 'DB-2', description: 'Upper face raw', subjects: 150, images: 3956, icon: Image, color: 'text-accent' },
  { name: 'DB-3', description: 'Lower face regions', subjects: 150, images: 3956, icon: Users, color: 'text-success' },
];

export const DatabaseStats = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DatabaseStats(props, ref) {
  return (
    <div ref={ref} className="data-card rounded-xl border border-border" {...props}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Active Databases</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">LFW Dataset loaded</p>
      </div>

      <div className="divide-y divide-border">
        {databases.map((db) => {
          const Icon = db.icon;

          return (
            <div key={db.name} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
              <div className={cn("p-2 rounded-lg bg-muted/50")}>
                <Icon className={cn("w-5 h-5", db.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{db.name}</span>
                  <span className="text-xs text-muted-foreground">• {db.description}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono text-foreground">{db.subjects.toLocaleString()}</span> subjects
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono text-foreground">{db.images.toLocaleString()}</span> images
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});