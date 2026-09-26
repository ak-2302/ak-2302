import { Link } from 'react-router-dom'
import { toolLinks } from '../../data/home'

export default function ToolsPanel() {
  return (
    <div className="home-panel home-panel-tools">
      <p className="home-panel-lead">手軽に使える道具をつくっています。</p>
      <div className="home-tool-links">
        {toolLinks.map(([label, href], index) => (
          <Link to={href} key={href}>
            <span>0{index + 1}</span><strong>{label}</strong><span aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
