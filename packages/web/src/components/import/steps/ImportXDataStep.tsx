import { useState } from 'react'
import { FileDropZone } from '../FileDropZone'
import { Button, Card, Alert, Input, Spinner, ProgressBar } from '../../ui'
import { useArchiveParser } from '../../../hooks/useArchiveParser'
import { useXApi } from '../../../hooks/useXApi'
import { useImportStore } from '../../../store/import-store'

interface ImportXDataStepProps {
  onNext: () => void
  onBack: () => void
}

export function ImportXDataStep({ onNext, onBack }: ImportXDataStepProps) {
  const [bearerToken, setBearerToken] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customWorkerUrl, setCustomWorkerUrl] = useState('')

  const {
    parseFile,
    isLoading: isParsingArchive,
    error: archiveError,
    clearError: clearArchiveError,
  } = useArchiveParser()

  const {
    isConfigured,
    username,
    validateToken,
    isValidating,
    fetchFollowing,
    isFetching,
    resolveUserIds,
    isResolving,
    usersNeedResolution,
    unresolvedUserIds,
    error: apiError,
    clearError: clearApiError,
    clearConfig,
    hasUserId,
  } = useXApi()

  const { xUsers, progress } = useImportStore()

  const handleFileSelect = async (file: File) => {
    parseFile(file)
  }

  const handleConnectApi = () => {
    if (bearerToken.trim()) {
      validateToken(bearerToken.trim())
    }
  }

  const handleFetchFollowing = () => {
    fetchFollowing()
  }

  const handleResolveUsers = () => {
    if (unresolvedUserIds.length > 0) {
      resolveUserIds(unresolvedUserIds)
    }
  }

  // Archive is loaded but needs API resolution
  const hasUnresolvedArchive = xUsers.length > 0 && usersNeedResolution
  // Archive is loaded and fully resolved
  const hasResolvedUsers = xUsers.length > 0 && !usersNeedResolution

  const error = archiveError || apiError
  const clearError = archiveError ? clearArchiveError : clearApiError
  const isWorking = isParsingArchive || isValidating || isFetching || isResolving

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Import your X follows
        </h2>
        <p className="text-gray-600">
          Upload your X archive and connect to resolve user profiles
        </p>
      </div>

      {error && (
        <Alert type="error" className="mb-4" onDismiss={clearError}>
          {error}
        </Alert>
      )}

      <div className="space-y-6">
        {/* Step 1: Upload Archive */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                xUsers.length > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-bsky-100 text-bsky-700'
              }`}
            >
              {xUsers.length > 0 ? '✓' : '1'}
            </div>
            <h3 className="font-semibold text-gray-900">
              Upload your X archive
            </h3>
          </div>

          {xUsers.length > 0 ? (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-medium text-green-900">
                {xUsers.length} accounts found in archive
              </p>
              <p className="text-sm text-green-700">
                {usersNeedResolution
                  ? 'Profiles need to be resolved via X API'
                  : 'All profiles resolved'}
              </p>
            </div>
          ) : (
            <>
              <FileDropZone
                onFileSelect={handleFileSelect}
                isLoading={isParsingArchive}
              />
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  How to get your archive:
                </h4>
                <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
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
                  <li>Request archive and wait for email (24-48h)</li>
                  <li>Download, extract, and upload{' '}
                    <code className="bg-gray-200 px-1 rounded">data/following.js</code>
                  </li>
                </ol>
              </div>
            </>
          )}
        </Card>

        {/* Step 2: Connect X API (required for ID resolution) */}
        <Card className={xUsers.length === 0 ? 'opacity-50' : ''}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                hasResolvedUsers
                  ? 'bg-green-100 text-green-700'
                  : isConfigured
                  ? 'bg-bsky-100 text-bsky-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {hasResolvedUsers ? '✓' : '2'}
            </div>
            <h3 className="font-semibold text-gray-900">
              Connect X API to resolve profiles
            </h3>
          </div>

          <Alert type="info" className="mb-4">
            <p className="text-sm">
              <strong>Why is this needed?</strong> X archives only contain user IDs, not usernames.
              We need the X API to look up the actual handles for matching on Bluesky.
            </p>
          </Alert>

          {isConfigured ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-900">Connected to X API</p>
                  {username && <p className="text-sm text-green-700">@{username}</p>}
                </div>
                <Button variant="secondary" size="sm" onClick={clearConfig}>
                  Disconnect
                </Button>
              </div>

              {hasUnresolvedArchive && (
                <>
                  {isResolving ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Spinner size="sm" />
                        <span className="text-gray-700">{progress.message}</span>
                      </div>
                      <ProgressBar
                        current={progress.currentStep}
                        total={progress.totalSteps}
                      />
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleResolveUsers}
                    >
                      Resolve {unresolvedUserIds.length} User Profiles
                    </Button>
                  )}
                </>
              )}

              {!hasUnresolvedArchive && xUsers.length === 0 && hasUserId && (
                <>
                  {isFetching ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Spinner size="sm" />
                        <span className="text-gray-700">{progress.message}</span>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleFetchFollowing}
                    >
                      Fetch Following Directly (skip archive)
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Bearer Token"
                type="password"
                placeholder="Enter your X API Bearer Token"
                value={bearerToken}
                onChange={(e) => setBearerToken(e.target.value)}
                disabled={isValidating || xUsers.length === 0}
              />

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                disabled={xUsers.length === 0}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Advanced options
              </button>

              {showAdvanced && (
                <Input
                  label="Custom Worker URL (optional)"
                  type="url"
                  placeholder="https://your-worker.workers.dev"
                  value={customWorkerUrl}
                  onChange={(e) => setCustomWorkerUrl(e.target.value)}
                  helperText="Use your own Cloudflare Worker deployment"
                />
              )}

              <Button
                variant="primary"
                className="w-full"
                onClick={handleConnectApi}
                isLoading={isValidating}
                disabled={!bearerToken.trim() || xUsers.length === 0}
              >
                Connect to X API
              </Button>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  How to get a Bearer Token:
                </h4>
                <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
                  <li>
                    Go to{' '}
                    <a
                      href="https://developer.twitter.com/en/portal/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bsky-500 hover:text-bsky-600 underline"
                    >
                      X Developer Portal
                    </a>
                  </li>
                  <li>Create a project & app (requires Basic plan - $200/mo)</li>
                  <li>Generate a Bearer Token with read permissions</li>
                </ol>
              </div>
            </div>
          )}
        </Card>

        {/* Success state */}
        {hasResolvedUsers && (
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-900">
                  Ready to find matches!
                </p>
                <p className="text-sm text-green-700">
                  {xUsers.length} X accounts loaded and ready
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 justify-center mt-8">
        <Button variant="secondary" onClick={onBack} disabled={isWorking}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!hasResolvedUsers || isWorking}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
