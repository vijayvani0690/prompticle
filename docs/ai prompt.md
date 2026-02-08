# CLAUDE CODE PROMPT: Add AI-Powered Prompt Generation

## Objective

Enhance the existing PromptCraft application by replacing the basic prompt generator with an AI-powered system that uses OpenAI GPT-4 to generate platform-optimized prompts following documented best practices for Bolt.new, Lovable, and v0.

---

## Context

The app currently has a basic prompt generator in `lib/prompt-generator.ts` that creates generic prompts. We need to upgrade this to use OpenAI to generate **platform-specific, best-practice-following prompts** that are much more detailed and effective.

**Current State:**
- App runs on http://localhost:3004
- Users select: website type, visual style, layout, components
- Users can optionally provide PRD text
- App has platform switcher (Bolt, Lovable, v0)
- Basic prompts are generated client-side

**Desired State:**
- API route calls OpenAI GPT-4 Turbo to generate prompts
- Prompts follow platform-specific best practices
- Bolt: Returns 3-4 incremental prompts
- Lovable: Returns 1 comprehensive prompt (5-step framework)
- v0: Returns 1 detailed prompt (3-part framework)
- Better UI with copy buttons, loading states, platform instructions

---

## Implementation Tasks

### TASK 1: Create the OpenAI API Route

**File:** `app/api/generate-prompts/route.ts`

Create a new API route that:

1. **Accepts POST request with:**
   ```typescript
   {
     prdText: string,
     selections: {
       websiteType: string,
       visualStyle: string,
       layout: string,
       components: string[]
     },
     platform: 'bolt' | 'lovable' | 'v0'
   }
   ```

2. **Uses OpenAI GPT-4 Turbo** (`gpt-4-turbo-preview` model)

3. **Has platform-specific system prompts:**

   **For Bolt.new:**
   ```
   You are an expert at creating prompts for Bolt.new.
   
   Generate 3-4 SHORT, INCREMENTAL prompts:
   - Prompt 1: Structure only (HTML/layout)
   - Prompt 2: Styling (colors, typography, spacing)
   - Prompt 3: Components and features
   - Prompt 4: Polish and interactions (optional)
   
   KEY RULES:
   - Each prompt: 300-500 characters max
   - Use vibe descriptors: "Apple-style minimalism", "Netflix-like"
   - Mention "Use stock photos from Unsplash" in Prompt 2
   - Always specify: "Use React, Vite, and Tailwind CSS" in Prompt 1
   - Say "Make it production-ready" in final prompt
   - Include specific Tailwind classes (text-5xl, py-16)
   - No Lorem Ipsum - request realistic content
   - Use brand references: "Think Stripe", "Apple vibes"
   
   Return JSON array:
   [
     {
       "step": 1,
       "title": "Structure",
       "prompt": "..."
     },
     ...
   ]
   ```

   **For Lovable:**
   ```
   You are an expert at creating prompts for Lovable.
   
   Generate ONE comprehensive prompt using 5-STEP UI FRAMEWORK:
   1. Elevator Pitch (what is it?)
   2. Emotional Design Direction (how should it feel?)
   3. Visual Specifications (colors, typography, spacing)
   4. Component Details (what to build)
   5. Interaction Descriptions (how it behaves)
   
   KEY RULES:
   - Specify exact page paths: /, /products, /product/:id
   - Define user roles: visitor, customer, admin
   - Include guardrails: "Do not modify cart logic"
   - Mention shadcn/ui components by name
   - Always specify: "Use React, Tailwind CSS, and shadcn/ui"
   - Include accessibility requirements
   - Be very detailed about component hierarchy
   
   Return JSON object:
   {
     "title": "Project Name",
     "prompt": "# Elevator Pitch\n...\n\n# Emotional Design Direction\n..."
   }
   ```

   **For v0:**
   ```
   You are an expert at creating prompts for v0 by Vercel.
   
   Generate ONE prompt using THREE-PART FRAMEWORK:
   
   ## Product Surface
   (What components and data to display)
   
   ## Context of Use  
   (Who uses it, when, for what decision)
   
   ## Constraints
   (Technical requirements and limitations)
   
   KEY RULES:
   - Always specify: "Next.js 14 App Router, TypeScript, shadcn/ui, Tailwind CSS, lucide-react"
   - Name specific shadcn/ui components: Alert, Card, Button, Dialog
   - Include context (who, when, why, what decision)
   - Specify accessibility: WCAG AA, keyboard navigation, ARIA labels
   - Give brand references: "Think Linear.app but for X"
   - Include responsive behavior
   
   Return JSON object:
   {
     "title": "Component Name",
     "prompt": "## Product Surface\n...\n\n## Context of Use\n...\n\n## Constraints\n..."
   }
   ```

