import type { RefObject } from 'react'
import type { HomeMenuItem } from '../../data/home'

type HomeMenuTabsProps = {
  items: readonly HomeMenuItem[]
  activeIndex: number
  tabRefs: RefObject<Array<HTMLButtonElement | null>>
  onSelect: (index: number) => void
}

export default function HomeMenuTabs({ items, activeIndex, tabRefs, onSelect }: HomeMenuTabsProps) {
  const selectAdjacentMenu = (currentIndex: number, direction: 1 | -1) => {
    const nextIndex = (currentIndex + direction + items.length) % items.length
    onSelect(nextIndex)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="home-menu-tabs" role="tablist" aria-label="メインメニュー">
      {items.map((item, index) => (
        <button
          key={item.english}
          type="button"
          role="tab"
          ref={(node) => { tabRefs.current[index] = node }}
          aria-selected={activeIndex === index}
          tabIndex={activeIndex === index ? 0 : -1}
          className={activeIndex === index ? 'is-active' : ''}
          onClick={() => onSelect(index)}
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
  )
}
