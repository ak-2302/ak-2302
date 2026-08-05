# ak-2302 portfolio

Webブラウザーで動作するポートフォリオと、画像・動画・配信向けの小さなツールをまとめた静的サイトです。トップページではThree.jsとPhysijsを使ったインタラクティブな球から、各コンテンツへ移動できます。

## 使用方法

Node.js 20以上を用意し、リポジトリのルートで依存関係をインストールします。

```sh
npm install
npm run markdown:html
```

静的ファイルは任意のHTTPサーバーで配信してください。例えば次のコマンドでローカル確認できます。

```sh
python3 -m http.server 4173
```

ブラウザーで `http://localhost:4173/` を開きます。ノートのMarkdownを変更した場合は `npm run markdown:html` を再実行してください。

## テスト

```sh
npm test
```

GitHub Pages履歴ツールのユニットテストと、`contact-worker` のCloudflare Workersテストを実行します。

## 必要な動作環境

- Node.js 20以上
- npm
- WebGLとJavaScriptを有効にした最新のブラウザー
- `contact-worker` を運用する場合はCloudflare Workers環境とDiscord Webhook URL
