import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { RepoCard } from './RepoCard'
import { Plus, Search, Package } from 'lucide-react'
import { repos as reposApi } from '../lib/api'
import type { Repo } from '../lib/data'

interface ReposPageProps {
  userId?: string
  onRepoClick: (repoId: string) => void
  onCreateRepo: () => void
}

export function ReposPage({ userId, onRepoClick, onCreateRepo }: ReposPageProps) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'public' | 'private' | 'all'>('all')
  const [starredRepos, setStarredRepos] = useState<Set<string>>(new Set())

  // Load repos
  useEffect(() => {
    loadRepos()
  }, [userId])

  // Filter repos when search or tab changes
  useEffect(() => {
    filterRepos()
  }, [repos, searchQuery, activeTab])

  const loadRepos = async () => {
    setLoading(true)
    const { data } = await reposApi.getAll(userId)
    setRepos(data || [])
    setLoading(false)
  }

  const filterRepos = () => {
    let filtered = [...repos]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by visibility
    if (activeTab !== 'all') {
      filtered = filtered.filter((repo) => repo.visibility === activeTab)
    }

    setFilteredRepos(filtered)
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
          <h1 className="text-3xl font-bold mb-2">Repositories</h1>
          <p className="text-muted-foreground">
            Organize your prompts into repositories
          </p>
        </div>
        <Button onClick={onCreateRepo} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          New Repository
        </Button>
      </div>

      {/* Search and filters */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All ({repos.length})
          </TabsTrigger>
          <TabsTrigger value="public">
            Public ({repos.filter((r) => r.visibility === 'public').length})
          </TabsTrigger>
          <TabsTrigger value="private">
            Private ({repos.filter((r) => r.visibility === 'private').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <RepoList
            repos={filteredRepos}
            loading={loading}
            starredRepos={starredRepos}
            onRepoClick={onRepoClick}
            onStarRepo={handleStarRepo}
            // onForkRepo={handleForkRepo}
          />
        </TabsContent>

        <TabsContent value="public" className="mt-0">
          <RepoList
            repos={filteredRepos}
            loading={loading}
            starredRepos={starredRepos}
            onRepoClick={onRepoClick}
            onStarRepo={handleStarRepo}
            // onForkRepo={handleForkRepo}
          />
        </TabsContent>

        <TabsContent value="private" className="mt-0">
          <RepoList
            repos={filteredRepos}
            loading={loading}
            starredRepos={starredRepos}
            onRepoClick={onRepoClick}
            onStarRepo={handleStarRepo}
            // onForkRepo={handleForkRepo}
          />
        </TabsContent>
      </Tabs>
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