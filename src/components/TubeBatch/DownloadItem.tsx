
"use client";

import { VideoItem } from '@/app/lib/types';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Youtube,
  FileVideo,
  Trash2,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DownloadItemProps {
  item: VideoItem;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  disabled?: boolean;
}

export function DownloadItem({ item, onRemove, onRetry, disabled }: DownloadItemProps) {
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
      case 'downloading': return item.progress < 5 ? 'Connecting...' : `Downloading ${item.progress}%`;
      default: return 'In Queue';
    }
  };

  return (
    <div className={cn(
      "flex flex-col gap-3 p-4 rounded-xl glass-card transition-all border border-transparent",
      item.status === 'downloading' && "border-accent/20 bg-accent/5"
    )}>
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
              {item.size && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-2">
                  <HardDrive className="w-2.5 h-2.5" />
                  {item.size}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right mr-2">
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
              item.status === 'completed' && "text-accent bg-accent/10",
              item.status === 'failed' && "text-destructive bg-destructive/10",
              item.status === 'downloading' && "text-accent bg-accent/5 animate-pulse",
              item.status === 'pending' && "text-muted-foreground bg-muted/40"
            )}>
              {getStatusText()}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <TooltipProvider>
              {item.status === 'failed' && onRetry && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-accent"
                      onClick={() => onRetry(item.id)}
                      disabled={disabled}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Retry Download</TooltipContent>
                </Tooltip>
              )}
              
              {onRemove && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(item.id)}
                      disabled={disabled || item.status === 'downloading'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove from Queue</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
          
          <div className="ml-1">
            {getStatusIcon()}
          </div>
        </div>
      </div>

      {(item.status === 'downloading' || item.status === 'completed') && (
        <div className="w-full">
          <div className="flex justify-between items-center mb-1.5 px-1">
             <span className="text-[10px] text-muted-foreground font-medium">Stream Buffer</span>
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
      
      {item.error && (
        <div className="px-2 py-1.5 bg-destructive/5 rounded-md border border-destructive/10 flex items-center gap-2">
          <AlertCircle className="w-3 h-3 text-destructive" />
          <p className="text-[10px] text-destructive font-medium">{item.error}</p>
        </div>
      )}
    </div>
  );
}
