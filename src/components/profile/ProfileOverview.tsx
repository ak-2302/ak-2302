import profileIcon from '../../assets/cat_pale.png'
import { profile } from '../../data/profile'
import ProfileTimeline from '../ProfileTimeline'

const imageCredit = {
  label: 'icon：@mari86ymv',
  href: 'https://x.com/mari86ymv',
} as const

const profileDetails = [
  { label: 'ひとこと', value: profile.message },
  { label: '生年月日', value: profile.birthDate },
  { label: '血液型', value: profile.bloodType },
  { label: '趣味', value: profile.hobbies },
  { label: '興味', value: profile.interests },
  { label: '好きなもの', value: profile.favorites },
  { label: '資格', value: profile.qualifications.join(' / ') },
  { label: '持っているドメイン', value: profile.domains.join(' / ') },
] as const

type ProfileOverviewProps = {
  variant: 'home' | 'page'
}

function ProfilePortrait({ variant }: ProfileOverviewProps) {
  const isPage = variant === 'page'
  const Root = isPage ? 'figure' : 'div'

  return (
    <Root className={isPage ? 'profile-image' : undefined}>
      <div className={`profile-image-visual${isPage ? '' : ' home-profile-image-visual'}`}>
        <img className={isPage ? undefined : 'home-profile-icon'} src={profileIcon} alt="プロフィールアイコン" />
        <a
          className="profile-image-credit"
          href={imageCredit.href}
          target="_blank"
          rel="noreferrer"
          aria-label="画像提供者 @mari86ymv のXプロフィールを開く"
        >
          {imageCredit.label}
        </a>
      </div>
      {isPage ? (
        <figcaption><strong>{profile.name}</strong><span>{profile.role}</span></figcaption>
      ) : (
        <div className="home-profile-identity"><strong>{profile.name}</strong><span>{profile.role}</span></div>
      )}
    </Root>
  )
}

function ProfileDetails({ variant }: ProfileOverviewProps) {
  return (
    <dl className={variant === 'page' ? 'profile-details' : 'home-profile-details'}>
      {profileDetails.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value || '未設定'}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function ProfileOverview({ variant }: ProfileOverviewProps) {
  return (
    <>
      <ProfilePortrait variant={variant} />
      <ProfileDetails variant={variant} />
      <ProfileTimeline entries={profile.career} />
    </>
  )
}
