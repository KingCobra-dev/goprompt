import * as React from 'react'
import { Badge } from './badge'
import { cn } from './utils'

interface ProfessionalBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  gradient?: boolean
}

export function ProfessionalBadge({
  className,
  children,
  gradient = false,
  ...props
}: ProfessionalBadgeProps) {
  return (
    <Badge
      className={cn(
        'font-semibold',
        gradient &&
          'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground',
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  )
}
