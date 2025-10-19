import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import CreateStory from "@/pages/CreateStory";
import EditStory from "@/pages/EditStory";
import SavedStories from "@/pages/SavedStories";
import Profile from "@/pages/Profile";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/create" component={CreateStory} />
          <Route path="/edit/:id" component={EditStory} />
          <Route path="/saved" component={SavedStories} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MusicPlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </MusicPlayerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
