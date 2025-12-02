import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { RepoCard } from './RepoCard'
import { PromptCard } from './PromptCard'
import { Plus, Search, Package, Grid3X3, List } from 'lucide-react'
import { repos as reposApi, prompts as promptsApi, repoSocial } from '../lib/api'
import type { Repo } from '../lib/data'
import type { Prompt } from '../lib/types'
import { useApp } from '../contexts/AppContext'
import { useResponsivePadding } from '@/hooks/src/hooks/useIsDesktop'

interface ReposPageProps {
  userId?: string
  onRepoClick?: (repoId: string) => void
  onPromptClick?: (promptId: string) => void
  onCreateRepo?: () => void
  onCreatePrompt?: () => void
  mode: 'repos' | 'prompts' | 'my-prompts'
}

export function ReposPage({ 
  userId, 
  onRepoClick, 
  onPromptClick, 
  onCreateRepo, 
  mode 
}: ReposPageProps) {
  const { dispatch, state } = useApp()
  const [repos, setRepos] = useState<Repo[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([])
  const [starredRepos, setStarredRepos] = useState<Set<string>>(new Set())
  
  // State for prompts mode
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Common state
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'public' | 'private' | 'trending' | 'recent' | 'saved'>('all')
  const { containerPadding } = useResponsivePadding()

  // Load data based on mode
  useEffect(() => {
    if (mode === 'repos') {
      loadRepos()
    } else {
      loadPrompts()
    }
  }, [userId, mode])

  // Filter data when search or tab changes
  useEffect(() => {
    if (mode === 'repos') {
      filterRepos()
    } else {
      filterPrompts()
    }
  }, [mode === 'repos' ? repos : prompts, searchQuery, activeTab, state.saves])

  const loadRepos = async () => {
    setLoading(true)
    const { data } = await reposApi.getAll(userId)
    setRepos(data || [])
    
    // Load starred repos if user is logged in
    if (userId) {
      const { data: starredData } = await repoSocial.getStarredRepos(userId)
      if (starredData) {
        setStarredRepos(new Set(starredData))
      }
    }
    
    setLoading(false)
  }

  const loadPrompts = async () => {
    setLoading(true)
    if (mode === 'my-prompts' && userId) {
      // For my-prompts mode, load all prompts to support saved tab
      const { data } = await promptsApi.getAll()
      setPrompts(data || [])
      dispatch({ type: 'SET_PROMPTS', payload: data || [] })
    } else {
      // For regular prompts mode, load all prompts
      const { data } = await promptsApi.getAll()
      setPrompts(data || [])
      dispatch({ type: 'SET_PROMPTS', payload: data || [] })
    }
    setLoading(false)
  }

  const filterRepos = () => {
    let filtered = [...repos]

    // Filter by search query
    if (searchQuery && typeof searchQuery === 'string') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.description.toLowerCase().includes(query) ||
          repo.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Filter by visibility
    if (activeTab !== 'all') {
      filtered = filtered.filter((repo) => repo.visibility === activeTab)
    }

    setFilteredRepos(filtered)
  }

  const filterPrompts = () => {
    let filtered = [...prompts]

    // For my-prompts mode, filter to user's prompts except for saved tab
    if (mode === 'my-prompts' && userId) {
      if (activeTab !== 'saved') {
        filtered = filtered.filter(prompt => prompt.userId === userId)
      }
    }

    // Filter by search query
    if (searchQuery && typeof searchQuery === 'string') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (prompt) =>
          prompt.title.toLowerCase().includes(query) ||
          prompt.description.toLowerCase().includes(query) ||
          prompt.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Only show public prompts in explore mode
    if (mode === 'prompts') {
      filtered = filtered.filter((prompt) => prompt.visibility === 'public')
    }

    // Sort/Filter by tab
    switch (activeTab) {
      case 'trending':
        filtered.sort((a, b) => (b.hearts || 0) - (a.hearts || 0))
        break
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'saved':
        // Filter to only show saved prompts
        const savedPromptIds = new Set(state.saves.map(save => save.promptId))
        filtered = filtered.filter(prompt => savedPromptIds.has(prompt.id))
        break
      case 'all':
      default:
        // For 'all', sort by creation date (most recent first) as default
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    setFilteredPrompts(filtered)
  }

  const handleStarRepo = async (repoId: string) => {
    if (!userId) return // Can't star without being logged in
    
    const wasStarred = starredRepos.has(repoId)
    const newStarred = new Set(starredRepos)
    
    // Optimistically update UI
    if (wasStarred) {
      newStarred.delete(repoId)
    } else {
      newStarred.add(repoId)
    }
    setStarredRepos(newStarred)
    
    // Optimistically update star count
    setRepos(prevRepos => 
      prevRepos.map(repo => 
        repo.id === repoId 
          ? { ...repo, starCount: wasStarred ? Math.max(0, repo.starCount - 1) : repo.starCount + 1 }
          : repo
      )
    )
    
    try {
      if (wasStarred) {
        await repoSocial.unstar(repoId, userId)
      } else {
        await repoSocial.star(repoId, userId)
      }
    } catch (error) {
      // Revert optimistic updates on error
      const revertStarred = new Set(starredRepos)
      if (wasStarred) {
        revertStarred.add(repoId)
      } else {
        revertStarred.delete(repoId)
      }
      setStarredRepos(revertStarred)
      
      setRepos(prevRepos => 
        prevRepos.map(repo => 
          repo.id === repoId 
            ? { ...repo, starCount: wasStarred ? repo.starCount + 1 : Math.max(0, repo.starCount - 1) }
            : repo
        )
      )
      console.error('Failed to star/unstar repo:', error)
    }
  }

  // const handleForkRepo = async (repoId: string) => {
  //   console.log('Forking repo:', repoId)
  //   // TODO: Implement fork functionality
  //   // const { data } = await repoSocial.fork(repoId, userId)
  //   // if (data) {
  //   //   onRepoClick(data.id)
  //   // }
  // }

  return (
    <div className={`container mx-auto ${containerPadding}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {mode === 'repos' ? 'My Repositories' : mode === 'my-prompts' ? 'My Prompts' : 'Explore Prompts'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'repos' 
              ? 'Manage your prompt repositories' 
              : mode === 'my-prompts'
              ? 'Manage your created prompts'
              : 'Discover and explore amazing prompts from the community'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'prompts' && (
            <>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </>
          )}
          {mode === 'repos' && onCreateRepo && (
            <Button onClick={onCreateRepo} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              New Repository
            </Button>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${mode === 'repos' ? 'repositories' : 'prompts'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-6">
          {mode === 'repos' ? (
            <>
              <TabsTrigger value="all">
                All ({repos.length})
              </TabsTrigger>
              <TabsTrigger value="public">
                Public ({repos.filter((r) => r.visibility === 'public').length})
              </TabsTrigger>
              <TabsTrigger value="private">
                Private ({repos.filter((r) => r.visibility === 'private').length})
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="all">
                All ({mode === 'prompts' ? prompts.filter((p) => p.visibility === 'public').length : mode === 'my-prompts' && userId ? prompts.filter(p => p.userId === userId).length : prompts.length})
              </TabsTrigger>
              <TabsTrigger value="trending">
                Trending
              </TabsTrigger>
              <TabsTrigger value="recent">
                Recent
              </TabsTrigger>
              <TabsTrigger value="saved">
                Saved ({state.saves.filter(s => s.userId === userId).length})
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {mode === 'repos' ? (
          <>
            <TabsContent value="all" className="mt-0">
              <RepoList
                repos={filteredRepos}
                loading={loading}
                starredRepos={starredRepos}
                onRepoClick={onRepoClick!}
                onStarRepo={handleStarRepo}
              />
            </TabsContent>

            <TabsContent value="public" className="mt-0">
              <RepoList
                repos={filteredRepos}
                loading={loading}
                starredRepos={starredRepos}
                onRepoClick={onRepoClick!}
                onStarRepo={handleStarRepo}
              />
            </TabsContent>

            <TabsContent value="private" className="mt-0">
              <RepoList
                repos={filteredRepos}
                loading={loading}
                starredRepos={starredRepos}
                onRepoClick={onRepoClick!}
                onStarRepo={handleStarRepo}
              />
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="all" className="mt-0">
              <PromptList
                prompts={filteredPrompts}
                loading={loading}
                onPromptClick={onPromptClick!}
                viewMode={viewMode}
              />
            </TabsContent>

            <TabsContent value="trending" className="mt-0">
              <PromptList
                prompts={filteredPrompts}
                loading={loading}
                onPromptClick={onPromptClick!}
                viewMode={viewMode}
              />
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              <PromptList
                prompts={filteredPrompts}
                loading={loading}
                onPromptClick={onPromptClick!}
                viewMode={viewMode}
              />
            </TabsContent>

            <TabsContent value="saved" className="mt-0">
              <PromptList
                prompts={filteredPrompts}
                loading={loading}
                onPromptClick={onPromptClick!}
                viewMode={viewMode}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

interface PromptListProps {
  prompts: Prompt[]
  loading: boolean
  onPromptClick: (promptId: string) => void
  viewMode: 'grid' | 'list'
}

function PromptList({
  prompts,
  loading,
  onPromptClick,
  viewMode,
}: PromptListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }
    >
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          id={prompt.id}
          title={prompt.title}
          description={prompt.description}
          author={prompt.author}
          category={prompt.category}
          tags={prompt.tags}
          visibility={prompt.visibility}
          stats={{
            hearts: prompt.hearts,
            saves: prompt.saveCount,
            forks: prompt.forkCount,
          }}
          createdAt={prompt.createdAt}
          onClick={() => onPromptClick(prompt.id)}
        />
      ))}
    </div>
  )
}

interface RepoListProps {
  repos: Repo[]
  loading: boolean
  starredRepos: Set<string>
  onRepoClick: (repoId: string) => void
  onStarRepo: (repoId: string) => void
  // onForkRepo: (repoId: string) => void
}

function RepoList({
  repos,
  loading,
  starredRepos,
  onRepoClick,
  onStarRepo,
  // onForkRepo,
}: RepoListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (repos.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
        <p className="text-muted-foreground">
          Create your first repository to get started
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {repos.map((repo) => (
        <RepoCard
          key={repo.id}
          repo={repo}
          onClick={() => onRepoClick(repo.id)}
          onStar={() => onStarRepo(repo.id)}
          // onFork={() => onForkRepo(repo.id)}
          isStarred={starredRepos.has(repo.id)}
        />
      ))}
    </div>
  )
}