import { FuncionarioLayout } from '@/components/layout'

export default function FuncionariosRootLayout({ children }: { children: React.ReactNode }) {
  return <FuncionarioLayout>{children}</FuncionarioLayout>
}

export const metadata = {
  title: {
    template: '%s | Funcionarios - Portal Ciudadano Chía',
    default: 'Funcionarios - Portal Ciudadano Chía',
  },
  description: 'Panel de gestión para funcionarios del Portal Ciudadano de Chía',
}
