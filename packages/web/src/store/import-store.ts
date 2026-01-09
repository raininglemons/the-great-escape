import { create } from 'zustand'
import type { XUser, MatchResult, ImportProgress, WizardStep } from '../types'

interface ImportState {
  // Wizard state
  currentStep: WizardStep

  // X users from archive or API
  xUsers: XUser[]

  // Match results
  matchResults: MatchResult[]

  // Import progress
  progress: ImportProgress

  // Bluesky following set (for deduplication)
  blueskyFollowingSet: Set<string>

  // Actions
  setCurrentStep: (step: WizardStep) => void
  setXUsers: (users: XUser[]) => void
  setMatchResults: (results: MatchResult[]) => void
  toggleMatchSelection: (index: number) => void
  selectAllMatches: () => void
  deselectAllMatches: () => void
  setProgress: (progress: Partial<ImportProgress>) => void
  setBlueskyFollowingSet: (handles: Set<string>) => void
  markAsFollowing: (indices: number[]) => void
  reset: () => void
}

const initialProgress: ImportProgress = {
  phase: 'idle',
  currentStep: 0,
  totalSteps: 0,
  message: '',
}

export const useImportStore = create<ImportState>((set) => ({
  // Initial state
  currentStep: 'welcome',
  xUsers: [],
  matchResults: [],
  progress: initialProgress,
  blueskyFollowingSet: new Set(),

  // Actions
  setCurrentStep: (step) => set({ currentStep: step }),

  setXUsers: (users) => set({ xUsers: users }),

  setMatchResults: (results) => set({ matchResults: results }),

  toggleMatchSelection: (index) => set((state) => {
    const newResults = [...state.matchResults]
    if (newResults[index]) {
      newResults[index] = {
        ...newResults[index],
        isSelected: !newResults[index].isSelected,
      }
    }
    return { matchResults: newResults }
  }),

  selectAllMatches: () => set((state) => ({
    matchResults: state.matchResults.map((r) => ({
      ...r,
      isSelected: r.blueskyUser !== null && !r.isAlreadyFollowing,
    })),
  })),

  deselectAllMatches: () => set((state) => ({
    matchResults: state.matchResults.map((r) => ({
      ...r,
      isSelected: false,
    })),
  })),

  setProgress: (progress) => set((state) => ({
    progress: { ...state.progress, ...progress },
  })),

  setBlueskyFollowingSet: (handles) => set({ blueskyFollowingSet: handles }),

  markAsFollowing: (indices) => set((state) => {
    const newResults = [...state.matchResults]
    for (const index of indices) {
      if (newResults[index]) {
        newResults[index] = {
          ...newResults[index],
          isAlreadyFollowing: true,
          isSelected: false,
        }
      }
    }
    return { matchResults: newResults }
  }),

  reset: () => set({
    currentStep: 'welcome',
    xUsers: [],
    matchResults: [],
    progress: initialProgress,
    blueskyFollowingSet: new Set(),
  }),
}))
