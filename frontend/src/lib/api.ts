const BACKEND_PORT = 3001

function getApiBaseUrl(): string {
  const hostname = window.location.hostname
  // In GitHub Codespaces hostnames look like: <name>-<port>.app.github.dev
  if (hostname.endsWith(".app.github.dev")) {
    const backendHost = hostname.replace(/-\d+\.app\.github\.dev$/, `-${BACKEND_PORT}.app.github.dev`)
    return `https://${backendHost}`
  }
  return ""
}

export async function apiFetch(path: string): Promise<Response> {
  const base = getApiBaseUrl()
  const url = base ? `${base}${path}` : path.startsWith("/") ? path : `/${path}`
  return fetch(url)
}
