# PromptsGo MVP Parity Analysis
**Date:** October 25, 2025  
**Analysis of:** Current Codebase vs 8-Week MVP Plan

---

## Executive Summary

### Current State: ⚠️ ~35-40% Alignment with MVP

Your current codebase has been built as a **Prompt Library/Marketplace Platform** with individual prompts, but the MVP plan calls for a **GitHub-style Repository Platform** with repos containing prompts. This is a **FUNDAMENTAL ARCHITECTURAL MISMATCH**.

**Critical Finding:**
- ❌ **NO repository/repo concept exists** in current codebase
- ❌ **NO fork tracking** (prompts have parentId but no repo-level forks)
- ✅ Auth system exists (Supabase) but not GitHub OAuth
- ✅ Basic social features exist (hearts, saves, comments)
- ✅ UI components ready (Radix UI + Tailwind)
- ❌ **Wrong tech stack:** Vite + React SPA vs Next.js 14 App Router

---

## Tech Stack Comparison

| Component | MVP Requirement | Current Reality | Status |
|-----------|----------------|-----------------|--------|
| **Framework** | Next.js 14 (App Router) | Vite + React 18 SPA | ❌ MISMATCH |
| **Backend** | Next.js API Routes | None (Supabase direct) | ❌ MISSING |
| **Auth** | Next-auth v5 + GitHub OAuth | Supabase Auth (email/password) | ⚠️ PARTIAL |
| **Database** | Supabase PostgreSQL | Supabase PostgreSQL | ✅ MATCH |
| **Styling** | Tailwind CSS v3 | Tailwind CSS (via Vite) | ✅ MATCH |
| **UI Components** | (Not specified) | Radix UI + shadcn/ui | ✅ BONUS |
| **Deployment** | Vercel | (Not deployed) | ❌ PENDING |
| **Routing** | Next.js App Router | React Router (client-side) | ❌ MISMATCH |

**Verdict:** You need to migrate from Vite/React SPA to Next.js 14 App Router to align with the MVP plan.

---

## Database Schema Comparison

### ✅ MATCHING TABLES (Exist in Current DB)
```sql
✓ profiles (equivalent to MVP's 'users')
✓ prompts (but structure differs)
✓ comments
✓ prompt_images
✓ collections (similar to repos concept)
✓ portfolios
✓ prompt_packs
```
### ❌ MISSING CORE MVP TABLES
```sql
✗ repos - THE CORE CONCEPT OF THE MVP
✗ stars (you have 'hearts' instead)
✗ saves (exists in types but no dedicated table)
✗ forks (no formal fork tracking table)
```
### 🔄 STRUCTURAL DIFFERENCES
#### Current `prompts` Table:
```typescript
prompts {
  id, user_id, title, slug, description, content,
  type, model_compatibility, tags, visibility,
  category, language, version, parent_id,
  view_count, hearts, save_count, fork_count, comment_count
}
```
#### MVP `prompts` Table Should Be:
```sql
prompts {
  id, repo_id, title, content, description,
  model_type, tags, version
}
```
**Key Difference:** MVP prompts belong to repos. Current prompts are standalone.
#### Missing MVP `repos` Table:
```sql
repos {
  id, user_id, name, description, visibility,
  star_count, fork_count, created_at, updated_at
}
```
**THIS IS THE BIGGEST GAP - NO REPO CONCEPT EXISTS**
---
## Feature Parity Analysis
### PHASE 1: Foundation & Auth (Weeks 1-2)
| Feature | MVP Requirement | Current Status | Gap |
|---------|----------------|----------------|-----|
| **Next.js 14 Setup** | Required | ❌ Using Vite/React | COMPLETE REWRITE |
| **Database Schema** | repos, prompts, users, stars, saves, comments, forks | ❌ No repos, no stars table, no forks table | MAJOR REFACTOR |
| **GitHub OAuth** | GitHub sign-in | ❌ Email/password only | ADD FEATURE |
| **Supabase RLS** | Configured | ⚠️ Partial (may need review) | VERIFY |
| **Deployment Pipeline** | Vercel | ❌ Not deployed | PENDING |
| **Protected Routes** | Middleware | ⚠️ Client-side checks only | MIGRATE |
**Phase 1 Completion:** 30%
---
### PHASE 2: Core Features (Weeks 3-4)
#### Sprint 2.1: Repos & Prompts CRUD
| User Story | Current Implementation | MVP Requirement | Gap |
|------------|----------------------|-----------------|-----|
| **US2.1.1: Create Repo** | ❌ No repo concept | Users create repos (name, description, visibility) | **MISSING ENTIRELY** |
| **US2.1.2: View Repos** | ✅ Can view prompts list | View user's repos list | **STRUCTURAL CHANGE** |
| **US2.1.3: Add Prompts to Repo** | ✅ Create prompts | Prompts belong to repos | **ARCHITECTURAL CHANGE** |
| **US2.1.4: Edit Prompts** | ✅ Implemented | Same | ✅ EXISTS |
| **US2.1.5: Delete Prompts** | ✅ Implemented | Same | ✅ EXISTS |

