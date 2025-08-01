// UX-005: Hook for managing enhanced loading states
// Provides progressive loading stages and realistic timing

'use client'

import { useState, useEffect, useCallback } from 'react'

export type LoadingStage = 'initial' | 'basic-info' | 'details' | 'complete'

export interface LoadingState {
  isLoading: boolean
  stage: LoadingStage
  progress: number
  error: string | null
}

export interface UseLoadingStatesOptions {
  stages?: {
    stage: LoadingStage
    duration: number
    label: string
  }[]
  autoProgress?: boolean
  onStageChange?: (stage: LoadingStage) => void
  onComplete?: () => void
  onError?: (error: string) => void
}

const DEFAULT_STAGES = [
  { stage: 'initial' as LoadingStage, duration: 800, label: 'Iniciando carga...' },
  { stage: 'basic-info' as LoadingStage, duration: 1200, label: 'Cargando información básica...' },
  { stage: 'details' as LoadingStage, duration: 1000, label: 'Cargando detalles...' },
  { stage: 'complete' as LoadingStage, duration: 0, label: 'Completado' },
]

export const useLoadingStates = (options: UseLoadingStatesOptions = {}) => {
  const {
    stages = DEFAULT_STAGES,
    autoProgress = true,
    onStageChange,
    onComplete,
    onError,
  } = options

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    stage: 'initial',
    progress: 0,
    error: null,
  })

  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [stageStartTime, setStageStartTime] = useState<number>(0)

  // Start loading process
  const startLoading = useCallback(() => {
    setLoadingState({
      isLoading: true,
      stage: 'initial',
      progress: 0,
      error: null,
    })
    setCurrentStageIndex(0)
    setStageStartTime(Date.now())
  }, [])

  // Stop loading process
  const stopLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      stage: 'complete',
      progress: 100,
    }))
    onComplete?.()
  }, [onComplete])

  // Set error state
  const setError = useCallback((error: string) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      error,
    }))
    onError?.(error)
  }, [onError])

  // Advance to next stage manually
  const nextStage = useCallback(() => {
    if (currentStageIndex < stages.length - 1) {
      const nextIndex = currentStageIndex + 1
      const nextStage = stages[nextIndex]
      
      setCurrentStageIndex(nextIndex)
      setStageStartTime(Date.now())
      setLoadingState(prev => ({
        ...prev,
        stage: nextStage.stage,
        progress: (nextIndex / (stages.length - 1)) * 100,
      }))
      
      onStageChange?.(nextStage.stage)
      
      if (nextStage.stage === 'complete') {
        stopLoading()
      }
    }
  }, [currentStageIndex, stages, onStageChange, stopLoading])

  // Go to specific stage
  const goToStage = useCallback((targetStage: LoadingStage) => {
    const stageIndex = stages.findIndex(s => s.stage === targetStage)
    if (stageIndex !== -1) {
      setCurrentStageIndex(stageIndex)
      setStageStartTime(Date.now())
      setLoadingState(prev => ({
        ...prev,
        stage: targetStage,
        progress: (stageIndex / (stages.length - 1)) * 100,
      }))
      
      onStageChange?.(targetStage)
      
      if (targetStage === 'complete') {
        stopLoading()
      }
    }
  }, [stages, onStageChange, stopLoading])

  // Reset loading state
  const resetLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      stage: 'initial',
      progress: 0,
      error: null,
    })
    setCurrentStageIndex(0)
    setStageStartTime(0)
  }, [])

  // Auto-progress through stages
  useEffect(() => {
    if (!autoProgress || !loadingState.isLoading || loadingState.stage === 'complete') {
      return
    }

    const currentStage = stages[currentStageIndex]
    if (!currentStage || currentStage.duration === 0) {
      return
    }

    const timer = setTimeout(() => {
      nextStage()
    }, currentStage.duration)

    return () => clearTimeout(timer)
  }, [autoProgress, loadingState.isLoading, loadingState.stage, currentStageIndex, stages, nextStage])

  // Update progress within current stage
  useEffect(() => {
    if (!loadingState.isLoading || loadingState.stage === 'complete') {
      return
    }

    const currentStage = stages[currentStageIndex]
    if (!currentStage || currentStage.duration === 0) {
      return
    }

    const updateProgress = () => {
      const elapsed = Date.now() - stageStartTime
      const stageProgress = Math.min(elapsed / currentStage.duration, 1)
      const baseProgress = (currentStageIndex / (stages.length - 1)) * 100
      const nextStageProgress = ((currentStageIndex + 1) / (stages.length - 1)) * 100
      const currentProgress = baseProgress + (nextStageProgress - baseProgress) * stageProgress

      setLoadingState(prev => ({
        ...prev,
        progress: Math.min(currentProgress, 100),
      }))
    }

    const interval = setInterval(updateProgress, 50) // Update every 50ms for smooth progress

    return () => clearInterval(interval)
  }, [loadingState.isLoading, loadingState.stage, currentStageIndex, stages, stageStartTime])

  // Get current stage info
  const getCurrentStageInfo = useCallback(() => {
    const currentStage = stages[currentStageIndex]
    return currentStage || stages[0]
  }, [stages, currentStageIndex])

  // Get estimated time remaining
  const getEstimatedTimeRemaining = useCallback(() => {
    if (!loadingState.isLoading || loadingState.stage === 'complete') {
      return 0
    }

    const remainingStages = stages.slice(currentStageIndex + 1)
    const currentStage = stages[currentStageIndex]
    const elapsed = Date.now() - stageStartTime
    const currentStageRemaining = Math.max(0, currentStage.duration - elapsed)
    
    return remainingStages.reduce((total, stage) => total + stage.duration, currentStageRemaining)
  }, [loadingState.isLoading, loadingState.stage, stages, currentStageIndex, stageStartTime])

  return {
    // State
    ...loadingState,
    currentStageInfo: getCurrentStageInfo(),
    estimatedTimeRemaining: getEstimatedTimeRemaining(),
    
    // Actions
    startLoading,
    stopLoading,
    setError,
    nextStage,
    goToStage,
    resetLoading,
    
    // Utilities
    isInitialStage: loadingState.stage === 'initial',
    isBasicInfoStage: loadingState.stage === 'basic-info',
    isDetailsStage: loadingState.stage === 'details',
    isComplete: loadingState.stage === 'complete',
    hasError: !!loadingState.error,
  }
}

// Preset configurations for common loading scenarios
export const LoadingPresets = {
  // Quick loading for simple data
  quick: {
    stages: [
      { stage: 'initial' as LoadingStage, duration: 300, label: 'Cargando...' },
      { stage: 'complete' as LoadingStage, duration: 0, label: 'Completado' },
    ],
  },
  
  // Standard loading for typical API calls
  standard: {
    stages: [
      { stage: 'initial' as LoadingStage, duration: 500, label: 'Iniciando...' },
      { stage: 'basic-info' as LoadingStage, duration: 800, label: 'Cargando datos...' },
      { stage: 'complete' as LoadingStage, duration: 0, label: 'Completado' },
    ],
  },
  
  // Detailed loading for complex operations
  detailed: DEFAULT_STAGES,
  
  // Slow loading for heavy operations
  slow: {
    stages: [
      { stage: 'initial' as LoadingStage, duration: 1000, label: 'Preparando...' },
      { stage: 'basic-info' as LoadingStage, duration: 2000, label: 'Procesando datos...' },
      { stage: 'details' as LoadingStage, duration: 1500, label: 'Finalizando...' },
      { stage: 'complete' as LoadingStage, duration: 0, label: 'Completado' },
    ],
  },
}
