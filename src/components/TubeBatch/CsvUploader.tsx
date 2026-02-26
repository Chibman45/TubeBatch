"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parseVideoCsv } from '@/app/lib/csv-parser';
import { VideoItem } from '@/app/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CsvUploaderProps {
  onUpload: (items: VideoItem[]) => void;
  disabled?: boolean;
}

export function CsvUploader({ onUpload, disabled }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsParsing(true);
    try {
      // Small delay to allow UI to show loading state
      await new Promise(r => setTimeout(r, 400));
      
      const text = await file.text();
      const items = parseVideoCsv(text);
      
      if (items.length > 0) {
        onUpload(items);
        toast({
          title: "File Processed",
          description: `Found ${items.length} valid video entries.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "No Data Found",
          description: "We couldn't find any YouTube URLs in that file. Please check the format.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Import Error",
        description: "Failed to read the CSV file. It might be corrupted or in an unsupported format.",
      });
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isParsing) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isParsing) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel')) {
      processFile(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a .csv file.",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-10">
      <Card
        className={`relative border-2 border-dashed transition-all duration-300 p-12 text-center glass-card overflow-hidden ${
          isDragging ? 'border-accent bg-accent/10 scale-[1.02]' : 'border-muted-foreground/20 hover:border-accent/40'
        } ${(disabled || isParsing) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isParsing && fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={disabled || isParsing}
        />
        
        <div className="flex flex-col items-center gap-6">
          <div className={`p-5 rounded-2xl bg-primary/40 text-accent transition-transform duration-500 ${isParsing ? 'animate-pulse scale-110' : ''}`}>
            {isParsing ? <Loader2 className="w-10 h-10 animate-spin" /> : <Upload className="w-10 h-10" />}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">
              {isParsing ? 'Analyzing File...' : 'Ready to Process'}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              {isParsing 
                ? 'Scanning your CSV for video links and custom titles...' 
                : 'Drag your CSV here or click to browse. We support any column order.'}
            </p>
          </div>

          {!isParsing && (
            <div className="flex flex-col items-center gap-4">
              <Button 
                variant="outline" 
                className="border-accent/30 hover:bg-accent/10 hover:text-accent font-semibold"
                disabled={disabled}
              >
                <FileText className="mr-2 h-4 w-4" />
                Select CSV File
              </Button>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-border/40 text-[10px] text-muted-foreground">
                <AlertCircle className="w-3 h-3 text-accent" />
                Pro tip: Headers like "url" or "title" are optional!
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
