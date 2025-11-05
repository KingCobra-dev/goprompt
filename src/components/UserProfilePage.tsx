import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Separator } from './ui/separator'
import { Calendar, GitFork, Heart, Bookmark, FileText } from 'lucide-react'
import { profiles as profilesApi, repos as reposApi, prompts as promptsApi } from '../lib/api'
import type { User, Repo, Prompt } from '../lib/types'
import { getInitials } from '../lib/utils/string'
import { getRelativeTime } from '../lib/utils/date'

interface UserProfilePageProps {
  userId: string
  initialTab?: string
  onBack: () => void
}

export function UserProfilePage({ userId, onBack }: UserProfilePageProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userRepos, setUserRepos] = useState<Repo[]>([])
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

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
    const { data: reposData } = await reposApi.getAll(user.id)
    if (reposData) {
      setUserRepos(reposData)
    }

    // Load prompts from user's repositories
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
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Activity Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Content Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Repositories</span>
                  <span className="font-semibold">{userRepos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Prompts</span>
                  <span className="font-semibold">{userPrompts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Hearts Received</span>
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

            {/* Engagement Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Engagement Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Hearts per Prompt</span>
                  <span className="font-semibold">
                    {userPrompts.length > 0 ? (totalHearts / userPrompts.length).toFixed(1) : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Saves per Prompt</span>
                  <span className="font-semibold">
                    {userPrompts.length > 0 ? (totalSaves / userPrompts.length).toFixed(1) : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Most Popular Category</span>
                  <span className="font-semibold">
                    {userPrompts.length > 0
                      ? Object.entries(
                          userPrompts.reduce((acc, prompt) => {
                            acc[prompt.category] = (acc[prompt.category] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).reduce((a, b) => a[1] > b[1] ? a : b)?.[0] || 'N/A'
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Content Visibility</span>
                  <span className="font-semibold">
                    {userPrompts.filter(p => p.visibility === 'public').length} Public / {userPrompts.filter(p => p.visibility === 'private').length} Private
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Views</span>
                  <span className="font-semibold">
                    {userPrompts.reduce((sum, prompt) => sum + (prompt.viewCount || 0), 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userPrompts.length > 0 ? (
                  <div className="space-y-3">
                    {userPrompts.slice(0, 8).map((prompt) => (
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

          {/* Additional Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Repository Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GitFork className="h-5 w-5 mr-2" />
                  Repository Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Repositories</span>
                  <span className="font-semibold">{userRepos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Public Repositories</span>
                  <span className="font-semibold">{userRepos.filter(r => r.visibility === 'public').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Private Repositories</span>
                  <span className="font-semibold">{userRepos.filter(r => r.visibility === 'private').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Stars Received</span>
                  <span className="font-semibold">{userRepos.reduce((sum, repo) => sum + (repo.starCount || 0), 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Forks Received</span>
                  <span className="font-semibold">{userRepos.reduce((sum, repo) => sum + (repo.forkCount || 0), 0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Growth Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bookmark className="h-5 w-5 mr-2" />
                  Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Prompts This Month</span>
                  <span className="font-semibold">
                    {userPrompts.filter(p => {
                      const created = new Date(p.createdAt);
                      const now = new Date();
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Prompts Last Month</span>
                  <span className="font-semibold">
                    {userPrompts.filter(p => {
                      const created = new Date(p.createdAt);
                      const now = new Date();
                      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
                      return created.getMonth() === lastMonth.getMonth() && created.getFullYear() === lastMonth.getFullYear();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Prompts per Repository</span>
                  <span className="font-semibold">
                    {userRepos.length > 0 ? (userPrompts.length / userRepos.length).toFixed(1) : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Most Active Repository</span>
                  <span className="font-semibold">
                    {userRepos.length > 0
                      ? userRepos.reduce((max, repo) =>
                          (repo.promptCount || 0) > (max.promptCount || 0) ? repo : max
                        ).name
                      : 'N/A'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserProfilePage
