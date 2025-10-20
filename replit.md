# VibeNest (formerly Story Social)

## Overview

VibeNest is a mobile-first story-sharing platform inspired by Instagram Reels, TikTok, and Snapchat. The application enables users to create and consume stories in an immersive, full-screen reel-style feed. Stories can be categorized as fictional, real-life experiences, or a blend of both, with gesture-based navigation optimized for quick consumption.

The platform emphasizes a clean, minimal UI with smooth transitions and a modern design system built around a vibrant purple brand color. The application supports both light and dark modes, with dark mode as the primary theme.

**Cross-Platform:** VibeNest is available as a web application and can be built as a native Android app using Capacitor.

**Mobile Authentication:** The Android app uses a token-based authentication system that opens OAuth in the system browser and seamlessly exchanges temporary tokens for persistent sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing
- TanStack React Query for server state management, data fetching, and caching

**UI Component System:**
- Shadcn UI (New York variant) with Radix UI primitives for accessible, composable components
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming support (light/dark modes)
- Custom color palette with story category indicators (fictional: coral, real: green, both: amber)
- Typography system using Inter for UI elements and Plus Jakarta Sans for display text

**State Management:**
- React Query handles all server state (stories, user data, authentication)
- React Context for theme management (ThemeProvider)
- Local component state with React hooks
- Form state managed by React Hook Form with Zod validation

**Design System:**
- Mobile-first responsive design with maximum viewport constraint
- Full-screen story cards with snap scrolling behavior
- Gesture-based navigation (keyboard arrows, touch swipes)
- Consistent spacing, border radius, and elevation system
- Interactive states (hover, active) with elevation feedback

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routing
- Session-based authentication with encrypted cookies
- Custom middleware for request logging and error handling
- Development-only Vite integration for HMR

**Authentication & Session Management:**
- Replit OpenID Connect (OIDC) integration via Passport.js strategy
- Session storage in PostgreSQL using connect-pg-simple
- HTTP-only, secure cookies with 7-day TTL
- User profile data synced from OIDC claims (email, name, profile image)

**API Design:**
- RESTful endpoints under `/api` prefix
- Authentication middleware (`isAuthenticated`) protects user routes
- Zod schema validation for request payloads
- Standardized JSON responses with error handling
- Routes organized by domain: auth, profile, stories

**Data Access Layer:**
- Storage abstraction (`IStorage` interface) for decoupled data operations
- DatabaseStorage implementation using Drizzle ORM
- Type-safe database queries with Drizzle's query builder
- Automatic timestamp management (createdAt, updatedAt)

### Data Storage

**Database:**
- PostgreSQL via Neon serverless driver with WebSocket support
- Drizzle ORM for type-safe schema definition and migrations
- Migration files generated in `/migrations` directory

**Schema Design:**
- `users` table: OIDC user data (id, email, names, profile image, bio)
- `stories` table: user-generated content (id, userId, title, content, category, timestamp)
- `likes` table: story likes tracking (userId, storyId with composite unique constraint)
- `comments` table: story comments with author information
- `follows` table: user following relationships (followerId, followingId)
- `bookmarks` table: saved stories for later reading (userId, storyId with cascade delete)
- `sessions` table: encrypted session data with expiration indexing
- Foreign key cascade on user deletion to maintain referential integrity
- UUID primary keys generated via PostgreSQL's `gen_random_uuid()`

**Relations:**
- One-to-many: Users to Stories, Users to Comments, Users to Bookmarks
- Many-to-many: Users to Likes (through likes table), Users to Follows (through follows table)
- Stories include author data via Drizzle relations for efficient joins

### External Dependencies

**Authentication & Identity:**
- Replit OIDC for user authentication (issuer: replit.com/oidc)
- OpenID Client library for OIDC protocol implementation
- Passport.js for authentication strategy integration

**Database & ORM:**
- Neon PostgreSQL serverless database
- Drizzle ORM for schema management and queries
- Drizzle Kit for migration generation and database push operations

**UI Component Libraries:**
- Radix UI primitives (20+ component packages for dialogs, dropdowns, menus, etc.)
- Shadcn UI component patterns with New York styling preset
- Lucide React for iconography
- CMDK for command palette functionality
- Vaul for drawer components

**Form & Validation:**
- React Hook Form for performant form state management
- Zod for runtime type validation and schema definition
- @hookform/resolvers for Zod integration with React Hook Form
- Drizzle Zod for automatic schema generation from database models

**Utilities:**
- date-fns for date formatting and manipulation
- clsx and tailwind-merge for conditional class name composition
- class-variance-authority for type-safe component variants
- nanoid for unique ID generation

**Development Tools:**
- TSX for TypeScript execution in development
- ESBuild for production server bundling
- Replit-specific plugins (runtime error overlay, cartographer, dev banner)
- PostCSS with Autoprefixer for CSS processing

**Session & Storage:**
- connect-pg-simple for PostgreSQL session storage
- express-session for session middleware
- memoizee for function result caching (OIDC config)

## Recent Changes

### v1.0.7 (October 20, 2025) - Mobile Authentication Fix
**Critical Fix:** Resolved mobile authentication issue where OAuth login was not working in the Android app.

**Root Cause:** AndroidManifest.xml intent filter was incomplete - only specified `android:scheme="vibenest"` without host and path, causing Chrome to not recognize `vibenest://auth/callback` URLs as valid deep links.

**Changes:**
1. **AndroidManifest.xml** - Updated intent filter to include full deep link specification:
   ```xml
   <data 
       android:scheme="vibenest" 
       android:host="auth" 
       android:pathPrefix="/callback" />
   ```

2. **DeepLinkHandler.tsx** - Added comprehensive logging and user feedback:
   - Console logs for all deep link events and token exchange steps
   - Toast notifications for login success/failure
   - Error handling with descriptive messages
   - Visibility into token extraction and session creation

**Impact:** Mobile users can now successfully log in via system browser OAuth flow. The app properly catches the deep link callback, exchanges the token for a session, and updates the UI to show the authenticated state.

**Testing:** Backend testing confirmed token generation, exchange, and session creation working correctly. The issue was isolated to the Android deep link configuration.