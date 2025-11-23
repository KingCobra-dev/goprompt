/**
 * Mock data and constants for the PromptsGo application
 * This file contains sample data for development and testing
 */
export interface User {
  id: string
  name: string
  username: string
  role: 'general' | 'pro' | 'admin'
  avatarUrl?: string
  bio?: string
}

export interface Repo {
  id: string
  userId: string
  name: string
  slug: string
  description: string
  visibility: 'public' | 'private'
  starCount: number
  forkCount: number
  promptCount: number
  author: User
  createdAt: string
  updatedAt: string
  tags?: string[]
}

export interface Prompt {
  id: string
  repoId: string
  userId: string
  title: string
  slug: string
  description: string
  content: string
  type: 'text' | 'image' | 'code' | 'conversation'
  modelCompatibility: string[]
  tags: string[]
  category: string
  version: string
  author: User
  hearts: number
  saveCount: number
  forkCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
  visibility?: 'public' | 'private'
}

export interface Comment {
  id: string
  promptId: string
  repoId?: string
  content: string
  author: User
  hearts: number
  createdAt: string
}
export interface PromptFeedback {
  id: string
  promptId: string
  successRate: number
  rating: number
  reviewCount: number
}
// Category data
export const categories = [
  { id: 'writing', name: 'Writing', label: 'Writing', color: '#3B82F6' },
  { id: 'creative-writing', name: 'Creative Writing', label: 'Creative Writing', color: '#8B5CF6' },
  { id: 'content-creation', name: 'Content Creation', label: 'Content Creation', color: '#EC4899' },
  { id: 'coding', name: 'Coding', label: 'Coding', color: '#10B981' },
  { id: 'data-analysis', name: 'Data Analysis', label: 'Data Analysis', color: '#06B6D4' },
  { id: 'business', name: 'Business', label: 'Business', color: '#F59E0B' },
  { id: 'marketing', name: 'Marketing', label: 'Marketing', color: '#EF4444' },
  { id: 'seo', name: 'SEO', label: 'SEO', color: '#84CC16' },
  { id: 'social-media', name: 'Social Media', label: 'Social Media', color: '#F97316' },
  { id: 'sales', name: 'Sales', label: 'Sales', color: '#6366F1' },
  { id: 'customer-service', name: 'Customer Service', label: 'Customer Service', color: '#14B8A6' },
  { id: 'research', name: 'Research', label: 'Research', color: '#8B5A2B' },
  { id: 'education', name: 'Education', label: 'Education', color: '#7C3AED' },
  { id: 'teaching', name: 'Teaching', label: 'Teaching', color: '#DC2626' },
  { id: 'learning', name: 'Learning', label: 'Learning', color: '#059669' },
  { id: 'design', name: 'Design', label: 'Design', color: '#DB2777' },
  { id: 'art', name: 'Art', label: 'Art', color: '#EA580C' },
  { id: 'photography', name: 'Photography', label: 'Photography', color: '#7C2D12' },
  { id: 'video', name: 'Video', label: 'Video', color: '#C2410C' },
  { id: 'music', name: 'Music', label: 'Music', color: '#7C3AED' },
  { id: 'gaming', name: 'Gaming', label: 'Gaming', color: '#2563EB' },
  { id: 'entertainment', name: 'Entertainment', label: 'Entertainment', color: '#DC2626' },
  { id: 'health-fitness', name: 'Health & Fitness', label: 'Health & Fitness', color: '#16A34A' },
  { id: 'cooking', name: 'Cooking', label: 'Cooking', color: '#EA580C' },
  { id: 'travel', name: 'Travel', label: 'Travel', color: '#0891B2' },
  { id: 'finance', name: 'Finance', label: 'Finance', color: '#15803D' },
  { id: 'legal', name: 'Legal', label: 'Legal', color: '#1E40AF' },
  { id: 'medical', name: 'Medical', label: 'Medical', color: '#BE123C' },
  { id: 'hr', name: 'HR', label: 'HR', color: '#7C2D12' },
  { id: 'productivity', name: 'Productivity', label: 'Productivity', color: '#0D9488' },
  { id: 'personal-development', name: 'Personal Development', label: 'Personal Development', color: '#7C3AED' },
  { id: 'psychology', name: 'Psychology', label: 'Psychology', color: '#9333EA' },
  { id: 'science', name: 'Science', label: 'Science', color: '#0F766E' },
  { id: 'technology', name: 'Technology', label: 'Technology', color: '#374151' },
  { id: 'engineering', name: 'Engineering', label: 'Engineering', color: '#1F2937' },
  { id: 'mathematics', name: 'Mathematics', label: 'Mathematics', color: '#4B5563' },
  { id: 'history', name: 'History', label: 'History', color: '#6B7280' },
  { id: 'literature', name: 'Literature', label: 'Literature', color: '#9CA3AF' },
  { id: 'language-learning', name: 'Language Learning', label: 'Language Learning', color: '#D1D5DB' },
  { id: 'translation', name: 'Translation', label: 'Translation', color: '#F3F4F6' },
  { id: 'other', name: 'Other', label: 'Other', color: '#6B7280' },
]

