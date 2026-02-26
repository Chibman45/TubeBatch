import { VideoItem } from './types';

/**
 * Parses a CSV string into an array of VideoItem objects.
 * Automatically attempts to find the URL and Title columns.
 */
export function parseVideoCsv(content: string): VideoItem[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Parse rows into arrays of strings, handling basic quoted values
  const rows = lines.map(line => {
    // Split by comma that is not inside quotes
    return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(part => part.trim().replace(/^"|"$/g, ''));
  });

  const headerRow = rows[0];
  let urlIndex = -1;
  let titleIndex = -1;

  const urlKeywords = ['url', 'link', 'video', 'source', 'youtube', 'address', 'uri', 'v-url'];
  const titleKeywords = ['title', 'name', 'label', 'description', 'subject', 'headline', 'filename'];

  // 1. Try to find columns by header names
  headerRow.forEach((cell, index) => {
    const val = cell.toLowerCase();
    if (urlIndex === -1 && urlKeywords.some(k => val.includes(k))) urlIndex = index;
    if (titleIndex === -1 && titleKeywords.some(k => val.includes(k))) titleIndex = index;
  });

  // 2. If urlIndex still not found, search for a cell that looks like a URL in any column of the first few rows
  if (urlIndex === -1) {
    for (let r = 0; r < Math.min(rows.length, 3); r++) {
      const foundUrlIdx = rows[r].findIndex(cell => 
        cell.toLowerCase().startsWith('http') || cell.toLowerCase().startsWith('www.')
      );
      if (foundUrlIdx !== -1) {
        urlIndex = foundUrlIdx;
        break;
      }
    }
  }

  // Fallback defaults
  if (urlIndex === -1) urlIndex = 0;
  if (titleIndex === -1) titleIndex = urlIndex === 0 ? 1 : 0;

  const items: VideoItem[] = [];
  
  // Detect if the first row is a header row (it doesn't contain a URL in the urlIndex column)
  const firstRowIsHeader = !headerRow[urlIndex]?.toLowerCase().startsWith('http') && !headerRow[urlIndex]?.toLowerCase().startsWith('www.');
  const startIndex = firstRowIsHeader ? 1 : 0;

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    const urlValue = row[urlIndex];
    const titleValue = row[titleIndex] || `Video ${items.length + 1}`;

    if (urlValue && (urlValue.toLowerCase().startsWith('http') || urlValue.toLowerCase().startsWith('www.'))) {
      items.push({
        id: `vid-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
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
