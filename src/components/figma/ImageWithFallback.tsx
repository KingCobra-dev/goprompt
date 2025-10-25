import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackClassName = '',
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${fallbackClassName}`}
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div
          className={`flex items-center justify-center bg-muted animate-pulse ${className}`}
        >
          <div className="w-full h-full bg-muted-foreground/10" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${isLoading ? 'hidden' : ''} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  )
}
