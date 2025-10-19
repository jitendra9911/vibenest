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

  const httpServer = createServer(app);
  return httpServer;
}
