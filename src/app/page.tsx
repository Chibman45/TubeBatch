"use client";

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/TubeBatch/Header';
import { CsvUploader } from '@/components/TubeBatch/CsvUploader';
import { DownloadQueue } from '@/components/TubeBatch/DownloadQueue';
import { VideoItem } from '@/app/lib/types';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import { 
  useUser, 
  useFirestore, 
  useAuth, 
  useCollection, 
  useDoc,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  initiateAnonymousSignIn
} from '@/firebase';
import { collection, doc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // 1. Production Authentication: Ensure every user has a private UID (Anonymous Login)
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // 2. Persistent History: Fetch the latest batch for this user to restore session
  const batchesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'downloadBatches'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [firestore, user]);

  const { data: batches, isLoading: isBatchesLoading } = useCollection(batchesQuery);

  // Restore the latest batch ID if none is active
  useEffect(() => {
    if (batches && batches.length > 0 && !activeBatchId) {
      setActiveBatchId(batches[0].id);
    }
  }, [batches, activeBatchId]);

  // 3. Real-time Batch Status: Fetch the active batch document
  const activeBatchRef = useMemoFirebase(() => {
    if (!firestore || !user || !activeBatchId) return null;
    return doc(firestore, 'users', user.uid, 'downloadBatches', activeBatchId);
  }, [firestore, user, activeBatchId]);

  const { data: activeBatch } = useDoc(activeBatchRef);

  // 4. Real-time Sync: Fetch all video entries for the active batch
  const entriesQuery = useMemoFirebase(() => {
    if (!firestore || !user || !activeBatchId) return null;
    return query(
      collection(firestore, 'users', user.uid, 'downloadBatches', activeBatchId, 'videoDownloadEntries'),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, user, activeBatchId]);

  const { data: entries, isLoading: isEntriesLoading } = useCollection(entriesQuery);

  // Map Firestore data to UI state
  const items: VideoItem[] = (entries || []).map(e => ({
    id: e.id,
    url: e.originalUrl,
    title: e.desiredTitle,
    status: e.status as any,
    progress: e.progress,
    error: e.errorMessage,
    size: e.filePath?.split('|')[1]
  }));

  const isProcessing = activeBatch?.status === 'PROCESSING';

  const handleUpload = async (newItems: VideoItem[]) => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Connection Pending",
        description: "Please wait a moment for the cloud engine to initialize.",
      });
      return;
    }

    setIsInitializing(true);
    try {
      // Create persistent batch record
      const batchRef = await addDocumentNonBlocking(
        collection(firestore, 'users', user.uid, 'downloadBatches'),
        {
          userId: user.uid,
          status: 'PENDING',
          totalVideos: newItems.length,
          completedVideos: 0,
          failedVideos: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      );

      if (batchRef) {
        // Switch UI to the new batch immediately
        setActiveBatchId(batchRef.id);
        
        // Persist individual video entries
        newItems.forEach((item) => {
          addDocumentNonBlocking(
            collection(firestore, 'users', user.uid, 'downloadBatches', batchRef.id, 'videoDownloadEntries'),
            {
              batchId: batchRef.id,
              userId: user.uid,
              originalUrl: item.url,
              desiredTitle: item.title,
              status: 'pending',
              progress: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }
          );
        });

        toast({
          title: "Queue Created",
          description: `Successfully loaded ${newItems.length} videos into your cloud workspace.`,
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Could not create the download batch in the database.",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const clearQueue = () => {
    setActiveBatchId(null);
  };

  const removeItem = (id: string) => {
    if (!user || !activeBatchId || !firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'downloadBatches', activeBatchId, 'videoDownloadEntries', id));
  };

  const retryItem = (id: string) => {
    if (!user || !activeBatchId || !firestore) return;
    updateDocumentNonBlocking(
      doc(firestore, 'users', user.uid, 'downloadBatches', activeBatchId, 'videoDownloadEntries', id),
      { status: 'pending', progress: 0, errorMessage: null, updatedAt: serverTimestamp() }
    );
  };

  const startBatch = () => {
    if (!user || !activeBatchId || !firestore) return;
    updateDocumentNonBlocking(
      doc(firestore, 'users', user.uid, 'downloadBatches', activeBatchId),
      { status: 'PROCESSING', startTime: serverTimestamp(), updatedAt: serverTimestamp() }
    );
  };

  const simulateDownload = (onProgress: (p: number) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 5;
        if (progress >= 100) {
          clearInterval(interval);
          onProgress(100);
          resolve();
        } else {
          onProgress(progress);
        }
        // Simulated random failure
        if (Math.random() < 0.01) {
          clearInterval(interval);
          reject(new Error("Stream connection lost."));
        }
      }, 300);
    });
  };

  const processItem = useCallback(async (entryId: string) => {
    if (!user || !activeBatchId || !firestore) return;

    const entryRef = doc(firestore, 'users', user.uid, 'downloadBatches', activeBatchId, 'videoDownloadEntries', entryId);
    
    updateDocumentNonBlocking(entryRef, { status: 'downloading', progress: 0, updatedAt: serverTimestamp() });

    try {
      await simulateDownload((progress) => {
        updateDocumentNonBlocking(entryRef, { progress, updatedAt: serverTimestamp() });
      });

      updateDocumentNonBlocking(entryRef, { 
        status: 'completed', 
        progress: 100, 
        filePath: `simulated_path|${(Math.random() * 50 + 10).toFixed(1)}MB`,
        updatedAt: serverTimestamp() 
      });
    } catch (err: any) {
      updateDocumentNonBlocking(entryRef, { 
        status: 'failed', 
        errorMessage: err.message || 'Unknown error',
        updatedAt: serverTimestamp() 
      });
    }
  }, [user, activeBatchId, firestore]);

  useEffect(() => {
    if (!isProcessing || !items.length || !firestore || !user || !activeBatchId) return;

    const pendingItem = items.find(i => i.status === 'pending');
    const currentlyDownloadingCount = items.filter(i => i.status === 'downloading').length;

    if (pendingItem && currentlyDownloadingCount < 1) {
      processItem(pendingItem.id);
    } else if (!pendingItem && currentlyDownloadingCount === 0) {
      const allDone = items.every(i => i.status === 'completed' || i.status === 'failed');
      if (allDone) {
        updateDocumentNonBlocking(
          doc(firestore, 'users', user.uid, 'downloadBatches', activeBatchId),
          { status: 'COMPLETED', endTime: serverTimestamp(), updatedAt: serverTimestamp() }
        );
        toast({ title: "Batch Finished", description: "All items processed." });
      }
    }
  }, [items, isProcessing, processItem, toast, firestore, user, activeBatchId]);

  const downloadZip = async () => {
    const completedItems = items.filter(i => i.status === 'completed');
    if (completedItems.length === 0) return;

    toast({ title: "Generating ZIP", description: "Bundling videos..." });

    try {
      const zip = new JSZip();
      completedItems.forEach(item => {
        zip.file(`${item.title.replace(/[/\\?%*:|"<>]/g, '-')}.mp4`, `Simulated video content for: ${item.title}\nSource: ${item.url}`);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tubebatch-${activeBatchId}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ variant: "destructive", title: "Archive Failed" });
    }
  };

  if (isUserLoading || isBatchesLoading || isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
        <p className="text-muted-foreground animate-pulse text-sm">Loading your workspace...</p>
      </div>
    );
  }

  const showUploader = !activeBatchId || (items.length === 0 && !isEntriesLoading);

  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 pb-12">
        {showUploader ? (
          <div className="py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Batch download made simple.</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Upload any CSV containing YouTube links and let our engine handle the rest.
              </p>
            </div>
            <CsvUploader onUpload={handleUpload} />
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <DownloadQueue 
              items={items} 
              onStart={startBatch}
              onClear={clearQueue}
              onRemove={removeItem}
              onRetry={retryItem}
              onDownloadZip={downloadZip}
              isProcessing={isProcessing}
            />
          </div>
        )}
      </div>
    </main>
  );
}
