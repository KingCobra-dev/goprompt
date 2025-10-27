import React, { createContext, useContext, useReducer, useEffect } from 'react'
import {
  User,
  UserRole,
  Prompt,
  Comment,
  Heart,
  Save,
  Follow,
  Collection,
  Notification,
  Draft,
  SearchFilters,
  
  PromptFeedback,

} from '../lib/types'
import { prompts, comments, promptFeedbacks } from '../lib/data'
import supabase from '../lib/supabaseClient'

interface AppState {
  user: User | null
  prompts: Prompt[]
  comments: Comment[]
  hearts: Heart[]
  saves: Save[]
  follows: Follow[]
  collections: Collection[]
  notifications: Notification[]
  drafts: Draft[]
  searchFilters: SearchFilters
  
  promptFeedbacks: PromptFeedback[]
  
  theme: 'light' | 'dark'
  loading: boolean
  error: string | null
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_PROMPTS'; payload: Prompt[] }
  | { type: 'ADD_PROMPT'; payload: Prompt }
  | { type: 'UPDATE_PROMPT'; payload: { id: string; updates: Partial<Prompt> } }
  | { type: 'DELETE_PROMPT'; payload: string }
  | { type: 'HEART_PROMPT'; payload: { promptId: string } }
  | { type: 'UNHEART_PROMPT'; payload: { promptId: string } }
  | { type: 'SAVE_PROMPT'; payload: { promptId: string; collectionId?: string } }
  | { type: 'UNSAVE_PROMPT'; payload: string }
  | { type: 'FORK_PROMPT'; payload: { originalId: string; newPrompt: Prompt } }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'UPDATE_COMMENT'; payload: { id: string; content: string } }
  | { type: 'DELETE_COMMENT'; payload: string }
  | { type: 'FOLLOW_USER'; payload: string }
  | { type: 'UNFOLLOW_USER'; payload: string }
  | { type: 'ADD_COLLECTION'; payload: Collection }
  | { type: 'UPDATE_COLLECTION'; payload: { id: string; updates: Partial<Collection> } }
  | { type: 'DELETE_COLLECTION'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SAVE_DRAFT'; payload: Draft }
  | { type: 'DELETE_DRAFT'; payload: string }
  | { type: 'SET_SEARCH_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  
  | { type: 'ADD_PROMPT_FEEDBACK'; payload: PromptFeedback }
 
const initialState: AppState = {
  user: null,
  prompts: prompts,
  comments: comments,
  hearts: [],
  saves: [],
  follows: [],
  collections: [],
  notifications: [],
  drafts: [],
  searchFilters: {
    query: '',
    types: [],
    models: [],
    tags: [],
    categories: [],
    sortBy: 'trending',
  },
 
  promptFeedbacks: promptFeedbacks,
  
  theme: 'light',
  loading: false,
  error: null,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }

    case 'SET_PROMPTS':
      return { ...state, prompts: action.payload }

    case 'ADD_PROMPT':
      return { ...state, prompts: [action.payload, ...state.prompts] }

    case 'UPDATE_PROMPT':
      return {
        ...state,
        prompts: state.prompts.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      }

    case 'DELETE_PROMPT':
      return {
        ...state,
        prompts: state.prompts.filter(p => p.id !== action.payload),
      }

    case 'HEART_PROMPT': {
      const { promptId } = action.payload
      if (!state.user) return state

      // Check if already hearted
      const existingHeart = state.hearts.find(
        h => h.userId === state.user!.id && h.promptId === promptId
      )
      if (existingHeart) return state
      const newHeart: Heart = {
        userId: state.user.id,
        promptId,
        createdAt: new Date().toISOString(),
      }

      const updatedPrompts = state.prompts.map(p =>
      p.id === promptId ? { ...p, hearts: p.hearts + 1, isHearted: true } : p 
      )

       return { ...state, hearts: [...state.hearts, newHeart], prompts: updatedPrompts }
    }

    case 'UNHEART_PROMPT': {
      const { promptId } = action.payload
      if (!state.user) return state

      const updatedHearts = state.hearts.filter(
        h => !(h.userId === state.user!.id && h.promptId === promptId)
      )

      const updatedPrompts = state.prompts.map(p =>
      p.id === promptId ? { ...p, hearts: Math.max(0, p.hearts - 1), isHearted: false } : p 
      )

       return { ...state, hearts: updatedHearts, prompts: updatedPrompts }
    }

    case 'SAVE_PROMPT': {
      const { promptId, collectionId } = action.payload
      if (!state.user) return state

     const existingSave = state.saves.find(s => s.userId === state.user!.id && s.promptId === promptId)

      if (existingSave) return state

      const newSave: Save = {
        userId: state.user.id,
        promptId,
        collectionId,
        createdAt: new Date().toISOString(),
      }

      const updatedPrompts = state.prompts.map(p =>
        p.id === promptId ? { ...p, saveCount: p.saveCount + 1, isSaved: true } : p  
      )

      // Create notification for prompt author if they're not the one saving
      const savedPrompt = state.prompts.find(p => p.id === promptId)
      let newNotifications = state.notifications

      if (savedPrompt && savedPrompt.userId !== state.user.id) {
        const notification: Notification = {
          id: `notification-${Date.now()}`,
          userId: savedPrompt.userId,
          type: 'prompt_saved',
          title: 'Prompt Saved',
          message: `${state.user.name} saved your prompt "${savedPrompt.title}"`,
          read: false,
          data: {
            promptId: savedPrompt.id,
            promptTitle: savedPrompt.title,
            actionUserId: state.user.id,
            actionUserName: state.user.name,
            actionUserUsername: state.user.username,
          },
          createdAt: new Date().toISOString(),
        }
        newNotifications = [...state.notifications, notification]
      }

      return {
        ...state,
        saves: [...state.saves, newSave],
        prompts: updatedPrompts,
        notifications: newNotifications,
      }
    }

    case 'UNSAVE_PROMPT': {
      const promptId = action.payload
      if (!state.user) return state

      const updatedSaves = state.saves.filter(s => !(s.userId === state.user!.id && s.promptId === promptId))

      const updatedPrompts = state.prompts.map(p =>
            p.id === promptId ? { ...p, saveCount: Math.max(0, p.saveCount - 1), isSaved: false } : p
      )

       return { ...state, saves: updatedSaves, prompts: updatedPrompts }
    }

    case 'FORK_PROMPT': {
      const { originalId, newPrompt } = action.payload

      const updatedPrompts = state.prompts.map(p =>
        p.id === originalId ? { ...p, forkCount: p.forkCount + 1 } : p
      )

      // Create notification for original prompt author if they're not the one forking
      const originalPrompt = state.prompts.find(p => p.id === originalId)
      let newNotifications = state.notifications

       if (originalPrompt && originalPrompt.userId !== newPrompt.userId && state.user) {
        const notification: Notification = {
          id: `notification-${Date.now()}`,
          userId: originalPrompt.userId,
          type: 'prompt_forked',
          title: 'Prompt Forked',
          message: `${state.user.name} forked your prompt "${originalPrompt.title}"`,
          read: false,
          data: {
            promptId: originalPrompt.id,
            promptTitle: originalPrompt.title,
            actionUserId: state.user.id,
            actionUserName: state.user.name,
            actionUserUsername: state.user.username,
          },
          createdAt: new Date().toISOString(),
        }
        newNotifications = [...state.notifications, notification]
      }

      return { ...state, prompts: [newPrompt, ...updatedPrompts], notifications: newNotifications }
    }

    case 'ADD_COMMENT':
      return {
        ...state,
        comments: [...state.comments, action.payload],
        prompts: state.prompts.map(p =>
           p.id === action.payload.promptId ? { ...p, commentCount: p.commentCount + 1 } : p
        ),
      }
    case 'UPDATE_COMMENT':
      return {
        ...state,
        comments: state.comments.map(c => (c.id === action.payload.id ? { ...c, content: action.payload.content } : c)),
      }

    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter(c => c.id !== action.payload),
      }
    case 'FOLLOW_USER': {
      const followingId = action.payload
      if (!state.user || state.user.id === followingId) return state

     const existingFollow = state.follows.find(f => f.followerId === state.user!.id && f.followingId === followingId)

      if (existingFollow) return state

      const newFollow: Follow = {
        followerId: state.user.id,
        followingId,
        createdAt: new Date().toISOString(),
      }

      return { ...state, follows: [...state.follows, newFollow] }
    }

    case 'UNFOLLOW_USER': {
      const followingId = action.payload
      if (!state.user) return state

       const updatedFollows = state.follows.filter(f => !(f.followerId === state.user!.id && f.followingId === followingId))

      return { ...state, follows: updatedFollows }
    }

    case 'ADD_COLLECTION':
      return { ...state, collections: [...state.collections, action.payload] }

    case 'UPDATE_COLLECTION':
      return {
        ...state,
        collections: state.collections.map(c => (c.id === action.payload.id ? { ...c, ...action.payload.updates } : c)),
      }

    case 'DELETE_COLLECTION':
      return { ...state, collections: state.collections.filter(c => c.id !== action.payload) }

    case 'SAVE_DRAFT': {
      const existingDraftIndex = state.drafts.findIndex(d => d.id === action.payload.id)
      const updatedDrafts =
        existingDraftIndex >= 0 ? state.drafts.map((d, i) => (i === existingDraftIndex ? action.payload : d)) : [...state.drafts, action.payload]
      return { ...state, drafts: updatedDrafts }
    }

    case 'DELETE_DRAFT':
      
      return { ...state, drafts: state.drafts.filter(d => d.id !== action.payload) }

    case 'SET_SEARCH_FILTERS': {
      // Ensure query is always a string
      const payload = { ...action.payload }
      if (payload.query !== undefined && typeof payload.query !== 'string') {
        payload.query = ''
      }
      return { ...state, searchFilters: { ...state.searchFilters, ...payload } }
    }

    case 'SET_THEME':
      return { ...state, theme: action.payload }

    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'ADD_NOTIFICATION':
         return { ...state, notifications: [...state.notifications, action.payload] }

    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => (n.id === action.payload ? { ...n, read: true } : n)) }

    case 'CLEAR_NOTIFICATIONS':
        return { ...state, notifications: [] }

    case 'ADD_PROMPT_FEEDBACK':
       return { ...state, promptFeedbacks: [...state.promptFeedbacks, action.payload] }
          
       

    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme')
      const systemPrefersDark =
        typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

      const initialTheme: 'light' | 'dark' =
        savedTheme === 'dark' || (!savedTheme && systemPrefersDark) ? 'dark' : 'light'
      dispatch({ type: 'SET_THEME', payload: initialTheme })

      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', initialTheme === 'dark')
      }
    } catch (err) {
      // If anything fails (SSR etc.), fallback to default theme in state
      console.warn('Theme init error:', err)
    }
     }, [])

  // Apply theme changes to document and localStorage
  useEffect(() => {
     try {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', state.theme === 'dark')
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', state.theme)
      }
    } catch (err) {
      console.warn('Theme sync error:', err)
    }
  }, [state.theme])

  // Listen for auth state changes - UPDATED FOR ROLE SYSTEM
  useEffect(() => {
     let isMounted = true

     const mapUser = (u: any) => {
      if (!u) return null
      const fullName = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User'
      const username = u.user_metadata?.user_name || (u.email ? u.email.split('@')[0] : 'user')
      return {
        id: u.id,
        name: fullName,
        username,
        role: 'general' as UserRole,
        avatarUrl: u.user_metadata?.avatar_url,
        bio: undefined,
        // Not part of core type, but some components read it
        reputation: 0,
      } as User & { reputation?: number }
    }

  const init = async () => {

      try {
              const { data } = await supabase.auth.getSession()
        if (!isMounted) return
        dispatch({ type: 'SET_USER', payload: mapUser(data.session?.user || null) as any }) 
      } catch (err) {
        console.warn('Auth init error', err)
      }
  }

  // Initialize session on mount
  init()

     const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      dispatch({ type: 'SET_USER', payload: mapUser(session?.user || null) as any }) 
    })

    return () => {
      isMounted = false
      sub.subscription.unsubscribe()
    }
  }, [])
   // TODO: Re-implement real-time subscriptions (hearts, saves, prompts) and dispatch actions accordingly.
  useEffect(() => {
    if (!state.user) return
   console.log('Real-time subscriptions removed - re-add subscriptions when DB is available')
    // Return cleanup function if you subscribe
    return () => {}
  }, [state.user])
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
   const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}