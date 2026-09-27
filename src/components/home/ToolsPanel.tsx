import { Link } from 'react-router-dom'
import { toolLinks } from '../../data/home'

export default function ToolsPanel() {
  return (
    <div className="home-panel home-panel-tools">
      <p className="home-panel-lead">手軽に使える道具をつくっています。</p>
      <div className="home-tool-links">
        {toolLinks.map(({ title, description, href }, index) => (
          <article className="home-tool-card" key={href}>
            <div className="home-tool-preview" aria-hidden="true">
              <iframe src={href} title={`${title}のプレビュー`} tabIndex={-1} loading="lazy" />
            </div>
            <Link className="home-tool-copy" to={href} aria-label={`${title}を開く`}>
              <span className="home-tool-number">0{index + 1}</span>
              <span className="home-tool-text">
                <strong>{title}</strong>
                <span>{description}</span>
              </span>
              <svg className="home-tool-arrow" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 12 12 4M6 4h6v6" />
              </svg>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
