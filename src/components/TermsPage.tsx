import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeft, FileText, BookOpen, Database, Settings, Share, Cookie, Clock, Lock, UserCheck, Globe, Users, RefreshCw, Mail, LucideIcon, Shield, AlertTriangle, CreditCard, FileX, Scale, MapPin } from 'lucide-react'

interface TermsCardProps {
  icon: LucideIcon
  title: string
  color: string
  children: React.ReactNode
}

function TermsCard({ icon: Icon, title, color, children }: TermsCardProps) {
  const colorClasses = {
    primary: {
      border: 'border-l-primary/20',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    blue: {
      border: 'border-l-blue-500/20',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    green: {
      border: 'border-l-green-500/20',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    purple: {
      border: 'border-l-purple-500/20',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500'
    },
    orange: {
      border: 'border-l-orange-500/20',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500'
    },
    yellow: {
      border: 'border-l-yellow-500/20',
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-600'
    },
    indigo: {
      border: 'border-l-indigo-500/20',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-500'
    },
    red: {
      border: 'border-l-red-500/20',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500'
    },
    teal: {
      border: 'border-l-teal-500/20',
      iconBg: 'bg-teal-500/10',
      iconColor: 'text-teal-500'
    },
    cyan: {
      border: 'border-l-cyan-500/20',
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-500'
    },
    pink: {
      border: 'border-l-pink-500/20',
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-500'
    },
    gray: {
      border: 'border-l-gray-500/20',
      iconBg: 'bg-gray-500/10',
      iconColor: 'text-gray-500'
    },
    emerald: {
      border: 'border-l-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500'
    }
  }

  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary

  return (
    <Card className={`border-l-4 gap-0 ${classes.border}`} style={{
        marginBlock: "8px"
    }}>
      <CardHeader className="p-0 px-4 py-2">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className={`p-2 ${classes.iconBg} rounded-lg`}>
            <Icon className={`h-5 w-5 ${classes.iconColor}`} />
          </div>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-4 pb-2 pt-0">
        {children}
      </CardContent>
    </Card>
  )
}

interface TermsPageProps {
  onBack: () => void
}

function TermsPage({ onBack }: TermsPageProps) {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            {/* Title */}
            <div className="text-center mb-16">
                <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
                <p className="text-muted-foreground text-lg">Last updated: 11/22/2025</p>
            </div>

            {/* Terms of Service Content */}
            <div>
                {/* 1. Acceptance of Terms */}
                <TermsCard icon={FileText} title="1. Acceptance of Terms" color="primary">
                    <p className="text-muted-foreground leading-relaxed">
                        By accessing or using the Service provided by PromptsGo ("we", "us", "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.
                    </p>
                </TermsCard>

                {/* 2. Definitions */}
                <TermsCard icon={BookOpen} title="2. Definitions" color="blue">
                    <ul className="space-y-2 text-muted-foreground">
                        <li><strong className="text-foreground">"Service"</strong> refers to the PromptsGo website and related functionality (sharing, discovering, creating prompts, packs, portfolios).</li>
                        <li><strong className="text-foreground">"User" or "you"</strong> means the person or entity who uses the Service.</li>
                        <li><strong className="text-foreground">"Content"</strong> means any prompt, template, text, image, or other material you upload, create, or share on the Service.</li>
                        <li><strong className="text-foreground">"Subscription"</strong> refers to any paid access tier you purchase.</li>
                    </ul>
                </TermsCard>

                {/* 3. Use of the Service */}
                <TermsCard icon={Settings} title="3. Use of the Service" color="green">
                    <p className="text-muted-foreground leading-relaxed">
                        You agree to use the Service only for lawful purposes and in accordance with these Terms. You must provide accurate account information and keep your credentials secure. You are responsible for all activity on your account.
                    </p>
                </TermsCard>

                {/* 4. User Content */}
                <TermsCard icon={Database} title="4. User Content" color="purple">
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        You retain ownership of the Content you upload. By uploading or submitting Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, display and perform such Content in connection with the Service.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        You represent and warrant that you have all rights to submit the Content and that it does not infringe any third-party rights.
                    </p>
                </TermsCard>

                {/* 5. Restricted Conduct */}
                <TermsCard icon={AlertTriangle} title="5. Restricted Conduct" color="red">
                    <p className="text-muted-foreground mb-4">You must not:</p>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Use the Service in violation of any laws, regulations, or third-party rights.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Upload content that is defamatory, obscene, infringing, or otherwise objectionable.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Attempt to gain unauthorised access to the Service or impair the Service's security.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Share accounts, use bots or automation to circumvent usage limits.</span>
                        </li>
                    </ul>
                </TermsCard>

                {/* 6. Subscription, Packs & Payments */}
                <TermsCard icon={CreditCard} title="6. Subscription, Packs & Payments" color="orange">
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>You may use a free plan (subject to usage limits) or purchase a subscription/packs as offered.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>By purchasing a Subscription or pack, you agree to pay the then-current fees and taxes. Payments are non-refundable unless otherwise stated.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>We may change fees at any time; we will notify you in advance of significant changes.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>If payment fails, we may suspend or terminate access until payment is made.</span>
                        </li>
                    </ul>
                </TermsCard>

                {/* 7. Termination */}
                <TermsCard icon={FileX} title="7. Termination" color="yellow">
                    <p className="text-muted-foreground leading-relaxed">
                        We may suspend or terminate your account or access to the Service at any time for breach of these Terms or for convenience with notice. Upon termination, your right to use the Service ceases. We may delete or retain your Content in accordance with our retention policies.
                    </p>
                </TermsCard>

                {/* 8. Intellectual Property */}
                <TermsCard icon={Shield} title="8. Intellectual Property" color="indigo">
                    <p className="text-muted-foreground leading-relaxed">
                        All rights, title and interest in the Service (excluding your User Content) are owned by us or our licensors. You agree not to copy, modify, distribute or reverse engineer the Service except as permitted by us in writing.
                    </p>
                </TermsCard>

                {/* 9. Disclaimers & Limitation of Liability */}
                <TermsCard icon={Scale} title="9. Disclaimers & Limitation of Liability" color="teal">
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>To the fullest extent permitted by law, we disclaim all warranties (express or implied) including merchantability, fitness for a particular purpose, non-infringement.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>We will not be liable for any indirect, incidental, special, consequential or punitive damages (including loss of profits, data, goodwill) arising out of or in connection with the Service or your use thereof.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Our total liability to you for all claims will in no event exceed the fees you have paid us in the prior 12 months (or one hundred US dollars if you have paid nothing).</span>
                        </li>
                    </ul>
                </TermsCard>

                {/* 10. Indemnification */}
                <TermsCard icon={UserCheck} title="10. Indemnification" color="cyan">
                    <p className="text-muted-foreground leading-relaxed">
                        You agree to indemnify, defend and hold harmless us and our officers, directors, employees and agents from any claim, liability, damages, losses, costs or expenses (including legal fees) arising from your violation of these Terms or your User Content.
                    </p>
                </TermsCard>

                {/* 11. Governing Law & Dispute Resolution */}
                <TermsCard icon={MapPin} title="11. Governing Law & Dispute Resolution" color="pink">
                    <p className="text-muted-foreground leading-relaxed">
                        These Terms will be governed by the laws of [State/Country], without regard to conflict of law rules. Any dispute arising from or relating to these Terms or the Service will be resolved by the state or federal courts located in [Venue], and you consent to exclusive jurisdiction and venue there.
                    </p>
                </TermsCard>

                {/* 12. Changes to Terms */}
                <TermsCard icon={RefreshCw} title="12. Changes to Terms" color="gray">
                    <p className="text-muted-foreground leading-relaxed">
                        We may update these Terms from time to time. If we do so, we will post the revised date at the top and send any required notice. Your continued use of the Service after changes constitutes your acceptance.
                    </p>
                </TermsCard>

                {/* 13. Miscellaneous */}
                <TermsCard icon={FileText} title="13. Miscellaneous" color="emerald">
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>If any provision of these Terms is found invalid or unenforceable, that provision will be severed and the remainder will remain in effect.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>These Terms and any policies referenced constitute the entire agreement between you and us regarding the Service, superseding any prior agreements.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>You may not assign or transfer your rights or obligations under these Terms without our prior written consent.</span>
                        </li>
                    </ul>
                </TermsCard>

                <TermsCard icon={Mail} title="Contact Us" color="primary">
                    <p className="text-muted-foreground mb-4">If you have questions about these Terms, please contact:</p>
                    <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
                        <Mail className="h-4 w-4 text-primary" />
                        <a href="mailto:contact@promptsgo.com" className="text-primary hover:underline font-medium">contact@promptsgo.com</a>
                    </div>
                </TermsCard>
            </div>
        </div>
    )
}

export default TermsPage