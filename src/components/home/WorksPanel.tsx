import { Link } from 'react-router-dom'
import { works } from '../../data/works'

export default function WorksPanel() {
  return (
    <nav className="home-panel home-works-list" aria-label="作品一覧">
      {works.map((work, index) => (
        <Link key={work.slug} to={`/works/${work.slug}`}>
          <span className="home-works-meta">{String(index + 1).padStart(2, '0')} / {work.year}</span>
          <span className="home-works-copy"><strong>{work.title}</strong><span>{work.summary}</span></span>
          <span aria-hidden="true">↗</span>
        </Link>
      ))}
    </nav>
  )
}