**Current Code Has:**
- `CreatePromptPage.tsx` - creates standalone prompts
- Prompts have `userId`, not `repoId`
- No concept of repo ownership

**MVP Needs:**
```
/api/repos (POST, GET, PUT, DELETE)
/api/prompts (with repo_id relationship)
app/(dashboard)/repos/page.tsx
app/(dashboard)/repos/[id]/page.tsx
app/(dashboard)/repos/new/page.tsx
```
**Sprint 2.1 Completion:** 40%
---
#### Sprint 2.2: Freemium Limits
| Feature | Current Status | MVP Requirement | Gap |
|---------|---------------|-----------------|-----|
| **Role System** | ✅ Exists ('general', 'pro', 'admin') | ✅ Same | ✅ MATCH |
| **Free: 3 Repos Limit** | ❌ No repo concept | Enforce in middleware | **PENDING** |
| **Free: No Private Repos** | ⚠️ Has visibility field | Disable for free users | **EASY FIX** |
| **Pro: Unlimited** | ⚠️ Not enforced | Remove limits for pro | **EASY FIX** |
**Sprint 2.2 Completion:** 20%
---
### PHASE 3: Social & Discovery (Weeks 5-6)
#### Sprint 3.1: Search & Discovery
| Feature | Current Status | MVP Requirement | Gap |
|---------|---------------|-----------------|-----|
| **Search Endpoint** | ✅ Exists (`/api/search`) | Search repos + prompts | ⚠️ NEEDS REPO SEARCH |
| **ExplorePage** | ✅ Exists | Browse public repos | ⚠️ SHOWS PROMPTS NOT REPOS |
| **Filters** | ⚠️ Partial | Filter by model type | ✅ EXISTS |
| **Sorting** | ⚠️ Basic | Sort by stars, recent | ⚠️ NEEDS STAR COUNT |
| **Pagination** | ⚠️ Basic | 20 per page | ✅ EXISTS |
**Current `ExplorePage.tsx`:**
- Displays individual prompts
- No repo cards
**MVP Needs:**
- Display repos with owner, description, star count
- Click repo → view prompts inside
- Search across repo names, descriptions, AND prompt content
**Sprint 3.1 Completion:** 50%
---
#### Sprint 3.2: Social Features
| Feature | Current Status | MVP Requirement | Gap |
|---------|---------------|-----------------|-----|
| **Star Repos** | ❌ Hearts on prompts | Stars on repos | **ARCHITECTURAL CHANGE** |
| **Save Repos** | ⚠️ Saves on prompts | Saves on repos | **ARCHITECTURAL CHANGE** |
| **Comments** | ✅ On prompts | On repos | **NEEDS REPO SUPPORT** |
| **Real-time Comments** | ⚠️ Not implemented | Supabase Realtime | **ADD FEATURE** |
| **Saved Repos Page** | ⚠️ Shows saved prompts | Shows saved repos | **STRUCTURAL CHANGE** |
| **Fork Repos** | ⚠️ Fork prompts (via parentId) | Fork entire repos | **MAJOR FEATURE** |
**Current Implementation:**
```typescript
// Hearts are on prompts
hearts: { userId, promptId, createdAt }
// MVP needs stars on repos
stars: { userId, repoId, createdAt }
```

**Sprint 3.2 Completion:** 30%

---

### PHASE 4: Polish & Launch (Weeks 7-8)

