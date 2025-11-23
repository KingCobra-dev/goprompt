import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeft, FileText, BookOpen, Database, Settings, Share, Cookie, Clock, Lock, UserCheck, Globe, Users, RefreshCw, Mail, LucideIcon } from 'lucide-react'

interface PrivacyCardProps {
  icon: LucideIcon
  title: string
  color: string
  children: React.ReactNode
}

function PrivacyCard({ icon: Icon, title, color, children }: PrivacyCardProps) {
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

interface PrivacyPageProps {
  onBack: () => void
}function PrivacyPage({ onBack }: PrivacyPageProps) {
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
                <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
                <p className="text-muted-foreground text-lg">Last updated: 11/22/2025</p>
            </div>

            {/* Privacy Policy Content */}
            <div>
                {/* 1. Introduction */}
                <PrivacyCard icon={FileText} title="1. Introduction" color="primary">
                    <p className="text-muted-foreground leading-relaxed">
                        Welcome to PromptsGo ("we", "us", "our"). This Privacy Policy explains how we collect, use, disclose, and protect personal information when you access or use our website <a href="https://promptsgo.com" className="text-primary hover:underline font-medium">https://promptsgo.com</a> and associated services (collectively, the "Service"). By using the Service, you consent to the practices described in this policy.
                    </p>
                </PrivacyCard>

                {/* 2. Definitions */}
                <PrivacyCard icon={BookOpen} title="2. Definitions" color="blue">
                    <ul className="space-y-2 text-muted-foreground">
                        <li><strong className="text-foreground">Account</strong> means your registered user account on the Service.</li>
                        <li><strong className="text-foreground">Personal Information</strong> means information that identifies or can reasonably identify an individual.</li>
                        <li><strong className="text-foreground">Usage Data</strong> means data automatically collected when using the Service (e.g., IP address, browser type, pages visited).</li>
                        <li><strong className="text-foreground">Service Provider</strong> means any third-party that processes data on our behalf.</li>
                    </ul>
                </PrivacyCard>

                {/* 3. Information We Collect */}
                <PrivacyCard icon={Database} title="3. Information We Collect" color="green">
                    <p className="text-muted-foreground mb-4">We may collect the following types of information:</p>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span><strong className="text-foreground">Personal Information</strong> you provide directly: e.g., name, email address, username, payment information, profile information when you register or update your account.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span><strong className="text-foreground">Usage Data</strong>: automatically collected when you use the Service, such as your IP address, browser, device type, pages you visit, date/time stamps, cookies and similar technologies.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span><strong className="text-foreground">Content</strong> you create, upload or share via the Service: prompts you author, comments, saves, forks, and other user-generated content.</span>
                        </li>
                    </ul>
                </PrivacyCard>

                {/* 4. How We Use Your Information */}
                <PrivacyCard icon={Settings} title="4. How We Use Your Information" color="purple">
                    <p className="text-muted-foreground mb-4">We use your information to:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            "Provide, operate, maintain and improve the Service",
                            "Manage your account, authenticate and verify you",
                            "Process payments, subscriptions, packs purchases, and handle billing",
                            "Communicate with you (support, updates, marketing where permitted)",
                            "Personalize the Service (e.g., prompt recommendations)",
                            "Monitor and analyze usage and performance of the Service",
                            "Comply with legal obligations and prevent fraud or misuse"
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                                <span className="text-sm text-muted-foreground">{item}</span>
                            </div>
                        ))}
                    </div>
                </PrivacyCard>

                {/* 5. Disclosure of Your Information */}
                <PrivacyCard icon={Share} title="5. Disclosure of Your Information" color="orange">
                    <p className="text-muted-foreground mb-4">We may share your information in the following circumstances:</p>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>With <strong className="text-foreground">Service Providers</strong> who assist us in providing the Service (hosting, payment processors, analytics).</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>With your <strong className="text-foreground">consent</strong> (e.g., when you choose to share your profile or prompts publicly).</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>For <strong className="text-foreground">legal reasons</strong> — to comply with laws or respond to lawful requests by public authorities.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>In connection with a <strong className="text-foreground">business transaction</strong> (e.g., merger, sale, asset transfer) — we will notify you and apply appropriate safeguards.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span><strong className="text-foreground">Aggregated or anonymized</strong> information may be shared publicly or with third parties without limitation.</span>
                        </li>
                    </ul>
                </PrivacyCard>

                {/* 6. Cookies and Tracking Technologies */}
                <PrivacyCard icon={Cookie} title="6. Cookies and Tracking Technologies" color="yellow">
                    <p className="text-muted-foreground leading-relaxed">
                        We use cookies and similar tracking technologies to collect usage data, store preferences, and support core functionality. You may choose to disable cookies in your browser, but doing so may impair some features of the Service.
                    </p>
                </PrivacyCard>

                {/* 7. Data Retention */}
                <PrivacyCard icon={Clock} title="7. Data Retention" color="indigo">
                    <p className="text-muted-foreground leading-relaxed">
                        We retain your Personal Information for as long as your account is active or as needed to provide the Service. We may keep Usage Data and other information for analytics and internal purposes for a longer period, subject to applicable law. When you delete your account, certain information may persist in backup archives or anonymised form.
                    </p>
                </PrivacyCard>

                {/* 8. Security of Your Information */}
                <PrivacyCard icon={Lock} title="8. Security of Your Information" color="red">
                    <p className="text-muted-foreground leading-relaxed">
                        We implement reasonable technical and organisational measures (encryption, access controls, secure infrastructure) to protect your information. However, no system is fully secure; we cannot guarantee absolute security.
                    </p>
                </PrivacyCard>

                {/* 9. Your Rights */}
                <PrivacyCard icon={UserCheck} title="9. Your Rights" color="teal">
                    <p className="text-muted-foreground leading-relaxed">
                        Depending on your jurisdiction, you may have rights including: access to your Personal Information, correction, deletion, portability, restricting processing, or withdrawing consent. To exercise your rights, please contact us at <a href="mailto:contact@promptsgo.com" className="text-primary hover:underline font-medium">contact@promptsgo.com</a>.
                    </p>
                </PrivacyCard>

                {/* 10. International Transfers */}
                <PrivacyCard icon={Globe} title="10. International Transfers" color="cyan">
                    <p className="text-muted-foreground leading-relaxed">
                        Our servers and service providers may be located in multiple countries. By using the Service, you consent to transfer of your information to countries whose data protection laws may differ from your own.
                    </p>
                </PrivacyCard>

                {/* 11. Children's Privacy */}
                <PrivacyCard icon={Users} title="11. Children's Privacy" color="pink">
                    <p className="text-muted-foreground leading-relaxed">
                        The Service is not intended for children under 13. If you are a parent or guardian and believe your child has provided us with Personal Information, please contact us and we will take steps to delete such information.
                    </p>
                </PrivacyCard>

                {/* 12. Changes to This Policy */}
                <PrivacyCard icon={RefreshCw} title="12. Changes to This Policy" color="gray">
                    <p className="text-muted-foreground leading-relaxed">
                        We may update this Privacy Policy from time to time. When we do, we will post the updated date at the top. Your continued use of the Service after changes constitutes your acceptance of the updated policy.
                    </p>
                </PrivacyCard>

                <PrivacyCard icon={Mail} title="13. Contact Us" color="emerald">
                    <p className="text-muted-foreground mb-4">If you have questions about this policy, please contact:</p>
                    <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
                        <Mail className="h-4 w-4 text-emerald-500" />
                        <a href="mailto:contact@promptsgo.com" className="text-primary hover:underline font-medium">contact@promptsgo.com</a>
                    </div>
                </PrivacyCard>
            </div>
        </div>
    )
}

export default PrivacyPage