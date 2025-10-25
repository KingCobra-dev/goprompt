# Minimal Frontend Migration Strategy
**Goal:** Add repo-based architecture with MINIMAL frontend changes

---

## Core Strategy: "Repos as Collections Layer"

Instead of rebuilding everything, we'll add repos as a **lightweight grouping layer** on top of existing prompts.

### Key Insight:
Your current `prompts` work perfectly fine. We just need to:
1. Add a `repos` table
2. Link prompts to repos
3. Update UI to show repos (but keep most prompt code)
4. Keep 90% of your existing frontend components

---

## Phase 1: Backend Changes (Database) - Week 1

### Step 1.1: Add Repos Table (No Breaking Changes)

```sql
-- Create repos table
CREATE TABLE repos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  star_count INT DEFAULT 0,
  fork_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Add repo_id to prompts (nullable at first!)
ALTER TABLE prompts ADD COLUMN repo_id UUID REFERENCES repos(id) ON DELETE CASCADE;

-- Create stars table (repo-level)
CREATE TABLE stars (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  repo_id UUID NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, repo_id)
);

-- Create saves table (repo-level)  
CREATE TABLE repo_saves (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  repo_id UUID NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, repo_id)
);

-- Create forks tracking
CREATE TABLE repo_forks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_repo_id UUID NOT NULL REFERENCES repos(id),
  forked_repo_id UUID NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_repos_user_id ON repos(user_id);
CREATE INDEX idx_repos_visibility ON repos(visibility);
CREATE INDEX idx_prompts_repo_id ON prompts(repo_id);
CREATE INDEX idx_stars_user_id ON stars(user_id);
CREATE INDEX idx_stars_repo_id ON stars(repo_id);

-- RLS Policies
ALTER TABLE repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE repo_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE repo_forks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public repos"
  ON repos FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());

CREATE POLICY "Users can create their own repos"
  ON repos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repos"
  ON repos FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repos"
  ON repos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view stars"
  ON stars FOR SELECT USING (true);

CREATE POLICY "Users can star repos"
  ON stars FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unstar repos"
  ON stars FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for repo_saves and repo_forks...
```

### Step 1.2: Data Migration Script

```sql
-- Auto-create one repo per user for their existing prompts
DO $$
DECLARE
  user_record RECORD;
  new_repo_id UUID;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT user_id, profiles.username, profiles.name 
    FROM prompts 
    JOIN profiles ON prompts.user_id = profiles.id
  LOOP
    -- Create default repo for this user
    INSERT INTO repos (user_id, name, description, visibility)
    VALUES (
      user_record.user_id,
      'My Prompts',
      'Collection of my prompts',
      'public'
    )
    RETURNING id INTO new_repo_id;

    -- Move all their prompts to this repo
    UPDATE prompts
    SET repo_id = new_repo_id
    WHERE user_id = user_record.user_id AND repo_id IS NULL;
  END LOOP;
END $$;

-- Make repo_id required after migration
ALTER TABLE prompts ALTER COLUMN repo_id SET NOT NULL;
```

---

## Phase 2: Backend API Updates (Minimal) - Week 1

### Step 2.1: Update `src/lib/supabase.ts` Types

```typescript
// Add to Database type definition
repos: {
  Row: {
    id: string
    user_id: string
    name: string
    description: string | null
    visibility: 'public' | 'private'
    star_count: number
    fork_count: number
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    name: string
    description?: string | null
    visibility?: 'public' | 'private'
    star_count?: number
    fork_count?: number
    created_at?: string
    updated_at?: string
  }
  Update: {
    // ... similar to Insert
  }
}

stars: {
  Row: {
    user_id: string
    repo_id: string
    created_at: string
  }
  Insert: {
    user_id: string
    repo_id: string
    created_at?: string
  }
  Update: {}
}

repo_saves: {
  Row: {
    user_id: string
    repo_id: string
    created_at: string
  }
  Insert: {
    user_id: string
    repo_id: string
    created_at?: string
  }
  Update: {}
}
```

### Step 2.2: Add Repos API to `src/lib/api.ts`

