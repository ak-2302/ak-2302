import { useEffect, useRef, useState } from 'react'
import ToolPageShell from '../../components/tools/ToolPageShell'
import { convertVideoToWebm } from '../../lib/media'

type VideoItem = {
  id: string
  file: File
  status: 'ready' | 'converting' | 'done' | 'error'
  outputUrl?: string
  error?: string
}

function itemId(file: File) {
  return `${file.name}-${file.lastModified}-${file.size}`
}

export default function VideoTranscoderPage() {
  const [items, setItems] = useState<VideoItem[]>([])
  const itemsRef = useRef(items)

  useEffect(() => { itemsRef.current = items }, [items])
  useEffect(() => () => {
    itemsRef.current.forEach((item) => item.outputUrl && URL.revokeObjectURL(item.outputUrl))
  }, [])

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const next = Array.from(files)
      .filter((file) => file.type.startsWith('video/'))
      .map((file) => ({ id: itemId(file), file, status: 'ready' as const }))
    setItems((current) => [...current, ...next.filter((item) => !current.some((existing) => existing.id === item.id))])
  }

  const convertItem = async (item: VideoItem) => {
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'converting', error: undefined } : entry))
    try {
      const blob = await convertVideoToWebm(item.file)
      const outputUrl = URL.createObjectURL(blob)
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'done', outputUrl } : entry))
    } catch (error) {
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'error', error: error instanceof Error ? error.message : '変換に失敗しました。' } : entry))
    }
  }

  const convertAll = async () => {
    for (const item of items.filter((entry) => entry.status === 'ready' || entry.status === 'error')) {
      await convertItem(item)
    }
  }

  return (
    <ToolPageShell
      eyebrow="video / trans"
      title={<>動画を<br /><em>まとめて変換。</em></>}
      description="動画をブラウザ内でWebMへ変換します。ファイルはサーバーへ送信されません。"
    >
      <section className="tool-card">
        <label className="tool-file-input">
          <span>動画ファイルを選択</span>
          <small>複数選択できます / MP4・MOVなど</small>
          <input type="file" accept="video/*" multiple onChange={(event) => addFiles(event.target.files)} />
        </label>
        {items.length === 0 ? (
          <p className="tool-empty">まだ動画が選択されていません。</p>
        ) : (
          <div className="tool-file-list">
            {items.map((item) => (
              <div className="tool-file-row" key={item.id}>
                <div><strong>{item.file.name}</strong><span>{(item.file.size / 1024 / 1024).toFixed(1)} MB</span></div>
                {item.status === 'done' && item.outputUrl ? <a className="quiet-link" href={item.outputUrl} download={`${item.file.name.replace(/\.[^.]+$/, '')}.webm`}>保存 ↗</a> : <span className={`tool-status tool-status-${item.status}`}>{item.error ?? (item.status === 'converting' ? '変換中…' : '待機中')}</span>}
              </div>
            ))}
          </div>
        )}
        <button className="button button-dark" type="button" disabled={!items.some((item) => item.status === 'ready' || item.status === 'error')} onClick={convertAll}>選択した動画を変換 ↗</button>
        <p className="tool-note">出力形式はWebMです。ブラウザによって対応コーデックが異なります。</p>
      </section>
    </ToolPageShell>
  )
}
