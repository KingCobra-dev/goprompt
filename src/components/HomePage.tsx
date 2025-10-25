import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { SubscriptionBadge } from './ui/SubscriptionBadge'
import { useApp } from '../contexts/AppContext'
import { ArrowRight, GitFork, Star, User, Package, Crown } from 'lucide-react'
import { getSaveLimit } from '../lib/limits'

interface HomePageProps {
  onGetStarted: () => void
  onExplore: () => void
  onPromptClick: (promptId: string) => void
}

export function HomePage({ onGetStarted, onExplore }: HomePageProps) {
  const { state } = useApp()

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6"></div>

          <h1 className="text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Share, Discover, and Showcase the Best AI Prompts
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            PromptsGo is the professional home for prompt engineers,
            freelancers, and AI enthusiasts. Organize your prompts, collaborate
            with the community, and showcase your expertise in client-ready
            portfolios.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button size="lg" onClick={onExplore} className="text-lg px-8">
              Explore Prompts
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onGetStarted}
              className="text-lg px-8"
            >
              Create Free Account
            </Button>
          </div>

          {/* Role Status */}
          {state.user && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <SubscriptionBadge
                role={state.user.role || 'general'}
                subscriptionStatus={state.user.subscriptionStatus}
              />
              {(state.user.role || 'general') === 'general' && (
                <Badge variant="secondary">Free Plan</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {getSaveLimit(state.user) === 'unlimited'
                  ? 'Unlimited saves'
                  : `${state.user.saveCount}/${getSaveLimit(state.user)} saves used`}
              </span>
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join a growing community of AI professionals sharing their best
            work.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="pt-0 pb-12 md:pb-16 ">
        <div className="text-center mb-12">
          <h2 className="text-3xl mb-4">Professional Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to showcase your AI expertise and grow your
            business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fork & Remix */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <GitFork className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg mb-2">Fork & Remix</h3>
            <p className="text-sm text-muted-foreground">
              Improve prompts with full attribution and version control
            </p>
          </div>

          {/* Save & Share */}
          <div className="bg-card p-6 rounded-lg border relative">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg mb-2">Unlimited Saves & Collections</h3>
            <p className="text-sm text-muted-foreground">
              Keep unlimited personal libraries of favorites and share
              collections with clients
            </p>
          </div>

          {/* Profiles & Portfolios */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg mb-2">Profiles & Portfolios</h3>
            <p className="text-sm text-muted-foreground">
              Build your reputation and showcase your work professionally
            </p>
          </div>

          {/* Curated Packs */}
          <div className="bg-card p-6 rounded-lg border relative">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg mb-2">Prompt Packs</h3>
            <p className="text-sm text-muted-foreground">
              Create and sell curated prompt packs as a Pro user
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
