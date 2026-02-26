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

  // Detect delimiter
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  // Parse all rows into a raw grid
  const grid = lines.map(line => {
    return line.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''));
  });

  const items: VideoItem[] = [];
  const urlPattern = /(youtube\.com|youtu\.be|https?:\/\/|www\.)/i;

  grid.forEach((row, rowIndex) => {
    // Find the first cell that looks like a URL
    const urlIndex = row.findIndex(cell => urlPattern.test(cell));
    
    if (urlIndex !== -1) {
      const urlValue = row[urlIndex];
      
      // If this row contains a URL, it's likely data, not a header
      // Try to find a title in a different column (preferring one that isn't the URL)
      let titleValue = `Video ${items.length + 1}`;
      
      // Look for a non-URL column to use as a title
      for (let i = 0; i < row.length; i++) {
        if (i !== urlIndex && row[i].length > 1) {
          titleValue = row[i];
          break;
        }
      }

      items.push({
        id: `vid-${Date.now()}-${rowIndex}-${Math.random().toString(36).substring(2, 7)}`,
        url: urlValue.toLowerCase().startsWith('www.') ? `https://${urlValue}` : urlValue,
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
