
import { VideoItem } from './types';

export function parseVideoCsv(content: string): VideoItem[] {
  const lines = content.split(/\r?\n/);
  const items: VideoItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parser supporting quotes
    const regex = /(".*?"|[^,;]+)(?=\s*[,;]|\s*$)/g;
    const parts = line.match(regex)?.map(s => s.replace(/^"|"$/g, '').trim()) || [];
    
    if (parts.length === 0) continue;

    const url = parts[0];
    const title = parts[1];
    
    // Skip header row if it contains 'url' or 'title'
    if (i === 0 && (url.toLowerCase() === 'url' || (title && title.toLowerCase() === 'title'))) {
      continue;
    }

    if (url && (url.startsWith('http') || url.startsWith('www'))) {
      items.push({
        id: Math.random().toString(36).substring(2, 11),
        url: url.startsWith('www') ? `https://${url}` : url,
        title: title || `Video-${items.length + 1}`,
        status: 'pending',
        progress: 0,
      });
    }
  }

  return items;
}

export function generateCsvTemplate(): string {
  return "url,title\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ,Never Gonna Give You Up\nhttps://www.youtube.com/watch?v=9bZkp7q19f0,PSY - GANGNAM STYLE";
}
