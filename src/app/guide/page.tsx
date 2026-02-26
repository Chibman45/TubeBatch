
"use client";

import { Header } from '@/components/TubeBatch/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileSpreadsheet, 
  Upload, 
  Play, 
  Archive, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateCsvTemplate } from '@/app/lib/csv-parser';

export default function GuidePage() {
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

  const steps = [
    {
      title: "Prepare your CSV",
      description: "Create a CSV file with at least one column for YouTube URLs. You can optionally include a column for Titles to name your files automatically.",
      icon: <FileSpreadsheet className="w-6 h-6 text-accent" />,
      action: (
        <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="mt-2">
          Download Template
        </Button>
      )
    },
    {
      title: "Upload the List",
      description: "Drag and drop your file into the uploader on the home page. Our engine will automatically scan the file for valid video links.",
      icon: <Upload className="w-6 h-6 text-accent" />
    },
    {
      title: "Process the Batch",
      description: "Click 'Start Batch' to begin the downloads. Items are processed sequentially to ensure stability and high-quality stream capture.",
      icon: <Play className="w-6 h-6 text-accent" />
    },
    {
      title: "Archive & Save",
      description: "Once finished, click 'Download ZIP' to bundle all successfully downloaded videos into a single organized archive.",
      icon: <Archive className="w-6 h-6 text-accent" />
    }
  ];

  return (
    <main className="min-h-screen pb-20">
      <Header />
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">How it Works</h2>
          <p className="text-muted-foreground text-lg">
            Follow this simple 4-step process to download your YouTube libraries.
          </p>
        </div>

        <div className="grid gap-6">
          {steps.map((step, idx) => (
            <Card key={idx} className="glass-card border-none overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="bg-primary/20 p-6 flex items-center justify-center md:w-24">
                  <span className="text-2xl font-bold text-accent/50">{idx + 1}</span>
                </div>
                <CardContent className="p-6 flex flex-1 items-start gap-4">
                  <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    {step.action && <div className="mt-2">{step.action}</div>}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16">
          <Card className="glass-card border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <p>Ensure your URLs start with <code className="text-foreground">https://</code> or <code className="text-foreground">www.</code> for accurate detection.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <p>Use custom titles in your CSV to avoid messy filenames like "Watch?v=dQw4w9WgXcQ".</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <p>If a download fails, you can retry individual items without restarting the whole batch.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
