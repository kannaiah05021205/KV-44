export type Mode = 'chat' | 'image' | 'video'

export type Attachment = {
  kind: 'image' | 'file'
  url: string // data URL
  mediaType: string
  name: string
}

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachments?: Attachment[]
  generatedImage?: string
  generatedVideo?: string
  mode?: Mode
  error?: boolean
}

export const STORAGE_KEY = 'kv44:conversation:v1'
