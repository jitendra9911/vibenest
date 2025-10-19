import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { StoryWithAuthor } from "@shared/schema";
import { StoryCard } from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, User, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { data: stories, isLoading: storiesLoading } = useQuery<StoryWithAuthor[]>({
    queryKey: ["/api/stories/personalized"],
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
      {/* Top Navigation Bar - Mobile & Desktop */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground hidden sm:inline">
              Story Social
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/create">
              <Button 
                size="icon"
                data-testid="button-create-story"
                className="hover-elevate active-elevate-2"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button 
                variant="ghost" 
                size="icon"
                data-testid="button-profile"
                className="hover-elevate active-elevate-2"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Story Feed */}
      <div 
        className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth pt-14"
        data-testid="story-feed"
      >
        {isLoading ? (
          <div className="h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground">Loading stories...</p>
            </div>
          </div>
        ) : !stories || stories.length === 0 ? (
          <div className="h-screen flex items-center justify-center px-6">
            <div className="text-center space-y-6 max-w-md">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display font-bold text-2xl text-foreground">No Stories Yet</h2>
                <p className="text-muted-foreground">
                  Be the first to share a story with the community!
                </p>
              </div>
              <Link href="/create">
                <Button 
                  size="lg"
                  data-testid="button-create-first-story"
                  className="gap-2 hover-elevate active-elevate-2"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Story
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
            {/* Scroll Hint */}
            {stories.length > 1 && currentIndex === 0 && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-bounce">
                <div className="bg-background/80 backdrop-blur-sm rounded-full p-2 border border-border">
                  <ChevronDown className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
