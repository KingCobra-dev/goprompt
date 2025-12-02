import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Badge } from './ui/badge'
import { Card, CardContent, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useApp } from '../contexts/AppContext'
import { Prompt, PromptImage, Repo } from '../lib/types'
import { ImageUpload } from './ImageUpload'
import { categories, models } from '../lib/data'
import { prompts, repos } from '../lib/api'

import {
  ArrowLeft,
  Eye,
  FileText,
  Image,
  Code,
  Bot,
  Link2,
  Plus,
  X,
  Settings,
  PenTool,
  Camera,
  Hash,
  Cog,
  Lock,
  Save,
  Loader2,
} from 'lucide-react'

interface CreatePromptPageProps {
  onBack: () => void
  editingPrompt?: Prompt
  onPublish?: (isNewPrompt: boolean, promptId?: string) => void
  repoId?: string
}

const promptTypes = [
  {
    value: 'text',
    label: 'Text Prompt',
    icon: FileText,
    description: 'General text generation and completion',
  },
  {
    value: 'image',
    label: 'Image Prompt',
    icon: Image,
    description: 'Image generation and visual content',
  },
  {
    value: 'code',
    label: 'Code Prompt',
    icon: Code,
    description: 'Code generation and programming assistance',
  },
  {
    value: 'agent',
    label: 'AI Agent',
    icon: Bot,
    description: 'Complex multi-step AI agent workflows',
  },
  {
    value: 'chain',
    label: 'Prompt Chain',
    icon: Link2,
    description: 'Sequential prompt workflows',
  },
]

const visibilityOptions = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can see and use this prompt',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can see this prompt',
  },
]