```typescript
// Repos API (add this to existing api.ts)
export const repos = {
  // Get all public repos or user's repos
  getAll: async (filters?: {
    userId?: string
    visibility?: 'public' | 'private'
    search?: string
    limit?: number
    offset?: number
  }) => {
    let query = supabase
      .from('repos')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          name,
          bio
        ),
        prompts:prompts!repo_id (count)
      `)
      .order('created_at', { ascending: false })

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    } else {
      query = query.eq('visibility', 'public')
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters?.limit) query = query.limit(filters.limit)
    if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)

    const { data, error } = await query
    return { data, error }
  },

  // Get single repo with prompts
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('repos')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          name,
          bio,
          website,
          github,
          twitter
        ),
        prompts:prompts!repo_id (
          id,
          title,
          slug,
          description,
          content,
          type,
          tags,
          view_count,
          hearts,
          created_at,
          prompt_images (*)
        )
      `)
      .eq('id', id)
      .single()

    return { data, error }
  },

  // Create repo
  create: async (repo: Tables['repos']['Insert']) => {
    const { data, error } = await supabase
      .from('repos')
      .insert(repo)
      .select()
      .single()
    return { data, error }
  },

  // Update repo
  update: async (id: string, updates: Tables['repos']['Update']) => {
    const { data, error } = await supabase
      .from('repos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Delete repo (cascades to prompts)
  delete: async (id: string) => {
    const { error } = await supabase
      .from('repos')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Get user's repos
  getByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('repos')
      .select(`
        *,
        prompts:prompts!repo_id (count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  }
}

// Social API for repos
export const repoSocial = {
  // Star repo
  star: async (repoId: string, userId: string) => {
    const { error } = await supabase
      .from('stars')
      .insert({ user_id: userId, repo_id: repoId })

    if (!error) {
      await supabase.rpc('increment_repo_stars', { repo_id: repoId })
    }

    return { error }
  },

  // Unstar repo
  unstar: async (repoId: string, userId: string) => {
    const { error } = await supabase
      .from('stars')
      .delete()
      .eq('user_id', userId)
      .eq('repo_id', repoId)

    if (!error) {
      await supabase.rpc('decrement_repo_stars', { repo_id: repoId })
    }

    return { error }
  },

  // Check if user starred repo
  isStarred: async (repoId: string, userId: string) => {
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .eq('user_id', userId)
      .eq('repo_id', repoId)
      .single()

    return { isStarred: !!data, error }
  },

  // Save repo
  save: async (repoId: string, userId: string) => {
    const { error } = await supabase
      .from('repo_saves')
      .insert({ user_id: userId, repo_id: repoId })
    return { error }
  },

  // Unsave repo
  unsave: async (repoId: string, userId: string) => {
    const { error } = await supabase
      .from('repo_saves')
      .delete()
      .eq('user_id', userId)
      .eq('repo_id', repoId)
    return { error }
  },

  // Fork repo
  fork: async (originalRepoId: string, userId: string, newName?: string) => {
    // Get original repo
    const { data: originalRepo, error: fetchError } = await repos.getById(originalRepoId)
    if (fetchError || !originalRepo) return { data: null, error: fetchError }

    // Create forked repo
    const { data: newRepo, error: createError } = await repos.create({
      user_id: userId,
      name: newName || `Fork of ${originalRepo.name}`,
      description: originalRepo.description,
      visibility: 'public'
    })

    if (createError || !newRepo) return { data: null, error: createError }

    // Copy prompts to new repo
    const promptsToCopy = originalRepo.prompts?.map((p: any) => ({
      repo_id: newRepo.id,
      user_id: userId,
      title: p.title,
      content: p.content,
      description: p.description,
      type: p.type,
      tags: p.tags,
      parent_id: p.id // Track original prompt
    }))

    if (promptsToCopy && promptsToCopy.length > 0) {
      await supabase.from('prompts').insert(promptsToCopy)
    }

    // Track fork relationship
    await supabase.from('repo_forks').insert({
      original_repo_id: originalRepoId,
      forked_repo_id: newRepo.id
    })

    // Increment fork count
    await supabase.rpc('increment_repo_forks', { repo_id: originalRepoId })

    return { data: newRepo, error: null }
  }
}

