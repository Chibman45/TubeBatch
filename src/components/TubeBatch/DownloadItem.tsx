"use client";

import { VideoItem } from '@/app/lib/types';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Youtube,
  FileVideo
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DownloadItemProps {
  item: VideoItem;
}

export function DownloadItem({ item }: DownloadItemProps) {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-accent" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'downloading':
        return <Loader2 className="w-5 h-5 text-accent animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (item.status) {
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'downloading': return `Downloading ${item.progress}%`;
      default: return 'Pending';
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl glass-card transition-all hover:border-accent/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn(
            "p-2 rounded-lg bg-primary/40 flex-shrink-0",
            item.status === 'completed' && "bg-accent/10 text-accent",
            item.status === 'failed' && "bg-destructive/10 text-destructive"
          )}>
            <FileVideo className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-medium text-sm truncate pr-4">{item.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <Youtube className="w-3 h-3 text-destructive" />
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{item.url}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <span className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              item.status === 'completed' && "text-accent bg-accent/10",
              item.status === 'failed' && "text-destructive bg-destructive/10",
              item.status === 'downloading' && "text-accent animate-pulse",
              item.status === 'pending' && "text-muted-foreground bg-muted"
            )}>
              {getStatusText()}
            </span>
            {item.error && <p className="text-[10px] text-destructive mt-1 max-w-[120px]">{item.error}</p>}
          </div>
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
        </div>
      </div>

      {(item.status === 'downloading' || item.status === 'completed') && (
        <div className="w-full">
          <div className="flex justify-between items-center mb-1.5 px-1">
             <span className="text-[10px] text-muted-foreground font-medium">Download Progress</span>
             <span className="text-[10px] text-accent font-bold">{item.progress}%</span>
          </div>
          <Progress 
            value={item.progress} 
            className="h-1.5 bg-muted/30" 
            indicatorClassName={cn(
                "transition-all duration-300",
                item.status === 'completed' ? 'progress-vibrant' : 'bg-accent/60'
            )}
          />
        </div>
      )}
    </div>
  );
}
