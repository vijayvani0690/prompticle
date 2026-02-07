'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { usePromptStore } from '@/lib/store/prompt-store';
import { getComponentsByCategory } from '@/constants/wizard-options';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import type { ComponentOption } from '@/lib/types';

const CATEGORIES: Array<ComponentOption['category']> = [
  'navigation',
  'content',
  'marketing',
  'forms',
  'other',
];

const CATEGORY_LABELS: Record<ComponentOption['category'], string> = {
  navigation: 'Navigation',
  content: 'Content Sections',
  marketing: 'Marketing',
  forms: 'Forms & Input',
  other: 'Other',
};

export function ComponentsStep() {
  const { wizardState, setWizardState, previousStep, aiAnalysisResult } = usePromptStore();

  const handleToggle = (component: ComponentOption, checked: boolean) => {
    const currentComponents = wizardState.components;

    if (checked) {
      // Add component
      setWizardState({
        components: [...currentComponents, component],
      });
    } else {
      // Remove component (only if not required)
      if (!component.required) {
        setWizardState({
          components: currentComponents.filter((c) => c.id !== component.id),
        });
      }
    }
  };

  const isComponentSelected = (componentId: string): boolean => {
    return wizardState.components.some((c) => c.id === componentId);
  };

  const isAIDetected = (componentId: string): boolean => {
    return (
      !!aiAnalysisResult?.aiDetected &&
      !!aiAnalysisResult.components.some((c) => c.id === componentId)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Select Components</h2>
        <p className="text-muted-foreground">
          Choose the sections and features you want to include
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Required components are pre-selected and cannot be removed
        </p>
      </div>

      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const components = getComponentsByCategory(category);
          if (components.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{CATEGORY_LABELS[category]}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {components.map((component) => {
                    const isSelected = isComponentSelected(component.id);
                    const isAI = isAIDetected(component.id);

                    return (
                      <div
                        key={component.id}
                        className={cn(
                          'flex items-start space-x-3 p-3 rounded-lg border-2 transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:border-primary/30',
                          component.required && 'bg-muted/50'
                        )}
                      >
                        <Checkbox
                          id={component.id}
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleToggle(component, checked as boolean)
                          }
                          disabled={component.required}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={component.id}
                              className={cn(
                                'font-medium cursor-pointer',
                                component.required && 'cursor-not-allowed'
                              )}
                            >
                              {component.name}
                            </Label>
                            {component.required && (
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            )}
                            {isAI && !component.required && (
                              <Badge className="text-xs bg-purple-500">
                                🤖 AI
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {component.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You have selected <span className="font-bold text-foreground">
              {wizardState.components.length}
            </span>{' '}
            component{wizardState.components.length !== 1 ? 's' : ''} for your website.
          </p>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={previousStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-sm text-muted-foreground">
          ✓ All selections complete! Check the prompt preview →
        </div>
      </div>
    </div>
  );
}
