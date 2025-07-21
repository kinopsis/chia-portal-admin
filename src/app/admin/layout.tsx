import { AdminLayout } from '@/components/layout'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}

export const metadata = {
  title: {
    template: '%s | Admin - Portal Ciudadano Chía',
    default: 'Admin - Portal Ciudadano Chía',
  },
  description: 'Panel de administración del Portal Ciudadano de Chía',
}
