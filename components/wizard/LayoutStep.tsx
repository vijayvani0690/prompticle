'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePromptStore } from '@/lib/store/prompt-store';
import { LAYOUT_OPTIONS } from '@/constants/wizard-options';
import { cn } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

export function LayoutStep() {
  const { wizardState, setWizardState, nextStep, previousStep, aiAnalysisResult } =
    usePromptStore();

  const handleSelect = (layout: typeof LAYOUT_OPTIONS[0]) => {
    setWizardState({ layout });
  };

  const canProceed = !!wizardState.layout;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Choose Layout Structure</h2>
        <p className="text-muted-foreground">
          Select the layout that best fits your content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LAYOUT_OPTIONS.map((layout) => {
          const isSelected = wizardState.layout?.id === layout.id;
          const isAIDetected =
            aiAnalysisResult?.layout?.id === layout.id && aiAnalysisResult.aiDetected;

          return (
            <Card
              key={layout.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-lg hover:scale-105',
                'border-2 relative',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:border-primary/50'
              )}
              onClick={() => handleSelect(layout)}
            >
              {isAIDetected && (
                <Badge className="absolute top-2 right-2 bg-purple-500">
                  🤖 AI Detected
                </Badge>
              )}

              <CardHeader className="relative">
                {isSelected && !isAIDetected && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <CardTitle className="text-lg">{layout.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{layout.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={previousStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!canProceed}>
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
