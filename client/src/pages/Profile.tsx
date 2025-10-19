import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfile, type Story } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LogOut, BookOpen, Edit2, Save, X } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: userStories, isLoading: storiesLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories/my"],
    enabled: !!user,
  });

  const form = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      bio: user?.bio || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({ bio: user.bio || "" });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your bio has been saved successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const onSubmit = (data: UpdateProfile) => {
    updateProfileMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.lastName || "Anonymous";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const storyCount = userStories?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            <h1 className="font-display font-bold text-xl text-foreground">Profile</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Profile Card */}
        <Card className="p-6 sm:p-8 space-y-6">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-32 w-32 ring-4 ring-primary/20" data-testid="avatar-profile">
              <AvatarImage 
                src={user.profileImageUrl || undefined} 
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display font-bold text-2xl text-foreground" data-testid="text-display-name">
                {displayName}
              </h2>
              {user.email && (
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-email">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 py-4 border-y border-border">
            <div className="text-center">
              <p className="font-display font-bold text-2xl text-foreground" data-testid="text-story-count">
                {storyCount}
              </p>
              <p className="text-sm text-muted-foreground">
                {storyCount === 1 ? "Story" : "Stories"}
              </p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel className="text-base font-semibold">Bio</FormLabel>
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  data-testid="button-edit-bio"
                  className="gap-2 hover-elevate active-elevate-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              ) : null}
            </div>

            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Tell others about yourself..."
                            className="min-h-32 resize-none"
                            data-testid="textarea-bio"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          {field.value?.length || 0} / 500 characters
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        form.reset({ bio: user.bio || "" });
                      }}
                      data-testid="button-cancel-bio"
                      className="flex-1 gap-2 hover-elevate active-elevate-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 gap-2 hover-elevate active-elevate-2"
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-bio"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="min-h-20 p-4 rounded-md bg-muted/30 border border-border">
                {user.bio ? (
                  <p className="text-foreground whitespace-pre-wrap" data-testid="text-bio">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic" data-testid="text-no-bio">
                    No bio yet. Click edit to add one.
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* My Stories */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-xl text-foreground">My Stories</h3>
          {storiesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : !userStories || userStories.length === 0 ? (
            <Card className="p-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">No stories yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your first story with the community
                </p>
              </div>
              <Link href="/create">
                <Button 
                  className="hover-elevate active-elevate-2"
                  data-testid="button-create-story-empty"
                >
                  Create Story
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4">
              {userStories.map((story) => (
                <Card key={story.id} className="p-4 hover-elevate" data-testid={`my-story-${story.id}`}>
                  <h4 className="font-semibold text-foreground mb-2">{story.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {story.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{story.category}</span>
                    <span>
                      {new Date(story.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full gap-2 hover-elevate active-elevate-2"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </main>
    </div>
  );
}