export function CreatePromptPage({
  onBack,
  editingPrompt,
  onPublish,
  repoId,
}: CreatePromptPageProps) {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('editor')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    'saved'
  )
  const [isPublishing, setIsPublishing] = useState(false)
  const [repository, setRepository] = useState<Repo | null>(null)
  const hasLoadedRef = useRef(false)

  // Form state
  const [title, setTitle] = useState(editingPrompt?.title || '')
  const [description, setDescription] = useState(
    editingPrompt?.description || ''
  )
  const [content, setContent] = useState(editingPrompt?.content || '')
  const [type, setType] = useState<'text' | 'image' | 'code' | 'conversation'>('text')
  const [category, setCategory] = useState(editingPrompt?.category || '')
  const [visibility, setVisibility] = useState<
    'public' | 'private'
  >(editingPrompt?.visibility || 'public')
  const [selectedModels, setSelectedModels] = useState<string[]>(
    editingPrompt?.modelCompatibility || []
  )
  const [tags, setTags] = useState<string[]>(editingPrompt?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [images, setImages] = useState<PromptImage[]>(
    editingPrompt?.images || []
  )

  
  // Meta description state
  const [metaDescription, setMetaDescription] = useState('')

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Track changes for auto-save status
  useEffect(() => {
    if (!hasLoadedRef.current) return // Don't mark as unsaved while loading
    setSaveStatus('unsaved')
  }, [
    title,
    description,
    content,
    type,
    category,
    visibility,
    selectedModels,
    tags,
    images,
  ])

  // Auto-save functionality to localStorage
  useEffect(() => {
    if (!state.user || (!title && !content) || saveStatus === 'saved') return

    const saveTimer = setTimeout(() => {
      saveToLocalStorage()
    }, 10000) // Auto-save every 10 seconds

    return () => clearTimeout(saveTimer)
  }, [
    title,
    description,
    content,
    type,
    category,
    visibility,
    selectedModels,
    tags,
    images,
    saveStatus,
  ])

  // Load from localStorage on mount
  useEffect(() => {
    if (editingPrompt || !state.user || hasLoadedRef.current) return // Don't load from localStorage when editing existing prompt, no user, or already loaded

    const savedData = loadFromLocalStorage()
    if (savedData) {
      console.log('Restoring from localStorage:', savedData)
      setTitle(savedData.title || '')
      setDescription(savedData.description || '')
      setContent(savedData.content || '')
      setType(savedData.type || 'text')
      setCategory(savedData.category || '')
      setVisibility(savedData.visibility || 'public')
      setSelectedModels(savedData.selectedModels || [])
      setTags(savedData.tags || [])
      setImages(savedData.images || [])
      setMetaDescription(savedData.metaDescription || '')
      setSaveStatus('saved')
    } else {
      console.log('No saved data found in localStorage')
    }
    
    hasLoadedRef.current = true
  }, [state.user?.id, editingPrompt]) // Use state.user?.id to be more specific

  const saveToLocalStorage = () => {
    if (!state.user) return

    try {
      setSaveStatus('saving')

      const dataToSave = {
        title,
        description,
        content,
        type,
        category,
        visibility,
        selectedModels,
        tags,
        images,
        metaDescription,
        lastSaved: new Date().toISOString(),
      }

      const key = `prompt-draft-${state.user.id}`
      localStorage.setItem(key, JSON.stringify(dataToSave))
      console.log('Saved to localStorage:', key, dataToSave)
      setSaveStatus('saved')
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      setSaveStatus('unsaved')
    }
  }

  const loadFromLocalStorage = () => {
    if (!state.user) return null

    try {
      const key = `prompt-draft-${state.user.id}`
      const saved = localStorage.getItem(key)
      console.log('Loading from localStorage:', key, saved ? JSON.parse(saved) : null)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
    return null
  }

  // Fetch repository details when repoId is provided
  useEffect(() => {
    const fetchRepository = async () => {
      if (repoId) {
        try {
          const { data: repo, error } = await repos.getById(repoId)
          if (!error && repo) {
            setRepository(repo)
            // If creating a new prompt in a private repo, default to private visibility
            if (!editingPrompt && repo.visibility === 'private') {
              setVisibility('private')
            }
          }
        } catch (err) {
          console.error('Error fetching repository:', err)
        }
      }
    }
    fetchRepository()
  }, [repoId, editingPrompt])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = 'Title is required'
    else if (title.length < 5)
      newErrors.title = 'Title must be at least 5 characters'
    else if (title.length > 100)
      newErrors.title = 'Title must be less than 100 characters'

    if (!description.trim()) newErrors.description = 'Description is required'
    else if (description.length < 10)
      newErrors.description = 'Description must be at least 10 characters'
    else if (description.length > 500)
      newErrors.description = 'Description must be less than 500 characters'

    if (!content.trim()) newErrors.content = 'Prompt content is required'
    else if (content.length > 10000)
      newErrors.content = 'Content must be less than 10,000 characters'

    if (!category) newErrors.category = 'Category is required'
    if (selectedModels.length === 0)
      newErrors.models = 'At least one model must be selected'
    if (tags.length === 0) newErrors.tags = 'At least one tag is required'

    // Images are now optional
    // if (images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePublish = async () => {
    if (!validateForm() || !state.user) return

    setIsPublishing(true)
    let createdPromptId: string | undefined

    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      let success = false

      try {
        // Get or create a repository for the user
        let userRepoId = editingPrompt?.repoId || repoId

        if (!userRepoId) {
          // Check if user has any repos
          const { data: userRepos, error: reposError } = await repos.getAll(state.user.id)
          if (reposError) throw reposError

          if (userRepos && userRepos.length > 0) {
            // Use the first repo
            userRepoId = userRepos[0].id
          } else {
            // Create a default repository
            const { data: newRepo, error: createRepoError } = await repos.create({
              userId: state.user.id,
              name: `${state.user.name || state.user.username}'s Prompts`,
              description: 'My prompt collection',
              visibility: 'public'
            })
            if (createRepoError) throw createRepoError
            userRepoId = newRepo?.id
          }
        }

        if (!userRepoId) {
          throw new Error('Could not determine repository for prompt')
        }

        // Create or update the prompt
        const promptData = {
          repoId: userRepoId,
          title,
          description,
          content,
          type,
          category,
          tags,
          modelCompatibility: selectedModels,
          visibility: repository?.visibility === 'private' ? 'private' : visibility,
        }

        if (editingPrompt) {
          const { error: updateError } = await prompts.update(editingPrompt.id, promptData)
          if (updateError) throw updateError
        } else {
          const { data: createdPrompt, error: createError } = await prompts.create(promptData)
          if (createError) throw createError
          createdPromptId = createdPrompt?.id
        }

        success = true
      } catch (apiError) {
        console.warn('Database API not available:', apiError)
        success = false
      }

      // Fallback to local state management if Supabase fails
      if (!success) {
        const newPrompt: Prompt = {
          repoId: editingPrompt?.repoId || repoId || '',
          id: editingPrompt?.id || `prompt-${Date.now()}`,
          userId: state.user.id,
          title,
          slug,
          description,
          content,
          type,
          modelCompatibility: selectedModels,
          tags,
          visibility: repository?.visibility === 'private' ? 'private' : visibility,
          attachments: [],
          images,
          category,
          version: editingPrompt ? editingPrompt.version : '1.0.0',
          parentId: editingPrompt?.parentId,
          viewCount: editingPrompt?.viewCount || 0,
          hearts: editingPrompt?.hearts || 0,
          saveCount: editingPrompt?.saveCount || 0,
          forkCount: editingPrompt?.forkCount || 0,
          commentCount: editingPrompt?.commentCount || 0,
          createdAt: editingPrompt?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: state.user,
          isHearted: false,
          isSaved: false,
          isForked: false,
        }

        if (editingPrompt) {
          dispatch({
            type: 'UPDATE_PROMPT',
            payload: { id: editingPrompt.id, updates: newPrompt },
          })
        } else {
          dispatch({ type: 'ADD_PROMPT', payload: newPrompt })
        }
      }

      if (onPublish) {
        onPublish(!editingPrompt, createdPromptId)
      } else {
        onBack()
      }

      // Clear auto-saved data from localStorage after successful publish
      if (state.user) {
        const key = `prompt-draft-${state.user.id}`
        localStorage.removeItem(key)
      }
    } catch (err) {
      console.error('Error publishing prompt:', err)
      setErrors({ submit: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsPublishing(false)
    }
  }

    // Image updates will be handled when backend is wired
  const addTag = () => {
    const trimmedTag = newTag.trim().replace(/\s+/g, ' ')
    if (
      trimmedTag &&
      !tags.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase()) &&
      tags.length < 10
    ) {
      setTags([...tags, trimmedTag])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const removeModel = (modelToRemove: string) => {
    setSelectedModels(selectedModels.filter(model => model !== modelToRemove))
  }

  const wordCount = content.trim().split(/\s+/).length
  const charCount = content.length

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-1xl">
              {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
            </h1>
            {repository && (
              <p className="text-3xl text-muted-foreground mt-1">
                Repository: {repository.name}
              </p>
            )}
            <p className="text-muted-foreground">
              {editingPrompt
                ? 'Update your existing prompt'
                : 'Share your expertise with the community'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus !== 'saved' && (
            <div className="flex items-center gap-1">
              <Save className={`h-4 w-4 ${saveStatus === 'saving' ? 'animate-pulse text-blue-600' : 'text-orange-600'}`} />
              <span className={`text-sm ${saveStatus === 'saving' ? 'text-blue-600' : 'text-orange-600'}`}>
                {saveStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
              </span>
            </div>
          )}
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {editingPrompt ? 'Updating...' : 'Publishing...'}
              </>
            ) : (
              editingPrompt ? 'Update' : 'Publish'
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              {/* Basic Info */}
              <Card>
                <CardContent className="space-y-3">
                  <CardTitle className="flex items-center gap-2 mb-3">
                    <PenTool className="h-5 w-5 text-primary" />
                    Basic Information
                  </CardTitle>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Enter a descriptive title..."
                      className={`border border-gray-300 ${errors.title ? 'border-destructive' : ''}`}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe what this prompt does and how to use it..."
                      rows={3}
                      className={`border border-gray-300 ${errors.description ? 'border-destructive' : ''}`}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      {errors.description && (
                        <span className="text-destructive">
                          {errors.description}
                        </span>
                      )}
                      <span
                        className={
                          description.length > 450 ? 'text-warning' : ''
                        }
                      >
                        {description.length}/500
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prompt Content */}
              <Card>
                <CardContent className="space-y-3">
                  <CardTitle className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-primary" />
                    Prompt Content
                  </CardTitle>
                  <div className="space-y-2">
                    <Label htmlFor="content">Prompt Content *</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Write your prompt here. Use {{variable}} syntax for dynamic content..."
                      rows={12}
                      className={`font-mono border border-gray-300 ${errors.content ? 'border-destructive' : ''}`}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div className="flex gap-4">
                        <span>{wordCount} words</span>
                        <span>{charCount}/10,000 characters</span>
                      </div>
                      {errors.content && (
                        <span className="text-destructive">
                          {errors.content}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardContent className="space-y-3">
                  <CardTitle className="flex items-center gap-2 mb-3">
                    <Camera className="h-5 w-5 text-primary" />
                    Images
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Image upload is currently disabled. This feature will be available soon.
                  </p>
                  <ImageUpload
                    images={images}
                    onImagesChange={setImages}
                    maxImages={5}
                    allowPrimarySelection={true}
                    disabled={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardContent className="space-y-4">
                  <CardTitle className="mb-3">Preview</CardTitle>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl mb-2">
                        {title || 'Untitled Prompt'}
                      </h3>
                      <p className="text-muted-foreground">
                        {description || 'No description provided'}
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {content || 'No content provided'}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Type & Category */}
          <Card>
            <CardContent className="space-y-3">
              <CardTitle className="flex items-center gap-2 mb-3">
                <Settings className="h-5 w-5 text-primary" />
                Type & Category
              </CardTitle>
              <div className="space-y-2">
                <Label>Prompt Type *</Label>
                <div className="grid grid-cols-1 gap-2">
                  {promptTypes.map(promptType => {
                    const Icon = promptType.icon
                    const isDisabled = promptType.value !== 'text'
                    return (
                      <div
                        key={promptType.value}
                        className={`p-3 border rounded-lg transition-colors relative ${
                          isDisabled 
                            ? 'border-muted bg-muted/50 cursor-not-allowed opacity-60' 
                            : type === promptType.value
                            ? 'border-primary bg-primary/5 cursor-pointer'
                            : 'hover:border-muted-foreground cursor-pointer'
                        }`}
                        onClick={() => !isDisabled && setType(promptType.value as any)}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div className="flex-1">
                            <div className="font-medium text-sm flex items-center gap-2">
                              {promptType.label}
                              {isDisabled && <Lock className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {promptType.description}
                              {isDisabled && ' (Coming soon)'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    className={`border border-gray-300 ${errors.category ? 'border-destructive' : ''}`}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                       {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Model Compatibility */}
          <Card>
            <CardContent className="space-y-3">
              <CardTitle className="flex items-center gap-2 mb-3">
                <Bot className="h-5 w-5 text-primary" />
                Model Compatibility
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select AI models that work well with this prompt. You can select multiple models.
              </p>
              <div className="space-y-2">
                <Label>AI Models *</Label>
                <Select
                  value=""
                  onValueChange={(modelId) => {
                    const model = models.find(m => m.id === modelId)
                    if (model && !selectedModels.includes(model.name) && selectedModels.length < 5) {
                      setSelectedModels([...selectedModels, model.name])
                    }
                  }}
                >
                  <SelectTrigger className="border border-gray-300">
                    <SelectValue placeholder="Select AI models..." />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model: any) => (
                      <SelectItem
                        key={model.id}
                        value={model.id}
                        disabled={selectedModels.includes(model.name)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-1">
                {selectedModels.map(model => (
                  <Badge
                    key={model}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {model}
                    <button
                      type="button"
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeModel(model)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {selectedModels.length >= 5 && (
                <p className="text-sm text-muted-foreground">
                  Maximum 5 models selected
                </p>
              )}

              {errors.models && (
                <p className="text-sm text-destructive">{errors.models}</p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="space-y-3">
              <CardTitle className="flex items-center gap-2 mb-3">
                <Hash className="h-5 w-5 text-primary" />
                Tags
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="border border-gray-300"
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  disabled={tags.length >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeTag(tag)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {tags.length >= 10 && (
                <p className="text-sm text-muted-foreground">Maximum 10 tags</p>
              )}
              {errors.tags && (
                <p className="text-sm text-destructive">{errors.tags}</p>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardContent className="space-y-2">
              <CardTitle className="flex items-center gap-2 mb-3">
                <Cog className="h-5 w-5 text-primary" />
                Settings
              </CardTitle>
              <div className="space-y-3">
                <Label>Visibility</Label>
                {visibilityOptions
                  .filter(option => repository?.visibility !== 'private' || option.value === 'private')
                  .map(option => (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      visibility === option.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground'
                    }`}
                    onClick={() => setVisibility(option.value as any)}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
