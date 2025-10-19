import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth with bio extension
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stories table
export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  caption: varchar("caption", { length: 500 }),
  content: text("content").notNull(),
  category: varchar("category", { length: 20 }).notNull(), // 'fictional', 'real', or 'both'
  musicUrl: varchar("music_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Likes table
export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  storyId: varchar("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserStory: index("unique_user_story_like").on(table.userId, table.storyId),
}));

// Comments table
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  storyId: varchar("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Follows table - user following system
export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueFollow: index("unique_follower_following").on(table.followerId, table.followingId),
}));

// Bookmarks table
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  storyId: varchar("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserStoryBookmark: index("unique_user_story_bookmark").on(table.userId, table.storyId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  stories: many(stories),
  likes: many(likes),
  comments: many(comments),
  followers: many(follows, { relationName: "followers" }),
  following: many(follows, { relationName: "following" }),
  bookmarks: many(bookmarks),
}));

export const storiesRelations = relations(stories, ({ one, many }) => ({
  user: one(users, {
    fields: [stories.userId],
    references: [users.id],
  }),
  likes: many(likes),
  comments: many(comments),
  bookmarks: many(bookmarks),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  story: one(stories, {
    fields: [likes.storyId],
    references: [stories.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  story: one(stories, {
    fields: [comments.storyId],
    references: [stories.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "followers",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  story: one(stories, {
    fields: [bookmarks.storyId],
    references: [stories.id],
  }),
}));

// Schemas for Replit Auth
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Story schemas
export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  caption: z.string().max(500, "Caption must be under 500 characters").optional(),
  content: z.string().min(1, "Story content is required").max(10000, "Story is too long"),
  category: z.enum(["fictional", "real", "both"], {
    errorMap: () => ({ message: "Category must be fictional, real, or both" })
  }),
  musicUrl: z.string().url("Must be a valid URL").max(500, "URL is too long").optional().or(z.literal("")),
});

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

// Story with author information
export type StoryWithAuthor = Story & {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    bio: string | null;
  };
};

// User profile update schema
export const updateProfileSchema = z.object({
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

// Like schemas
export type Like = typeof likes.$inferSelect;

// Comment schemas
export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  userId: true,
  storyId: true,
  createdAt: true,
}).extend({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Comment with author information
export type CommentWithAuthor = Comment & {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
};

// Follow schemas
export type Follow = typeof follows.$inferSelect;

// Bookmark schemas
export type Bookmark = typeof bookmarks.$inferSelect;
