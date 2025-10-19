# Story Social - Comprehensive Design Guidelines

## Design Approach

**Reference-Based Approach:** Drawing inspiration from Instagram Reels, TikTok, and Snapchat to create a modern, engaging story-sharing platform.

**Key Design Principles:**
- Immersive, full-screen story experience with minimal UI distractions
- Quick, gesture-based navigation optimized for mobile-first consumption
- Clear visual hierarchy emphasizing content over chrome
- Smooth, native-feeling transitions between stories

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 0 0% 9% (deep charcoal)
- Surface: 0 0% 13% (elevated cards)
- Primary Brand: 275 100% 65% (vibrant purple - distinctive from competitors)
- Text Primary: 0 0% 98%
- Text Secondary: 0 0% 65%
- Border: 0 0% 20%

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary Brand: 275 80% 60%
- Text Primary: 0 0% 13%
- Text Secondary: 0 0% 40%
- Border: 0 0% 90%

**Story Category Indicators:**
- Fictional: 340 75% 55% (warm coral)
- Real: 142 71% 45% (trusted green)
- Both: 45 93% 47% (golden amber)

### B. Typography

**Font Stack:**
- Primary: 'Inter' (Google Fonts) - UI elements, body text
- Display: 'Plus Jakarta Sans' (Google Fonts) - story titles, headings

**Scale:**
- Story Title: 2xl (24px) bold
- Username: base (16px) semibold
- Bio: sm (14px) regular
- Category Badge: xs (12px) medium
- Body Text: base (16px) regular

### C. Layout System

**Spacing Primitives:** Use Tailwind units 2, 4, 6, and 8 consistently (p-4, h-8, m-6, gap-2)

**Story Feed Layout:**
- Full viewport height (h-screen) story cards with snap scrolling
- 16:9 aspect ratio for story content area
- Bottom overlay gradient (120px height) for metadata

**Profile/Auth Layout:**
- Max-width containers: max-w-md for forms, max-w-2xl for profiles
- Centered layouts with py-8 padding

### D. Component Library

**Navigation:**
- Bottom tab bar (mobile): 4 icons - Feed, Create, Profile, Settings
- Fixed position with backdrop blur and subtle border-top
- Active state: primary brand color with 3px top indicator

**Story Card:**
- Full-screen vertical card with rounded-none
- Author info overlay (top): Avatar (40px), username, timestamp
- Bottom gradient overlay containing: Story title, category badge (pill shape with icon), engagement metrics
- Swipe indicators: Subtle progress bars at top (3px height, 2px gap)

**Category Badges:**
- Pill-shaped with icon prefix (book for Fictional, checkmark for Real, sparkles for Both)
- Semi-transparent background with category color
- px-3 py-1.5 sizing

**Profile Card:**
- Centered avatar (120px) with subtle ring in primary color
- Username (xl semibold) and bio (sm regular) below
- Stats row: Stories posted, Followers (if implementing social features)
- Edit profile button (outline variant with blur backdrop)

**Auth Forms:**
- Card-based design with surface background
- Input fields with border-2 and focus:ring-2 states
- Primary button: Solid fill with brand color
- Secondary actions: Ghost buttons or text links

**Create Story Interface:**
- Textarea for story content (min-h-64)
- Title input (prominent, text-xl)
- Category selector: Three large, tappable cards with icons and labels
- Preview button to see reel-style presentation before posting

**Empty States:**
- Centered icon (96px) in muted color
- Headline (lg semibold) and supporting text (sm)
- Primary CTA button below

### E. Micro-Interactions

Use sparingly - focus on tactile feedback:
- Story card transitions: Smooth vertical snap scrolling with momentum
- Category badge: Subtle scale on selection (scale-105)
- Button press: Scale-95 active state
- Card enters: Gentle fade-in (no elaborate animations)

## Images

**Profile Avatars:** Circular, consistent sizing (40px in feed, 120px on profile), placeholder gradient backgrounds for users without photos

**Story Content:** While stories are primarily text-based, reserve top 50% of card for potential user-added imagery or decorative patterns related to story category

**No large hero image needed** - app opens directly to story feed for immediate engagement

## Responsive Strategy

**Mobile-First (< 768px):**
- Single column, full-width story cards
- Bottom navigation bar
- Touch-optimized tap targets (min 44px)

**Desktop (≥ 768px):**
- Centered story card (max-w-md) with dark margins
- Side panel for suggested users or trending stories
- Keyboard navigation (arrow keys for story scrolling)