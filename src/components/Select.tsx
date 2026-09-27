import React from "react"

/**
 * Represents a single option in the select dropdown.
 */
interface Option {
  /**
   * Display text for the option
   */
  label: string
  /**
   * Value associated with the option
   */
  value: string
}

/**
 * Props for the `Select` component.
 *
 * Represents the label, current value, available options and change handler.
 */
interface SelectProps {
  /**
   * Label displayed above the select input
   */
  label: string
  /**
   * Currently selected value
   */
  value: string
  /**
   * Array of available options
   */
  options: Option[]
  /**
   * Callback invoked when the selected value changes.
   *
   * @param val - The new selected value
   */
  onChange: (val: string) => void
  /**
   * Additional class names appended to the component container
   */
  className?: string
}

/**
 * Dropdown select component with custom styling.
 *
 * @param props - Select component properties
 *
 * @returns A JSX element rendering a styled select dropdown
 */
const Select = ({
  label,
  value,
  options,
  onChange,
  className = ""
}: SelectProps) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Label */}
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </label>

      {/* Select input with custom dropdown arrow */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-mono text-sm cursor-pointer appearance-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
          backgroundSize: "1rem"
        }}>
        {/* Options */}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select
