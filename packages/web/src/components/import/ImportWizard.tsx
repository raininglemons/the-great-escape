import { useImportStore } from '../../store/import-store'
import { useBlueskyAuth } from '../../hooks/useBlueskyAuth'
import { WelcomeStep } from './steps/WelcomeStep'
import { ConnectBlueskyStep } from './steps/ConnectBlueskyStep'
import { ImportXDataStep } from './steps/ImportXDataStep'
import { MatchingStep } from './steps/MatchingStep'
import { ReviewStep } from './steps/ReviewStep'
import { FollowingStep } from './steps/FollowingStep'
import { CompleteStep } from './steps/CompleteStep'
import type { WizardStep } from '../../types'

const STEPS: WizardStep[] = [
  'welcome',
  'connect-bluesky',
  'import-x-data',
  'matching',
  'review',
  'following',
  'complete',
]

export function ImportWizard() {
  const { currentStep, setCurrentStep } = useImportStore()
  const { isConnected: isBlueskyConnected } = useBlueskyAuth()

  const currentIndex = STEPS.indexOf(currentStep)

  const goNext = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex])
    }
  }

  const goBack = () => {
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex])
    }
  }

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step)
  }

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={goNext} />
      case 'connect-bluesky':
        return (
          <ConnectBlueskyStep
            onNext={goNext}
            onBack={goBack}
            isConnected={isBlueskyConnected}
          />
        )
      case 'import-x-data':
        return <ImportXDataStep onNext={goNext} onBack={goBack} />
      case 'matching':
        return <MatchingStep onNext={goNext} onBack={goBack} />
      case 'review':
        return <ReviewStep onNext={goNext} onBack={goBack} />
      case 'following':
        return <FollowingStep onNext={goNext} onBack={goBack} />
      case 'complete':
        return <CompleteStep onRestart={() => goToStep('welcome')} />
      default:
        return null
    }
  }

  // Progress indicator
  const progressSteps = [
    { key: 'connect-bluesky', label: 'Connect' },
    { key: 'import-x-data', label: 'Import' },
    { key: 'matching', label: 'Match' },
    { key: 'review', label: 'Review' },
    { key: 'following', label: 'Follow' },
  ]

  const activeProgressIndex = progressSteps.findIndex(
    (s) => s.key === currentStep
  )

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar - hidden on welcome/complete */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {progressSteps.map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      index < activeProgressIndex
                        ? 'bg-bsky-500 text-white'
                        : index === activeProgressIndex
                        ? 'bg-bsky-100 text-bsky-700 ring-2 ring-bsky-500'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index < activeProgressIndex ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm hidden sm:block ${
                      index <= activeProgressIndex
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < progressSteps.length - 1 && (
                    <div
                      className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                        index < activeProgressIndex
                          ? 'bg-bsky-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl">{renderStep()}</div>
      </div>
    </div>
  )
}
