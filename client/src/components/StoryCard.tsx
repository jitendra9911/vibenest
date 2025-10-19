import type { StoryWithAuthor } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
