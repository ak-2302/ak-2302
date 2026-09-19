import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import HomePage from '../pages/HomePage'
import WorkPage from '../pages/WorkPage'
import NotFoundPage from '../pages/NotFoundPage'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function MotionShell({ children }: { children: ReactNode }) {
  const shell = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useGSAP(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
    intro.fromTo('.js-intro', { autoAlpha: 0, y: reduced ? 0 : 18 }, { autoAlpha: 1, y: 0, duration: reduced ? 0.2 : 0.7, stagger: reduced ? 0 : 0.06 })
    if (!reduced) {
      gsap.utils.toArray<HTMLElement>('.js-reveal').forEach((element) => {
        gsap.fromTo(element, { autoAlpha: 0, y: 32 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 84%', once: true },
        })
      })
    }
  }, { scope: shell, dependencies: [location.pathname], revertOnUpdate: true })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return <div ref={shell}>{children}</div>
}

export default function App() {
  return (
    <MotionShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/works/:slug" element={<WorkPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MotionShell>
  )
}
