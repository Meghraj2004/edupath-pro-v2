import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  suppressHydrationWarning?: boolean;
}

function Input({ className, type, suppressHydrationWarning, ...props }: InputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Clean up browser extension modifications after hydration
  React.useEffect(() => {
    if (inputRef.current && typeof window !== 'undefined') {
      // Remove common browser extension attributes that cause hydration mismatches
      const extensionAttributes = [
        'data-temp-mail-org',
        'data-kwimpalastatus',
        'data-lpignore',
        'data-form-type',
        'autocomplete-ignore'
      ];
      
      extensionAttributes.forEach(attr => {
        if (inputRef.current?.hasAttribute(attr)) {
          inputRef.current.removeAttribute(attr);
        }
      });

      // Reset any inline styles added by extensions
      if (inputRef.current.style.backgroundImage && 
          inputRef.current.style.backgroundImage.includes('data:')) {
        inputRef.current.style.backgroundImage = '';
        inputRef.current.style.backgroundRepeat = '';
        inputRef.current.style.backgroundSize = '';
        inputRef.current.style.backgroundAttachment = '';
        inputRef.current.style.backgroundPosition = '';
      }
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type={type}
      data-slot="input"
      suppressHydrationWarning={suppressHydrationWarning || (type === 'email' || type === 'password')}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
