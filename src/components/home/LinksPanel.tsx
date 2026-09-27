import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { socialLinks } from '../../data/home'

gsap.registerPlugin(useGSAP)

type SocialLink = (typeof socialLinks)[number]
const curtainRows = Array.from({ length: 6 }, (_, index) => index)

function ServiceIcon({ label }: { label: string }) {
  if (label === 'GitHub') return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5a9.5 9.5 0 0 0-3 18.51c.48.09.65-.21.65-.46v-1.67c-2.66.58-3.22-1.13-3.22-1.13-.44-1.1-1.06-1.4-1.06-1.4-.87-.6.07-.59.07-.59.96.07 1.47.99 1.47.99.86 1.47 2.26 1.05 2.82.8.09-.62.34-1.05.61-1.29-2.12-.24-4.35-1.06-4.35-4.72 0-1.04.37-1.88.98-2.54-.1-.24-.43-1.2.09-2.5 0 0 .8-.26 2.62.97A9.1 9.1 0 0 1 12 7.16c.81 0 1.62.11 2.38.32 1.82-1.23 2.62-.97 2.62-.97.52 1.3.19 2.26.09 2.5.61.66.98 1.5.98 2.54 0 3.67-2.23 4.48-4.36 4.72.35.3.65.88.65 1.78v2.64c0 .25.17.55.66.46A9.5 9.5 0 0 0 12 2.5Z" /></svg>
  if (label === 'Qiita') return <svg className="home-service-brand home-service-qiita" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.3726 0 0 5.3726 0 12s5.3726 12 12 12c3.3984 0 6.4665-1.413 8.6498-3.6832-.383-.0574-.7746-.2062-1.1466-.4542-.7145-.4763-1.3486-.9263-1.6817-1.674-1.2945 1.3807-3.0532 1.835-5.1822 2.0503-4.311.4359-8.0456-1.4893-8.4979-6.2996-.1922-2.045.2628-3.989 1.1804-5.582l-.5342-2.1009c-.0862-.3652.2498-.7126.6057-.6262l1.8456.448c1.0974-.9012 2.4249-1.49 3.8892-1.638 1.2526-.1267 2.467.0834 3.571.5624l1.7348-1.0494c.3265-.1974.7399.0257.7711.4164l.1 2.4747v.0002c1.334 1.4084 2.2424 3.3319 2.4478 5.516.116 1.2339-.012 2.1776-.339 3.078-.1531.4215-.1992.7778.0776 1.1305.2674.3408.6915 1.0026 1.1644.8917.7107-.1666 1.4718-.1223 1.9422.1715C23.4925 15.9525 24 14.0358 24 12c0-6.6274-5.3726-12-12-12Z" /></svg>
  if (label === 'Zenn') return <svg className="home-service-brand home-service-zenn" viewBox="0 0 24 24" aria-hidden="true"><path d="M.264 23.771h4.984c.264 0 .498-.147.645-.352L19.614.874c.176-.293-.029-.645-.381-.645h-4.72c-.235 0-.44.117-.557.323L.03 23.361c-.088.176.029.41.234.41zM17.445 23.419l6.479-10.408c.205-.323-.029-.733-.41-.733h-4.691c-.176 0-.352.088-.44.235l-6.655 10.643c-.176.264.029.616.352.616h4.779c.234-.001.468-.118.586-.353z" /></svg>
  return <span className="home-service-letter home-service-x" aria-hidden="true">𝕏</span>
}

