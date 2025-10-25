import * as React from 'react'
import { Card } from './card'
import { cn } from './utils'

interface ProfessionalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ProfessionalCard({
  className,
  children,
  ...props
}: ProfessionalCardProps) {
  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20',
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}
