import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Star, GitFork, FileText, Eye, Lock } from 'lucide-react'
import { getInitials } from '../lib/utils/string'
import { getRelativeTime } from '../lib/utils/date'
import type { Repo } from '../lib/data'

interface RepoCardProps {
  repo: Repo
  onClick?: () => void
  onStar?: () => void
  onFork?: () => void
  isStarred?: boolean
}

export function RepoCard({ repo, onClick, onStar, onFork, isStarred }: RepoCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    onClick?.()
  }

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Author Avatar */}
            <Avatar className="h-10 w-10 border flex-shrink-0">
              <AvatarImage src={repo.author.avatarUrl} />
              <AvatarFallback>{getInitials(repo.author.name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Author name */}
              <p className="text-sm text-muted-foreground mb-1">
                {repo.author.name}
                {repo.author.role === 'pro' && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    PRO
                  </Badge>
                )}
              </p>

              {/* Repo title */}
              <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                {repo.name}
                {repo.visibility === 'private' && (
                  <Lock className="inline-block ml-2 h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>

              {/* Description */}
              <CardDescription className="line-clamp-2">
                {repo.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Tags */}
        {repo.tags && repo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {repo.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {repo.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{repo.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats and actions */}
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>{repo.starCount}</span>
            </div>
            {/* <div className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              <span>{repo.forkCount}</span>
            </div> */}
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{repo.promptCount}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {onStar && (
              <Button
                size="sm"
                variant={isStarred ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation()
                  onStar()
                }}
              >
                <Star className={`h-4 w-4 mr-1 ${isStarred ? 'fill-current' : ''}`} />
                {isStarred ? 'Starred' : 'Star'}
              </Button>
            )}
            {onFork && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onFork()
                }}
              >
                <GitFork className="h-4 w-4 mr-1" />
                Fork
              </Button>
            )}
          </div>
        </div>

        {/* Updated timestamp */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4 pt-4 border-t">
          <Eye className="h-3 w-3" />
          <span>Updated {getRelativeTime(repo.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}