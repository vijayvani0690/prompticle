'use client';

import { usePromptStore } from '@/lib/store/prompt-store';
import { PromptPreviewPanel } from '@/components/shared/PromptPreviewPanel';
import { PromptGenerator } from '@/lib/prompts/generator';
import { WebsiteTypeStep } from '@/components/wizard/WebsiteTypeStep';
import { StyleStep } from '@/components/wizard/StyleStep';
import { LayoutStep } from '@/components/wizard/LayoutStep';
import { ComponentsStep } from '@/components/wizard/ComponentsStep';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WizardPage() {
  const router = useRouter();
  const {
    currentStep,
    wizardState,
    selectedPlatform,
    setSelectedPlatform,
  } = usePromptStore();

  const generatedPrompt = PromptGenerator.fromWizard(wizardState, selectedPlatform);

  const renderStep = () => {
    switch (currentStep) {
      case 'type':
        return <WebsiteTypeStep />;
      case 'style':
        return <StyleStep />;
      case 'layout':
        return <LayoutStep />;
      case 'components':
        return <ComponentsStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div>
              <h1 className="text-xl font-bold">Visual Wizard</h1>
              <p className="text-sm text-muted-foreground">
                Step-by-step prompt builder
              </p>
            </div>
          </div>
          <WizardProgress />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Wizard Steps */}
          <div className="space-y-6">
            {renderStep()}
          </div>

          {/* Prompt Preview Panel - Sticky on desktop, hidden on mobile */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <PromptPreviewPanel
                prompt={generatedPrompt}
                selectedPlatform={selectedPlatform}
                onPlatformChange={setSelectedPlatform}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Prompt Preview - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <PromptPreviewPanel
          prompt={generatedPrompt}
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          className="max-h-[300px]"
        />
      </div>
    </div>
  );
}
