import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Lazy-initialize OpenAI client (avoid build-time errors when env var is missing)
function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Request validation schema
const RequestSchema = z.object({
  prdText: z.string().default(''),
  selections: z.object({
    websiteType: z.string(),
    visualStyle: z.string(),
    layout: z.string(),
    components: z.array(z.string()),
  }),
  platform: z.enum(['bolt', 'lovable', 'v0']),
});

// ==================== Layout Definitions (shared across all prompts) ====================

const LAYOUT_DEFINITIONS = `
LAYOUT DEFINITIONS (exact meaning of each layout):
- "Full-Width Hero": Full-viewport-width hero at the top. Navigation is a horizontal top bar. Content sections stack vertically below the hero in full-width rows.
- "Split-Screen Hero": Hero divided into two equal side-by-side columns — text/content on one side, image/visual on the other. Navigation is a horizontal top bar. Sections below may also use two-column layouts.
- "Bento Box Grid": Asymmetric grid of cards with varying column/row spans (like Apple product pages). Navigation is a horizontal top bar. Content is arranged in a CSS grid with mixed-size cards, NOT simple stacked sections.
- "Sidebar Layout": Fixed/sticky vertical navigation sidebar on the LEFT (w-64 or w-72). Main content scrolls on the RIGHT. There is NO horizontal top navigation bar. Page structure is flex row: [Sidebar | Main Content]. The sidebar holds the logo, nav links, and optionally social links. ALL other components live inside the main content area.`;

// ==================== Platform System Prompts ====================

const BOLT_SYSTEM_PROMPT = `You are an expert prompt engineer for Bolt.new. Generate 3-4 SHORT incremental prompts (pasted one at a time).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE REQUIREMENTS (non-negotiable):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. The user's selected LAYOUT STRUCTURE must be implemented exactly. Do NOT substitute with a different layout. Do NOT default to a top-navbar layout when Sidebar Layout is specified.
2. The user's selected VISUAL STYLE must drive all aesthetic decisions (colors, typography, mood).
3. Every component listed by the user MUST appear in the prompts. Do not omit any.
4. Each component must be placed correctly within the selected layout structure.
5. Tech stack: React, Vite, and Tailwind CSS.

${LAYOUT_DEFINITIONS}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENHANCEMENTS (allowed if they don't violate core):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Each prompt: 300-500 characters max
- Incremental flow: Structure → Styling → Components → Polish
- Vibe descriptors: "Apple-style minimalism", "Stripe vibes", "Netflix-like dark UI"
- "Use stock photos from Unsplash" for image placeholders
- Specific Tailwind classes (text-5xl, py-16, rounded-2xl, etc.)
- Final prompt ends with "Make it production-ready"
- No Lorem Ipsum — use realistic placeholder content
- Specific layout classes: "max-w-6xl mx-auto", "grid grid-cols-3 gap-8"

PROMPT STRUCTURE RULE:
- Prompt 1 (Structure) MUST explicitly implement the selected layout with Tailwind classes. For Sidebar Layout: "flex min-h-screen" with a "w-64 fixed sidebar" and "ml-64 flex-1 main content". For Bento Grid: "grid grid-cols-4 grid-rows-3 gap-4" with varied spans.
- Prompts 2-4 build on top without changing the layout.

You MUST return valid JSON in this exact format:
{
  "prompts": [
    { "step": 1, "title": "Structure", "prompt": "..." },
    { "step": 2, "title": "Styling", "prompt": "..." },
    { "step": 3, "title": "Components", "prompt": "..." },
    { "step": 4, "title": "Polish", "prompt": "..." }
  ]
}`;

