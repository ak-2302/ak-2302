# 画像＋音声 動画化ツール

背景画像1枚と音声ファイル1つをブラウザ内で合成し、音声の長さのMP4動画として保存するツールです。素材はサーバーへアップロードされません。

## 使用方法

静的ページとして配信できます。MP4を直接録画できるブラウザでは追加設定なしで動作し、その他のブラウザではFFmpeg.wasmによる変換のため専用サーバーが必要です。MP4変換エンジンをCDNから読み込むため、初回起動時はインターネット接続が必要です。

```sh
python3 tool/image_audio_to_video/server.py
```

ブラウザで `http://localhost:4173/tool/image_audio_to_video/` を開き、画像と音声を追加して「動画を書き出す」を押してください。

## 必要な動作環境

`canvas.captureStream`、Web Audio API、MediaRecorder APIに対応したChrome / Edge / Firefox / Safariが必要です。MP4変換にはFFmpeg.wasmを使用します。
