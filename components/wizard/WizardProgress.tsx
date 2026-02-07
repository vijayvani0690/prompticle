'use client';

import { usePromptStore } from '@/lib/store/prompt-store';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardStep } from '@/lib/types';

const STEPS: { id: WizardStep; label: string; number: number }[] = [
  { id: 'type', label: 'Type', number: 1 },
  { id: 'style', label: 'Style', number: 2 },
  { id: 'layout', label: 'Layout', number: 3 },
  { id: 'components', label: 'Components', number: 4 },
];

export function WizardProgress() {
  const { currentStep, wizardState } = usePromptStore();

  const isStepComplete = (step: WizardStep): boolean => {
    switch (step) {
      case 'type':
        return !!wizardState.websiteType;
      case 'style':
        return !!wizardState.style;
      case 'layout':
        return !!wizardState.layout;
      case 'components':
        return wizardState.components.length > 0;
      default:
        return false;
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const isComplete = isStepComplete(step.id);
        const isCurrent = step.id === currentStep;
        const isPast = index < currentStepIndex;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  isCurrent &&
                    'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
                  isComplete && !isCurrent && 'bg-green-500 text-white',
                  !isCurrent && !isComplete && 'bg-gray-200 text-gray-500'
                )}
              >
                {isComplete && !isCurrent ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  'hidden sm:inline text-sm font-medium',
                  isCurrent && 'text-foreground',
                  !isCurrent && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 mx-2',
                  isPast || isComplete ? 'bg-green-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
