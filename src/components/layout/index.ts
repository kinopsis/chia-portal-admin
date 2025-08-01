// Layout Components
export { default as Header } from './Header'
export type { HeaderProps } from './Header'

export { default as Footer } from './Footer'
export type { FooterProps } from './Footer'

export { default as Sidebar } from './Sidebar'
export type { SidebarProps } from './Sidebar'

export { default as AdminLayout } from './AdminLayout'
export type { AdminLayoutProps } from './AdminLayout'

export { FuncionarioLayout } from './FuncionarioLayout'
export type { FuncionarioLayoutProps } from './FuncionarioLayout'

export { FuncionarioSidebar } from './FuncionarioSidebar'

export {
  default as Navigation,
  getMainNavigation,
  getAdminNavigation,
  getUserNavigation,
} from './Navigation'
export type { NavigationProps, NavigationItem } from './Navigation'

export { default as PageHeader } from './PageHeader'
export type { PageHeaderProps } from './PageHeader'

export { default as MobileDrawer } from './MobileDrawer'
export type { MobileDrawerProps } from './MobileDrawer'

export { ConditionalLayout } from './ConditionalLayout'
