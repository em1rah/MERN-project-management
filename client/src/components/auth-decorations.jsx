import React from 'react'

/**
 * Theme-aware decorative shapes for the auth left panel.
 * Uses currentColor so it respects --auth-panel-foreground.
 */
export function AuthDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Curved capsules */}
      <div className="absolute top-[15%] left-[10%] w-32 h-4 rounded-full bg-[var(--auth-panel-foreground)]/20 rotate-[-20deg]" />
      <div className="absolute top-[25%] right-[15%] w-24 h-3 rounded-full bg-[var(--auth-panel-foreground)]/15 rotate-12" />
      <div className="absolute bottom-[40%] left-[20%] w-20 h-3 rounded-full bg-[var(--auth-panel-foreground)]/10 rotate-[-15deg]" />

      {/* Circles */}
      <div className="absolute top-[20%] right-[25%] w-3 h-3 rounded-full border-2 border-[var(--auth-panel-foreground)]/30" />
      <div className="absolute top-[55%] left-[15%] w-2 h-2 rounded-full bg-[var(--auth-panel-foreground)]/25" />
      <div className="absolute bottom-[30%] right-[20%] w-4 h-4 rounded-full border-2 border-[var(--auth-panel-foreground)]/20" />

      {/* Glowing gradient blob */}
      <div
        className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--auth-panel-foreground) 0%, transparent 70%)',
        }}
      />

      {/* X shape */}
      <div className="absolute bottom-[15%] left-[12%] w-8 h-8 flex items-center justify-center">
        <span
          className="block w-6 h-0.5 rotate-45 bg-[var(--auth-panel-foreground)]/25 absolute"
          style={{ transform: 'rotate(45deg)' }}
        />
        <span
          className="block w-6 h-0.5 bg-[var(--auth-panel-foreground)]/25 absolute"
          style={{ transform: 'rotate(-45deg)' }}
        />
      </div>

      {/* Extra small circles for depth */}
      <div className="absolute top-[70%] right-[30%] w-2 h-2 rounded-full bg-[var(--auth-panel-foreground)]/15" />
      <div className="absolute bottom-[45%] right-[10%] w-3 h-3 rounded-full border border-[var(--auth-panel-foreground)]/20" />
    </div>
  )
}
