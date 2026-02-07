'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlatformSwitcher } from './PlatformSwitcher';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { GeneratedPrompt, Platform } from '@/lib/types';

interface PromptPreviewPanelProps {
  prompt: GeneratedPrompt | null;
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  className?: string;
}

export function PromptPreviewPanel({
  prompt,
  selectedPlatform,
  onPlatformChange,
  className,
}: PromptPreviewPanelProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!prompt) return;

    const success = await copyToClipboard(prompt.content);

    if (success) {
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Prompt copied to clipboard',
      });

      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="space-y-4">
        <div>
          <CardTitle>Generated Prompt</CardTitle>
          <CardDescription>
            Copy and paste into your chosen platform
          </CardDescription>
        </div>

        <PlatformSwitcher selected={selectedPlatform} onChange={onPlatformChange} />
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {!prompt ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Complete your selections to see the prompt</p>
            </div>
          </div>
        ) : (
          <>
            {/* Prompt Content */}
            <ScrollArea className="flex-1 rounded-lg border bg-muted/30 p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {prompt.content}
              </pre>
            </ScrollArea>

            {/* Metadata */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="capitalize">
                {prompt.metadata.mode.replace('-', ' ')}
              </Badge>
              <span>•</span>
              <span>{prompt.content.length} characters</span>
            </div>

            {/* Copy Button */}
            <Button
              onClick={handleCopy}
              className="w-full"
              size="lg"
              disabled={!prompt}
            >
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
