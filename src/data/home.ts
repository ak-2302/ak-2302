export const menuItems = [
  { id: 'profile', label: 'プロフィール', english: 'profile', color: 'blue' },
  { id: 'link', label: 'リンク', english: 'link', color: 'coral' },
  { id: 'works', label: '作品', english: 'works', color: 'yellow' },
  { id: 'tool', label: 'ツール', english: 'tool', color: 'green' },
  { id: 'server', label: 'サーバー', english: 'server', color: 'ink' },
  { id: 'contact', label: '連絡先', english: 'contact', color: 'yellow' },
] as const

export type HomeMenuItem = (typeof menuItems)[number]

export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/ak-2302', lightColor: '#181717', darkColor: '#181717', lightForeground: '#ffffff', darkForeground: '#ffffff' },
  { label: 'Qiita', href: 'https://qiita.com/ak-2302', lightColor: '#55c500', darkColor: '#55c500', lightForeground: '#ffffff', darkForeground: '#ffffff' },
  { label: 'Zenn', href: 'https://zenn.dev/ak2302', lightColor: '#3ea8ff', darkColor: '#081d35', lightForeground: '#ffffff', darkForeground: '#ffffff' },
  { label: 'X', href: 'https://x.com/ak_2302x', lightColor: '#ffffff', darkColor: '#000000', lightForeground: '#000000', darkForeground: '#ffffff' },
  { label: 'Codex', href: 'https://chatgpt.com/u/meiteya', lightColor: '#f7f7f8', darkColor: '#212121', lightForeground: '#212121', darkForeground: '#ffffff' },
  { label: 'Keybase', href: 'https://keybase.io/meiteya', lightColor: '#4c8eff', darkColor: '#182d6e', lightForeground: '#ffffff', darkForeground: '#ffffff' },
] as const

export type SocialLink = (typeof socialLinks)[number]

export const orbitStep = 360 / menuItems.length
