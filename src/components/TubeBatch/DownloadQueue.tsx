
"use client";

import { useState, useEffect } from 'react';
import { VideoItem } from '@/app/lib/types';
import { DownloadItem } from './DownloadItem';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Trash2, 
  Archive, 
  Info,
  Layers,
  FileText,
  Loader2,
  Clock
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { generateCsvTemplate } from '@/app/lib/csv-parser';
import { Badge } from '@/components/ui/badge';

interface DownloadQueueProps {
  items: VideoItem[];
  batch: {
    status: string;
    endTime?: any;
    id: string;
  } | null;
  onStart: () => void;
  onClear: () => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onDownloadZip: () => void;
  isProcessing: boolean;
  isCloudSyncing?: boolean;
}

export function DownloadQueue({ 
  items, 
  batch,
  onStart, 
  onClear, 
  onRemove,
  onRetry,
  onDownloadZip,
  isProcessing,
  isCloudSyncing
}: DownloadQueueProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  // Countdown logic for Step 3 & 4
  useEffect(() => {
    if (batch?.status !== 'COMPLETED' || !batch?.endTime) return;

    const interval = setInterval(() => {
      // Calculate 4 hours from endTime
      const endMillis = batch.endTime.toMillis ? batch.endTime.toMillis() : (batch.endTime?.seconds * 1000 || Date.now());
      const expiryTime = endMillis + (4 * 60 * 60 * 1000);
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [batch]);

  if (isCloudSyncing || (items.length === 0 && !isProcessing)) {
    return (
      <div className="w-full max-w-4xl mx-auto py-20 text-center animate-pulse">
        <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
        <h3 className="text-xl font-bold">Synchronizing Queue...</h3>
        <p className="text-muted-foreground">Building your secure download list.</p>
      </div>
    );
  }

  const completedCount = items.filter(i => i.status === 'completed').length;
  const failedCount = items.filter(i => i.status === 'failed').length;
  const overallProgress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  const isFinished = batch?.status === 'COMPLETED';

  const handleDownloadTemplate = () => {
    const template = generateCsvTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tubebatch_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Layers className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Download Queue</h2>
            <p className="text-xs text-muted-foreground">{items.length} items loaded</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {!isProcessing && !isFinished && (
            <Button 
              onClick={onStart}
              className="bg-accent text-background hover:bg-accent/90 shadow-[0_4px_14px_0_rgba(26,250,26,0.25)]"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Start Batch
            </Button>
          )}
          
          {isFinished && (
            <div className="flex flex-col items-end gap-1">
              <Button 
                onClick={onDownloadZip}
                disabled={completedCount === 0}
                className="bg-accent text-background hover:bg-accent/90 shadow-[0_4px_14px_0_rgba(26,250,26,0.3)]"
              >
                <Archive className="w-4 h-4 mr-2" />
                Download ZIP ({completedCount})
              </Button>
              {timeLeft && (
                <Badge variant="outline" className="text-[10px] text-accent border-accent/30 flex items-center gap-1.5 py-0">
                  <Clock className="w-3 h-3" />
                  Expires in: {timeLeft}
                </Badge>
              )}
            </div>
          )}

          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="border-border/60">
            <FileText className="w-4 h-4 mr-2" />
            Template
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClear}
            disabled={isProcessing}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="mb-8 p-6 rounded-2xl bg-primary/20 border border-border/40 relative overflow-hidden shadow-inner">
        <div className="relative z-10 flex justify-between items-end mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Overall Batch Status</p>
            <h3 className="text-3xl font-bold tracking-tight">
              {overallProgress}% <span className="text-sm font-normal text-muted-foreground uppercase tracking-widest ml-2">Synced</span>
            </h3>
          </div>
          <div className="text-right text-xs font-medium text-muted-foreground space-y-1">
            <p className="flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              {completedCount} Success
            </p>
            <p className="flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive"></span>
              {failedCount} Errors
            </p>
          </div>
        </div>
        <Progress value={overallProgress} className="h-3 bg-background/50" indicatorClassName="progress-vibrant" />
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <DownloadItem 
            key={item.id} 
            item={item} 
            onRemove={onRemove} 
            onRetry={onRetry}
            disabled={isProcessing || isFinished}
          />
        ))}
      </div>

      {isFinished && (
        <div className="mt-8 p-4 rounded-xl bg-accent/5 border border-accent/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-accent">Privacy & Security Notice</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Your generated ZIP file and original CSV data will be automatically purged from our database in 4 hours. Download your files now to ensure you don't lose access.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
