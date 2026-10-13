import { Link } from 'react-router-dom'
import ProfileOverview from '../components/profile/ProfileOverview'

export default function ProfilePage() {
  return (
    <main>
      <article className="simple-page page-section">
        <ProfileOverview variant="page" />
        <Link className="quiet-link page-back-link" to="/">← ホームへ戻る</Link>
      </article>
    </main>
  )
}
