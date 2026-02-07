'use client';

import { useRouter } from 'next/navigation';
import { usePromptStore } from '@/lib/store/prompt-store';
import { ModeSelectionCard } from './ModeSelectionCard';
import { Sparkles, Wand2 } from 'lucide-react';

export function ModeSelection() {
  const router = useRouter();
  const setMode = usePromptStore((state) => state.setMode);
  const reset = usePromptStore((state) => state.reset);

  const handleModeSelect = (mode: 'wizard' | 'ai-analysis') => {
    // Reset state when starting fresh
    reset();
    setMode(mode);

    // Navigate to the selected mode
    if (mode === 'wizard') {
      router.push('/wizard');
    } else {
      router.push('/ai-analysis');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            PromptCraft
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            AI-Powered Prompt Builder for Website Generation
          </p>
          <p className="text-sm md:text-base text-gray-500">
            Generate optimized prompts for Bolt.new, Lovable, and v0
          </p>
        </header>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <ModeSelectionCard
            icon={<Wand2 className="w-12 h-12" />}
            title="Visual Wizard"
            description="Step-by-step guided process with visual previews"
            features={[
              'Choose from curated options',
              'See visual previews',
              'Complete control over selections',
              'Perfect for beginners',
            ]}
            gradient="from-blue-500 to-cyan-500"
            onClick={() => handleModeSelect('wizard')}
          />

          <ModeSelectionCard
            icon={<Sparkles className="w-12 h-12" />}
            title="AI Analysis"
            description="Paste your PRD and let AI auto-extract selections"
            features={[
              'Instant AI-powered analysis',
              'Smart requirement extraction',
              'Pre-filled example PRDs',
              'Edit selections after analysis',
            ]}
            gradient="from-purple-500 to-pink-500"
            onClick={() => handleModeSelect('ai-analysis')}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>Choose your preferred method to get started</p>
        </div>
      </div>
    </main>
  );
}
