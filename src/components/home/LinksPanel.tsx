import { useCallback, useState, type MouseEvent } from 'react'
import { socialLinks, type SocialLink } from '../../data/home'
import ExternalLinkCurtain from './links/ExternalLinkCurtain'
import ServiceIcon from './links/ServiceIcon'

export default function LinksPanel() {
  const [transitionTarget, setTransitionTarget] = useState<SocialLink | null>(null)
  const clearTransition = useCallback(() => setTransitionTarget(null), [])

  const startTransition = (event: MouseEvent<HTMLAnchorElement>, target: SocialLink) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setTransitionTarget((current) => current ?? target)
  }

  return (
    <>
      <nav className="home-panel home-panel-links" aria-label="外部リンク">
        {socialLinks.map((target) => (
          <a href={target.href} rel="external" key={target.href} onClick={(event) => startTransition(event, target)}>
            <span className="home-service-name"><ServiceIcon label={target.label} />{target.label}</span>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
      {transitionTarget ? <ExternalLinkCurtain target={transitionTarget} onRestore={clearTransition} /> : null}
    </>
  )
}
