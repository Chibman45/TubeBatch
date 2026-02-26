import { VideoItem } from './types';

/**
 * Parses a CSV string into an array of VideoItem objects.
 * Uses an aggressive "data-first" strategy to find URLs in any column.
 */
export function parseVideoCsv(content: string): VideoItem[] {
  if (!content || !content.trim()) return [];

  // Split into lines and filter empty ones
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Detect delimiter - support comma, semicolon, and tab
  let delimiter = ',';
  const firstLine = lines[0];
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';')) delimiter = ';';

  // Parse all rows into a raw grid
  const grid = lines.map(line => {
    // Basic CSV splitting that respects simple quotes
    return line.split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, ''));
  });

  const items: VideoItem[] = [];
  // Aggressive pattern for any kind of YouTube link or general URL
  const urlPattern = /(youtube\.com|youtu\.be|https?:\/\/|www\.)/i;

  grid.forEach((row, rowIndex) => {
    // Find any cell that looks like a URL
    const urlIndex = row.findIndex(cell => urlPattern.test(cell));
    
    if (urlIndex !== -1) {
      const urlValue = row[urlIndex];
      
      // If this row contains a URL, it's likely data
      let titleValue = '';
      
      // Look for a non-URL column to use as a title (prefer columns with text)
      for (let i = 0; i < row.length; i++) {
        if (i !== urlIndex && row[i].length > 1) {
          titleValue = row[i];
          break;
        }
      }

      // Fallback title if none found
      if (!titleValue) {
        titleValue = `Video ${items.length + 1}`;
      }

      // Normalize URL
      let finalUrl = urlValue;
      if (finalUrl.toLowerCase().startsWith('www.')) {
        finalUrl = `https://${finalUrl}`;
      } else if (!finalUrl.toLowerCase().startsWith('http')) {
        finalUrl = `https://${finalUrl}`;
      }

      items.push({
        id: `vid-${Date.now()}-${rowIndex}-${Math.random().toString(36).substring(2, 7)}`,
        url: finalUrl,
        title: titleValue,
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
