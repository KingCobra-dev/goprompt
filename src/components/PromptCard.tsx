import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Heart, Share, BookmarkPlus, GitFork, Edit, Trash2 } from 'lucide-react'
import { categories } from '../lib/data'
import { PromptImage } from '../lib/types'
import { useApp } from '../contexts/AppContext'
import { hearts, saves } from '../lib/api'
import { getInitials } from '../lib/utils/string'
import { getRelativeTime } from '../lib/utils/date'


interface PromptCardProps {
  id: string
  title: string
  description: string
  author: {
    name: string
    username: string
    role?: 'general' | 'pro' | 'admin'
    
  }
  category: string
  tags: string[]
  images?: PromptImage[]
  stats?: {
    hearts: number
    saves: number
    forks: number
  }
  successRate?: number
  successVotesCount?: number
  isHearted?: boolean // optional external prop
  isSaved?: boolean // Keep for backwards compatibility, but internally use context state
  createdAt: string
  parentAuthor?: {
    name: string
    username: string
    role?: 'general' | 'pro' | 'admin'
  }
  onClick?: () => void
  onHeart?: () => void // Keep for backwards compatibility
  onSave?: () => void // Keep for backwards compatibility
  onShare?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showManagement?: boolean
}
export function PromptCard({
  id: _id,
  title,
  description,
  author,
  category,
  tags: _tags,
  stats,
  successRate,
 successVotesCount: _successVotesCount,
  isSaved: _isSaved = false, // Renamed to indicate it's not used internally
  createdAt,
  parentAuthor,
  onClick,
  onHeart: _onHeart, // Renamed to indicate it's not used internally
  onSave: _onSave, // Renamed to indicate it's not used internally
  onShare,
  onEdit,
  onDelete,
  showManagement = false,
}: PromptCardProps) {
  const { state, dispatch } = useApp()
  const [heartAnimating, setHeartAnimating] = useState(false)
  const [saveAnimating, setSaveAnimating] = useState(false)

  // Calculate the actual heart state from context
  const isHearted =
    typeof state.hearts !== 'undefined' &&
    state.hearts.some(
      (h: any) => h.userId === state.user?.id && h.promptId === _id
    )

  // Calculate the actual save state from context
  const isActuallySaved = state.saves.some(
    s => s.userId === state.user?.id && s.promptId === _id
  )

  // Prefer authoritative count from global prompts state when available
  const heartsCount = (
    state.prompts.find(p => p.id === _id)?.hearts ?? stats?.hearts ?? 0
  )

  const handleHeart = async () => {
    if (!state.user) {
      console.log('User not authenticated')
      return
    }

    // Trigger animation
    setHeartAnimating(true)
    setTimeout(() => setHeartAnimating(false), 400)

    console.log(
      'Toggling heart for prompt:',
      _id,
      'Current isHearted:',
      isHearted
    )
    try {
      const result = await hearts.toggle(_id)
      console.log('Heart result:', result)

      if (!result.error && result.data) {
        // Update global state immediately for instant visual feedback
        if (result.data.action === 'added') {
          console.log('Adding heart - updating UI')
          dispatch({ type: 'HEART_PROMPT', payload: { promptId: _id } })
        } else {
          console.log('Removing heart - updating UI')
          dispatch({ type: 'UNHEART_PROMPT', payload: { promptId: _id } })
        }
      } else {
        console.error('Heart error:', result.error)
      }
    } catch (error) {
      console.error('Heart exception:', error)
    }
  }

  const handleSave = async () => {
    if (!state.user) {
      console.log('User not authenticated')
      return
    }

    // Trigger animation
    setSaveAnimating(true)
    setTimeout(() => setSaveAnimating(false), 400)

    console.log(
      'Toggling save for prompt:',
      _id,
      'Current isSaved:',
      isActuallySaved
    )
    try {
      const result = await saves.toggle(_id)
      console.log('Save result:', result)

      if (!result.error && result.data) {
        // Update global state immediately for instant visual feedback
        if (result.data.action === 'added') {
          console.log('Adding save - updating UI')
          dispatch({ type: 'SAVE_PROMPT', payload: { promptId: _id } })
        } else {
          console.log('Removing save - updating UI')
          dispatch({ type: 'UNSAVE_PROMPT', payload: _id })
        }
      } else {
        console.error('Save error:', result.error)
      }
    } catch (error) {
      console.error('Save exception:', error)
    }
  }

  const categoryData = categories.find(
    cat =>
      cat.id === category?.toLowerCase() ||
      cat.label?.toLowerCase() === category?.toLowerCase() ||
      cat.name?.toLowerCase() === category?.toLowerCase()
  )

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col overflow-hidden"
      onClick={() => {
        console.log('PromptCard onClick fired for id:', _id)
        onClick?.()
      }}
    >
      <CardContent className="p-4 flex-1 flex flex-col space-y-3">
        {/* Title */}
        <h3 className="line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Author - Text only username */}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
            {getInitials(author.name)}
          </div>
          <span className="text-muted-foreground">{author.username}</span>
          {author.role === 'pro' && (
            <Badge variant="secondary" className="text-xs">PRO</Badge>
          )}
          {author.role === 'admin' && (
            <Badge variant="default" className="text-xs">ADMIN</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            • {getRelativeTime(createdAt)}
          </span>
        </div>

        {/* Forked from indicator */}
        {parentAuthor && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1">
            <GitFork className="h-3 w-3" />
            <span>Forked from</span>
            <span className="font-medium">{parentAuthor.username}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-muted-foreground text-sm line-clamp-3 flex-1">
          {description}
        </p>

        {/* Category Badge and Success Badge */}
        <div className="flex items-center gap-2">
          {categoryData && categoryData.id !== 'other' ? (
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                borderColor: categoryData.color + '40',
                color: categoryData.color,
                backgroundColor: categoryData.color + '10',
              }}
            >
              {categoryData.label}
            </Badge>
          ) : category && category !== 'other' ? (
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          ) : null}

          {successRate !== undefined && successRate > 0 && (
          <Badge variant="outline" className="text-xs text-green-600">
              ✓ {Math.round(successRate)}% success
            </Badge>
          )}
        </div>

        {/* Tags */}
        {_tags && _tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {_tags.slice(0, 3).map((tag: string) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-0.5 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                style={{
                  borderColor: '#3B82F6' + '30',
                  color: '#3B82F6',
                  backgroundColor: '#3B82F6' + '08',
                }}
              >
                <span className="text-primary/60 mr-1">#</span>
                {tag}
              </Badge>
            ))}
            {_tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 border-primary/20 bg-primary/5"
                style={{
                  borderColor: '#3B82F6' + '30',
                  color: '#3B82F6',
                  backgroundColor: '#3B82F6' + '08',
                }}
              >
                +{_tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Stats and Actions */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-muted-foreground">
            {/* <div className="flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              {stats?.forks || 0}
            </div> */}
          </div>

          <div className="flex items-center gap-2">
            {showManagement && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    onEdit?.()
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-destructive hover:text-destructive"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    onDelete?.()
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                handleHeart()
              }}
              className={isHearted ? 'bg-red-50 text-red-600' : ''}
            >
              <Heart
                className={`h-3 w-3 mr-2 transition-all duration-300 ease-out ${
                  isHearted ? 'fill-current scale-110' : 'scale-100'
                } ${heartAnimating ? 'animate-bounce scale-125' : ''}`}
                style={{
                  transform: heartAnimating
                    ? 'scale(1.2) rotate(-5deg)'
                    : undefined,
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
              {heartsCount}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className={`h-8 gap-1 px-2 relative overflow-hidden ${
                isActuallySaved ? 'bg-primary/10 text-primary' : ''
              }`}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                handleSave()
              }}
            >
              <BookmarkPlus
                className={`h-3 w-3 transition-all duration-300 ease-out ${
                  isActuallySaved
                    ? 'fill-current text-primary scale-110'
                    : 'scale-100'
                } ${saveAnimating ? 'animate-bounce scale-125' : ''}`}
                style={{
                  transform: saveAnimating
                    ? 'scale(1.2) rotate(-5deg)'
                    : undefined,
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                console.log('Share button clicked for id:', _id)
                onShare?.()
              }}
            >
              <Share className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
