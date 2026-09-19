import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'

export default function NotFoundPage() {
  return <main><SiteHeader /><section className="not-found page-section"><p className="eyebrow">404 / no signal</p><h1>ページが<br /><em>見つかりません。</em></h1><Link className="button button-dark" to="/">ホームへ戻る ↗</Link></section></main>
}
