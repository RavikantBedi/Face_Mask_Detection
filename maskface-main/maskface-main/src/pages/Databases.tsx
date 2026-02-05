import { Database, Search, Plus, Layers, Image, Users, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface DatabaseCardProps {
  name: string;
  description: string;
  subjects: number;
  images: number;
  size: string;
  status: 'active' | 'indexing' | 'offline';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const databases: DatabaseCardProps[] = [
  {
    name: 'DB-1',
    description: 'Upper face regions with skin extraction for candidate matching',
    subjects: 150,
    images: 3956,
    size: '2.4 GB',
    status: 'active',
    icon: Layers,
    color: 'primary',
  },
  {
    name: 'DB-2',
    description: 'Upper face regions without skin extraction for rotation calculation',
    subjects: 150,
    images: 3956,
    size: '2.1 GB',
    status: 'active',
    icon: Image,
    color: 'accent',
  },
  {
    name: 'DB-3',
    description: 'Lower face regions for retrieval and reconstruction',
    subjects: 150,
    images: 3956,
    size: '1.8 GB',
    status: 'active',
    icon: Users,
    color: 'success',
  },
];

const statusConfig = {
  active: { label: 'Active', className: 'bg-success/20 text-success border-success/30' },
  indexing: { label: 'Indexing', className: 'bg-warning/20 text-warning border-warning/30' },
  offline: { label: 'Offline', className: 'bg-muted text-muted-foreground' },
};

function DatabaseCard({ db }: { db: DatabaseCardProps }) {
  const Icon = db.icon;
  const status = statusConfig[db.status];

  return (
    <Card className="p-6 border-border bg-card hover:border-primary/30 transition-colors group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-3 rounded-xl transition-colors",
          db.color === 'primary' && "bg-primary/10 group-hover:bg-primary/20",
          db.color === 'accent' && "bg-accent/10 group-hover:bg-accent/20",
          db.color === 'success' && "bg-success/10 group-hover:bg-success/20"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            db.color === 'primary' && "text-primary",
            db.color === 'accent' && "text-accent",
            db.color === 'success' && "text-success"
          )} />
        </div>
        <Badge className={status.className}>{status.label}</Badge>
      </div>

      <h3 className="font-semibold text-lg mb-1">{db.name}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{db.description}</p>

      <div className="grid grid-cols-3 gap-4 py-4 border-y border-border mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Subjects</p>
          <p className="font-mono font-semibold">{db.subjects.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Images</p>
          <p className="font-mono font-semibold">{db.images.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Size</p>
          <p className="font-mono font-semibold">{db.size}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">LFW Dataset</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Card>
  );
}

export default function Databases() {
  return (
    <DashboardLayout 
      title="Databases" 
      subtitle="Manage face recognition databases"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search databases, subjects..." 
            className="pl-9 bg-muted/50"
          />
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Import Dataset
        </Button>
      </div>

      {/* Stats Overview */}
      <Card className="p-6 border-border bg-card mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Databases</p>
            <p className="text-2xl font-semibold">3</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Subjects</p>
            <p className="text-2xl font-semibold">450</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Images</p>
            <p className="text-2xl font-semibold">11,868</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Storage Used</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-semibold">6.3 GB</p>
              <Progress value={63} className="flex-1 h-2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Database Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {databases.map((db) => (
          <DatabaseCard key={db.name} db={db} />
        ))}
      </div>
    </DashboardLayout>
  );
}