import { useState } from "react"

import { messages } from "~i18n"
import { type SourceItem } from "~types"

import Switch from "./Switch"

/**
 * Props for the `SourceBoard` component.
 *
 * Describes the source item and various action callbacks used by the board.
 */
interface SourceBoardProps {
  /**
   * Source item data
   */
  source: SourceItem
  /**
   * Test Gist connectivity
   */
  testGist: () => Promise<void>
  /**
   * Test WebDAV connectivity by account index
   */
  testWebDav: (index: number) => Promise<void>
  /**
   * Remove gist configuration
   */
  removeGist: () => void
  /**
   * Remove webdav configuration by account index
   */
  removeWebDav: (index: number) => void
  /**
   * Whether a connectivity test is running
   */
  isTesting: boolean
  /**
   * Whether a save operation is in progress
   */
  saving: boolean
  /**
   * Move this source up in the list by decrease its priority
   */
  onMoveUp: (index: number) => void
  /**
   * Move this source down in the list by increase its priority
   */
  onMoveDown: (index: number) => void
  /**
   * Index of this source in the list
   */
  index: number
  /**
   * Total number of sources
   */
  total: number
  /**
   * Update enabled state for this source
   */
  onUpdateEnabled: (enabled: boolean) => void
  /**
   * Trigger edit of this source (opens settings panel below)
   */
  onEdit: () => void
}

/**
 * Card component showing a single sync source and related actions.
 *
 * @param props - Source board properties
 *
 * @returns A JSX element rendering the source board
 */
const SourceBoard = ({
  source,
  testGist,
  testWebDav,
  removeGist,
  removeWebDav,
  isTesting,
  saving,
  onMoveUp,
  onMoveDown,
  index,
  total,
  onUpdateEnabled,
  onEdit
}: SourceBoardProps) => {
  // Local state for expanded/collapsed panel
  const [isExpanded, setIsExpanded] = useState(false)
  const isGist = source.type === "gist"

  /**
   * Base classes for move up/down buttons.
   *
   * @readonly
   */
  const btnBase =
    "text-[10px] px-1.5 py-1 rounded cursor-pointer font-mono transition-all disabled:opacity-20 disabled:cursor-not-allowed"
  /**
   * Theme classes for move up/down buttons based on source type.
   *
   * @readonly
   */
  const moveBtnTheme = isGist
    ? "bg-white/10 hover:bg-white/30 text-white"
    : "bg-slate-200/50 hover:bg-slate-300 text-slate-600"
  /**
   * Theme classes for the entire source board based on source type.
   *
   * @readonly
   */
  const themes = {
    gist: "bg-slate-900 text-white shadow-lg shadow-slate-200",
    webdav: "bg-blue-50 border border-blue-100 text-blue-900"
  }
  /**
   * Theme classes for the source type badge based on source type.
   *
   * @readonly
   */
  const badgeThemes = {
    gist: "bg-white/20",
    webdav: "bg-blue-600 text-white"
  }

  return (
    <div
      className={`flex flex-col rounded-lg overflow-hidden group transition-all font-mono font-bold ${themes[source.type]}`}>
      {/* Top title bar */}
      <div className="flex items-center justify-between p-3 w-full gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Expand/collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 -ml-1 transition-transform duration-300 cursor-pointer ${isExpanded ? "rotate-180" : ""}`}>
            {/* Expand/collapse icon */}
            <svg
              className="w-4 h-4 opacity-40 hover:opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Source type badge */}
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold shrink-0 ${badgeThemes[source.type]}`}>
            {source.type}
          </span>

          {/* Source label only visible when collapsed */}
          {!isExpanded && (
            <span className="font-mono text-sm truncate opacity-80 animate-in fade-in slide-in-from-left-2 duration-300 max-w-50">
              {source.label}
            </span>
          )}
        </div>

        {/* Switch to toggle enabled state */}
        <Switch label="" enabled={source.enabled} onChange={onUpdateEnabled} />

        {/* Move up/down buttons */}
        <div className="flex items-center gap-3">
          <div className="flex bg-black/5 rounded p-0.5 gap-1">
            {/* Button to move source up by decreasing its priority */}
            <button
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className={`${btnBase} ${moveBtnTheme} px-2`}>
              ▲
            </button>

            {/* Button to move source down by increasing its priority */}
            <button
              onClick={() => onMoveDown(index)}
              disabled={index === total - 1}
              className={`${btnBase} ${moveBtnTheme} px-2`}>
              ▼
            </button>
          </div>

          {/* Status indicator dot */}
          <div
            className={`
            w-2.5 h-2.5 rounded-full
            ${isGist ? "bg-green-400 animate-pulse" : "bg-blue-400"}
            `}
          />
        </div>
      </div>

      {/* The expanded panel content */}
      <div
        className={`
          grid transition-all duration-300 ease-in-out
          ${
            isExpanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}>
        <div className="overflow-hidden">
          <div
            className={`p-4 border-t space-y-4 ${isGist ? "border-white/10 bg-white/5" : "border-blue-100 bg-blue-100/30"}`}>
            {/* File name display area */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] opacity-40 uppercase tracking-wider">
                Storage Location / File Name
              </span>
              <span className="text-sm break-all font-mono">
                {source.label}
              </span>
            </div>

            {/* Action buttons area */}
            <div className="flex gap-2 pt-2 border-t border-black/5">
              {/* Button to test connection */}
              <button
                onClick={() =>
                  isGist ? testGist() : testWebDav(source.rawIndex!)
                }
                disabled={isTesting}
                className={`flex-1 py-2 rounded-md text-[11px] transition-all cursor-pointer font-bold ${
                  isGist
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}>
                {isTesting
                  ? messages.ui.connecting()
                  : messages.ui.verifyConnection()}
              </button>

              {/* Button to edit source */}
              <button
                onClick={onEdit}
                className={`px-4 py-2 rounded-md text-[11px] transition-all cursor-pointer font-bold ${isGist ? "bg-white/10 hover:bg-white/20 text-white" : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"}`}>
                {messages.ui.edit()}
              </button>

              {/* Button to remove source */}
              <button
                onClick={() =>
                  isGist ? removeGist() : removeWebDav(source.rawIndex!)
                }
                disabled={saving}
                className={`
                    px-4 py-2 rounded-md text-[11px] transition-all cursor-pointer font-bold
                    ${
                      isGist
                        ? "bg-red-500/20 hover:bg-red-500 text-white"
                        : "text-red-500 hover:bg-red-50 hover:text-red-600"
                    }
                `}>
                {messages.ui.remove()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SourceBoard
