import {
  BrainCircuit,
  PanelLeftClose,
  PanelLeftOpen,
  Usb,
  Wrench,
} from 'lucide-react'
import type { AppCopy } from '../lib/appCopy'
import type { ActionProtocol } from '../lib/actionProtocol'
import type { ModelConfig } from '../lib/openAiTypes'
import { ConfigRail, type ConfigRailItem } from './ConfigRail'
import { CONFIG_TARGET_IDS, type ConfigTarget } from './configTargets'
import { DeviceHomeOptionsSection } from './DeviceHomeOptionsSection'
import { DevicePanel } from './DevicePanel'
import { HomePreferencesSection } from './HomePreferencesSection'
import type {
  DeviceControlActions,
  DeviceControlOptions,
  DeviceControlState,
} from '../lib/deviceControlTypes'
import { ModelPanel } from './ModelPanel'

type ConfigRailTarget = ConfigTarget | 'toolbox'

export type ConfigSidebarProps = {
  copy: AppCopy
  deviceActions: DeviceControlActions
  deviceOptions: DeviceControlOptions
  deviceState: DeviceControlState
  isOpen: boolean
  memoryEnabled: boolean
  modelConfig: ModelConfig
  actionProtocol: ActionProtocol
  onActionProtocolChange: (value: ActionProtocol) => void
  onModelConfigChange: <Key extends keyof ModelConfig>(
    key: Key,
    value: ModelConfig[Key],
  ) => void
  onMemoryEnabledChange: (value: boolean) => void
  onOpenToolbox: () => void
  onScreenBlackoutDuringAutoControlChange: (value: boolean) => void
  onSelectTarget: (target: ConfigTarget) => void
  onStreamResponsesChange: (value: boolean) => void
  onToggleOpen: () => void
  screenBlackoutDuringAutoControl: boolean
  streamResponses: boolean
}

export function ConfigSidebar({
  copy,
  deviceActions,
  deviceOptions,
  deviceState,
  isOpen,
  memoryEnabled,
  modelConfig,
  actionProtocol,
  onActionProtocolChange,
  onModelConfigChange,
  onMemoryEnabledChange,
  onOpenToolbox,
  onScreenBlackoutDuringAutoControlChange,
  onSelectTarget,
  onStreamResponsesChange,
  onToggleOpen,
  screenBlackoutDuringAutoControl,
  streamResponses,
}: ConfigSidebarProps) {
  const railItems: ConfigRailItem<ConfigRailTarget>[] = [
    { icon: BrainCircuit, label: copy.model, target: 'model' },
    { icon: Usb, label: copy.device, target: 'device' },
    { icon: Wrench, label: copy.toolbox, target: 'toolbox' },
  ]

  const handleRailSelect = (target: ConfigRailTarget) => {
    if (target === 'toolbox') {
      onOpenToolbox()
      return
    }

    onSelectTarget(target)
  }

  return (
    <aside
      aria-label={copy.configurationPanel}
      className={
        isOpen
          ? 'panel config-panel config-panel-expanded'
          : 'panel config-panel config-panel-collapsed'
      }
    >
      <div className="config-sidebar-header">
        {isOpen ? <span className="config-sidebar-title">{copy.configurationPanel}</span> : null}
        <button
          type="button"
          className="icon-button config-sidebar-toggle"
          aria-expanded={isOpen}
          aria-label={isOpen ? copy.collapseConfigurationPanel : copy.expandConfigurationPanel}
          title={isOpen ? copy.collapseConfigurationPanel : copy.expandConfigurationPanel}
          onClick={onToggleOpen}
        >
          {isOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
        </button>
      </div>

      {isOpen ? (
        <div className="config-panel-content">
          <section
            className="config-panel-group"
            id={CONFIG_TARGET_IDS.model}
            aria-label={copy.model}
          >
            <ModelPanel
              copy={copy}
              actionProtocol={actionProtocol}
              modelConfig={modelConfig}
              onActionProtocolChange={onActionProtocolChange}
              onModelConfigChange={onModelConfigChange}
              onStreamResponsesChange={onStreamResponsesChange}
              streamResponses={streamResponses}
            />
          </section>

          <DevicePanel
            actions={deviceActions}
            copy={copy}
            onOpenToolbox={onOpenToolbox}
            sectionId={CONFIG_TARGET_IDS.device}
            state={deviceState}
          />

          <DeviceHomeOptionsSection
            actions={deviceActions}
            copy={copy}
            options={deviceOptions}
          />

          <HomePreferencesSection
            copy={copy}
            memoryEnabled={memoryEnabled}
            screenBlackoutDuringAutoControl={screenBlackoutDuringAutoControl}
            onMemoryEnabledChange={onMemoryEnabledChange}
            onScreenBlackoutDuringAutoControlChange={onScreenBlackoutDuringAutoControlChange}
          />
        </div>
      ) : (
        <ConfigRail
          copy={copy}
          items={railItems}
          onSelect={handleRailSelect}
        />
      )}
    </aside>
  )
}
