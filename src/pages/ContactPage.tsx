import { Link } from 'react-router-dom'
import ContactForm from '../components/ContactForm'

export default function ContactPage() {
  return (
    <main>
      <article className="simple-page page-section">
        <div className="page-topline"><span>CONTACT</span><span>ak-2302</span></div>
        <header className="simple-page-header">
          <p className="eyebrow">open channel</p>
          <h1>お問い合わせ</h1>
          <p>フォームまたはメールからご連絡ください。</p>
          <a className="email-link" href="mailto:hello@example.com">hello@example.com <span aria-hidden="true">↗</span></a>
        </header>
        <div className="simple-contact-form"><ContactForm /></div>
        <Link className="quiet-link page-back-link" to="/">← ホームへ戻る</Link>
      </article>
    </main>
  )
}
