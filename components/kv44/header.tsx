'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KvLogo } from './kv-logo'
import { ThemeToggle } from './theme-toggle'

export function Header({
  onReset,
  showReset,
}: {
  onReset: () => void
  showReset: boolean
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <KvLogo className="size-10 text-lg" />
          <div className="leading-tight">
            <p className="font-display text-[15px] font-bold tracking-tight">Kv-44</p>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showReset && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onReset}
            >
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
          <span className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Online
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