4. **Include Best Practices Knowledge Base:**

   Add these constants to help GPT understand platform requirements:

   ```typescript
   const PLATFORM_BEST_PRACTICES = {
     bolt: `
   BOLT.NEW BEST PRACTICES:
   - Use INCREMENTAL prompts (3-4 short prompts, not 1 long one)
   - Keep each under 500 characters
   - Use vibe descriptors: "Apple-style minimalism", "Stripe vibes"
   - Mention Unsplash for stock photos
   - Specify tech stack: "Use React, Vite, and Tailwind CSS"
   - Include specific Tailwind classes where helpful
   - No Lorem Ipsum - realistic placeholder content
   - End with "Make it production-ready"
     `,
     
     lovable: `
   LOVABLE BEST PRACTICES:
   - Use 5-step UI framework
   - Specify exact page paths (/, /products, etc.)
   - Define user roles (visitor, customer, admin)
   - Include guardrails ("Do not modify X")
   - Mention shadcn/ui components by name
   - Detail component hierarchy
   - Include Supabase schema if backend needed
   - Always: "Use React, Tailwind CSS, and shadcn/ui"
     `,
     
     v0: `
   V0 BEST PRACTICES:
   - Use 3-part framework: Product Surface / Context / Constraints
   - Always specify: "Next.js 14 App Router, TypeScript, shadcn/ui, Tailwind CSS, lucide-react"
   - Name shadcn/ui components explicitly
   - Include who uses it, when, for what decision
   - Specify accessibility (WCAG AA, keyboard nav)
   - Give brand references: "Think Stripe but for X"
   - Mention responsive behavior
     `
   };
   ```

5. **Build user message with all context:**

   ```typescript
   const userMessage = `
   Generate ${platform === 'bolt' ? '3-4 incremental prompts' : 'a comprehensive prompt'} for this project:
   
   PROJECT DESCRIPTION:
   ${prdText}
   
   USER SELECTIONS:
   - Website Type: ${selections.websiteType}
   - Visual Style: ${selections.visualStyle}
   - Layout: ${selections.layout}
   - Components: ${selections.components.join(', ')}
   
   PLATFORM BEST PRACTICES TO FOLLOW:
   ${PLATFORM_BEST_PRACTICES[platform]}
   
   Generate the ${platform === 'bolt' ? 'prompts array' : 'prompt object'} following your system instructions.
   `.trim();
   ```

6. **Call OpenAI with JSON mode:**

   ```typescript
   const completion = await openai.chat.completions.create({
     model: 'gpt-4-turbo-preview',
     messages: [
       { role: 'system', content: SYSTEM_PROMPTS[platform] },
       { role: 'user', content: userMessage }
     ],
     response_format: { type: 'json_object' },
     temperature: 0.7,
     max_tokens: 2000,
   });
   ```

7. **Return formatted response:**

   ```typescript
   return NextResponse.json({
     success: true,
     platform,
     prompts: JSON.parse(completion.choices[0].message.content),
     usage: {
       promptTokens: completion.usage?.prompt_tokens,
       completionTokens: completion.usage?.completion_tokens,
       totalTokens: completion.usage?.total_tokens,
     }
   });
   ```

