import { SavedPromptsPage } from './SavedPromptsPage'

interface UserProfilePageProps {
  userId: string
  initialTab?: string
  onBack: () => void
  onPromptClick: (promptId: string) => void
}

export function UserProfilePage(props: UserProfilePageProps) {
  const { onBack, onPromptClick } = props
  // Minimal placeholder: reuse SavedPromptsPage for now
  // Future: render tabs for Created, Saved, Repos, etc.
  return (
    <SavedPromptsPage onBack={onBack} onPromptClick={onPromptClick} />
  )
}

export default UserProfilePage
