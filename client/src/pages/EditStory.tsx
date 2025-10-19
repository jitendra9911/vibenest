import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { insertStorySchema, type InsertStory, type Story } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, CheckCircle2, Sparkles, ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { isUnauthorizedError } from "@/lib/authUtils";

const categoryOptions = [
  {
    value: "fictional" as const,
    label: "Fictional",
    description: "A creative, imaginary story",
    icon: BookOpen,
    colorClass: "border-story-fictional/50 hover:border-story-fictional hover:bg-story-fictional/5",
    activeClass: "border-story-fictional bg-story-fictional/10",
  },
  {
    value: "real" as const,
    label: "Real Story",
    description: "A true, lived experience",
    icon: CheckCircle2,
    colorClass: "border-story-real/50 hover:border-story-real hover:bg-story-real/5",
    activeClass: "border-story-real bg-story-real/10",
  },
  {
    value: "both" as const,
    label: "Mixed",
    description: "A blend of fact and fiction",
    icon: Sparkles,
    colorClass: "border-story-both/50 hover:border-story-both hover:bg-story-both/5",
    activeClass: "border-story-both bg-story-both/10",
  },
];

export default function EditStory() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const params = useParams();
  const storyId = params.id;
  const [selectedCategory, setSelectedCategory] = useState<"fictional" | "real" | "both">("fictional");

  const { data: story, isLoading } = useQuery<Story>({
    queryKey: ["/api/stories", storyId],
    queryFn: async () => {
      const response = await fetch(`/api/stories/${storyId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Story not found");
        }
        throw new Error("Failed to fetch story");
      }
      return response.json();
    },
    enabled: !!storyId,
  });

  const form = useForm<InsertStory>({
    resolver: zodResolver(insertStorySchema),
    defaultValues: {
      title: "",
      content: "",
      category: "fictional",
    },
  });

  useEffect(() => {
    if (story) {
      form.reset({
        title: story.title,
        content: story.content,
        category: story.category as "fictional" | "real" | "both",
      });
      setSelectedCategory(story.category as "fictional" | "real" | "both");
    }
  }, [story, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: InsertStory) => {
      return await apiRequest("PATCH", `/api/stories/${storyId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories", storyId] });
      toast({
        title: "Story updated!",
        description: "Your changes have been saved.",
      });
      navigate("/profile");
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
        description: error.message || "Failed to update story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertStory) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="font-display font-bold text-2xl text-foreground">Story not found</h2>
          <Link href="/profile">
            <Button>Go to Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button 
                variant="ghost" 
                size="icon"
                data-testid="button-back"
                className="hover-elevate active-elevate-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-display font-bold text-xl text-foreground">Edit Story</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Story Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Give your story a compelling title..."
                      className="text-lg"
                      data-testid="input-story-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Selection */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Story Category</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {categoryOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedCategory === option.value;
                      return (
                        <Card
                          key={option.value}
                          className={`p-4 cursor-pointer transition-all border-2 ${
                            isSelected ? option.activeClass : option.colorClass
                          }`}
                          onClick={() => {
                            setSelectedCategory(option.value);
                            field.onChange(option.value);
                          }}
                          data-testid={`category-${option.value}`}
                        >
                          <div className="text-center space-y-2">
                            <div className="flex justify-center">
                              <div className={`h-12 w-12 rounded-md flex items-center justify-center ${
                                option.value === "fictional" ? "bg-story-fictional/10" :
                                option.value === "real" ? "bg-story-real/10" : "bg-story-both/10"
                              }`}>
                                <Icon className={`h-6 w-6 ${
                                  option.value === "fictional" ? "text-story-fictional" :
                                  option.value === "real" ? "text-story-real" : "text-story-both"
                                }`} />
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{option.label}</p>
                              <p className="text-xs text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content Field */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Your Story</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write your story here... Share your thoughts, experiences, or imagination."
                      className="min-h-64 resize-none text-base leading-relaxed"
                      data-testid="textarea-story-content"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {field.value.length} / 10,000 characters
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link href="/profile" className="flex-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full hover-elevate active-elevate-2"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1 gap-2 hover-elevate active-elevate-2"
                disabled={updateMutation.isPending}
                data-testid="button-save"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
