import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { StoryWithAuthor } from "@shared/schema";
import { StoryCard } from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import { BookmarkCheck, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";

export default function SavedStories() {
  const { user, isLoading: authLoading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { data: stories, isLoading: storiesLoading } = useQuery<StoryWithAuthor[]>({
    queryKey: ["/api/bookmarks"],
    enabled: !!user,
  });

  const isLoading = authLoading || storiesLoading;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!stories?.length) return;
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(prev + 1, stories.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stories?.length]);

  // Scroll to current story
  useEffect(() => {
    const element = document.getElementById(`story-${currentIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentIndex]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="icon"
                data-testid="button-back"
                className="hover-elevate active-elevate-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-primary" />
              <span className="font-display font-bold text-lg text-foreground">
                Saved Stories
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Story Feed */}
      <div 
        className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth pt-14"
        data-testid="saved-stories-feed"
      >
        {isLoading ? (
          <div className="h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground">Loading saved stories...</p>
            </div>
          </div>
        ) : !stories || stories.length === 0 ? (
          <div className="h-screen flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md px-4">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                <BookmarkCheck className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display font-bold text-2xl text-foreground">No Saved Stories</h2>
                <p className="text-muted-foreground">
                  Bookmark stories you love to save them for later!
                </p>
              </div>
              <Link href="/">
                <Button 
                  size="lg"
                  data-testid="button-browse-stories"
                  className="gap-2 hover-elevate active-elevate-2"
                >
                  Browse Stories
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {stories.map((story, index) => (
              <div key={story.id} id={`story-${index}`}>
                <StoryCard story={story} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
