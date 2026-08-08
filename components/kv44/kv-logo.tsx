import { cn } from '@/lib/utils'

export function KvLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display font-extrabold shadow-sm shadow-primary/30',
        className,
      )}
      aria-hidden="true"
    >
      KV
    </div>
  )
}
