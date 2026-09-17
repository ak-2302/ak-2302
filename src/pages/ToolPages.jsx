import { useEffect, useRef, useState } from "react";

const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;
const FRAME_RATE = 30;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function drawCover(context, image) {
  const scale = Math.max(
    VIDEO_WIDTH / image.width,
    VIDEO_HEIGHT / image.height,
  );
  const width = image.width * scale;
  const height = image.height * scale;
  context.fillStyle = "#0a0a0a";
  context.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  context.drawImage(
    image,
    (VIDEO_WIDTH - width) / 2,
    (VIDEO_HEIGHT - height) / 2,
    width,
    height,
  );
}

export function MediaMakerPage() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const imageUrlRef = useRef(null);
  const audioUrlRef = useRef(null);
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("画像と音声を追加してください");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(
    () => () => {
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!image) return;
    const context = canvasRef.current?.getContext("2d");
    if (context) drawCover(context, image);
  }, [image]);

  useEffect(() => {
    const player = audioRef.current;
    if (!player) return undefined;
    const update = () => setCurrentTime(player.currentTime);
    const ended = () => setIsPlaying(false);
    player.addEventListener("timeupdate", update);
    player.addEventListener("ended", ended);
    return () => {
      player.removeEventListener("timeupdate", update);
      player.removeEventListener("ended", ended);
    };
  }, [audio]);

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    const url = URL.createObjectURL(file);
    imageUrlRef.current = url;
    const loaded = new Image();
    loaded.onload = () => setImage({ file, element: loaded, url });
    loaded.src = url;
  };

  const handleAudio = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    const url = URL.createObjectURL(file);
    audioUrlRef.current = url;
    setAudio({ file, url });
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const togglePlayback = async () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      await audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const exportVideo = async () => {
    if (!image || !audio || !duration || isExporting) return;
    setIsExporting(true);
    setProgress(0);
    setStatus("MP4エンジンを準備しています");
    try {
      const {
        Output,
        Mp4OutputFormat,
        BufferTarget,
        CanvasSource,
        AudioBufferSource,
        QUALITY_HIGH,
      } = await import("https://cdn.jsdelivr.net/npm/mediabunny@1.31.0/+esm");
      const context = new AudioContext();
      const buffer = await context.decodeAudioData(
        await audio.file.arrayBuffer(),
      );
      const output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget(),
      });
      const videoSource = new CanvasSource(canvasRef.current, {
        codec: "avc",
        bitrate: QUALITY_HIGH,
      });
      const audioSource = new AudioBufferSource({
        codec: "aac",
        bitrate: QUALITY_HIGH,
      });
      output.addVideoTrack(videoSource);
      output.addAudioTrack(audioSource);
      await output.start();
      for (let time = 0; time < buffer.duration; time += 1 / FRAME_RATE) {
        drawCover(canvasRef.current.getContext("2d"), image.element);
        await videoSource.add(
          time,
          Math.min(1 / FRAME_RATE, buffer.duration - time),
        );
        setProgress(Math.round((time / buffer.duration) * 100));
        setStatus(
          `MP4を書き出し中… ${Math.round((time / buffer.duration) * 100)}%`,
        );
      }
      await audioSource.add(buffer);
      await output.finalize();
      const link = document.createElement("a");
      const url = URL.createObjectURL(
        new Blob([output.target.buffer], { type: "video/mp4" }),
      );
      link.href = url;
      link.download = `${image.file.name.replace(/\.[^.]+$/, "")}_video.mp4`;
      link.click();
      URL.revokeObjectURL(url);
      await context.close();
      setProgress(100);
      setStatus("MP4の書き出しが完了しました");
    } catch (error) {
      console.error(error);
      setStatus(`書き出しに失敗しました: ${error.message || "変換エラー"}`);
    } finally {
      setIsExporting(false);
    }
  };

  const ready = Boolean(image && audio && duration);
  return (
    <main className="app_shell media_maker">
      <header className="topbar">
        <a className="brand" href="./">
          ◒　画像と音声から動画をつくる
        </a>
        <div className="privacy_note">● ブラウザ内で処理</div>
      </header>
      <section className="workspace">
        <div className="asset_column">
          <div className="section_heading">
            <span>01</span>
            <h2>素材を追加</h2>
          </div>
          <label
            className={`drop_zone${image ? " has_file" : ""}`}
            htmlFor="image_input"
          >
            <input
              id="image_input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImage}
            />
            <span className="upload_icon">＋</span>
            <strong>背景画像</strong>
            <small>{image?.file.name || "JPG / PNG / WEBP"}</small>
          </label>
          <label
            className={`drop_zone${audio ? " has_file" : ""}`}
            htmlFor="audio_input"
          >
            <input
              id="audio_input"
              type="file"
              accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
              onChange={handleAudio}
            />
            <span className="upload_icon audio_icon">∿</span>
            <strong>音声ファイル</strong>
            <small>{audio?.file.name || "MP3 / WAV / M4A"}</small>
          </label>
          <p className="helper">⌁ ファイルは端末の外へ送信されません</p>
        </div>
        <div className="preview_column">
          <div className="section_heading">
            <span>PREVIEW</span>
            <h2>プレビュー</h2>
          </div>
          <div className={`preview_frame${image ? " has_preview" : ""}`}>
            <canvas ref={canvasRef} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} />
            {!image && (
              <div className="empty_preview">
                <span className="preview_glyph">◫</span>
                <p>
                  画像を追加すると
                  <br />
                  ここにプレビューが表示されます
                </p>
              </div>
            )}
            <button
              className="play_button"
              type="button"
              onClick={togglePlayback}
              disabled={!audio}
              aria-label="プレビューを再生"
            >
              {isPlaying ? "Ⅱ" : "▶"}
            </button>
          </div>
          <div className="timeline">
            <span>{formatTime(currentTime)}</span>
            <div className="timeline_track">
              <span
                style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
          <audio
            ref={audioRef}
            src={audio?.url}
            onLoadedMetadata={(event) =>
              setDuration(event.currentTarget.duration)
            }
            hidden
          />
        </div>
      </section>
      <section className="export_row">
        <div className="format_group">
          <div className="section_heading">
            <span>02</span>
            <h2>書き出し設定</h2>
          </div>
          <div className="format_options">
            <label>
              <input type="radio" checked readOnly />
              <span>MP4</span>
              <small>互換性優先</small>
            </label>
          </div>
        </div>
        <div className="export_action">
          <button
            type="button"
            onClick={exportVideo}
            disabled={!ready || isExporting}
          >
            <span>{isExporting ? "書き出し中…" : "動画を書き出す"}</span>
            <span className="arrow">→</span>
          </button>
          <p>{isExporting ? `${status} ${progress}%` : status}</p>
        </div>
      </section>
      <footer>
        <span>画像と音声から動画をつくる</span>
        <span>処理はすべてこのブラウザで完結します</span>
      </footer>
    </main>
  );
}
