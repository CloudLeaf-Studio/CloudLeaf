import { useEffect, useState } from "react"
import { Toaster } from "sonner"

import { messages } from "~/src/i18n"
import { BookmarkItem } from "~src/components"
import { buildCountedTree } from "~src/core/bookmark"
import { downloadBookmarks } from "~src/core/sync"
import { type CountedBookMark } from "~src/types"

import "./index.css"

/**
 * Side panel component for cloud bookmark preview.
 *
 * @returns A JSX element rendering the side panel for cloud bookmark preview.
 */
function SidePanel() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CountedBookMark[] | null>(null)

  /**
   * Load cloud bookmarks and update state accordingly.
   */
  const handleLoadCloudBookmarks = async () => {
    setLoading(true)
    setError(null)
    const res = await downloadBookmarks()
    if (res.ok) {
      setData(buildCountedTree(res.data.payload.bookmarks))
    } else {
      setError(res.error || messages.error.unknownError())
    }
    setLoading(false)
  }

  useEffect(() => {
    handleLoadCloudBookmarks()
  }, [])

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
        <h1 className="font-bold text-slate-800">
          {messages.ui.cloudPreview()}
        </h1>
        <button
          onClick={handleLoadCloudBookmarks}
          className="p-1 hover:bg-slate-100 rounded-md transition-colors"
          title={messages.ui.refreshData()}>
          <svg
            className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center pt-20 text-slate-400">
            {messages.ui.readingCloud()}
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
        ) : (
          <div className="space-y-1">
            {/* Render bookmark tree */}
            {data?.map((node, index) => (
              <BookmarkItem key={index} node={node} depth={0} />
            ))}
          </div>
        )}
      </main>

      {/* Toaster for notifications */}
      <Toaster richColors position="top-center" />
    </div>
  )
}

export default SidePanel
