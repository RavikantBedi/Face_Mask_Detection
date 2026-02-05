import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RecognitionLog {
  id: string;
  user_id: string;
  image_path: string;
  status: 'pending' | 'processing' | 'success' | 'warning' | 'failed';
  subject_id: string | null;
  subject_name: string | null;
  confidence: number | null;
  ssim_score: number | null;
  processing_time_ms: number | null;
  database_used: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export function useRecognitionLogs() {
  const [logs, setLogs] = useState<RecognitionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLogs = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('recognition_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load recognition history');
    } else {
      setLogs(data as RecognitionLog[]);
    }
    setLoading(false);
  }, [user]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    fetchLogs();

    // Set up realtime subscription
    const channel: RealtimeChannel = supabase
      .channel('recognition-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recognition_logs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setLogs(prev => [payload.new as RecognitionLog, ...prev].slice(0, 50));
          } else if (payload.eventType === 'UPDATE') {
            setLogs(prev => 
              prev.map(log => 
                log.id === payload.new.id ? (payload.new as RecognitionLog) : log
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setLogs(prev => prev.filter(log => log.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchLogs]);

  const createLog = async (imagePath: string): Promise<RecognitionLog | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('recognition_logs')
      .insert({
        user_id: user.id,
        image_path: imagePath,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating log:', error);
      toast.error('Failed to create recognition record');
      return null;
    }

    return data as RecognitionLog;
  };

  const processRecognition = async (imageUrl: string, logId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('Please log in to process recognition');
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('process-recognition', {
        body: { imageUrl, logId }
      });

      if (error) {
        console.error('Recognition error:', error);
        toast.error('Recognition processing failed');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Recognition error:', error);
      toast.error('Recognition processing failed');
      return null;
    }
  };

  // Calculate stats
  const stats = {
    total: logs.length,
    successful: logs.filter(l => l.status === 'success').length,
    warnings: logs.filter(l => l.status === 'warning').length,
    failed: logs.filter(l => l.status === 'failed').length,
    avgConfidence: logs.filter(l => l.confidence).reduce((acc, l) => acc + (l.confidence || 0), 0) / 
      (logs.filter(l => l.confidence).length || 1),
    avgProcessingTime: logs.filter(l => l.processing_time_ms).reduce((acc, l) => acc + (l.processing_time_ms || 0), 0) / 
      (logs.filter(l => l.processing_time_ms).length || 1),
    avgSsim: logs.filter(l => l.ssim_score).reduce((acc, l) => acc + (l.ssim_score || 0), 0) / 
      (logs.filter(l => l.ssim_score).length || 1),
  };

  return {
    logs,
    loading,
    stats,
    createLog,
    processRecognition,
    refetch: fetchLogs
  };
}