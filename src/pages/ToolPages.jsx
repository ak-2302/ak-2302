import { useEffect } from "react";

export function MediaMakerPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/tool/image_audio_to_video/script.js";
    script.defer = true;
    document.body.append(script);
    return () => script.remove();
  }, []);
  return (
    <main className="app_shell">
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
            className="drop_zone"
            id="image_drop_zone"
            htmlFor="image_input"
          >
            <input id="image_input" type="file" accept="image/*" />
            <span className="upload_icon">＋</span>
            <strong>背景画像</strong>
            <small id="image_name">JPG / PNG / WEBP</small>
          </label>
          <label
            className="drop_zone"
            id="audio_drop_zone"
            htmlFor="audio_input"
          >
            <input id="audio_input" type="file" accept="audio/*" />
            <span className="upload_icon audio_icon">∿</span>
            <strong>音声ファイル</strong>
            <small id="audio_name">MP3 / WAV / M4A</small>
          </label>
          <p className="helper">⌁ ファイルは端末の外へ送信されません</p>
        </div>
        <div className="preview_column">
          <div className="section_heading">
            <span>PREVIEW</span>
            <h2>プレビュー</h2>
          </div>
          <div className="preview_frame" id="preview_frame">
            <canvas id="preview_canvas" width="1280" height="720" />
            <div className="empty_preview" id="empty_preview">
              <span className="preview_glyph">◫</span>
              <p>
                画像を追加すると
                <br />
                ここにプレビューが表示されます
              </p>
            </div>
            <button
              className="play_button"
              id="play_button"
              type="button"
              aria-label="プレビューを再生"
            >
              ▶
            </button>
          </div>
          <div className="timeline">
            <span id="current_time">00:00</span>
            <div className="timeline_track">
              <span id="timeline_progress" />
            </div>
            <span id="total_time">00:00</span>
          </div>
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
              <input type="radio" name="format" value="mp4" defaultChecked />
              <span>MP4</span>
              <small>互換性優先</small>
            </label>
          </div>
        </div>
        <div className="export_action">
          <button id="export_button" type="button" disabled>
            <span id="export_label">動画を書き出す</span>
            <span className="arrow">→</span>
          </button>
          <p id="export_status">画像と音声を追加してください</p>
        </div>
      </section>
      <footer>
        <span>画像と音声から動画をつくる</span>
        <span>処理はすべてこのブラウザで完結します</span>
      </footer>
    </main>
  );
}
export function ImageConverterPage() {
  useEffect(() => {
    const external = document.createElement("script");
    external.src =
      "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
    external.onload = () => {
      const script = document.createElement("script");
      script.src = "/tool/image_converter/script.js";
      script.defer = true;
      document.body.append(script);
    };
    document.head.append(external);
    return () => {
      external.remove();
    };
  }, []);
  return (
    <main className="app_shell">
      <input id="file_input" type="file" accept="image/*" hidden />
      <section className="canvas_panel panel">
        <div className="canvas_heading">
          <p className="section_label">CANVAS</p>
          <button id="clear_button" className="text_button" type="button">
            画像を削除
          </button>
        </div>
        <div
          id="canvas_stage"
          className="canvas_stage"
          role="button"
          tabIndex="0"
          aria-label="画像を選択"
        >
          <div id="empty_state" className="empty_state">
            <strong>ここに画像が表示されます</strong>
            <span>画像を1枚選択してください。</span>
          </div>
          <img id="canvas_image" alt="編集対象の画像" hidden />
        </div>
        <div className="canvas_meta">
          <span id="canvas_file_name">未選択</span>
          <span id="canvas_dimensions">—</span>
          <span id="canvas_size">—</span>
        </div>
      </section>
      <aside id="settings_panel" className="settings_panel panel">
        <div className="tool_menu" role="toolbar" aria-label="画像編集メニュー">
          <button className="tool_menu_button" data-tool="size">
            サイズ
          </button>
          <button className="tool_menu_button" data-tool="transform">
            変形
          </button>
          <button className="tool_menu_button" data-tool="adjust">
            補正
          </button>
          <button className="tool_menu_button" data-tool="crop">
            切抜き
          </button>
          <button
            id="convert_button"
            className="tool_save_button"
            type="button"
            disabled
          >
            保存
          </button>
        </div>
        <div id="tool_popover" className="tool_popover" hidden>
          <section className="tool_panel" data-panel="size">
            <h2>サイズ</h2>
            <label className="field">
              幅<input id="width_input" type="number" min="1" />
            </label>
            <label className="field">
              高さ
              <input id="height_input" type="number" min="1" />
            </label>
            <label className="check_row">
              <input id="aspect_lock" type="checkbox" defaultChecked />
              縦横比を維持
            </label>
          </section>
          <section className="tool_panel" data-panel="transform">
            <h2>回転・反転</h2>
            <button data-action="rotate_left" type="button">
              ↶ 左回転
            </button>
            <button data-action="rotate_right" type="button">
              ↷ 右回転
            </button>
            <button data-action="flip_h" type="button">
              ↔ 水平反転
            </button>
            <button data-action="flip_v" type="button">
              ↕ 垂直反転
            </button>
          </section>
          <section className="tool_panel" data-panel="adjust">
            <h2>色調補正</h2>
            {["brightness", "contrast", "saturation"].map((x) => (
              <label className="slider_row" key={x}>
                {x}
                <output id={`${x}_value`}>0</output>
                <input
                  id={`${x}_input`}
                  type="range"
                  min="-100"
                  max="100"
                  defaultValue="0"
                />
              </label>
            ))}
          </section>
          <section className="tool_panel" data-panel="crop">
            <h2>トリミング</h2>
            <select id="crop_ratio">
              <option value="none">トリミングしない</option>
              <option value="1:1">1:1</option>
              <option value="16:9">16:9</option>
            </select>
          </section>
        </div>
        <span
          id="status_message"
          className="status_message"
          role="status"
          aria-live="polite"
        />
      </aside>
      <section id="result_panel" className="panel result_panel" hidden>
        <div className="panel_heading">
          <div>
            <p className="section_label">RESULT</p>
            <h2>変換結果</h2>
            <p id="result_summary" />
          </div>
          <button id="download_all_button" type="button">
            ZIPで保存
          </button>
        </div>
        <div id="result_list" />
      </section>
    </main>
  );
}
