import { VideoItem } from './types';

/**
 * Parses a CSV string into an array of VideoItem objects.
 * Uses intelligent column detection by scanning for URL patterns.
 */
export function parseVideoCsv(content: string): VideoItem[] {
  if (!content || !content.trim()) return [];

  // Split into lines
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter (comma or semicolon)
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  // Parse rows and clean up quotes
  const rows = lines.map(line => {
    // Simple split for now, handling most common cases
    return line.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''));
  });

  const headerRow = rows[0];
  let urlIndex = -1;
  let titleIndex = -1;

  // 1. Try to find columns by common keywords in headers
  const urlKeywords = ['url', 'link', 'video', 'source', 'youtube', 'address', 'uri', 'v-url', 'stream'];
  const titleKeywords = ['title', 'name', 'label', 'description', 'subject', 'headline', 'filename', 'file'];

  headerRow.forEach((cell, index) => {
    const val = cell.toLowerCase();
    if (urlIndex === -1 && urlKeywords.some(k => val.includes(k))) urlIndex = index;
    if (titleIndex === -1 && titleKeywords.some(k => val.includes(k))) titleIndex = index;
  });

  // 2. If urlIndex still not found, search for a cell that looks like a URL in any column of the first few rows
  if (urlIndex === -1) {
    for (let r = 0; r < Math.min(rows.length, 5); r++) {
      const foundUrlIdx = rows[r].findIndex(cell => {
        const val = cell.toLowerCase();
        return val.includes('youtube.com') || 
               val.includes('youtu.be') || 
               val.startsWith('http') || 
               val.startsWith('www.');
      });
      if (foundUrlIdx !== -1) {
        urlIndex = foundUrlIdx;
        break;
      }
    }
  }

  // Fallback defaults
  if (urlIndex === -1) urlIndex = 0;
  if (titleIndex === -1) {
    // Pick the "other" column if it exists
    titleIndex = rows[0].length > 1 ? (urlIndex === 0 ? 1 : 0) : urlIndex;
  }

  const items: VideoItem[] = [];
  
  // Detect if the first row is a header row 
  // (It's a header if it doesn't contain a URL pattern in the urlIndex column)
  const firstRowVal = headerRow[urlIndex]?.toLowerCase() || '';
  const firstRowIsHeader = !firstRowVal.includes('youtube.com') && 
                           !firstRowVal.includes('youtu.be') && 
                           !firstRowVal.startsWith('http') && 
                           !firstRowVal.startsWith('www.');
  
  const startIndex = firstRowIsHeader ? 1 : 0;

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length <= urlIndex) continue;

    const urlValue = row[urlIndex];
    // Default title if empty or same as URL
    const titleValue = row[titleIndex] && row[titleIndex] !== urlValue 
      ? row[titleIndex] 
      : `Video ${items.length + 1}`;

    if (urlValue && (
      urlValue.toLowerCase().includes('youtube.com') || 
      urlValue.toLowerCase().includes('youtu.be') || 
      urlValue.toLowerCase().startsWith('http') || 
      urlValue.toLowerCase().startsWith('www.')
    )) {
      items.push({
        id: `vid-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        url: urlValue.toLowerCase().startsWith('www.') ? `https://${urlValue}` : urlValue,
        title: titleValue,
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
