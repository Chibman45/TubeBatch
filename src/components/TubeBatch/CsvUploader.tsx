"use client";

import { useState, useRef } from 'react';
import { FileUp, Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parseVideoCsv } from '@/app/lib/csv-parser';
import { VideoItem } from '@/app/lib/types';

interface CsvUploaderProps {
  onUpload: (items: VideoItem[]) => void;
  disabled?: boolean;
}

export function CsvUploader({ onUpload, disabled }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    const text = await file.text();
    const items = parseVideoCsv(text);
    if (items.length > 0) {
      onUpload(items);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      processFile(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-10">
      <Card
        className={`relative border-2 border-dashed transition-all duration-300 p-10 text-center glass-card ${
          isDragging ? 'border-accent bg-accent/5 scale-[1.01]' : 'border-muted-foreground/20 hover:border-accent/50'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/50 text-accent ring-8 ring-primary/20">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-1">Upload CSV List</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Drag and drop your CSV file containing video URLs and titles to start the batch process.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="mt-2 border-accent/20 hover:bg-accent/10 hover:text-accent hover:border-accent"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText className="mr-2 h-4 w-4" />
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Expected format: <span className="text-foreground font-mono">url, title</span>
          </p>
        </div>
      </Card>
    </div>
  );
}
