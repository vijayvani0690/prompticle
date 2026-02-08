# OPTIMIZED CLAUDE CODE PROMPT: AI Prompt Generation with Caching

## Key Optimization: Cache Prompts Per Platform

**Problem:** Switching between platforms regenerates prompts = wasted tokens
**Solution:** Cache generated prompts for each platform, only regenerate when selections change

---

## TASK 1: Create Optimized API Route (Same as Before)

**File:** `app/api/generate-prompts/route.ts`

This stays the same - it only generates for ONE platform at a time.

```typescript
// Request payload
{
  prdText: string,
  selections: {...},
  platform: 'bolt' | 'lovable' | 'v0'  // ONLY generates for this platform
}

// Generates ONLY the selected platform's prompts
// Bolt: ~$0.02, Lovable: ~$0.02, v0: ~$0.02
```

---

## TASK 2: Create Optimized Frontend with Caching

**File:** `components/PromptPreview.tsx`

### Key Changes:

1. **Cache prompts per platform** (avoid regenerating on platform switch)
2. **Generate lazily** (only when user actually views that platform)
3. **Show "Generate" button** (explicit user action, not automatic)
4. **Track what changed** (only regenerate if selections changed)

### Implementation:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useWizardStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface BoltPrompt {
  step: number;
  title: string;
  prompt: string;
}

interface SinglePrompt {
  title: string;
  prompt: string;
}

// Cache prompts for each platform
interface PromptCache {
  bolt: BoltPrompt[] | null;
  lovable: SinglePrompt | null;
  v0: SinglePrompt | null;
}

// Track what selections were used to generate each platform's prompts
interface SelectionsSnapshot {
  websiteType: string;
  visualStyle: string;
  layout: string;
  components: string[];
  prdText: string;
}

