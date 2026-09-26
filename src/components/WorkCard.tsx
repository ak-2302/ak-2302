import { Link } from 'react-router-dom'
import type { Work } from '../types'

export default function WorkCard({ work, index }: { work: Work; index: number }) {
  return (
    <article className={`work-card work-card-${work.accent} js-reveal`}>
      <Link to={`/works/${work.slug}`} className="work-card-link">
        <div className="work-card-topline">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>{work.year}</span>
        </div>
        <div className="work-visual" aria-hidden="true">
          <span className="visual-label">{work.thumbnail}</span>
          <span className="visual-shape visual-shape-one" />
          <span className="visual-shape visual-shape-two" />
          <span className="visual-shape visual-shape-three" />
        </div>
        <div className="work-card-copy">
          <h3>{work.title}</h3>
          <p>{work.summary}</p>
          <span className="text-link">詳細を見る <span aria-hidden="true">↗</span></span>
        </div>
      </Link>
    </article>
  )
}
