'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { usePromptStore } from '@/lib/store/prompt-store';
import { WEBSITE_TYPES } from '@/constants/wizard-options';
import { cn } from '@/lib/utils';
import { Check, Eye } from 'lucide-react';

export function WebsiteTypeStep() {
  const { wizardState, setWizardState, nextStep } = usePromptStore();
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    name: string;
  } | null>(null);

  const handleSelect = (typeId: string) => {
    const selectedType = WEBSITE_TYPES.find((t) => t.id === typeId);
    if (!selectedType) return;

    setWizardState({ websiteType: selectedType.id });
    // Auto-advance to next step
    setTimeout(() => nextStep(), 300);
  };

  const handlePreview = (e: React.MouseEvent, preview: string, name: string) => {
    e.stopPropagation(); // Prevent card selection
    setPreviewImage({ src: preview, name });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Choose Your Website Type</h2>
        <p className="text-muted-foreground">
          Select the type of website you want to build
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WEBSITE_TYPES.map((type) => {
          const isSelected = wizardState.websiteType === type.id;

          return (
            <Card
              key={type.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-lg hover:scale-105',
                'border-2 overflow-hidden',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:border-primary/50'
              )}
              onClick={() => handleSelect(type.id)}
            >
              {/* Preview Image */}
              {type.preview && (
                <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 group/image">
                  <Image
                    src={type.preview}
                    alt={type.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Preview Button - Always Visible */}
                  <Button
                    size="sm"
                    className="absolute bottom-3 left-3 bg-white/95 hover:bg-white text-gray-900 border-2 border-gray-900 shadow-xl z-10 font-semibold"
                    onClick={(e) => handlePreview(e, type.preview!, type.name)}
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
                </div>
              )}

              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{type.icon}</div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{type.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
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
