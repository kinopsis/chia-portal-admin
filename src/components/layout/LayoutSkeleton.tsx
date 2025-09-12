import React from 'react'
import HeaderSkeleton from './Header/HeaderSkeleton'
import Footer from '@/components/layout/Footer/Footer'  // Footer is safe (no hooks)

const LayoutSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderSkeleton />
      <main id="main-content" className="flex-1" role="main" tabIndex={-1}>
        <div className="container-custom py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-background-secondary rounded w-3/4 mx-auto"></div>
            <div className="h-6 bg-background-secondary rounded w-1/2 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-background-secondary rounded-lg"></div>
              ))}
            </div>
            <div className="h-4 bg-background-secondary rounded w-full mx-auto"></div>
            <div className="h-4 bg-background-secondary rounded w-5/6 mx-auto"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default LayoutSkeleton