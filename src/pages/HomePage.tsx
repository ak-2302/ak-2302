import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ContactForm from '../components/ContactForm'
import SiteHeader from '../components/SiteHeader'

gsap.registerPlugin(useGSAP)

const menuItems = [
  { id: 'profile', label: 'プロフィール', english: 'plofile', color: 'blue' },
  { id: 'link', label: 'リンク', english: 'link', color: 'coral' },
  { id: 'tool', label: 'ツール', english: 'tool', color: 'green' },
  { id: 'contact', label: '連絡先', english: 'contact', color: 'yellow' },
] as const

const socialLinks = [
  ['GitHub', 'https://github.com/ak-2302'],
  ['Qiita', 'https://qiita.com/ak-2302'],
  ['Zenn', 'https://zenn.dev/ak2302'],
  ['X', 'https://x.com/ak_2302x'],
] as const

const toolLinks = [
  ['動画をまとめて変換する', 'https://にゃんこ.tech/tool/video_trans/'],
  ['過去のGitHub Pagesの履歴を見る', 'https://にゃんこ.tech/tool/github_pages_commits/'],
  ['画像と音声から動画をつくる', 'https://にゃんこ.tech/tool/image_audio_to_video/'],
] as const

const orbitStep = 360 / menuItems.length

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
  const [displayedIndex, setDisplayedIndex] = useState(0)
  const canvasRef = useRef<HTMLElement>(null)
  const orbitRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const rotationRef = useRef(0)
  const transitionRef = useRef<ReturnType<typeof gsap.timeline> | null>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const activeItem = menuItems[activeIndex]
  const displayedItem = menuItems[displayedIndex]

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
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

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targets = [headingRef.current, contentRef.current]

    transitionRef.current?.kill()

    if (activeIndex !== displayedIndex) {
      transitionRef.current = gsap.timeline({
        onComplete: () => setDisplayedIndex(activeIndex),
      }).to(targets, {
        autoAlpha: 0,
        y: prefersReducedMotion ? 0 : -10,
        duration: prefersReducedMotion ? 0 : 0.22,
        stagger: 0.035,
        ease: 'power2.in',
        overwrite: 'auto',
      })
      return
    }

    transitionRef.current = gsap.timeline().fromTo(targets, {
      autoAlpha: 0,
      y: prefersReducedMotion ? 0 : 12,
    }, {
      autoAlpha: 1,
      y: 0,
      duration: prefersReducedMotion ? 0 : 0.42,
      stagger: 0.055,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }, { scope: canvasRef, dependencies: [activeIndex, displayedIndex] })

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
              style={{ '--orbit-angle': `${index * orbitStep}deg`, '--label-angle': `${index * -orbitStep}deg` } as CSSProperties}
            >
              <span className="home-orb-content">
                <span className={`home-orb-disc home-orb-${item.color}`} aria-hidden="true" />
                <span className="home-orb-label">{item.english}</span>
              </span>
            </button>
          ))}
        </div>
        <span className="home-orbit-hint">select / rotate</span>
      </div>
      <div ref={headingRef} className={`home-content-heading home-heading-${displayedItem.color}`}>
        <p className="home-heading-meta">
          <span>0{displayedIndex + 1}</span>
          <span>selected section</span>
        </p>
        <h1>
          <span>{displayedItem.label}</span>
          <span className="home-heading-slash" aria-hidden="true">/</span>
          <span className="home-heading-english" lang="en">{displayedItem.english}</span>
        </h1>
        <span className="home-heading-line" aria-hidden="true" />
      </div>
      <div ref={contentRef} className="home-content-placeholder" aria-live="polite">
        <HomePanel item={displayedItem} />
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

function HomePanel({ item }: { item: (typeof menuItems)[number] }) {
  if (item.id === 'profile') {
    return (
      <div className="home-panel home-panel-profile">
        <p className="home-panel-lead">Webの技術を使って、日常で役立つものや面白い体験をつくっています。</p>
        <dl className="home-profile-grid">
          <div><dt>Name</dt><dd>ak-2302</dd></div>
          <div><dt>Location</dt><dd>Japan</dd></div>
          <div><dt>Focus</dt><dd>Web Development</dd></div>
        </dl>
        <p className="home-profile-note">食べ物は質より量。よく笑う人とはなかよくしておく。気温の変化には気を付ける。</p>
      </div>
    )
  }

  if (item.id === 'link') {
    return (
      <nav className="home-panel home-panel-links" aria-label="外部リンク">
        {socialLinks.map(([label, href]) => (
          <a href={href} target="_blank" rel="noreferrer" key={href}>
            <span>{label}</span><span aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
    )
  }

  if (item.id === 'tool') {
    return (
      <div className="home-panel home-panel-tools">
        <p className="home-panel-lead">手軽に使える道具をつくっています。</p>
        <div className="home-tool-links">
          {toolLinks.map(([label, href], index) => (
            <a href={href} target="_blank" rel="noreferrer" key={href}>
              <span>0{index + 1}</span><strong>{label}</strong><span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="home-panel home-panel-contact">
      <ContactForm />
    </div>
  )
}