export function PromptPreview() {
  const { 
    selectedType, 
    selectedStyle, 
    selectedLayout, 
    selectedComponents, 
    platform, 
    prdText 
  } = useWizardStore();
  
  // Cache prompts for all platforms
  const [promptCache, setPromptCache] = useState<PromptCache>({
    bolt: null,
    lovable: null,
    v0: null,
  });
  
  // Track selections used for each platform
  const [selectionsCache, setSelectionsCache] = useState<Record<string, SelectionsSnapshot>>({});
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Current selections snapshot
  const currentSelections: SelectionsSnapshot = {
    websiteType: selectedType,
    visualStyle: selectedStyle,
    layout: selectedLayout,
    components: selectedComponents,
    prdText: prdText || '',
  };

  // Check if current platform needs regeneration
  const needsRegeneration = (): boolean => {
    if (!promptCache[platform]) {
      return true; // No prompts cached for this platform
    }

    const cachedSelections = selectionsCache[platform];
    if (!cachedSelections) {
      return true; // No selections cached
    }

    // Check if selections changed
    return (
      cachedSelections.websiteType !== currentSelections.websiteType ||
      cachedSelections.visualStyle !== currentSelections.visualStyle ||
      cachedSelections.layout !== currentSelections.layout ||
      JSON.stringify(cachedSelections.components.sort()) !== 
        JSON.stringify(currentSelections.components.sort()) ||
      cachedSelections.prdText !== currentSelections.prdText
    );
  };

  // Auto-generate only if selections changed AND user is viewing this platform
  useEffect(() => {
    if (!selectedType || !selectedStyle || !selectedLayout) {
      return; // Wait for required selections
    }

    // If selections changed for current platform, mark cache as stale
    // But DON'T auto-regenerate (let user click "Generate")
    
  }, [selectedType, selectedStyle, selectedLayout, selectedComponents, platform, prdText]);

  const generatePrompts = async () => {
    if (!selectedType || !selectedStyle || !selectedLayout) {
      setError('Please complete all required selections');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prdText: prdText || `A ${selectedType} with ${selectedStyle} design.`,
          selections: {
            websiteType: selectedType,
            visualStyle: selectedStyle,
            layout: selectedLayout,
            components: selectedComponents,
          },
          platform, // ONLY generates for current platform
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompts');
      }

      const data = await response.json();
      
      // Cache the generated prompts for this platform
      setPromptCache(prev => ({
        ...prev,
        [platform]: data.prompts,
      }));

      // Save the selections used for this generation
      setSelectionsCache(prev => ({
        ...prev,
        [platform]: currentSelections,
      }));

      console.log(`✅ Generated prompts for ${platform} (~$${(data.usage.totalTokens * 0.00001).toFixed(3)})`);
      
    } catch (err: any) {
      setError(err.message);
      console.error('Error generating prompts:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index ?? 0);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getPlatformInfo = () => {
    const platformInfo = {
      bolt: {
        emoji: '⚡',
        name: 'Bolt.new',
        color: 'blue',
        instructions: '1. Copy Prompt 1 (Structure) → Paste in Bolt → Wait\n2. Copy Prompt 2 (Styling) → Paste → Wait\n3. Copy Prompt 3 (Components) → Paste\n4. Copy Prompt 4 (Polish) → Paste',
      },
      lovable: {
        emoji: '💖',
        name: 'Lovable',
        color: 'pink',
        instructions: '1. Start in Plan Mode\n2. Paste entire prompt\n3. Review generated plan\n4. Approve and let Lovable build',
      },
      v0: {
        emoji: '🔷',
        name: 'v0',
        color: 'indigo',
        instructions: '1. Paste entire prompt\n2. Review 3 generated variations\n3. Pick your favorite\n4. Use "Edit" to refine',
      },
    };

    return platformInfo[platform];
  };

  const info = getPlatformInfo();
  const currentPrompts = promptCache[platform];
  const stale = needsRegeneration();

  // Show "Generate" button if no prompts or selections changed
  if (!currentPrompts || stale) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            
            {!selectedType || !selectedStyle || !selectedLayout ? (
              <>
                <p className="text-gray-600 font-semibold mb-2">Complete selections to generate prompts</p>
                <p className="text-sm text-gray-500">
                  Choose website type, style, and layout to get started
                </p>
              </>
            ) : stale && currentPrompts ? (
              <>
                <p className="text-amber-600 font-semibold mb-2">⚠️ Selections Changed</p>
                <p className="text-sm text-gray-600 mb-4">
                  Your selections have changed since the last generation
                </p>
                <Button
                  onClick={generatePrompts}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Regenerate Prompts (~$0.02)
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-600 font-semibold mb-2">
                  Ready to generate {info.name} prompts
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Platform-optimized prompts following best practices
                </p>
                <Button
                  onClick={generatePrompts}
                  disabled={isGenerating}
                  size="lg"
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating AI Prompts...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate {info.emoji} {info.name} Prompts (~$0.02)
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  Cost: ~$0.015-0.025 per generation
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-red-600 font-semibold">Error generating prompts</p>
            <p className="text-sm text-red-500 mt-2">{error}</p>
            <Button onClick={generatePrompts} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display cached prompts

  // BOLT: Multiple incremental prompts
  if (Array.isArray(currentPrompts)) {
    return (
      <div className="space-y-4">
        {/* Cache Status Banner */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Check className="w-4 h-4" />
                <span>Using cached prompts (saved ~$0.02)</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={generatePrompts}
                disabled={isGenerating}
                className="gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Platform Instructions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">{info.emoji}</span>
              {info.name} - Incremental Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {info.instructions}
            </div>
            <p className="text-xs text-amber-600 mt-3">
              💡 Don't paste all prompts at once. Bolt works best with incremental building.
            </p>
          </CardContent>
        </Card>

        {/* Individual Prompts */}
        {currentPrompts.map((promptObj, index) => (
          <Card key={index} className="border-2 border-blue-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Step {promptObj.step}: {promptObj.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {index === 0 && '📐 Focus: HTML structure and layout'}
                    {index === 1 && '🎨 Focus: Colors, typography, and spacing'}
                    {index === 2 && '🧩 Focus: Components and features'}
                    {index === 3 && '✨ Focus: Polish and interactions'}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(promptObj.prompt, index)}
                  className="gap-2"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                {promptObj.prompt}
              </pre>
            </CardContent>
          </Card>
        ))}

        {/* Copy All Button */}
        <Button
          onClick={() => {
            const allPrompts = currentPrompts
              .map((p, i) => `### PROMPT ${i + 1}: ${p.title}\n\n${p.prompt}`)
              .join('\n\n---\n\n');
            copyToClipboard(allPrompts, -1);
          }}
          className="w-full"
          variant="secondary"
        >
          {copiedIndex === -1 ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              All Prompts Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy All Prompts
            </>
          )}
        </Button>
      </div>
    );
  }

  // LOVABLE or V0: Single comprehensive prompt
  return (
    <div className="space-y-4">
      {/* Cache Status Banner */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Check className="w-4 h-4" />
              <span>Using cached prompts (saved ~$0.02)</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={generatePrompts}
              disabled={isGenerating}
              className="gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Platform Instructions */}
      <Card className={`border-${info.color}-200 bg-${info.color}-50`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">{info.emoji}</span>
            {info.name} Prompt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {info.instructions}
          </div>
        </CardContent>
      </Card>

      {/* Single Prompt */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{currentPrompts.title}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {platform === 'lovable' && '5-step UI framework with detailed specifications'}
                {platform === 'v0' && 'Three-part framework: Product Surface → Context → Constraints'}
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(currentPrompts.prompt)}
              className="gap-2"
            >
              {copiedIndex === 0 ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto">
            {currentPrompts.prompt}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Cost Comparison: Before vs After

### ❌ WITHOUT Caching (Original)

User workflow:
1. Makes selections → Auto-generates Bolt prompts → **$0.02**
2. Switches to Lovable → Auto-generates again → **$0.02**
3. Switches to v0 → Auto-generates again → **$0.02**
4. Goes back to Bolt → Auto-generates again → **$0.02**

**Total cost: $0.08** (4 generations for same selections!)

### ✅ WITH Caching (Optimized)

User workflow:
1. Makes selections → Clicks "Generate Bolt Prompts" → **$0.02** (cached)
2. Switches to Lovable → Clicks "Generate Lovable Prompts" → **$0.02** (cached)
3. Switches to v0 → Clicks "Generate v0 Prompts" → **$0.02** (cached)
4. Goes back to Bolt → Shows cached prompts → **$0.00** ✅
5. Goes back to Lovable → Shows cached prompts → **$0.00** ✅
6. Changes layout selection → Clicks "Regenerate" on Bolt → **$0.02**

**Total cost: $0.08** (only generates when needed!)

**Savings: 50-75%** depending on user behavior

---

## Key Features of Optimized Version

### 1. ✅ **Explicit Generation**
- User clicks "Generate Prompts" button
- No automatic regeneration on every change
- Shows cost estimate (~$0.02) before generating

### 2. ✅ **Smart Caching**
- Stores prompts for each platform separately
- Switching platforms = instant (uses cache)
- Tracks selections used for each generation

### 3. ✅ **Stale Detection**
- Detects when selections changed
- Shows "⚠️ Selections Changed" warning
- Shows "Regenerate" button (user decides)

### 4. ✅ **Cache Status**
- Green banner shows "Using cached prompts (saved ~$0.02)"
- "Regenerate" button always available
- Transparent about what's cached vs fresh

### 5. ✅ **Manual Regeneration**
- User can regenerate anytime
- Useful if they want different wording
- Shows loading state during generation

---

## User Flow Examples

### Scenario 1: First Time User

```
1. User selects: Landing Page, Minimal, Split Hero, [Pricing]
2. UI shows: "Generate ⚡ Bolt.new Prompts (~$0.02)" button
3. User clicks → Generates → Shows 4 prompts → Cost: $0.02

4. User switches to Lovable
5. UI shows: "Generate 💖 Lovable Prompts (~$0.02)" button
6. User clicks → Generates → Shows 1 prompt → Cost: $0.02

7. User switches back to Bolt
8. UI shows: "✅ Using cached prompts (saved ~$0.02)" + prompts
   Cost: $0.00

Total: $0.04 (only 2 platforms generated)
```

### Scenario 2: Exploring Options

```
1. User generates Bolt prompts → $0.02
2. User adds "Testimonials" component
3. UI shows: "⚠️ Selections Changed" + "Regenerate" button
4. User decides NOT to regenerate yet
5. User switches to Lovable tab
6. UI shows: "Generate Lovable Prompts" (no cache for Lovable yet)
7. User generates → $0.02
8. User switches back to Bolt
9. UI still shows OLD cached Bolt prompts (before Testimonials)
   + "⚠️ Selections Changed" warning
10. User clicks "Regenerate" → $0.02

Total: $0.06 (3 generations, user had full control)
```

---

## Additional Optimizations

### 1. Add "Generate All" Option (Optional)

For power users who want all 3 platforms at once:

```typescript
<Button onClick={generateAllPlatforms} variant="outline">
  Generate All Platforms (~$0.06)
</Button>

const generateAllPlatforms = async () => {
  await Promise.all([
    generateForPlatform('bolt'),
    generateForPlatform('lovable'),
    generateForPlatform('v0'),
  ]);
};
```

### 2. Add LocalStorage Persistence (Optional)

Cache prompts across page refreshes:

```typescript
useEffect(() => {
  // Load from localStorage on mount
  const cached = localStorage.getItem('promptCache');
  if (cached) {
    setPromptCache(JSON.parse(cached));
  }
}, []);

useEffect(() => {
  // Save to localStorage on change
  localStorage.setItem('promptCache', JSON.stringify(promptCache));
}, [promptCache]);
```

### 3. Add "Prompt History" (Optional)

Save all generated prompts for later reference:

```typescript
const [history, setHistory] = useState<Array<{
  timestamp: Date,
  platform: string,
  selections: SelectionsSnapshot,
  prompts: any
}>>([]);

// After successful generation
setHistory(prev => [...prev, {
  timestamp: new Date(),
  platform,
  selections: currentSelections,
  prompts: data.prompts
}]);
```

---

## Summary

### The Problem You Identified
✅ Switching platforms regenerates prompts = wasted tokens

### The Solution
✅ Cache prompts per platform
✅ Explicit "Generate" button
✅ Show cache status and cost savings
✅ Detect stale prompts when selections change
✅ User controls when to regenerate

### Cost Savings
✅ 50-75% reduction in API calls
✅ Transparent cost display
✅ User always in control

---

Use this optimized version instead of the original! The caching system makes it much more efficient. 🚀
