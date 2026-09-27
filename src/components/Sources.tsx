import React, { useState } from "react"
import { toast } from "sonner"

import { useTest } from "~hooks"
import { messages } from "~i18n"
import { useSettingsStore } from "~store"
import { type Editor, type SourceItem } from "~types"
import { confirm } from "~utils"

import Card from "./Card"
import SourceBoard from "./SourceBoard"

/**
 * Props for the `Sources` component.
 */
interface SourcesProps {
  /**
   * Open editor panel below for add/edit
   */
  onOpenEditor: (opts: Editor) => void
}

/**
 * Component that lists configured sync sources and actions for each.
 *
 * Renders Gist and WebDAV entries, and provides controls to test, remove,
 * reorder and toggle each source.
 *
 * Uses Zustand store for state management - no more props drilling!
 *
 * @param props - Sources component properties
 *
 * @returns A JSX element rendering the sources list
 */
const Sources = ({ onOpenEditor }: SourcesProps) => {
  // Get config from store
  const config = useSettingsStore((state) => state.config)
  const updateConfig = useSettingsStore((state) => state.updateConfig)

  // Hook state and helpers for saving and testing providers
  const { testingMap, testGist, testWebDav } = useTest()
  const [showAddChooser, setShowAddChooser] = useState(false)

  // Determine if any sources are configured
  const hasGist = !!config?.gist?.accessToken
  const webDavCount = config?.webDavConfigs?.length || 0
  const hasSources = hasGist || webDavCount > 0

  /**
   * All configured sources as `SourceItem` array.
   */
  const allSources: SourceItem[] = [
    ...(hasGist
      ? [
          {
            type: "gist" as const,
            id: "gist",
            label: config!.gist!.fileName,
            priority: config!.gist!.priority,
            enabled: config!.gist!.enabled
          }
        ]
      : []),
    ...(config?.webDavConfigs?.map((acc, idx) => ({
      type: "webdav" as const,
      id: `webdav-${idx}`,
      label: `${acc.vendorId} / ${acc.username} ${acc.filePath}`,
      priority: acc.priority,
      rawIndex: idx,
      enabled: acc.enabled
    })) || [])
  ]

  /**
   * Remove Gist configuration after user confirmation.
   */
  const removeGist = async () => {
    if (!(await confirm(messages.confirm.removeGist()))) return
    updateConfig((draft) => {
      draft.gist = undefined
    })
    toast(messages.alert.settingsSaved())
  }

  /**
   * Remove a WebDAV account configuration by index after confirmation.
   *
   * @param index - Index of the WebDAV account to remove
   */
  const removeWebDav = async (index: number) => {
    if (!(await confirm(messages.confirm.removeWebdav()))) return
    updateConfig((draft) => {
      draft.webDavConfigs!.splice(index, 1)
    })
    toast(messages.alert.settingsSaved())
  }

  /**
   * Move the source at `index` one position up by changing priorities
   *
   * @param index - Index of the source to move up
   */
  const onMoveUp = (index: number) => {
    const source = allSources[index]
    const targetSource = allSources[index - 1]
    const targetPriority = targetSource.priority

    updateConfig((draft) => {
      // source
      if (source.type === "gist") draft.gist!.priority = targetPriority
      else draft.webDavConfigs[source.rawIndex!].priority = targetPriority

      // targetSource
      if (targetSource.type === "gist")
        draft.gist!.priority = targetPriority + 1
      else
        draft.webDavConfigs[targetSource.rawIndex!].priority =
          targetPriority + 1
    })
  }

  /**
   * Move the source at `index` one position down by changing priorities.
   *
   * @param index - Index of the source to move down
   */
  const onMoveDown = (index: number) => {
    const source = allSources[index]
    const targetSource = allSources[index + 1]
    const targetPriority = targetSource.priority

    updateConfig((draft) => {
      // source
      if (source.type === "gist") draft.gist!.priority = targetPriority
      else draft.webDavConfigs[source.rawIndex!].priority = targetPriority

      // targetSource
      if (targetSource.type === "gist")
        draft.gist!.priority = targetPriority - 1
      else
        draft.webDavConfigs[targetSource.rawIndex!].priority =
          targetPriority - 1
    })
  }

  /**
   * Toggle enabled state for the given source and persist the change.
   *
   * @param source - Source item to update
   * @param enabled - New enabled state
   */
  const onUpdateEnabled = (source: SourceItem, enabled: boolean) => {
    updateConfig((draft) => {
      if (source.type === "gist") draft.gist!.enabled = enabled
      else draft.webDavConfigs[source.rawIndex!].enabled = enabled
    })
  }

  return (
    <Card icon="sources" title={messages.ui.enabledSources()}>
      {/* Content */}
      {!hasSources ? (
        /* Empty state */
        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
          <p className="text-slate-400 text-sm font-mono">
            {messages.ui.noSources()}
          </p>
        </div>
      ) : (
        /* Not empty state */
        <div className="grid grid-cols-1 gap-2">
          {allSources
            .sort((a, b) => a.priority - b.priority)
            .map((source, i) => {
              const isTesting = testingMap[source.id]
              return (
                <SourceBoard
                  key={source.id}
                  source={source}
                  testGist={() => testGist(config)}
                  testWebDav={(index) => testWebDav(config, index)}
                  removeGist={removeGist}
                  removeWebDav={removeWebDav}
                  isTesting={isTesting}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                  index={i}
                  total={allSources.length}
                  onUpdateEnabled={(enabled) => {
                    onUpdateEnabled(source, enabled)
                  }}
                  onEdit={() =>
                    onOpenEditor({
                      mode: "edit",
                      type: source.type,
                      index: source.rawIndex
                    })
                  }
                />
              )
            })}
        </div>
      )}

      {/* Add new source area */}
      <div className="pt-2">
        <div className="flex items-center gap-3">
          <button
            className="px-3 py-2 text-[12px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
            onClick={() => {
              setShowAddChooser((v) => !v)
            }}>
            {messages.ui.addSource()}
          </button>

          {showAddChooser && (
            <div className="flex items-center gap-2">
              <button
                className={`px-2 py-1 text-[12px] rounded-md border font-mono ${hasGist ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-900 hover:text-white border-slate-200"}`}
                disabled={hasGist}
                onClick={() => {
                  onOpenEditor({ mode: "add", type: "gist" })
                  setShowAddChooser(false)
                }}>
                Gist
              </button>
              <button
                className="px-2 py-1 text-[12px] rounded-md border font-mono hover:bg-slate-900 hover:text-white border-slate-200"
                onClick={() => {
                  onOpenEditor({ mode: "add", type: "webdav" })
                  setShowAddChooser(false)
                }}>
                WebDAV
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default Sources
