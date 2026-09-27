import type { Profile } from '../types'

type ProfileTimelineProps = {
  entries: Profile['career']
}

export default function ProfileTimeline({ entries }: ProfileTimelineProps) {
  const timelineEntries = Object.entries(entries)

  return (
    <section className="profile-timeline" aria-labelledby="profile-timeline-title">
      <h2 id="profile-timeline-title">経歴</h2>
      <ol>
        {timelineEntries.length > 0 ? timelineEntries.map(([period, event]) => (
          <li key={period}>
            <time>{period}</time>
            <div>
              <h3>{event}</h3>
            </div>
          </li>
        )) : (
          <li className="profile-timeline-empty">
            <time>—</time>
            <div><h3>未設定</h3><p>経歴は profile.ts から追加できます。</p></div>
          </li>
        )}
      </ol>
    </section>
  )
}
