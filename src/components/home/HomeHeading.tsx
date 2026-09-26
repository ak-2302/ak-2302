import type { RefObject } from 'react'
import type { HomeMenuItem } from '../../data/home'

type HomeHeadingProps = {
  item: HomeMenuItem
  index: number
  headingRef: RefObject<HTMLDivElement | null>
}

export default function HomeHeading({ item, index, headingRef }: HomeHeadingProps) {
  return (
    <div ref={headingRef} className={`home-content-heading home-heading-${item.color}`}>
      <p className="home-heading-meta">
        <span>0{index + 1}</span>
        <span>selected section</span>
      </p>
      <h1>
        <span>{item.label}</span>
        <span className="home-heading-slash" aria-hidden="true">/</span>
        <span className="home-heading-english" lang="en">{item.english}</span>
      </h1>
      <span className="home-heading-line" aria-hidden="true" />
    </div>
  )
}