| Task | Current Status | Notes |
|------|---------------|-------|
| Responsive Design | ✅ Good (Tailwind) | Already responsive |
| Loading States | ⚠️ Partial | Some skeletons exist |
| Error Handling | ⚠️ Basic | Has ErrorBoundary |
| Dark Mode | ❌ Not implemented | ThemeToggle exists but unused |
| Performance Optimization | ❌ Not measured | Need to test |
| Testing | ❌ No tests | Manual testing only |
| Production Deployment | ❌ Not deployed | Ready for Vercel |

**Phase 4 Completion:** 30%

---

## Critical Path to MVP Alignment

### Option 1: Adapt Current Codebase (Faster, but Partial Alignment)
**Timeline:** 4-5 weeks  
**Approach:** Add repo concept on top of existing prompts

1. **Week 1: Add Repo Concept**
   - Create `repos` table
   - Add `repo_id` to prompts (nullable at first)
   - Create "Repos" page that groups prompts
   - Migrate existing prompts to default repos (1 repo per user)

2. **Week 2: Social Features for Repos**
   - Add `stars` table
   - Move hearts/saves to repo level
   - Add fork tracking

3. **Week 3: Search & Polish**
   - Update search to work with repos
   - Add repo cards to ExplorePage
   - Fix navigation

4. **Week 4: Testing & Deploy**
   - QA pass
   - Deploy to Vercel (keep Vite/React)

**Pros:**
- Faster (builds on existing code)
- Keep UI components
- Keep Supabase setup

**Cons:**
- Still not true Next.js architecture
- Won't have GitHub OAuth
- Won't have server components
- Harder to maintain

---

### Option 2: Rebuild with Next.js 14 (Slower, Full Alignment)
**Timeline:** 8 weeks (as per MVP)  
**Approach:** Follow MVP plan exactly

1. **Weeks 1-2: New Next.js Project**
   - Scaffold Next.js 14 with App Router
   - Set up GitHub OAuth + next-auth
   - Recreate database schema (repos-first)
   - Deploy pipeline

2. **Weeks 3-4: Port Core Features**
   - Repo CRUD
   - Prompt CRUD (within repos)
   - Freemium limits
   - Port UI components (can reuse from current)

3. **Weeks 5-6: Social & Discovery**
   - Search repos
   - Stars/saves/comments on repos
   - ExplorePage for repos
   - Fork functionality

4. **Weeks 7-8: Polish**
   - Testing
   - Performance
   - Launch

**Pros:**
- Full alignment with MVP
- Modern architecture (SSR, server components)
- GitHub OAuth for user trust
- Easier to scale

**Cons:**
- Throws away current code (except UI components)
- 8 weeks from scratch
- Rework database

---

## Recommendation: Hybrid Approach

**Best Path:** Adapt current, plan migration

### Phase 1: Quick MVP (3 weeks)
1. **Add repos table and logic** (keep existing prompts structure)
2. **Group existing prompts into repos** (auto-create 1 repo per user)
3. **Add star/save on repos** (keep hearts for now)
4. **Update UI to show repos** (ExplorePage, ProfilePage)
5. **Deploy current Vite app** with repo concept

### Phase 2: Gradual Next.js Migration (post-launch)
1. Set up Next.js 14 project
2. Migrate pages one by one
3. Add GitHub OAuth
4. Eventually sunset Vite app

**Why This Works:**
- ✅ Launch fast (3 weeks vs 8)
- ✅ Validate product-market fit
- ✅ Keep current investment
- ✅ Path to proper architecture
- ✅ Can add GitHub OAuth later

---

## Detailed Gap Summary

### 🔴 CRITICAL GAPS (Blockers for MVP)
1. **No repository concept** - Core feature missing
2. **No repo-level stars/forks** - Social features on wrong entity
3. **Not Next.js** - Architecture mismatch (but can defer)
4. **No GitHub OAuth** - Auth flow different (but email works)

### 🟡 MODERATE GAPS (Important but not blockers)
1. No API routes (using Supabase directly)
2. No server-side rendering
3. No proper fork tracking table
4. Search focuses on prompts not repos
5. ExplorePage shows prompts not repos

### 🟢 STRENGTHS (Already Have)
1. ✅ Excellent UI components (Radix + shadcn)
2. ✅ Supabase setup and working
3. ✅ Auth system (just not GitHub)
4. ✅ Role/permissions system
5. ✅ Comments, images, profiles working
6. ✅ Responsive design
7. ✅ Error handling
8. ✅ TypeScript throughout

