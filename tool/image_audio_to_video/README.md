# 画像＋音声 動画化ツール

背景画像1枚と音声ファイル1つをブラウザ内で合成し、音声の長さのMP4動画として保存するツールです。素材はサーバーへアップロードされません。

## 使用方法

静的ページとして配信できます。WebCodecsベースのMediabunnyをCDNから読み込むため、初回起動時はインターネット接続が必要です。サーバーへのファイル送信はありません。

```sh
python3 -m http.server 4173
```

ブラウザで `http://localhost:4173/tool/image_audio_to_video/` を開き、画像と音声を追加して「動画を書き出す」を押してください。

## 必要な動作環境

WebCodecsのVideoEncoder / AudioEncoderに対応したChrome / Edge / Safariが必要です。Firefoxや一部のLinux環境ではAACエンコードが利用できない場合があります。
