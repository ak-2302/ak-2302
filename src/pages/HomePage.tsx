import { lazy, Suspense } from 'react'
import SiteHeader from '../components/SiteHeader'
import SignalMark from '../components/SignalMark'
import WorkCard from '../components/WorkCard'
import ContactForm from '../components/ContactForm'
import { profile } from '../data/profile'
import { works } from '../data/works'

const OrbitScene = lazy(() => import('../components/OrbitScene'))

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="hero page-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow js-intro"><span className="live-dot" /> Tokyo</p>
          <h1 id="hero-title" className="js-intro">ak-2302</h1>
          <div className="hero-actions js-intro">
            <a className="button button-dark" href="#works">作品を見る <span aria-hidden="true">↓</span></a>
            <a className="quiet-link" href="#profile">プロフィール <span aria-hidden="true">↘</span></a>
          </div>
        </div>
        <div className="hero-observation js-intro" aria-hidden="true">
          <div className="observation-caption"><span>FIELD NOTE</span><span>23° 41′</span></div>
          <SignalMark />
          <Suspense fallback={null}><OrbitScene /></Suspense>
          <div className="observation-readout"><span>signal</span><strong>good</strong></div>
          <span className="observation-line observation-line-a" />
          <span className="observation-line observation-line-b" />
          <span className="observation-dot observation-dot-a" />
          <span className="observation-dot observation-dot-b" />
        </div>
        <div className="hero-footer js-intro"><span>scroll to explore</span><span className="scroll-line" /></div>
      </section>

      <section id="profile" className="profile-section page-section js-reveal" aria-labelledby="profile-title">
        <div className="section-kicker">about / the person behind the screen</div>
        <div className="profile-grid">
          <h2 id="profile-title">こんにちは、<br /><span>ak-2302</span>です。</h2>
          <div className="profile-copy">
            <p className="large-copy">{profile.bio}</p>
            <p className="note-copy">「{profile.note}」</p>
            <div className="profile-links">
              {profile.links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span></a>)}
            </div>
          </div>
        </div>
      </section>

      <section id="works" className="works-section page-section" aria-labelledby="works-title">
        <div className="section-heading js-reveal">
          <div><div className="section-kicker">selected observations / 2023—2024</div><h2 id="works-title">つくったもの。</h2></div>
        </div>
        <div className="works-grid">{works.map((work, index) => <WorkCard key={work.slug} work={work} index={index} />)}</div>
      </section>

      <section id="contact" className="contact-section page-section js-reveal" aria-labelledby="contact-title">
        <div className="contact-intro"><div className="section-kicker">open channel / contact</div><h2 id="contact-title">お問い合わせ</h2><p>フォームまたはメールからご連絡ください。</p><a className="email-link" href="mailto:hello@example.com">hello@example.com <span aria-hidden="true">↗</span></a></div>
        <ContactForm />
      </section>

      <footer className="site-footer"><span>© 2024 ak-2302</span><a href="#hero">top ↑</a></footer>
    </main>
  )
}
