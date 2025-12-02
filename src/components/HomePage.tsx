import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ArrowRight, GitFork, Star, User, Package, Crown, Lock, Search, Eye, BarChart3, RefreshCw } from 'lucide-react'
import { useResponsivePadding } from '@/hooks/src/hooks/useIsDesktop'

interface HomePageProps {
  user?: {
    name: string
    username: string
    role?: 'general' | 'pro' | 'admin'
    subscriptionStatus?: 'active' | 'cancelled' | 'past_due'
  } | null
  onGetStarted: () => void
  onCreateRepo: () => void
  onExplorePrompts: () => void
  onPromptClick: (promptId: string) => void
}

export function HomePage({ user, onGetStarted, onCreateRepo, onExplorePrompts }: HomePageProps) {
  const { containerPadding, sectionTopPadding } = useResponsivePadding()

  return (
    <div className={`container mx-auto ${containerPadding}`}>
      {/* Hero Section */}
      <section className={`relative ${sectionTopPadding} bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl mx-4 animate-in fade-in duration-1000`}>
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6"></div>

          
 <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.05]">
                GitHub for Your
                <br />
                <span className="text-primary">
                  AI Prompts
                </span>
              </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stop losing your best prompts. Organize, version, and collaborate on AI prompts across ChatGPT, Claude, Grok, and more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button size="lg" onClick={onExplorePrompts} className="text-lg px-8">
              Explore Prompts
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={user ? onCreateRepo : onGetStarted}
              className="text-lg px-8"
            >
              {user ? 'Create Repo' : 'Create Free Account'}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-2 max-w-2xl mx-auto">
            Join a growing community of AI professionals sharing their best
            work.
          </p>
        </div>
      </section>

      {/* Problems Section */}
      <section className="pt-16 md:pt-20 pb-12 md:pb-16 bg-gradient-to-r from-red-50/50 to-blue-50/50 dark:from-red-950/10 dark:to-blue-950/10 rounded-2xl mx-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your AI Conversations Deserve Better</h2>
          <p className="text-xl text-amber-600 dark:text-amber-300 max-w-3xl mx-auto">
            Stop wrestling with scattered prompts and lost conversations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:bg-red-200 dark:hover:bg-red-900/70">
                <Search className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold">Scattered Everywhere</h3>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Your best prompts are lost across ChatGPT, Claude, Grok, and random text files
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-950/50 rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:bg-purple-200 dark:hover:bg-purple-900/70">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">Can't Remember What Worked</h3>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400">
              That perfect prompt from last month? Gone forever. No version history, no backups.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-950/50 rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:bg-blue-200 dark:hover:bg-blue-900/70">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">Learning in Isolation</h3>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400">
              No way to learn from top prompt engineers or collaborate with your team.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-950/50 rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:bg-purple-200 dark:hover:bg-purple-900/70">
                <RefreshCw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">Manual Chaos</h3>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Copy-pasting between apps, no organization system
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Build Your Prompt Library Like a Pro</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to organize, iterate, and share your AI prompts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Organize Everything */}
          <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">Organize Everything</h3>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
              Create repos for different use cases. Marketing, coding, research - keep everything organized and accessible in one beautiful interface.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Smart Tags • Auto-categorize</p>
          </div>

          {/* Version Control */}
          <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-950/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <GitFork className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">Version Control</h3>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
              Track every change, revert to old versions, and see exactly what works. Git-style versioning for your prompts.
            </p>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div>• Commit messages</div>
              <div>• Diff viewing</div>
              <div>• Branch & merge</div>
            </div>
          </div>

          {/* Fork & Remix */}
          <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-950/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold">Fork & Remix</h3>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
              Start with community templates and customize them
            </p>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div>• One-click fork</div>
              <div>• Attribution</div>
            </div>
          </div>

          {/* Discover */}
          <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">Discover</h3>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
              Explore trending prompts from top creators
            </p>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div>• Trending</div>
              <div>• Search</div>
            </div>
          </div>

          {/* Go Private */}
          <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Pro Feature
              </Badge>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-950/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold">Go Private</h3>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Keep client work confidential with private repos and password protection
            </p>
          </div>

          {/* Analytics */}
          <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Pro Feature
              </Badge>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-950/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold">Analytics</h3>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400">
              See who's using your prompts and track popularity over time
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
