import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { RepoCard } from './RepoCard'
import { PromptCard } from './PromptCard'
import { Plus, Search, Package, Grid3X3, List } from 'lucide-react'
import { repos as reposApi, prompts as promptsApi } from '../lib/api'
import type { Repo } from '../lib/data'
import type { Prompt } from '../lib/types'

interface ReposPageProps {
  userId?: string
  onRepoClick?: (repoId: string) => void
  onPromptClick?: (promptId: string) => void
  onCreateRepo?: () => void
  onCreatePrompt?: () => void
  mode: 'repos' | 'prompts'
}

export function ReposPage({ 
  userId, 
  onRepoClick, 
  onPromptClick, 
  onCreateRepo, 
  onCreatePrompt,
  mode 
}: ReposPageProps) {
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
  const [activeTab, setActiveTab] = useState<'all' | 'public' | 'private' | 'trending' | 'recent'>('all')

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
  }, [mode === 'repos' ? repos : prompts, searchQuery, activeTab])

  const loadRepos = async () => {
    setLoading(true)
    const { data } = await reposApi.getAll(userId)
    setRepos(data || [])
    setLoading(false)
  }

  const loadPrompts = async () => {
    setLoading(true)
    const { data } = await promptsApi.getAll()
    setPrompts(data || [])
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

    // Filter by tab
    if (activeTab === 'trending') {
      filtered = filtered.sort((a, b) => (b.hearts || 0) - (a.hearts || 0))
    } else if (activeTab === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    setFilteredPrompts(filtered)
  }

  const handleStarRepo = async (repoId: string) => {
    const newStarred = new Set(starredRepos)
    if (newStarred.has(repoId)) {
      newStarred.delete(repoId)
      // await repoSocial.unstar(repoId, userId)
    } else {
      newStarred.add(repoId)
      // await repoSocial.star(repoId, userId)
    }
    setStarredRepos(newStarred)
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {mode === 'repos' ? 'My Repositories' : 'Explore Prompts'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'repos' 
              ? 'Manage your prompt repositories' 
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
                All ({prompts.length})
              </TabsTrigger>
              <TabsTrigger value="trending">
                Trending
              </TabsTrigger>
              <TabsTrigger value="recent">
                Recent
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
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
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