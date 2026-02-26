export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'failed';

export interface VideoItem {
  id: string;
  url: string;
  title: string;
  status: DownloadStatus;
  progress: number;
  error?: string;
  size?: string;
}

export interface BatchStats {
  total: number;
  completed: number;
  failed: number;
  isProcessing: boolean;
  status: string;
  endTime?: any; // Firestore Timestamp
}
