
import React from 'react';
import { cn } from '@/lib/utils';
import { useMobileViewport } from '@/hooks/use-mobile-viewport';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  enableSafeArea?: boolean;
  enableScrollLock?: boolean;
  fullHeight?: boolean;
}

export function MobileContainer({
  children,
  className,
  enableSafeArea = true,
  enableScrollLock = false,
  fullHeight = false
}: MobileContainerProps) {
  const { isMobile } = useMobileViewport();

  return (
    <div
      className={cn(
        'w-full mx-auto',
        isMobile && 'mobile-optimized',
        enableSafeArea && 'mobile-safe-area',
        enableScrollLock && 'overflow-hidden',
        fullHeight && 'mobile-full-height',
        className
      )}
    >
      {children}
    </div>
  );
}
