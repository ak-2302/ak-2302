import type { CSSProperties, RefObject } from 'react'
import { menuItems as defaultMenuItems, orbitStep, type HomeMenuItem } from '../../data/home'

type OrbitMenuProps = {
  items?: readonly HomeMenuItem[]
  activeIndex: number
  orbitRef: RefObject<HTMLDivElement | null>
  onSelect: (index: number) => void
}

export default function OrbitMenu({
  items = defaultMenuItems,
  activeIndex,
  orbitRef,
  onSelect,
}: OrbitMenuProps) {
  return (
    <div className="home-orbit-menu">
      <div ref={orbitRef} className="home-orbit-wheel" style={{ '--wheel-angle': '0deg' } as CSSProperties}>
        {items.map((item, index) => (
          <button
            key={item.english}
            className={`home-orb ${activeIndex === index ? 'is-active' : ''}`}
            type="button"
            aria-label={`${item.label}を表示`}
            aria-pressed={activeIndex === index}
            onClick={() => onSelect(index)}
            style={{ '--orbit-angle': `${index * orbitStep}deg`, '--label-angle': `${index * -orbitStep}deg` } as CSSProperties}
          >
            <span className="home-orb-content">
              <span className={`home-orb-disc home-orb-${item.color}`}>
                <span className="home-orb-label">{item.english}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
      <span className="home-orbit-hint">select / rotate</span>
    </div>
  )
}
