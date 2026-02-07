import type {
  Platform,
  WizardState,
  AIAnalysisResult,
  GeneratedPrompt,
  AppMode,
  PromptContext,
} from '@/lib/types';
import { generatePromptForPlatform } from './templates';

/**
 * Prompt Generator - Converts wizard state or AI analysis into platform-specific prompts
 */
export class PromptGenerator {
  /**
   * Generate prompt from wizard state
   */
  static fromWizard(
    wizardState: WizardState,
    platform: Platform
  ): GeneratedPrompt | null {
    // Validate that wizard state is complete
    if (!this.isWizardStateComplete(wizardState)) {
      return null;
    }

    // Build prompt context
    const context: PromptContext = {
      websiteType: this.formatWebsiteType(wizardState.websiteType!),
      style: wizardState.style!.description,
      layout: wizardState.layout!.description,
      components: wizardState.components.map((c) => c.name),
    };

    // Generate platform-specific prompt
    const content = generatePromptForPlatform(platform, context);

    return {
      platform,
      content,
      metadata: {
        generatedAt: Date.now(),
        mode: 'wizard' as AppMode,
      },
    };
  }

  /**
   * Generate prompt from AI analysis result
   */
  static fromAIAnalysis(
    analysis: AIAnalysisResult,
    platform: Platform
  ): GeneratedPrompt {
    // Build prompt context from AI analysis
    const context: PromptContext = {
      websiteType: this.formatWebsiteType(analysis.websiteType),
      style: analysis.style.description,
      layout: analysis.layout.description,
      components: analysis.components.map((c) => c.name),
    };

    // Generate platform-specific prompt
    const content = generatePromptForPlatform(platform, context);

    return {
      platform,
      content,
      metadata: {
        generatedAt: Date.now(),
        mode: 'ai-analysis' as AppMode,
      },
    };
  }

  /**
   * Check if wizard state has all required fields
   */
  private static isWizardStateComplete(state: WizardState): boolean {
    return !!(
      state.websiteType &&
      state.style &&
      state.layout &&
      state.components.length > 0
    );
  }

  /**
   * Format website type for display in prompts
   */
  private static formatWebsiteType(type: string): string {
    // Convert kebab-case to readable format
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get completion percentage for wizard state
   */
  static getCompletionPercentage(state: WizardState): number {
    let completed = 0;
    const total = 4; // 4 steps

    if (state.websiteType) completed++;
    if (state.style) completed++;
    if (state.layout) completed++;
    if (state.components.length > 0) completed++;

    return Math.round((completed / total) * 100);
  }

  /**
   * Validate if a generated prompt is valid (not empty, meets minimum length)
   */
  static isValidPrompt(prompt: string): boolean {
    const minLength = 50; // Minimum prompt length
    return prompt.trim().length >= minLength;
  }

  /**
   * Get prompt preview (first 150 characters)
   */
  static getPromptPreview(prompt: string): string {
    const maxLength = 150;
    if (prompt.length <= maxLength) {
      return prompt;
    }
    return prompt.slice(0, maxLength).trim() + '...';
  }

  /**
   * Estimate token count (rough estimation)
   */
  static estimateTokenCount(prompt: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(prompt.length / 4);
  }
}