---

## File-by-File Migration Needs

### Can Reuse (with minor changes):
```
src/components/ui/* - All UI components ✅
src/components/Navigation.tsx - Adjust links ⚠️
src/components/Footer.tsx - Minor tweaks ✅
src/components/AuthModal.tsx - Swap for next-auth ⚠️
src/components/HomePage.tsx - Update copy ⚠️
src/lib/supabase.ts - Keep as-is ✅
src/lib/types.ts - Add repo types ⚠️
```

### Need Major Rework:
```
src/App.tsx - Not needed (Next.js routing) ❌
src/components/CreatePromptPage.tsx - Add repo selection ⚠️
src/components/ExplorePage.tsx - Show repos not prompts ❌
src/components/UserProfilePage.tsx - Show repos tab ⚠️
src/contexts/AppContext.tsx - Not needed (server state) ⚠️
```

### Need to Create:
```
app/(dashboard)/repos/page.tsx ❌
app/(dashboard)/repos/[id]/page.tsx ❌
app/(dashboard)/repos/new/page.tsx ❌
app/api/repos/* ❌
app/api/social/star ❌
app/api/social/save ❌
middleware.ts ❌
lib/auth.ts ❌
```

---

## Environment Variables Needed

### Current (Vite):
```env
VITE_SUPABASE_URL=xxx
VITE_SUPABASE_ANON_KEY=xxx
```

### MVP Needs (Next.js):
```env
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xxx
GITHUB_ID=xxx
GITHUB_SECRET=xxx
```

---

## Testing Gaps

| Test Type | Current | MVP Needs |
|-----------|---------|-----------|
| Unit Tests | ❌ None | Jest + React Testing Library |
| Integration Tests | ❌ None | Playwright/Cypress |
| Manual Testing | ⚠️ Ad-hoc | Checklist-based |
| Performance | ❌ Not measured | Lighthouse/Vercel Analytics |

---

## Deployment Readiness

| Requirement | Status | Notes |
|-------------|--------|-------|
| Production DB | ❌ Using dev Supabase? | Need prod instance |
| Environment Vars | ⚠️ Local only | Need Vercel secrets |
| Build Pipeline | ✅ `npm run build` works | Ready |
| Domain | ❌ Unknown | Need to set up |
| Monitoring | ❌ None | Add Sentry/LogRocket |
| Analytics | ❌ None | Add Vercel Analytics |

---

## Conclusion: Action Plan

### Immediate Actions (This Week)
1. ✅ **Decide:** Adapt or rebuild?
2. 🔨 **If Adapt:** Create `repos` table in Supabase
3. 🔨 **If Rebuild:** Scaffold Next.js 14 project
4. 📋 **Set up:** GitHub OAuth app credentials
5. 📋 **Create:** Migration plan for existing data

### Next 3 Weeks (Quick MVP)
1. Implement repo concept (whether adapted or new)
2. Update UI to show repos
3. Add stars/saves/forks at repo level
4. Update search to work with repos
5. Test everything
6. Deploy to Vercel staging

### Post-Launch (Weeks 4-8)
1. Gather user feedback
2. Fix critical bugs
3. Plan Next.js migration (if adapted)
4. Add advanced features
5. Performance optimization

---

## Questions to Answer Before Proceeding

1. **Do you have existing users/data?** If yes, adapt. If no, rebuild.
2. **What's your launch deadline?** Adapt if urgent, rebuild if flexible.
3. **Do you value Next.js SEO/SSR benefits?** If yes, rebuild.
4. **Is GitHub OAuth critical?** If yes, rebuild. If no, adapt.
5. **What's your team size?** Solo dev = adapt, team = rebuild.

---

## Final Verdict

**Current Alignment: 35-40%**

**Biggest Issue:** No repository/repo concept - this is the heart of the MVP.

**Recommended Path:**  
1. **Quick Adapt** (3 weeks) → Launch → Gather feedback  
2. **Plan Migration** to Next.js based on traction  
3. **Keep UI/Components** (they're great!)

**If you have 8 weeks and no existing users:** Rebuild from scratch following MVP plan exactly.

**If you need to launch fast:** Add repos to current codebase, deploy, iterate.

---

**Next Step:** Tell me which approach you want to take, and I'll help you build the detailed implementation plan.