'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlatformSwitcher } from './PlatformSwitcher';
import { LoadingSpinner } from './LoadingSpinner';
import { PromptGenerator } from '@/lib/prompts/generator';
import { usePromptStore, buildSelectionsSnapshot, isSnapshotStale } from '@/lib/store/prompt-store';
import { Copy, Check, Sparkles, RefreshCw, AlertTriangle, CheckCircle, ImageIcon, ExternalLink } from 'lucide-react';
import { cn, copyToClipboard } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Platform, WizardState, BoltPromptStep, SinglePrompt } from '@/lib/types';

interface PromptPreviewPanelProps {
  wizardState: WizardState;
  prdInput: string | null;
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  className?: string;
}

const PLATFORM_META: Record<Platform, { emoji: string; name: string; instruction: string }> = {
  bolt: {
    emoji: '\u26A1',
    name: 'Bolt.new',
    instruction: 'Copy prompts one at a time into Bolt.new for best results',
  },
  lovable: {
    emoji: '\uD83D\uDC96',
    name: 'Lovable',
    instruction: 'Paste into Lovable and start in Plan Mode for best results',
  },
  v0: {
    emoji: '\uD83D\uDD37',
    name: 'v0',
    instruction: 'Paste into v0 and pick your favorite variation',
  },
};

