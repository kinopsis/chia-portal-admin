'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks'
import { Header, Footer } from '@/components'
import HeaderSkeleton from '@/components/layout/Header/HeaderSkeleton'
import { ChatWidget } from '@/components/chat'
import { ChatErrorBoundary, ChatWidgetFallback } from '@/components/chat/ChatErrorBoundary'
import { FEATURE_FLAGS } from '@/lib/constants'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const { userProfile, loading } = useAuth()

  // Check if current route is an admin route
  const isAdminRoute = pathname.startsWith('/admin')

  // For admin routes, always use clean layout (no header/footer)
  // This ensures admin interface is never mixed with public layout
  if (isAdminRoute) {
    return <>{children}</>
  }

  // Show loading state for non-admin routes - use skeleton to avoid context errors during hydration
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderSkeleton />
        <main id="main-content" className="flex-1" role="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
    )
  }

  // For all non-admin routes, render with Header and Footer
  // This includes dashboard, public pages, etc.
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1" role="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />

      {/* AI Chatbot Widget - Only on public pages */}
      {FEATURE_FLAGS.ENABLE_AI_CHATBOT && (
        <ChatErrorBoundary fallback={<ChatWidgetFallback />}>
          <ChatWidget
            position="bottom-right"
            defaultOpen={false}
          />
        </ChatErrorBoundary>
      )}

    </div>
  )
}

export default ConditionalLayout
