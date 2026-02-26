"use client";

import { VideoItem, BatchStats } from '@/app/lib/types';
import { DownloadItem } from './DownloadItem';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Trash2, 
  Archive, 
  Info,
  Layers,
  CheckCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DownloadQueueProps {
  items: VideoItem[];
  onStart: () => void;
  onClear: () => void;
  onDownloadZip: () => void;
  isProcessing: boolean;
}

export function DownloadQueue({ 
  items, 
  onStart, 
  onClear, 
  onDownloadZip,
  isProcessing 
}: DownloadQueueProps) {
  if (items.length === 0) return null;

  const completedCount = items.filter(i => i.status === 'completed').length;
  const failedCount = items.filter(i => i.status === 'failed').length;
  const overallProgress = Math.round((completedCount / items.length) * 100);
  const isFinished = completedCount + failedCount === items.length;

  return (
    <div className="w-full max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Layers className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-xl font-bold">Download Queue</h2>
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
            {items.length} Videos
          </span>
        </div>
        
        <div className="flex gap-3">
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
            <Button 
              onClick={onDownloadZip}
              className="bg-accent text-background hover:bg-accent/90 shadow-[0_4px_14px_0_rgba(26,250,26,0.25)]"
            >
              <Archive className="w-4 h-4 mr-2" />
              Download All (ZIP)
            </Button>
          )}

          <Button 
            variant="ghost" 
            onClick={onClear}
            disabled={isProcessing}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="mb-8 p-6 rounded-2xl bg-primary/20 border border-border/40">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Batch Progress</p>
            <h3 className="text-3xl font-bold font-headline">
              {overallProgress}% <span className="text-sm font-normal text-muted-foreground">Complete</span>
            </h3>
          </div>
          <div className="text-right text-xs font-medium text-muted-foreground space-y-1">
            <p className="flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              {completedCount} Success
            </p>
            <p className="flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive"></span>
              {failedCount} Errors
            </p>
          </div>
        </div>
        <Progress value={overallProgress} className="h-3 bg-background/50" />
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <DownloadItem key={item.id} item={item} />
        ))}
      </div>

      {failedCount > 0 && (
        <div className="mt-8 p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-destructive">Some downloads failed</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Check individual items for error logs. Failure might occur due to invalid URLs or region restrictions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
