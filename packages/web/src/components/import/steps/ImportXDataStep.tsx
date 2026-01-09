import { useState } from 'react'
import { FileDropZone } from '../FileDropZone'
import { Button, Card, Alert } from '../../ui'
import { useArchiveParser } from '../../../hooks/useArchiveParser'
import { useImportStore } from '../../../store/import-store'

interface ImportXDataStepProps {
  onNext: () => void
  onBack: () => void
}

type ImportMethod = 'archive' | 'api'

export function ImportXDataStep({ onNext, onBack }: ImportXDataStepProps) {
  const [method, setMethod] = useState<ImportMethod>('archive')
  const { parseFile, isLoading, error, clearError } = useArchiveParser()
  const { xUsers } = useImportStore()

  const handleFileSelect = async (file: File) => {
    parseFile(file)
  }

  const hasUsers = xUsers.length > 0

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Import your X follows
        </h2>
        <p className="text-gray-600">
          Choose how you want to import your following list
        </p>
      </div>

      {/* Method selector */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setMethod('archive')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            method === 'archive'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          X Archive (Free)
        </button>
        <button
          onClick={() => setMethod('api')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            method === 'api'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          X API (Your Keys)
        </button>
      </div>

      {error && (
        <Alert type="error" className="mb-4" onDismiss={clearError}>
          {error}
        </Alert>
      )}

      {method === 'archive' ? (
        <div className="space-y-6">
          {hasUsers ? (
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-900">
                    {xUsers.length} accounts loaded
                  </p>
                  <p className="text-sm text-green-700">
                    Ready to find them on Bluesky
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // Allow re-upload
                  }}
                >
                  Change
                </Button>
              </div>
            </Card>
          ) : (
            <FileDropZone onFileSelect={handleFileSelect} isLoading={isLoading} />
          )}

          {/* Instructions */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">
              How to get your X archive
            </h3>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
              <li>
                Go to{' '}
                <a
                  href="https://x.com/settings/download_your_data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bsky-500 hover:text-bsky-600 underline"
                >
                  X Settings → Download your data
                </a>
              </li>
              <li>Request your archive and wait for the email (24-48 hours)</li>
              <li>Download and extract the ZIP file</li>
              <li>
                Find <code className="bg-gray-100 px-1 rounded">data/following.js</code>{' '}
                and upload it here
              </li>
            </ol>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-medium text-yellow-800">
                  X API requires a paid plan
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The X API Basic plan costs $200/month. We recommend using the
                  free archive method instead.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">
              Use your own X API credentials
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              If you have X API access, you can enter your credentials here. Your
              keys are stored locally and never sent to our servers.
            </p>
            <p className="text-sm text-gray-500">
              This feature is coming soon. Please use the archive method for now.
            </p>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 justify-center mt-8">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!hasUsers}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
