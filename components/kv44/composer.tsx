'use client'

import { ImageIcon, Loader2, MessageSquare, Paperclip, Send, Video, X } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import type { Attachment, Mode } from '@/lib/kv44-types'
import { cn } from '@/lib/utils'

const modes: { key: Mode; label: string; icon: React.ElementType }[] = [
  { key: 'chat', label: 'Chat', icon: MessageSquare },
  { key: 'image', label: 'Image', icon: ImageIcon },
  { key: 'video', label: 'Video', icon: Video },
]

const placeholders: Record<Mode, string> = {
  chat: 'Message Kv-44…',
  image: 'Describe an image for Kv-44 to generate…',
  video: 'Describe a video for Kv-44 to generate…',
}

export function Composer({
  mode,
  onModeChange,
  input,
  onInputChange,
  attachments,
  onAddFiles,
  onRemoveAttachment,
  onSend,
  isBusy,
  textareaRef,
}: {
  mode: Mode
  onModeChange: (mode: Mode) => void
  input: string
  onInputChange: (v: string) => void
  attachments: Attachment[]
  onAddFiles: (files: FileList) => void
  onRemoveAttachment: (index: number) => void
  onSend: () => void
  isBusy: boolean
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canSend = !isBusy && (input.trim().length > 0 || attachments.length > 0)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const native = e.nativeEvent as unknown as { isComposing?: boolean; keyCode?: number }
    if (native.isComposing || native.keyCode === 229) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-5 sm:px-6">
      {/* Mode toggle */}
      <div className="mb-3 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {modes.map((m) => {
            const active = mode === m.key
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => onModeChange(m.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <m.icon className="size-4" />
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Input box */}
      <div className="rounded-2xl border border-border bg-card p-2 shadow-lg shadow-primary/5 focus-within:border-primary/50">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2">
            {attachments.map((att, i) => (
              <div
                key={i}
                className="group relative flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
              >
                {att.kind === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.url || '/placeholder.svg'}
                    alt={att.name}
                    className="size-8 rounded object-cover"
                  />
                ) : (
                  <Paperclip className="size-4 text-primary" />
                )}
                <span className="max-w-[120px] truncate">{att.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(i)}
                  aria-label={`Remove ${att.name}`}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {mode === 'chat' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.md,.csv,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) onAddFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-xl text-muted-foreground hover:text-primary"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach files or images"
              >
                <Paperclip className="size-5" />
              </Button>
            </>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={placeholders[mode]}
            className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
          />

          <Button
            type="button"
            size="icon"
            className="shrink-0 rounded-xl"
            disabled={!canSend}
            onClick={onSend}
            aria-label="Send message"
          >
            {isBusy ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          </Button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground text-balance">
        Kv-44 can make mistakes. It&apos;s exceptionally strong at math &amp; knows the Gerand Tank
        cartoon.
      </p>
    </div>
  )
}
