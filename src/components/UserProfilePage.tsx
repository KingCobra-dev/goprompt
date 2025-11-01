import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { profiles as profilesApi } from '../lib/api'
import type { User } from '../lib/types'

interface UserProfilePageProps {
  userId: string
  initialTab?: string
  onBack: () => void
}

export function UserProfilePage({ userId, onBack }: UserProfilePageProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [userId])

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button variant="ghost" onClick={onBack} className="mb-6">← Back</Button>

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
                {user.bio && <p className="mt-2">{user.bio}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {user.reputation} reputation
                  </Badge>
                  <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'pro' ? 'default' : 'outline'}>
                    {user.role}
                  </Badge>
                  {user.subscriptionStatus && (
                    <Badge variant={user.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                      {user.subscriptionStatus}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Prompts Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.saveCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Hearts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div> {/* Placeholder */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        {user.website && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Website</CardTitle>
            </CardHeader>
            <CardContent>
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {user.website}
              </a>
            </CardContent>
          </Card>
        )}

        {user.github && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>GitHub</CardTitle>
            </CardHeader>
            <CardContent>
              <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                @{user.github}
              </a>
            </CardContent>
          </Card>
        )}

        {user.twitter && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Twitter</CardTitle>
            </CardHeader>
            <CardContent>
              <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                @{user.twitter}
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default UserProfilePage
