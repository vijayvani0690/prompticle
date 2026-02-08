import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  PromptStore,
  WizardStep,
  Platform,
  BoltPromptStep,
  SinglePrompt,
  SelectionsSnapshot,
  WizardState,
} from '@/lib/types';

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
 * Initial prompt cache
 */
const initialPromptCache = {
  bolt: null,
  lovable: null,
  v0: null,
};

/**
 * Step progression order
 */
const STEP_ORDER: WizardStep[] = ['brief', 'type', 'style', 'layout', 'components'];

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
      currentStep: 'brief',
      selectedPlatform: 'bolt',

      // AI prompt generation state
      promptCache: initialPromptCache,
      selectionsSnapshot: null,
      isGenerating: false,
      generationError: null,

      // Preview image state
      previewImage: { url: null, isGenerating: false, error: null },

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
          currentStep: 'brief',
          selectedPlatform: 'bolt',
          promptCache: initialPromptCache,
          selectionsSnapshot: null,
          isGenerating: false,
          generationError: null,
          previewImage: { url: null, isGenerating: false, error: null },
        });
      },

      // ==================== AI Prompt Generation Actions ====================

      /**
       * Cache generated prompts for a specific platform
       */
      setPromptCache: (platform: Platform, data: BoltPromptStep[] | SinglePrompt) => {
        set((prev) => ({
          promptCache: {
            ...prev.promptCache,
            [platform]: data,
          },
        }));
      },

      /**
       * Save the selections snapshot used for the last generation
       */
      setSelectionsSnapshot: (snapshot: SelectionsSnapshot) => {
        set({ selectionsSnapshot: snapshot });
      },

      /**
       * Set loading state for prompt generation
       */
      setIsGenerating: (val: boolean) => {
        set({ isGenerating: val });
      },

      /**
       * Set error state for prompt generation
       */
      setGenerationError: (err: string | null) => {
        set({ generationError: err });
      },

      /**
       * Clear all cached prompts
       */
      clearPromptCache: () => {
        set({
          promptCache: initialPromptCache,
          selectionsSnapshot: null,
          previewImage: { url: null, isGenerating: false, error: null },
        });
      },

      // ==================== Preview Image Actions ====================

      setPreviewImageUrl: (url: string | null) => {
        set((prev) => ({
          previewImage: { ...prev.previewImage, url, error: null },
        }));
      },

      setIsGeneratingImage: (val: boolean) => {
        set((prev) => ({
          previewImage: { ...prev.previewImage, isGenerating: val },
        }));
      },

      setImageGenerationError: (err: string | null) => {
        set((prev) => ({
          previewImage: { ...prev.previewImage, error: err },
        }));
      },
    }),
    {
      name: 'prompticle-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist state fields (exclude transient UI state like isGenerating/generationError)
      partialize: (state) => ({
        mode: state.mode,
        wizardState: state.wizardState,
        prdInput: state.prdInput,
        aiAnalysisResult: state.aiAnalysisResult,
        currentStep: state.currentStep,
        selectedPlatform: state.selectedPlatform,
        promptCache: state.promptCache,
        selectionsSnapshot: state.selectionsSnapshot,
        previewImage: { url: state.previewImage.url, isGenerating: false, error: null },
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

// ==================== Helper Functions ====================

/**
 * Build a snapshot of current selections for stale detection
 */
export function buildSelectionsSnapshot(
  wizardState: WizardState,
  prdInput: string | null
): SelectionsSnapshot {
  return {
    websiteType: wizardState.websiteType ?? '',
    styleId: wizardState.style?.id ?? '',
    layoutId: wizardState.layout?.id ?? '',
    componentIds: wizardState.components.map((c) => c.id).sort(),
    prdText: prdInput ?? '',
  };
}

/**
 * Check if selections have changed since the last generation
 */
export function isSnapshotStale(
  current: SelectionsSnapshot,
  cached: SelectionsSnapshot | null
): boolean {
  if (!cached) return false; // No cached snapshot means nothing to compare
  return (
    current.websiteType !== cached.websiteType ||
    current.styleId !== cached.styleId ||
    current.layoutId !== cached.layoutId ||
    current.prdText !== cached.prdText ||
    current.componentIds.join(',') !== cached.componentIds.join(',')
  );
}
