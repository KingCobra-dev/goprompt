interface FooterProps {
  onGetStarted?: () => void
  onNavigateToAbout?: () => void
  onNavigateToTerms?: () => void
  onNavigateToPrivacy?: () => void
  onNavigateToTeam?: () => void
}

export function Footer({
  onNavigateToAbout,
  onNavigateToTerms,
  onNavigateToPrivacy,
  onNavigateToTeam,
}: FooterProps) {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900/50 py-16 mt-12 mb-[20px]">
      <div className="container mx-auto px-4">
        {/* Subtle separator line */}
        <div className="border-t border-border/10 mb-12"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Branding */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-lg">
                  P
                </span>
              </div>
              <span className="font-bold text-2xl">PromptsGo</span>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Building the future of prompt engineering — where creativity meets
              collaboration for AI professionals worldwide.
            </p>
          </div>

          {/* Right Side - Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 text-sm">
            {/* Company */}
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <button
                    onClick={onNavigateToAbout}
                    className="hover:text-accent active:text-accent transition-colors"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateToTeam}
                    className="hover:text-accent active:text-accent transition-colors"
                  >
                    Our Team
                  </button>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent active:text-accent transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent active:text-accent transition-colors"
                  >
                    Twitter
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Support */}
            <div>
              <h3 className="font-semibold mb-3">Legal & Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <button
                    onClick={onNavigateToTerms}
                    className="hover:text-accent active:text-accent transition-colors"
                  >
                    Terms
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateToPrivacy}
                    className="hover:text-accent active:text-accent transition-colors"
                  >
                    Privacy
                  </button>
                </li>
                <li>
                  <a
                    href="mailto:support@promptsgo.com"
                    className="hover:text-accent active:text-accent transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-accent active:text-accent transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent active:text-accent transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent active:text-accent transition-colors"
                  >
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
