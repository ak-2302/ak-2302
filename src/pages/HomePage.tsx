import { useRef, useState } from 'react'
import HomeHeading from '../components/home/HomeHeading'
import HomeMenuTabs from '../components/home/HomeMenuTabs'
import HomePanel from '../components/home/HomePanel'
import OrbitMenu from '../components/home/OrbitMenu'
import { menuItems } from '../data/home'
import { useHomeAnimations } from '../hooks/useHomeAnimations'

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [displayedIndex, setDisplayedIndex] = useState(0)
  const canvasRef = useRef<HTMLElement>(null)
  const orbitRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const activeItem = menuItems[activeIndex]
  const displayedItem = menuItems[displayedIndex]

  useHomeAnimations({
    activeIndex,
    displayedIndex,
    menuLength: menuItems.length,
    canvasRef,
    orbitRef,
    headingRef,
    contentRef,
    onDisplayedIndexChange: setDisplayedIndex,
  })

  return (
    <main>
      <section ref={canvasRef} className="home-canvas" aria-label={activeItem.label}>
        <OrbitMenu activeIndex={activeIndex} orbitRef={orbitRef} onSelect={setActiveIndex} />
        <HomeHeading item={displayedItem} index={displayedIndex} headingRef={headingRef} />
        <div ref={contentRef} className="home-content-placeholder" aria-live="polite">
          <HomePanel item={displayedItem} />
        </div>
        <HomeMenuTabs
          items={menuItems}
          activeIndex={activeIndex}
          tabRefs={tabRefs}
          onSelect={setActiveIndex}
        />
      </section>
    </main>
  )
}
