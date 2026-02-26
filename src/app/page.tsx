
"use client";

import { useState } from 'react';
import { Header } from '@/components/TubeBatch/Header';
import { CsvUploader } from '@/components/TubeBatch/CsvUploader';
import { DownloadQueue } from '@/components/TubeBatch/DownloadQueue';
import { VideoItem } from '@/app/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import JSZip from 'jszip';

export default function Home() {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleUpload = (newItems: VideoItem[]) => {
    setItems(newItems);
    toast({
      title: "CSV Imported",
      description: `Successfully loaded ${newItems.length} videos from the file.`,
    });
  };

  const clearQueue = () => {
    setItems([]);
    setIsProcessing(false);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const retryItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'pending', progress: 0, error: undefined } : item
    ));
  };

  const startBatch = async () => {
    setIsProcessing(true);
    
    const pendingItems = items.filter(item => item.status === 'pending' || item.status === 'failed');
    
    for (const item of pendingItems) {
      // Set to downloading
      setItems(prev => prev.map(it => 
        it.id === item.id ? { ...it, status: 'downloading', progress: 0 } : it
      ));

      try {
        // Step 1: Simulate Metadata Fetching
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Step 2: Simulate Download Progress
        await simulateDownload(item.id, (progress) => {
          setItems(prev => prev.map(it => 
            it.id === item.id ? { ...it, progress } : it
          ));
        });

        // Step 3: Complete
        setItems(prev => prev.map(it => 
          it.id === item.id ? { ...it, status: 'completed', progress: 100, size: `${(Math.random() * 50 + 10).toFixed(1)}MB` } : it
        ));
      } catch (err: any) {
        setItems(prev => prev.map(it => 
          it.id === item.id ? { ...it, status: 'failed', error: err.message || 'Unknown error' } : it
        ));
      }
    }
    
    setIsProcessing(false);
    toast({
      title: "Batch Process Finished",
      description: "The engine has processed all items in the current queue.",
    });
  };

  const simulateDownload = (id: string, onProgress: (p: number) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 5;
        
        if (progress >= 100) {
          clearInterval(interval);
          onProgress(100);
          resolve();
        } else {
          onProgress(progress);
        }

        // Small random failure chance for realism
        if (Math.random() < 0.005) {
          clearInterval(interval);
          reject(new Error("Stream connection lost. Please retry."));
        }
      }, 300);
    });
  };

  const downloadZip = async () => {
    const completedItems = items.filter(i => i.status === 'completed');
    if (completedItems.length === 0) return;

    toast({
      title: "Generating ZIP",
      description: `Bundling ${completedItems.length} videos into archive...`,
    });

    try {
      const zip = new JSZip();
      
      // Add each "video" to the zip
      // In a real app, these would be the actual file blobs
      completedItems.forEach(item => {
        zip.file(`${item.title.replace(/[/\\?%*:|"<>]/g, '-')}.mp4`, `Simulated video content for: ${item.title}\nSource: ${item.url}`);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tubebatch-archive-${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your batch ZIP file is now downloading.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Archive Failed",
        description: "Could not generate the ZIP file. Please try again.",
      });
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 pb-12">
        {items.length === 0 ? (
          <div className="py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Batch download made simple.</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                TubeBatch helps you grab entire libraries of content using your own naming conventions. 
                Just upload a CSV and let our engine handle the rest.
              </p>
            </div>
            <CsvUploader onUpload={handleUpload} />
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <DownloadQueue 
              items={items} 
              onStart={startBatch}
              onClear={clearQueue}
              onRemove={removeItem}
              onRetry={retryItem}
              onDownloadZip={downloadZip}
              isProcessing={isProcessing}
            />
          </div>
        )}
      </div>
      
      <Toaster />
    </main>
  );
}
