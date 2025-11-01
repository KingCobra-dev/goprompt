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

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()])
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
    try {
      setSubmitting(true)
      const { data, error } = await reposApi.create({
        userId,
        name: n,
        description: description.trim(),
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

        <div className="space-y-4">
          <div>
            <Label htmlFor="repo-name">Name</Label>
            <Input id="repo-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Prompt Collection" />
          </div>
          <div>
            <Label htmlFor="repo-description">Description</Label>
            <Textarea id="repo-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this repository about?" rows={3} />
          </div>
          <div>
            <Label>Visibility</Label>
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
            <Label>Tags (Optional)</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
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
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
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