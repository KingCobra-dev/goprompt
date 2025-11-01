import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { RepoCard } from './RepoCard'
import { Badge } from './ui/badge'
import { Grid3X3, List, Search, TrendingUp, Clock, Star } from 'lucide-react'
import { repos as reposApi } from '../lib/api'
import type { Repo } from '../lib/data'
import { categories } from '../lib/data'
interface ExplorePageProps {
  onBack: () => void
  onRepoClick: (repoId: string) => void
  onPromptClick?: (promptId: string) => void
  initialSearchQuery?: string
}

export function ExplorePage({ 
  onBack, 
  onRepoClick, 
  initialSearchQuery 
}: ExplorePageProps) {
 
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [repos, setRepos] = useState<Repo[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'trending' | 'recent' | 'stars'>('trending')
  const [starredRepos, setStarredRepos] = useState<Set<string>>(new Set())
 
  useEffect(() => {
     loadRepos()
  }, [])
  // Initialize search query from prop
  useEffect(() => {
     filterAndSortRepos()
  }, [repos, searchQuery, selectedCategory, sortBy])

  const loadRepos = async () => {
    setLoading(true)
    const { data } = await reposApi.getAll()
    setRepos(data || [])
    setLoading(false)
  }
   
  const filterAndSortRepos = () => {
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

     // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
       (repo) => repo.tags?.includes(selectedCategory)
      )
    }

      // Only show public repos in explore
    filtered = filtered.filter((repo) => repo.visibility === 'public')

    // Sort
    switch (sortBy) {
      case 'trending':
        filtered.sort((a, b) => b.starCount - a.starCount)
        break
      case 'recent':
        filtered.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        break
      case 'stars':
        filtered.sort((a, b) => b.starCount - a.starCount)
        break
    }

    setFilteredRepos(filtered)
  }


  const handleStarRepo = (repoId: string) => {
    const newStarred = new Set(starredRepos)
    if (newStarred.has(repoId)) {
      newStarred.delete(repoId)
    } else {
      newStarred.add(repoId)
    }
    setStarredRepos(newStarred)
  }
   // const handleForkRepo = (repoId: string) => {
  //   console.log('Forking repo:', repoId)
  //   // TODO: Implement fork functionality
  // }

  // Show loading state
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back
          </Button>
          <h1 className="text-3xl font-bold">Explore Repositories</h1>
          <p className="text-muted-foreground">
            Discover prompt repositories from the community
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>
        {/* Search */}
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
 
        {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Sort */}
        <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <TabsList>
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="stars">
              <Star className="h-4 w-4 mr-2" />
              Most Stars
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
  
       {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('all')}
        >
          All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {loading ? 'Loading...' : `${filteredRepos.length} repositories found`}
      </div>
              
      {/* Repository grid/list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
         ) : filteredRepos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No repositories found</p>
        </div>
          ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
              : 'space-y-4'
          }
        >
          {filteredRepos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              onClick={() => onRepoClick(repo.id)}
              onStar={() => handleStarRepo(repo.id)}
              // onFork={() => handleForkRepo(repo.id)}
              isStarred={starredRepos.has(repo.id)}
            />
          ))}

        </div>
      )}
    </div>
  )
}