8. **Error handling:**
   - Catch OpenAI API errors
   - Handle missing API key
   - Handle JSON parsing errors
   - Return proper error responses with status codes

---

### TASK 2: Update the Prompt Preview Component

**File:** `components/PromptPreview.tsx`

Update the existing component to:

1. **Call the new API route:**

   ```typescript
   const generatePrompts = async () => {
     setIsGenerating(true);
     
     try {
       const response = await fetch('/api/generate-prompts', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           prdText: prdText || `A ${selectedType} with ${selectedStyle} design.`,
           selections: {
             websiteType: selectedType,
             visualStyle: selectedStyle,
             layout: selectedLayout,
             components: selectedComponents,
           },
           platform,
         }),
       });
       
       const data = await response.json();
       setGeneratedPrompts(data.prompts);
     } catch (err) {
       setError(err.message);
     } finally {
       setIsGenerating(false);
     }
   };
   ```

2. **Auto-generate on selection change:**

   ```typescript
   useEffect(() => {
     if (selectedType && selectedStyle && selectedLayout) {
       generatePrompts();
     }
   }, [selectedType, selectedStyle, selectedLayout, selectedComponents, platform, prdText]);
   ```

3. **Handle Bolt's multiple prompts (array) vs Lovable/v0's single prompt (object):**

   ```typescript
   // If array (Bolt)
   if (Array.isArray(generatedPrompts)) {
     return (
       <div>
         {generatedPrompts.map((promptObj, index) => (
           <Card key={index}>
             <CardHeader>
               <CardTitle>Step {promptObj.step}: {promptObj.title}</CardTitle>
             </CardHeader>
             <CardContent>
               <pre>{promptObj.prompt}</pre>
               <Button onClick={() => copy(promptObj.prompt)}>
                 Copy Step {promptObj.step}
               </Button>
             </CardContent>
           </Card>
         ))}
       </div>
     );
   }
   
   // If object (Lovable/v0)
   return (
     <Card>
       <CardHeader>
         <CardTitle>{generatedPrompts.title}</CardTitle>
       </CardHeader>
       <CardContent>
         <pre>{generatedPrompts.prompt}</pre>
         <Button onClick={() => copy(generatedPrompts.prompt)}>Copy</Button>
       </CardContent>
     </Card>
   );
   ```

4. **Add platform-specific instructions:**

   Show different usage instructions for each platform:

   - **Bolt:** "Copy prompts one at a time. Paste Prompt 1, wait for it to build, then Prompt 2, etc."
   - **Lovable:** "Start in Plan Mode. Paste entire prompt. Review plan, then approve."
   - **v0:** "Paste entire prompt. v0 generates 3 variations. Pick your favorite."

5. **Add visual polish:**
   - Loading spinner with "Generating AI-optimized prompts..." text
   - Error states with retry button
   - Platform emoji badges (⚡ Bolt, 💖 Lovable, 🔷 v0)
   - Color-coded cards per platform
   - Success checkmark when copied

6. **Add copy functionality:**

   ```typescript
   const copyToClipboard = async (text: string, index?: number) => {
     await navigator.clipboard.writeText(text);
     setCopiedIndex(index ?? 0);
     setTimeout(() => setCopiedIndex(null), 2000);
   };
   ```

---

### TASK 3: Install Dependencies

If `openai` package is not already installed:

```bash
npm install openai
```

---

### TASK 4: Environment Variable

Ensure `.env.local` has:

```
OPENAI_API_KEY=your_api_key_here
```

---

### TASK 5: Add shadcn/ui Components (if missing)

The updated UI needs these shadcn/ui components:

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add tabs
```

---

## Expected Output Examples

### For Bolt.new (Landing Page, Modern Minimal, Split Hero):

**Prompt 1 (Structure):**
```
Create a landing page for TaskFlow project management.

