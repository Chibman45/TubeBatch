import { VideoItem } from './types';

export function parseVideoCsv(content: string): VideoItem[] {
  const lines = content.split(/\r?\n/);
  const items: VideoItem[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Support comma or semicolon separation
    const [url, title] = line.split(/[;,]/).map(s => s?.trim());
    
    if (url && url.startsWith('http')) {
      items.push({
        id: Math.random().toString(36).substring(2, 11),
        url,
        title: title || `Video-${items.length + 1}`,
        status: 'pending',
        progress: 0,
      });
    }
  }

  return items;
}
