# HackConnect Implementation Guide

## Overview

This document outlines the features implemented for the HackConnect project, a hackathon team matching application powered by AI.

---

## ✅ Implemented Features

### 1. GitHub API Integration

**Location:** `src/lib/github.ts`

- **Fetch GitHub User Data**: Get comprehensive user profiles from GitHub
  - User profile information (bio, location, followers, etc.)
  - Repositories with stars and forks
  - Programming languages statistics
  - Recent activity/events

- **Helper Functions**
  - `fetchGitHubUser()`: Get user profile
  - `fetchGitHubRepos()`: Get user repositories
  - `fetchGitHubLanguages()`: Get language statistics for repos
  - `fetchGitHubActivity()`: Get recent user activity
  - `parseLanguageStats()`: Parse and rank languages
  - `formatActivitySummary()`: Generate activity summary
  - `getTopRepos()`: Get top repositories by stars

**API Route:** `src/app/api/github/[username]/route.ts`
- Endpoint: `GET /api/github/:username`
- Returns enriched user profile with GitHub stats

---

### 2. Firebase Integration

**Location:** `src/lib/firebase.ts` & `src/lib/firebase-services.ts`

**Firebase Configuration**
- Initialized Firebase with Firestore
- Support for emulators in development mode
- Environment variables in `.env.example`

**Database Collections**
- `users`: User profiles and authentication data
- `teams`: Team information and membership
- `chats`: Chat messages and conversations

**Services Available**
- User authentication (sign up, sign in, sign out)
- User profile management (read, update)
- User search by skills
- Team creation and management
- Chat message storage and retrieval

---

### 3. AI Flows Integration

**Portfolio Analysis Flow**
- **Location:** `src/ai/flows/ai-portfolio-analysis-flow.ts`
- **API Route:** `src/app/api/ai/portfolio-analysis`
- **Method:** POST
- **Input:** GitHub profile summary
- **Output:** 
  - Key strengths
  - Recommended roles
  - Skill gaps
  - Project suggestions
- **Component:** `src/components/ai-portfolio-analysis.tsx`
- **Used in:** Profile page with powered by Genkit & Gemini

**Team Recommendations Flow**
- **Location:** `src/ai/flows/ai-team-recommendations-flow.ts`
- **API Route:** `src/app/api/ai/team-recommendations`
- **Method:** POST
- **Input:** Developer profile, skills, interests, available teams
- **Output:**
  - Team recommendations with match scores
  - Reasoning for each recommendation
- **Component:** `src/components/ai-team-recommendations.tsx`
- **Used in:** AI Match page

---

### 4. Functional Search & Filtering

**Location:** `src/components/discover-content.tsx`

**Features**
- Real-time search by name, bio, or location
- Filter by skill (dropdown with all available skills)
- Filter by experience level (Beginner, Intermediate, Advanced, Expert)
- Combine multiple filters
- Clear filters button
- Results counter
- Empty state message when no results

**Implementation**
- Client-side component using React hooks
- Memoized filtering for performance
- Cached available skills and experience levels

---

### 5. User Profile Page

**Location:** `src/app/(app)/profile/page.tsx`

**Features**
- User avatar and basic information
- Bio and location display
- Skills and interests badges
- Social links (GitHub, Email, Website)
- GitHub statistics visualization
- **AI Portfolio Analysis button** - Generates insights on profile

**Components Used**
- User profile card
- Skills & interests section
- GitHub stats (languages, top repos)
- AI Portfolio Insights card

---

### 6. Server Actions

**Location:** `src/app/actions.ts`

**Available Functions**
- `getGitHubUser(username)`: Fetch GitHub user data
- `getAIPortfolioAnalysis(user)`: Generate portfolio analysis
- `getAITeamRecommendations(user)`: Generate team recommendations
- `searchUsers()`: Search users by query
- `filterUsersBySkill()`: Filter users by skill
- `filterUsersByExperience()`: Filter users by experience level

