import {
  users,
  stories,
  likes,
  comments,
  follows,
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
  type Follow,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, or, inArray } from "drizzle-orm";

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
  
  // Follow operations
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isUserFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowerCount(userId: string): Promise<number>;
  getFollowingCount(userId: string): Promise<number>;
  getPersonalizedStories(userId: string): Promise<StoryWithAuthor[]>;
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

  // Follow operations
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning();
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async isUserFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1);
    return !!follow;
  }

  async getFollowerCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followingId, userId));
    return result[0]?.count || 0;
  }

  async getFollowingCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followerId, userId));
    return result[0]?.count || 0;
  }

  async getPersonalizedStories(userId: string): Promise<StoryWithAuthor[]> {
    // Get IDs of users that the current user follows
    const followingUsers = await db
      .select({ id: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    
    const followingIds = followingUsers.map(f => f.id);
    
    // If not following anyone, return all stories
    if (followingIds.length === 0) {
      return this.getStories();
    }
    
    // Get stories from followed users first, then all other stories
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
    
    // Sort: followed users' stories first
    const sorted = result.sort((a, b) => {
      const aIsFollowed = followingIds.includes(a.userId);
      const bIsFollowed = followingIds.includes(b.userId);
      if (aIsFollowed && !bIsFollowed) return -1;
      if (!aIsFollowed && bIsFollowed) return 1;
      return 0;
    });
    
    return sorted;
  }
}

export const storage = new DatabaseStorage();
