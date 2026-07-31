import type { ReactNode } from "react"

import { messages } from "~i18n"

/**
 * Available icon identifiers for the card header.
 */
type CardIcon = "sources" | "github" | "webdav" | "vendor"

/**
 * Props for the `Card` component.
 */
interface CardProps {
  /**
   * Icon identifier displayed in the card header
   */
  icon?: CardIcon
  /**
   * Title text rendered in the card header
   */
  title?: string
  /**
   * Callback invoked when the cancel button is clicked
   */
  onCancel?: () => void
  /**
   * Callback invoked when the reset button is clicked
   */
  onReset?: () => void
  /**
   * Content rendered inside the card body
   */
  children: ReactNode
}

/**
 * GitHub icon badge for card header.
 */
const GithubIcon = () => {
  return (
    <div className="size-8 bg-slate-900 rounded-lg flex items-center justify-center">
      <svg
        className="size-5 text-white"
        fill="currentColor"
        viewBox="0 0 24 24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    </div>
  )
}

/**
 * WebDAV cloud icon badge for card header.
 */
const CloudIcon = () => {
  return (
    <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center">
      <svg
        className="size-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    </div>
  )
}

/**
 * Custom vendor icon badge for card header.
 */
const VendorIcon = () => {
  return (
    <div className="size-8 bg-emerald-600 rounded-lg flex items-center justify-center">
      <svg
        className="size-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    </div>
  )
}

/**
 * Database icon badge for sources card header.
 */
const DatabaseIcon = () => {
  return (
    <div className="size-8 bg-slate-100 rounded-lg flex items-center justify-center">
      <svg
        className="size-5 text-slate-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    </div>
  )
}

/**
 * Mapping from icon identifier to SVG component.
 *
 * @readonly
 */
const iconMap = {
  sources: DatabaseIcon,
  github: GithubIcon,
  webdav: CloudIcon,
  vendor: VendorIcon
} as const

/**
 * Reusable card wrapper with optional icon, title, cancel and reset actions.
 *
 * @param props - Card properties
 *
 * @returns A JSX element rendering the card container
 */
const Card = ({ icon, title, onCancel, onReset, children }: CardProps) => {
  const Icon = icon ? iconMap[icon] : null

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {/* Card Header */}
      {Icon && title && (
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          {/* Icon and Title */}
          <div className="flex items-center gap-3">
            <Icon />
            <h3 className="font-mono text-lg font-bold text-slate-800">
              {title}
            </h3>
          </div>

          {/* Action Buttons */}
          {(onCancel || onReset) && (
            <div className="flex items-center gap-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  {messages.ui.cancel()}
                </button>
              )}
              {onReset && (
                <button
                  onClick={onReset}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors">
                  {messages.ui.resetConfig()}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Card Body */}
      {children}
    </section>
  )
}

export default Card
