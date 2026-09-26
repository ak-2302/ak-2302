import SiteHeader from '../components/SiteHeader'
import WorkCard from '../components/WorkCard'
import { works } from '../data/works'

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section id="hero" className="hero page-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow js-intro"><span className="live-dot" /> Tokyo</p>
          <h1 id="hero-title" className="js-intro">ak-2302</h1>
          <div className="hero-actions js-intro">
            <a className="button button-dark" href="#works">作品を見る <span aria-hidden="true">↓</span></a>
            <a className="quiet-link" href="/profile">プロフィール <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <section id="works" className="works-section page-section" aria-labelledby="works-title">
        <div className="section-heading js-reveal">
          <div><div className="section-kicker">selected observations / 2023—2024</div><h2 id="works-title">つくったもの。</h2></div>
        </div>
        <div className="works-grid">{works.map((work, index) => <WorkCard key={work.slug} work={work} index={index} />)}</div>
      </section>

      <footer className="site-footer"><span>© 2024 ak-2302</span><a href="#hero">top ↑</a></footer>
    </main>
  )
}
