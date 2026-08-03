# ak-2302 Portfolio

ak-2302の個人ポートフォリオサイトです。Three.jsとPhysijsによる物理演算を使った6つの球を入口として、プロフィール、Webツール、ノート、アイデア、リンク、コンタクトをまとめています。

## 特徴

- 物理演算で動くインタラクティブなトップページ
- MarkdownからHTMLを生成するノート機能
- `note/*.md`の追加に合わせて一覧を更新するGitHub Actions
- Webツール、アイデアページ、ソーシャルリンクへの導線
- Cloudflare Workersを利用したお問い合わせフォーム

## 技術構成

- HTML / CSS / JavaScript
- Three.js / Physijs
- Node.js 20以上
- GitHub Actions
- Cloudflare Workers（お問い合わせ処理）

## ディレクトリ

```text
.
├── index.html              # ポートフォリオのトップページ
├── ref/                    # トップページで利用する画像・CSS・JavaScript
├── note/                   # Markdownノートと生成済みHTML
├── idea/                   # アイデアページ
├── tool/                   # Webツール
├── scripts/                # Markdown変換スクリプト
├── contact-worker/         # お問い合わせ用Cloudflare Worker
└── .github/workflows/      # GitHub Actions
```

## ローカル開発

静的ファイルサーバーでリポジトリのルートを配信します。

```bash
npx serve .
```

ノートのMarkdownをHTMLへ変換する場合は、依存関係をインストールしてから実行します。

```bash
npm install
npm run markdown:html
```

## ノートの追加

`note/`にMarkdownファイルを追加して`main`ブランチへプッシュすると、GitHub ActionsがHTMLとノート一覧を生成します。生成された一覧はトップページのNOTEモーダルに反映されます。

## ライセンス

各ライブラリのライセンスは、リポジトリ内のライセンスファイルおよび各ライブラリの配布元を参照してください。
