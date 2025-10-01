'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if the component has been hydrated on the client
 * Useful for preventing hydration mismatches
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Hook to handle browser extension cleanup
 * Removes common browser extension attributes that cause hydration mismatches
 */
export function useBrowserExtensionCleanup(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (ref.current && typeof window !== 'undefined') {
      const element = ref.current;
      
      // Common browser extension attributes that cause hydration issues
      const extensionAttributes = [
        'data-temp-mail-org',
        'data-kwimpalastatus', 
        'data-lpignore',
        'data-form-type',
        'autocomplete-ignore',
        'data-1p-ignore',
        'data-lastpass-icon-added'
      ];

      // Remove extension attributes
      extensionAttributes.forEach(attr => {
        if (element.hasAttribute(attr)) {
          element.removeAttribute(attr);
        }
      });

      // Clean up extension-added styles
      if (element instanceof HTMLInputElement) {
        const style = element.style;
        if (style.backgroundImage && style.backgroundImage.includes('data:')) {
          style.backgroundImage = '';
          style.backgroundRepeat = '';
          style.backgroundSize = '';
          style.backgroundAttachment = '';
          style.backgroundPosition = '';
        }
      }

      // Also clean up any child inputs
      const inputs = element.querySelectorAll('input');
      inputs.forEach(input => {
        extensionAttributes.forEach(attr => {
          if (input.hasAttribute(attr)) {
            input.removeAttribute(attr);
          }
        });

        const inputStyle = input.style;
        if (inputStyle.backgroundImage && inputStyle.backgroundImage.includes('data:')) {
          inputStyle.backgroundImage = '';
          inputStyle.backgroundRepeat = '';
          inputStyle.backgroundSize = '';
          inputStyle.backgroundAttachment = '';
          inputStyle.backgroundPosition = '';
        }
      });
    }
  }, [ref]);
}