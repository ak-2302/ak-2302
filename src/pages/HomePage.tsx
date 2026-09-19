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
          <p className="eyebrow js-intro"><span className="live-dot" /> 小さな実験室 / Tokyo</p>
          <h1 id="hero-title" className="js-intro">役に立つものと、<em>少し変なもの</em>をつくる。</h1>
          <p className="hero-lede js-intro">{profile.shortBio} Webサイト、ツール、画面の中の小さな発見。</p>
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
          <p>使う人の手元で、ちゃんと役に立つ。<br />そのうえで、もう一度触りたくなる。</p>
        </div>
        <div className="works-grid">{works.map((work, index) => <WorkCard key={work.slug} work={work} index={index} />)}</div>
      </section>

      <section id="experiments" className="experiment-section page-section js-reveal" aria-labelledby="experiment-title">
        <div className="experiment-aside"><span>EXPERIMENT 00</span><span>still in progress</span></div>
        <div className="experiment-content"><h2 id="experiment-title">完成していないものにも、<br /><em>居場所</em>をつくる。</h2><p>試して、壊して、また試す。実験室では、うまくいかなかったことも次のアイデアの材料になります。</p><a className="quiet-link quiet-link-light" href="#contact">一緒につくる <span aria-hidden="true">↗</span></a></div>
        <div className="experiment-orbit" aria-hidden="true"><div /><div /><div /></div>
      </section>

      <section id="contact" className="contact-section page-section js-reveal" aria-labelledby="contact-title">
        <div className="contact-intro"><div className="section-kicker">open channel / contact</div><h2 id="contact-title">なにか、<br /><em>つくりましょう。</em></h2><p>小さな相談でも大丈夫です。つくりたいもの、困っていること、面白そうなことを教えてください。</p><a className="email-link" href="mailto:hello@example.com">hello@example.com <span aria-hidden="true">↗</span></a></div>
        <ContactForm />
      </section>

      <footer className="site-footer"><span>© 2024 ak-2302</span><span>made with curiosity <span aria-hidden="true">✳</span></span><a href="#hero">top ↑</a></footer>
    </main>
  )
}
