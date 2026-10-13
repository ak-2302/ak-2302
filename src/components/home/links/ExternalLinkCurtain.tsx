import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { SocialLink } from '../../../data/home'
import CurtainServiceLogo from './CurtainServiceLogo'

gsap.registerPlugin(useGSAP)

const curtainRows = Array.from({ length: 6 }, (_, index) => index)

type ExternalLinkCurtainProps = {
  target: SocialLink
  onRestore: () => void
}

export default function ExternalLinkCurtain({ target, onRestore }: ExternalLinkCurtainProps) {
  const curtainRef = useRef<HTMLDivElement>(null)
  const hasLeftPageRef = useRef(false)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const curtainColor = prefersDark ? target.darkColor : target.lightColor
  const logoColor = prefersDark ? target.darkForeground : target.lightForeground

  useEffect(() => {
    const markPageAsLeft = () => {
      hasLeftPageRef.current = true
    }
    const restoreCurtain = () => {
      if (!hasLeftPageRef.current) return
      hasLeftPageRef.current = false
      onRestore()
    }
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) hasLeftPageRef.current = true
      restoreCurtain()
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') markPageAsLeft()
      else restoreCurtain()
    }

    window.addEventListener('pagehide', markPageAsLeft)
    window.addEventListener('pageshow', handlePageShow)
    window.addEventListener('blur', markPageAsLeft)
    window.addEventListener('focus', restoreCurtain)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('pagehide', markPageAsLeft)
      window.removeEventListener('pageshow', handlePageShow)
      window.removeEventListener('blur', markPageAsLeft)
      window.removeEventListener('focus', restoreCurtain)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [onRestore])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  useGSAP(() => {
    if (!curtainRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rows = curtainRef.current.querySelectorAll<HTMLElement>('.external-link-curtain-row')
    const logo = curtainRef.current.querySelector<HTMLElement>('.external-link-curtain-logo')
    const timeline = gsap.timeline({
      onComplete: () => window.location.assign(target.href),
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
  }, { dependencies: [target.href] })

  return createPortal(
    <div ref={curtainRef} className="external-link-curtain" role="status" aria-label={`${target.label}へ移動します`}>
      <div className="external-link-curtain-rows" aria-hidden="true">
        {curtainRows.map((row) => (
          <span className="external-link-curtain-row" style={{ backgroundColor: curtainColor }} key={row} />
        ))}
      </div>
      <div className="external-link-curtain-logo" style={{ color: logoColor }} aria-hidden="true">
        <CurtainServiceLogo label={target.label} />
      </div>
    </div>,
    document.body,
  )
}
