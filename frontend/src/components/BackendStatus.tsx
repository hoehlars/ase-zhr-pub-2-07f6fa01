import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

export default function BackendStatus() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setError("Backend nicht erreichbar"))
  }, [])

  return (
    <div className="rounded-md border px-4 py-3 text-sm">
      <span className="font-medium">Backend: </span>
      {message && <span className="text-green-600">{message}</span>}
      {error && <span className="text-red-500">{error}</span>}
      {!message && !error && <span className="text-muted-foreground">Verbinde…</span>}
    </div>
  )
}
