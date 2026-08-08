'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Attachment, Message, Mode } from '@/lib/kv44-types'
import { STORAGE_KEY } from '@/lib/kv44-types'
import { Composer } from './composer'
import { Header } from './header'
import { Hero } from './hero'
import { MessageList } from './message-list'

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function readFileAsDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function Kv44App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('chat')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isBusy, setIsBusy] = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load persisted conversation (memory across sessions).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setMessages(JSON.parse(raw))
    } catch {
      /* ignore */
    }
    setLoaded(true)
  }, [])

  // Persist conversation.
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      /* storage full or unavailable */
    }
  }, [messages, loaded])

  // Auto-resize textarea.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  // Auto-scroll to bottom.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const addFiles = useCallback(async (files: FileList) => {
    const next: Attachment[] = []
    for (const file of Array.from(files)) {
      const url = await readFileAsDataURL(file)
      next.push({
        kind: file.type.startsWith('image/') ? 'image' : 'file',
        url,
        mediaType: file.type || 'application/octet-stream',
        name: file.name,
      })
    }
    setAttachments((prev) => [...prev, ...next])
  }, [])

  const streamChat = useCallback(
    async (history: Message[], assistantId: string) => {
      const payload = history.map((m) => ({
        role: m.role,
        content:
          m.content ||
          (m.generatedImage ? '[generated an image]' : m.generatedVideo ? '[generated a video]' : ''),
        attachments: m.attachments,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      })

      if (!res.ok || !res.body) {
        throw new Error('chat request failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)),
        )
      }

      if (!acc.trim()) {
        throw new Error(
          "Kv-44 couldn't produce a reply. If you own this app, the Vercel AI Gateway needs a valid credit card on file to unlock its free credits — add one in your Vercel dashboard under AI, then try again.",
        )
      }
    },
    [],
  )

  const generateMedia = useCallback(
    async (kind: 'image' | 'video', prompt: string, assistantId: string) => {
      const res = await fetch(`/api/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          kind === 'video' ? { prompt, durationSeconds: 8 } : { prompt },
        ),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'generation failed')

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  kind === 'image'
                    ? 'Here is the image you asked for:'
                    : `Here is your ${data.resolution ?? '1080p'} movie-clarity clip (${data.duration ?? 8}s, with audio):`,
                ...(kind === 'image'
                  ? { generatedImage: data.image }
                  : { generatedVideo: data.video }),
              }
            : m,
        ),
      )
    },
    [],
  )

  const runSend = useCallback(
    async (text: string, sendMode: Mode, atts: Attachment[]) => {
      const trimmed = text.trim()
      if (!trimmed && atts.length === 0) return

      const userMsg: Message = {
        id: uid(),
        role: 'user',
        content: trimmed,
        attachments: atts.length ? atts : undefined,
        mode: sendMode,
      }
      const assistantMsg: Message = {
        id: uid(),
        role: 'assistant',
        content: '',
        mode: sendMode,
      }

      const history = [...messages, userMsg]
      setMessages([...history, assistantMsg])
      setInput('')
      setAttachments([])
      setIsBusy(true)
      setStreamingId(assistantMsg.id)

      try {
        if (sendMode === 'chat') {
          await streamChat(history, assistantMsg.id)
        } else {
          await generateMedia(sendMode, trimmed, assistantMsg.id)
        }
      } catch (err) {
        const message =
          err instanceof Error && err.message && err.message !== 'chat request failed'
            ? err.message
            : 'Kv-44 ran into a problem. Please try again.'
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: message, error: true } : m,
          ),
        )
      } finally {
        setIsBusy(false)
        setStreamingId(null)
      }
    },
    [messages, streamChat, generateMedia],
  )

  const handleSend = useCallback(() => {
    if (isBusy) return
    runSend(input, mode, attachments)
  }, [input, mode, attachments, isBusy, runSend])

  const handleQuickPrompt = useCallback(
    (prompt: string, promptMode: Mode) => {
      if (isBusy) return
      setMode(promptMode)
      runSend(prompt, promptMode, [])
    },
    [isBusy, runSend],
  )

  const handleSelectMode = useCallback((m: Mode) => {
    setMode(m)
    textareaRef.current?.focus()
  }, [])

  const handleReset = useCallback(() => {
    setMessages([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Header onReset={handleReset} showReset={hasMessages} />

      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        {hasMessages ? (
          <MessageList messages={messages} streamingId={streamingId} />
        ) : (
          <Hero onSelectMode={handleSelectMode} onQuickPrompt={handleQuickPrompt} />
        )}
      </main>

      <div className="shrink-0 border-t border-border/60 bg-background/80 backdrop-blur-xl">
        <Composer
          mode={mode}
          onModeChange={setMode}
          input={input}
          onInputChange={setInput}
          attachments={attachments}
          onAddFiles={addFiles}
          onRemoveAttachment={(i) => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
          onSend={handleSend}
          isBusy={isBusy}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  )
}
