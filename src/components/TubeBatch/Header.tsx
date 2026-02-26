"use client";

import { DownloadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCsvTemplate } from '@/app/lib/csv-parser';

export function Header() {
  const { toast } = useToast();

  const handleDownloadTemplate = () => {
    const template = generateCsvTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tubebatch_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "The standard CSV format is ready for your video list.",
    });
  };

  const handleComingSoon = (feature: string) => {
    toast({
      title: `${feature} Coming Soon`,
      description: "We are currently finalizing the documentation and support portals.",
    });
  };

  return (
    <header className="py-8 border-b border-border/40 mb-8">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(26,250,26,0.2)]">
            <DownloadCloud className="text-background w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">TubeBatch</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Downloader Studio</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <span 
            onClick={() => handleComingSoon('Guide')} 
            className="hover:text-accent transition-colors cursor-pointer"
          >
            Guide
          </span>
          <span 
            onClick={handleDownloadTemplate} 
            className="hover:text-accent transition-colors cursor-pointer"
          >
            CSV Template
          </span>
          <span 
            onClick={() => handleComingSoon('Support')} 
            className="hover:text-accent transition-colors cursor-pointer"
          >
            Support
          </span>
        </div>
      </div>
    </header>
  );
}
