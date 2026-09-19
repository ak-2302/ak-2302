# 個人ホームページの技術選定

参考：README.md、Webデザイン指針、Webデザイン詳細指針、frontend-app-builder、GSAP／ScrollTrigger公式資料、Astro／Next.js公式資料

## 結論

以下の構成を推奨する。

- フレームワーク：React + Vite
- 言語：TypeScript
- アニメーション：GSAP + `@gsap/react` + ScrollTrigger
- 3D表現：React Three Fiber + Three.js + drei
- スタイリング：CSS Modulesまたは通常のCSS + CSS変数
- コンテンツ管理：TypeScriptのデータファイル。将来的にMDXへ拡張可能
- デプロイ：GitHub Pages
- テスト：Vitest、React Testing Library、Playwright
- 品質確認：デスクトップ／モバイルのブラウザ確認、`prefers-reduced-motion`、キーボード操作

## 採用理由

### React + Vite

既存リポジトリがReact + Vite構成で、GitHub Pages向けの静的サイトとして運用されているため、最も移行リスクが低い。

個人サイトではSSRやAPIルートよりも、高いモーション自由度、静的ホスティングとの相性、AIが生成・修正しやすい単純な構成、ビルドとデバッグの速さ、既存資産との互換性を優先する。

Next.jsも有力だが、今回のサイトではサーバー機能を使わないため、App RouterやServer Componentsが複雑さとして残る可能性がある。Astroは静的HTMLと部分的なJavaScript配信に優れるが、ページ全体を豊富に動かす構成ではReact + Viteのほうが一貫して実装しやすい。

### GSAP

「滑らかな動きが多い」ことを最優先するため、CSSアニメーションだけではなくGSAPを中心にする。

- 初期表示のタイムライン
- スクロール連動アニメーション
- ピン留めと横スクロール
- マウス追従
- 作品一覧の変形
- ページ遷移
- SVGや画像の細かな補間

Reactでは`@gsap/react`の`useGSAP`を使い、コンポーネント破棄時にアニメーションとScrollTriggerを確実にクリーンアップする。

### React Three Fiber

「2D＋控えめな3D」を採用し、3Dをサイト全体の土台にはせず、次のような限定的な箇所だけに使用する。

- ヒーローの小さなインタラクティブオブジェクト
- プロフィールや作品の視覚的なアクセント
- マウスやスクロールに反応する背景要素
- 作品詳細ページの簡易3Dプレビュー

3D部分は遅延読み込みし、WebGL非対応端末や低性能端末では静止画像・CSS表現へフォールバックする。

### CSS Modulesまたは通常のCSS

Tailwind CSSやUIライブラリは採用せず、CSS変数を中心にした小さなデザインシステムを作る。

色、タイポグラフィ、余白、ブレークポイント、イージング、レイヤー順はデザイントークンとして共通化する。

## 想定ディレクトリ構成

```text
src/
  app/
    App.tsx
    routes.tsx
  components/
    layout/
    motion/
    navigation/
    media/
  sections/
    hero/
    profile/
    works/
    experiments/
    contact/
  three/
    CanvasScene.tsx
    fallback/
  data/
    profile.ts
    works.ts
  styles/
    tokens.css
    globals.css
  hooks/
  lib/
```

## モーション方針

動きは装飾として増やすのではなく、サイトの情報構造と操作を伝える用途に限定する。

- 初回表示：短いタイムラインでページの読み込みを演出
- スクロール：セクションの出現、画像の視差、作品の切り替え
- ホバー：カーソル位置や対象の意味を補強
- ナビゲーション：ページ内の移動先を明確化
- 3D：常時回転ではなく、ユーザー操作やスクロールに反応
- モバイル：マウス依存の演出を削減
- reduced motion：トランジションを短縮または無効化

Lenisなどのスムーススクロールライブラリは初期構成には入れず、まずネイティブスクロールとScrollTriggerで実装する。必要な場合のみ追加する。

## 実装・検証方針

- 既存の削除状態を復元したり、ユーザー変更を上書きしたりしない
- `main.jsx`中心の既存構成をTypeScriptへ段階的に移行
- Reactコンポーネント、データ、モーション処理を分離
- 既存のGitHub Pages運用を維持
- TypeScript型検査、Lint、ビルド、Vitestを実行
- Playwrightで初回表示、セクション移動、作品操作、モバイル表示、キーボード操作、reduced motion、WebGL無効時のフォールバック、コンソールエラーを確認
- デスクトップとモバイルのスクリーンショットで、AI定型のカード構成・過剰な発光・意味のない常時ループがないか自己批評する

## 採用しない構成

- Next.js：将来ブログ、CMS、サーバー処理が必要になった場合に再検討
- Astro：コンテンツ主体でJavaScriptを最小化したい場合に再検討
- Framer Motion：UIトランジション中心なら候補だが、今回のスクロール演出とTimeline制御にはGSAPを優先
- Tailwind CSS：迅速な画面構築よりも、固有のビジュアルと細かなモーション制御を優先
- 常時稼働するWebGL背景：性能、スマホ、アクセシビリティ上の負担が大きいため不採用

## 前提

- 既存の独自ドメインとGitHub Pages運用を維持する
- サイトは個人プロフィール、作品、実験、連絡先を主な内容とする
- 3Dは補助的に使用し、サイト全体を3D空間にはしない
- 初期リリースでは外部CMSやログイン機能を導入しない

## 参照資料

- [Next.js Documentation](https://nextjs.org/docs)
- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/)
- [GSAP ScrollTrigger Documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP React Hook](https://www.npmjs.com/package/@gsap/react)
