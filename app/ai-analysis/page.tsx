'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePromptStore } from '@/lib/store/prompt-store';
import { PromptPreviewPanel } from '@/components/shared/PromptPreviewPanel';
import { PromptGenerator } from '@/lib/prompts/generator';
import { PRDInput } from '@/components/ai-analysis/PRDInput';
import { AnalysisResult } from '@/components/ai-analysis/AnalysisResult';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function AIAnalysisPage() {
  const router = useRouter();
  const {
    prdInput,
    aiAnalysisResult,
    selectedPlatform,
    setPRDInput,
    setAIAnalysisResult,
    setSelectedPlatform,
    setMode,
  } = usePromptStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (content: string) => {
    setIsAnalyzing(true);
    setError(null);
    setPRDInput(content);

    try {
      const response = await fetch('/api/analyze-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      setAIAnalysisResult({ ...result, aiDetected: true });
      setMode('wizard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAIAnalysisResult(null);
    setPRDInput('');
    setError(null);
  };

  const generatedPrompt = aiAnalysisResult
    ? PromptGenerator.fromAIAnalysis(aiAnalysisResult, selectedPlatform)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div>
              <h1 className="text-xl font-bold">AI Analysis</h1>
              <p className="text-sm text-muted-foreground">
                Intelligent PRD analysis
              </p>
            </div>
          </div>
          {aiAnalysisResult && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Start Over
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/wizard')}
              >
                Edit in Wizard
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Analysis Content */}
          <div>
            {!aiAnalysisResult ? (
              <PRDInput
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                error={error}
                currentValue={prdInput || ''}
              />
            ) : (
              <AnalysisResult result={aiAnalysisResult} />
            )}
          </div>

          {/* Prompt Preview Panel */}
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

      {/* Mobile Prompt Preview */}
      {aiAnalysisResult && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <PromptPreviewPanel
            prompt={generatedPrompt}
            selectedPlatform={selectedPlatform}
            onPlatformChange={setSelectedPlatform}
            className="max-h-[300px]"
          />
        </div>
      )}
    </div>
  );
}
