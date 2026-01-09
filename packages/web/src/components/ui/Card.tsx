import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  }

  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-200',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
