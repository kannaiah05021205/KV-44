import { experimental_generateVideo as generateVideo } from 'ai'
import {
  VIDEO_MODEL,
  VIDEO_RESOLUTION,
  VIDEO_MAX_DURATION_SECONDS,
  VIDEO_DEFAULT_DURATION_SECONDS,
} from '@/lib/kv44-knowledge'

// Full-quality video generation with polling can take a while.
export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const { prompt, durationSeconds, aspectRatio } = (await req.json()) as {
      prompt?: string
      durationSeconds?: number
      aspectRatio?: `${number}:${number}`
    }

    if (!prompt?.trim()) {
      return Response.json({ error: 'Please describe the video you want.' }, { status: 400 })
    }

    // Clamp to the model's real capability. AI video models produce short
    // cinematic clips (seconds), not multi-hour footage.
    const requested = Number.isFinite(durationSeconds) ? Number(durationSeconds) : VIDEO_DEFAULT_DURATION_SECONDS
    const duration = Math.max(1, Math.min(VIDEO_MAX_DURATION_SECONDS, Math.round(requested)))

    const { video } = await generateVideo({
      model: VIDEO_MODEL,
      prompt,
      aspectRatio: aspectRatio ?? '16:9',
      resolution: VIDEO_RESOLUTION, // 1080p movie clarity
      duration,
      generateAudio: true, // synced audio for cinematic output
    })

    const dataUrl = `data:${video.mediaType};base64,${video.base64}`
    return Response.json({ video: dataUrl, duration, resolution: VIDEO_RESOLUTION })
  } catch (err) {
    console.log('[v0] video route error:', err instanceof Error ? err.message : err)
    return Response.json(
      {
        error:
          'Kv-44 could not generate that video. Full 1080p generation is heavy — please try again, and keep the requested duration within the supported clip length.',
      },
      { status: 500 },
    )
  }
}
