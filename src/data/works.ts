import type { Work } from '../types'

export const works: Work[] = [
  {
    slug: 'image-audio-to-video',
    title: 'image / audio → video',
    summary: '画像と音声をひとつの動画にする、小さな変換ツール。',
    description: '素材を選んで、音の長さに合わせて画像を動画へ変換するツール。複雑な編集画面をつくらず、迷わず変換できる順番を大事にしました。',
    year: '2024',
    technologies: ['React', 'Web Audio', 'FFmpeg'],
    thumbnail: '01',
    demoUrl: '#contact',
    sourceUrl: 'https://github.com/ak-2302',
    featured: true,
    accent: 'coral',
  },
  {
    slug: 'github-pages-commits',
    title: 'commit weather',
    summary: 'GitHubの履歴を、天気のように眺める実験。',
    description: 'コミットの時間帯や頻度を、日記のような視覚表現へ変換する実験。データを読むための画面に、少しだけ気分を持ち込んでいます。',
    year: '2024',
    technologies: ['JavaScript', 'GitHub API', 'CSS'],
    thumbnail: '02',
    sourceUrl: 'https://github.com/ak-2302',
    accent: 'blue',
  },
  {
    slug: 'bottom-to-top',
    title: 'bottom to top',
    summary: '画面の下から現れる、猫のための小さな案内板。',
    description: '視線の流れを少しだけ裏切る、スクロール実験。ページの底にいるものを、上へ連れていくための動きを試しました。',
    year: '2023',
    technologies: ['HTML', 'CSS', 'Motion'],
    thumbnail: '03',
    sourceUrl: 'https://github.com/ak-2302',
    accent: 'yellow',
  },
]

export function getWorkBySlug(slug: string) {
  return works.find((work) => work.slug === slug)
}
