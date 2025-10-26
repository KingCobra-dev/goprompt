import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
// Note: Adjust import path based on where api is actually located
// import { hearts, saves } from '../api'

/**
 * Custom hook for managing prompt heart and save actions
 * Handles animation state, API calls, and context updates
 * @param promptId - The ID of the prompt
 * @returns Object with action handlers and state
 * @note Currently the api module is not available - this needs to be fixed
 */
export function usePromptActions(promptId: string) {
  const { state, dispatch } = useApp()
  const [heartAnimating, setHeartAnimating] = useState(false)
  const [saveAnimating, setSaveAnimating] = useState(false)

  // Calculate the actual heart state from context
  const isHearted =
    typeof state.hearts !== 'undefined' &&
    state.hearts.some(
      (h: any) => h.userId === state.user?.id && h.promptId === promptId
    )

  // Calculate the actual save state from context
  const isActuallySaved = state.saves.some(
    (s: any) => s.userId === state.user?.id && s.promptId === promptId
  )

  const handleHeart = async () => {
    if (!state.user) {
      console.log('User not authenticated')
      return
    }

    // Trigger animation
    setHeartAnimating(true)
    setTimeout(() => setHeartAnimating(false), 400)

    console.log(
      'Toggling heart for prompt:',
      promptId,
      'Current isHearted:',
      isHearted
    )
    try {
      // TODO: Uncomment when api module is available
      // const result = await hearts.toggle(promptId)
      const result = { error: null, data: { action: 'added' } }

      console.log('Heart result:', result)

      if (!result.error && result.data) {
        // Update global state immediately for instant visual feedback
        if (result.data.action === 'added') {
          console.log('Adding heart - updating UI')
          dispatch({ type: 'HEART_PROMPT', payload: { promptId } })
        } else {
          console.log('Removing heart - updating UI')
          dispatch({ type: 'UNHEART_PROMPT', payload: { promptId } })
        }
      } else {
        console.error('Heart error:', result.error)
      }
    } catch (error) {
      console.error('Heart exception:', error)
    }
  }

  const handleSave = async () => {
    if (!state.user) {
      console.log('User not authenticated')
      return
    }

    // Trigger animation
    setSaveAnimating(true)
    setTimeout(() => setSaveAnimating(false), 400)

    console.log(
      'Toggling save for prompt:',
      promptId,
      'Current isSaved:',
      isActuallySaved
    )
    try {
      // TODO: Uncomment when api module is available
      // const result = await saves.toggle(promptId)
      const result = { error: null, data: { action: 'added' } }

      console.log('Save result:', result)

      if (!result.error && result.data) {
        // Update global state immediately for instant visual feedback
        if (result.data.action === 'added') {
          console.log('Adding save - updating UI')
          dispatch({ type: 'SAVE_PROMPT', payload: { promptId } })
        } else {
          console.log('Removing save - updating UI')
          dispatch({ type: 'UNSAVE_PROMPT', payload: promptId })
        }
      } else {
        console.error('Save error:', result.error)
      }
    } catch (error) {
      console.error('Save exception:', error)
    }
  }

  return {
    isHearted,
    isActuallySaved,
    handleHeart,
    handleSave,
    heartAnimating,
    saveAnimating,
  }
}