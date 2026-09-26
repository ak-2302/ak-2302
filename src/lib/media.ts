function supportedMimeType() {
  const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

type VideoElementWithCaptureStream = HTMLVideoElement & {
  captureStream?: () => MediaStream
}

function waitForEvent(target: EventTarget, eventName: string) {
  return new Promise<void>((resolve, reject) => {
    const onLoad = () => {
      target.removeEventListener(eventName, onLoad)
      target.removeEventListener('error', onError)
      resolve()
    }
    const onError = () => {
      target.removeEventListener(eventName, onLoad)
      target.removeEventListener('error', onError)
      reject(new Error('メディアを読み込めませんでした。'))
    }
    target.addEventListener(eventName, onLoad, { once: true })
    target.addEventListener('error', onError, { once: true })
  })
}

function recordCanvas(canvas: HTMLCanvasElement, sourceStream: MediaStream | null, startSource: () => Promise<void>, duration: number) {
  const mimeType = supportedMimeType()
  if (!mimeType || !canvas.captureStream || !('MediaRecorder' in window)) {
    throw new Error('このブラウザはWebM変換に対応していません。')
  }

  const stream = canvas.captureStream(30)
  sourceStream?.getAudioTracks().forEach((track) => stream.addTrack(track))
  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks: BlobPart[] = []

  return new Promise<Blob>(async (resolve, reject) => {
    const cleanup = () => stream.getTracks().forEach((track) => track.stop())
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.onerror = () => {
      cleanup()
      reject(new Error('変換中にエラーが発生しました。'))
    }
    recorder.onstop = () => {
      cleanup()
      resolve(new Blob(chunks, { type: mimeType }))
    }

    try {
      recorder.start(250)
      await startSource()
      window.setTimeout(() => recorder.state === 'recording' && recorder.stop(), duration * 1000)
    } catch (error) {
      cleanup()
      if (recorder.state === 'recording') recorder.stop()
      reject(error instanceof Error ? error : new Error('変換に失敗しました。'))
    }
  })
}

export async function convertVideoToWebm(file: File) {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video') as VideoElementWithCaptureStream
  video.src = url
  video.muted = true
  video.playsInline = true
  await waitForEvent(video, 'loadedmetadata')

  const scale = Math.min(1, 1280 / video.videoWidth)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(2, Math.round(video.videoWidth * scale))
  canvas.height = Math.max(2, Math.round(video.videoHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('描画領域を作成できませんでした。')

  const sourceStream = typeof video.captureStream === 'function' ? video.captureStream() : null
  const duration = Number.isFinite(video.duration) ? video.duration : 60
  try {
    return await recordCanvas(canvas, sourceStream, async () => {
      await video.play()
      const draw = () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        if (!video.ended) requestAnimationFrame(draw)
      }
      draw()
    }, duration)
  } finally {
    sourceStream?.getTracks().forEach((track: MediaStreamTrack) => track.stop())
    URL.revokeObjectURL(url)
  }
}

export async function createVideoFromImageAudio(imageFile: File, audioFile: File, duration: number) {
  const imageUrl = URL.createObjectURL(imageFile)
  const audioUrl = URL.createObjectURL(audioFile)
  const image = new Image()
  image.src = imageUrl
  await waitForEvent(image, 'load')

  const audio = document.createElement('audio')
  audio.src = audioUrl
  audio.preload = 'auto'
  await waitForEvent(audio, 'loadedmetadata')
  const audioContext = new AudioContext()
  const source = audioContext.createMediaElementSource(audio)
  const destination = audioContext.createMediaStreamDestination()
  source.connect(destination)

  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 1280 / image.width)
  canvas.width = Math.max(2, Math.round(image.width * scale))
  canvas.height = Math.max(2, Math.round(image.height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('描画領域を作成できませんでした。')

  try {
    return await recordCanvas(canvas, destination.stream, async () => {
      await audioContext.resume()
      await audio.play()
      const draw = () => {
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        requestAnimationFrame(draw)
      }
      draw()
    }, duration)
  } finally {
    source.disconnect()
    await audioContext.close()
    URL.revokeObjectURL(imageUrl)
    URL.revokeObjectURL(audioUrl)
  }
}
