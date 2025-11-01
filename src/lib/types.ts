/**
 * Type definitions for the PromptsGo application
 * Legacy types that some components still reference
 */

import type {
  Prompt as PromptData,
  User as BaseUser,
  Repo,
  Comment,
  PromptFeedback,
} from './data'

// Re-export types from data.ts for backward compatibility
export type { Repo, Comment, PromptFeedback }

// Local lightweight social/collection types used by context/UI
export interface Heart {
  userId: string
  promptId: string
  createdAt: string
}
export interface Save {
  userId: string
  promptId: string
  collectionId?: string
  createdAt: string
}
export interface Follow {
  followerId: string
  followingId: string
  createdAt: string
}
export interface Collection {
  id: string
  userId: string
  name: string
  description?: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  data?: any
  createdAt: string
}
// Extend base User with optional fields used in UI
export interface User extends BaseUser {
  email?: string
  website?: string
  github?: string
  twitter?: string
  reputation?: number
  badges?: string[]
  skills?: string[]
  createdAt?: string
  lastLogin?: string
  subscriptionStatus?: 'active' | 'cancelled' | 'past_due'
  saveCount?: number
}
// Convenience alias for user role
export type UserRole = User['role']
// Legacy Prompt type for components that haven't been fully migrated
export interface Prompt extends Omit<PromptData, 'author' | 'type'> {
  author: User
  type: 'text' | 'image' | 'code' | 'conversation' | 'agent' | 'chain'
  // UI flags
  isHearted?: boolean
  isSaved?: boolean
  isForked?: boolean
  // Additional optional fields referenced in components
  visibility?: 'public' | 'private'
  attachments?: any[]
  images?: PromptImage[]
  parentId?: string
  template?: string
  successRate?: number
  successVotesCount?: number
  language?: string
}
// Image types
export interface PromptImage {
  id: string
  url: string
  alt?: string
  altText?: string
  caption?: string
  isPrimary?: boolean
  size?: number
  width?: number
  height?: number
  mimeType?: string
}
// Search filters used in context
export interface SearchFilters {
  query: string
  types: string[]
  models: string[]
  tags: string[]
  categories: string[]
  sortBy: 'trending' | 'recent' | 'stars' | string
}
// Draft types for create/edit forms
export interface Draft {
  id: string
  userId: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  type: 'text' | 'image' | 'code' | 'agent' | 'chain' | 'conversation'
  modelCompatibility: string[]
  visibility?: 'public' | 'private' | 'unlisted'
  images?: PromptImage[]
  metadata?: {
    category?: string
    visibility?: 'public' | 'private' | 'unlisted'
    selectedModels?: string[]
    tags?: string[]
    images?: PromptImage[]
    metaDescription?: string
  }
  lastSaved?: string
}