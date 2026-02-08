# Feature Request: AI-Powered Prompt Generation with Caching

## Problem Statement

The current prompt generator creates generic, template-based prompts. We need to upgrade it to use OpenAI GPT-4 to generate platform-optimized prompts that follow documented best practices for Bolt.new, Lovable, and v0.

**Current issues:**
- Prompts are generic and don't follow platform-specific best practices
- No customization based on user's PRD/project context
- Same basic template every time

## Requirements

### 1. Create API Route for Prompt Generation

**Endpoint:** `POST /api/generate-prompts`

**Input:**
```json
{
  "prdText": "User's project description or PRD",
  "selections": {
    "websiteType": "landing-page | ecommerce | portfolio | saas | blog | documentation",
    "visualStyle": "modern-minimal | bold-dramatic | corporate | futuristic | playful | luxury",
    "layout": "fullwidth-hero | split-hero | bento-grid | sidebar",
    "components": ["pricing", "testimonials", "contact", "faq", "newsletter", "gallery"]
  },
  "platform": "bolt | lovable | v0"
}
```

**Output:**
- For Bolt: Array of 3-4 incremental prompts
- For Lovable: Single comprehensive prompt object
- For v0: Single detailed prompt object

**Requirements:**
- Use OpenAI GPT-4 Turbo (`gpt-4-turbo-preview` model)
- Use `response_format: { type: 'json_object' }` for structured output
- Temperature: 0.7
- Max tokens: 2000
- Include platform-specific best practices in system prompts
- Handle errors gracefully (API failures, invalid responses)
- Return token usage for cost tracking

---

### 2. Platform-Specific System Prompts

Each platform needs different prompt generation logic:

#### Bolt.new Best Practices:
- Generate 3-4 SHORT incremental prompts (structure → styling → components → polish)
- Each prompt: 300-500 characters max
- Include vibe descriptors: "Apple-style minimalism", "Stripe vibes", "Netflix-like"
- Mention "Use stock photos from Unsplash" for images
- Specify "Use React, Vite, and Tailwind CSS"
- Include specific Tailwind classes (text-5xl, py-16, etc.)
- End final prompt with "Make it production-ready"
- No Lorem Ipsum - request realistic placeholder content

**Return format:**
```json
[
  { "step": 1, "title": "Structure", "prompt": "..." },
  { "step": 2, "title": "Styling", "prompt": "..." },
  { "step": 3, "title": "Components", "prompt": "..." },
  { "step": 4, "title": "Polish", "prompt": "..." }
]
```

#### Lovable Best Practices:
- Generate 1 comprehensive prompt using 5-step UI framework:
  1. Elevator Pitch (what is it?)
  2. Emotional Design Direction (how should it feel?)
  3. Visual Specifications (colors, typography, spacing)
  4. Component Details (what to build)
  5. Interaction Descriptions (how it behaves)
- Specify exact page paths: `/`, `/products`, `/product/:id`, etc.
- Define user roles: visitor, customer, admin
- Include guardrails: "Do not modify cart logic"
- Mention shadcn/ui components by name
- Specify "Use React, Tailwind CSS, and shadcn/ui"
- Include accessibility requirements

**Return format:**
```json
{
  "title": "Project Name",
  "prompt": "# Elevator Pitch\n...\n\n# Emotional Design Direction\n...\n\n# Visual Specifications\n..."
}
```

#### v0 Best Practices:
- Generate 1 detailed prompt using 3-part framework:
  - **Product Surface:** What components and data to display
  - **Context of Use:** Who uses it, when, for what decision
  - **Constraints:** Technical requirements and limitations
- Always specify: "Next.js 14 App Router, TypeScript, shadcn/ui, Tailwind CSS, lucide-react"
- Name specific shadcn/ui components: Alert, Card, Button, Dialog
- Include context (who, when, why, what decision)
- Specify accessibility: WCAG AA, keyboard navigation, ARIA labels
- Give brand references: "Think Linear.app but for X"
- Mention responsive behavior

**Return format:**
```json
{
  "title": "Component Name",
  "prompt": "## Product Surface\n...\n\n## Context of Use\n...\n\n## Constraints\n..."
}
```

---

### 3. Update Prompt Preview Component

**File:** `components/PromptPreview.tsx`

**New Features:**

#### A. Smart Caching System
- Cache generated prompts per platform separately
- Track selections used for each generation
- Only regenerate when selections change
- Show cached prompts when switching between platforms
- Save 50-75% on API costs

#### B. Explicit Generation Control
- Replace auto-generation with "Generate Prompts (~$0.02)" button
- User explicitly clicks to generate (no automatic calls)
- Show cost estimate before generating
- Add "Regenerate" button for cached prompts

#### C. Stale Detection
- Detect when selections changed since last generation
- Show "⚠️ Selections Changed" warning
- Show "Regenerate Prompts" button
- User decides whether to regenerate or use cached prompts

#### D. Cache Status Indicators
- Show green banner: "✅ Using cached prompts (saved ~$0.02)"
- Show platform-specific instructions (how to use with Bolt/Lovable/v0)
- Display token usage and cost after generation
- Add "Regenerate" option in cached view

#### E. Different Display for Each Platform
- **Bolt:** Show 4 separate prompt cards with individual copy buttons
  - Step 1: Structure
  - Step 2: Styling
  - Step 3: Components
  - Step 4: Polish
  - Include platform instructions: "Copy prompts one at a time, not all at once"
  
