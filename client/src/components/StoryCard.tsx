import type { StoryWithAuthor, CommentWithAuthor } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookOpen, CheckCircle2, Sparkles, Heart, MessageCircle, Share2, ExternalLink, UserPlus, UserMinus, Bookmark, Volume2, VolumeX } from "lucide-react";
import { SiX, SiFacebook } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

interface StoryCardProps {
  story: StoryWithAuthor;
}

const categoryConfig = {
  fictional: {
    label: "Fictional",
    icon: BookOpen,
    colorClass: "bg-story-fictional text-story-fictional-foreground",
  },
  real: {
    label: "Real Story",
    icon: CheckCircle2,
    colorClass: "bg-story-real text-story-real-foreground",
  },
  both: {
    label: "Mixed",
    icon: Sparkles,
    colorClass: "bg-story-both text-story-both-foreground",
  },
};

export function StoryCard({ story }: StoryCardProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { currentPlayingStoryId, setCurrentPlayingStory } = useMusicPlayer();
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const config = categoryConfig[story.category as keyof typeof categoryConfig];
  const Icon = config.icon;
  
  const displayName = story.user.firstName && story.user.lastName
    ? `${story.user.firstName} ${story.user.lastName}`
    : story.user.firstName || story.user.lastName || "Anonymous";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isOwnStory = currentUser?.id === story.userId;

  // Pause music when another story starts playing
  useEffect(() => {
    if (currentPlayingStoryId !== story.id && isMusicPlaying) {
      setIsMusicPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [currentPlayingStoryId, story.id, isMusicPlaying]);

  // Pause music on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (currentPlayingStoryId === story.id) {
        setCurrentPlayingStory(null);
      }
    };
  }, [currentPlayingStoryId, story.id, setCurrentPlayingStory]);

  // Music player control
  useEffect(() => {
    if (story.musicUrl && audioRef.current) {
      audioRef.current.volume = 0.3; // Soft background music
      if (isMusicPlaying) {
        audioRef.current.play().catch(() => {
          setIsMusicPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying, story.musicUrl]);

  const toggleMusic = () => {
    if (story.musicUrl) {
      const newPlayingState = !isMusicPlaying;
      setIsMusicPlaying(newPlayingState);
      if (newPlayingState) {
        setCurrentPlayingStory(story.id);
      } else {
        setCurrentPlayingStory(null);
      }
    }
  };

  // Fetch like data
  const { data: likeData, isLoading: likesLoading } = useQuery<{ count: number; isLiked: boolean }>({
    queryKey: ["/api/stories", story.id, "likes"],
    queryFn: async () => {
      const response = await fetch(`/api/stories/${story.id}/likes`);
      if (!response.ok) throw new Error("Failed to fetch likes");
      return response.json();
    },
  });

  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery<CommentWithAuthor[]>({
    queryKey: ["/api/stories", story.id, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/stories/${story.id}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
    enabled: showComments,
  });

  // Fetch follow status
  const { data: followData } = useQuery<{ isFollowing: boolean }>({
    queryKey: ["/api/users", story.userId, "follow-status"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${story.userId}/follow-status`);
      if (!response.ok) throw new Error("Failed to fetch follow status");
      return response.json();
    },
    enabled: !isOwnStory,
  });

  // Fetch bookmark status
  const { data: bookmarkData } = useQuery<{ isBookmarked: boolean }>({
    queryKey: ["/api/stories", story.id, "bookmark-status"],
    queryFn: async () => {
      const response = await fetch(`/api/stories/${story.id}/bookmark-status`);
      if (!response.ok) throw new Error("Failed to fetch bookmark status");
      return response.json();
    },
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (likeData?.isLiked) {
        return await apiRequest("DELETE", `/api/stories/${story.id}/like`);
      } else {
        return await apiRequest("POST", `/api/stories/${story.id}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories", story.id, "likes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive",
      });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/stories/${story.id}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories", story.id, "comments"] });
      setCommentText("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (followData?.isFollowing) {
        return await apiRequest("DELETE", `/api/users/${story.userId}/follow`);
      } else {
        return await apiRequest("POST", `/api/users/${story.userId}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", story.userId, "follow-status"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (bookmarkData?.isBookmarked) {
        return await apiRequest("DELETE", `/api/stories/${story.id}/bookmark`);
      } else {
        return await apiRequest("POST", `/api/stories/${story.id}/bookmark`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories", story.id, "bookmark-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: bookmarkData?.isBookmarked ? "Removed from saved" : "Saved",
        description: bookmarkData?.isBookmarked ? "Story removed from your saved collection" : "Story added to your saved collection",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update bookmark",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!likesLoading) {
      likeMutation.mutate();
    }
  };

  const handleFollow = () => {
    followMutation.mutate();
  };

  const handleBookmark = () => {
    bookmarkMutation.mutate();
  };

  const handleComment = () => {
    if (commentText.trim()) {
      commentMutation.mutate(commentText);
    }
  };

  const handleShare = (platform: "link" | "twitter" | "facebook") => {
    const url = `${window.location.origin}/?story=${story.id}`;
    const text = `Check out this story: ${story.title}`;
    
    switch (platform) {
      case "link":
        navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Story link copied to clipboard",
        });
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
    }
  };

  return (
    <div 
      className="relative h-screen w-full snap-start snap-always flex items-center justify-center bg-background"
      data-testid={`story-card-${story.id}`}
    >
      {/* Background Music Player */}
      {story.musicUrl && (
        <audio ref={audioRef} loop>
          <source src={story.musicUrl} type="audio/mpeg" />
        </audio>
      )}

      {/* Story Content Container - Instagram Reels Style */}
      <div className="relative w-full max-w-2xl h-full">
        {/* Main Story Content - Cream Paper Background */}
        <div className="relative h-full bg-card rounded-lg shadow-xl overflow-hidden border-2 border-card-border">
          {/* Paper texture overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none z-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Story Content - Scrollable */}
          <div className="relative h-full overflow-y-auto px-8 py-12 scrollbar-hide bg-[#fdfbd4] dark:bg-transparent">
            {/* Category Badge - Top */}
            <div className="mb-6">
              <Badge className={`${config.colorClass} gap-2 px-3 py-1.5`} data-testid={`category-badge-${story.id}`}>
                <Icon className="h-4 w-4" />
                {config.label}
              </Badge>
            </div>

            {/* Story Title */}
            <h2 
              className="font-display font-bold text-3xl sm:text-4xl text-card-foreground mb-4 leading-tight"
              data-testid={`story-title-${story.id}`}
            >
              {story.title}
            </h2>

            {/* Caption (if exists) */}
            {story.caption && (
              <p 
                className="text-sm italic text-muted-foreground mb-6 border-l-4 border-primary/30 pl-4"
                data-testid={`story-caption-${story.id}`}
              >
                {story.caption}
              </p>
            )}

            {/* Story Content */}
            <div 
              className="text-lg text-card-foreground/90 leading-relaxed whitespace-pre-wrap font-serif pb-32"
              data-testid={`story-content-${story.id}`}
              style={{ textIndent: "2rem" }}
            >
              {story.content}
            </div>
          </div>

          {/* Bottom Left - Author Profile (Instagram Reels Style) */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-background/80 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
            <Avatar className="h-10 w-10 ring-2 ring-background" data-testid={`avatar-${story.userId}`}>
              <AvatarImage 
                src={story.user.profileImageUrl || undefined} 
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-3">
              <p className="font-semibold text-foreground text-sm" data-testid={`author-name-${story.id}`}>
                {displayName}
              </p>
              {!isOwnStory && (
                <Button
                  variant={followData?.isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={handleFollow}
                  disabled={followMutation.isPending}
                  className="h-7 px-3 text-xs hover-elevate active-elevate-2"
                  data-testid={`button-follow-${story.userId}`}
                >
                  {followMutation.isPending ? (
                    <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : followData?.isFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Right Side - Vertical Action Buttons (Instagram Reels Style) */}
          <div className="absolute right-4 bottom-20 z-20 flex flex-col items-center gap-6">
            {/* Like Button */}
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                disabled={likesLoading || likeMutation.isPending}
                className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md hover:bg-background hover-elevate active-elevate-2 shadow-lg"
                data-testid={`button-like-${story.id}`}
              >
                <Heart 
                  className={`h-6 w-6 ${likeData?.isLiked ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
              <span className="text-xs font-bold text-foreground bg-background/80 backdrop-blur-md px-2 py-0.5 rounded-full shadow-lg" data-testid={`like-count-${story.id}`}>
                {likeData?.count || 0}
              </span>
            </div>

            {/* Comments Button */}
            <div className="flex flex-col items-center gap-1">
              <Sheet open={showComments} onOpenChange={setShowComments}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md hover:bg-background hover-elevate active-elevate-2 shadow-lg"
                    data-testid={`button-comments-${story.id}`}
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Comments ({comments.length})</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col h-full mt-4 gap-4">
                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto space-y-4">
                      {commentsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No comments yet. Be the first to comment!
                        </div>
                      ) : (
                        comments.map((comment) => {
                          const commentAuthor = comment.user.firstName && comment.user.lastName
                            ? `${comment.user.firstName} ${comment.user.lastName}`
                            : comment.user.firstName || comment.user.lastName || "Anonymous";
                          const commentInitials = commentAuthor
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2);

                          return (
                            <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.user.profileImageUrl || undefined} />
                                <AvatarFallback className="bg-muted text-xs">{commentInitials}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">{commentAuthor}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.createdAt!), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground/90 mt-1">{comment.content}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Comment Input */}
                    <div className="border-t pt-4 flex gap-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 min-h-10 max-h-32 resize-none"
                        data-testid={`input-comment-${story.id}`}
                      />
                      <Button
                        onClick={handleComment}
                        disabled={!commentText.trim() || commentMutation.isPending}
                        className="hover-elevate active-elevate-2"
                        data-testid={`button-submit-comment-${story.id}`}
                      >
                        {commentMutation.isPending ? "..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <span className="text-xs font-bold text-foreground bg-background/80 backdrop-blur-md px-2 py-0.5 rounded-full shadow-lg" data-testid={`comment-count-${story.id}`}>
                {comments.length}
              </span>
            </div>

            {/* Share Button */}
            <div className="flex flex-col items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md hover:bg-background hover-elevate active-elevate-2 shadow-lg"
                    data-testid={`button-share-${story.id}`}
                  >
                    <Share2 className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleShare("link")} data-testid={`share-copy-link-${story.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("twitter")} data-testid={`share-twitter-${story.id}`}>
                    <SiX className="h-4 w-4 mr-2" />
                    Share on X
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("facebook")} data-testid={`share-facebook-${story.id}`}>
                    <SiFacebook className="h-4 w-4 mr-2" />
                    Share on Facebook
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Bookmark Button */}
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmark}
                disabled={bookmarkMutation.isPending}
                className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md hover:bg-background hover-elevate active-elevate-2 shadow-lg"
                data-testid={`button-bookmark-${story.id}`}
              >
                <Bookmark 
                  className={`h-6 w-6 ${bookmarkData?.isBookmarked ? "fill-primary text-primary" : ""}`}
                />
              </Button>
            </div>

            {/* Music Toggle Button (if music URL exists) */}
            {story.musicUrl && (
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMusic}
                  className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md hover:bg-background hover-elevate active-elevate-2 shadow-lg"
                  data-testid={`button-music-${story.id}`}
                >
                  {isMusicPlaying ? (
                    <Volume2 className="h-6 w-6 text-primary" />
                  ) : (
                    <VolumeX className="h-6 w-6" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Timestamp - Top Right */}
          <div className="absolute top-4 right-4 z-20">
            <p className="text-xs text-foreground bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg" data-testid={`story-time-${story.id}`}>
              {formatDistanceToNow(new Date(story.createdAt!), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
