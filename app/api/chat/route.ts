import { streamText, type ModelMessage } from 'ai'
import { CHAT_MODEL, KV44_SYSTEM_PROMPT } from '@/lib/kv44-knowledge'

export const maxDuration = 60

type Attachment = {
  kind: 'image' | 'file'
  url: string // data URL
  mediaType: string
  name: string
}

type IncomingMessage = {
  role: 'user' | 'assistant'
  content: string
  attachments?: Attachment[]
}

function toModelMessages(messages: IncomingMessage[]): ModelMessage[] {
  return messages.map((m) => {
    if (m.role === 'assistant' || !m.attachments?.length) {
      return { role: m.role, content: m.content } as ModelMessage
    }

    const parts: Array<
      | { type: 'text'; text: string }
      | { type: 'image'; image: string }
      | { type: 'file'; data: string; mediaType: string }
    > = []

    if (m.content?.trim()) parts.push({ type: 'text', text: m.content })

    for (const att of m.attachments) {
      if (att.kind === 'image') {
        parts.push({ type: 'image', image: att.url })
      } else {
        parts.push({ type: 'file', data: att.url, mediaType: att.mediaType })
      }
    }

    if (parts.length === 0) parts.push({ type: 'text', text: m.content ?? '' })

    return { role: 'user', content: parts } as ModelMessage
  })
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: IncomingMessage[] }

    const result = streamText({
      model: CHAT_MODEL,
      system: KV44_SYSTEM_PROMPT,
      messages: toModelMessages(messages ?? []),
      temperature: 0.7,
      onError: ({ error }) => {
        console.log('[v0] chat stream error:', error instanceof Error ? error.message : error)
      },
    })

    return result.toTextStreamResponse()
  } catch (err) {
    console.log('[v0] chat route error:', err instanceof Error ? err.message : err)
    return new Response('Kv-44 ran into an error generating a reply. Please try again.', {
      status: 500,
    })
  }
}