STRUCTURE ONLY (no styling yet):

Split-screen hero:
- LEFT (50%): Heading (text-5xl), subheading, two CTAs, feature list
- RIGHT (50%): Dashboard mockup placeholder

Below: Pricing table (3 tiers), Testimonials (3 cards), Footer

Use React, Vite, and Tailwind CSS.
```

**Prompt 2 (Styling):**
```
Apply modern minimal style:

Colors: White bg, charcoal text (#1F2937), blue accent (#3B82F6)
Typography: Inter font, font-semibold, leading-relaxed
Spacing: Generous whitespace (py-16), clean padding (p-6)
Effects: Subtle shadows (shadow-sm), minimal borders

Use stock photos from Unsplash.
Think Apple or Stripe - calm, spacious, focused.
```

**Prompt 3 (Components):**
```
Add pricing and testimonials:

Pricing: 3 cards, highlight middle tier, "Most Popular" badge
Testimonials: 3 quotes with avatars, bg-gray-50 cards

Match minimal aesthetic.
```

**Prompt 4 (Polish):**
```
Final touches:

- Hover effects (scale-105, shadow-lg)
- Mobile responsive (stack vertically)
- Realistic content (no Lorem Ipsum)
- Smooth transitions

Make it production-ready.
```

### For Lovable (Same selections):

**Single comprehensive prompt:**
```markdown
# Elevator Pitch
Landing page for TaskFlow, a project management SaaS for small teams

Target: 5-50 person tech teams
Goal: Free trial signups

# Emotional Design Direction
Modern minimal aesthetic conveying professionalism and calm

Feel: Confident, organized, in control
References: Apple, Stripe, Linear.app

# Visual Specifications

Layout: Split-screen hero (50/50)

Colors:
- Primary: Soft Blue (#3B82F6)
- Background: White (#FFFFFF)
- Text: Charcoal (#1F2937)

Typography:
- Font: Inter
- Headings: font-semibold (600)
- Body: text-base, leading-relaxed

Spacing:
- Section padding: py-16
- Card padding: p-6 to p-8

# Component Details

## Pages
- / (Homepage)
- /pricing (Future)
- /signup (Future)

## User Roles
- visitor: View content, click CTAs
- trial-user: After signup

## Split-Screen Hero
LEFT:
- H1: "Manage Projects Effortlessly" (text-5xl)
- Subheading (text-xl)
- CTAs: "Start Free Trial" (blue), "Watch Demo" (outline)
- Feature list (3 items, checkmarks)

RIGHT:
- Dashboard mockup (Unsplash)
- Subtle shadow

## Pricing Table
- shadcn/ui Card components
- 3 tiers: Basic $9, Pro $29, Enterprise $99
- Highlight middle (scale-105, "Most Popular")
- Each: name, price, 5-7 features, CTA

## Testimonials
- 3 cards (grid-cols-3)
- Quote, name, company, avatar, 5-star rating

# Interaction Patterns

Navigation: Simple header, mobile hamburger
Hover: Subtle shadow increase
Animations: Fade-in on scroll
Responsive: Stack on mobile

# Technical Requirements

- React with TypeScript
- Tailwind CSS
- shadcn/ui: Card, Button, Avatar, Badge
- lucide-react icons: Check, Star
- Accessibility: ARIA labels, keyboard nav

# Guardrails

- Do NOT use Lorem Ipsum
- Do NOT create complex animations
- DO maintain blue/white/gray palette
- DO ensure consistent spacing

# Success Criteria

1. Professional SaaS landing page
2. Calm, minimal, trustworthy feel
3. Fully responsive
4. Smooth interactions
5. Production-ready
```

### For v0 (Same selections):

**Single three-part prompt:**
```markdown
## Product Surface

Landing page for TaskFlow with:

Components:
- Split-screen hero (text left, mockup right)
- Pricing table (3 tiers)
- Testimonials (3 cards)
- Footer

Data:
- Heading: "Manage Projects Effortlessly"
- Pricing: Basic $9, Pro $29, Enterprise $99
- 3 testimonials with quotes

Actions:
- "Start Free Trial" → /signup
- Click tier → /signup?plan=X

## Context of Use

Who: Tech team leads evaluating PM tools
When: During vendor research, desktop, work hours
Decision: Trial vs. continue research vs. contact sales
Device: 70% desktop, 30% mobile

## Constraints

Design: Modern minimal (Apple/Stripe aesthetic)
Colors: Blue (#3B82F6), white, charcoal (#1F2937)
Typography: Inter, generous spacing

Layout: Split-screen hero 50/50, stack on mobile

Tech Stack:
- Next.js 14 App Router
- TypeScript
- shadcn/ui: Card, Button, Avatar, Badge
- Tailwind CSS
- lucide-react icons

Components:
- shadcn/ui Card for pricing and testimonials
- Button variants: default (primary), outline (secondary)
- Avatar for testimonial photos

Responsive:
- Desktop: Full split, 3-col pricing
- Tablet: Stacked hero, 2-col pricing
- Mobile: All stacked, full-width CTAs

Accessibility:
- WCAG AA contrast
- Keyboard navigation
- ARIA labels
- Semantic HTML

Brand: Think Stripe meets Linear.app - clean, confident, minimal
```

---

## Testing Checklist

After implementation, verify:

- [ ] API route exists at `/api/generate-prompts`
- [ ] Prompts generate when selections are made
- [ ] Bolt returns 3-4 prompts (array)
- [ ] Lovable returns 1 prompt (object with 5 sections)
- [ ] v0 returns 1 prompt (object with 3 sections)
- [ ] Copy buttons work
- [ ] Loading state displays
- [ ] Error handling works
- [ ] Platform instructions show correctly
- [ ] Can regenerate prompts
- [ ] Works for all website types and styles
- [ ] Prompts include best practices (vibe descriptors, brand references, etc.)

---

## Important Notes

1. **API Key Security:**
   - Never commit `.env.local` to git
   - API key is only used in server-side API route (secure)
   - Frontend never sees the API key

2. **Cost:**
   - ~$0.015-0.025 per generation
   - 100 generations ≈ $2.00
   - Set spending limits in OpenAI dashboard

3. **Quality:**
   - Prompts will be unique each time (GPT's creativity)
   - Temperature 0.7 balances consistency and variety
   - Can adjust temperature lower (0.3-0.5) for more consistent results

4. **Performance:**
   - Prompt generation takes 2-3 seconds
   - Show loading spinner during generation
   - Cache results on frontend to avoid re-generating

5. **Error Handling:**
   - Handle API rate limits gracefully
   - Show retry button on errors
   - Fallback to basic prompt if API fails

---

## Success Criteria

After implementation:

✅ Users can generate platform-optimized prompts automatically
✅ Prompts follow documented best practices for each platform
✅ Bolt users get 3-4 incremental prompts to paste one at a time
✅ Lovable users get comprehensive 5-step framework prompt
✅ v0 users get detailed 3-part framework prompt
✅ UI shows platform-specific instructions
✅ Copy functionality works smoothly
✅ Loading and error states are handled
✅ Costs are reasonable (~$2 per 100 generations)

---

## Final Notes

This upgrade transforms PromptCraft from a basic template generator into an **AI-powered prompt optimization engine**. The prompts will be significantly better than hand-written templates because:

1. They incorporate platform-specific best practices automatically
2. They adapt to user's specific project context (PRD)
3. They include vibe descriptors, brand references, guardrails
4. They're detailed enough to produce great results
5. They improve as GPT models improve

Start implementing and test with different combinations of website types, styles, and layouts to see the quality difference!
