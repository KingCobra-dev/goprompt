import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setName('')
    setDescription('')
    setVisibility('public')
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