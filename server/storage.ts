import {
  users,
  stories,
  likes,
  comments,
  type User,
  type UpsertUser,
  type Story,
  type InsertStory,
  type StoryWithAuthor,
  type UpdateProfile,
  type Like,
  type Comment,
  type InsertComment,
  type CommentWithAuthor,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBio(userId: string, bio: string | undefined): Promise<User>;
  
  // Story operations
  createStory(userId: string, story: InsertStory): Promise<Story>;
  getStories(): Promise<StoryWithAuthor[]>;
  getUserStories(userId: string): Promise<Story[]>;
  
  // Like operations
  likeStory(userId: string, storyId: string): Promise<Like>;
  unlikeStory(userId: string, storyId: string): Promise<void>;
  getStoryLikeCount(storyId: string): Promise<number>;
  isStoryLikedByUser(storyId: string, userId: string): Promise<boolean>;
  
  // Comment operations
  addComment(userId: string, storyId: string, content: string): Promise<CommentWithAuthor>;
  getStoryComments(storyId: string): Promise<CommentWithAuthor[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserBio(userId: string, bio: string | undefined): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ bio, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Story operations
  async createStory(userId: string, storyData: InsertStory): Promise<Story> {
    const [story] = await db
      .insert(stories)
      .values({
        ...storyData,
        userId,
      })
      .returning();
    return story;
  }

  async getStories(): Promise<StoryWithAuthor[]> {
    const result = await db
      .select({
        id: stories.id,
        userId: stories.userId,
        title: stories.title,
        content: stories.content,
        category: stories.category,
        createdAt: stories.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          bio: users.bio,
        },
      })
      .from(stories)
      .innerJoin(users, eq(stories.userId, users.id))
      .orderBy(desc(stories.createdAt));

    return result;
  }

  async getUserStories(userId: string): Promise<Story[]> {
    return await db
      .select()
      .from(stories)
      .where(eq(stories.userId, userId))
      .orderBy(desc(stories.createdAt));
  }

  // Like operations
  async likeStory(userId: string, storyId: string): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values({ userId, storyId })
      .returning();
    return like;
  }

  async unlikeStory(userId: string, storyId: string): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.storyId, storyId)));
  }

  async getStoryLikeCount(storyId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(likes)
      .where(eq(likes.storyId, storyId));
    return result[0]?.count || 0;
  }

  async isStoryLikedByUser(storyId: string, userId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.storyId, storyId), eq(likes.userId, userId)))
      .limit(1);
    return !!like;
  }

  // Comment operations
  async addComment(userId: string, storyId: string, content: string): Promise<CommentWithAuthor> {
    const [comment] = await db
      .insert(comments)
      .values({ userId, storyId, content })
      .returning();
    
    // Get the author information
    const [user] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .where(eq(users.id, userId));
    
    return { ...comment, user };
  }

  async getStoryComments(storyId: string): Promise<CommentWithAuthor[]> {
    const result = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        storyId: comments.storyId,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.storyId, storyId))
      .orderBy(desc(comments.createdAt));
    
    return result;
  }
}

export const storage = new DatabaseStorage();
