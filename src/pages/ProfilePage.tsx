import { Link } from 'react-router-dom'
import profileIcon from '../assets/profile_icon.jpeg'
import { profile } from '../data/profile'
import ProfileTimeline from '../components/ProfileTimeline'

export default function ProfilePage() {
  return (
    <main>
      <article className="simple-page page-section">
        <figure className="profile-image">
          <img src={profileIcon} alt="プロフィールアイコン" />
          <figcaption><strong>{profile.name}</strong><span>{profile.role}</span></figcaption>
        </figure>
        <dl className="profile-details">
          <div><dt>ひとこと</dt><dd>{profile.message || '未設定'}</dd></div>
          <div><dt>生年月日</dt><dd>{profile.birthDate || '未設定'}</dd></div>
          <div><dt>血液型</dt><dd>{profile.bloodType || '未設定'}</dd></div>
          <div><dt>趣味</dt><dd>{profile.hobbies || '未設定'}</dd></div>
          <div><dt>興味</dt><dd>{profile.interests || '未設定'}</dd></div>
          <div><dt>好きなもの</dt><dd>{profile.favorites || '未設定'}</dd></div>
          <div><dt>資格</dt><dd>{profile.qualifications.length > 0 ? profile.qualifications.join(' / ') : '未設定'}</dd></div>
          <div><dt>持っているドメイン</dt><dd>{profile.domains.length > 0 ? profile.domains.join(' / ') : '未設定'}</dd></div>
        </dl>
        <ProfileTimeline entries={profile.career} />
        <Link className="quiet-link page-back-link" to="/">← ホームへ戻る</Link>
      </article>
    </main>
  )
}
