export const menuItems = [
  { id: 'profile', label: 'プロフィール', english: 'plofile', color: 'blue' },
  { id: 'link', label: 'リンク', english: 'link', color: 'coral' },
  { id: 'tool', label: 'ツール', english: 'tool', color: 'green' },
  { id: 'server', label: 'サーバー', english: 'server', color: 'ink' },
  { id: 'contact', label: '連絡先', english: 'contact', color: 'yellow' },
] as const

export type HomeMenuItem = (typeof menuItems)[number]

export const socialLinks = [
  ['GitHub', 'https://github.com/ak-2302'],
  ['Qiita', 'https://qiita.com/ak-2302'],
  ['Zenn', 'https://zenn.dev/ak2302'],
  ['X', 'https://x.com/ak_2302x'],
] as const

export const toolLinks = [
  ['動画をまとめて変換する', 'https://にゃんこ.tech/tool/video_trans/'],
  ['過去のGitHub Pagesの履歴を見る', 'https://にゃんこ.tech/tool/github_pages_commits/'],
  ['画像と音声から動画をつくる', 'https://にゃんこ.tech/tool/image_audio_to_video/'],
] as const

export const orbitStep = 360 / menuItems.length
