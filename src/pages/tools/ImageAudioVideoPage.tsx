import { useEffect, useState } from 'react'
import ToolPageShell from '../../components/tools/ToolPageShell'
import { createVideoFromImageAudio } from '../../lib/media'

export default function ImageAudioVideoPage() {
  const [image, setImage] = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const [duration, setDuration] = useState('10')
  const [status, setStatus] = useState<'idle' | 'creating' | 'error'>('idle')
  const [error, setError] = useState('')
  const [outputUrl, setOutputUrl] = useState('')

  useEffect(() => () => { if (outputUrl) URL.revokeObjectURL(outputUrl) }, [outputUrl])

  const createVideo = async () => {
    if (!image || !audio) return
    const seconds = Number(duration)
    if (!Number.isFinite(seconds) || seconds < 1 || seconds > 300) {
      setError('再生時間は1〜300秒で指定してください。')
      setStatus('error')
      return
    }
    setStatus('creating')
    setError('')
    if (outputUrl) URL.revokeObjectURL(outputUrl)
    try {
      const blob = await createVideoFromImageAudio(image, audio, seconds)
      setOutputUrl(URL.createObjectURL(blob))
      setStatus('idle')
    } catch (createError) {
      setStatus('error')
      setError(createError instanceof Error ? createError.message : '動画を作成できませんでした。')
    }
  }

  return (
    <ToolPageShell
      eyebrow="image + audio / video"
      title={<>一枚の絵に<br /><em>音を重ねる。</em></>}
      description="画像と音声を組み合わせて、ブラウザだけでWebM動画を作成します。素材は外部へ送信されません。"
    >
      <section className="tool-card tool-form-grid">
        <label className="tool-file-input"><span>画像</span><small>JPG・PNG・WebP</small><input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} />{image && <strong>{image.name}</strong>}</label>
        <label className="tool-file-input"><span>音声</span><small>MP3・WAV・M4Aなど</small><input type="file" accept="audio/*" onChange={(event) => setAudio(event.target.files?.[0] ?? null)} />{audio && <strong>{audio.name}</strong>}</label>
        <label>再生時間（秒）<input type="number" min="1" max="300" value={duration} onChange={(event) => setDuration(event.target.value)} /></label>
        {error && <p className="form-message form-message-error" role="alert">{error}</p>}
        <div className="tool-actions"><button className="button button-dark" type="button" disabled={!image || !audio || status === 'creating'} onClick={createVideo}>{status === 'creating' ? '作成中…' : '動画を作成 ↗'}</button>{outputUrl && <a className="quiet-link" href={outputUrl} download="image-audio-video.webm">WebMを保存 ↗</a>}</div>
        <p className="tool-note">出力はWebM形式です。音声の長さより短い時間を指定した場合、その時点で切り出します。</p>
      </section>
    </ToolPageShell>
  )
}
