import React from 'react'
import { AuthDecorations } from './auth-decorations'
import { ModeToggle } from './mode-toggle'
import { cn } from '@/lib/utils'

/**
 * Two-column auth layout: left = theme-aware branding, right = form.
 * Uses --auth-panel-bg and --auth-panel-foreground for dynamic theme.
 */
export function AuthLayout({
  headline,
  subline,
  children,
  className,
  contentClassName,
  illustrationSrc,
  illustrationAlt = 'Auth illustration',
  illustrationClassName,
}) {
  const hasIllustration = Boolean(illustrationSrc)
  return (
    <div className={cn('flex min-h-screen bg-background', className)}>
      {/* Left panel: branding + decorations */}
      <div
        className="relative hidden min-h-screen w-[42%] flex-col justify-center px-12 lg:flex"
        style={{
          backgroundColor: 'var(--auth-panel-bg)',
          color: 'var(--auth-panel-foreground)',
        }}
      >
        <AuthDecorations />
        <div className="relative z-10 max-w-sm">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{headline}</h1>
          <p className="mt-3 text-base opacity-90">{subline}</p>
          {hasIllustration && (
            <div className="mt-8">
              <img
                src={illustrationSrc}
                alt={illustrationAlt}
                loading="lazy"
                className={cn('h-auto w-full max-w-[320px] object-contain', illustrationClassName)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right panel: form */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-10 md:justify-center md:px-8">
        <div className="absolute right-4 top-4 z-10 md:right-8 md:top-8">
          <ModeToggle />
        </div>
        <div className={cn('w-full py-4 md:py-0', contentClassName || 'max-w-md')}>{children}</div>
      </div>
    </div>
  )
}