function CurtainServiceLogo({ label }: { label: string }) {
  if (label === 'Qiita') {
    return (
      <svg className="external-link-curtain-official-logo external-link-curtain-official-logo-qiita" viewBox="0 0 426.57 130" aria-hidden="true">
        <circle cx="167.08" cy="21.4" r="12.28" />
        <path d="M250.81 29.66h23.48v18.9h-23.48zM300.76 105.26a22.23 22.23 0 01-6.26-.86 12.68 12.68 0 01-5.17-3 14.41 14.41 0 01-3.56-5.76 28 28 0 01-1.3-9.22V48.56h29.61v-18.9h-29.52V3.29h-20.17v83.34q0 11.16 2.83 18.27a27.71 27.71 0 007.7 11.2 26.86 26.86 0 0011.43 5.62 47.56 47.56 0 0012.34 1.53h15.16v-18zM0 61.7a58.6 58.6 0 015-24.21A62.26 62.26 0 0118.73 17.9 63.72 63.72 0 0139 4.78 64.93 64.93 0 0164 0a65 65 0 0124.85 4.78 64.24 64.24 0 0120.38 13.12A62 62 0 01123 37.49a58.6 58.6 0 015 24.21 58.34 58.34 0 01-4 21.46 62.8 62.8 0 01-10.91 18.16l11.1 11.1a10.3 10.3 0 010 14.52 10.29 10.29 0 01-14.64 0l-12.22-12.41a65 65 0 01-15.78 6.65 66.32 66.32 0 01-17.55 2.3 64.63 64.63 0 01-45.23-18A62.82 62.82 0 015 85.81 58.3 58.3 0 010 61.7zm21.64.08a43.13 43.13 0 0012.42 30.63 42.23 42.23 0 0013.43 9.09A41.31 41.31 0 0064 104.8a42 42 0 0030-12.39 42.37 42.37 0 009-13.64 43.43 43.43 0 003.3-17 43.77 43.77 0 00-3.3-17A41.7 41.7 0 0080.55 22 41.78 41.78 0 0064 18.68 41.31 41.31 0 0047.49 22a42.37 42.37 0 00-13.43 9.08 43.37 43.37 0 00-12.42 30.7zM331.89 78a47.59 47.59 0 013.3-17.73 43.22 43.22 0 019.34-14.47A44.25 44.25 0 01359 36a47.82 47.82 0 0118.81-3.58 42.72 42.72 0 019.26 1 46.5 46.5 0 018.22 2.58 40 40 0 017 3.84 44.39 44.39 0 015.71 4.63l1.22-9.47h17.35v85.83h-17.35l-1.17-9.42a42.54 42.54 0 01-5.84 4.67 43.11 43.11 0 01-7 3.79 44.86 44.86 0 01-8.17 2.59 43 43 0 01-9.22 1A47.94 47.94 0 01359 119.9a43.3 43.3 0 01-14.47-9.71 44.17 44.17 0 01-9.34-14.47 47 47 0 01-3.3-17.72zm20.27-.08a29.16 29.16 0 002.17 11.34 27 27 0 005.92 8.88 26.69 26.69 0 008.76 5.76 29.19 29.19 0 0021.44 0 26.11 26.11 0 008.72-5.76 27.57 27.57 0 005.88-8.84 29 29 0 002.16-11.38 28.62 28.62 0 00-2.16-11.22 26.57 26.57 0 00-5.93-8.8 27.68 27.68 0 00-19.51-7.9 28.29 28.29 0 00-10.77 2.05 26.19 26.19 0 00-8.71 5.75 27.08 27.08 0 00-5.84 8.8 28.94 28.94 0 00-2.13 11.31zm-194.97-30.5h19.78v73.54h-19.78zm49.25 0h19.78v73.54h-19.78z" />
        <circle cx="216.33" cy="21.4" r="12.28" />
      </svg>
    )
  }

  if (label === 'Zenn') {
    return (
      <span className="external-link-curtain-zenn-surface">
        <svg className="external-link-curtain-official-logo external-link-curtain-official-logo-zenn" viewBox="0 0 377.4 88.3" aria-hidden="true">
          <g className="external-link-curtain-zenn-wordmark">
            <path d="M233 56.8h-39c.5 3.5 2.2 6.8 4.8 9.2 2.7 2.3 6.2 3.5 9.8 3.4 2.8 0 5.6-.5 8.2-1.7 2.5-1.1 4.8-2.8 6.5-5l8.2 9.5c-2.5 3.4-5.7 6.1-9.5 7.9-4.6 2.2-9.6 3.3-14.7 3.2-5.7.1-11.4-1.2-16.5-4-4.5-2.5-8.2-6.3-10.7-10.9s-3.8-9.8-3.7-15.1v-2.2c-.1-5.7 1.1-11.3 3.5-16.5 2.2-4.7 5.7-8.6 10.1-11.3 4.7-2.8 10.1-4.2 15.5-4.1 5.2-.1 10.3 1.1 14.9 3.7 4.1 2.5 7.4 6.2 9.4 10.5 2.2 5.1 3.3 10.5 3.2 16.1V56.8zM216.1 43.9c.1-2.9-.9-5.7-2.8-7.9-1.8-1.9-4.4-2.9-7.9-2.9-2.9-.1-5.8 1.1-7.7 3.2-2 2.6-3.3 5.7-3.6 9h22V43.9zM128.3 67.9h36.1v14.7h-56.9V72l35.8-54.3h-36.2V2.9h56.6v10.4L128.3 67.9zM248.8 50.7c0-19.1 12.7-29.2 28.2-29.2s27.9 10.1 27.9 29.2V82h-16V51.4c0-10.6-4.8-16.1-12-16.1s-12.4 5.5-12.4 16.1v30.7h-15.8L248.8 50.7 248.8 50.7zM320.3 50.7c0-19.1 12.7-29.2 28.2-29.2s27.9 10.1 27.9 29.2V82h-16V51.4c0-10.6-4.8-16.1-12-16.1S336 40.8 336 51.4v30.7h-15.8L320.3 50.7 320.3 50.7z" />
          </g>
          <path fill="#3EA8FF" d="M2.4 83.3h17c.9 0 1.7-.5 2.2-1.2L68.4 5.2C69 4.2 68.3 3 67.1 3H51c-.8 0-1.5.4-1.9 1.1L1.6 81.9C1.3 82.5 1.7 83.3 2.4 83.3zM61 82.1l22.1-35.5c.7-1.1-.1-2.5-1.4-2.5H65.7c-.6 0-1.2.3-1.5.8L41.5 81.2c-.6.9.1 2.1 1.2 2.1h16.3C59.8 83.3 60.6 82.9 61 82.1z" />
        </svg>
      </span>
    )
  }

  return (
    <div className={`external-link-curtain-lockup external-link-curtain-lockup-${label.toLowerCase()}`}>
      <ServiceIcon label={label} />
      {label !== 'X' ? <span className="external-link-curtain-wordmark">{label}</span> : null}
    </div>
  )
}

