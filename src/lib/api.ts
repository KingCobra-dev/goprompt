/**
 * API and data access layer
 * Handles all API calls and data management
 */

import { repos as mockRepos, prompts as mockPrompts, users as mockUsers } from './data'
import type { Repo, Prompt } from './data'
import { supabase } from './supabaseClient'

// Determine if Supabase is configured (env vars present)
const isSupabaseReady = Boolean(
  (import.meta as any)?.env?.VITE_SUPABASE_URL && (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY
)

// Utility: slugify a string
const toSlug = (str: string) =>
  (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

// Utility: handle 1-1 relation shape that may come as an array
const asOne = (u: any) => (Array.isArray(u) ? u[0] : u)

// Helper to simulate async operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ============================================
// REPOSITORIES API
// ============================================

export const repos = {
  /**
   * Get all repositories (optionally filtered by user)
   */
  getAll: async (userId?: string) => {
    // Try Supabase first, fallback to mocks on error
    try {
      let query = supabase
      .from('repos')
        .select(
          `id, user_id, name, description, visibility, star_count, fork_count, created_at, updated_at,
             users:users!repos_user_id_fkey ( id, username, email, full_name, role, avatar_url )`
        )
 if (userId) query = query.eq('user_id', userId)

      const { data, error } = await query.order('updated_at', { ascending: false })
      if (error) throw error

      const mapped: Repo[] = (data || []).map((row: any) => {
        const u = asOne(row.users)
        return ({
          id: row.id,
          userId: row.user_id,
          name: row.name,
          slug: toSlug(row.name),
          description: row.description || '',
          visibility: (row.visibility as 'public' | 'private') || 'public',
          starCount: row.star_count ?? 0,
          forkCount: row.fork_count ?? 0,
          promptCount: 0, // Can be enhanced with a separate count query
          author: {
            id: u?.id || row.user_id,
            name: u?.full_name || u?.username || 'User',
            username: u?.username || 'user',
            role: (u?.role === 'pro' ? 'pro' : u?.role === 'admin' ? 'admin' : 'general') as any,
            avatarUrl: u?.avatar_url || undefined,
            bio: undefined,
          },
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          tags: [],
        })
      })
       return { error: null, data: mapped }
    } catch (err: any) {
      console.warn('repos.getAll: falling back to mock data:', err?.message)
    }
     await delay(100)
    const filtered = userId ? mockRepos.filter(r => r.userId === userId) : mockRepos
    return { error: null, data: filtered }
  },
   /**
   * Get a single repository by ID
   */
  getById: async (repoId: string) => {
    try {
      const { data, error } = await supabase
        .from('repos')
        .select(
          `id, user_id, name, description, visibility, star_count, fork_count, created_at, updated_at,
             users:users!repos_user_id_fkey ( id, username, email, full_name, role, avatar_url )`
        )
        .eq('id', repoId)
        .maybeSingle()
      if (error) throw error
      if (!data) return { error: { message: 'Repository not found' }, data: null }

      const u = asOne(data.users)
      const mapped: Repo = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        slug: toSlug(data.name),
        description: data.description || '',
        visibility: (data.visibility as 'public' | 'private') || 'public',
        starCount: data.star_count ?? 0,
        forkCount: data.fork_count ?? 0,
        promptCount: 0,
        author: {
          id: u?.id || data.user_id,
          name: u?.full_name || u?.username || 'User',
          username: u?.username || 'user',
          role: (u?.role === 'pro' ? 'pro' : u?.role === 'admin' ? 'admin' : 'general') as any,
          avatarUrl: u?.avatar_url || undefined,
          bio: undefined,
        },
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        tags: [],
      }
       return { error: null, data: mapped }
    } catch (err: any) {
      console.warn('repos.getById: falling back to mock data:', err?.message)
    }

    await delay(100)
    const repo = mockRepos.find(r => r.id === repoId)
    return { error: repo ? null : { message: 'Repository not found' }, data: repo || null }
  },
  /**
   * Get a repository by slug
   */
  getBySlug: async (slug: string) => {
    try {
      const { data, error } = await supabase
       .from('repos')
        .select(
          `id, user_id, name, description, visibility, star_count, fork_count, created_at, updated_at,
             users:users!repos_user_id_fkey ( id, username, email, full_name, role, avatar_url )`
        )
        .ilike('name', slug.replace(/-/g, ' '))
        .maybeSingle()
      if (error) throw error
      if (!data) return { error: { message: 'Repository not found' }, data: null }

      const u2 = asOne(data.users)
      const mapped: Repo = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        slug: toSlug(data.name),
        description: data.description || '',
        visibility: (data.visibility as 'public' | 'private') || 'public',
        starCount: data.star_count ?? 0,
        forkCount: data.fork_count ?? 0,
        promptCount: 0,
        author: {
          id: u2?.id || data.user_id,
          name: u2?.full_name || u2?.username || 'User',
          username: u2?.username || 'user',
          role: (u2?.role === 'pro' ? 'pro' : u2?.role === 'admin' ? 'admin' : 'general') as any,
          avatarUrl: u2?.avatar_url || undefined,
          bio: undefined,
        },
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        tags: [],
      }

      return { error: null, data: mapped }
    } catch (err: any) {
      console.warn('repos.getBySlug: falling back to mock data:', err?.message)
    }

    await delay(100)
    const repo = mockRepos.find(r => r.slug === slug)
    return { error: repo ? null : { message: 'Repository not found' }, data: repo || null }
  },

  /**
   * Create a new repository
   */
  create: async (data: Partial<Repo>) => {
    // Prefer Supabase insert; fallback to mock
    try {
      const row: any = {
        user_id: data.userId,
        name: data.name || 'Untitled Repository',
        description: data.description || '',
        visibility: data.visibility || 'public',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const { data: inserted, error } = await supabase
        .from('repos')
        .insert(row)
        .select('id, user_id, name, description, visibility, star_count, fork_count, created_at, updated_at')
        .maybeSingle()
      if (error) throw error

      const mapped: Repo = {
        id: inserted!.id,
        userId: inserted!.user_id,
        name: inserted!.name,
        slug: toSlug(inserted!.name),
        description: inserted!.description || '',
        visibility: (inserted!.visibility as any) || 'public',
        starCount: inserted!.star_count ?? 0,
        forkCount: inserted!.fork_count ?? 0,
        promptCount: 0,
        author: mockUsers[0],
        createdAt: inserted!.created_at,
        updatedAt: inserted!.updated_at,
        tags: [],
      }
      return { error: null, data: mapped }
    } catch (err: any) {
      console.warn('repos.create: falling back to mock:', err?.message)
      await delay(100)
      const newRepo: Repo = {
        id: `repo-${Date.now()}`,
        userId: data.userId || 'user-1',
        name: data.name || 'Untitled Repository',
        slug: data.slug || `untitled-${Date.now()}`,
        description: data.description || '',
        visibility: data.visibility || 'public',
        starCount: 0,
        forkCount: 0,
        promptCount: 0,
        author: mockUsers[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: data.tags || []
      }
      return { error: null, data: newRepo }
    }
  },

  /**
   * Update a repository
   */
  update: async (repoId: string, updates: Partial<Repo>) => {
    try {
      const row: any = {}
      if (typeof updates.name === 'string') row.name = updates.name
      if (typeof updates.description === 'string') row.description = updates.description
      if (typeof (updates as any).visibility === 'string') row.visibility = (updates as any).visibility
      row.updated_at = new Date().toISOString()
      const { data, error } = await supabase
        .from('repos')
        .update(row)
        .eq('id', repoId)
        .select('id, user_id, name, description, visibility, star_count, fork_count, created_at, updated_at')
        .maybeSingle()
      if (error) throw error

      const mapped: Repo = {
        id: data!.id,
        userId: data!.user_id,
        name: data!.name,
        slug: toSlug(data!.name),
        description: data!.description || '',
        visibility: (data!.visibility as any) || 'public',
        starCount: data!.star_count ?? 0,
        forkCount: data!.fork_count ?? 0,
        promptCount: 0,
        author: mockUsers[0],
        createdAt: data!.created_at,
        updatedAt: data!.updated_at,
        tags: [],
      }
      return { error: null, data: mapped }
    } catch (err: any) {
      console.warn('repos.update: falling back to mock:', err?.message)
      await delay(100)
      const repo = mockRepos.find(r => r.id === repoId)
      if (!repo) {
        return { error: { message: 'Repository not found' }, data: null }
      }
      const updated = { ...repo, ...updates, updatedAt: new Date().toISOString() }
      return { error: null, data: updated }
    }
  },

  /**
   * Delete a repository
   */
  delete: async (repoId: string) => {
    try {
      const { error } = await supabase.from('repos').delete().eq('id', repoId)
      if (error) throw error
      return { error: null, data: { message: 'Repository deleted successfully' } }
    } catch (err: any) {
      console.warn('repos.delete: falling back to mock:', err?.message)
      await delay(100)
      const repo = mockRepos.find(r => r.id === repoId)
      if (!repo) return { error: { message: 'Repository not found' }, data: null }
      return { error: null, data: { message: 'Repository deleted successfully' } }
    }
  },

  /**
   * Get prompts in a repository
   */
  getPrompts: async (repoId: string) => {
    try {
      // Load repo owner to populate author field
      const { data: repoRow, error: repoErr } = await supabase
        .from('repos')
        .select(
          `id, user_id,
             users:users!repos_user_id_fkey ( id, username, email, full_name, role, avatar_url )`
        )
        .eq('id', repoId)
        .maybeSingle()
      if (repoErr) throw repoErr
       const { data, error } = await supabase
        .from('prompts')
        .select('id, repo_id, title, content, description, tags, created_at, updated_at')
        .eq('repo_id', repoId)
        .order('updated_at', { ascending: false })
      if (error) throw error

      const u3 = asOne(repoRow?.users)
      const author = u3
        ? {
            id: u3.id,
            name: u3.full_name || u3.username || 'User',
            username: u3.username || 'user',
            role: (u3.role === 'pro'
              ? 'pro'
              : u3.role === 'admin'
                ? 'admin'
                : 'general') as any,
            avatarUrl: u3.avatar_url || undefined,
            bio: undefined,
          }
        : mockUsers[0]

      const mapped: Prompt[] = (data || []).map((row: any) => ({
        id: row.id,
        repoId: row.repo_id,
        userId: repoRow?.user_id || author.id,
        title: row.title,
        slug: toSlug(row.title),
        description: row.description || '',
        content: row.content || '',
        type: 'text',
        modelCompatibility: [],
        tags: Array.isArray(row.tags) ? row.tags : [],
        category: 'other',
        version: '1.0.0',
        author,
        hearts: 0,
        saveCount: 0,
        forkCount: 0,
        commentCount: 0,
        viewCount: 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))

      return { error: null, data: mapped }
    } catch (err: any) {
      console.warn('repos.getPrompts: falling back to mock data:', err?.message)
    }

    await delay(100)
    const repoPrompts = mockPrompts.filter(p => p.repoId === repoId)
    return { error: null, data: repoPrompts }
  },

  /**
   * Search repositories
   */
  search: async (query: string, filters?: { userId?: string; visibility?: string }) => {
    await delay(100)
    let results = mockRepos.filter(repo => 
      repo.name.toLowerCase().includes(query.toLowerCase()) ||
      repo.description.toLowerCase().includes(query.toLowerCase()) ||
      repo.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )

    if (filters?.userId) {
      results = results.filter(r => r.userId === filters.userId)
    }
    if (filters?.visibility) {
      results = results.filter(r => r.visibility === filters.visibility)
    }

    return {
      error: null,
      data: results
    }
  }
}
// ============================================
// REPOSITORY SOCIAL FEATURES API
// ============================================

export const repoSocial = {
  /**
   * Get social stats for a repository
   */
  getStats: async (repoId: string) => {
    await delay(100)
    const repo = mockRepos.find(r => r.id === repoId)
    return {
      error: null,
      data: repo ? {
        starCount: repo.starCount,
        forkCount: repo.forkCount,
        promptCount: repo.promptCount
      } : { starCount: 0, forkCount: 0, promptCount: 0 }
    }
  },

  /**
   * Star a repository
   */
  star: async (repoId: string, userId: string) => {
    await delay(100)
    return {
      error: null,
      data: { action: 'starred', repoId, userId }
    }
  },

  /**
   * Unstar a repository
   */
  unstar: async (repoId: string, userId: string) => {
    await delay(100)
    return {
      error: null,
      data: { action: 'unstarred', repoId, userId }
    }
  },

  /**
   * Save a repository
   */
  save: async (repoId: string, userId: string) => {
    await delay(100)
    return {
      error: null,
      data: { action: 'saved', repoId, userId }
    }
  },

  /**
   * Unsave a repository
   */
  unsave: async (repoId: string, userId: string) => {
    await delay(100)
    return {
      error: null,
      data: { action: 'unsaved', repoId, userId }
    }
  },

  /**
   * Fork a repository
   */
  fork: async (repoId: string, userId: string) => {
    await delay(100)
    const originalRepo = mockRepos.find(r => r.id === repoId)
    if (!originalRepo) {
      return {
        error: { message: 'Repository not found' },
        data: null
      }
    }
    const forkedRepo: Repo = {
      ...originalRepo,
      id: `repo-fork-${Date.now()}`,
      userId,
      name: `${originalRepo.name} (Fork)`,
      slug: `${originalRepo.slug}-fork-${Date.now()}`,
      starCount: 0,
      forkCount: 0,
      author: mockUsers.find(u => u.id === userId) || mockUsers[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return {
      error: null,
      data: forkedRepo
    }
  }
}
// ============================================
// PROMPTS API
// ===========================================
export const prompts = {
  getAll: async (filters?: { repoId?: string; userId?: string }) => {
    await delay(100)
    let results = [...mockPrompts]

    if (filters?.repoId) {
      results = results.filter(p => p.repoId === filters.repoId)
    }
     if (filters?.userId) {
      results = results.filter(p => p.userId === filters.userId)
    }
    return {
      error: null,
      data: results
    }
  },
  getById: async (promptId: string) => {
    if (isSupabaseReady) {
      try {
        // Fetch prompt and join repo->user as profiles-like object
        const { data, error } = await supabase
          .from('prompts')
          .select(
            `id, repo_id, title, content, description, tags, created_at, updated_at,
             repos:repo_id ( id, user_id, users:users!repos_user_id_fkey ( id, username, email, full_name, role, avatar_url ) )`
          )
          .eq('id', promptId)
          .maybeSingle()
        if (error) throw error
        if (!data) return { error: { message: 'Prompt not found' }, data: null }

  const repoRel = asOne((data as any).repos)
  const u = asOne(repoRel?.users)

        // Return a DB-shaped object that PromptDetailPage expects
        const dbShape = {
          id: data.id,
          user_id: repoRel?.user_id || u?.id || null,
          title: data.title,
          slug: toSlug(data.title),
          description: data.description || '',
          content: data.content || '',
          type: 'text',
          model_compatibility: [],
          tags: Array.isArray(data.tags) ? data.tags : [],
          visibility: 'public',
          category: 'other',
          language: null,
          version: '1.0.0',
          parent_id: null,
          view_count: 0,
          hearts: 0,
          save_count: 0,
          fork_count: 0,
          comment_count: 0,
          created_at: data.created_at,
          updated_at: data.updated_at,
          profiles: u
            ? {
                id: u.id,
                username: u.username,
                email: u.email,
                name: u.full_name || u.username,
                bio: null,
                website: null,
                github: null,
                twitter: null,
                role: u.role,
                avatar_url: u.avatar_url,
                created_at: data.created_at,
                subscription_status: u.role === 'pro' ? 'active' : 'free',
              }
            : null,
          prompt_images: [],
        }
         return { error: null, data: dbShape as any }
      } catch (err: any) {
        console.warn('prompts.getById: falling back to mock data:', err?.message)
      }
    }
     await delay(100)
    const prompt = mockPrompts.find(p => p.id === promptId)
    return { error: prompt ? null : { message: 'Prompt not found' }, data: prompt || null }
  },
  create: async (prompt: Partial<Prompt>) => {
    if (isSupabaseReady) {
      try {
        const row = {
          repo_id: prompt.repoId!,
          title: prompt.title || 'Untitled Prompt',
          content: prompt.content || '',
          description: prompt.description || '',
          tags: Array.isArray(prompt.tags) ? prompt.tags : [],
        }
        const { data, error } = await supabase
          .from('prompts')
          .insert(row)
          .select('id, repo_id, title, content, description, tags, created_at, updated_at')
          .maybeSingle()
        if (error) throw error

        const mapped: Prompt = {
          id: data!.id,
          repoId: data!.repo_id,
          userId: prompt.userId || '',
          title: data!.title,
          slug: toSlug(data!.title),
          description: data!.description || '',
          content: data!.content || '',
          type: (prompt.type as any) || 'text',
          modelCompatibility: prompt.modelCompatibility || [],
          tags: Array.isArray(data!.tags) ? (data!.tags as string[]) : [],
          category: prompt.category || 'other',
          version: '1.0.0',
          author: mockUsers[0],
          hearts: 0,
          saveCount: 0,
          forkCount: 0,
          commentCount: 0,
          viewCount: 0,
          createdAt: data!.created_at,
          updatedAt: data!.updated_at,
        }
        return { error: null, data: mapped }
      } catch (err: any) {
        console.warn('prompts.create: falling back to mock data:', err?.message)
      }
    }

    await delay(100)
    const newPrompt: Prompt = {
      id: `prompt-${Date.now()}`,
      repoId: prompt.repoId || '',
      userId: prompt.userId || 'user-1',
      title: prompt.title || 'Untitled Prompt',
      slug: prompt.slug || `untitled-${Date.now()}`,
      description: prompt.description || '',
      content: prompt.content || '',
      type: prompt.type || 'text',
      modelCompatibility: prompt.modelCompatibility || [],
      tags: prompt.tags || [],
      category: prompt.category || 'other',
      version: '1.0.0',
      author: mockUsers[0],
      hearts: 0,
      saveCount: 0,
      forkCount: 0,
      commentCount: 0,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return { error: null, data: newPrompt }
  },

  update: async (promptId: string, updates: Partial<Prompt>) => {
    if (isSupabaseReady) {
      try {
        const row: any = {}
        if (typeof updates.title === 'string') row.title = updates.title
        if (typeof updates.content === 'string') row.content = updates.content
        if (typeof updates.description === 'string') row.description = updates.description
        if (Array.isArray(updates.tags)) row.tags = updates.tags

        const { data, error } = await supabase
          .from('prompts')
          .update(row)
          .eq('id', promptId)
          .select('id, repo_id, title, content, description, tags, created_at, updated_at')
          .maybeSingle()
        if (error) throw error

        const mapped: Prompt = {
          id: data!.id,
          repoId: data!.repo_id,
          userId: updates.userId || '',
          title: data!.title,
          slug: toSlug(data!.title),
          description: data!.description || '',
          content: data!.content || '',
          type: updates.type || 'text',
          modelCompatibility: updates.modelCompatibility || [],
          tags: Array.isArray(data!.tags) ? (data!.tags as string[]) : [],
          category: updates.category || 'other',
          version: '1.0.0',
          author: mockUsers[0],
          hearts: 0,
          saveCount: 0,
          forkCount: 0,
          commentCount: 0,
          viewCount: 0,
          createdAt: data!.created_at,
          updatedAt: data!.updated_at,
        }
        return { error: null, data: mapped }
      } catch (err: any) {
        console.warn('prompts.update: falling back to mock data:', err?.message)
      }
    }
    await delay(100)
    const prompt = mockPrompts.find(p => p.id === promptId)
    if (!prompt) {
      return { error: { message: 'Prompt not found' }, data: null }
    }
    const updated = { ...prompt, ...updates, updatedAt: new Date().toISOString() }
    return { error: null, data: updated }
  },
  delete: async (promptId: string) => {
    if (isSupabaseReady) {
      try {
        const { error } = await supabase.from('prompts').delete().eq('id', promptId)
        if (error) throw error
        return { error: null, data: { message: 'Prompt deleted successfully' } }
      } catch (err: any) {
        console.warn('prompts.delete: falling back to mock result:', err?.message)
      }
    }
    await delay(100)
    return { error: null, data: { message: 'Prompt deleted successfully' } }
  }
}
export const hearts = {
  toggle: async (promptId: string) => {
    await delay(50)
    return {
      error: null,
      data: { action: 'added', promptId }
    }
  },
   getForPrompt: async (_promptId: string) => {
    await delay(50)
    return {
      error: null,
      data: []
    }
   }
}
export const saves = {
  toggle: async (promptId: string) => {
    await delay(50)
    return {
      error: null,
      data: { action: 'added', promptId }
     }
  },
  getForUser: async (_userId: string) => {
    await delay(50)
    return {
      error: null,
      data: []
    }
    }
}
// ============================================
// COMMENTS API
// ============================================
export const comments = {
  getForPrompt: async (_promptId: string) => {
    await delay(50)
    return {
      error: null,
      data: []
    }
  },
   create: async (comment: any) => {
    await delay(50)
    return {
      error: null,
      data: { ...comment, id: `comment-${Date.now()}` }
    }
     }
}
// ============================================
// FEEDBACK API
// ============================================
export const promptFeedbacks = {
  getForPrompt: async (_promptId: string) => {
    await delay(50)
    return {
      error: null,
      data: null
    }
  },
  rate: async (promptId: string, rating: number) => {
    await delay(50)
    return {
      error: null,
      data: { promptId, rating }
    }
     }
}
    
// ============================================
// ADMIN API
// 
export const admin = {
  getUsers: async () => {
    await delay(100)
    return {
      error: null,
      data: mockUsers
    }
  },
   getSubscriptions: async () => {
    await delay(100)
    return {
      error: null,
      data: []
    }
      }
}

export const profiles = {
  /** Check if a username is available */
  checkUsernameAvailable: async (username: string) => {
    const uname = (username || '').toLowerCase()
    if (!uname) return { error: { message: 'Username required' }, data: { available: false } }
     try {
        const { data, error } = await supabase
         .from('users')
        .select('id')
        .ilike('username', uname)
      if (error) throw error
        const available = (data || []).length === 0
      return { error: null, data: { available } }
    } catch (err: any) {
      return { error: { message: err?.message || 'Failed to check username' }, data: { available: false } }
    }
  },
   /** Update only the username for the current user */
  updateUsername: async (userId: string, username: string) => {
    const uname = (username || '').toLowerCase()
    if (!userId || !uname) return { error: { message: 'Missing userId or username' }, data: null }
     if (isSupabaseReady) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({ username: uname, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select('id, username')
          .maybeSingle()
        if (error) throw error
        return { error: null, data }
      } catch (err: any) {
        return { error: { message: err?.message || 'Failed to update username' }, data: null }
      }
    }
     // Fallback: pretend success (dev only)
    return { error: null, data: { id: userId, username: uname } }
  },
  /** Update profile fields (username optional) */
  updateProfile: async (
    userId: string,
    updates: {
      username?: string
      full_name?: string
      bio?: string
      avatar_url?: string
    }
    ) => {
    if (!userId) return { error: { message: 'Missing userId' }, data: null }
     const row: any = {}
    if (typeof updates.username === 'string' && updates.username.trim()) row.username = updates.username.trim().toLowerCase()
    if (typeof updates.full_name === 'string') row.full_name = updates.full_name
  if (typeof updates.bio === 'string') row.bio = updates.bio
  if (typeof updates.avatar_url === 'string') row.avatar_url = updates.avatar_url
    row.updated_at = new Date().toISOString()
     try {
            const { data, error } = await supabase
              .from('users')
        .update(row)
        .eq('id', userId)
        .select('id, username, full_name, bio, avatar_url, updated_at')
        .maybeSingle()
      if (error) throw error
      return { error: null, data }
    } catch (err: any) {
      return { error: { message: err?.message || 'Failed to update profile' }, data: null }
    }
  },
 /** Load a single profile */
  getProfile: async (userId: string) => {
    if (!userId) return { error: { message: 'Missing userId' }, data: null }
    try {
      const { data, error } = await supabase
       .from('users')
        .select('id, username, email, full_name, bio, avatar_url, role, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle()
      if (error) throw error
      return { error: null, data }
    } catch (err: any) {
      return { error: { message: err?.message || 'Failed to load profile' }, data: null }
    }
  },
}
