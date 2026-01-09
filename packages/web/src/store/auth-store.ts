import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BskyAgent } from '@atproto/api'
import type { XApiCredentials, BlueskyUser } from '../types'

interface AuthState {
  // Bluesky
  blueskyAgent: BskyAgent | null
  blueskyUser: BlueskyUser | null
  isBlueskyConnected: boolean

  // X API (optional, user-provided)
  xApiCredentials: XApiCredentials | null
  isXApiConnected: boolean

  // Actions
  setBlueskyAuth: (agent: BskyAgent, user: BlueskyUser) => void
  clearBlueskyAuth: () => void
  setXApiCredentials: (credentials: XApiCredentials) => void
  clearXApiCredentials: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      blueskyAgent: null,
      blueskyUser: null,
      isBlueskyConnected: false,
      xApiCredentials: null,
      isXApiConnected: false,

      // Actions
      setBlueskyAuth: (agent, user) => set({
        blueskyAgent: agent,
        blueskyUser: user,
        isBlueskyConnected: true,
      }),

      clearBlueskyAuth: () => set({
        blueskyAgent: null,
        blueskyUser: null,
        isBlueskyConnected: false,
      }),

      setXApiCredentials: (credentials) => set({
        xApiCredentials: credentials,
        isXApiConnected: true,
      }),

      clearXApiCredentials: () => set({
        xApiCredentials: null,
        isXApiConnected: false,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist X credentials, not the Bluesky agent
        xApiCredentials: state.xApiCredentials,
        isXApiConnected: state.isXApiConnected,
      }),
    }
  )
)
