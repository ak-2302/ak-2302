import SiteHeader from '../components/SiteHeader'

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="home-canvas" aria-label="プロフィール">
        <div className="home-orb home-orb-blue" aria-hidden="true" />
        <div className="home-orb home-orb-coral" aria-hidden="true" />
        <div className="home-orb home-orb-yellow" aria-hidden="true" />
        <div className="home-content-heading">
          <h1>プロフィール / profile</h1>
          <span className="home-heading-line" aria-hidden="true" />
        </div>
        <div className="home-content-placeholder">
          <p>コンテンツ</p>
        </div>
      </section>
    </main>
  )
}
