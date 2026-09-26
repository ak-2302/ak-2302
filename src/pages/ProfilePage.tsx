import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { profile } from '../data/profile'

export default function ProfilePage() {
  return (
    <main>
      <SiteHeader />
      <article className="simple-page page-section">
        <div className="page-topline"><span>ABOUT</span><span>{profile.name}</span></div>
        <header className="simple-page-header">
          <p className="eyebrow">profile</p>
          <h1>こんにちは、<br />{profile.name}です。</h1>
        </header>
        <div className="simple-page-grid">
          <p className="large-copy">{profile.bio}</p>
          <div>
            <p className="note-copy">「{profile.note}」</p>
            <div className="profile-links">
              {profile.links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span></a>)}
            </div>
          </div>
        </div>
        <Link className="quiet-link page-back-link" to="/">← ホームへ戻る</Link>
      </article>
    </main>
  )
}
