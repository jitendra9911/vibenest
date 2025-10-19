import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertStorySchema, updateProfileSchema, insertCommentSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = updateProfileSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromError(result.error);
        return res.status(400).json({ message: validationError.toString() });
      }

      const updatedUser = await storage.updateUserBio(userId, result.data.bio);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Story routes
  app.post('/api/stories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertStorySchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromError(result.error);
        return res.status(400).json({ message: validationError.toString() });
      }

      const story = await storage.createStory(userId, result.data);
      res.status(201).json(story);
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Failed to create story" });
    }
  });

  app.get('/api/stories', isAuthenticated, async (req: any, res) => {
    try {
      const stories = await storage.getStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get('/api/stories/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stories = await storage.getUserStories(userId);
      res.json(stories);
    } catch (error) {
      console.error("Error fetching user stories:", error);
      res.status(500).json({ message: "Failed to fetch user stories" });
    }
  });

  app.get('/api/stories/search', isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string || '';
      const category = req.query.category as string || undefined;
      
      const stories = await storage.searchStories(query, category);
      res.json(stories);
    } catch (error) {
      console.error("Error searching stories:", error);
      res.status(500).json({ message: "Failed to search stories" });
    }
  });

  app.get('/api/stories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const storyId = req.params.id;
      const story = await storage.getStory(storyId);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      res.json(story);
    } catch (error) {
      console.error("Error fetching story:", error);
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  app.patch('/api/stories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storyId = req.params.id;
      const result = insertStorySchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromError(result.error);
        return res.status(400).json({ message: validationError.toString() });
      }

      const story = await storage.updateStory(storyId, userId, result.data);
      res.json(story);
    } catch (error: any) {
      console.error("Error updating story:", error);
      if (error.message === "Story not found or unauthorized") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update story" });
    }
  });

  app.delete('/api/stories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storyId = req.params.id;
      
      await storage.deleteStory(storyId, userId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting story:", error);
      if (error.message === "Story not found or unauthorized") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to delete story" });
    }
  });

  // Like routes
  app.post('/api/stories/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storyId = req.params.id;
      
      // Check if already liked
      const isLiked = await storage.isStoryLikedByUser(storyId, userId);
      if (isLiked) {
        return res.status(400).json({ message: "Story already liked" });
      }
      
      const like = await storage.likeStory(userId, storyId);
      res.status(201).json(like);
    } catch (error) {
      console.error("Error liking story:", error);
      res.status(500).json({ message: "Failed to like story" });
    }
  });

  app.delete('/api/stories/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storyId = req.params.id;
      
      await storage.unlikeStory(userId, storyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error unliking story:", error);
      res.status(500).json({ message: "Failed to unlike story" });
    }
  });

  app.get('/api/stories/:id/likes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storyId = req.params.id;
      
      const [count, isLiked] = await Promise.all([
        storage.getStoryLikeCount(storyId),
        storage.isStoryLikedByUser(storyId, userId),
      ]);
      
      res.json({ count, isLiked });
    } catch (error) {
      console.error("Error fetching likes:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  // Comment routes
  app.get('/api/stories/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const storyId = req.params.id;
      const comments = await storage.getStoryComments(storyId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/stories/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storyId = req.params.id;
      const result = insertCommentSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromError(result.error);
        return res.status(400).json({ message: validationError.toString() });
      }
      
      const comment = await storage.addComment(userId, storyId, result.data.content);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Follow routes
  app.post('/api/users/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.id;
      
      // Check if already following
      const isFollowing = await storage.isUserFollowing(followerId, followingId);
      if (isFollowing) {
        return res.status(400).json({ message: "Already following this user" });
      }
      
      // Prevent self-follow
      if (followerId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const follow = await storage.followUser(followerId, followingId);
      res.status(201).json(follow);
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete('/api/users/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.id;
      
      await storage.unfollowUser(followerId, followingId);
      res.status(204).send();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get('/api/users/:id/follow-status', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.id;
      
      const [isFollowing, followerCount, followingCount] = await Promise.all([
        storage.isUserFollowing(followerId, followingId),
        storage.getFollowerCount(followingId),
        storage.getFollowingCount(followingId),
      ]);
      
      res.json({ isFollowing, followerCount, followingCount });
    } catch (error) {
      console.error("Error fetching follow status:", error);
      res.status(500).json({ message: "Failed to fetch follow status" });
    }
  });

  app.get('/api/stories/personalized', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stories = await storage.getPersonalizedStories(userId);
      res.json(stories);
    } catch (error) {
      console.error("Error fetching personalized stories:", error);
      res.status(500).json({ message: "Failed to fetch personalized stories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
