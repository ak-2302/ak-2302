import type { HomeMenuItem } from '../../data/home'
import ContactPanel from './ContactPanel'
import LinksPanel from './LinksPanel'
import ProfilePanel from './ProfilePanel'
import ServerPanel from './ServerPanel'
import ToolsPanel from './ToolsPanel'

type HomePanelProps = {
  item: HomeMenuItem
}

export default function HomePanel({ item }: HomePanelProps) {
  if (item.id === 'profile') return <ProfilePanel />
  if (item.id === 'link') return <LinksPanel />
  if (item.id === 'tool') return <ToolsPanel />
  if (item.id === 'server') return <ServerPanel />
  return <ContactPanel />
}
