import { createContext, useContext, useState, useCallback } from "react";

interface MusicPlayerContextType {
  currentPlayingStoryId: string | null;
  setCurrentPlayingStory: (storyId: string | null) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentPlayingStoryId, setCurrentPlayingStoryId] = useState<string | null>(null);

  const setCurrentPlayingStory = useCallback((storyId: string | null) => {
    setCurrentPlayingStoryId(storyId);
  }, []);

  return (
    <MusicPlayerContext.Provider value={{ currentPlayingStoryId, setCurrentPlayingStory }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
}
