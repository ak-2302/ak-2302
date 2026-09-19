import { Link } from 'react-router-dom'
import { profile } from '../data/profile'

export default function SiteHeader() {
  return (
    <header className="site-header js-intro">
      <Link className="brand-mark" to="/" aria-label="ak-2302 ホーム">
        <span className="brand-dot" aria-hidden="true" />
        <span>{profile.name}</span>
      </Link>
      <nav aria-label="メインナビゲーション">
        <a href="/#works">作品</a>
        <a href="/#profile">プロフィール</a>
        <a className="nav-contact" href="/#contact">話す <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  )
}
