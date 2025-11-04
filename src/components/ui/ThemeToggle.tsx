import { Moon, Sun } from 'lucide-react'
import { Button } from './button'
import { useApp } from '../../contexts/AppContext'

export function ThemeToggle() {
  const { state, dispatch } = useApp()
  const isDark = state.theme === 'dark'

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: isDark ? 'light' : 'dark' })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0 hover:bg-accent"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      )}
    </Button>
  )
}