// Add these SQL functions to Supabase
/*
CREATE OR REPLACE FUNCTION increment_repo_stars(repo_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE repos SET star_count = star_count + 1 WHERE id = repo_id;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION decrement_repo_stars(repo_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE repos SET star_count = GREATEST(star_count - 1, 0) WHERE id = repo_id;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION increment_repo_forks(repo_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE repos SET fork_count = fork_count + 1 WHERE id = repo_id;
END;
$$ LANGUAGE plpgsql;
*/
```

### Step 2.3: Update Existing Prompts API (Minor Change)

```typescript
// In existing prompts.create(), add repo handling
export const prompts = {
  create: async (prompt: Tables['prompts']['Insert'], repoId?: string) => {
    // If no repo_id provided, create default repo first
    if (!repoId && prompt.user_id) {
      const { data: userRepos } = await repos.getByUser(prompt.user_id)

      if (!userRepos || userRepos.length === 0) {
        // Create default repo for new users
        const { data: newRepo } = await repos.create({
          user_id: prompt.user_id,
          name: 'My Prompts',
          description: 'My prompt collection',
          visibility: 'public'
        })
        repoId = newRepo?.id
      } else {
        // Use first repo
        repoId = userRepos[0].id
      }
    }

    const { data, error } = await supabase
      .from('prompts')
      .insert({ ...prompt, repo_id: repoId })
      .select()
      .single()

    return { data, error }
  },

  // Rest of prompts API stays the same!
}
```

---

## Phase 3: Minimal Frontend Changes - Week 2

### Strategy: Add Repo Components, Keep Existing Prompt Components

### Step 3.1: Add Types (src/lib/types.ts)

```typescript
// Add to existing types.ts (don't remove anything!)
export interface Repo {
  id: string
  userId: string
  name: string
  description: string | null
  visibility: 'public' | 'private'
  starCount: number
  forkCount: number
  createdAt: string
  updatedAt: string
  owner?: User // from join
  prompts?: Prompt[] // from join
  promptCount?: number
  isStarred?: boolean
  isSaved?: boolean
}

export interface RepoStar {
  userId: string
  repoId: string
  createdAt: string
}

export interface RepoSave {
  userId: string
  repoId: string
  createdAt: string
}

