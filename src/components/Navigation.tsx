import { useState } from 'react'
import supabase from '../lib/supabaseClient'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  
} from './ui/dropdown-menu'


import { ThemeToggle } from './ui/ThemeToggle'
import {
  Search,
  Plus,
  Menu,
  User,
  Settings,
  Home,
  Compass,
  BookmarkPlus,
  Package,
} from 'lucide-react'

interface NavigationProps {
  user?: {
    name: string
    username: string
     reputation?: number
    role?: 'general' | 'pro' | 'admin'
    subscriptionStatus?: 'active' | 'cancelled' | 'past_due'
  } | null
  onAuthClick: () => void
  onProfileClick?: () => void
  onCreateClick?: () => void
  onExploreClick?: (searchQuery?: string) => void
  onReposClick?: () => void
  onHomeClick?: () => void
  onSavedClick?: () => void
  onSettingsClick?: () => void
  onMyRepoClick?: () => void
}

export function Navigation({
  user,
  onAuthClick,
  onProfileClick,
  onCreateClick,
  onExploreClick,
  onReposClick,
  onHomeClick,
  onSavedClick,
  onSettingsClick,
  onMyRepoClick,
}: NavigationProps) {
  

  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-0 h-auto hover:bg-transparent hover:text-muted-foreground cursor-pointer transition-colors"
              onClick={onHomeClick}
            >
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  P
                </span>
              </div>
              <span className="font-bold text-xl">PromptsGo</span>
            </Button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button
                variant="ghost"
                className="flex items-center gap-2 nav-button group"
                onClick={onHomeClick}
              >
                <Home className="h-4 w-4 group-hover:text-accent" />
                Home
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2 nav-button group"
                onClick={() => onExploreClick?.()}
              >
                <Compass className="h-4 w-4 group-hover:text-accent" />
                Discover Repos
              </Button>
              {user && (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 nav-button group"
                  onClick={onReposClick}
                >
                  <Package className="h-4 w-4 group-hover:text-accent" />
                  Explore Prompts
                </Button>
              )}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts, creators, tags..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    // Navigate to explore page when Enter is pressed
                    onExploreClick?.(searchQuery.trim())
                  }
                }}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      onExploreClick?.(searchQuery.trim())
                    }
                  }}
                >
                  <Search className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <>
  

                {/* Create Button */}
                <Button
                  className="flex items-center gap-2"
                  onClick={onCreateClick}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create</span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 p-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                        {getInitials(user.name)}
                      </div>
                      <div className="hidden md:block text-left">
                       <div className="text-sm font-medium">
                          {user.name}
                         
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.reputation} rep
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2">
               <div className="font-medium">
                        {user.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @{user.username}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.reputation} reputation points
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onProfileClick}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSavedClick}>
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                      Saved Prompts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onMyRepoClick}>
                      <Package className="mr-2 h-4 w-4" />
                      My Repo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSettingsClick}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await supabase.auth.signOut()
                        } catch (e) {
                          console.warn('Sign out failed', e)
                        }
                      }}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={onAuthClick}>
                  Sign In
                </Button>
                <Button onClick={onAuthClick}>Get Started</Button>
              </>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                className="justify-start nav-button group"
                onClick={onHomeClick}
              >
                <Home className="mr-2 h-4 w-4 group-hover:text-accent" />
                Home
              </Button>
              <Button
                variant="ghost"
                className="justify-start nav-button group"
                onClick={() => onExploreClick?.()}
              >
                <Compass className="mr-2 h-4 w-4 group-hover:text-accent" />
                Discover Repos
              </Button>
             
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
