import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Separator } from './ui/separator'
import { Skeleton } from './ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Edit, Calendar, GitFork, Heart, Bookmark, FileText } from 'lucide-react'
import { profiles as profilesApi, repos as reposApi, prompts as promptsApi } from '../lib/api'
import { useApp } from '../contexts/AppContext'
import type { User, Repo, Prompt } from '../lib/types'
import { PromptCard } from './PromptCard'
import { RepoCard } from './RepoCard'
import { getInitials } from '../lib/utils/string'
import { getRelativeTime } from '../lib/utils/date'

interface UserProfilePageProps {
  userId: string
  initialTab?: string
  onBack: () => void
}

export function UserProfilePage({ userId, onBack }: UserProfilePageProps) {
  const { state } = useApp()
  const currentUser = state.user
  const [user, setUser] = useState<User | null>(null)
  const [userRepos, setUserRepos] = useState<Repo[]>([])
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [reposLoading, setReposLoading] = useState(false)
  const [promptsLoading, setPromptsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    avatar_url: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUser()
  }, [userId])

  useEffect(() => {
    if (user) {
      loadUserContent()
    }
  }, [user])

  const loadUser = async () => {
    setLoading(true)
    const { data, error } = await profilesApi.getProfile(userId)
    if (error || !data) {
      setUser(null)
    } else {
      // Map the data to User type
      const mappedUser: User = {
        id: data.id,
        username: data.username,
        name: data.full_name || data.username,
        email: data.email,
        bio: data.bio,
        avatarUrl: data.avatar_url,
        role: data.role as any,
        reputation: 0, // Not in data
        createdAt: data.created_at,
        lastLogin: data.created_at,
        subscriptionStatus: 'active', // Default
        saveCount: 0, // Not in data
      }
      setUser(mappedUser)
    }
    setLoading(false)
  }

  const loadUserContent = async () => {
    if (!user) return

    // Load repositories
    setReposLoading(true)
    const { data: reposData } = await reposApi.getAll(user.id)
    if (reposData) {
      setUserRepos(reposData)
    }
    setReposLoading(false)

    // Load prompts from user's repositories
    setPromptsLoading(true)
    const allPrompts: Prompt[] = []
    for (const repo of reposData || []) {
      const { data: repoPrompts } = await promptsApi.getAll({ repoId: repo.id })
      if (repoPrompts) {
        allPrompts.push(...repoPrompts)
      }
    }
    // Sort by creation date, most recent first
    allPrompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setUserPrompts(allPrompts.slice(0, 20)) // Limit to 20 most recent
    setPromptsLoading(false)
  }

  const isOwnProfile = currentUser?.id === userId

  const handleEditProfile = () => {
    if (!user) return
    setEditForm({
      full_name: user.name || '',
      bio: user.bio || '',
      avatar_url: user.avatarUrl || ''
    })
    setEditDialogOpen(true)
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await profilesApi.updateProfile(user.id, editForm)
    if (!error) {
      // Reload user data
      await loadUser()
      setEditDialogOpen(false)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-32 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
        <p className="text-muted-foreground">User not found</p>
      </div>
    )
  }

  const totalHearts = userPrompts.reduce((sum, prompt) => sum + prompt.hearts, 0)
  const totalSaves = userPrompts.reduce((sum, prompt) => sum + prompt.saveCount, 0)
  const totalForks = userPrompts.reduce((sum, prompt) => sum + prompt.forkCount, 0)

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Button variant="ghost" onClick={onBack} className="mb-6">← Back</Button>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleEditProfile}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell us about yourself"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="avatar_url">Avatar URL</Label>
                        <Input
                          id="avatar_url"
                          value={editForm.avatar_url}
                          onChange={(e) => setEditForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={saving}>
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground text-lg">@{user.username}</p>
                  {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant="secondary" className="capitalize">
                      {user.role}
                    </Badge>
                    {user.subscriptionStatus && user.subscriptionStatus !== 'active' && (
                      <Badge variant="outline" className="capitalize">
                        {user.subscriptionStatus}
                      </Badge>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userRepos.length}</div>
                    <div className="text-sm text-muted-foreground">Repositories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userPrompts.length}</div>
                    <div className="text-sm text-muted-foreground">Prompts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalHearts}</div>
                    <div className="text-sm text-muted-foreground">Hearts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalSaves}</div>
                    <div className="text-sm text-muted-foreground">Saves</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prompts">Prompts ({userPrompts.length})</TabsTrigger>
          <TabsTrigger value="repositories">Repositories ({userRepos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Detailed Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Activity Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Prompts</span>
                  <span className="font-semibold">{userPrompts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Hearts</span>
                  <span className="font-semibold">{totalHearts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Saves</span>
                  <span className="font-semibold">{totalSaves}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Forks</span>
                  <span className="font-semibold">{totalForks}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm">Member Since</span>
                  <span className="font-semibold">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {userPrompts.length > 0 ? (
                  <div className="space-y-3">
                    {userPrompts.slice(0, 5).map((prompt) => (
                      <div key={prompt.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{prompt.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {getRelativeTime(prompt.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {prompt.hearts}
                          </span>
                          <span className="flex items-center">
                            <Bookmark className="h-3 w-3 mr-1" />
                            {prompt.saveCount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="mt-6">
          {promptsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userPrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPrompts.map((prompt) => (
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
                  onClick={() => {/* Navigate to prompt detail */}}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? 'Create your first prompt to get started!' : 'This user hasn\'t created any prompts yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="repositories" className="mt-6">
          {reposLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userRepos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userRepos.map((repo) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  onClick={() => {/* Navigate to repo detail */}}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <GitFork className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No repositories yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? 'Create your first repository to get started!' : 'This user hasn\'t created any repositories yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserProfilePage
