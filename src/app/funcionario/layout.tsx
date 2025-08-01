import { FuncionarioLayout } from '@/components/layout'

export default function FuncionarioRootLayout({ children }: { children: React.ReactNode }) {
  return <FuncionarioLayout>{children}</FuncionarioLayout>
}

export const metadata = {
  title: {
    template: '%s | Panel Funcionario - Portal Ciudadano Chía',
    default: 'Panel Funcionario - Portal Ciudadano Chía',
  },
  description: 'Panel de gestión para funcionarios del Portal Ciudadano de Chía',
}
