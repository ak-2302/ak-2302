import { useEffect } from "react";
import * as FFmpeg from "@ffmpeg/ffmpeg";
import JSZip from "jszip";
import videoTransHtml from "../../tool/video_trans/index.html?raw";
import githubPagesStyles from "../../tool/github_pages_commits/styles.css?raw";

export function VideoTransPage() {
  useEffect(() => {
    window.FFmpeg = FFmpeg;
    window.JSZip = JSZip;
    const script = document.createElement("script");
    script.src = "./index.js";
    script.defer = true;
    document.body.append(script);
    return () => {
      script.remove();
      delete window.FFmpeg;
      delete window.JSZip;
    };
  }, []);
  return <LegacyMarkup html={videoTransHtml} />;
}

export function LegacyReactPage({ html, script, type = "text/javascript" }) {
  useEffect(() => {
    const element = document.createElement("script");
    element.src = script;
    element.type = type;
    element.defer = true;
    document.body.append(element);
    return () => element.remove();
  }, [script, type]);
  return <LegacyMarkup html={html} />;
}

export function GithubPagesCommitsPage() {
  useEffect(() => {
    const element = document.createElement("script");
    element.src = "./app.js";
    element.type = "module";
    element.defer = true;
    document.body.append(element);
    return () => element.remove();
  }, []);

  return (
    <div className="github-pages-tool">
      <style dangerouslySetInnerHTML={{ __html: githubPagesStyles }} />
      <div className="page-shell">
        <header className="site-header"><a className="brand" href="./"><span className="brand-mark">↗</span><span>過去のGitHub Pagesの履歴を見る</span></a><div className="header-note"><span className="status-dot" />Public repositories only</div></header>
        <main>
          <section className="workspace" aria-labelledby="viewer-title">
            <div className="control-panel"><div className="panel-heading"><div><p className="panel-kicker">01 / SOURCE</p><h2 id="viewer-title">ページを指定</h2></div><button className="text-button" id="fill-example" type="button">例を入力</button></div>
              <form id="viewer-form" noValidate><label className="field"><span className="field-label">GitHub Pages URL</span><span className="input-wrap"><input id="pages-url" name="pages-url" type="url" placeholder="https://username.github.io/repository/" required /></span><span className="field-hint">ユーザーサイト、プロジェクトサイトの両方に対応</span></label>
                <div className="field"><div className="field-label-row"><label className="field-label" htmlFor="commit-select">表示するバージョン</label><button className="refresh-button" id="refresh-commits" type="button" disabled>履歴を更新</button></div><span className="input-wrap select-wrap"><select id="commit-select" name="commit-select"><option value="">最新の公開ページ</option></select></span><span className="field-hint" id="commit-hint">URLを入力するとコミット履歴を自動取得します</span></div>
                <label className="toggle-row"><span><strong>JavaScriptを実行</strong><small>取得したページのスクリプトをsandbox内で許可</small></span><input id="allow-scripts" type="checkbox" defaultChecked /><span className="toggle" /></label>
                <button className="primary-button" id="submit-button" type="submit"><span>最新ページを表示</span><span>→</span></button>
              </form><div className="notice"><p><strong>安全なプレビュー</strong><br />ページは権限を制限したiframe内で実行されます。認証情報は送信しません。</p></div>
            </div>
            <div className="preview-panel"><div className="preview-toolbar"><div className="traffic-lights"><i /><i /><i /></div><div className="address-bar" id="address-bar"><span>プレビューの準備ができています</span></div><button className="icon-button" id="open-preview" type="button" disabled>↗</button><button className="icon-button" id="open-source" type="button" disabled>ソース</button></div>
              <div className="preview-stage"><div className="empty-state" id="empty-state"><div className="empty-visual">↶</div><h3>過去のページをここに表示</h3><p>URLとコミットSHAを入力すると、<br />ファイルを取得して再構成します。</p></div><div className="loading-state" id="loading-state" hidden><span className="loader" /><h3>ページを再構成しています</h3><p id="loading-message">リポジトリを解析中...</p></div><div className="error-state" id="error-state" hidden><span className="error-icon">!</span><h3>ページを表示できませんでした</h3><p id="error-message" /><button className="secondary-button" id="retry-button" type="button">もう一度試す</button></div><iframe id="preview-frame" title="指定したコミット時点のGitHub Pagesプレビュー" hidden /></div>
              <div className="preview-meta" id="preview-meta" hidden><div><span>Repository</span><strong id="repo-value">-</strong></div><div><span>Commit</span><strong id="sha-value">-</strong></div><div><span>Assets rewritten</span><strong id="assets-value">0</strong></div></div>
            </div>
          </section>
        </main><footer><p>過去のGitHub Pagesの履歴を見る</p><p>Static sites work best.</p></footer>
      </div><div className="toast" id="toast" hidden />
    </div>
  );
}

function LegacyMarkup({ html }) {
  const body =
    html
      .match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]
      ?.replace(/<script[\s\S]*?<\/script>/gi, "") || "";
  return <div dangerouslySetInnerHTML={{ __html: body }} />;
}