export interface RepoFork {
  id: string
  originalRepoId: string
  forkedRepoId: string
  createdAt: string
}
```

### Step 3.2: Create New Repo Components (Don't Touch Existing!)

**New File: `src/components/RepoCard.tsx`**
```typescript
import { Repo } from '@/lib/types'
import { Star, GitFork, Eye, Lock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'

interface RepoCardProps {
  repo: Repo
  onRepoClick: (repoId: string) => void
}

export function RepoCard({ repo, onRepoClick }: RepoCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onRepoClick(repo.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {repo.owner?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">
                {repo.owner?.username || 'user'}
              </p>
              <CardTitle className="flex items-center gap-2">
                {repo.name}
                {repo.visibility === 'private' && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
            </div>
          </div>
        </div>
        {repo.description && (
          <CardDescription className="line-clamp-2">
            {repo.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            {repo.starCount}
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="h-4 w-4" />
            {repo.forkCount}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {repo.promptCount || 0} prompts
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**New File: `src/components/ReposPage.tsx`**
```typescript
import { useState, useEffect } from 'react'
import { repos } from '@/lib/api'
import { Repo } from '@/lib/types'
import { RepoCard } from './RepoCard'
import { Button } from './ui/button'
import { Plus, ArrowLeft } from 'lucide-react'
import { Skeleton } from './ui/skeleton'

interface ReposPageProps {
  userId?: string // If provided, show user's repos
  onBack: () => void
  onRepoClick: (repoId: string) => void
  onCreateRepo: () => void
}

export function ReposPage({ userId, onBack, onRepoClick, onCreateRepo }: ReposPageProps) {
  const [reposList, setReposList] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRepos()
  }, [userId])

  const loadRepos = async () => {
    setLoading(true)
    const { data, error } = userId 
      ? await repos.getByUser(userId)
      : await repos.getAll({ limit: 50 })

    if (data && !error) {
      setReposList(data as Repo[])
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">
            {userId ? 'My Repositories' : 'Explore Repositories'}
          </h1>
        </div>
        {userId && (
          <Button onClick={onCreateRepo}>
            <Plus className="h-4 w-4 mr-2" />
            New Repository
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reposList.map(repo => (
            <RepoCard 
              key={repo.id} 
              repo={repo} 
              onRepoClick={onRepoClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

**New File: `src/components/RepoViewPage.tsx`**
```typescript
import { useState, useEffect } from 'react'
import { repos, repoSocial } from '@/lib/api'
import { Repo, Prompt } from '@/lib/types'
import { PromptCard } from './PromptCard' // REUSE existing component!
import { Button } from './ui/button'
import { Star, GitFork, Eye, Lock, Plus, ArrowLeft } from 'lucide-react'
import { Skeleton } from './ui/skeleton'

interface RepoViewPageProps {
  repoId: string
  currentUserId?: string
  onBack: () => void
  onPromptClick: (promptId: string) => void
  onAddPrompt: () => void
  onForkRepo: (repoId: string) => void
}

export function RepoViewPage({ 
  repoId, 
  currentUserId,
  onBack, 
  onPromptClick,
  onAddPrompt,
  onForkRepo
}: RepoViewPageProps) {
  const [repo, setRepo] = useState<Repo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStarred, setIsStarred] = useState(false)

  useEffect(() => {
    loadRepo()
  }, [repoId])

  const loadRepo = async () => {
    setLoading(true)
    const { data, error } = await repos.getById(repoId)

    if (data && !error) {
      setRepo(data as Repo)

      if (currentUserId) {
        const { isStarred: starred } = await repoSocial.isStarred(repoId, currentUserId)
        setIsStarred(starred)
      }
    }
    setLoading(false)
  }

  const handleStar = async () => {
    if (!currentUserId) return

    if (isStarred) {
      await repoSocial.unstar(repoId, currentUserId)
      setIsStarred(false)
      setRepo(prev => prev ? { ...prev, starCount: prev.starCount - 1 } : null)
    } else {
      await repoSocial.star(repoId, currentUserId)
      setIsStarred(true)
      setRepo(prev => prev ? { ...prev, starCount: prev.starCount + 1 } : null)
    }
  }

  if (loading) {
    return <Skeleton className="h-screen" />
  }

  if (!repo) {
    return <div>Repository not found</div>
  }

  const isOwner = currentUserId === repo.userId

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{repo.owner?.username || 'user'}</span>
              <span>/</span>
            </div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              {repo.name}
              {repo.visibility === 'private' && (
                <Lock className="h-6 w-6 text-muted-foreground" />
              )}
            </h1>
            {repo.description && (
              <p className="text-muted-foreground mt-2">{repo.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              variant={isStarred ? "default" : "outline"}
              onClick={handleStar}
            >
              <Star className={`h-4 w-4 mr-2 ${isStarred ? 'fill-current' : ''}`} />
              {isStarred ? 'Starred' : 'Star'} {repo.starCount}
            </Button>

            <Button variant="outline" onClick={() => onForkRepo(repoId)}>
              <GitFork className="h-4 w-4 mr-2" />
              Fork {repo.forkCount}
            </Button>

            {isOwner && (
              <Button onClick={onAddPrompt}>
                <Plus className="h-4 w-4 mr-2" />
                Add Prompt
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Prompts */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          Prompts ({repo.prompts?.length || 0})
        </h2>

        {repo.prompts && repo.prompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repo.prompts.map((prompt: Prompt) => (
              <PromptCard 
                key={prompt.id}
                prompt={prompt}
                onClick={() => onPromptClick(prompt.id)}
              />
              // ☝️ REUSING existing PromptCard component!
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No prompts yet.</p>
        )}
      </div>
    </div>
  )
}
```
### Step 3.3: Update Navigation (Minor Change)
```typescript
// src/components/Navigation.tsx
// Just add one new link:

<Button 
  variant="ghost" 
  onClick={() => onNavigateToRepos()}
>
  Repositories
</Button>
```
### Step 3.4: Update App.tsx Routing (Minimal Change)
```typescript
// src/App.tsx
// Add new page types (don't remove existing!)

type Page =
  | { type: 'home' }
  | { type: 'explore'; searchQuery?: string }
  | { type: 'repos' } // NEW
  | { type: 'repo-view'; repoId: string } // NEW
  | { type: 'create-repo' } // NEW
  | { type: 'profile'; userId: string; tab?: string }
  // ... keep all existing page types

// In the render section, add new cases:
{currentPage.type === 'repos' && (
  <ReposPage
    userId={state.user?.id}
    onBack={handleBack}
    onRepoClick={(repoId) => setCurrentPage({ type: 'repo-view', repoId })}
    onCreateRepo={() => setCurrentPage({ type: 'create-repo' })}
  />
)}

{currentPage.type === 'repo-view' && (
  <RepoViewPage
    repoId={currentPage.repoId}
    currentUserId={state.user?.id}
    onBack={() => setCurrentPage({ type: 'repos' })}
    onPromptClick={handlePromptClick}
    onAddPrompt={() => setCurrentPage({ type: 'create' })}
    onForkRepo={handleForkRepo}
  />
)}

// Keep ALL existing page types and routes!
```
### Step 3.5: Update ExplorePage (Minor Enhancement)
```typescript
// src/components/ExplorePage.tsx
// Add a toggle to switch between "Repos" and "Prompts" view

export function ExplorePage({ ... }) {
  const [viewMode, setViewMode] = useState<'repos' | 'prompts'>('repos')

  return (
    <div>
      {/* Add view toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
        <TabsList>
          <TabsTrigger value="repos">Repositories</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
        </TabsList>
      </Tabs>

      {viewMode === 'repos' ? (
        // Show repos
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map(repo => (
            <RepoCard key={repo.id} repo={repo} onRepoClick={onRepoClick} />
          ))}
        </div>
      ) : (
        // Keep existing prompt display
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} onClick={onPromptClick} />
          ))}
        </div>
      )}
    </div>
  )
}
```
---
## Phase 4: Freemium Logic - Week 2
### Step 4.1: Add Limit Checks (src/lib/permissions.ts - NEW FILE)
```typescript
// New file: src/lib/permissions.ts
import { User } from './types'

export const LIMITS = {
  free: {
    maxRepos: 3,
    maxPromptsPerRepo: 10,
    canMakePrivate: false
  },
  pro: {
    maxRepos: Infinity,
    maxPromptsPerRepo: Infinity,
    canMakePrivate: true
  },
  admin: {
    maxRepos: Infinity,
    maxPromptsPerRepo: Infinity,
    canMakePrivate: true
  }
}

export function canCreateRepo(user: User, currentRepoCount: number): boolean {
  const limit = LIMITS[user.role || 'free']
  return currentRepoCount < limit.maxRepos
}

export function canMakePrivate(user: User): boolean {
  const limit = LIMITS[user.role || 'free']
  return limit.canMakePrivate
}

export function canAddPromptToRepo(user: User, currentPromptCount: number): boolean {
  const limit = LIMITS[user.role || 'free']
  return currentPromptCount < limit.maxPromptsPerRepo
}
```
### Step 4.2: Use in Components
```typescript
// In CreateRepoPage or wherever repo creation happens
import { canCreateRepo, canMakePrivate } from '@/lib/permissions'

const handleCreateRepo = async () => {
  if (!canCreateRepo(user, userRepoCount)) {
    toast.error('Upgrade to Pro to create more repositories')
    return
  }

  // ... create repo
}

// Disable private visibility for free users
<Select disabled={!canMakePrivate(user)}>
  <SelectItem value="public">Public</SelectItem>
  <SelectItem value="private">Private (Pro only)</SelectItem>
</Select>
```
---
## Phase 5: Testing & Polish - Week 3
### Step 5.1: Migration Testing Checklist
```markdown
- [ ] Existing users still see their prompts
- [ ] Prompts are grouped into repos correctly
- [ ] Can create new repo
- [ ] Can add prompt to repo
- [ ] Can star/unstar repo
- [ ] Can fork repo (copies all prompts)
- [ ] Free users blocked at 3 repos
- [ ] Free users can't make private repos
- [ ] ExplorePage shows repos view
- [ ] Clicking repo shows prompts inside
- [ ] All existing prompt features still work
- [ ] Comments still work on prompts
- [ ] Search works for both repos and prompts
```
### Step 5.2: Data Validation
```sql
-- Run these checks in Supabase SQL editor

-- Verify all prompts have repo_id
SELECT COUNT(*) FROM prompts WHERE repo_id IS NULL;
-- Should return 0

-- Verify repo counts match prompt counts
SELECT 
  r.id,
  r.name,
  COUNT(p.id) as prompt_count
FROM repos r
LEFT JOIN prompts p ON p.repo_id = r.id
GROUP BY r.id, r.name;

-- Verify star counts
SELECT 
  r.name,
  r.star_count,
  COUNT(s.user_id) as actual_stars
FROM repos r
LEFT JOIN stars s ON s.repo_id = r.id
GROUP BY r.id, r.name, r.star_count;
```
---
## Summary: What Changes and What Doesn't
### ✅ KEEPS WORKING (No Changes Needed):
- ✅ All existing prompt components (PromptCard, PromptDetailPage, etc.)
- ✅ CreatePromptPage (just needs repo_id passed in)
- ✅ Comments system
- ✅ Images/attachments
- ✅ User profiles
- ✅ Auth system
- ✅ Supabase setup
- ✅ All UI components (buttons, cards, etc.)
### 🔧 MINOR UPDATES:
- 🔧 Navigation - add "Repositories" link
- 🔧 ExplorePage - add repos/prompts toggle
- 🔧 App.tsx - add new page routes
- 🔧 CreatePromptPage - accept `repoId` prop
- 🔧 api.ts - add repos and repoSocial exports
### ✨ NEW COMPONENTS (Add, Don't Replace):
- ✨ RepoCard.tsx
- ✨ ReposPage.tsx
- ✨ RepoViewPage.tsx
- ✨ CreateRepoPage.tsx (simple form)
- ✨ permissions.ts
---
## Migration Timeline (3 Weeks)
### Week 1: Backend
- Day 1-2: Database changes + migration script
- Day 3-4: Add repos API + repoSocial API
- Day 5: Testing + RLS policies
### Week 2: Frontend
- Day 1-2: New repo components
- Day 3: Update navigation + routing
- Day 4: Update ExplorePage
- Day 5: Freemium logic
### Week 3: Polish
- Day 1-2: Testing all flows
- Day 3: Bug fixes
- Day 4: Performance check
- Day 5: Deploy to production
---
## Deployment Checklist
```markdown
- [ ] Run migration script on production DB
- [ ] Verify all prompts have repo_id
- [ ] Create SQL functions (increment_repo_stars, etc.)
- [ ] Set up RLS policies
- [ ] Deploy frontend with new components
- [ ] Test in production
- [ ] Monitor for errors
- [ ] Create backup before migration
```
---
## Rollback Plan (If Needed)
```sql
-- Emergency rollback (removes repo concept)
ALTER TABLE prompts DROP COLUMN repo_id;
DROP TABLE repo_forks;
DROP TABLE repo_saves;
DROP TABLE stars;
DROP TABLE repos;

-- Re-deploy old frontend
```
---
## Key Advantages of This Approach
1. ✅ **90% of existing code untouched**
2. ✅ **No rewrite needed** - just add new layer
3. ✅ **Can deploy incrementally** - test repos alongside existing prompts
4. ✅ **Rollback is possible** - just remove new tables
5. ✅ **Users don't lose data** - automatic migration
6. ✅ **Components are reusable** - PromptCard works in both contexts
7. ✅ **Keep Vite/React** - no Next.js migration yet
---
## What About Next.js Later?
You can migrate to Next.js AFTER validating the repo concept:
1. Build repos feature in Vite (this plan)
2. Launch and test
3. If successful, gradually migrate to Next.js
4. Lift and shift components (they're already modular!)
This lets you **validate product-market fit** before committing to full rewrite.
---
**Next Steps:** 
1. Run the SQL migration script
2. Add repos API to `api.ts`
3. Create the 3 new components
4. Update App.tsx routing
5. Test and deploy
Would you like me to generate the actual implementation code for any specific part?