import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Story Social</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-foreground leading-tight">
              Share Your Stories,
              <br />
              <span className="text-primary">One Reel at a Time</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover captivating stories from around the world. Share your own tales—fictional, real, or both—in a beautiful, scroll-through experience.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg"
              onClick={handleLogin}
              data-testid="button-login"
              className="text-base px-8 gap-2 hover-elevate active-elevate-2"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
            <div className="p-6 rounded-md bg-card border border-card-border space-y-3">
              <div className="h-12 w-12 rounded-md bg-story-fictional/10 flex items-center justify-center mx-auto">
                <BookOpen className="h-6 w-6 text-story-fictional" />
              </div>
              <h3 className="font-display font-semibold text-lg text-card-foreground">Fictional Tales</h3>
              <p className="text-sm text-muted-foreground">
                Dive into creative worlds and imaginative narratives crafted by storytellers.
              </p>
            </div>

            <div className="p-6 rounded-md bg-card border border-card-border space-y-3">
              <div className="h-12 w-12 rounded-md bg-story-real/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6 text-story-real" />
              </div>
              <h3 className="font-display font-semibold text-lg text-card-foreground">Real Experiences</h3>
              <p className="text-sm text-muted-foreground">
                Connect through authentic, real-life stories and shared experiences.
              </p>
            </div>

            <div className="p-6 rounded-md bg-card border border-card-border space-y-3">
              <div className="h-12 w-12 rounded-md bg-story-both/10 flex items-center justify-center mx-auto">
                <Sparkles className="h-6 w-6 text-story-both" />
              </div>
              <h3 className="font-display font-semibold text-lg text-card-foreground">Mixed Stories</h3>
              <p className="text-sm text-muted-foreground">
                Explore stories that blend reality with imagination in unique ways.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          <p>Share stories. Discover perspectives. Connect through narratives.</p>
        </div>
      </footer>
    </div>
  );
}
