import React from "react"

/**
 * Props for the `Switch` component.
 *
 * Represents the visible label, current enabled state and change handler.
 */
interface SwitchProps {
  /**
   * Visible label next to the switch.
   */
  label: string
  /**
   * Current on/off state of the switch.
   */
  enabled: boolean
  /**
   * Called when the switch is toggled with the new boolean value.
   *
   * @param val - New enabled state
   */
  onChange: (val: boolean) => void
}

/**
 * Small toggle switch component.
 *
 * @param props - Switch properties
 *
 * @returns A JSX element rendering a clickable switch
 */
const Switch = ({ label, enabled, onChange }: SwitchProps) => {
  return (
    <div
      className="flex items-center justify-between group cursor-pointer"
      onClick={() => {
        onChange(!enabled)
      }}>
      {/* Switch label */}
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
        {label}
      </span>

      {/* Switch body */}
      <div
        className={`
        relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
        ${enabled ? "bg-emerald-500" : "bg-slate-200"}
      `}>
        {/* Switch knob */}
        <div
          className={`
          absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ease-in-out
          ${enabled ? "translate-x-5" : "translate-x-0"}
        `}
        />
      </div>
    </div>
  )
}

export default Switch