// AI Models
export const models = [
  // OpenAI Models
  { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI GPT-4o - Latest multimodal model', provider: 'OpenAI' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'OpenAI GPT-4o Mini - Fast and efficient', provider: 'OpenAI' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'OpenAI GPT-4 Turbo with enhanced capabilities', provider: 'OpenAI' },
  { id: 'gpt-4', name: 'GPT-4', description: 'OpenAI GPT-4 - Advanced reasoning model', provider: 'OpenAI' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'OpenAI GPT-3.5 Turbo - Fast and reliable', provider: 'OpenAI' },

  // Anthropic Models
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic Claude 3.5 Sonnet - Most intelligent model', provider: 'Anthropic' },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', description: 'Anthropic Claude 3.5 Haiku - Fast and capable', provider: 'Anthropic' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Anthropic Claude 3 Opus - Powerful analysis model', provider: 'Anthropic' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Anthropic Claude 3 Sonnet - Balanced performance', provider: 'Anthropic' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Anthropic Claude 3 Haiku - Quick responses', provider: 'Anthropic' },

  // Google Models
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Google Gemini 1.5 Pro - Advanced multimodal', provider: 'Google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Google Gemini 1.5 Flash - Fast and efficient', provider: 'Google' },
  { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', description: 'Google Gemini 1.0 Pro - Powerful text generation', provider: 'Google' },
  { id: 'gemini-ultra', name: 'Gemini Ultra', description: 'Google Gemini Ultra - Most capable model', provider: 'Google' },

  // Meta Models
  { id: 'llama-3.2-90b', name: 'Llama 3.2 90B', description: 'Meta Llama 3.2 - 90 billion parameters', provider: 'Meta' },
  { id: 'llama-3.2-11b', name: 'Llama 3.2 11B', description: 'Meta Llama 3.2 - 11 billion parameters', provider: 'Meta' },
  { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', description: 'Meta Llama 3.1 - 405 billion parameters', provider: 'Meta' },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', description: 'Meta Llama 3.1 - 70 billion parameters', provider: 'Meta' },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', description: 'Meta Llama 3.1 - 8 billion parameters', provider: 'Meta' },

  // Mistral Models
  { id: 'mistral-large', name: 'Mistral Large', description: 'Mistral Large - Advanced reasoning capabilities', provider: 'Mistral' },
  { id: 'mistral-medium', name: 'Mistral Medium', description: 'Mistral Medium - Balanced performance', provider: 'Mistral' },
  { id: 'mistral-small', name: 'Mistral Small', description: 'Mistral Small - Fast and efficient', provider: 'Mistral' },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', description: 'Mistral Mixtral - Mixture of experts model', provider: 'Mistral' },

  // Other Providers
  { id: 'groq-mixtral', name: 'Groq Mixtral', description: 'Groq-hosted Mixtral - Ultra-fast inference', provider: 'Groq' },
  { id: 'together-llama', name: 'Together Llama', description: 'Together.ai hosted Llama models', provider: 'Together' },
  { id: 'replicate-flux', name: 'Replicate Flux', description: 'Replicate-hosted Flux image models', provider: 'Replicate' },
  { id: 'huggingface-zephyr', name: 'HuggingFace Zephyr', description: 'HuggingFace Zephyr - Open-source chat model', provider: 'HuggingFace' },

  // Image Generation Models
  { id: 'dall-e-3', name: 'DALL-E 3', description: 'OpenAI DALL-E 3 - Advanced image generation', provider: 'OpenAI' },
  { id: 'dall-e-2', name: 'DALL-E 2', description: 'OpenAI DALL-E 2 - High-quality images', provider: 'OpenAI' },
  { id: 'midjourney-v6', name: 'Midjourney V6', description: 'Midjourney V6 - Artistic image generation', provider: 'Midjourney' },
  { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', description: 'Stability AI SDXL - Open-source image generation', provider: 'Stability AI' },
  { id: 'flux-dev', name: 'Flux Dev', description: 'Black Forest Labs Flux - Advanced image generation', provider: 'Black Forest Labs' },
]

// Prompt types
export const promptTypes = [
  { id: 'text', name: 'Text', description: 'Text-based prompt' },
  { id: 'image', name: 'Image', description: 'Image generation prompt' },
  { id: 'code', name: 'Code', description: 'Code generation prompt' },
  { id: 'conversation', name: 'Conversation', description: 'Conversation prompt' },
]

// Popular tags
export const popularTags = [
  { id: 'tag1', name: 'productivity' },
  { id: 'tag2', name: 'writing' },
  { id: 'tag3', name: 'brainstorming' },
  { id: 'tag4', name: 'creative' },
  { id: 'tag5', name: 'technical' },
  { id: 'tag6', name: 'business' },
  { id: 'tag7', name: 'marketing' },
  { id: 'tag8', name: 'education' },
]

// Mock users
export const users: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    username: 'sarahj',
    role: 'pro',
    bio: 'Prompt engineer & AI enthusiast',
  },
  {
      id: 'user-2',
    name: 'John Doe',
    username: 'johnd',
    role: 'general',
    bio: 'Learning prompt engineering',
  },
  {
     id: 'user-3',
    name: 'Alex Chen',
    username: 'alexc',
    role: 'pro',
    bio: 'Building AI tools',
  },
]

// Mock repositories
export const repos: Repo[] = [
  {
    id: 'repo-1',
    userId: 'user-1',
    name: 'Professional Writing Prompts',
    slug: 'Professional Writing Prompts',
    description: 'A collection of professional writing prompts for business emails, reports, and documentation',
    visibility: 'public',
    starCount: 450,
    forkCount: 89,
    promptCount: 12,
    author: users[0],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    tags: ['writing', 'business', 'professional'],
  },
  {
     id: 'repo-2',
    userId: 'user-1',
    name: 'Code Generation Toolkit',
    slug: 'Code Generation Toolkit',
    description: 'Essential prompts for generating clean, efficient code in multiple languages',
    visibility: 'public',
    starCount: 823,
    forkCount: 156,
    promptCount: 25,
    author: users[0],
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-22T11:45:00Z',
    tags: ['coding', 'development', 'technical'],
  },
  {
    id: 'repo-3',
    userId: 'user-3',
    name: 'Marketing Copy Assistant',
    slug: 'Marketing Copy Assistant',
    description: 'Create compelling marketing copy, ad headlines, and social media content',
    visibility: 'public',
    starCount: 621,
    forkCount: 102,
    promptCount: 18,
    author: users[2],
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-21T09:15:00Z',
    tags: ['marketing', 'copywriting', 'business'],
  },
  {
    id: 'repo-4',
    userId: 'user-3',
    name: 'AI Research Helper',
    slug: 'AI Research Helper',
    description: 'Research prompts for academic papers, literature reviews, and data analysis',
    visibility: 'public',
    starCount: 392,
    forkCount: 67,
    promptCount: 15,
    author: users[2],
    createdAt: '2024-01-08T11:30:00Z',
    updatedAt: '2024-01-19T16:20:00Z',
    tags: ['research', 'education', 'academic'],
  },
  {
    id: 'repo-5',
    userId: 'user-2',
    name: 'My First Prompt Collection',
    slug: 'My First Prompt Collection',
    description: 'Learning prompt engineering - a beginner\'s collection',
    visibility: 'public',
    starCount: 45,
    forkCount: 8,
    promptCount: 5,
    author: users[1],
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-23T10:00:00Z',
    tags: ['learning', 'beginner'],
  },
]
// Mock prompts data
export const prompts: Prompt[] = [
  {
    id: 'prompt-1',
    repoId: 'repo-1',
    userId: 'user-1',
    title: 'Professional Email Writer',
    slug: 'Professional Email Writer',
    description: 'Write professional emails for any situation',
    content: 'You are an expert email writer. Write a professional email for the following situation: [SITUATION]',
    type: 'text',
    modelCompatibility: ['gpt4', 'gpt35', 'claude3'],
    category: 'writing',
    tags: ['email', 'professional', 'writing'],
    version: '1.0.0',
    author: users[0],
    hearts: 250,
    saveCount: 150,
    forkCount: 45,
    commentCount: 23,
    viewCount: 1250,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'prompt-2',
    repoId: 'repo-2',
    userId: 'user-1',
    title: 'Clean Code Generator',
    slug: 'Clean Code Generator',
    description: 'Generate clean, maintainable code following best practices',
    content: 'You are an expert software engineer. Write clean, well-documented code for: [TASK]',
    type: 'code',
    modelCompatibility: ['gpt4', 'claude3'],
    category: 'coding',
    tags: ['code', 'clean-code', 'programming'],
    version: '1.2.0',
    author: users[0],
    hearts: 412,
    saveCount: 289,
    forkCount: 67,
    commentCount: 45,
    viewCount: 2100,
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-18T09:15:00Z',
  },
  {
    id: 'prompt-3',
    repoId: 'repo-3',
    userId: 'user-3',
    title: 'Ad Headline Generator',
    slug: 'Ad Headline Generator',
    description: 'Create attention-grabbing headlines for advertisements',
    content: 'You are a creative copywriter. Generate 10 compelling ad headlines for: [PRODUCT/SERVICE]',
    type: 'text',
    modelCompatibility: ['gpt4', 'gpt35', 'claude3', 'gemini'],
    category: 'marketing',
    tags: ['marketing', 'advertising', 'copywriting'],
    version: '1.1.0',
    author: users[2],
    hearts: 324,
    saveCount: 198,
    forkCount: 52,
    commentCount: 31,
    viewCount: 1680,
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-20T11:30:00Z',
  },
]
// Mock comments data
export const comments: Comment[] = [
  {
    id: 'comment-1',
    promptId: 'prompt-1',
    repoId: 'repo-1',
    content: 'This prompt works great! I use it daily for client emails.',
    author: users[1],
    hearts: 5,
    createdAt: '2024-01-16T09:15:00Z',
  },
  {
    id: 'comment-2',
    promptId: 'prompt-2',
    repoId: 'repo-2',
    content: 'Excellent for generating boilerplate code. Saves me hours!',
    author: users[2],
    hearts: 12,
    createdAt: '2024-01-17T14:30:00Z',
  },
]
// Mock prompt feedbacks data
export const promptFeedbacks: PromptFeedback[] = []