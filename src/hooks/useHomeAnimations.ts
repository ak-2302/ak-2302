import { useRef, type RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

gsap.registerPlugin(useGSAP)

const REVEAL_SELECTOR = [
  '.home-panel-lead',
  '.home-panel-links > a',
  '.home-server-grid > div',
  '.home-server-link',
  '.home-panel-contact .contact-form > *',
].join(', ')

type UseHomeAnimationsOptions = {
  activeIndex: number
  displayedIndex: number
  menuLength: number
  canvasRef: RefObject<HTMLElement | null>
  orbitRef: RefObject<HTMLDivElement | null>
  headingRef: RefObject<HTMLDivElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  onDisplayedIndexChange: (index: number) => void
}

export function useHomeAnimations({
  activeIndex,
  displayedIndex,
  menuLength,
  canvasRef,
  orbitRef,
  headingRef,
  contentRef,
  onDisplayedIndexChange,
}: UseHomeAnimationsOptions) {
  const rotationRef = useRef(0)
  const transitionRef = useRef<ReturnType<typeof gsap.timeline> | null>(null)

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const orbitStep = 360 / menuLength
    const targetRotation = activeIndex * -orbitStep
    const currentRotation = rotationRef.current
    const shortestDelta = ((targetRotation - currentRotation + 540) % 360) - 180
    const nextRotation = currentRotation + shortestDelta

    rotationRef.current = nextRotation
    gsap.to(orbitRef.current, {
      rotation: nextRotation,
      '--wheel-angle': `${nextRotation}deg`,
      duration: prefersReducedMotion ? 0 : 0.72,
      ease: 'power3.inOut',
      overwrite: 'auto',
    })
  }, { scope: canvasRef, dependencies: [activeIndex] })

  useGSAP((_, contextSafe) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const containers = [headingRef.current, contentRef.current]

    transitionRef.current?.kill()

    if (activeIndex !== displayedIndex) {
      const updateDisplayedItem = () => onDisplayedIndexChange(activeIndex)

      transitionRef.current = gsap.timeline({
        onComplete: contextSafe ? contextSafe(updateDisplayedItem) : updateDisplayedItem,
      }).to(containers, {
        autoAlpha: 0,
        y: prefersReducedMotion ? 0 : -10,
        duration: prefersReducedMotion ? 0 : 0.22,
        stagger: 0.035,
        ease: 'power2.in',
        overwrite: 'auto',
      })
      return
    }

    const headingTargets = headingRef.current
      ? Array.from(headingRef.current.querySelectorAll<HTMLElement>('.home-heading-meta, h1, .home-heading-line'))
      : []
    const contentTargets = contentRef.current
      ? Array.from(contentRef.current.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))
      : []
    const toolTargets = contentRef.current
      ? Array.from(contentRef.current.querySelectorAll<HTMLElement>('.home-tool-links > .home-tool-card'))
      : []
    const profileTargets = contentRef.current
      ? Array.from(contentRef.current.querySelectorAll<HTMLElement>([
          '.home-profile-icon',
          '.home-profile-identity',
          '.home-profile-details > div',
          '.home-panel-profile .profile-timeline > h2',
          '.home-panel-profile .profile-timeline li',
        ].join(', ')))
      : []
    const revealTargets = [...headingTargets, ...contentTargets]

    gsap.set(containers, { autoAlpha: 1, y: 0 })

    const timeline = gsap.timeline().fromTo(revealTargets, {
      autoAlpha: 0,
      y: prefersReducedMotion ? 0 : 16,
    }, {
      autoAlpha: 1,
      y: 0,
      duration: prefersReducedMotion ? 0 : 0.44,
      stagger: prefersReducedMotion ? 0 : 0.065,
      ease: 'power3.out',
      overwrite: 'auto',
    })

    if (toolTargets.length > 0) {
      timeline.fromTo(toolTargets, {
        autoAlpha: 0,
        x: prefersReducedMotion ? 0 : 28,
      }, {
        autoAlpha: 1,
        x: 0,
        duration: prefersReducedMotion ? 0 : 0.42,
        stagger: prefersReducedMotion ? 0 : 0.09,
        ease: 'power3.out',
        overwrite: 'auto',
      }, prefersReducedMotion ? '<' : '-=0.2')
    }

    if (profileTargets.length > 0) {
      timeline.fromTo(profileTargets, {
        autoAlpha: 0,
        y: prefersReducedMotion ? 0 : 18,
        scale: prefersReducedMotion ? 1 : 0.98,
      }, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: prefersReducedMotion ? 0 : 0.4,
        stagger: prefersReducedMotion ? 0 : 0.055,
        ease: 'power3.out',
        overwrite: 'auto',
      }, prefersReducedMotion ? '<' : '-=0.2')
    }

    transitionRef.current = timeline
  }, { scope: canvasRef, dependencies: [activeIndex, displayedIndex] })
}
