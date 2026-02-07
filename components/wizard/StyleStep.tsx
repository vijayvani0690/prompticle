'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { usePromptStore } from '@/lib/store/prompt-store';
import { STYLE_OPTIONS } from '@/constants/wizard-options';
import { cn } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export function StyleStep() {
  const { wizardState, setWizardState, nextStep, previousStep, aiAnalysisResult } =
    usePromptStore();
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    name: string;
  } | null>(null);

  const handleSelect = (style: typeof STYLE_OPTIONS[0]) => {
    setWizardState({ style });
  };

  const handlePreview = (e: React.MouseEvent, imagePath: string, name: string) => {
    e.stopPropagation(); // Prevent card selection
    setPreviewImage({ src: imagePath, name });
  };

  // Map website type ID to image filename format
  const getImagePath = (styleId: string): string => {
    const websiteType = wizardState.websiteType;
    if (!websiteType) return '';

    // Convert website type ID to match filename format
    const typeMap: Record<string, string> = {
      'landing-page': 'landing-page',
      'ecommerce': 'ecommerce',
      'blog': 'blog',
      'portfolio': 'portfolio',
      'saas': 'saas-dashboard', // ID is 'saas' but filename uses 'saas-dashboard'
      'documentation': 'documentation',
    };

    // Convert style ID to match filename format
    const styleMap: Record<string, string> = {
      'modern-minimal': 'modern-minimal',
      'bold-dramatic': 'bold-dramatic',
      'corporate': 'corporate-professional',
      'futuristic-tech': 'futuristic-tech',
      'playful-fun': 'playful-fun',
      'luxury': 'luxury-elegant',
    };

    const typePrefix = typeMap[websiteType];
    const styleSuffix = styleMap[styleId];

    return `/images/Visual styles/${typePrefix}-${styleSuffix}.png`;
  };

  const canProceed = !!wizardState.style;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Choose Visual Style</h2>
        <p className="text-muted-foreground">
          Select the design aesthetic that matches your vision
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STYLE_OPTIONS.map((style) => {
          const isSelected = wizardState.style?.id === style.id;
          const isAIDetected =
            aiAnalysisResult?.style?.id === style.id && aiAnalysisResult.aiDetected;
          const imagePath = getImagePath(style.id);

          return (
            <Card
              key={style.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-lg hover:scale-105',
                'border-2 overflow-hidden',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:border-primary/50'
              )}
              onClick={() => handleSelect(style)}
            >
              {/* Preview Image */}
              {imagePath && (
                <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 group/image">
                  <Image
                    src={imagePath}
                    alt={style.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Preview Button - Always Visible */}
                  <Button
                    size="sm"
                    className="absolute bottom-3 left-3 bg-white/95 hover:bg-white text-gray-900 border-2 border-gray-900 shadow-xl z-10 font-semibold"
                    onClick={(e) => handlePreview(e, imagePath, style.name)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Preview
                  </Button>

                  {/* Selection Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg z-10">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}

                  {/* AI Detected Badge */}
                  {isAIDetected && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-purple-500">
                        🤖 AI
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <CardHeader className="relative">
                <CardTitle className="text-lg">{style.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{style.description}</CardDescription>
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

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{previewImage?.name} Preview</span>
            </DialogTitle>
            <DialogDescription>
              Click outside or press Esc to close
            </DialogDescription>
          </DialogHeader>

          {previewImage && (
            <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
              <Image
                src={previewImage.src}
                alt={previewImage.name}
                fill
                className="object-contain"
                sizes="95vw"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
