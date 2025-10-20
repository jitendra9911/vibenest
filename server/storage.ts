import {
  users,
  stories,
  likes,
  comments,
  follows,
  bookmarks,
  mobileAuthTokens,
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
  type Bookmark,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, or, inArray, ilike } from "drizzle-orm";

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
  searchStories(query: string, category?: string): Promise<StoryWithAuthor[]>;
  getStory(storyId: string): Promise<Story | undefined>;
  updateStory(storyId: string, userId: string, data: InsertStory): Promise<Story>;
  deleteStory(storyId: string, userId: string): Promise<void>;
  
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
  
  // Bookmark operations
  bookmarkStory(userId: string, storyId: string): Promise<Bookmark>;
  unbookmarkStory(userId: string, storyId: string): Promise<void>;
  isStoryBookmarked(userId: string, storyId: string): Promise<boolean>;
  getBookmarkedStories(userId: string): Promise<StoryWithAuthor[]>;
  
  // Mobile auth token operations
  createMobileAuthToken(data: { token: string; userId: string; claims: any; accessToken: string; refreshToken?: string; expiresAt: Date }): Promise<void>;
  getMobileAuthToken(token: string): Promise<{ userId: string; claims: any; accessToken: string; refreshToken?: string | null } | undefined>;
  deleteMobileAuthToken(token: string): Promise<void>;
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

  async searchStories(query: string, category?: string): Promise<StoryWithAuthor[]> {
    const conditions = [];
    
    // Add text search conditions
    if (query) {
      conditions.push(
        or(
          ilike(stories.title, `%${query}%`),
          ilike(stories.content, `%${query}%`)
        )
      );
    }
    
    // Add category filter
    if (category && category !== 'all') {
      conditions.push(eq(stories.category, category));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
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
      .where(whereClause)
      .orderBy(desc(stories.createdAt));
    
    return result;
  }

  async getStory(storyId: string): Promise<Story | undefined> {
    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId));
    return story;
  }

  async updateStory(storyId: string, userId: string, data: InsertStory): Promise<Story> {
    const [story] = await db
      .update(stories)
      .set({
        title: data.title,
        content: data.content,
        category: data.category,
        updatedAt: new Date(),
      })
      .where(and(eq(stories.id, storyId), eq(stories.userId, userId)))
      .returning();
    
    if (!story) {
      throw new Error("Story not found or unauthorized");
    }
    
    return story;
  }

  async deleteStory(storyId: string, userId: string): Promise<void> {
    const result = await db
      .delete(stories)
      .where(and(eq(stories.id, storyId), eq(stories.userId, userId)))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Story not found or unauthorized");
    }
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

  // Bookmark operations
  async bookmarkStory(userId: string, storyId: string): Promise<Bookmark> {
    const [bookmark] = await db
      .insert(bookmarks)
      .values({ userId, storyId })
      .returning();
    return bookmark;
  }

  async unbookmarkStory(userId: string, storyId: string): Promise<void> {
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.storyId, storyId)));
  }

  async isStoryBookmarked(userId: string, storyId: string): Promise<boolean> {
    const [bookmark] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.storyId, storyId)))
      .limit(1);
    return !!bookmark;
  }

  async getBookmarkedStories(userId: string): Promise<StoryWithAuthor[]> {
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
      .from(bookmarks)
      .innerJoin(stories, eq(bookmarks.storyId, stories.id))
      .innerJoin(users, eq(stories.userId, users.id))
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
    
    return result;
  }

  // Mobile auth token operations
  async createMobileAuthToken(data: { token: string; userId: string; claims: any; accessToken: string; refreshToken?: string; expiresAt: Date }): Promise<void> {
    await db.insert(mobileAuthTokens).values(data);
  }

  async getMobileAuthToken(token: string): Promise<{ userId: string; claims: any; accessToken: string; refreshToken?: string | null } | undefined> {
    const [result] = await db
      .select()
      .from(mobileAuthTokens)
      .where(eq(mobileAuthTokens.token, token))
      .limit(1);
    
    if (!result || result.expiresAt < new Date()) {
      return undefined;
    }
    
    return {
      userId: result.userId,
      claims: result.claims,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  async deleteMobileAuthToken(token: string): Promise<void> {
    await db.delete(mobileAuthTokens).where(eq(mobileAuthTokens.token, token));
  }
}

export const storage = new DatabaseStorage();
