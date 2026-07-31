import { useState } from "react"

import { type CountedBookMark } from "~types"

/**
 * Props for BookmarkItem component.
 */
interface BookmarkItemProps {
  /**
   * Bookmark or folder node data.
   */
  node: CountedBookMark
  /**
   * Depth level in the bookmark tree for indentation.
   */
  depth: number
}

/**
 * Recursive component to render a bookmark or folder item.
 *
 * @param props - Props containing the bookmark/folder node and its depth.
 *
 * @returns A JSX element representing the bookmark or folder item.
 */
function BookmarkItem({ node, depth }: BookmarkItemProps) {
  const isFolder = !!node.children
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <div
        className="flex items-center gap-2 p-1.5 hover:bg-white hover:shadow-sm rounded transition-all cursor-pointer group"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        title={isFolder ? undefined : node.url}
        onClick={() =>
          isFolder
            ? setIsOpen(!isOpen)
            : chrome.tabs.create({ url: node.url, active: true })
        }>
        {/* folder arrow or blank */}
        <div className="w-3 flex shrink-0 items-center justify-center">
          {isFolder ? (
            <span
              className={`text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`}>
              ▶
            </span>
          ) : null}
        </div>

        {/* icon (folder vs link) */}
        <span className="text-lg">{isFolder ? "📂" : "📄"}</span>

        {/* name */}
        <span className="text-sm text-slate-700 truncate">{node.title}</span>

        {/* bookmark count */}
        {isFolder && node.bookmarkCount !== undefined && (
          <span className="text-xs text-slate-400 ml-auto shrink-0">
            {node.bookmarkCount}
          </span>
        )}
      </div>

      {/* recursive child nodes */}
      {isFolder &&
        isOpen &&
        node.children.map((child: CountedBookMark, idx: number) => (
          <BookmarkItem key={idx} node={child} depth={depth + 1} />
        ))}
    </div>
  )
}

export default BookmarkItem
