import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Progress } from '@/components/ui/progress';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const accuracyData = [
  { date: 'Jan', ssim: 0.82, confidence: 88 },
  { date: 'Feb', ssim: 0.84, confidence: 89 },
  { date: 'Mar', ssim: 0.85, confidence: 91 },
  { date: 'Apr', ssim: 0.87, confidence: 92 },
  { date: 'May', ssim: 0.88, confidence: 93 },
  { date: 'Jun', ssim: 0.89, confidence: 94 },
];

const processingData = [
  { step: 'Upload', time: 12 },
  { step: 'Extract', time: 24 },
  { step: 'Match', time: 45 },
  { step: 'Transform', time: 32 },
  { step: 'Reconstruct', time: 18 },
  { step: 'Recognize', time: 11 },
];

const recognitionDistribution = [
  { name: 'Exact Match', value: 847, color: 'hsl(142, 76%, 46%)' },
  { name: 'Probable Match', value: 234, color: 'hsl(38, 92%, 50%)' },
  { name: 'Uncertain', value: 89, color: 'hsl(215, 20%, 55%)' },
  { name: 'Failed', value: 77, color: 'hsl(0, 72%, 51%)' },
];

export default function Metrics() {
  return (
    <DashboardLayout 
      title="Metrics & Analytics" 
      subtitle="System performance and recognition accuracy"
    >
      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Recognition Accuracy"
          value="94.7%"
          subtitle="30-day average"
          trend={{ value: 2.3, direction: 'up' }}
          icon={<Target className="w-4 h-4 text-success" />}
          variant="success"
        />
        <MetricCard
          title="Avg. SSIM Score"
          value="0.891"
          subtitle="Structural similarity"
          trend={{ value: 1.2, direction: 'up' }}
          icon={<BarChart3 className="w-4 h-4 text-primary" />}
          variant="primary"
        />
        <MetricCard
          title="Processing Speed"
          value="142ms"
          subtitle="Per image average"
          trend={{ value: 8, direction: 'down' }}
          icon={<Zap className="w-4 h-4 text-warning" />}
        />
        <MetricCard
          title="Throughput"
          value="847"
          subtitle="Recognitions today"
          trend={{ value: 15, direction: 'up' }}
          icon={<TrendingUp className="w-4 h-4 text-muted-foreground" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Accuracy Over Time */}
        <Card className="p-6 border-border bg-card">
          <h3 className="font-semibold mb-1">Accuracy Trends</h3>
          <p className="text-sm text-muted-foreground mb-6">SSIM and confidence scores over time</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyData}>
                <defs>
                  <linearGradient id="ssimGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(187, 92%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(187, 92%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
                <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[0.7, 1]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222, 47%, 8%)', 
                    border: '1px solid hsl(222, 47%, 16%)',
                    borderRadius: '8px',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="ssim" 
                  stroke="hsl(187, 92%, 50%)" 
                  fill="url(#ssimGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Processing Time Breakdown */}
        <Card className="p-6 border-border bg-card">
          <h3 className="font-semibold mb-1">Pipeline Processing Time</h3>
          <p className="text-sm text-muted-foreground mb-6">Average time per stage (ms)</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" horizontal={false} />
                <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis dataKey="step" type="category" stroke="hsl(215, 20%, 55%)" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222, 47%, 8%)', 
                    border: '1px solid hsl(222, 47%, 16%)',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="time" 
                  fill="hsl(187, 92%, 50%)" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recognition Distribution */}
        <Card className="p-6 border-border bg-card">
          <h3 className="font-semibold mb-1">Recognition Distribution</h3>
          <p className="text-sm text-muted-foreground mb-4">Match quality breakdown</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={recognitionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {recognitionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222, 47%, 8%)', 
                    border: '1px solid hsl(222, 47%, 16%)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {recognitionDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Model Performance */}
        <Card className="p-6 border-border bg-card lg:col-span-2">
          <h3 className="font-semibold mb-1">Model Performance Comparison</h3>
          <p className="text-sm text-muted-foreground mb-6">CNN-1 vs CNN-2 accuracy metrics</p>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">CNN-2 (Candidate Selection)</span>
                <span className="text-sm font-mono text-primary">96.2%</span>
              </div>
              <Progress value={96.2} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">CNN-1 (Final Recognition)</span>
                <span className="text-sm font-mono text-primary">94.7%</span>
              </div>
              <Progress value={94.7} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">SURF Feature Matching</span>
                <span className="text-sm font-mono text-success">98.1%</span>
              </div>
              <Progress value={98.1} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Face Reconstruction Quality</span>
                <span className="text-sm font-mono text-success">89.1%</span>
              </div>
              <Progress value={89.1} className="h-2" />
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}