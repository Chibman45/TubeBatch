"use client";

import { useState, useCallback } from 'react';
import { Header } from '@/components/TubeBatch/Header';
import { CsvUploader } from '@/components/TubeBatch/CsvUploader';
import { DownloadQueue } from '@/components/TubeBatch/DownloadQueue';
import { VideoItem } from '@/app/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

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

  const startBatch = async () => {
    setIsProcessing(true);
    
    // Create a copy to work with
    const updatedItems = [...items];
    
    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      
      // Update status to downloading
      setItems(prev => prev.map(it => 
        it.id === item.id ? { ...it, status: 'downloading', progress: 0 } : it
      ));

      // Simulate a download process
      try {
        await simulateDownload(item.id, (progress) => {
          setItems(prev => prev.map(it => 
            it.id === item.id ? { ...it, progress } : it
          ));
        });

        // Mark as completed
        setItems(prev => prev.map(it => 
          it.id === item.id ? { ...it, status: 'completed', progress: 100 } : it
        ));
      } catch (err: any) {
        setItems(prev => prev.map(it => 
          it.id === item.id ? { ...it, status: 'failed', error: err.message || 'Unknown error' } : it
        ));
      }
    }
    
    setIsProcessing(false);
    toast({
      title: "Batch Complete",
      description: "Finished processing the download queue.",
    });
  };

  const simulateDownload = (id: string, onProgress: (p: number) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        // Randomize progress increments to feel more natural
        progress += Math.floor(Math.random() * 15) + 5;
        
        if (progress >= 100) {
          clearInterval(interval);
          onProgress(100);
          resolve();
        } else {
          onProgress(progress);
        }

        // Simulate random failure (5% chance)
        if (Math.random() < 0.01) {
          clearInterval(interval);
          reject(new Error("Network timeout or invalid stream data."));
        }
      }, 400);
    });
  };

  const downloadZip = () => {
    // In a real app, we would use JSZip here
    toast({
      title: "Preparing Archive",
      description: "Compressing your downloads into a single ZIP file...",
    });
    
    setTimeout(() => {
      toast({
        title: "Download Ready",
        description: "Your batch archive has been generated and is downloading.",
      });
    }, 2000);
  };

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4">
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
