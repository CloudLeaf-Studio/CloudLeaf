import React from "react"

/**
 * Props for the `Input` component.
 *
 * Describes the label, value and change handler as well as optional UI flags.
 */
interface InputProps {
  /**
   * Visible label for the input field.
   */
  label: string
  /**
   * Controlled input value.
   */
  value: string
  /**
   * Callback invoked when the input value changes.
   *
   * @param val - New input value
   */
  onChange: (val: string) => void
  /**
   * Input `type` attribute.
   *
   * @defaultValue "text"
   */
  type?: "text" | "password"
  /**
   * Placeholder text shown when the input is empty.
   */
  placeholder?: string
  /**
   * Additional class names appended to the component container.
   */
  className?: string
}

/**
 * Simple labeled input with default styling.
 *
 * @param props - Input properties
 *
 * @returns A JSX element containing a labeled input
 */
const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = ""
}: InputProps) => {
  return (
    <div className={`group flex flex-col gap-1 ${className}`}>
      {/* Input label */}
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </label>

      {/* Input field */}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-mono text-sm placeholder:text-slate-300"
      />
    </div>
  )
}

export default Input