- **Lovable:** Show single comprehensive prompt
  - Display 5-step framework sections
  - Show "Start in Plan Mode" instructions
  
- **v0:** Show single detailed prompt
  - Display 3-part framework
  - Show "Paste and pick variation" instructions

#### F. UI/UX Improvements
- Loading state: Spinner with "Generating AI-optimized prompts..." text
- Error state: Display error with "Try Again" button
- Platform emoji badges: ⚡ Bolt, 💖 Lovable, 🔷 v0
- Color-coded cards per platform
- Copy buttons with success feedback (checkmark for 2 seconds)
- "Copy All Prompts" button for Bolt's multiple prompts

---

### 4. State Management

**Track these states:**
```typescript
interface PromptCache {
  bolt: BoltPrompt[] | null;
  lovable: SinglePrompt | null;
  v0: SinglePrompt | null;
}

interface SelectionsSnapshot {
  websiteType: string;
  visualStyle: string;
  layout: string;
  components: string[];
  prdText: string;
}
```

**Logic:**
1. When user clicks "Generate", call API for current platform only
2. Cache the returned prompts under that platform
3. Save the selections used for that generation
4. When switching platforms, check if prompts exist in cache
5. If cached, show cached prompts (don't regenerate)
6. If selections changed, show stale warning
7. User can manually click "Regenerate" anytime

---

### 5. Cost Optimization

**Goals:**
- Generate only ONE platform at a time (not all 3)
- Cache prompts per platform to avoid regeneration on platform switch
- Show cost estimates before generating (~$0.02 per generation)
- Display savings when using cached prompts
- Track and log token usage for monitoring

**Cost Tracking:**
```typescript
console.log(`✅ Generated ${platform} prompts`);
console.log(`Tokens: ${promptTokens} + ${completionTokens} = ${totalTokens}`);
console.log(`Cost: ~$${(totalTokens * 0.00001).toFixed(3)}`);
```

---

### 6. Best Practices Knowledge Base

Include these in the API route to help GPT understand platform requirements:

**Bolt.new:**
- Incremental prompts (3-4 short prompts, not 1 long)
- Vibe descriptors and brand references
- Unsplash for stock photos
- Specific Tailwind classes
- "Make it production-ready"

**Lovable:**
- 5-step UI framework
- Page paths and user roles
- Guardrails and constraints
- shadcn/ui component names
- Accessibility requirements

**v0:**
- 3-part framework (Surface/Context/Constraints)
- Who, when, why, what decision
- shadcn/ui components explicitly named
- Brand references
- Responsive behavior

---

### 7. Error Handling

**Handle these scenarios:**
- Missing OPENAI_API_KEY → Return clear error message
- OpenAI API rate limits → Show retry button
- Network errors → Allow retry
- Invalid JSON response → Parse safely
- Incomplete selections → Validate before calling API
- API timeout → Show error state

---

### 8. Testing Requirements

**Verify:**
- Bolt returns 3-4 prompts in array format
- Lovable returns 1 prompt with 5 sections
- v0 returns 1 prompt with 3 sections
- Cache works when switching platforms
- Stale detection works when selections change
- Copy buttons work for all prompts
- Cost estimates are accurate (~$0.02 per call)
- Loading states display correctly
- Error states handle gracefully

---

## Success Criteria

**Must have:**
✅ Generates platform-optimized prompts using OpenAI GPT-4
✅ Follows documented best practices for each platform
✅ Caches prompts per platform (avoid unnecessary regeneration)
✅ Explicit user control (button click, not automatic)
✅ Shows cost estimates and savings
✅ Detects stale prompts when selections change
✅ Different output format per platform (Bolt: 4 prompts, Lovable: 1, v0: 1)
✅ Platform-specific instructions displayed
✅ Copy functionality for all prompts
✅ Saves 50-75% on API costs vs auto-regeneration

**Nice to have:**
- Persist cache to localStorage (survive page refresh)
- "Generate All Platforms" option for power users
- Prompt history feature
- Export prompts to file

---

## Example User Flow

1. User completes wizard selections
2. User sees "Generate ⚡ Bolt.new Prompts (~$0.02)" button
3. User clicks → API generates 4 incremental prompts → Cached
4. User sees prompts with individual copy buttons
5. User switches to Lovable tab
6. User sees "Generate 💖 Lovable Prompts (~$0.02)" button
7. User clicks → API generates 1 comprehensive prompt → Cached
8. User switches back to Bolt tab
9. User sees cached Bolt prompts with "✅ Using cached prompts (saved ~$0.02)" banner
10. User changes layout selection
11. UI shows "⚠️ Selections Changed" with "Regenerate" button
12. User clicks "Regenerate" → Fresh prompts generated

**Total cost: $0.04** (only 2 platforms, 2 generations)

---

## Technical Notes

- Use existing OpenAI API key from `.env.local`
- Install `openai` package if not already present
- Use existing shadcn/ui components (Card, Button, etc.)
- Integrate with existing Zustand store for selections
- Maintain existing file structure and patterns
- Add this as enhancement to existing prompt generation system

---

## Priority

**High Priority:**
This significantly improves prompt quality and follows industry best practices. The caching system is essential to avoid wasting tokens and money.

**Estimated Impact:**
- 10x better prompt quality (vs basic templates)
- 50-75% cost savings (vs auto-regeneration)
- Better user experience (explicit control, platform instructions)
- Competitive advantage (no other tools do this)
