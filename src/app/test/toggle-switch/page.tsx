'use client'

/**
 * ToggleSwitch Test Page
 * 
 * Visual testing page for the ToggleSwitch component
 * showcasing all variants, sizes, and states
 */

import React, { useState } from 'react'
import { ToggleSwitch } from '@/components/atoms/ToggleSwitch'
import { Card } from '@/components/atoms'

export default function ToggleSwitchTestPage() {
  const [basicToggle, setBasicToggle] = useState(false)
  const [loadingToggle, setLoadingToggle] = useState(false)
  const [confirmToggle, setConfirmToggle] = useState(false)
  const [disabledToggle, setDisabledToggle] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const handleLoadingToggle = async (newState: boolean) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoadingToggle(newState)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ToggleSwitch Component Test
          </h1>
          <p className="text-gray-600">
            Visual testing for all ToggleSwitch variants and states
          </p>
        </div>

        {/* Basic Usage */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Usage</h2>
            <div className="space-y-4">
              <ToggleSwitch
                checked={basicToggle}
                onChange={setBasicToggle}
                label="Basic Toggle"
                helperText="Simple on/off toggle"
              />
              
              <ToggleSwitch
                checked={basicToggle}
                onChange={setBasicToggle}
                label="With Custom Label"
                helperText="This toggle has a custom label and helper text"
              />
            </div>
          </div>
        </Card>

        {/* Sizes */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Sizes</h2>
            <div className="space-y-4">
              <ToggleSwitch
                checked={basicToggle}
                onChange={setBasicToggle}
                size="sm"
                label="Small Size"
                helperText="Small toggle switch"
              />
              
              <ToggleSwitch
                checked={basicToggle}
                onChange={setBasicToggle}
                size="md"
                label="Medium Size (Default)"
                helperText="Medium toggle switch"
              />
              
              <ToggleSwitch
                checked={basicToggle}
                onChange={setBasicToggle}
                size="lg"
                label="Large Size"
                helperText="Large toggle switch"
              />
            </div>
          </div>
        </Card>

        {/* Variants */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Variants</h2>
            <div className="space-y-4">
              <ToggleSwitch
                checked={true}
                onChange={() => {}}
                variant="default"
                label="Default Variant"
                helperText="Default green color"
              />
              
              <ToggleSwitch
                checked={true}
                onChange={() => {}}
                variant="success"
                label="Success Variant"
                helperText="Success green color"
              />
              
              <ToggleSwitch
                checked={true}
                onChange={() => {}}
                variant="warning"
                label="Warning Variant"
                helperText="Warning yellow color"
              />
              
              <ToggleSwitch
                checked={true}
                onChange={() => {}}
                variant="danger"
                label="Danger Variant"
                helperText="Danger red color"
              />
            </div>
          </div>
        </Card>

        {/* States */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">States</h2>
            <div className="space-y-4">
              <ToggleSwitch
                checked={loadingToggle}
                onChange={handleLoadingToggle}
                loading={isLoading}
                label="Loading State"
                helperText="Toggle with loading spinner (2 second delay)"
              />
              
              <ToggleSwitch
                checked={disabledToggle}
                onChange={setDisabledToggle}
                disabled={true}
                label="Disabled State"
                helperText="This toggle is disabled"
              />
              
              <ToggleSwitch
                checked={confirmToggle}
                onChange={setConfirmToggle}
                confirmationRequired={true}
                confirmationMessage="¿Estás seguro de que deseas cambiar este estado? Esta acción puede tener consecuencias importantes."
                label="Confirmation Required"
                helperText="This toggle requires confirmation"
              />
            </div>
          </div>
        </Card>

        {/* Service Toggle Simulation */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Service Toggle Simulation</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Certificado de Residencia</h3>
                    <p className="text-sm text-gray-500">Código: 080-081-001</p>
                  </div>
                  <ToggleSwitch
                    checked={basicToggle}
                    onChange={setBasicToggle}
                    size="sm"
                    confirmationRequired={true}
                    confirmationMessage="¿Estás seguro de que deseas cambiar el estado de 'Certificado de Residencia'?"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Licencia de Construcción</h3>
                    <p className="text-sm text-gray-500">Código: 080-082-001</p>
                  </div>
                  <ToggleSwitch
                    checked={!basicToggle}
                    onChange={(state) => setBasicToggle(!state)}
                    size="sm"
                    variant="warning"
                    confirmationRequired={true}
                    confirmationMessage="¿Estás seguro de que deseas cambiar el estado de 'Licencia de Construcción'?"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Current State Display */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current States</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Basic Toggle:</strong> {basicToggle ? 'ON' : 'OFF'}
              </div>
              <div>
                <strong>Loading Toggle:</strong> {loadingToggle ? 'ON' : 'OFF'}
              </div>
              <div>
                <strong>Confirm Toggle:</strong> {confirmToggle ? 'ON' : 'OFF'}
              </div>
              <div>
                <strong>Is Loading:</strong> {isLoading ? 'YES' : 'NO'}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
