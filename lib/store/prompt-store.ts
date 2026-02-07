import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PromptStore, WizardStep } from '@/lib/types';

/**
 * Initial wizard state
 */
const initialWizardState = {
  websiteType: null,
  style: null,
  layout: null,
  components: [],
};

/**
 * Step progression order
 */
const STEP_ORDER: WizardStep[] = ['type', 'style', 'layout', 'components'];

/**
 * Main application store using Zustand with localStorage persistence
 */
export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      // ==================== State ====================
      mode: null,
      wizardState: initialWizardState,
      prdInput: null,
      aiAnalysisResult: null,
      currentStep: 'type',
      selectedPlatform: 'bolt',

      // ==================== Actions ====================

      /**
       * Set the application mode (wizard or AI analysis)
       */
      setMode: (mode) => {
        set({ mode });
      },

      /**
       * Update wizard state (partial update)
       */
      setWizardState: (state) => {
        set((prev) => ({
          wizardState: {
            ...prev.wizardState,
            ...state,
          },
        }));
      },

      /**
       * Set PRD input text
       */
      setPRDInput: (prdInput) => {
        set({ prdInput });
      },

      /**
       * Set AI analysis result
       */
      setAIAnalysisResult: (aiAnalysisResult) => {
        set({ aiAnalysisResult });

        // If AI analysis result is provided, automatically populate wizard state
        if (aiAnalysisResult) {
          set({
            wizardState: {
              websiteType: aiAnalysisResult.websiteType,
              style: aiAnalysisResult.style,
              layout: aiAnalysisResult.layout,
              components: aiAnalysisResult.components,
            },
          });
        }
      },

      /**
       * Set current wizard step
       */
      setCurrentStep: (currentStep) => {
        set({ currentStep });
      },

      /**
       * Set selected platform for prompt generation
       */
      setSelectedPlatform: (selectedPlatform) => {
        set({ selectedPlatform });
      },

      /**
       * Advance to next wizard step
       */
      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);

        if (currentIndex < STEP_ORDER.length - 1) {
          set({ currentStep: STEP_ORDER[currentIndex + 1] });
        }
      },

      /**
       * Go back to previous wizard step
       */
      previousStep: () => {
        const { currentStep } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);

        if (currentIndex > 0) {
          set({ currentStep: STEP_ORDER[currentIndex - 1] });
        }
      },

      /**
       * Reset entire store to initial state
       */
      reset: () => {
        set({
          mode: null,
          wizardState: initialWizardState,
          prdInput: null,
          aiAnalysisResult: null,
          currentStep: 'type',
          selectedPlatform: 'bolt',
        });
      },
    }),
    {
      name: 'promptcraft-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields (exclude temporary UI state if needed)
      partialize: (state) => ({
        mode: state.mode,
        wizardState: state.wizardState,
        prdInput: state.prdInput,
        aiAnalysisResult: state.aiAnalysisResult,
        currentStep: state.currentStep,
        selectedPlatform: state.selectedPlatform,
      }),
    }
  )
);

/**
 * Selector hooks for optimized re-renders
 */

export const useWizardState = () => usePromptStore((state) => state.wizardState);
export const useCurrentStep = () => usePromptStore((state) => state.currentStep);
export const useSelectedPlatform = () => usePromptStore((state) => state.selectedPlatform);
export const useAIAnalysisResult = () => usePromptStore((state) => state.aiAnalysisResult);
export const useMode = () => usePromptStore((state) => state.mode);
