'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ModeSelectionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  onClick: () => void;
}

export function ModeSelectionCard({
  icon,
  title,
  description,
  features,
  gradient,
  onClick,
}: ModeSelectionCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'hover:shadow-2xl hover:scale-105 cursor-pointer group',
        'border-2 hover:border-transparent'
      )}
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity',
          gradient
        )}
      />

      <CardHeader className="relative">
        <div
          className={cn(
            'w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4',
            'text-white shadow-lg',
            gradient
          )}
        >
          {icon}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Features List */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-0.5 rounded-full p-1 bg-gradient-to-br',
                  gradient
                )}
              >
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          className={cn(
            'w-full bg-gradient-to-r text-white font-semibold',
            'hover:shadow-lg transition-all',
            gradient
          )}
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}
