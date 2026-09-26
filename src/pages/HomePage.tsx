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
  const activeItem = menuItems[activeIndex]

  useGSAP(() => {
    gsap.fromTo(orbitRef.current, { rotation: 0 }, { rotation: activeIndex * 120, duration: 0.8, ease: 'power3.out' })
    gsap.fromTo(contentRef.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power2.out' })
  }, { scope: canvasRef, dependencies: [activeIndex], revertOnUpdate: true })

  const selectMenu = (index: number) => setActiveIndex(index)

  return (
    <section ref={canvasRef} className="home-canvas" aria-label="プロフィール">
      <div className="home-orbit-menu">
        <div ref={orbitRef} className="home-orbit-wheel">
          {menuItems.map((item, index) => (
            <button
              key={item.english}
              className={`home-orb home-orb-${item.color} ${activeIndex === index ? 'is-active' : ''}`}
              type="button"
              aria-label={`${item.label}を表示`}
              aria-pressed={activeIndex === index}
              onClick={() => selectMenu(index)}
              style={{ '--orbit-angle': `${index * 120}deg`, '--label-angle': `${index * -120}deg` } as CSSProperties}
            >
              <span className="home-orb-label">{item.label}</span>
            </button>
          ))}
        </div>
        <span className="home-orbit-hint">select / rotate</span>
      </div>
      <div className="home-content-heading">
        <h1>{activeItem.label} / {activeItem.english}</h1>
        <span className="home-heading-line" aria-hidden="true" />
      </div>
      <div ref={contentRef} className="home-content-placeholder">
        <p>{activeItem.copy}</p>
      </div>
      <div className="home-menu-tabs" role="tablist" aria-label="メインメニュー">
        {menuItems.map((item, index) => (
          <button key={item.english} type="button" role="tab" aria-selected={activeIndex === index} className={activeIndex === index ? 'is-active' : ''} onClick={() => selectMenu(index)}>
            0{index + 1} / {item.english}
          </button>
        ))}
      </div>
    </section>
  )
}
