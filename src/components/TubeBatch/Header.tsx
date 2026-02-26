
"use client";

import { DownloadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCsvTemplate } from '@/app/lib/csv-parser';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const { toast } = useToast();
  const pathname = usePathname();

  const handleDownloadTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
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

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Guide', href: '/guide' },
    { label: 'Support', href: '/support' },
  ];

  return (
    <header className="py-8 border-b border-border/40 mb-8">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(26,250,26,0.2)]">
            <DownloadCloud className="text-background w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">TubeBatch</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Downloader Studio</p>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-accent",
                pathname === item.href ? "text-accent" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          <span 
            onClick={handleDownloadTemplate} 
            className="text-muted-foreground hover:text-accent transition-colors cursor-pointer"
          >
            CSV Template
          </span>
        </div>
      </div>
    </header>
  );
}
