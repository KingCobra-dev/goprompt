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
  { id: 'coding', name: 'Coding', label: 'Coding', color: '#10B981' },
  { id: 'business', name: 'Business', label: 'Business', color: '#F59E0B' },
  { id: 'marketing', name: 'Marketing', label: 'Marketing', color: '#EC4899' },
  { id: 'research', name: 'Research', label: 'Research', color: '#8B5CF6' },
  { id: 'education', name: 'Education', label: 'Education', color: '#14B8A6' },
]

// AI Models
export const models = [
  { id: 'gpt4', name: 'GPT-4', description: 'OpenAI GPT-4' },
  { id: 'gpt35', name: 'GPT-3.5', description: 'OpenAI GPT-3.5 Turbo' },
  { id: 'claude3', name: 'Claude 3.5 Sonnet', description: 'Anthropic Claude' },
  { id: 'gemini', name: 'Gemini Pro', description: 'Google Gemini' },
  { id: 'mistral', name: 'Mistral', description: 'Mistral AI' },
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
    slug: 'professional-writing-prompts',
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
    slug: 'code-generation-toolkit',
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
    slug: 'marketing-copy-assistant',
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
    slug: 'ai-research-helper',
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
    slug: 'my-first-prompt-collection',
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
    slug: 'professional-email-writer',
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
    slug: 'clean-code-generator',
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
    slug: 'ad-headline-generator',
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