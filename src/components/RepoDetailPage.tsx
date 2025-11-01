import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { PromptCard } from './PromptCard'
import {
  ArrowLeft,
  Star,
  GitFork,
  FileText,
  Lock,
  Globe,
  Plus,
  Settings,
} from 'lucide-react'
import { getInitials } from '../lib/utils/string'
import { getRelativeTime } from '../lib/utils/date'
import { repos as reposApi } from '../lib/api'
import type { Repo, Prompt } from '../lib/data'

interface RepoDetailPageProps {
  repoId: string
  userId?: string
  onBack: () => void
  onPromptClick: (promptId: string) => void
  onCreatePrompt: () => void
}

export function RepoDetailPage({
  repoId,
  userId,
  onBack,
  onPromptClick,
  onCreatePrompt,
}: RepoDetailPageProps) {
  const [repo, setRepo] = useState<Repo | null>(null)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [isStarred, setIsStarred] = useState(false)
  const [activeTab, setActiveTab] = useState('prompts')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editVisibility, setEditVisibility] = useState<'public' | 'private'>('public')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    loadRepoData()
  }, [repoId])

  const loadRepoData = async () => {
    setLoading(true)

    // Load repo details
    const repoResponse = await reposApi.getById(repoId)
    if (repoResponse.data) {
      setRepo(repoResponse.data)
      setEditName(repoResponse.data.name)
      setEditDescription(repoResponse.data.description)
      setEditVisibility(repoResponse.data.visibility)
    }

    // Load repo prompts
    const promptsResponse = await reposApi.getPrompts(repoId)
    if (promptsResponse.data) {
      setPrompts(promptsResponse.data)
    }

    setLoading(false)
  }

  const handleStar = () => {
    setIsStarred(!isStarred)
    // TODO: Call API to star/unstar
  }

  // const handleFork = async () => {
  //   console.log('Forking repo:', repoId)
  //   // TODO: Implement fork functionality
  // }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (!repo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Repository not found</h3>
          <p className="text-muted-foreground">
            The repository you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    )
  }

  const isOwner = userId === repo.userId

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to repositories
      </Button>

      {/* Repo header */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Author avatar */}
            <Avatar className="h-12 w-12 border">
              <AvatarImage src={repo.author.avatarUrl} />
              <AvatarFallback>{getInitials(repo.author.name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              {/* Author and visibility */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">
                  {repo.author.name}
                </span>
                {repo.author.role === 'pro' && (
                  <Badge variant="secondary" className="text-xs">
                    PRO
                  </Badge>
                )}
                <span className="text-muted-foreground">/</span>
                <div className="flex items-center gap-1">
                  {repo.visibility === 'public' ? (
                    <Globe className="h-3 w-3 text-green-600" />
                  ) : (
                    <Lock className="h-3 w-3 text-orange-600" />
                  )}
                  <span className="text-xs text-muted-foreground capitalize">
                    {repo.visibility}
                  </span>
                </div>
              </div>

              {/* Repo name */}
              <h1 className="text-3xl font-bold mb-3">{repo.name}</h1>

              {/* Description */}
              <p className="text-muted-foreground mb-4">{repo.description}</p>

              {/* Tags */}
              {repo.tags && repo.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {repo.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>{repo.starCount} stars</span>
                </div>
                {/* <div className="flex items-center gap-1">
                  <GitFork className="h-4 w-4" />
                  <span>{repo.forkCount} forks</span>
                </div> */}
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{repo.promptCount} prompts</span>
                </div>
                <div>Updated {getRelativeTime(repo.updatedAt)}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isOwner && (
              <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
            <Button
              variant={isStarred ? 'default' : 'outline'}
              onClick={handleStar}
            >
              <Star
                className={`h-4 w-4 mr-2 ${isStarred ? 'fill-current' : ''}`}
              />
              {isStarred ? 'Starred' : 'Star'}
            </Button>
            {/* <Button variant="outline" onClick={handleFork}>
              <GitFork className="h-4 w-4 mr-2" />
              Fork
            </Button> */}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="prompts">
              <FileText className="h-4 w-4 mr-2" />
              Prompts ({prompts.length})
            </TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {isOwner && activeTab === 'prompts' && (
            <Button onClick={onCreatePrompt}>
              <Plus className="h-4 w-4 mr-2" />
              Add Prompt
            </Button>
          )}
        </div>

        <TabsContent value="prompts" className="mt-0">
          {prompts.length === 0 ? (
            <div className="text-center py-12 bg-card border rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
              <p className="text-muted-foreground mb-4">
                {isOwner
                  ? 'Add your first prompt to this repository'
                  : 'This repository doesn\'t have any prompts yet'}
              </p>
              {isOwner && (
                <Button onClick={onCreatePrompt}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prompt
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          )}
        </TabsContent>

        <TabsContent value="about" className="mt-0">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">About this repository</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-1">Description</h3>
                <p className="text-muted-foreground">{repo.description}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Owner</h3>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={repo.author.avatarUrl} />
                    <AvatarFallback>
                      {getInitials(repo.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{repo.author.name}</span>
                  {repo.author.role === 'pro' && (
                    <Badge variant="secondary" className="text-xs">
                      PRO
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">Created</h3>
                <p className="text-muted-foreground">
                  {new Date(repo.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Last updated</h3>
                <p className="text-muted-foreground">
                  {getRelativeTime(repo.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Repo Modal */}
      {isOwner && (
        <Dialog open={isEditOpen} onOpenChange={(o) => { if (!o) setIsEditOpen(false) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Repository</DialogTitle>
              <DialogDescription>Update repository details or delete it.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-repo-name">Name</Label>
                <Input id="edit-repo-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-repo-description">Description</Label>
                <Textarea id="edit-repo-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
              </div>
              <div>
                <Label>Visibility</Label>
                <Select value={editVisibility} onValueChange={(v) => setEditVisibility(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={saving}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!repo) return
                  if (!confirm('Delete this repository? This action cannot be undone.')) return
                  try {
                    setSaving(true)
                    setSaveError(null)
                    const res = await reposApi.delete(repo.id)
                    if (res.error) {
                      setSaveError(res.error.message || 'Failed to delete repository')
                      return
                    }
                    setIsEditOpen(false)
                    onBack()
                  } finally {
                    setSaving(false)
                  }
                }}
                disabled={saving}
              >
                Delete
              </Button>
              <Button
                onClick={async () => {
                  if (!repo) return
                  const n = editName.trim()
                  if (n.length < 3) { setSaveError('Name must be at least 3 characters.'); return }
                  try {
                    setSaving(true)
                    setSaveError(null)
                    const { data, error } = await reposApi.update(repo.id, {
                      name: n,
                      description: editDescription.trim(),
                      visibility: editVisibility,
                    } as any)
                    if (error || !data) {
                      setSaveError(error?.message || 'Failed to update repository')
                      return
                    }
                    setRepo(data)
                    setIsEditOpen(false)
                  } finally {
                    setSaving(false)
                  }
                }}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}