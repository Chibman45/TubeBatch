import { VideoItem } from './types';

export function parseVideoCsv(content: string): VideoItem[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const items: VideoItem[] = [];

  lines.forEach((line, index) => {
    // Split by comma or semicolon, handling potential quotes
    const parts = line.split(/[,;]/).map(part => part.trim().replace(/^"|"$/g, ''));
    
    if (parts.length === 0) return;

    const url = parts[0];
    const title = parts[1];
    
    // Skip header row if it contains keywords
    if (index === 0) {
      const isHeader = 
        url.toLowerCase() === 'url' || 
        url.toLowerCase() === 'link' || 
        url.toLowerCase() === 'video' ||
        (title && title.toLowerCase() === 'title');
      if (isHeader) return;
    }

    // Basic URL validation
    if (url && (url.toLowerCase().startsWith('http') || url.toLowerCase().startsWith('www.'))) {
      items.push({
        id: `vid-${Date.now()}-${index}`,
        url: url.toLowerCase().startsWith('www.') ? `https://${url}` : url,
        title: title || `Video ${items.length + 1}`,
        status: 'pending',
        progress: 0,
      });
    }
  });

  return items;
}

export function generateCsvTemplate(): string {
  return "url,title\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ,Never Gonna Give You Up\nhttps://www.youtube.com/watch?v=9bZkp7q19f0,PSY - GANGNAM STYLE";
}
