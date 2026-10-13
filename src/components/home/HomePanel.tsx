import type { ComponentType } from 'react'
import type { HomeMenuItem } from '../../data/home'
import ContactPanel from './ContactPanel'
import LinksPanel from './LinksPanel'
import ProfilePanel from './ProfilePanel'
import ServerPanel from './ServerPanel'
import ToolsPanel from './ToolsPanel'
import WorksPanel from './WorksPanel'

type HomePanelProps = {
  item: HomeMenuItem
}

const panels = {
  profile: ProfilePanel,
  link: LinksPanel,
  works: WorksPanel,
  tool: ToolsPanel,
  server: ServerPanel,
  contact: ContactPanel,
} satisfies Record<HomeMenuItem['id'], ComponentType>

export default function HomePanel({ item }: HomePanelProps) {
  const Panel = panels[item.id]
  return <Panel />
}
