
import { useState, useEffect } from 'react';

interface ViewportData {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  pixelRatio: number;
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export function useMobileViewport(): ViewportData {
  const [viewport, setViewport] = useState<ViewportData>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        isMobile: false,
        isTablet: false,
        isLandscape: false,
        isPortrait: true,
        pixelRatio: 1,
        safeArea: { top: 0, bottom: 0, left: 0, right: 0 }
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isLandscape = width > height;
    const isPortrait = height > width;
    const pixelRatio = window.devicePixelRatio || 1;

    // Get safe area insets
    const computedStyle = getComputedStyle(document.documentElement);
    const safeArea = {
      top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)').replace('px', '')) || 0,
      bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)').replace('px', '')) || 0,
      left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)').replace('px', '')) || 0,
      right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)').replace('px', '')) || 0
    };

    return {
      width,
      height,
      isMobile,
      isTablet,
      isLandscape,
      isPortrait,
      pixelRatio,
      safeArea
    };
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isLandscape = width > height;
      const isPortrait = height > width;
      const pixelRatio = window.devicePixelRatio || 1;

      const computedStyle = getComputedStyle(document.documentElement);
      const safeArea = {
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)').replace('px', '')) || 0,
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)').replace('px', '')) || 0,
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)').replace('px', '')) || 0,
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)').replace('px', '')) || 0
      };

      setViewport({
        width,
        height,
        isMobile,
        isTablet,
        isLandscape,
        isPortrait,
        pixelRatio,
        safeArea
      });
    };

    updateViewport();

    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
}
