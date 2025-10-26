import { Moon, Sun } from 'lucide-react'
import { Button } from './button'
import { useState } from 'react'

export function ThemeToggle() {
   const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
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