export default function LinksPanel() {
  const [transitionTarget, setTransitionTarget] = useState<SocialLink | null>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const prefersDark = transitionTarget
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
  const curtainColor = transitionTarget
    ? prefersDark ? transitionTarget.darkColor : transitionTarget.lightColor
    : 'transparent'
  const logoColor = transitionTarget
    ? prefersDark ? transitionTarget.darkForeground : transitionTarget.lightForeground
    : 'transparent'

  useEffect(() => {
    const clearRestoredTransition = (event: PageTransitionEvent) => {
      if (event.persisted) setTransitionTarget(null)
    }

    window.addEventListener('pageshow', clearRestoredTransition)
    return () => window.removeEventListener('pageshow', clearRestoredTransition)
  }, [])

  useEffect(() => {
    if (!transitionTarget) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [transitionTarget])

  useGSAP(() => {
    if (!transitionTarget || !curtainRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rows = curtainRef.current.querySelectorAll<HTMLElement>('.external-link-curtain-row')
    const logo = curtainRef.current.querySelector<HTMLElement>('.external-link-curtain-logo')

    const timeline = gsap.timeline({
      onComplete: () => window.location.assign(transitionTarget.href),
    }).fromTo(rows, {
      scaleX: 0,
    }, {
      scaleX: 1,
      duration: reduced ? 0.12 : 0.46,
      stagger: reduced ? 0 : 0.055,
      ease: reduced ? 'none' : 'power4.inOut',
      overwrite: true,
    })

    if (logo) {
      timeline.fromTo(logo, {
        autoAlpha: 0,
        scale: reduced ? 1 : 0.82,
      }, {
        autoAlpha: 1,
        scale: 1,
        duration: reduced ? 0.08 : 0.28,
        ease: reduced ? 'none' : 'back.out(1.7)',
      }).to(logo, {
        autoAlpha: 1,
        duration: reduced ? 0.08 : 0.32,
      })
    }
  }, { dependencies: [transitionTarget] })

  const startTransition = (event: MouseEvent<HTMLAnchorElement>, target: SocialLink) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (!transitionTarget) setTransitionTarget(target)
  }

  return (
    <>
      <nav className="home-panel home-panel-links" aria-label="外部リンク">
        {socialLinks.map((target) => (
          <a href={target.href} rel="external" key={target.href} onClick={(event) => startTransition(event, target)}>
            <span className="home-service-name"><ServiceIcon label={target.label} />{target.label}</span><span aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
      {transitionTarget ? createPortal(
        <div
          ref={curtainRef}
          className="external-link-curtain"
          role="status"
          aria-label={`${transitionTarget.label}へ移動します`}
        >
          <div className="external-link-curtain-rows" aria-hidden="true">
            {curtainRows.map((row) => (
              <span
                className="external-link-curtain-row"
                style={{ backgroundColor: curtainColor }}
                key={row}
              />
            ))}
          </div>
          <div className="external-link-curtain-logo" style={{ color: logoColor }} aria-hidden="true">
            <CurtainServiceLogo label={transitionTarget.label} />
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  )
}
