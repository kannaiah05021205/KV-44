import { generateImage } from 'ai'
import { IMAGE_MODEL } from '@/lib/kv44-knowledge'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string }

    if (!prompt?.trim()) {
      return Response.json({ error: 'Please describe the image you want.' }, { status: 400 })
    }

    const { image } = await generateImage({
      model: IMAGE_MODEL,
      prompt,
      aspectRatio: '1:1',
    })

    const dataUrl = `data:${image.mediaType};base64,${image.base64}`
    return Response.json({ image: dataUrl })
  } catch (err) {
    console.log('[v0] image route error:', err instanceof Error ? err.message : err)
    return Response.json(
      { error: 'Kv-44 could not generate that image. Please try a different prompt.' },
      { status: 500 },
    )
  }
}
