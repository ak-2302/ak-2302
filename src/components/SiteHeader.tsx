import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { profile } from '../data/profile'

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.classList.add('drawer-open')
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.classList.remove('drawer-open')
    }
  }, [isOpen])

  return (
    <>
    <header className="site-header js-intro">
      <Link className="brand-mark" to="/" aria-label="ak-2302 ホーム">
        <span className="brand-dot" aria-hidden="true" />
        <span>{profile.name}</span>
      </Link>
      <button className={`drawer-toggle ${isOpen ? 'is-open' : ''}`} type="button" aria-expanded={isOpen} aria-controls="site-drawer" onClick={() => setIsOpen((open) => !open)}>
        <span className="drawer-toggle-label">{isOpen ? 'close' : 'index'}</span>
        <span className="drawer-toggle-icon" aria-hidden="true"><i /><i /></span>
      </button>
    </header>
    <div className={`drawer-backdrop ${isOpen ? 'is-visible' : ''}`} aria-hidden="true" onClick={() => setIsOpen(false)} />
    <aside id="site-drawer" className={`site-drawer ${isOpen ? 'is-open' : ''}`} aria-label="サイト内インデックス" aria-hidden={!isOpen}>
      <div className="drawer-heading"><span>INDEX / 2026</span><span>6 entries</span></div>
      <p className="drawer-intro">気になる入口を<br /><em>ひとつ、どうぞ。</em></p>
      <nav className="drawer-links" aria-label="サイト内リンク">
        <a href="/#hero" onClick={() => setIsOpen(false)}><span className="drawer-number">01</span><span>ホーム / signal</span><span aria-hidden="true">↗</span></a>
        <a href="/#profile" onClick={() => setIsOpen(false)}><span className="drawer-number">02</span><span>プロフィール / person</span><span aria-hidden="true">↗</span></a>
        <a href="/#works" onClick={() => setIsOpen(false)}><span className="drawer-number">03</span><span>作品 / observations</span><span aria-hidden="true">↗</span></a>
        <a href="/#experiments" onClick={() => setIsOpen(false)}><span className="drawer-number">04</span><span>実験 / in progress</span><span aria-hidden="true">↗</span></a>
        <a href="/#contact" onClick={() => setIsOpen(false)}><span className="drawer-number">05</span><span>連絡先 / open channel</span><span aria-hidden="true">↗</span></a>
      </nav>
      <div className="drawer-footer"><span>drag, scroll, explore</span><span className="drawer-pulse" aria-hidden="true" /></div>
    </aside>
    </>
  )
}