const LOVABLE_SYSTEM_PROMPT = `You are an expert prompt engineer for Lovable. Generate ONE comprehensive prompt using the 5-step UI framework.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE REQUIREMENTS (non-negotiable):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. The user's selected LAYOUT STRUCTURE must be implemented exactly. Do NOT substitute with a different layout. Do NOT use a top navigation bar when Sidebar Layout is specified.
2. The user's selected VISUAL STYLE must drive all aesthetic decisions.
3. Every component listed by the user MUST appear in "# Component Details" with placement described within the layout.
4. Each component description must specify WHERE it sits in the layout (e.g., "in the left sidebar" or "in the main content area" or "spanning the full grid width").
5. Tech stack: React, Tailwind CSS, and shadcn/ui.

${LAYOUT_DEFINITIONS}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENHANCEMENTS (allowed if they don't violate core):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 5-step framework: Elevator Pitch → Emotional Design Direction → Visual Specifications → Component Details → Interaction Descriptions
- Page paths: /, /gallery, /about, /pricing, /contact
- User roles: visitor, customer, admin
- Guardrails: "Do not modify the sidebar structure", "Keep the layout as described"
- Reference shadcn/ui components by name: Button, Card, Dialog, Sheet, Tabs
- Accessibility: focus states, ARIA labels, keyboard navigation
- Markdown headers for each section
- Hex color codes, font families, spacing system, border radius in Visual Specifications

LAYOUT IN COMPONENT DETAILS:
- The "# Component Details" section MUST start with a "## Page Layout Structure" subsection that describes the overall page skeleton with Tailwind classes.
- For Sidebar Layout: "The page uses flex. A fixed w-64 sidebar on the left contains logo and navigation. The main content area (flex-1 ml-64) scrolls independently on the right. There is no top navigation bar."
- For Bento Box Grid: "Content is arranged in a CSS grid (grid-cols-4 gap-6) with cards spanning varying columns and rows."
- THEN list each component under this layout context.

You MUST return valid JSON in this exact format:
{
  "title": "Project Name",
  "prompt": "# Elevator Pitch\\n...\\n\\n# Emotional Design Direction\\n...\\n\\n# Visual Specifications\\n...\\n\\n# Component Details\\n...\\n\\n# Interaction Descriptions\\n..."
}`;

const V0_SYSTEM_PROMPT = `You are an expert prompt engineer for v0 by Vercel. Generate ONE detailed prompt using the 3-part framework.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE REQUIREMENTS (non-negotiable):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. The user's selected LAYOUT STRUCTURE must be implemented exactly. Do NOT substitute with a different layout. Do NOT use a top navigation bar when Sidebar Layout is specified.
2. The user's selected VISUAL STYLE must drive all aesthetic decisions.
3. Every component listed by the user MUST appear in "## Product Surface" with placement described within the layout.
4. "## Product Surface" MUST open with an explicit layout skeleton using Tailwind classes before listing components.
5. Tech stack: Next.js 14 App Router, TypeScript, shadcn/ui, Tailwind CSS, lucide-react.

${LAYOUT_DEFINITIONS}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENHANCEMENTS (allowed if they don't violate core):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 3-part framework: Product Surface → Context of Use → Constraints
- Name specific shadcn/ui components: Alert, Card, Button, Dialog, Sheet, Table, Tabs, Badge
- Context: who uses it, when, for what purpose, what decisions they make
- Accessibility: WCAG AA, keyboard navigation, ARIA labels, focus management
- Brand references: "Think Linear.app but for X", "Notion-like simplicity"
- Responsive behavior: "Mobile-first, sidebar collapses to drawer below md breakpoint"
- Data shape hints: "Display items with name, price, category, status"
- ## markdown headers for each section

LAYOUT IN PRODUCT SURFACE:
- "## Product Surface" MUST begin with: "**Layout:** [layout name] — [Tailwind implementation]"
- For Sidebar Layout: "**Layout:** Sidebar Layout — flex min-h-screen. Fixed w-64 sidebar on the left with logo, navigation links (Home, Gallery, About, Pricing, Contact), and social links. Main content area (flex-1 ml-64 p-8) scrolls on the right. No top navigation bar."
- For Bento Box Grid: "**Layout:** Bento Box Grid — grid grid-cols-4 gap-6 with cards spanning 1-2 columns and 1-2 rows."
- THEN list each component with its grid/layout position.

You MUST return valid JSON in this exact format:
{
  "title": "Component Name",
  "prompt": "## Product Surface\\n...\\n\\n## Context of Use\\n...\\n\\n## Constraints\\n..."
}`;

// ==================== Response Validation ====================

const BoltResponseSchema = z.object({
  prompts: z.array(
    z.object({
      step: z.number(),
      title: z.string(),
      prompt: z.string(),
    })
  ),
});

const SinglePromptResponseSchema = z.object({
  title: z.string(),
  prompt: z.string(),
});

// ==================== Route Handler ====================

