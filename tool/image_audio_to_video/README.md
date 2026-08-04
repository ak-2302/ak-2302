# 画像＋音声 動画化ツール

背景画像1枚と音声ファイル1つをブラウザ内で合成し、音声の長さのMP4またはWebM動画として保存するツールです。素材はサーバーへアップロードされません。

## 使用方法

リポジトリのルートでローカルサーバーを起動します。MP4変換エンジンをCDNから読み込むため、初回起動時はインターネット接続が必要です。

```sh
python3 -m http.server 4173
```

ブラウザで `http://localhost:4173/tool/image_audio_to_video/` を開き、画像と音声を追加して「動画を書き出す」を押してください。

## 必要な動作環境

`canvas.captureStream`、Web Audio API、MediaRecorder APIに対応したChrome / Edge / Firefox / Safariが必要です。MP4変換にはFFmpeg.wasmを使用します。
