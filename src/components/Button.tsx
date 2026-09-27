import React from "react"

/**
 * Props for the `Button` component.
 *
 * Describes the button label, click handler and optional UI state.
 */
interface ButtonProps {
  /**
   * Button text shown to the user.
   */
  label: string
  /**
   * Click handler. Can be synchronous or return a Promise for async actions.
   */
  onClick: () => void | Promise<void>
  /**
   * Whether the button shows a loading spinner and is disabled.
   *
   * @defaultValue false
   */
  loading?: boolean
  /**
   * Disable the button (non-interactive).
   *
   * @defaultValue false
   */
  disabled?: boolean
  /**
   * Additional class names to apply to the button element.
   */
  className?: string
}

/**
 * Simple styled button component with optional loading state.
 *
 * @param props - Button properties
 *
 * @returns A JSX button element
 */
const Button = ({
  label,
  onClick,
  loading = false,
  disabled = false,
  className = ""
}: ButtonProps) => {
  const baseStyles = `
    w-full py-2 bg-white text-slate-700
    border border-slate-200 rounded-lg
    transition-all flex items-center justify-center gap-2
    font-mono text-sm font-medium tracking-tight
  `
  const stateStyles =
    disabled || loading
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-slate-50 active:scale-95 cursor-pointer"

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${stateStyles} ${className}`}>
      {/* When loading is true, show a spinner */}
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-slate-500"
          viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span>{label}</span>
    </button>
  )
}

export default Button
