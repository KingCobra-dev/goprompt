import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { useApp } from '../contexts/AppContext'
import { profiles as profilesApi } from '../lib/api'
import {
  ArrowLeft,
  User,
  Shield,
  Globe,
  Github,
  Twitter,

} from 'lucide-react'

interface SettingsPageProps {
  onBack: () => void
}

export function SettingsPage({
  onBack,
}: SettingsPageProps) {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [usernameOk, setUsernameOk] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: state.user?.name || '',
    username: state.user?.username || '',
    email: state.user?.email || '',
    bio: state.user?.bio || '',
    website: state.user?.website || '',
    github: state.user?.github || '',
    twitter: state.user?.twitter || '',
    skills: state.user?.skills?.join(', ') || '',
  })

  if (!state.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Please sign in to access settings</h2>
          <Button onClick={onBack}>← Back</Button>
        </div>
      </div>
    )
  }

  const validateUsername = (u: string) => {
    const val = (u || '').trim()
    if (val.length < 3) return 'Username must be at least 3 characters'
    if (val.length > 30) return 'Username must be at most 30 characters'
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(val)) return 'Only letters, numbers, underscore; must start with a letter'
    return null
  }

  const handleSave = async () => {
    setUsernameError(null)
    setUsernameOk(null)

    const usernameChanged = formData.username !== state.user!.username
    if (usernameChanged) {
      const err = validateUsername(formData.username)
      if (err) {
        setUsernameError(err)
        return
      }
    }

     try {
      setSaving(true)
      // If username changed, check availability first
      if (usernameChanged) {
        const chk = await profilesApi.checkUsernameAvailable(formData.username)
        if (chk.error) {
          setUsernameError(chk.error.message)
          return
        }
        if (!chk.data?.available) {
          setUsernameError('That username is already taken')
          return
        }
      }

      // Update profile in DB (username, name, bio)
      const upd = await profilesApi.updateProfile(state.user!.id, {
        username: usernameChanged ? formData.username : undefined,
        full_name: formData.name,
        bio: formData.bio,
      })
      if (upd.error) {
        setUsernameError(
          upd.error.message?.toLowerCase().includes('duplicate')
            ? 'That username is already taken'
            : upd.error.message
        )
        return
      }
      // Read back from DB to confirm and hydrate state from source of truth
      const fresh = await profilesApi.getProfile(state.user!.id)
      if (fresh.error || !fresh.data) {
        setUsernameError(
          fresh.error?.message || 'Saved locally but could not verify changes from database.'
        )
        return
      }

      if (usernameChanged && fresh.data.username === formData.username) {
        setUsernameOk('Username updated')
      }

      const updatedUser = {
        ...state.user!,
        name: (fresh.data as any).full_name || (fresh.data as any).name || formData.name,
        username: (fresh.data as any).username || formData.username,
        email: state.user!.email, // email not edited here
        bio: (fresh.data as any).bio ?? formData.bio,
        // keep client-only fields until we add DB columns for them
        website: formData.website,
        github: formData.github,
        twitter: formData.twitter,
        skills: formData.skills
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s),
      }

      dispatch({ type: 'SET_USER', payload: updatedUser })
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: state.user?.name || '',
      username: state.user?.username || '',
      email: state.user?.email || '',
      bio: state.user?.bio || '',
      website: state.user?.website || '',
      github: state.user?.github || '',
      twitter: state.user?.twitter || '',
      skills: state.user?.skills?.join(', ') || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                       <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={e =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                      {usernameError && (
                    <p className="text-xs text-destructive mt-1">{usernameError}</p>
                  )}
                  {usernameOk && (
                    <p className="text-xs text-green-600 mt-1">{usernameOk}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={e =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Social Links</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://your-website.com"
                      value={formData.website}
                      onChange={e =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="github-username"
                      value={formData.github}
                      onChange={e =>
                        setFormData({ ...formData, github: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="twitter-handle"
                      value={formData.twitter}
                      onChange={e =>
                        setFormData({ ...formData, twitter: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={e =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                  placeholder="AI, Machine Learning, Writing..."
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Data & Privacy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Profile Visibility</div>
                      <div className="text-sm text-muted-foreground">
                        Make your profile visible to other users
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Activity Tracking</div>
                      <div className="text-sm text-muted-foreground">
                        Help improve the platform with usage analytics
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-destructive">Danger Zone</h4>
                <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium">Export Data</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        Download a copy of all your data
                      </p>
                      <Button variant="outline" size="sm">
                        Request Export
                      </Button>
                    </div>
                    <Separator />
                    <div>
                      <h5 className="font-medium text-destructive">
                        Delete Account
                      </h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        Permanently delete your account and all associated data
                      </p>
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        Feature coming soon
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
