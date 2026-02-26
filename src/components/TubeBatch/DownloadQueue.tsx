
"use client";

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
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { generateCsvTemplate } from '@/app/lib/csv-parser';

interface DownloadQueueProps {
  items: VideoItem[];
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
  onStart, 
  onClear, 
  onRemove,
  onRetry,
  onDownloadZip,
  isProcessing,
  isCloudSyncing
}: DownloadQueueProps) {
  // If cloud syncing is true or items are empty, show initial loading
  if (isCloudSyncing || (items.length === 0 && !isProcessing)) {
    return (
      <div className="w-full max-w-4xl mx-auto py-20 text-center animate-pulse">
        <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
        <h3 className="text-xl font-bold">Synchronizing Queue...</h3>
        <p className="text-muted-foreground">Building your download list in the cloud.</p>
      </div>
    );
  }

  const completedCount = items.filter(i => i.status === 'completed').length;
  const failedCount = items.filter(i => i.status === 'failed').length;
  const overallProgress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  const isFinished = (completedCount + failedCount) === items.length && items.length > 0;

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
        
        <div className="flex flex-wrap gap-2">
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
              disabled={completedCount === 0}
              className="bg-accent text-background hover:bg-accent/90 shadow-[0_4px_14_0_rgba(26,250,26,0.25)]"
            >
              <Archive className="w-4 h-4 mr-2" />
              Download ZIP ({completedCount})
            </Button>
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

      <div className="mb-8 p-6 rounded-2xl bg-primary/20 border border-border/40 relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-end mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Batch Progress</p>
            <h3 className="text-3xl font-bold">
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

      <div className="grid gap-3">
        {items.map((item) => (
          <DownloadItem 
            key={item.id} 
            item={item} 
            onRemove={onRemove} 
            onRetry={onRetry}
            disabled={isProcessing}
          />
        ))}
      </div>

      {failedCount > 0 && !isProcessing && (
        <div className="mt-8 p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <Info className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-destructive">Download disruptions detected</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Some files encountered errors. Use the retry button on individual items to attempt the download again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
