import { Link } from 'react-router-dom'
import { profile } from '../data/profile'

export default function SiteHeader() {
  return (
    <header className="site-header js-intro">
      <Link className="brand-mark" to="/" aria-label="ak-2302 ホーム">
        <span className="brand-dot" aria-hidden="true" />
        <span>{profile.name}</span>
      </Link>
    </header>
  )
}
