import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { StoryWithAuthor } from "@shared/schema";
import { StoryCard } from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, User, Search, X } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [showSearch, setShowSearch] = useState(false);
  
  // Use search endpoint if there's a query or category filter, otherwise use personalized feed
  const useSearchEndpoint = searchQuery.trim() !== "" || category !== "all";
  
  const { data: stories, isLoading: storiesLoading } = useQuery<StoryWithAuthor[]>({
    queryKey: useSearchEndpoint 
      ? ["/api/stories/search", { q: searchQuery, category: category !== "all" ? category : undefined }]
      : ["/api/stories/personalized"],
    queryFn: async () => {
      if (useSearchEndpoint) {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append('q', searchQuery);
        if (category !== 'all') params.append('category', category);
        const response = await fetch(`/api/stories/search?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to search stories");
        return response.json();
      }
      return undefined;
    },
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
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground hidden sm:inline">
                Story Social
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                data-testid="button-toggle-search"
                className="hover-elevate active-elevate-2"
              >
                {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>
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

          {/* Search & Filter Section */}
          {showSearch && (
            <div className="space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={category === "all" ? "default" : "outline"}
                  className="cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => setCategory("all")}
                  data-testid="filter-all"
                >
                  All
                </Badge>
                <Badge
                  variant={category === "fictional" ? "default" : "outline"}
                  className="cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => setCategory("fictional")}
                  data-testid="filter-fictional"
                >
                  Fictional
                </Badge>
                <Badge
                  variant={category === "real" ? "default" : "outline"}
                  className="cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => setCategory("real")}
                  data-testid="filter-real"
                >
                  Real Story
                </Badge>
                <Badge
                  variant={category === "both" ? "default" : "outline"}
                  className="cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => setCategory("both")}
                  data-testid="filter-both"
                >
                  Mixed
                </Badge>
              </div>
            </div>
          )}
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
          </>
        )}
      </div>
    </div>
  );
}
