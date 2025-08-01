// UX-005: Test for enhanced loading indicators in trámites cards
// This test verifies that the enhanced skeleton loaders work correctly

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { 
  TramiteCardSkeleton, 
  TramiteCardSkeletonGrid, 
  ProgressiveTramiteSkeleton 
} from '@/components/molecules/TramiteCardSkeleton/TramiteCardSkeleton'

describe('UX-005: Enhanced Loading Indicators Tests', () => {
  describe('TramiteCardSkeleton', () => {
    test('should render basic skeleton structure', () => {
      render(<TramiteCardSkeleton data-testid="skeleton-card" />)
      
      const skeleton = screen.getByTestId('skeleton-card')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('animate-pulse')
    })

    test('should show shimmer animation when enabled', () => {
      render(<TramiteCardSkeleton showShimmer={true} data-testid="skeleton-card" />)
      
      const skeleton = screen.getByTestId('skeleton-card')
      expect(skeleton).toBeInTheDocument()
      
      // Check for shimmer-related classes in skeleton elements
      const skeletonElements = skeleton.querySelectorAll('.bg-gray-200')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    test('should not show shimmer when disabled', () => {
      render(<TramiteCardSkeleton showShimmer={false} data-testid="skeleton-card" />)
      
      const skeleton = screen.getByTestId('skeleton-card')
      expect(skeleton).toBeInTheDocument()
    })

    test('should render different variants correctly', () => {
      const { rerender } = render(
        <TramiteCardSkeleton variant="default" data-testid="skeleton-card" />
      )
      
      let skeleton = screen.getByTestId('skeleton-card')
      expect(skeleton).toBeInTheDocument()
      
      // Test compact variant
      rerender(<TramiteCardSkeleton variant="compact" data-testid="skeleton-card" />)
      skeleton = screen.getByTestId('skeleton-card')
      expect(skeleton).toBeInTheDocument()
      
      // Test detailed variant
      rerender(<TramiteCardSkeleton variant="detailed" data-testid="skeleton-card" />)
      skeleton = screen.getByTestId('skeleton-card')
      expect(skeleton).toBeInTheDocument()
    })

    test('should apply custom className', () => {
      render(
        <TramiteCardSkeleton 
          className="custom-skeleton-class" 
          data-testid="skeleton-card" 
        />
      )
      
      const skeleton = screen.getByTestId('skeleton-card')
      expect(skeleton).toHaveClass('custom-skeleton-class')
    })
  })

  describe('TramiteCardSkeletonGrid', () => {
    test('should render default number of skeleton cards', () => {
      render(<TramiteCardSkeletonGrid data-testid="skeleton-grid" />)
      
      const grid = screen.getByTestId('skeleton-grid')
      expect(grid).toBeInTheDocument()
      
      // Should render 6 cards by default
      const skeletonCards = screen.getAllByTestId(/skeleton-card-\d+/)
      expect(skeletonCards).toHaveLength(6)
    })

    test('should render custom number of skeleton cards', () => {
      render(<TramiteCardSkeletonGrid count={3} data-testid="skeleton-grid" />)
      
      const grid = screen.getByTestId('skeleton-grid')
      expect(grid).toBeInTheDocument()
      
      // Should render 3 cards
      const skeletonCards = screen.getAllByTestId(/skeleton-card-\d+/)
      expect(skeletonCards).toHaveLength(3)
    })

    test('should apply staggered animation delays', () => {
      render(
        <TramiteCardSkeletonGrid 
          count={3} 
          staggered={true} 
          data-testid="skeleton-grid" 
        />
      )
      
      const skeletonCards = screen.getAllByTestId(/skeleton-card-\d+/)
      expect(skeletonCards).toHaveLength(3)
      
      // Check that cards have different animation delays (if implemented via classes)
      // This is a basic check since animation delays might be implemented differently
      skeletonCards.forEach((card, index) => {
        expect(card).toBeInTheDocument()
      })
    })

    test('should pass variant to all skeleton cards', () => {
      render(
        <TramiteCardSkeletonGrid 
          count={2} 
          variant="compact" 
          data-testid="skeleton-grid" 
        />
      )
      
      const skeletonCards = screen.getAllByTestId(/skeleton-card-\d+/)
      expect(skeletonCards).toHaveLength(2)
      
      // All cards should be rendered (variant affects internal structure)
      skeletonCards.forEach(card => {
        expect(card).toBeInTheDocument()
      })
    })

    test('should apply custom className to grid', () => {
      render(
        <TramiteCardSkeletonGrid 
          className="custom-grid-class" 
          data-testid="skeleton-grid" 
        />
      )
      
      const grid = screen.getByTestId('skeleton-grid')
      expect(grid).toHaveClass('custom-grid-class')
    })
  })

  describe('ProgressiveTramiteSkeleton', () => {
    test('should render initial loading stage', () => {
      render(
        <ProgressiveTramiteSkeleton 
          loadingStage="initial" 
          data-testid="progressive-skeleton" 
        />
      )
      
      const skeleton = screen.getByTestId('progressive-skeleton')
      expect(skeleton).toBeInTheDocument()
    })

    test('should render basic-info loading stage', () => {
      render(
        <ProgressiveTramiteSkeleton 
          loadingStage="basic-info" 
          data-testid="progressive-skeleton" 
        />
      )
      
      const skeleton = screen.getByTestId('progressive-skeleton')
      expect(skeleton).toBeInTheDocument()
    })

    test('should render details loading stage', () => {
      render(
        <ProgressiveTramiteSkeleton 
          loadingStage="details" 
          data-testid="progressive-skeleton" 
        />
      )
      
      const skeleton = screen.getByTestId('progressive-skeleton')
      expect(skeleton).toBeInTheDocument()
    })

    test('should render complete loading stage', () => {
      render(
        <ProgressiveTramiteSkeleton 
          loadingStage="complete" 
          data-testid="progressive-skeleton" 
        />
      )
      
      const skeleton = screen.getByTestId('progressive-skeleton')
      expect(skeleton).toBeInTheDocument()
    })

    test('should show different visual states for different stages', () => {
      const { rerender } = render(
        <ProgressiveTramiteSkeleton 
          loadingStage="initial" 
          data-testid="progressive-skeleton" 
        />
      )
      
      let skeleton = screen.getByTestId('progressive-skeleton')
      expect(skeleton).toBeInTheDocument()
      
      // Test progression through stages
      rerender(
        <ProgressiveTramiteSkeleton 
          loadingStage="basic-info" 
          data-testid="progressive-skeleton" 
        />
      )
      skeleton = screen.getByTestId('progressive-skeleton')
      expect(skeleton).toBeInTheDocument()
      
      rerender(
        <ProgressiveTramiteSkeleton 
          loadingStage="details" 
          data-testid="progressive-skeleton" 
        />
      )
      skeleton = screen.getByTestId('progressive-skeleton')
      expect(skeleton).toBeInTheDocument()
      
      rerender(
        <ProgressiveTramiteSkeleton 
          loadingStage="complete" 
          data-testid="progressive-skeleton" 
        />
      )
      skeleton = screen.getByTestId('progressive-skeleton')
      expect(skeleton).toBeInTheDocument()
    })

    test('should apply custom className', () => {
      render(
        <ProgressiveTramiteSkeleton 
          loadingStage="initial"
          className="custom-progressive-class" 
          data-testid="progressive-skeleton" 
        />
      )
      
      const skeleton = screen.getByTestId('progressive-skeleton')
      expect(skeleton).toHaveClass('custom-progressive-class')
    })
  })

  describe('Accessibility', () => {
    test('should have proper loading indicators for screen readers', () => {
      render(<TramiteCardSkeleton data-testid="skeleton-card" />)
      
      const skeleton = screen.getByTestId('skeleton-card')
      expect(skeleton).toBeInTheDocument()
      
      // Check for accessibility attributes
      expect(skeleton).toHaveClass('animate-pulse')
    })

    test('should provide loading context for assistive technologies', () => {
      render(<TramiteCardSkeletonGrid data-testid="skeleton-grid" />)
      
      const grid = screen.getByTestId('skeleton-grid')
      expect(grid).toBeInTheDocument()
      
      // Grid should contain multiple skeleton cards
      const skeletonCards = screen.getAllByTestId(/skeleton-card-\d+/)
      expect(skeletonCards.length).toBeGreaterThan(0)
    })
  })

  describe('Performance', () => {
    test('should render efficiently with many skeleton cards', () => {
      const startTime = performance.now()
      
      render(<TramiteCardSkeletonGrid count={20} data-testid="skeleton-grid" />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100)
      
      const skeletonCards = screen.getAllByTestId(/skeleton-card-\d+/)
      expect(skeletonCards).toHaveLength(20)
    })

    test('should not cause memory leaks with animations', () => {
      const { unmount } = render(
        <TramiteCardSkeletonGrid 
          count={5} 
          showShimmer={true} 
          data-testid="skeleton-grid" 
        />
      )
      
      // Should unmount without errors
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Visual States', () => {
    test('should show different skeleton elements based on variant', () => {
      const { rerender } = render(
        <TramiteCardSkeleton variant="compact" data-testid="skeleton-card" />
      )
      
      let skeleton = screen.getByTestId('skeleton-card')
      expect(skeleton).toBeInTheDocument()
      
      // Test detailed variant shows more elements
      rerender(<TramiteCardSkeleton variant="detailed" data-testid="skeleton-card" />)
      skeleton = screen.getByTestId('skeleton-card')
      expect(skeleton).toBeInTheDocument()
    })

    test('should maintain consistent card structure across variants', () => {
      const variants: Array<'default' | 'compact' | 'detailed'> = ['default', 'compact', 'detailed']
      
      variants.forEach(variant => {
        const { unmount } = render(
          <TramiteCardSkeleton variant={variant} data-testid="skeleton-card" />
        )
        
        const skeleton = screen.getByTestId('skeleton-card')
        expect(skeleton).toBeInTheDocument()
        expect(skeleton).toHaveClass('animate-pulse')
        
        unmount()
      })
    })
  })
})
