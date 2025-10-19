import {
  users,
  stories,
  type User,
  type UpsertUser,
  type Story,
  type InsertStory,
  type StoryWithAuthor,
  type UpdateProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
