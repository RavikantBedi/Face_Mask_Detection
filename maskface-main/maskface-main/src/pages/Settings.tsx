import { Save, RefreshCw, Key, Database, Cpu, Bell, Shield, Palette } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Settings() {
  return (
    <DashboardLayout 
      title="Settings" 
      subtitle="Configure system preferences and parameters"
    >
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="recognition">Recognition</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6 border-border bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Appearance</h3>
                <p className="text-sm text-muted-foreground">Customize the interface appearance</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Reduce spacing in the interface</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Animations</Label>
                  <p className="text-sm text-muted-foreground">Enable pipeline and scanning animations</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Database Configuration</h3>
                <p className="text-sm text-muted-foreground">Manage database connections</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Database</Label>
                <Select defaultValue="lfw">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lfw">LFW Dataset</SelectItem>
                    <SelectItem value="casia">CASIA-WebFace</SelectItem>
                    <SelectItem value="ar">AR Face Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Database Path</Label>
                <Input defaultValue="/data/databases/lfw" className="font-mono text-sm" />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Recognition Settings */}
        <TabsContent value="recognition" className="space-y-6">
          <Card className="p-6 border-border bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Recognition Parameters</h3>
                <p className="text-sm text-muted-foreground">Configure CNN and matching thresholds</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Confidence Threshold</Label>
                  <span className="text-sm font-mono text-primary">75%</span>
                </div>
                <Slider defaultValue={[75]} max={100} step={1} />
                <p className="text-xs text-muted-foreground">Minimum confidence score to accept a match</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>SSIM Threshold</Label>
                  <span className="text-sm font-mono text-primary">0.70</span>
                </div>
                <Slider defaultValue={[70]} max={100} step={1} />
                <p className="text-xs text-muted-foreground">Minimum structural similarity for face reconstruction</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CNN-1 Model</Label>
                  <Select defaultValue="vgg16">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vgg16">VGG16 (Default)</SelectItem>
                      <SelectItem value="facenet">FaceNet</SelectItem>
                      <SelectItem value="arcface">ArcFace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Feature Detector</Label>
                  <Select defaultValue="surf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="surf">SURF</SelectItem>
                      <SelectItem value="orb">ORB (Free)</SelectItem>
                      <SelectItem value="sift">SIFT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Color Correction</Label>
                  <p className="text-sm text-muted-foreground">Match color statistics during reconstruction</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Seamless Blending</Label>
                  <p className="text-sm text-muted-foreground">Apply Gaussian blending at merge boundary</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-6">
          <Card className="p-6 border-border bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">API Configuration</h3>
                <p className="text-sm text-muted-foreground">Manage API keys and endpoints</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <Input defaultValue="http://localhost:8000/api/v1" className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input type="password" defaultValue="sk-xxxxxxxxxxxxxxxxxxxxx" className="font-mono text-sm" />
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <Label>Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">Limit API requests per minute</p>
                </div>
                <Select defaultValue="100">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50/min</SelectItem>
                    <SelectItem value="100">100/min</SelectItem>
                    <SelectItem value="500">500/min</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 border-border bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-sm text-muted-foreground">Configure alert preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Recognition Alerts</Label>
                  <p className="text-sm text-muted-foreground">Notify on successful recognitions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Low Confidence Warnings</Label>
                  <p className="text-sm text-muted-foreground">Alert when confidence is below threshold</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Errors</Label>
                  <p className="text-sm text-muted-foreground">Critical error notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send alerts via email</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <Button variant="outline">Reset to Defaults</Button>
        <Button className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </DashboardLayout>
  );
}