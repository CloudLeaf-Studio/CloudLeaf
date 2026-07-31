import { useRef, useState } from "react"

import { LocalProvider } from "~providers"
import type { SyncPayload } from "~types"

function LocalProviderTest() {
  const [log, setLog] = useState<string[]>([])
  const [payload, setPayload] = useState<SyncPayload | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addLog = (msg: string) => {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const testIsValid = async () => {
    const local = new LocalProvider()
    const result = await local.isValid()
    addLog(`isValid: ${JSON.stringify(result)}`)
  }

  const testDownload = async () => {
    const local = new LocalProvider()
    const result = await local.download()
    addLog(
      `download: ok=${result.ok}, error=${result.ok === true ? "none" : result.error || "none"}`
    )
    if (result.ok === true && result.data) {
      setPayload(result.data)
      addLog(
        `  bookmarks: ${result.data.numBookmarks}, updatedAt: ${new Date(result.data.updatedAt).toLocaleString()}`
      )
    }
  }

  const testUpload = async () => {
    if (!payload) {
      addLog(
        "Error: No payload to upload. Run download first or import from file."
      )
      return
    }
    const local = new LocalProvider()
    const result = await local.upload(payload)
    addLog(
      `upload: ok=${result.ok}, error=${result.ok === true ? "none" : result.error || "none"}`
    )
  }

  // --- Download to device (export as JSON file) ---
  const downloadToDevice = async () => {
    const local = new LocalProvider()
    const result = await local.download()
    if (result.ok === false) {
      addLog(`Export failed: ${result.error || "unknown error"}`)
      return
    }
    if (!result.data) {
      addLog("Export failed: missing bookmark payload")
      return
    }

    const json = JSON.stringify(result.data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `CloudLeaf_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)

    addLog(`Exported ${result.data.numBookmarks} bookmarks to file`)
  }

  // --- Upload from device (import from JSON file) ---
  const uploadFromDevice = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text) as SyncPayload

      // Validate structure
      if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
        addLog("Error: Invalid file format - missing bookmarks array")
        return
      }

      setPayload(data)
      addLog(`Imported file: ${file.name}`)
      addLog(
        `  bookmarks: ${data.numBookmarks}, updatedAt: ${new Date(data.updatedAt).toLocaleString()}`
      )

      // Ask for confirmation before upload
      if (
        confirm(
          `Import ${data.numBookmarks} bookmarks to browser? This will replace all current bookmarks.`
        )
      ) {
        const local = new LocalProvider()
        const result = await local.upload(data)
        addLog(
          `Upload to browser: ok=${result.ok}, error=${result.ok === true ? "none" : result.error || "none"}`
        )
      }
    } catch (error) {
      addLog(
        `Error parsing file: ${error instanceof Error ? error.message : "unknown"}`
      )
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const clearLog = () => setLog([])

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "system-ui",
        maxWidth: 800,
        margin: "0 auto"
      }}>
      <h1>LocalProvider Test</h1>

      <section style={{ marginBottom: 20 }}>
        <h3>API Tests</h3>
        <button onClick={testIsValid} style={btnStyle}>
          Test isValid
        </button>
        <button onClick={testDownload} style={btnStyle}>
          Test Download
        </button>
        <button onClick={testUpload} style={btnStyle}>
          Test Upload
        </button>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h3>Device Import/Export</h3>
        <button
          onClick={downloadToDevice}
          style={{ ...btnStyle, background: "#107c10" }}>
          📥 Export to File
        </button>
        <button
          onClick={uploadFromDevice}
          style={{ ...btnStyle, background: "#d83b01" }}>
          📤 Import from File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
      </section>

      <button onClick={clearLog} style={{ ...btnStyle, background: "#666" }}>
        Clear Log
      </button>

      <div
        style={{
          background: "#1e1e1e",
          color: "#0f0",
          padding: 15,
          borderRadius: 8,
          minHeight: 200,
          fontFamily: "monospace",
          fontSize: 13,
          marginTop: 20
        }}>
        {log.length === 0 ? (
          <span style={{ color: "#666" }}>Click a button to test...</span>
        ) : null}
        {log.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {payload && (
        <details style={{ marginTop: 20 }}>
          <summary style={{ cursor: "pointer" }}>
            Payload Preview ({payload.numBookmarks} bookmarks)
          </summary>
          <pre
            style={{
              background: "#f5f5f5",
              padding: 10,
              borderRadius: 4,
              overflow: "auto",
              maxHeight: 300,
              fontSize: 12
            }}>
            {JSON.stringify(payload, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: "10px 20px",
  marginRight: 10,
  marginBottom: 10,
  background: "#0078d4",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 14
}

export default LocalProviderTest