---

## 🔧 Configuration

### Environment Variables Required

Create a `.env.local` file with:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:9002

# Genkit Configuration
GENKIT_MODEL=google-genai/gemini-2.0-flash
```

### GitHub API

- Public API has rate limits (60 requests/hour unauthenticated)
- Optional: Add `GITHUB_TOKEN` for authenticated requests (5000/hour)

---

## 📊 Data Flow

### Profile Discovery Flow
```
User lands on /discover
↓
DiscoverContent loads with all users
↓
User searches/filters users
↓
Client-side filtering applied
↓
UserCard displayed for each match
↓
User clicks on UserCard
↓
Portfolio analysis available via button
```

### AI Insights Flow
```
User visits /profile
↓
Clicks "Generate AI Insights"
↓
AIPortfolioAnalysis component fetches data
↓
Server calls /api/ai/portfolio-analysis
↓
Genkit flow processes data with Gemini
↓
Results displayed with strengths, roles, suggestions
```

### Team Matching Flow
```
User visits /ai-match
↓
Clicks "Generate Recommendations"
↓
AITeamRecommendations component fetches data
↓
Server calls /api/ai/team-recommendations
↓
Genkit flow analyzes skills vs available teams
↓
Top matching teams displayed with scores
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your Firebase credentials
```

### 3. Start Development Server
```bash
npm run dev
# For AI features, also run:
npm run genkit:watch
# in a separate terminal
```

### 4. Available Pages
- `/discover` - Browse and filter developers
- `/profile` - View profile with AI insights
- `/ai-match` - Get AI team recommendations
- `/teams` - Create and manage teams
- `/chat` - Team communication

---

## 📝 API Documentation

### GitHub API Endpoint
```
GET /api/github/:username

Response:
{
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  experience: string;
  skills: string[];
  interests: string[];
  githubUrl: string;
  githubStats: {
    topRepos: Repo[];
    languages: { name: string; value: number }[];
    stars: number;
    forks: number;
    recentActivity: string;
  }
}
```

### Portfolio Analysis Endpoint
```
POST /api/ai/portfolio-analysis

Request:
{
  githubProfileSummary: string;
}

Response:
{
  strengths: string[];
  recommendedRoles: string[];
  skillGaps: string[];
  projectSuggestions: string[];
}
```

### Team Recommendations Endpoint
```
POST /api/ai/team-recommendations

Request:
{
  developerProfile: string;
  skills: string[];
  interests: string[];
  teams: Team[];
}

Response:
{
  recommendations: {
    teamId: string;
    teamName: string;
    matchScore: number;
    reasoning: string;
  }[];
}
```

---

## 🔐 Security

- Environment variables used for sensitive data
- Firebase security rules required in production
- GitHub API token optional for higher rate limits
- User data isolated by Firebase user IDs

---

## 📦 Tech Stack

- **Framework:** Next.js 15 with Turbopack
- **UI:** React 19 with Radix UI components
- **Styling:** Tailwind CSS with glassmorphism
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **AI:** Google Genkit with Gemini 2.0
- **Language:** TypeScript
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts for visualizations

---

## 🔄 What's Still Needed

1. **Real-Time Chat**
   - Firestore listeners for messages
   - WebSocket or polling implementation
   - Typing indicators and read receipts

2. **User Authentication**
   - Sign up / Login UI
   - Protected routes
   - User session management

3. **Advanced Features**
   - Notifications
   - Team invitations workflow
   - Meeting scheduling
   - Portfolio/project showcase

4. **Production Setup**
   - Firebase security rules
   - API rate limiting
   - Error monitoring (Sentry, etc.)
   - Analytics

---

## 🤝 Contributing

When adding new features:
1. Follow the existing component structure
2. Use server actions for backend logic
3. Keep client components small and focused
4. Add TypeScript types for all data
5. Use Tailwind CSS for styling
6. Test with the design system colors

---

Last Updated: February 19, 2026
