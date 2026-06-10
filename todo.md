# タスク
物理演算を使用したホームページの作成

## 要件
- Three.js を使用した 3D 表示
- Physijs を使用した物理演算

## 構成
- index.html： メインページ
- ref/： 依存ファイル
- ref/style/： スタイルシートディレクトリ
- ref/style/reset.css： リセットcss
- ref/style/style.css： メインスタイルシート
- ref/style/3d.css： 3D表示用スタイルシート
- ref/image/： 画像ディレクトリ
- ref/script/： スクリプトディレクトリ
- ref/script/script.js： メインスクリプト
- ref/script/3d.js： 3D表示用スクリプト

## 設計
- 画面には半透明な箱と、その内部に3次元球を配置する。
- 球にはそれぞれ、PROFILE、TOOL、LINK、CONTACT、という文字を表示する。
- 球はタップして開くことができる。
- タップした時にはそれぞれ異なるポップアップが開く(未設計)
- 球以外の場所をドラッグすると箱の向きが回転する
- ピンチイン、ピンチアウトで拡大率が変わる

## デザイン
- 黒やグレーや白の色で清潔な印象
- 