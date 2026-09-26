import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ToolPageShellProps = {
  eyebrow: string
  title: ReactNode
  description: string
  children: ReactNode
}

export default function ToolPageShell({ eyebrow, title, description, children }: ToolPageShellProps) {
  return (
    <main>
      <article className="tool-page page-section">
        <div className="page-topline"><span>TOOLS / REACT</span><span>ak-2302</span></div>
        <header className="tool-page-header">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        <div className="tool-page-body">{children}</div>
        <Link className="quiet-link page-back-link" to="/">← ホームへ戻る</Link>
      </article>
    </main>
  )
}
