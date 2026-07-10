import Swal from "sweetalert2"

/**
 * Show a lightweight confirmation dialog.
 *
 * @param text - Message displayed in the dialog body.
 *
 * @returns Whether the user confirms the action.
 */
export async function confirm(text: string): Promise<boolean> {
  /**
   * Shared Tailwind class string for both confirm and cancel buttons.
   */
  const buttonStyle = `
        px-2 py-1 mx-2
        bg-white text-slate-700 border border-slate-200 rounded-lg 
        transition-all font-mono text-sm font-medium tracking-tight
        hover:bg-slate-50 active:scale-95
      `
  const { isConfirmed } = await Swal.fire({
    text,
    showCancelButton: true,
    width: "200px",
    // Apply Tailwind classes through SweetAlert customClass slots.
    customClass: {
      popup: "rounded-xl border border-zinc-200 shadow-lg p-2",
      htmlContainer: "!text-sm text-zinc-600 !m-1",
      confirmButton: buttonStyle,
      cancelButton: buttonStyle
    },
    buttonsStyling: false
  })

  return isConfirmed
}
