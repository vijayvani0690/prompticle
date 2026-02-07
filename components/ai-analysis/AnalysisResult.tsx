'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { AIAnalysisResult } from '@/lib/types';
import { Check, Sparkles } from 'lucide-react';

interface AnalysisResultProps {
  result: AIAnalysisResult;
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const confidencePercentage = Math.round(result.confidence * 100);
  const confidenceColor =
    confidencePercentage >= 80
      ? 'text-green-600'
      : confidencePercentage >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Analysis Complete</h2>
        <p className="text-muted-foreground">
          AI has extracted the following requirements from your description
        </p>
      </div>

      {/* Confidence Score */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">AI Confidence</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${confidencePercentage}%` }}
                />
              </div>
            </div>
            <span className={`font-bold text-xl ${confidenceColor}`}>
              {confidencePercentage}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Based on the clarity and completeness of your description
          </p>
        </CardContent>
      </Card>

      {/* Extracted Information */}
      <Card>
        <CardHeader>
          <CardTitle>Extracted Requirements</CardTitle>
          <CardDescription>
            Review and edit these selections in the wizard if needed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Website Type */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Website Type
            </h3>
            <Badge variant="secondary" className="text-base px-4 py-2">
              {result.websiteType
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')}
            </Badge>
          </div>

          <Separator />

          {/* Visual Style */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Visual Style
            </h3>
            <div>
              <p className="font-medium">{result.style.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.style.description}
              </p>
            </div>
          </div>

          <Separator />

          {/* Layout */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Layout Structure
            </h3>
            <div>
              <p className="font-medium">{result.layout.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.layout.description}
              </p>
            </div>
          </div>

          <Separator />

          {/* Components */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Components ({result.components.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.components.map((component) => (
                <div
                  key={component.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{component.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Reasoning (if available) */}
          {result.reasoning && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  AI Reasoning
                </h3>
                <p className="text-sm text-muted-foreground italic">
                  {result.reasoning}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
