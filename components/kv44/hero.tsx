'use client'

import { Brain, Code2, FileText, ImageIcon, Pencil, Sparkles, Video } from 'lucide-react'
import type { Mode } from '@/lib/kv44-types'
import { KvLogo } from './kv-logo'

const features: {
  icon: React.ElementType
  label: string
  mode: Mode
}[] = [
  { icon: Brain, label: 'Chat & reason', mode: 'chat' },
  { icon: ImageIcon, label: 'Image generation', mode: 'image' },
  { icon: Video, label: 'Video generation', mode: 'video' },
  { icon: FileText, label: 'File & image Q&A', mode: 'chat' },
]

const suggestions: {
  icon: React.ElementType
  title: string
  sub: string
  prompt: string
  mode: Mode
}[] = [
  {
    icon: Pencil,
    title: 'Write a poem',
    sub: 'about the ocean at midnight',
    prompt: 'Write a poem about the ocean at midnight.',
    mode: 'chat',
  },
  {
    icon: Code2,
    title: 'Debug code',
    sub: 'fix a React useEffect loop',
    prompt: 'Help me debug and fix an infinite loop caused by a React useEffect.',
    mode: 'chat',
  },
  {
    icon: ImageIcon,
    title: 'Generate an image',
    sub: 'a serene mountain lake at sunset',
    prompt: 'A serene mountain lake at sunset, ultra detailed, cinematic lighting.',
    mode: 'image',
  },
  {
    icon: Video,
    title: 'Generate a video',
    sub: 'a serene mountain lake at sunset',
    prompt: 'A serene mountain lake at sunset with gentle ripples, cinematic.',
    mode: 'video',
  },
]

export function Hero({
  onSelectMode,
  onQuickPrompt,
}: {
  onSelectMode: (mode: Mode) => void
  onQuickPrompt: (prompt: string, mode: Mode) => void
}) {
  return (
    <div className="kv-fade-up mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-8 pb-4 text-center sm:pt-14">
      <KvLogo className="size-20 text-3xl" />

      <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-primary text-balance sm:text-6xl">
        Meet Kv-44
      </h1>

      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
        A next-generation AI — chat, generate images &amp; videos, and analyze any file or image.
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
        <Sparkles className="size-4" />
        Created by Hameed Shaik
      </div>

      {/* Feature cards */}
      <div className="mt-10 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {features.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => onSelectMode(f.mode)}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <f.icon className="size-5" />
            </span>
            <span className="text-sm font-semibold">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Suggestion prompts */}
      <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s.title}
            type="button"
            onClick={() => onQuickPrompt(s.prompt, s.mode)}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <s.icon className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">{s.title}</span>
              <span className="block text-sm text-muted-foreground">{s.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
