export default function ServerPanel() {
  return (
    <div className="home-panel home-panel-server">
      <p className="home-panel-lead">公開と通信を支える場所。</p>
      <dl className="home-profile-grid home-server-grid">
        <div><dt>Hosting</dt><dd>GitHub Pages</dd></div>
        <div><dt>Domain</dt><dd>にゃんこ.tech</dd></div>
        <div><dt>Contact API</dt><dd>Cloudflare Worker</dd></div>
      </dl>
      <a className="home-server-link" href="https://github.com/ak-2302/ak-2302" target="_blank" rel="noreferrer">
        <span>ソースコードを見る</span><span aria-hidden="true">↗</span>
      </a>
    </div>
  )
}
