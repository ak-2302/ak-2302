import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { getWorkBySlug } from '../data/works'

export default function WorkPage() {
  const { slug } = useParams()
  const work = slug ? getWorkBySlug(slug) : undefined

  if (!work) return <NotFoundWork />

  return (
    <main>
      <SiteHeader />
      <article className={`work-detail work-detail-${work.accent}`}>
        <div className="work-detail-topline"><Link className="quiet-link" to="/">← すべての作品</Link><span>{work.year}</span></div>
        <header className="work-detail-header"><p className="eyebrow">selected observation / {work.thumbnail}</p><h1>{work.title}</h1><p>{work.summary}</p></header>
        <div className="detail-visual" aria-label={`${work.title} のビジュアルプレビュー`}><span>{work.thumbnail}</span><div className="detail-orbit detail-orbit-a" /><div className="detail-orbit detail-orbit-b" /><div className="detail-marker">signal / captured</div></div>
        <div className="work-detail-body"><div><div className="section-kicker">the note</div><p className="large-copy">{work.description}</p></div><aside><div className="section-kicker">built with</div><ul>{work.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul><div className="detail-actions">{work.demoUrl && <a className="button button-dark" href={work.demoUrl}>デモを見る ↗</a>}{work.sourceUrl && <a className="quiet-link" href={work.sourceUrl} target="_blank" rel="noreferrer">ソースコード ↗</a>}</div></aside></div>
      </article>
    </main>
  )
}

function NotFoundWork() {
  return <main><SiteHeader /><section className="not-found page-section"><p className="eyebrow">404 / no signal</p><h1>その観測結果は<br /><em>見つかりません。</em></h1><Link className="button button-dark" to="/">ホームへ戻る ↗</Link></section></main>
}
