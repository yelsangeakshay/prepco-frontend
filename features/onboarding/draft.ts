"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingProfile } from "./schemas";

interface DraftState {
  draft: Partial<OnboardingProfile>;
  setDraft: (patch: Partial<OnboardingProfile>) => void;
  clear: () => void;
}

/** Form drafts persist locally (no tokens, no PII beyond what the student typed). */
export const useOnboardingDraft = create<DraftState>()(
  persist(
    (set) => ({
      draft: {},
      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      clear: () => set({ draft: {} }),
    }),
    { name: "prepco-onboarding-draft" },
  ),
);
