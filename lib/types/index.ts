/**
 * Core type definitions for Prompticle application
 */

// Application mode selection
export type AppMode = 'wizard' | 'ai-analysis';

// Supported platforms for prompt generation
export type Platform = 'bolt' | 'lovable' | 'v0';

// Wizard step progression
export type WizardStep = 'brief' | 'type' | 'style' | 'layout' | 'components';

// Website type options
export type WebsiteType =
  | 'landing-page'
  | 'ecommerce'
  | 'blog'
  | 'portfolio'
  | 'saas'
  | 'documentation';

/**
 * Visual style option with preview support
 */
export interface StyleOption {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

/**
 * Layout option with thumbnail support
 */
export interface LayoutOption {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
}

/**
 * Component option with categorization
 */
export interface ComponentOption {
  id: string;
  name: string;
  category: 'navigation' | 'content' | 'forms' | 'marketing' | 'other';
  description: string;
  required?: boolean;
}

/**
 * Website type configuration
 */
export interface WebsiteTypeConfig {
  id: WebsiteType;
  name: string;
  description: string;
  icon: string;
  preview?: string;
}

/**
 * Complete wizard state tracking user selections
 */
export interface WizardState {
  websiteType: WebsiteType | null;
  style: StyleOption | null;
  layout: LayoutOption | null;
  components: ComponentOption[];
}

/**
 * Result from AI analysis of PRD text
 */
export interface AIAnalysisResult {
  websiteType: WebsiteType;
  style: StyleOption;
  layout: LayoutOption;
  components: ComponentOption[];
  confidence: number;
  reasoning?: string;
  aiDetected?: boolean; // Flag to show AI badge on selections
}

/**
 * Generated prompt with platform-specific formatting
 */
export interface GeneratedPrompt {
  platform: Platform;
  content: string;
  metadata: {
    generatedAt: number;
    mode: AppMode;
  };
}

/**
 * Example PRD template
 */
export interface ExamplePRD {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
}

/**
 * Zustand store state and actions
 */
export interface PromptStore {
  // State
  mode: AppMode | null;
  wizardState: WizardState;
  prdInput: string | null;
  aiAnalysisResult: AIAnalysisResult | null;
  currentStep: WizardStep;
  selectedPlatform: Platform;

  // AI prompt generation state
  promptCache: PromptCache;
  selectionsSnapshot: SelectionsSnapshot | null;
  isGenerating: boolean;
  generationError: string | null;

  // Actions
  setMode: (mode: AppMode) => void;
  setWizardState: (state: Partial<WizardState>) => void;
  setPRDInput: (input: string) => void;
  setAIAnalysisResult: (result: AIAnalysisResult | null) => void;
  setCurrentStep: (step: WizardStep) => void;
  setSelectedPlatform: (platform: Platform) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;

  // AI prompt generation actions
  setPromptCache: (platform: Platform, data: BoltPromptStep[] | SinglePrompt) => void;
  setSelectionsSnapshot: (snapshot: SelectionsSnapshot) => void;
  setIsGenerating: (val: boolean) => void;
  setGenerationError: (err: string | null) => void;
  clearPromptCache: () => void;

  // Preview image state
  previewImage: PreviewImageState;

  // Preview image actions
  setPreviewImageUrl: (url: string | null) => void;
  setIsGeneratingImage: (val: boolean) => void;
  setImageGenerationError: (err: string | null) => void;
}

/**
 * Platform configuration for prompt templates
 */
export interface PlatformConfig {
  id: Platform;
  name: string;
  icon: string;
  description: string;
}

/**
 * Prompt context for generation
 */
export interface PromptContext {
  websiteType: string;
  style: string;
  layout: string;
  components: string[];
}

// ==================== Preview Image ====================

/**
 * State for DALL-E website preview image generation
 */
export interface PreviewImageState {
  url: string | null;
  isGenerating: boolean;
  error: string | null;
}

// ==================== AI Prompt Generation ====================

/**
 * Bolt returns array of incremental prompts (3-4 steps)
 */
export interface BoltPromptStep {
  step: number;
  title: string;
  prompt: string;
}

/**
 * Lovable/v0 return a single comprehensive prompt
 */
export interface SinglePrompt {
  title: string;
  prompt: string;
}

/**
 * Per-platform cache for AI-generated prompts
 */
export interface PromptCache {
  bolt: BoltPromptStep[] | null;
  lovable: SinglePrompt | null;
  v0: SinglePrompt | null;
}

/**
 * Snapshot of selections used when generating (for stale detection)
 */
export interface SelectionsSnapshot {
  websiteType: string;
  styleId: string;
  layoutId: string;
  componentIds: string[];
  prdText: string;
}

/**
 * API request body for /api/generate-prompts
 */
export interface GeneratePromptsRequest {
  prdText: string;
  selections: {
    websiteType: string;
    visualStyle: string;
    layout: string;
    components: string[];
  };
  platform: Platform;
}

/**
 * API response body from /api/generate-prompts
 */
export interface GeneratePromptsResponse {
  bolt?: BoltPromptStep[];
  lovable?: SinglePrompt;
  v0?: SinglePrompt;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
}