export function PromptPreviewPanel({
  wizardState,
  prdInput,
  selectedPlatform,
  onPlatformChange,
  className,
}: PromptPreviewPanelProps) {
  const { toast } = useToast();
  const {
    promptCache,
    selectionsSnapshot,
    isGenerating,
    generationError,
    setPromptCache,
    setSelectionsSnapshot,
    setIsGenerating,
    setGenerationError,
    previewImage,
    setPreviewImageUrl,
    setIsGeneratingImage,
    setImageGenerationError,
  } = usePromptStore();

  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  // Compute basic template prompt as fallback
  const fallbackPrompt = PromptGenerator.fromWizard(wizardState, selectedPlatform);
  const isWizardComplete = PromptGenerator.getCompletionPercentage(wizardState) === 100;

  // Get cached prompts for current platform
  const cachedData = promptCache[selectedPlatform];
  const hasCachedPrompts = cachedData !== null;

  // Check if selections are stale
  const currentSnapshot = buildSelectionsSnapshot(wizardState, prdInput);
  const isStale = hasCachedPrompts && isSnapshotStale(currentSnapshot, selectionsSnapshot);

  // ==================== Handlers ====================

  const handleGenerate = useCallback(async () => {
    if (!isWizardComplete) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prdText: prdInput ?? '',
          selections: {
            websiteType: wizardState.websiteType ?? '',
            visualStyle: wizardState.style?.name ?? '',
            layout: wizardState.layout?.name ?? '',
            components: wizardState.components.map((c) => c.name),
          },
          platform: selectedPlatform,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate prompts');
      }

      const data = await response.json();

      // Cache the result for the current platform
      const platformData = data[selectedPlatform];
      if (platformData) {
        setPromptCache(selectedPlatform, platformData);
        setSelectionsSnapshot(currentSnapshot);
      }

      toast({
        title: 'Prompts generated!',
        description: `Cost: ~$${(data.tokenUsage?.total * 0.00001).toFixed(4) ?? '0.02'}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Prompt generation failed';
      setGenerationError(message);
      toast({
        title: 'Generation failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [
    isWizardComplete, prdInput, wizardState, selectedPlatform, currentSnapshot,
    setIsGenerating, setGenerationError, setPromptCache, setSelectionsSnapshot, toast,
  ]);

  // Extract the full prompt text from cached data for image generation
  const getGeneratedPromptText = useCallback((): string => {
    if (!cachedData) return '';
    if (selectedPlatform === 'bolt') {
      return (cachedData as BoltPromptStep[])
        .map((p) => `${p.title}: ${p.prompt}`)
        .join('\n\n');
    }
    return (cachedData as SinglePrompt).prompt;
  }, [cachedData, selectedPlatform]);

  const handleGenerateImage = useCallback(async () => {
    const promptText = getGeneratedPromptText();
    if (!promptText) return;

    setIsGeneratingImage(true);
    setImageGenerationError(null);

    try {
      const response = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generatedPrompt: promptText,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate preview');
      }

      const data = await response.json();
      setPreviewImageUrl(data.imageUrl);

      toast({
        title: 'Preview generated!',
        description: 'Click the image to view full size',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image generation failed';
      setImageGenerationError(message);
      toast({
        title: 'Preview failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  }, [
    getGeneratedPromptText,
    setIsGeneratingImage, setImageGenerationError, setPreviewImageUrl, toast,
  ]);

  // ==================== Render ====================

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="space-y-4">
        <div>
          <CardTitle>Generated Prompt</CardTitle>
          <CardDescription>
            AI-optimized prompts for your chosen platform
          </CardDescription>
        </div>

        <PlatformSwitcher
          selected={selectedPlatform}
          onChange={onPlatformChange}
        />
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* State A: Wizard not complete */}
        {!isWizardComplete && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Complete all wizard steps to generate prompts</p>
              <p className="text-xs mt-1">
                {PromptGenerator.getCompletionPercentage(wizardState)}% complete
              </p>
            </div>
          </div>
        )}

        {/* State B/C/D/E/F: Wizard complete */}
        {isWizardComplete && (
          <>
            {/* Cache Status Banners */}
            {hasCachedPrompts && !isStale && !isGenerating && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-xs">
                  Using cached prompts (saved ~$0.02)
                </AlertDescription>
              </Alert>
            )}

            {isStale && !isGenerating && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-xs">
                  Selections changed since last generation
                </AlertDescription>
              </Alert>
            )}

            {/* Generation Error */}
            {generationError && !isGenerating && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">
                  {generationError}
                </AlertDescription>
              </Alert>
            )}

            {/* Generate / Regenerate Button */}
            {!isGenerating && (
              <Button
                onClick={handleGenerate}
                variant={hasCachedPrompts && !isStale ? 'outline' : 'default'}
                className={cn(
                  'w-full',
                  !hasCachedPrompts && 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                )}
                disabled={isGenerating}
              >
                {hasCachedPrompts ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate {PLATFORM_META[selectedPlatform].emoji} {PLATFORM_META[selectedPlatform].name} Prompts
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate {PLATFORM_META[selectedPlatform].emoji} {PLATFORM_META[selectedPlatform].name} Prompts (~$0.02)
                  </>
                )}
              </Button>
            )}

            {/* Loading State */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-muted-foreground">
                  Generating AI-optimized prompts...
                </p>
              </div>
            )}

            {/* AI-Generated Prompts Display */}
            {hasCachedPrompts && !isGenerating && (
              <div className="flex-1 flex flex-col gap-3">
                {/* Platform-specific instructions */}
                <p className="text-xs text-muted-foreground italic">
                  {PLATFORM_META[selectedPlatform].instruction}
                </p>

                {selectedPlatform === 'bolt' ? (
                  <BoltPromptsDisplay prompts={cachedData as BoltPromptStep[]} />
                ) : (
                  <SinglePromptDisplay prompt={cachedData as SinglePrompt} platform={selectedPlatform} />
                )}
              </div>
            )}

            {/* Fallback: Basic template prompt (shown when no cache exists and not generating) */}
            {!hasCachedPrompts && !isGenerating && fallbackPrompt && (
              <div className="flex-1 flex flex-col gap-3">
                <Badge variant="outline" className="w-fit text-xs">
                  Basic preview
                </Badge>
                <ScrollArea className="flex-1 rounded-lg border bg-muted/30 p-4 max-h-[300px]">
                  <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                    {fallbackPrompt.content}
                  </pre>
                </ScrollArea>
              </div>
            )}

            {/* ==================== Website Preview Image ==================== */}
            {!isGenerating && hasCachedPrompts && (
              <div className="border-t pt-4 space-y-3">
                {/* Image Generation Error */}
                {previewImage.error && !previewImage.isGenerating && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-xs">
                      {previewImage.error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Generate Preview Button */}
                {!previewImage.isGenerating && (
                  <Button
                    onClick={handleGenerateImage}
                    variant="outline"
                    className="w-full"
                    disabled={previewImage.isGenerating}
                  >
                    {previewImage.url ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate Website Preview
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Generate Website Preview (~$0.04)
                      </>
                    )}
                  </Button>
                )}

                {/* Image Loading State */}
                {previewImage.isGenerating && (
                  <div className="flex flex-col items-center justify-center gap-3 py-6">
                    <LoadingSpinner size="lg" />
                    <p className="text-sm text-muted-foreground">
                      Generating preview image...
                    </p>
                  </div>
                )}

                {/* Image Thumbnail */}
                {previewImage.url && !previewImage.isGenerating && (
                  <div
                    className="cursor-pointer rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                    onClick={() => setImageDialogOpen(true)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewImage.url}
                      alt="Website preview"
                      className="w-full h-auto"
                    />
                    <div className="px-3 py-2 bg-muted/30 text-xs text-muted-foreground text-center">
                      Click to view full size
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Full-size Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Website Preview</DialogTitle>
          </DialogHeader>
          {previewImage.url && (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.url}
                alt="Website preview - full size"
                className="w-full h-auto rounded-lg"
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(previewImage.url!, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ==================== Bolt Multi-Card Display ====================

function BoltPromptsDisplay({ prompts }: { prompts: BoltPromptStep[] }) {
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyOne = async (text: string, index: number) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedIndex(index);
      toast({ title: 'Copied!', description: `Step ${index + 1} prompt copied` });
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleCopyAll = async () => {
    const allText = prompts
      .map((p) => `--- Step ${p.step}: ${p.title} ---\n${p.prompt}`)
      .join('\n\n');
    const success = await copyToClipboard(allText);
    if (success) {
      setCopiedAll(true);
      toast({ title: 'All prompts copied!', description: 'Paste them one at a time' });
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <ScrollArea className="max-h-[400px]">
        <div className="space-y-3 pr-3">
          {prompts.map((p, i) => (
            <Card key={i} className="border bg-muted/20">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Step {p.step}
                    </Badge>
                    <span className="text-sm font-medium">{p.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleCopyOne(p.prompt, i)}
                  >
                    {copiedIndex === i ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                <p className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                  {p.prompt}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Button
        onClick={handleCopyAll}
        className="w-full"
        size="lg"
      >
        {copiedAll ? (
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

// ==================== Single Prompt Display (Lovable / v0) ====================

function SinglePromptDisplay({ prompt, platform }: { prompt: SinglePrompt; platform: Platform }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(prompt.prompt);
    if (success) {
      setCopied(true);
      toast({ title: 'Copied!', description: 'Prompt copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {PLATFORM_META[platform].emoji} {prompt.title}
        </Badge>
      </div>

      <ScrollArea className="flex-1 rounded-lg border bg-muted/30 p-4 max-h-[400px]">
        <pre className="text-xs whitespace-pre-wrap font-mono">
          {prompt.prompt}
        </pre>
      </ScrollArea>

      <Button onClick={handleCopy} className="w-full" size="lg">
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy Prompt
          </>
        )}
      </Button>
    </div>
  );
}
