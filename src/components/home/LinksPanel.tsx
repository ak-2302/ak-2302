import { socialLinks } from '../../data/home'

export default function LinksPanel() {
  return (
    <nav className="home-panel home-panel-links" aria-label="外部リンク">
      {socialLinks.map(([label, href]) => (
        <a href={href} target="_blank" rel="noreferrer" key={href}>
          <span>{label}</span><span aria-hidden="true">↗</span>
        </a>
      ))}
    </nav>
  )
}
