import { useState } from 'react'
import { Button } from './ui/button'
import { Copy, CheckCircle } from 'lucide-react'

interface CopyButtonProps {
  text: string
  label?: string
  size?: 'sm' | 'lg' | 'default' | 'icon'
  variant?: 'outline' | 'ghost' | 'default'
}

/**
 * Reusable copy-to-clipboard button component
 * Shows a CheckCircle icon and "Copied!" text when clicked
 * @param text - The text to copy to clipboard
 * @param label - Button label (default: "Copy")
 * @param size - Button size (default: "sm")
 * @param variant - Button variant (default: "outline")
 */
export function CopyButton({
  text,
  label = 'Copy',
  size = 'sm',
  variant = 'outline',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant={variant} size={size} onClick={handleCopy}>
      {copied ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  )
}