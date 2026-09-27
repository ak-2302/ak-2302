export type Work = {
  slug: string
  title: string
  summary: string
  description: string
  year?: string
  technologies: string[]
  thumbnail: string
  images?: string[]
  demoUrl?: string
  sourceUrl?: string
  featured?: boolean
  accent: 'coral' | 'blue' | 'yellow'
}

export type Profile = {
  name: string
  role: string
  message: string
  birthDate: string
  bloodType: string
  hobbies: string
  interests: string
  favorites: string
  qualifications: string[]
  domains: string[]
  career: Record<string, string>
  bio: string
  note: string
  links: Array<{ label: string; href: string }>
}