export async function POST(request: NextRequest) {
  try {
    // Validate request
    const body = await request.json();
    const { prdText, selections, platform } = RequestSchema.parse(body);

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Select system prompt based on platform
    const systemPromptMap: Record<string, string> = {
      bolt: BOLT_SYSTEM_PROMPT,
      lovable: LOVABLE_SYSTEM_PROMPT,
      v0: V0_SYSTEM_PROMPT,
    };
    const systemPrompt = systemPromptMap[platform];

    // Build user prompt with selections and optional PRD context
    const userPrompt = buildUserPrompt(prdText, selections);

    // Call OpenAI API
    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse and validate response based on platform
    const parsed = JSON.parse(aiResponse);
    const tokenUsage = {
      prompt: completion.usage?.prompt_tokens ?? 0,
      completion: completion.usage?.completion_tokens ?? 0,
      total: completion.usage?.total_tokens ?? 0,
    };

    // Log token usage for cost tracking
    console.log(`Generated ${platform} prompts`);
    console.log(`Tokens: ${tokenUsage.prompt} + ${tokenUsage.completion} = ${tokenUsage.total}`);
    console.log(`Cost: ~$${(tokenUsage.total * 0.00001).toFixed(4)}`);

    if (platform === 'bolt') {
      const validated = BoltResponseSchema.parse(parsed);
      return NextResponse.json({
        bolt: validated.prompts,
        tokenUsage,
      });
    } else if (platform === 'lovable') {
      const validated = SinglePromptResponseSchema.parse(parsed);
      return NextResponse.json({
        lovable: validated,
        tokenUsage,
      });
    } else {
      const validated = SinglePromptResponseSchema.parse(parsed);
      return NextResponse.json({
        v0: validated,
        tokenUsage,
      });
    }
  } catch (err) {
    console.error('Prompt generation error:', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: err.issues.map((e) => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    if (err instanceof Error) {
      if (err.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid or missing API key' },
          { status: 500 }
        );
      }

      if (err.message.includes('Rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a moment and try again.' },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Prompt generation failed. Please try again.' },
      { status: 500 }
    );
  }
}

// ==================== Helpers ====================

// Layout descriptions for the user prompt
const LAYOUT_DETAILS: Record<string, string> = {
  'Full-Width Hero': 'Full-viewport-width hero at top, stacked content sections below. Horizontal top navigation bar.',
  'Split-Screen Hero': 'Hero split into two equal side-by-side columns (text left, image right). Horizontal top navigation bar.',
  'Bento Box Grid': 'Asymmetric CSS grid of cards with varying column/row spans (like Apple product pages). Horizontal top navigation bar. No simple stacked sections.',
  'Sidebar Layout': 'Fixed vertical sidebar navigation on the LEFT (w-64). Main content scrolls on the RIGHT (flex-1 ml-64). NO horizontal top navigation bar. Page is flex row: [Sidebar | Main Content].',
};

function buildUserPrompt(
  prdText: string,
  selections: {
    websiteType: string;
    visualStyle: string;
    layout: string;
    components: string[];
  }
): string {
  const layoutDetail = LAYOUT_DETAILS[selections.layout] || selections.layout;

  let prompt = `Generate prompts for this website project.

━━━ CORE REQUIREMENTS (cannot be changed) ━━━
- Website Type: ${selections.websiteType}
- Visual Style: ${selections.visualStyle}
- Layout Structure: ${selections.layout}
  → ${layoutDetail}
- Required Components (ALL must be included): ${selections.components.join(', ')}

CONSTRAINT: The layout "${selections.layout}" is non-negotiable. Every component must be positioned within this layout. ${
    selections.layout === 'Sidebar Layout'
      ? 'Navigation MUST be in a fixed left sidebar (w-64). There is NO top nav bar. Main content is to the right of the sidebar.'
      : selections.layout === 'Bento Box Grid'
      ? 'Content MUST use an asymmetric CSS grid with varying card sizes. No simple vertical stacking.'
      : selections.layout === 'Split-Screen Hero'
      ? 'Hero MUST be two equal columns side by side. Not stacked vertically.'
      : ''
  }

━━━ ENHANCEMENTS (allowed if they respect core) ━━━
- Add appropriate micro-interactions, animations, hover states
- Suggest color palette and typography that match the visual style
- Add accessibility best practices
- Include realistic placeholder content (no Lorem Ipsum)
- Add responsive behavior descriptions`;

  if (prdText && prdText.trim().length > 0) {
    prompt += `

━━━ PROJECT CONTEXT (from PRD) ━━━
${prdText}`;
  }

  prompt += `

Generate now, following the exact JSON format from your instructions.`;

  return prompt;
}
