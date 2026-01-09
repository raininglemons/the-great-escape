import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import clsx from 'clsx'
import { Spinner } from '../ui'

interface FileDropZoneProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
  accept?: Record<string, string[]>
}

export function FileDropZone({
  onFileSelect,
  isLoading = false,
  accept = {
    'application/javascript': ['.js'],
    'application/json': ['.json'],
  },
}: FileDropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept,
      multiple: false,
      disabled: isLoading,
    })

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
        isDragActive && !isDragReject && 'border-bsky-500 bg-bsky-50',
        isDragReject && 'border-red-500 bg-red-50',
        !isDragActive && !isDragReject && 'border-gray-300 hover:border-gray-400',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-gray-600">Processing file...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            className={clsx(
              'w-16 h-16 rounded-full flex items-center justify-center',
              isDragActive ? 'bg-bsky-100' : 'bg-gray-100'
            )}
          >
            <svg
              className={clsx(
                'w-8 h-8',
                isDragActive ? 'text-bsky-500' : 'text-gray-400'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {isDragActive ? (
            <p className="text-bsky-600 font-medium">Drop your file here</p>
          ) : (
            <>
              <div>
                <p className="text-gray-700 font-medium">
                  Drop your following.js file here
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  or click to browse
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Accepts .js or .json files from your X archive
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
