### プロジェクト概要

GitHub PagesのURLとコミットSHAを指定すると、そのコミット時点のページを可能な範囲で再現表示するWebツールを作成する。

対象は**管理者権限のない公開GitHub Pagesサイト**。

---

### 目的

GitHub Pagesには過去コミット版を表示する機能がないため、GitHub上に残っている履歴からページを再構成して閲覧できるようにする。

---

### 想定入力

```text
GitHub Pages URL
コミットSHA
```

例

```text
https://ak-2302.github.io/
bc31525f6a1234567890...
```

---

### 処理フロー

#### 1. Pages URLからリポジトリを特定

```text
https://username.github.io/
→ username/username.github.io

https://username.github.io/repo/
→ username/repo
```

不明な場合はGitHub APIで補助的に探索。

---

#### 2. 指定コミットのファイルを取得

GitHub Contents APIの `ref` パラメータにコミットSHAを指定する。([GitHub Docs][1])

例

```text
GET /repos/{owner}/{repo}/contents/index.html?ref={sha}
```

または

```text
https://raw.githubusercontent.com/{owner}/{repo}/{sha}/index.html
```

---

#### 3. HTML解析

取得したHTMLをDOMParserで解析。

以下を抽出。

```html
<link>
<script>
<img>
<source>
<a>
```

---

#### 4. 相対パスを書き換え

例

```html
<link href="style.css">
```

↓

```html
<link href="https://raw.githubusercontent.com/{owner}/{repo}/{sha}/style.css">
```

同様に

```html
src=
href=
fetch()
import()
```

なども変換。

---

#### 5. 表示

方法A

```html
<iframe srcdoc="...">
```

方法B

```javascript
document.open()
document.write(html)
document.close()
```

iframe推奨。

---

### 対応範囲

対応可能

```text
静的HTML
CSS
画像
通常のJavaScript
JSONファイル
```

部分対応

```text
SPA
React
Vue
Angular
```

困難

```text
サーバーサイドレンダリング
認証が必要なサイト
private repository
```

---

### UI案

```text
[Pages URL]

[Commit SHA]

[表示]
```

オプション

```text
[コミット履歴取得]
```

でリポジトリのコミット一覧を表示し選択可能。

---

### MVP

最初は以下だけ実装。

```text
1. GitHub Pages URL入力
2. コミットSHA入力
3. index.html取得
4. CSS・JS・画像の相対パス変換
5. iframe表示
```

React/Vue対応やJS動的解析は後回し。

---

### 実装

フレームワークやビルド処理を使わない静的Webアプリとして実装。

```text
index.html   UI
styles.css  レイアウト・レスポンシブ対応
app.js      HTML取得・DOM解析・iframe表示
core.js     URL解析・コミットURL生成・パス変換
```

ローカル起動

```bash
npm run serve
```

ブラウザで `http://localhost:4173` を開く。

テスト

```bash
npm test
```

### セキュリティ

- 取得したページは `iframe sandbox` 内で表示
- フォーム送信とオブジェクト埋め込みをCSPで禁止
- JavaScript実行は画面上で無効化可能
- GitHubトークンや認証情報は使用しない

### 現在の制約

- 公開リポジトリのみ対応
- エントリーポイントはリポジトリ直下の `index.html`
- GitHub Pagesのカスタムドメインは自動判別対象外
- ビルド済みファイルがコミットに含まれないSPAは再現不可

[1]: https://docs.github.com/v3/repos/contents?utm_source=chatgpt.com "REST API endpoints for repository contents"
