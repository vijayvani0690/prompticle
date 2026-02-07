import type { Platform, PromptContext } from '@/lib/types';

/**
 * Platform-specific prompt templates
 * Each platform has unique formatting preferences and requirements
 */

/**
 * Bolt.new template - Concise and direct
 * Focuses on: Structure → Styling → Components
 */
const boltTemplate = (ctx: PromptContext): string => {
  return `Create a ${ctx.websiteType} with modern React and Vite.

## Design Style
${ctx.style}

## Layout Structure
${ctx.layout}

## Required Components
${ctx.components.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Technical Requirements
- Use React with TypeScript
- Implement with Tailwind CSS
- Ensure responsive design (mobile-first)
- Add smooth animations and transitions
- Follow accessibility best practices
- Optimize images and assets
- Use modern React patterns (hooks, context)

Make it production-ready with clean, maintainable code.`;
};

/**
 * Lovable template - Detailed with guardrails
 * Includes: Role definition, detailed specs, implementation notes
 */
const lovableTemplate = (ctx: PromptContext): string => {
  return `You are an expert web developer building a ${ctx.websiteType}.

## Project Overview
Create a fully functional ${ctx.websiteType} with the following specifications.

## Visual Design
**Style**: ${ctx.style}
**Layout**: ${ctx.layout}

## Components to Include
${ctx.components.map((c) => `• ${c}`).join('\n')}

## Implementation Requirements
**Frontend Stack:**
- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- Lucide React icons
- Responsive design system

**Design Principles:**
- Mobile-first responsive approach
- Accessibility (WCAG 2.1 AA compliance)
- Modern UI/UX best practices
- Smooth animations and micro-interactions
- Fast loading performance

**Code Quality:**
- Clean, maintainable code structure
- Proper TypeScript typing
- Component reusability
- Performance optimization

Please build this with attention to detail, ensuring a polished, professional result.`;
};

/**
 * v0 by Vercel template - Three-part structure
 * Format: Product Surface → Context → Constraints
 */
const v0Template = (ctx: PromptContext): string => {
  return `## Product Surface
Build a ${ctx.websiteType} with ${ctx.layout.toLowerCase()} layout.

## Context
**Visual Style**: ${ctx.style}

**Required Sections**:
${ctx.components.map((c) => `- ${c}`).join('\n')}

**User Experience Goals**:
- Intuitive navigation
- Clear visual hierarchy
- Engaging interactions
- Fast, responsive performance

## Constraints
**Technical Stack**:
- Next.js 14+ with App Router
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

**Design Requirements**:
- Responsive design (desktop-first, then mobile)
- Modern, clean aesthetic
- Consistent spacing and typography
- Accessible color contrast
- Smooth transitions

**Implementation Notes**:
- Use server components where possible
- Optimize images with next/image
- Implement proper SEO metadata
- Follow Next.js best practices`;
};

/**
 * Template registry
 */
export const PLATFORM_TEMPLATES: Record<Platform, (ctx: PromptContext) => string> = {
  bolt: boltTemplate,
  lovable: lovableTemplate,
  v0: v0Template,
};

/**
 * Get template function for a specific platform
 */
export function getTemplateForPlatform(platform: Platform): (ctx: PromptContext) => string {
  return PLATFORM_TEMPLATES[platform];
}

/**
 * Generate prompt for a specific platform
 */
export function generatePromptForPlatform(
  platform: Platform,
  context: PromptContext
): string {
  const template = getTemplateForPlatform(platform);
  return template(context);
}
