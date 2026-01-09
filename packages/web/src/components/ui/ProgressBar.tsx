import clsx from 'clsx'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
  showPercentage?: boolean
  className?: string
}

export function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
  className,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className={clsx('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-bsky-500 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500 text-center">
        {current} of {total}
      </div>
    </div>
  )
}
