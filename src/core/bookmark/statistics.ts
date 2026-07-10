import { type BookMark, type CountedBookMark } from "~src/types"

/**
 * Count leaf bookmarks in a tree using iterative stack traversal.
 *
 * @param nodes - Bookmark tree nodes
 *
 * @returns Total number of leaf bookmarks
 */
export function countBookmarks(nodes: BookMark[]): number {
  if (!nodes || nodes.length === 0) return 0

  let count = 0
  const stack: BookMark[] = [...nodes]

  while (stack.length > 0) {
    const node = stack.pop()!
    // folder node
    if (node.children && node.children.length > 0) {
      stack.push(...node.children)
      // leaf bookmark node
    } else if (node.title && node.url) {
      count++
    }
  }

  return count
}

/**
 * Build a counted node from a single bookmark node.
 *
 * @param node - Bookmark node to process
 *
 * @returns Counted node with its subtree bookmark count
 */
function buildCountedNode(node: BookMark): {
  item: CountedBookMark
  count: number
} {
  // folder node
  if (node.children) {
    const items: CountedBookMark[] = []
    let count = 0
    for (const child of node.children) {
      const result = buildCountedNode(child)
      items.push(result.item)
      count += result.count
    }
    return {
      item: { ...node, bookmarkCount: count, children: items },
      count
    }
  }

  // leaf bookmark node
  if (node.title && node.url) {
    return { item: { ...node }, count: 1 }
  }

  // empty folder node
  if (node.title) {
    return { item: { ...node, bookmarkCount: 0 }, count: 0 }
  }

  // invalid node
  return null
}

/**
 * Build a counted tree where each folder carries its recursive leaf count.
 *
 * @param nodes - Bookmark tree nodes
 *
 * @returns New tree with `bookmarkCount`
 */
export function buildCountedTree(nodes: BookMark[]): CountedBookMark[] {
  if (!nodes || nodes.length === 0) return []

  return nodes
    .map((node) => buildCountedNode(node).item)
    .filter((node): node is CountedBookMark => node !== null)
}
