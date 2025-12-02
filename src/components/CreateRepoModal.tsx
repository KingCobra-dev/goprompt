import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { X, Plus } from 'lucide-react'
import { repos as reposApi } from '../lib/api'

interface CreateRepoModalProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
  onCreated: (repoId: string) => void
}

export default function CreateRepoModal({ isOpen, onClose, userId, onCreated }: CreateRepoModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const addTag = () => {
    const inputTags = newTag.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    const remainingSlots = 10 - tags.length
    const validTags = inputTags
      .filter(tag => !tags.includes(tag))
      .slice(0, remainingSlots)
    
    if (validTags.length > 0) {
      setTags([...tags, ...validTags])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const reset = () => {
    setName('')
    setDescription('')
    setVisibility('public')
    setTags([])
    setNewTag('')
    setError(null)
  }

  const handleSubmit = async () => {
    setError(null)
    if (!userId) {
      setError('Please sign in to create a repository.')
      return
    }
    const n = name.trim()
    if (n.length < 3) {
      setError('Repository name must be at least 3 characters.')
      return
    }
    const d = description.trim()
    const wordCount = getWordCount(d)
    if (wordCount < 10) {
      setError('Repository description must be at least 10 words.')
      return
    }
    if (wordCount > 50) {
      setError('Repository description must not exceed 50 words.')
      return
    }
    if (tags.length === 0) {
      setError('At least one tag is required.')
      return
    }
    try {
      setSubmitting(true)
      const { data, error } = await reposApi.create({
        userId,
        name: n,
        description: d,
        visibility,
        tags,
      } as any)
      if (error || !data) {
        const msg = (error as any)?.message || 'Failed to create repository'
        setError(msg)
        return
      }
      reset()
      onClose()
      onCreated(data.id)
    } catch (err: any) {
      setError(err?.message || 'Failed to create repository')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Repository</DialogTitle>
          <DialogDescription>Create a repository to organize your prompts.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 ">
          <div>
            <Label htmlFor="repo-name" className="mb-2">Name *</Label>
            <Input id="repo-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Prompt Collection" />
          </div>
          <div>
            <Label htmlFor="repo-description" className="mb-2">Description *</Label>
            <Textarea id="repo-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this repository about?" rows={3} />
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${
                  getWordCount(description) < 10 ? 'text-red-500' :
                  getWordCount(description) > 50 ? 'text-orange-500' :
                  'text-green-600'
                }`}>
                  {getWordCount(description)} words
                </span>
                <span className="text-muted-foreground">10-50 required</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getWordCount(description) < 10 ? 'bg-red-500' :
                    getWordCount(description) > 50 ? 'bg-orange-500' :
                    'bg-green-600'
                  }`}
                  style={{
                    width: `${Math.min(Math.max((getWordCount(description) / 50) * 100, 0), 100)}%`
                  }}
                ></div>
              </div>
              {getWordCount(description) < 10 && (
                <p className="text-xs text-red-500">Add {10 - getWordCount(description)} more words</p>
              )}
              {getWordCount(description) > 50 && (
                <p className="text-xs text-orange-500">Remove {getWordCount(description) - 50} words</p>
              )}
            </div>
          </div>
          <div>
            <Label className="mb-2">Visibility</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2">Tags *</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tags (comma-separated)..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  disabled={tags.length >= 10}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeTag(tag)
                      }}
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {tags.length >= 10 && (
                <p className="text-sm text-muted-foreground">Maximum 10 tags</p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose(); }} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Creating…' : 'Create Repository'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}