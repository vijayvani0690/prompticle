'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Platform } from '@/lib/types';
import { PLATFORM_CONFIGS } from '@/constants/wizard-options';

interface PlatformSwitcherProps {
  selected: Platform;
  onChange: (platform: Platform) => void;
}

export function PlatformSwitcher({ selected, onChange }: PlatformSwitcherProps) {
  return (
    <Tabs value={selected} onValueChange={(value) => onChange(value as Platform)}>
      <TabsList className="grid w-full grid-cols-3">
        {PLATFORM_CONFIGS.map((platform) => (
          <TabsTrigger
            key={platform.id}
            value={platform.id}
            className="flex items-center gap-2"
          >
            <span>{platform.icon}</span>
            <span className="hidden sm:inline">{platform.name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
