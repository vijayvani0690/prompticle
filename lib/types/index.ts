/**
 * Core type definitions for PromptCraft application
 */

// Application mode selection
export type AppMode = 'wizard' | 'ai-analysis';

// Supported platforms for prompt generation
export type Platform = 'bolt' | 'lovable' | 'v0';

// Wizard step progression
export type WizardStep = 'type' | 'style' | 'layout' | 'components';

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
