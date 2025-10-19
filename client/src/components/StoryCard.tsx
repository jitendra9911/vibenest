import type { StoryWithAuthor, CommentWithAuthor } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookOpen, CheckCircle2, Sparkles, Heart, MessageCircle, Share2, ExternalLink, UserPlus, UserMinus } from "lucide-react";
import { SiX, SiFacebook } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
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

  // Fetch follow status
  const { data: followData } = useQuery<{ isFollowing: boolean; followerCount: number; followingCount: number }>({
    queryKey: ["/api/users", story.userId, "follow-status"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${story.userId}/follow-status`);
      if (!response.ok) throw new Error("Failed to fetch follow status");
      return response.json();
    },
    enabled: !isOwnStory,
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
      queryClient.invalidateQueries({ queryKey: ["/api/stories/personalized"] });
      toast({
        title: followData?.isFollowing ? "Unfollowed" : "Following",
        description: followData?.isFollowing 
          ? `You unfollowed ${displayName}` 
          : `You are now following ${displayName}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleFollow = () => {
    followMutation.mutate();
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
      {/* Story Content Container */}
      <div className="relative w-full max-w-md h-full flex flex-col">
        {/* Author Header - Top Overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20" data-testid={`avatar-${story.userId}`}>
              <AvatarImage 
                src={story.user.profileImageUrl || undefined} 
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate" data-testid={`author-name-${story.id}`}>
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground" data-testid={`story-time-${story.id}`}>
                {formatDistanceToNow(new Date(story.createdAt!), { addSuffix: true })}
              </p>
            </div>
            {!isOwnStory && (
              <Button
                variant={followData?.isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollow}
                disabled={followMutation.isPending}
                className="gap-1.5 hover-elevate active-elevate-2"
                data-testid={`button-follow-${story.userId}`}
              >
                {followMutation.isPending ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : followData?.isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Main Story Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="w-full max-h-full overflow-y-auto scrollbar-hide">
            <h2 
              className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-6 leading-tight"
              data-testid={`story-title-${story.id}`}
            >
              {story.title}
            </h2>
            <div 
              className="text-base sm:text-lg text-foreground/90 leading-relaxed whitespace-pre-wrap"
              data-testid={`story-content-${story.id}`}
            >
              {story.content}
            </div>
          </div>
        </div>

        {/* Interactive Buttons - Right Side */}
        <div className="absolute right-4 bottom-24 z-20 flex flex-col gap-4">
          {/* Like Button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              disabled={likesLoading || likeMutation.isPending}
              className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2"
              data-testid={`button-like-${story.id}`}
            >
              <Heart 
                className={`h-6 w-6 ${likeData?.isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
            </Button>
            <span className="text-xs font-semibold text-foreground" data-testid={`like-count-${story.id}`}>
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
                  className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2"
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
            <span className="text-xs font-semibold text-foreground" data-testid={`comment-count-${story.id}`}>
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
                  className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2"
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
        </div>

        {/* Category Badge - Bottom Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-background/90 via-background/60 to-transparent backdrop-blur-sm">
          <div className="flex justify-center">
            <Badge 
              className={`${config.colorClass} px-4 py-2 text-sm font-medium gap-2 shadow-lg`}
              data-testid={`category-badge-${story.id}`}
            >
              <Icon className="h-4 w-4" />
              {config.label}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
