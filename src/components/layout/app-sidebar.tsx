import { useMemo } from 'react'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useAuthStore } from '@/stores/auth-store'
import { sidebarData as defaultSidebarData } from './data/sidebar-data'
import { type SidebarData } from './types'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { auth } = useAuthStore()

  const data = useMemo<SidebarData>(() => {
    let email = auth.user?.email
    if (!email) {
      const raw = localStorage.getItem('userInfo')
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { email?: string } | null
          if (parsed?.email) email = parsed.email
        } catch {
          /* noop */
        }
      }
    }
    if (email) {
      const name = email.split('@')[0] || 'User'
      return {
        ...defaultSidebarData,
        user: {
          name,
          email,
          avatar: defaultSidebarData.user.avatar,
        },
      }
    }
    return defaultSidebarData
  }, [auth.user])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />

      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
