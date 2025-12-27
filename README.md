# PromptsGo

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

**GitHub for AI Prompts** - Organize, version, and collaborate on AI prompts across ChatGPT, Claude, Grok, and more.

![PromptsGo Preview](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=PromptsGo+Platform+Preview)

## 🚀 Features

### Core Functionality
- **Repository Management**: Create and manage repositories for organizing your prompts
- **Prompt Creation**: Support for multiple prompt types (text, image, code, conversation, agent, chain)
- **Version Control**: Track changes and versions of your prompts
- **Collaboration**: Share repositories and prompts with the community
- **Search & Discovery**: Powerful search to find prompts by tags, categories, and content

### Social Features
- **Star Repositories**: Show appreciation for useful prompt collections
- **Heart Prompts**: Like your favorite prompts
- **Save Prompts**: Bookmark prompts for later use
- **Comments**: Discuss and provide feedback on prompts
- **User Profiles**: Showcase your prompt engineering skills

### User Management
- **Authentication**: Secure login with Supabase Auth
- **User Roles**: Free, Pro, and Admin tiers
- **Subscription Management**: Handle billing and subscription status
- **Profile Customization**: Personalize your profile with bio, avatar, and more

### Admin Features
- **Dashboard**: Comprehensive admin panel for platform management
- **User Management**: Monitor and manage user accounts
- **Content Moderation**: Review and moderate user-generated content
- **Analytics**: Track platform usage and metrics

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Supabase** - Open-source Firebase alternative
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - File storage
  - Edge functions

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Vitest** - Unit testing (planned)

## 📁 Project Structure

```
promptsgo-platform/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components (Radix-based)
│   │   ├── auth/           # Authentication components
│   │   ├── admin/          # Admin dashboard components
│   │   └── figma/          # Figma-related components
│   ├── contexts/           # React contexts for state management
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries and configurations
│   │   ├── api.ts          # API client functions
│   │   ├── supabaseClient.ts # Supabase client setup
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── styles/             # Global styles and CSS
│   └── main.tsx            # Application entry point
├── supabase/               # Database schema and migrations
│   ├── schema.sql          # Main database schema
│   └── setup_visibility.sql # Row Level Security policies
├── public/                 # Static assets
├── dist/                   # Build output (generated)
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── eslint.config.js        # ESLint configuration
└── vercel.json             # Vercel deployment configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase** account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KingCobra-dev/goprompt.git
   cd promptsgo-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**

   Run the schema in your Supabase project:
   ```bash
   # In Supabase SQL Editor, execute:
   # supabase/schema.sql
   # supabase/setup_visibility.sql
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking
```

## 🗄️ Database Schema

### Core Tables

- **users** - User profiles and authentication data
- **repos** - Prompt repositories (like GitHub repos)
- **prompts** - Individual AI prompts with metadata
- **stars** - Repository stars
- **saves** - Saved/bookmarked prompts
- **hearts** - Prompt likes
- **comments** - User comments on prompts/repos

### Key Relationships

- Users can create multiple repositories
- Repositories contain multiple prompts
- Prompts can be starred, saved, hearted, and commented on
- Prompts support versioning and forking

## 🔐 Authentication

PromptsGo uses Supabase Auth for user authentication, supporting:
- Email/password authentication
- Social logins (Google, GitHub, etc.)
- Password reset functionality
- Session management

## 🎨 UI/UX Design

- **Responsive Design**: Mobile-first approach with desktop optimizations
- **Dark/Light Mode**: Theme switching support
- **Accessibility**: WCAG compliant with Radix UI components
- **Performance**: Lazy loading, code splitting, and optimized bundles

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import `KingCobra-dev/goprompt` in Vercel dashboard
   - Framework preset: Vite (auto-detected)

2. **Environment Variables**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Deploy**
   - Automatic deployments on push to main branch
   - Preview deployments for pull requests

### Manual Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing


## 🙏 Acknowledgments

- **Supabase** for the amazing backend-as-a-service platform
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Vite** for the lightning-fast build tool
- **Lucide** for the beautiful icons

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/KingCobra-dev/goprompt/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KingCobra-dev/goprompt/discussions)
- **Email**: support@promptsgo.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic prompt and repository management
- ✅ User authentication and profiles
- ✅ Search and discovery features
- ✅ Admin dashboard


---

**Built with ❤️ for the AI community**
