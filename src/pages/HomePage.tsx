import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import SiteHeader from '../components/SiteHeader'

gsap.registerPlugin(useGSAP)

const menuItems = [
  { label: 'プロフィール', english: 'profile', color: 'blue', copy: 'プロフィールのこと。' },
  { label: '作品', english: 'works', color: 'coral', copy: 'つくったもの。' },
  { label: '連絡先', english: 'contact', color: 'yellow', copy: '話しかける。' },
]

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <InteractiveHome />
    </main>
  )
}

function InteractiveHome() {
  const [activeIndex, setActiveIndex] = useState(0)
  const canvasRef = useRef<HTMLElement>(null)
  const orbitRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const rotationRef = useRef(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const activeItem = menuItems[activeIndex]

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targetRotation = activeIndex * -120
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
    gsap.fromTo(contentRef.current, { autoAlpha: 0, y: prefersReducedMotion ? 0 : 10 }, {
      autoAlpha: 1,
      y: 0,
      duration: prefersReducedMotion ? 0 : 0.34,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }, { scope: canvasRef, dependencies: [activeIndex] })

  const selectMenu = (index: number) => setActiveIndex(index)

  const selectAdjacentMenu = (currentIndex: number, direction: 1 | -1) => {
    const nextIndex = (currentIndex + direction + menuItems.length) % menuItems.length
    setActiveIndex(nextIndex)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section ref={canvasRef} className="home-canvas" aria-label={activeItem.label}>
      <div className="home-orbit-menu">
        <div ref={orbitRef} className="home-orbit-wheel" style={{ '--wheel-angle': '0deg' } as CSSProperties}>
          {menuItems.map((item, index) => (
            <button
              key={item.english}
              className={`home-orb ${activeIndex === index ? 'is-active' : ''}`}
              type="button"
              aria-label={`${item.label}を表示`}
              aria-pressed={activeIndex === index}
              onClick={() => selectMenu(index)}
              style={{ '--orbit-angle': `${index * 120}deg`, '--label-angle': `${index * -120}deg` } as CSSProperties}
            >
              <span className="home-orb-content">
                <span className={`home-orb-disc home-orb-${item.color}`} aria-hidden="true" />
                <span className="home-orb-label">{item.label}</span>
              </span>
            </button>
          ))}
        </div>
        <span className="home-orbit-hint">select / rotate</span>
      </div>
      <div className="home-content-heading">
        <h1>{activeItem.label} / {activeItem.english}</h1>
        <span className="home-heading-line" aria-hidden="true" />
      </div>
      <div ref={contentRef} className="home-content-placeholder" aria-live="polite">
        <p>{activeItem.copy}</p>
      </div>
      <div className="home-menu-tabs" role="tablist" aria-label="メインメニュー">
        {menuItems.map((item, index) => (
          <button
            key={item.english}
            type="button"
            role="tab"
            ref={(node) => { tabRefs.current[index] = node }}
            aria-selected={activeIndex === index}
            tabIndex={activeIndex === index ? 0 : -1}
            className={activeIndex === index ? 'is-active' : ''}
            onClick={() => selectMenu(index)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                event.preventDefault()
                selectAdjacentMenu(index, 1)
              }
              if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                event.preventDefault()
                selectAdjacentMenu(index, -1)
              }
            }}
          >
            0{index + 1} / {item.english}
          </button>
        ))}
      </div>
    </section>
  )
}
